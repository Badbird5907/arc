import { isValidUuid } from "@/lib/utils";
import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { coupons, couponType } from "@/server/db/coupons";
import { discountType } from "@/server/db/schema";
import { modifyCouponForm } from "@/trpc/schema/coupons";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, gt, isNull, lt, or, sql } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { AnyColumn, SQLWrapper } from "drizzle-orm";
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
        active: z.boolean().optional(),
      }).default({ search: "", active: true }),
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
      const whereActive = filter.active ? (
        and(
          eq(coupons.enabled, filter.active),
          or(
            isNull(coupons.expiresAt),
            lt(coupons.expiresAt, new Date()),
            gt(coupons.startsAt, new Date())
          )
        )
      ) : undefined;
      const whereConditions = and(whereType, whereSearch, whereActive);
      const [data, rowCount] = await Promise.all([
        ctx.db.select(getTableColumns(coupons))
          .from(coupons)
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
      return {
        data,
        rowCount: rowCount[0]?.count ?? 0,
      }
    }),
  createCoupon: procedure("coupons:write")
    .input(modifyCouponForm)
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
      const coupon = await ctx.db.query.coupons.findFirst({
        where: (t, { eq }) => eq(t.id, input.id),
      });
      console.log(coupon);
      return { coupon };
    }),
  deleteCoupon: procedure("coupons:delete")
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
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
});