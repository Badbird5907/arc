import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { type Order } from "@/types";
import { eq } from "drizzle-orm";

export const completeOrder = async (order: Order) => {
  await db.update(orders).set({
    status: "completed"
  }).where(eq(orders.id, order.id));
  // TODO: emails, webhooks, trigger on game server
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

