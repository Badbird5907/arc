import { db } from "@/server/db";
import type { Coupon, Order } from "@/types";

export const isCouponValid = (coupon: Coupon) => {
  if (!coupon.enabled) return false;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return false;
  if (coupon.startsAt && coupon.startsAt > new Date()) return false;
  if (coupon.uses >= coupon.maxUses) return false;
  return true;
}

export const couponQualifies = async (coupon: Coupon, order: Order) => {
  if (!isCouponValid(coupon)) return false;
  const { items, subtotal } = order;
  if (subtotal < coupon.minOrderAmount) return false;
  if (coupon.maxDiscountAmount !== -1 && coupon.maxDiscountAmount < subtotal) return false;
  if (coupon.appliesToProducts && coupon.appliesToProducts.length > 0) {
    const productIds = items.map(item => item.productId);
    if (!coupon.appliesToProducts.some(productId => productIds.includes(productId))) return false;
  }
    const productIds = items.map(item => item.productId);
    const products = await db.query.products.findMany({
      where: (products, { inArray }) => inArray(products.categoryId, coupon.appliesToCategories!),
    })
    if (products.length === 0) return false;
  }
  return true;
}