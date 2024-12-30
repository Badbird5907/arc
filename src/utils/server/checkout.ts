import "server-only";

import { db } from "@/server/db";
import { couponToCategory, couponToProduct } from "@/server/db/coupons";
import { isCouponValid } from "@/server/helpers/coupons";
import { type CouponWithUses, type Product } from "@/types";
import { eq } from "drizzle-orm";

type CartItem = { product: Product, quantity: number }

export const checkCoupons = async (coupons: CouponWithUses[], cart: CartItem[]) => {
  const total = cart.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
  const status = await Promise.all(coupons.map(async (coupon) => {
    if (!isCouponValid(coupon)) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This coupon is not active!",
        success: false,
      }
    }
    const conflicts = coupon.conflictsWith; // coupons that cannot be used together
    const anyConflict = conflicts.some(conflict => coupons.some(c => c.code === conflict));
    if (anyConflict) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This coupon conflicts with other coupons in your cart!",
        success: false,
      }
    }
    if (!coupon.canStack && coupons.length > 1) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This coupon cannot be stacked with other coupons!",
        success: false,
      }
    }
    const [productFilters, categoryFilters] = await Promise.all([
      db.select().from(couponToProduct).where(eq(couponToProduct.couponId, coupon.id)),
      db.select().from(couponToCategory).where(eq(couponToCategory.couponId, coupon.id)),
    ]);
    let productMatch = true;
    if (productFilters.length > 0) {
      const productIds = productFilters.map(filter => filter.productId);
      const anyMatch = cart.some(item => productIds.includes(item.product.id));
      productMatch = anyMatch;
    }
    let categoryMatch = true;
    if (categoryFilters.length > 0) {
      const categoryIds = categoryFilters.map(filter => filter.categoryId);
      const anyMatch = cart.some(item => categoryIds.includes(item.product.categoryId ?? ""));
      categoryMatch = anyMatch;
    }
    if (!productMatch && !categoryMatch) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This coupon is not applicable to any of the items in your cart!",
        success: false,
      }
    }

    if (coupon.maxDiscountAmount > 0 && total > coupon.maxDiscountAmount) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This coupon has a maximum discount of $" + coupon.maxDiscountAmount,
        success: false,
      }
    }

    if (coupon.maxGlobalTotalDiscount !== -1 && total > coupon.maxGlobalTotalDiscount) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This order would exceed the total discount limit for this coupon!",
        success: false,
      }
    }

    if (coupon.minOrderAmount > 0 && total < coupon.minOrderAmount) {
      return {
        code: coupon.code,
        id: coupon.id,
        error: "This order would be below the minimum order amount for this coupon!",
        success: false,
      }
    }
    const discountAmount = coupon.discountType === "percentage" ? total * coupon.discountValue / 100 : coupon.discountValue;
    return {
      code: coupon.code,
      id: coupon.id,
      error: null,
      success: true,
      discountAmount,
      coupon,
    }
  }))
  const discountAmount = status.reduce((acc, s) => acc + (s.discountAmount ?? 0), 0);
  const newTotal = total - discountAmount;
  return {status, total: newTotal, discountAmount};
}

export const getTotal = async (items: CartItem[], coupons?: CouponWithUses[]) => {
  const total = items.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
  if (coupons) {
    const {status, total: couponTotal, discountAmount} = await checkCoupons(coupons, items);
    if (status.some(s => !s.success)) {
      return { total, couponStatus: null };
    }
    return { total: couponTotal, couponStatus: status, discountAmount };
  }
  return { total, couponStatus: null, discountAmount: 0 };
}

export const lookupProducts = async (cart: { id: string; quantity: number }[]) => {
  const products = await db.query.products.findMany({
    where: (p, { inArray }) => inArray(p.id, cart.map(item => item.id)),
    with: {
      category: true
    }
  });

  return products.map(product => {
    const cartItem = cart.find(item => item.id === product.id);
    return {
      product,
      quantity: cartItem!.quantity
    }
  });
}