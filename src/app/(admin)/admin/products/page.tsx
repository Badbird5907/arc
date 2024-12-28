import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { ProductsDataList } from "@/app/(admin)/admin/products/data-table";
import { api, HydrateClient } from "@/trpc/server";

const Page = adminWrapper(async ({ user }) => {
  await Promise.all([
    api.products.getProducts.prefetch({}),
    api.categories.getProductsAndCategoryTree.prefetch({ mergeTree: true, showHidden: true })
  ]);
  return (
    <HydrateClient>
      <ProductsDataList />
    </HydrateClient>
  );
}, "admin:products:view")
export default Page;