"use client";
import { ProductActionsCard } from "@/app/(admin)/admin/products/[id]/actions-card";
import { EditProductBasic } from "@/app/(admin)/admin/products/[id]/edit-basic";
import { DeliveryEditor } from "@/app/(admin)/admin/products/[id]/edit-delivery";
import { ModifyImagesCard } from "@/app/(admin)/admin/products/[id]/modify-images";
import { ErrorPage } from "@/components/pages/error";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";

const ProductPageClient = ({ id }: { id: string }) => {
  const { isLoading, isError, data: product } = api.products.getProduct.useQuery({ id, delivery: true });
  const modifyDelivery = api.products.modifyDelivery.useMutation();
  if (isLoading) return <Spinner />
  if (isError) return <ErrorPage code="500" />
  if (!product) return <ErrorPage code="404" />;
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex flex-col md:flex-row gap-4">
        <h1 className="text-4xl">Product: {product.name}</h1>
        {product.hidden && <Badge variant={"destructive"} className="h-fit w-fit place-self-auto md:place-self-center">Hidden</Badge>}
      </div>

      <div className="grid grid-flow-row md:grid-flow-col grid-cols-1 md:grid-cols-4 gap-4">
        <EditProductBasic product={product} className="col-span-1 md:col-span-3" />
        <div className="col-span-1 gap-4 flex flex-col">
          <ProductActionsCard product={product} />
          <ModifyImagesCard product={product} />
        </div>
      </div>
      <DeliveryEditor initialDeliveries={product.deliveries} onSubmit={async (deliveries) => {
        await modifyDelivery.mutateAsync({ id, deliveries });
      }} isSubscriptionProduct={product.type === "subscription"} />
    </div>
  );
}
export default ProductPageClient;