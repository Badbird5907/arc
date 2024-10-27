"use client";
import { ProductActionsCard } from "@/app/(admin)/admin/products/[id]/actions-card";
import { EditProductBasic } from "@/app/(admin)/admin/products/[id]/edit-basic";
import { ErrorPage } from "@/components/pages/error";
import { api } from "@/trpc/react";

const ProductPageClient = ({ id }: { id: string }) => {
  const { data: product } = api.products.getProduct.useQuery({ id });
  if (!product) return <ErrorPage code="404" />;
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-4xl">Product: {product.name}</h1>

      <div className="grid grid-flow-col grid-cols-4 gap-4">
        <EditProductBasic product={product} className="col-span-3" />
        <ProductActionsCard product={product} />
      </div>
    </div>
  );
}
export default ProductPageClient;