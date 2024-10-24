import { adminWrapper } from "@/app/(admin)/admin-panel";
import { ProductsDataTable } from "@/app/(admin)/admin/products/data-table";
import { api, HydrateClient } from "@/trpc/server";

const Page = adminWrapper(async ({ user }) => {
  await api.products.getProducts.prefetch({});
  return (
    <HydrateClient>
      <div>
        <ProductsDataTable />
      </div>
    </HydrateClient>
  );
}, "admin:products:view")
export default Page;