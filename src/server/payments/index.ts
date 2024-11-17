import { utilsRouter } from "@/server/api/routers/utils";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { TebexPaymentProvider } from "@/server/payments/impl/tebex";
import { api } from "@/trpc/server";
import { PaymentProvider, Product } from "@/types";
import { type Checkout } from "@/types/checkout";
import { getTotal } from "@/utils/helpers/checkout";
import { getIpAddress, getPlayer } from "@/utils/server/helpers";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const getAvailablePaymentProviders = async (_checkoutData: Checkout) => {
  return ["tebex"]
}

export const checkout = async (checkoutData: Checkout, provider: string) => {
  const providerImpl = getPaymentProvider(provider);
  if (!providerImpl) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Provider not found!"
    })
  }

  const result = await getPlayer(checkoutData.username);
  if ('notFound' in result) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Player not found!"
    });
  }
  const player = result.data;

  // Add products lookup here
  const [products, ip] = await Promise.all([
    Promise.all(checkoutData.cart.map((item) => {
      return db.query.products.findFirst({
        where: (p, { eq }) => eq(p.id, item.id),
        with: {
          category: true
        }
      }).then((product: Product | undefined | null) => {
        if (!product) return null;
        return {
          product,
          quantity: item.quantity
        }
      })
    })).then((products) => products.filter((item): item is { product: Product, quantity: number } => !!item)),
    getIpAddress()
  ]);

  const total = getTotal(products);

  const order = await db.insert(orders).values({
    items: products.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity
    })),
    playerUuid: player.uuid,
    provider: provider as PaymentProvider,
    subtotal: total,
    ipAddress: ip,
    firstName: checkoutData.info.firstName,
    lastName: checkoutData.info.lastName,
    email: checkoutData.info.email,
  }).returning();

  const createdOrder = order[0];
  if (!createdOrder) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR", 
      message: "Failed to create order"
    });
  }

  const data = await providerImpl.beginCheckout(checkoutData, products, createdOrder);
  await db.update(orders).set({
    ...data.updateOrder
  }).where(eq(orders.id, createdOrder.id));
  return data;
}

const getPaymentProvider = (provider: string) => {
  switch (provider) {
    case "tebex":
      return new TebexPaymentProvider();
    default:
      return null;
  }
}