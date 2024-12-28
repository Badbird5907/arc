import { db } from "@/server/db";
import { orders, orderToCoupon } from "@/server/db/schema";
import { TebexPaymentProvider } from "@/server/payments/impl/tebex";
import { PaymentProvider, Product } from "@/types";
import { type Checkout } from "@/types/checkout";
import { getTotal, lookupProducts } from "@/utils/server/checkout";
import { getIpAddress, getPlayer } from "@/utils/server/helpers";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const getAvailablePaymentProviders = async (_checkoutData: Checkout) => {
  return ["tebex"]
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
  if (result.notFound) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Player not found!"
    });
  }
  const player = result.data;

  const [products, coupons, ip] = await Promise.all([
    lookupProducts(checkoutData.cart),
    db.query.coupons.findMany({
      where: (coupons, { inArray }) => inArray(coupons.code, checkoutData.coupons ?? [])
    }),
    getIpAddress()
  ]);

  const total = await getTotal(products, coupons);
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

    const coupons = total.couponStatus?.filter(s => s.success) ?? [];
    const orderId = order[0]?.id;
    if (!orderId) { // wtf
      tx.rollback();
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create order"
      });
    }
    if (coupons.length > 0) {
      await tx.insert(orderToCoupon).values(coupons.map((coupon) => ({
        orderId,
        couponCode: coupon.code,
        couponId: coupon.id,
      })));
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
    default:
      return null;
  }
}