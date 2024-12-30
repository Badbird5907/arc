import "server-only";

import { db } from "@/server/db";
import { eq, getTableColumns, type SQL, sql } from "drizzle-orm";
import { coupons, orderToCoupon } from "@/server/db/coupons";

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
export const getCouponsWithUses = async (where: SQL<unknown>) => {
  const resolvedCoupons = await db.select({
    ...getTableColumns(coupons),
    uses: sql<number>`(SELECT COUNT(*) FROM ${orderToCoupon} WHERE ${orderToCoupon.couponId} = ${coupons.id})::int`,
  })
  .from(coupons)
  .where(where)
  .innerJoin(orderToCoupon, eq(orderToCoupon.couponId, coupons.id))
  .groupBy(coupons.id);
  return resolvedCoupons;
}
