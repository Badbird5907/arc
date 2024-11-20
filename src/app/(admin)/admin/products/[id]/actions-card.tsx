"use client";
import { useModifyProduct } from "@/components/admin/hooks";
import { SetProductCategoryDropdown } from "@/components/admin/products/set-category";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { type ProductAndCategory, type Product } from "@/types";
import { Eye, EyeClosed, Trash } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

const ToggleVisibilityButton = ({ product }: { product: Product }) => {
  const modifyProduct = useModifyProduct();
  const [isPending, startTransition] = useTransition();
  return (
    <Button loading={isPending}
      onClick={() => {
        startTransition(async () => {
          await modifyProduct.mutateAsync({
            id: product.id,
            data: {
              hidden: !product.hidden
            }
          }).then(() => {
            toast.success("Product Updated", {
              description: "Your product has been updated successfully!",
            });
          }).catch((e) => {
            toast.error("Error", {
              description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
            });
          })
        })
      }}>
      {product.hidden ? <><Eye /> Show Product</> : <><EyeClosed /> Hide Product</>}
    </Button>
  )
}

export const ProductActionsCard = ({ product }: { product: ProductAndCategory }) => {
  const deleteProduct = api.products.deleteProduct.useMutation();
  const modifyProduct = useModifyProduct();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Product Actions</CardTitle>
      </CardHeader>
      <div className="px-4 pb-4 w-full flex flex-col gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" variant="destructive"><Trash /> Delete Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to delete this product?
            </DialogDescription>
            <DialogFooter>
              <Button variant="destructive" className="w-full"
                onClick={() => deleteProduct.mutateAsync({ id: product.id }).then(() => {
                  window.location.href = "/admin/products";
                })}
              >Delete</Button>
              <DialogClose className="w-full" asChild>
                <Button variant="ghost" className="w-full">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <ToggleVisibilityButton product={product} />
      </div>
      <div className="pb-4 px-4 w-full">
        <SetProductCategoryDropdown product={product} setParent={(id) => {
          return modifyProduct.mutateAsync({
            id: product.id,
            data: {
              categoryId: id === "null" ? null : id,
            }
          }).then(() => {
            toast.success("Product Updated", {
              description: "Your product has been updated successfully!",
            });
          }).catch((e) => {
            toast.error("Error", {
              description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
            });
          });
        }} />
      </div>
    </Card>
  )
}