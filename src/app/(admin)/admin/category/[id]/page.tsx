import { adminWrapper } from "@/app/(admin)/admin-panel";
import { CategoryPageClient } from "@/app/(admin)/admin/category/[id]/client";
import { api, HydrateClient } from "@/trpc/server";

const Page = adminWrapper<{ params: Promise<{ id: string }> }>(async ({ params }) => {
  const { id } = await params;
  await Promise.all([
    api.products.getCategory.prefetch({ id }),
    api.products.getProductsAndCategoryTree.prefetch({ mergeTree: true, categoryId: id })
  ]);

  return (
    <HydrateClient>
      <CategoryPageClient id={id} />
    </HydrateClient>
  );
})
export default Page;