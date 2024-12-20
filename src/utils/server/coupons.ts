import { db } from "@/server/db"

export const getCouponWithConstraints = async (couponId: string) => {
  const coupon = await db.query.coupons.findFirst({
    where: (coupons, { eq }) => eq(coupons.id, couponId),
    with: {
      couponToProduct: true,
      couponToCategory: true,
    }
  })
  return coupon
}
