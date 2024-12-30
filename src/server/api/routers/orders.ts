import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { coupons, orders, orderStatus, orderToCoupon, queuedCommands } from "@/server/db/schema";
import { ordersFilter } from "@/trpc/schema/orders";
import { deliveryWhen } from "@/types";
import { getPlayerFromUuid } from "@/utils/server/helpers";
import { queueCommandsWhere } from "@/utils/server/orders";
import { AnyColumn, asc, desc, and, eq, getTableColumns, sql, SQLWrapper, or } from "drizzle-orm";
import { z } from "zod";

export const ordersRouter = createTRPCRouter({
  getOrders: procedure("orders:read")
    .input(z.object({
      limit: z.number().optional().default(25),
      page: z.number().optional().default(1),
      order: z.enum(["asc", "desc"]).default("asc").optional(),
      sort: z.enum(["created", "price", "products"]).default("created").optional(),
      withPlayers: z.boolean().optional().default(false),
      filter: ordersFilter.default({}),
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

      const orderBy = (t: { createdAt: SQLWrapper, subtotal: SQLWrapper, items: SQLWrapper}) => {
        switch (input.sort) {
          case "created":
            return orderStuff(t.createdAt)
          case "price":
            return orderStuff(t.subtotal)
          case "products":
            return orderStuff(sql`array_length(${t.items}, 1)`) 
        }
        return orderStuff(t.createdAt)
      }
      const getWhereConditions = async (filter: {
        playerUuid?: string;
        email?: string;
        name?: string;
        status?: typeof orderStatus[number] | "all";
        coupons?: string[];
      }) => {
        const conditions: SQLWrapper[] = [];
      
        if (filter.playerUuid) {
          conditions.push(eq(orders.playerUuid, filter.playerUuid));
        }

        if (filter.email) {
          conditions.push(
            sql`to_tsvector('english', ${orders.email}) @@ 
                plainto_tsquery('english', ${filter.email})`
          );
        }
      
        if (filter.name) {
          conditions.push(
            sql`(
              setweight(to_tsvector('english', ${orders.firstName}), 'A') ||
              setweight(to_tsvector('english', ${orders.lastName}), 'A')
            ) @@ plainto_tsquery('english', ${filter.name})`
          );
        }
      
        if (filter.status && filter.status !== "all") {
          conditions.push(eq(orders.status, filter.status as typeof orderStatus[number]));
        }

        if (filter.coupons && filter.coupons.length > 0) {
          conditions.push(
            sql`EXISTS (
              SELECT 1 FROM ${orderToCoupon}
              JOIN ${coupons} ON ${orderToCoupon.couponId} = ${coupons.id}
              WHERE ${orderToCoupon.orderId} = ${orders.id}
              AND ${coupons.code} IN (${sql.placeholder('couponCodes')})
            )`
          )
        }
      
        return conditions.length > 0
          ? and(...conditions)
          : undefined;
      };
      
      const whereConditions = await getWhereConditions(filter);
      const queryParams = filter.coupons?.length ? { couponCodes: filter.coupons } : {};
      const [query, rowCount] = await Promise.all([
        ctx.db.select(getTableColumns(orders))
          .from(orders)
          .limit(limit)
          .orderBy(orderBy)
          .offset(offset)
          .where(whereConditions)
          .execute(queryParams),
        ctx.db.select({ 
          count: sql<string>`count(*)` // this returns a string
        })
        .from(orders)
        .where(whereConditions)
        .execute(queryParams),
      ]);

      const rowCountNumber = parseInt(rowCount[0]?.count ?? "0");

      if (input.withPlayers) {
        const uuidSet = new Set(query.map(order => order.playerUuid));
        const uuidArray = Array.from(uuidSet);
        const players = await Promise.all(
          uuidArray.map((uuid) => getPlayerFromUuid(uuid))
        ).then((arr) => arr.filter((player) => !player.notFound && player.data));
        const playerMap = new Map(players.map(player => [player.data?.uuid, player.data]));
        return {
          data: query.map(order => ({
            ...order,
            player: playerMap.get(order.playerUuid)
          })),
          rowCount: rowCountNumber,
          playerMap,
        }
      }

      return {
        data: query,
        rowCount: rowCountNumber,
      };
    }),
  getOrder: procedure("orders:read")
    .input(z.object({
      id: z.string(),
      withPlayer: z.boolean().optional().default(false),
      withCoupons: z.boolean().optional().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const [order, orderCoupons] = await Promise.all([
        ctx.db.select().from(orders).where(eq(orders.id, input.id)),
        input.withCoupons 
          ? ctx.db.select({
              id: coupons.id,
              code: coupons.code,
              type: coupons.type,
              discountType: coupons.discountType,
              discountValue: coupons.discountValue,
            })
            .from(orderToCoupon)
            .innerJoin(coupons, eq(orderToCoupon.couponId, coupons.id))
            .where(eq(orderToCoupon.orderId, input.id))
          : Promise.resolve([]),
      ]);
      
      if (!order.length) {
        return null;
      }

      const result = {
        ...order[0]!,
        ...(input.withCoupons && { coupons: orderCoupons }),
      };

      if (input.withPlayer) {
        const player = await getPlayerFromUuid(order[0]?.playerUuid ?? "");
        if (!player.notFound) {
          return {
            ...result,
            player: player.data,
          }
        }
      }
      return result;
    }),
  updateNotes: procedure("orders:update")
    .input(z.object({
      id: z.string(),
      notes: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.update(orders).set({
        metadata: {
          notes: input.notes,
        },
      }).where(eq(orders.id, input.id));
    }),
  getQueuedCommands: procedure("orders:read")
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const commands = await ctx.db.select().from(queuedCommands).where(eq(queuedCommands.orderId, input.id));
      return commands;
    }),
  clearQueue: procedure("orders:command:delete") // TODO: update rbac permissions
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(queuedCommands).where(and(eq(queuedCommands.orderId, input.id), eq(queuedCommands.executed, false)));
    }),
  deleteCommandFromQueue: procedure("orders:command:delete") // TODO: update rbac permissions
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.delete(queuedCommands).where(and(eq(queuedCommands.id, input.id), eq(queuedCommands.executed, false)));
    }),
  requeueCommands: procedure("orders:command:requeue") // TODO: update rbac permissions
    .input(z.object({
      id: z.string(),
      type: z.enum(deliveryWhen),
    }))
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, input.id),
      })
      if (!order) {
        return;
      }
      const productIds = order.items.map((item) => item.productId);
      const products = await ctx.db.query.products.findMany({
        where: (p, { inArray }) => inArray(p.id, productIds),
      });
      // delete the current queue
      await ctx.db.delete(queuedCommands).where(and(eq(queuedCommands.orderId, input.id), eq(queuedCommands.executed, false)));
      if (input.type === "purchase" && products.some((product) => product.type === "subscription")) {
        // if it is a purchase, and there are subscriptions, queue a renew action too
        await queueCommandsWhere("renew", order);
      }
      await queueCommandsWhere(input.type, order);
    }),
})
