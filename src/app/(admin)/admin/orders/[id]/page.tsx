import { OrderClient } from "@/app/(admin)/admin/orders/[id]/client";
import { api } from "@/trpc/server";

export default async function OrderPage({ params }: { params: { id: string } }) {
  await api.orders.getOrder.prefetch({ id: params.id });
  return (
    <OrderClient id={params.id} />
  )
}