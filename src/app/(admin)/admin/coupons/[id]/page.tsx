import { CouponsClient } from "@/app/(admin)/admin/coupons/[id]/client";
import { api, HydrateClient } from "@/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupon"
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await Promise.all([
    api.coupons.getCoupon.prefetch({ id }),
  ]);
  return (
    <HydrateClient>
      <CouponsClient id={id} />
    </HydrateClient>
  )
}