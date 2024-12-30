import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { CouponsClient } from "@/app/(admin)/admin/coupons/client";
import { HydrateClient } from "@/trpc/server";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupons"
}
const Page = adminWrapper(async ({ user }) => {
  return (
    <HydrateClient>
      <CouponsClient />
    </HydrateClient>
  )
}, "admin:coupons:view")

export default Page;
