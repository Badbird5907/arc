import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { OrdersClient } from "@/app/(admin)/admin/orders/client";
import { HydrateClient } from "@/trpc/server";

const Page = adminWrapper(async ({ }) => {
  return (
    <HydrateClient>
      <OrdersClient />
    </HydrateClient>
  )
}, "admin:orders:view")
export default Page;