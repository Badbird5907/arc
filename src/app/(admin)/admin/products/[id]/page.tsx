import { adminWrapper } from "@/app/(admin)/admin-panel";
import { ProductActionsCard } from "@/app/(admin)/admin/products/[id]/actions-card";
import ProductPageClient from "@/app/(admin)/admin/products/[id]/client";
import { EditProductBasic } from "@/app/(admin)/admin/products/[id]/edit-basic";
import { getProductById } from "@/server/helpers/products";
import { api, HydrateClient } from "@/trpc/server";
import { notFound } from "next/navigation";

const Page = adminWrapper<{ params: Promise<{ id: string }> }>(async ({ params }) => {
  const { id } = await params;
  await api.products.getProduct.prefetch({ id });

  return (
    <HydrateClient>
      <ProductPageClient id={id} />
    </HydrateClient>
  );
})
export default Page;