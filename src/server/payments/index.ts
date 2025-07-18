import { db } from "@/server/db";
import { coupons, orders, orderToCoupon } from "@/server/db/schema";
import { TebexPaymentProvider } from "@/server/payments/impl/tebex";
import { StripePaymentProvider } from "@/server/payments/impl/stripe";
import { type PaymentProvider } from "@/types";
import { type Checkout } from "@/types/checkout";
import { getTotal, lookupProducts } from "@/utils/server/checkout";
import { getCouponsWithUses } from "@/utils/server/coupons";
import { getIpAddress, getPlayer } from "@/utils/server/helpers";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { env } from "@/env";

export const getAvailablePaymentProviders = async (_checkoutData: Checkout) => {
  const providers: PaymentProvider[] = [];
  if (env.STRIPE_SECRET_KEY) {
    providers.push("stripe");
  }
  if (env.TEBEX_PRIVATE_KEY && env.TEBEX_PROJECT_ID && env.TEBEX_WEBHOOK_SECRET) {
    providers.push("tebex");
  }
  return providers;
}

export const checkout = async (checkoutData: Checkout, provider: string) => {
  console.log("checkout ->", checkoutData);
  const providerImpl = getPaymentProvider(provider);
  if (!providerImpl) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Provider not found!"
    })
  }

  const result = await getPlayer(checkoutData.username);
  if (result.notFound || !result.data) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Player not found!"
    });
  }
  const player = result.data;

  const [products, resolvedCoupons, ip, profile] = await Promise.all([
    lookupProducts(checkoutData.cart),
    getCouponsWithUses(inArray(coupons.code, checkoutData.coupons ?? [])),
    getIpAddress(),
    db.query.players.findFirst({
      where: (p, { eq }) => eq(p.uuid, player.uuid),
    })
  ]);

  if (profile?.banned) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are banned from purchasing from this store!"
    });
  }

  const total = await getTotal(products, resolvedCoupons);
  const order = await db.transaction(async (tx) => {
    const order = await tx.insert(orders).values({
      items: products.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      playerUuid: player.uuid,
      provider: provider as PaymentProvider,
      subtotal: total.total,
      ipAddress: ip,
      firstName: checkoutData.info.firstName,
      lastName: checkoutData.info.lastName,
      email: checkoutData.info.email,
    }).returning();

    const usedCoupons = total.couponStatus?.filter(s => s.success) ?? [];
    const orderId = order[0]?.id;
    if (!orderId) { // wtf
      tx.rollback();
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create order"
      });
    }
    if (usedCoupons.length > 0) {
      await Promise.all([
        tx.insert(orderToCoupon).values(usedCoupons.map((coupon) => ({
          orderId,
          couponCode: coupon.code,
          couponId: coupon.id,
        }))),
        ...usedCoupons.filter(c => c.coupon && c.coupon.maxGlobalTotalDiscount > 0).map(c => {
          return tx.update(coupons).set({
            availableGlobalTotalDiscount: c.coupon!.availableGlobalTotalDiscount - (c.discountAmount ?? 0),
          }).where(eq(coupons.id, c.coupon!.id));
        })
      ])
    }
    return order[0]!;
  })
  const activeCoupons = total.couponStatus?.filter(s => s.success).map(s => ({ name: `Coupon: ${s.code}`, amount: s.discountAmount ?? 0 })) ?? [];
  const data = await providerImpl.beginCheckout(checkoutData, products, order, activeCoupons);
  await db.update(orders).set({
    ...data.updateOrder
  }).where(eq(orders.id, order.id));
  return data;
}

const getPaymentProvider = (provider: string) => {
  switch (provider) {
    case "tebex":
      return new TebexPaymentProvider();
    case "stripe":
      return new StripePaymentProvider();
    default:
      return null;
  }
}