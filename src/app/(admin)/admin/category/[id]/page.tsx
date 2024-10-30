import { adminWrapper } from "@/app/(admin)/admin-panel";
import { CategoryPageClient } from "@/app/(admin)/admin/category/[id]/client";
import { api, HydrateClient } from "@/trpc/server";

const Page = adminWrapper<{ params: Promise<{ id: string }> }>(async ({ params }) => {
  const { id } = await params;
  await api.products.getCategoryTree.prefetch({ id });

  return (
    <HydrateClient>
      <CategoryPageClient id={id} />
    </HydrateClient>
  );
})
export default Page;