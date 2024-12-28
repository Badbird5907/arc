import { db } from "@/server/db"
import { sql } from "drizzle-orm"
import { orderToCoupon } from "@/server/db/coupons"

export const getCouponWithConstraints = async (couponId: string) => {
  const coupon = await db.query.coupons.findFirst({
    where: (coupons, { eq }) => eq(coupons.id, couponId),
    with: {
      couponToProduct: true,
      couponToCategory: true,
    },
    extras: {
      uses: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${orderToCoupon} 
        WHERE ${orderToCoupon.couponId} = ${couponId}
      )`.as('uses'),
    }
  })
  return coupon
}
