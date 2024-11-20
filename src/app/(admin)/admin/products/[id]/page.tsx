import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import ProductPageClient from "@/app/(admin)/admin/products/[id]/client";
import { api, HydrateClient } from "@/trpc/server";

const Page = adminWrapper<{ params: Promise<{ id: string }> }>(async ({ params }) => {
  const { id } = await params;
  await Promise.all([
    api.products.getProduct.prefetch({ id }),
    api.servers.getServers.prefetch()
  ]);

  return (
    <HydrateClient>
      <ProductPageClient id={id} />
    </HydrateClient>
  );
})
export default Page;