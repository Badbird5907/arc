import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { OrderClient } from "@/app/(admin)/admin/orders/[id]/client";
import { api, HydrateClient } from "@/trpc/server";

export default adminWrapper(async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await api.orders.getOrder.prefetch({ id });
  return (
    <HydrateClient>
      <OrderClient id={id} />
    </HydrateClient>
  )
}, "admin:orders:view")