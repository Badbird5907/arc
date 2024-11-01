import { adminWrapper } from "@/app/(admin)/admin-panel";
import { ProductsDataList } from "@/app/(admin)/admin/products/data-table";
import { api, HydrateClient } from "@/trpc/server";

const Page = adminWrapper(async ({ user }) => {
  await Promise.all([
    api.products.getProducts.prefetch({}),
    api.products.getProductsAndCategoryTree.prefetch({ mergeTree: true })
  ]);
  return (
    <HydrateClient>
      <div>
        <ProductsDataList />
      </div>
    </HydrateClient>
  );
}, "admin:products:view")
export default Page;