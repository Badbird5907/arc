import type { Coupon, CouponWithConstraints, CouponWithUses, Product } from "@/types";

export const isCouponExpired = (coupon: Coupon) => {
  const now = new Date();
  if (coupon.expiresAt && coupon.expiresAt < now) return true;
  if (coupon.startsAt && coupon.startsAt > now) return true;
  return false;
}

export const isCouponValid = (coupon: Coupon | CouponWithUses) => {
  if (!coupon.enabled) return false;
  if (isCouponExpired(coupon)) return false;
  if ("uses" in coupon && coupon.maxUses > 0 && coupon.uses >= coupon.maxUses) return false;
  return true;
}

export const couponQualifies = async (coupon: CouponWithConstraints, products: Product[], order: { items: { productId: string }[], subtotal: number }) => {
  if (!isCouponValid(coupon)) return false;
  const { items, subtotal } = order;
  if (subtotal < coupon.minOrderAmount) return false;
  if (coupon.maxDiscountAmount !== -1 && coupon.maxDiscountAmount < subtotal) return false;
  const productIds = items.map(item => item.productId);

  if (coupon.couponToProduct && coupon.couponToProduct.length > 0) {
    if (!coupon.couponToProduct.some(productId => productIds.includes(productId.productId))) return false;
  }
  if (coupon.couponToCategory && coupon.couponToCategory.length > 0) {
    // check categoryIds of products
    const categoryIds = products.map(product => product.categoryId);
    if (!coupon.couponToCategory.some(categoryId => categoryIds.includes(categoryId.categoryId))) return false;
  }

  return true;
}