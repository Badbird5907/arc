import { env } from "@/env";
import { db } from "@/server/db";
import { orders, queuedCommands } from "@/server/db/schema";
import { type QueuedCommand, type Order, deliveryWhen } from "@/types";
import { variables } from "@/utils/helpers/delivery-variables";
import { embedColors, sendOrderWebhook } from "@/utils/helpers/discord";
import { Embed } from "@vermaysha/discord-webhook";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const resolveProducts = async (order: Order) => {
  const productIds = order.items.map((item) => item.productId);
  const products = await db.query.products.findMany({
    where: (p, { inArray }) => inArray(p.id, productIds),
    with: {
      productToDelivery: true
    }
  });
  return products;
}

export const queueCommandsWhere = async (when: (typeof deliveryWhen)[number], order: Order) => {
  const products = await resolveProducts(order);
  const queuedCommandsArr: QueuedCommand[] = [];
  
  await Promise.all(products.map(async (product) => {
    await Promise.all(order.items.map(async (item) => {
      if (item.productId === product.id) {
        const deliveryIds = product.productToDelivery.map((d) => d.deliveryId).filter((id): id is string => id !== null);
        
        const deliveries = await db.query.deliveries.findMany({
          where: (d, { inArray, or, and, eq, isNotNull }) => {
            return and(
              or(inArray(d.id, deliveryIds), eq(d.global, true)), // either from a product, or it is global
              and(eq(d.when, when), isNotNull(d.scope)) // correct when and scope
            )
          },
        });
        await Promise.all(deliveries.map(async (delivery) => {
          // find a list of variables in the payload
          const vars = delivery.value.match(/\{([^}]+)\}/g);
          let payload = delivery.value;
          
          if (vars) {
            // Replace each variable one at a time
            for (const v of vars) {
              const varName = v.replace(/[{}]/g, "");
              const variable = variables.find((var_) => var_.name === varName);
              if (variable) {
                const value = await variable.replace(varName, order, product);
                payload = payload.replace(`{${varName}}`, String(value));
              }
            }
          }

          queuedCommandsArr.push({
            id: uuidv4(),
            createdAt: new Date(),
            orderId: order.id,
            minecraftUuid: order.playerUuid,
            requireOnline: delivery.requireOnline,
            delay: Number(delivery.delay),
            payload,
            server: delivery.scope!,
            executed: false
          });
        }));
      }
    }));
  }));
  
  if (queuedCommandsArr.length > 0) {
    console.log("Inserting:", queuedCommandsArr)
    await db.insert(queuedCommands).values(queuedCommandsArr);
  }
  
  return queuedCommandsArr;
};

export const completeOrder = async (order: Order) => {
  await Promise.all([
    db.update(orders).set({
      status: "completed"
    }).where(eq(orders.id, order.id)),
    queueCommandsWhere("purchase", order),
    sendOrderWebhook(
      new Embed()
        .setTitle("Order Completed")
        .setDescription(`Order for ${order.playerUuid} has been completed.`)
        .setUrl(`${env.BASE_URL}/admin/orders/${order.id}`)
        .setColor(embedColors.green)
        .setTimestamp()
        .addField({
          name: "Order ID",
          value: order.id
        })
        .addField({
          name: "Player UUID",
          value: order.playerUuid
        })
        .addField({
          name: "Order Status",
          value: "Completed"
        })
    )
  ]);
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
  if (state === "open") { // fire on chargeback
    await queueCommandsWhere("chargeback", order);
  }
  await sendOrderWebhook(
    new Embed()
      .setTitle("Dispute Update")
      .setDescription(`Dispute for ${order.playerUuid} has been updated.`)
      .setUrl(`${env.BASE_URL}/admin/orders/${order.id}`)
      .setColor(embedColors.yellow)
      .setTimestamp()
      .addField({
        name: "Order ID",
        value: order.id
      })
      .addField({
        name: "Player UUID",
        value: order.playerUuid
      })
      .addField({
        name: "Dispute State",
        value: state
      })
  )
}
  
export const refundOrder = async (order: Order) => {
  await Promise.all([
    db.update(orders).set({
      status: "refunded"
    }).where(eq(orders.id, order.id)),
    queueCommandsWhere("refund", order),
    sendOrderWebhook(
      new Embed()
        .setTitle("Order Refunded")
        .setDescription(`Order for ${order.playerUuid} has been refunded.`)
        .setUrl(`${env.BASE_URL}/admin/orders/${order.id}`)
        .setColor(embedColors.yellow)
        .setTimestamp()
        .addField({
          name: "Order ID",
          value: order.id
        })
        .addField({
          name: "Player UUID",
          value: order.playerUuid
        })
        .addField({
          name: "Order Status",
          value: "Refunded"
        })
    )
  ]);
}

export const renewOrder = async (order: Order) => {
  await Promise.all([
    db.update(orders).set({
      subscriptionStatus: "active",
      lastRenewedAt: new Date()
    }).where(eq(orders.id, order.id)),
    queueCommandsWhere("renew", order),
    sendOrderWebhook(
      new Embed()
        .setTitle("Subscription Renewed")
        .setDescription(`Subscription for ${order.playerUuid} has been renewed.`)
        .setUrl(`${env.BASE_URL}/admin/orders/${order.id}`)
        .setColor(embedColors.green)
        .setTimestamp()
        .addField({
          name: "Order ID",
          value: order.id
        })
        .addField({
          name: "Player UUID",
          value: order.playerUuid
        })
        .addField({
          name: "Subscription Status",
          value: "Active"
        })
    )
  ]);
}

export const expireOrder = async (order: Order) => {
  await Promise.all([
    db.update(orders).set({
      subscriptionStatus: "expired"
    }).where(eq(orders.id, order.id)),
    queueCommandsWhere("expire", order),
    sendOrderWebhook(
      new Embed()
        .setTitle("Subscription Expired")
        .setDescription(`Subscription for ${order.playerUuid} has expired.`)
        .setUrl(`${env.BASE_URL}/admin/orders/${order.id}`)
        .setColor(embedColors.red)
        .setTimestamp()
        .addField({
          name: "Order ID",
          value: order.id
        })
        .addField({
          name: "Player UUID",
          value: order.playerUuid
        })
        .addField({
          name: "Subscription Status",
          value: "Expired"
        })
    )
  ]);
}