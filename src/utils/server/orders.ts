import { db } from "@/server/db";
import { orders, queuedCommands } from "@/server/db/schema";
import { type Product, type QueuedCommand, type Order } from "@/types";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const completeOrder = async (order: Order) => {
  await db.update(orders).set({
    status: "completed"
  }).where(eq(orders.id, order.id));
  // TODO: emails, webhooks, trigger on game server
  
  const productIds = order.items.map((item) => item.productId);
  const products = await db.query.products.findMany({
    where: (p, { inArray }) => inArray(p.id, productIds)
  });
  const queuedCommandsArr: QueuedCommand[] = [];
  products.forEach((product: Product) => {
    order.items.forEach((item) => {
      if (item.productId === product.id) {
        product.delivery?.forEach((delivery) => {
          queuedCommandsArr.push({
            id: uuidv4(),
            createdAt: new Date(),
            orderId: order.id,
            minecraftUuid: order.playerUuid,
            requireOnline: delivery.requireOnline,
            delay: delivery.delay,
            payload: delivery.value
          })
        })
      }
    })
  })
  await db.insert(queuedCommands).values(queuedCommandsArr);
}

export const declineOrder = async (order: Order, reason: string) => {
  await db.update(orders).set({
    status: "canceled",
    metadata: {
      ...order.metadata,
      tebex: {
        ...order.metadata.tebex ?? {},
        declineReason: reason
      }
    }
  }).where(eq(orders.id, order.id));
}

export const disputeUpdate = async (order: Order, state: "open" | "won" | "lost" | "closed") => {
  await db.update(orders).set({
    disputed: true,
    disputeState: state
  }).where(eq(orders.id, order.id));
  // TODO: webhook, ban player
}

