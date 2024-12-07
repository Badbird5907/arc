import { OrderClient } from "@/app/(admin)/admin/orders/[id]/client";
import { api } from "@/trpc/server";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await api.orders.getOrder.prefetch({ id });
  return (
    <OrderClient id={id} />
  )
}