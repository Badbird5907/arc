import { adminWrapper } from "@/app/(admin)/admin/admin-panel";
import { ProductsDataList } from "@/app/(admin)/admin/products/data-table";
import { api, HydrateClient } from "@/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products"
}
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