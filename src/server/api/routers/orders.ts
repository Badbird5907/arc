import { PlayerInfo } from "@/components/cart";
import { createTRPCRouter, procedure } from "@/server/api/trpc";
import { orders, orderStatus, queuedCommands } from "@/server/db/schema";
import { deliveryWhen, OrderWithPlayer } from "@/types";
import { getPlayerFromUuid } from "@/utils/server/helpers";
import { queueCommandsWhere } from "@/utils/server/orders";
import { AnyColumn, asc, desc, and, eq, getTableColumns, sql, SQLWrapper } from "drizzle-orm";
import { z } from "zod";

export const ordersRouter = createTRPCRouter({
  getOrders: procedure("orders:read")
    .input(z.object({
      limit: z.number().optional().default(25),
      page: z.number().optional().default(1),
      order: z.enum(["asc", "desc"]).default("asc").optional(),
      sort: z.enum(["created", "price", "products"]).default("created").optional(),
      withPlayers: z.boolean().optional().default(false),
      filter: z.object({
        search: z.string().optional(),
        status: z.enum(orderStatus).optional(),
      }).default({ search: "" }),
    }))
    .query(async ({ input, ctx }) => {
      const { limit, page, order, filter } = input;
      const { search, status } = filter;
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
      const whereStatus = status ? eq(orders.status, status) : undefined;
      const whereSearch = search ? sql`to_tsvector('english', ${orders.items}) @@ to_tsquery('english', ${search})` : undefined;
      const whereConditions = and(whereStatus, whereSearch);
      const [query, rowCount] = await Promise.all([
        ctx.db.select(getTableColumns(orders))
          .from(orders)
          .limit(limit)
          .orderBy(orderBy)
          .offset(offset)
          .where(whereConditions),
        ctx.db.select({ 
          count: sql<number>`count(*)`
        })
        .from(orders)
        .where(whereConditions)
      ]);

      if (input.withPlayers) {
        const uuidSet = new Set(query.map(order => order.playerUuid));
        const uuidArray = Array.from(uuidSet);
        const players = await Promise.all(
          uuidArray.map((uuid) => getPlayerFromUuid(uuid))
        ).then((arr) => arr.filter((player): player is { data: PlayerInfo } => !("notFound" in player)));
        const playerMap = new Map(players.map(player => [player.data.uuid, player.data]));
        return {
          data: query.map(order => ({
            ...order,
            player: playerMap.get(order.playerUuid)
          })),
          rowCount: rowCount[0]?.count ?? 0,
          playerMap,
        }
      }

      return {
        data: query,
        rowCount: rowCount[0]?.count ?? 0,
      };
    }),
  getOrder: procedure("orders:read")
    .input(z.object({
      id: z.string(),
      withPlayer: z.boolean().optional().default(false),
    }))
    .query(async ({ input, ctx }) => {
      const order = await ctx.db.select().from(orders).where(eq(orders.id, input.id));
      if (!order.length) {
        return null;
      }
      if (input.withPlayer) {
        const player = await getPlayerFromUuid(order[0]?.playerUuid ?? "");
        if (!("notFound" in player)) {
          return {
            ...order[0]!,
            player: player.data,
          }
        }
      }
      return order[0];
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