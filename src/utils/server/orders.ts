import { env } from "@/env";
import { db } from "@/server/db";
import { orders, players, queuedCommands } from "@/server/db/schema";
import { getSetting } from "@/server/settings";
import { type QueuedCommand, type Order, type deliveryWhen } from "@/types";
import { variables } from "@/utils/helpers/delivery-variables";
import { embedColors, sendOrderWebhook } from "@/utils/helpers/discord";
import { Embed } from "@vermaysha/discord-webhook";
import { format } from "date-fns";
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
  
  // get all possible global deliveries
  const globalDeliveries = await db.query.deliveries.findMany({
    where: (d, { and, eq, isNotNull }) => {
      return and(
        eq(d.global, true),
        eq(d.when, when),
        isNotNull(d.scope)
      )
    },
  });

  // process product-specific deliveries
  await Promise.all(products.map(async (product) => {
    await Promise.all(order.items.map(async (item) => {
      if (item.productId === product.id) {

        const deliveryIds = product.productToDelivery.map((d) => d.deliveryId).filter((id): id is string => id !== null);
        
        const productDeliveries = await db.query.deliveries.findMany({
          where: (d, { inArray, and, eq, isNotNull }) => {
            return and(
              inArray(d.id, deliveryIds),
              eq(d.when, when),
              isNotNull(d.scope)
            )
          },
        });

        // process both product-specific and global deliveries
        const allDeliveries = [...productDeliveries, ...(item === order.items[0] ? globalDeliveries : [])];


        await Promise.all(allDeliveries.map(async (delivery) => {
          // find a list of variables in the payload
          const vars = delivery.value.match(/\{([^}]+)\}/g);
          let payload = delivery.value;
          
          if (vars) {
            // Replace each variable one at a time
            for (const v of vars) {
              const varName = v.replace(/[{}]/g, "");
              const variable = variables.find((var_) => var_.name === varName);
              if (variable) {
                const value = await variable.replace({
                  value: varName,
                  order,
                  product,
                  delivery: {
                    ...delivery,
                    type: "command",
                    scope: delivery.scope ?? "",
                  }
                });
                payload = payload.replace(`{${varName}}`, String(value));
              }
            }
          }

          // if stack is true, create multiple commands based on quantity
          const iterations = delivery.stack ? item.quantity : 1;
          for (let i = 0; i < iterations; i++) {
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
          }
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
      [order.provider]: {
        ...order.metadata[order.provider] ?? {},
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
    const [ban] = await Promise.all([
      getSetting("banOnChargeback"),
      await queueCommandsWhere("chargeback", order)
    ]);
    if (ban.value) {
      const note = `Auto-banned for chargeback on order: ${order.id} at ${format(new Date(), "PP hh:mm aa zzz")}`;
      const existing = await db.query.players.findFirst({
        where: (p, { eq }) => eq(p.uuid, order.playerUuid)
      });
      if (existing) {
        await db.update(players).set({
          banned: new Date(),
          notes: `${existing.notes ?? ""}\n\n${note}`
        }).where(eq(players.uuid, order.playerUuid));
      } else {
        await db.insert(players).values({
          uuid: order.playerUuid,
          banned: new Date(),
          notes: note
        });
      }
    }
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