import { isValidUuid } from "@badbird5907/mc-utils";
import { createTRPCRouter, procedure, publicProcedure } from "@/server/api/trpc";
import { coupons, couponToCategory, couponToProduct, couponType, orderToCoupon } from "@/server/db/coupons";
import { createCouponForm, modifyCouponForm } from "@/trpc/schema/coupons";
import { checkCoupons, lookupProducts } from "@/utils/server/checkout";
import { getCouponsWithUses } from "@/utils/server/coupons";
import { and, desc, eq, getTableColumns, gt, isNull, lt, or, sql, not, inArray } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { type AnyColumn, type SQLWrapper } from "drizzle-orm";
import { z } from "zod";

export const couponsRouter = createTRPCRouter({
  getCoupons: procedure("coupons:read")
    .input(z.object({
      limit: z.number().optional().default(25),
      page: z.number().optional().default(1),
      order: z.enum(["asc", "desc"]).default("asc").optional(),
      sort: z.enum(["created"]).default("created").optional(),
      filter: z.object({
        search: z.string().optional(),
        type: z.enum(couponType).or(z.literal("all")).optional(),
        active: z.enum(["true", "false", "all"]).optional(),
      }).default({ search: "", active: "all" }),
    }))
    .query(async ({ input, ctx }) => {
      const { limit, page, order, filter } = input;
      const offset = (page - 1) * limit;

      const orderStuff = (inQuery: AnyColumn | SQLWrapper) => {
        if (order === "asc") {
          return asc(inQuery)
        } else {
          return desc(inQuery)
        }
      }
      const orderBy = (t: { createdAt: SQLWrapper }) => {
        return orderStuff(t.createdAt)
      }
      const whereType = (filter.type && filter.type !== "all") ? eq(coupons.type, filter.type) : undefined;
      const whereSearch = filter.search ? (
        sql`(setweight(to_tsvector('english', ${coupons.code}), 'A') ||
          setweight(to_tsvector('english', ${coupons.notes}), 'B'))
          @@ to_tsquery('english', ${filter.search})`
      ) : undefined;
      const whereActive = filter.active === "all" ? undefined : (
        filter.active === "true" ? 
        and(
          eq(coupons.enabled, true),
          or(
            isNull(coupons.expiresAt),
            gt(coupons.expiresAt, new Date())
          ),
          or(
            isNull(coupons.startsAt),
            lt(coupons.startsAt, new Date())
          ),
          or(
            eq(coupons.maxUses, -1),
            sql`(SELECT COUNT(*) FROM ${orderToCoupon} WHERE ${orderToCoupon.couponId} = ${coupons.id}) < ${coupons.maxUses}::int`
          )
        ) :
        // inactive if any of these conditions are true
        or(
          eq(coupons.enabled, false),
          and(
            not(isNull(coupons.expiresAt)),
            lt(coupons.expiresAt, new Date())
          ),
          and(
            not(isNull(coupons.startsAt)),
            gt(coupons.startsAt, new Date())
          ),
          and(
            not(eq(coupons.maxUses, -1)),
            sql`(SELECT COUNT(*) FROM ${orderToCoupon} WHERE ${orderToCoupon.couponId} = ${coupons.id}) >= ${coupons.maxUses}::int`
          )
        )
      );
      const whereConditions = and(whereType, whereSearch, whereActive);
      const [data, rowCount] = await Promise.all([
        ctx.db.select({
          ...getTableColumns(coupons),
          uses: sql<number>`(SELECT COUNT(*) FROM ${orderToCoupon} WHERE ${orderToCoupon.couponId} = ${coupons.id})`,
        })
          .from(coupons)
          .leftJoin(orderToCoupon, eq(orderToCoupon.couponId, coupons.id))
          .groupBy(coupons.id)
          .limit(limit)
          .orderBy(orderBy)
          .offset(offset)
          .where(whereConditions),
        ctx.db.select({ 
          count: sql<number>`count(*)`
        })
        .from(coupons)
        .where(whereConditions)
      ]);
      console.log(data);
      return {
        data,
        rowCount: rowCount[0]?.count ?? 0,
      }
    }),
  createCoupon: procedure("coupons:write")
    .input(createCouponForm)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.insert(coupons).values(input);
    }),
  getCoupon: procedure("coupons:read")
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      if (!isValidUuid(input.id)) {
        return null;
      }
      const coupon = await ctx.db.select({
        ...getTableColumns(coupons),
        uses: sql<number>`COALESCE((SELECT COUNT(*) FROM ${orderToCoupon} WHERE ${orderToCoupon.couponId} = ${coupons.id})::int, 0)`,
      })
      .from(coupons)
      .where(eq(coupons.id, input.id))
      .then(result => result[0]);
      return { coupon };
    }),
  deleteCoupon: procedure("coupons:delete")
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(orderToCoupon).where(eq(orderToCoupon.couponId, input.id));
      return await ctx.db.delete(coupons).where(eq(coupons.id, input.id));
    }),
  updateNotes: procedure("coupons:write")
    .input(z.object({
      id: z.string(),
      notes: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.update(coupons).set({ notes: input.notes }).where(eq(coupons.id, input.id));
    }),
  modifyCoupon: procedure("coupons:write")
    .input(z.object({
      id: z.string(),
      form: modifyCouponForm,
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.update(coupons).set(input.form).where(eq(coupons.id, input.id));
    }),
  
  checkCoupons: publicProcedure.input(z.object({
    cart: z.array(z.object({
      id: z.string(),
      quantity: z.number()
    })),
    coupons: z.array(z.string()),
    playerUuid: z.string().uuid()
  }))
  .meta({ rateLimit: "checkCoupon" })
  .query(async ({ input }) => {
    const { cart, coupons: couponCodes } = input;
    const otherCoupons = await getCouponsWithUses(inArray(coupons.code, couponCodes));
    // check for missing coupons
    const missingCoupons = couponCodes.filter(code => !otherCoupons.some(c => c.code === code));
    if (missingCoupons.length > 0) {
      return {
        error: `The following coupons are not valid: ${missingCoupons.join(", ")}`,
        invalidCoupons: missingCoupons,
        success: false,
      }
    }
    const products = await lookupProducts(cart);
    const result = await checkCoupons(otherCoupons, products);
    return result;
  }),
  getProductAndCategoryFilters: procedure("coupons:read")
    .input(z.object({
      couponId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const [productFilters, categoryFilters] = await Promise.all([
        ctx.db.select().from(couponToProduct).where(eq(couponToProduct.couponId, input.couponId)),
        ctx.db.select().from(couponToCategory).where(eq(couponToCategory.couponId, input.couponId)),
      ]);
      return {
        productFilters,
        categoryFilters,
      }
    }),
  updateProductFilters: procedure("coupons:write")
    .input(z.object({
      couponId: z.string(),
      productIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      // delete all existing product filters
      await ctx.db.delete(couponToProduct).where(eq(couponToProduct.couponId, input.couponId));
      // insert new product filters
      return await ctx.db.insert(couponToProduct).values(input.productIds.map(id => ({ couponId: input.couponId, productId: id })));
    }),
  updateCategoryFilters: procedure("coupons:write")
    .input(z.object({
      couponId: z.string(),
      categoryIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      // delete all existing category filters
      await ctx.db.delete(couponToCategory).where(eq(couponToCategory.couponId, input.couponId));
      // insert new category filters
      return await ctx.db.insert(couponToCategory).values(
        input.categoryIds.map(id => ({ 
          couponId: input.couponId, 
          categoryId: id 
        }))
      );
    }),
});