import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import ProductPageClient from "@/app/(admin)/admin/products/[id]/client";
import { api, HydrateClient } from "@/trpc/server";

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