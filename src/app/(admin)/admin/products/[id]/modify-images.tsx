"use client";

import { ImageDndList } from "@/app/(admin)/admin/products/[id]/image-dnd";
import { useModifyProduct } from "@/components/admin/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { type Product } from "@/types";
import { Plus, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useTransition } from "react";
import { Carousel } from "react-responsive-carousel";
import { toast } from "sonner";

import "react-responsive-carousel/lib/styles/carousel.min.css";

export const ModifyImagesCard = ({ product }: { product: Product }) => {
  const { images } = product;
  const requestUploadUrl = api.products.requestUploadUrl.useMutation();
  const modifyProduct = useModifyProduct();
  const utils = api.useUtils();
  const deleteImage = api.products.deleteImage.useMutation({
    onSuccess: async () => utils.products.getProduct.invalidate()
  })
  const [isPending, startTransition] = useTransition();
  const uploadNewImage = () => {
    console.log("uploading new image");
    // get the image from the user
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async () => {
      startTransition(async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const extension = file.name.split(".").pop();
        const { id, ext, url } = await requestUploadUrl.mutateAsync({
          productId: product.id,
          extension: extension!,
        });
        const formData = new FormData();
        formData.append("file", file);
        await fetch(url, {
          method: "PUT",
          body: file,
        });
        // add the image to the product
        await modifyProduct.mutateAsync({
          id: product.id,
          data: {
            images: [...images, `${id}.${ext}`],
          },
        }).then(() => {
          toast.success("Product Updated", {
            description: "Successfully uploaded new image!",
          });
        }).catch((e) => {
          toast.error("Error", {
            description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
          });
        }).finally(() => {
          fileInput.remove();
        })
      })
    };
    fileInput.click();
  }
  return (
    <Card>
      <CardHeader>Images</CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Carousel showThumbs={false}>
            {images.map((image, i) => (
              <div key={i} className="relative group">
                <Image
                  src={`/assets/products/${product.id}/${image}`}
                  width={400}
                  height={400}
                  alt={`Image ${i + 1}`}
                />
                <button
                  onClick={() => {
                    deleteImage.mutateAsync({
                      productId: product.id,
                      imageId: image,
                    }).then(() => {
                      toast.success("Image Deleted", {
                        description: "Successfully deleted image!",
                      });
                    }).catch((e) => {
                      toast.error("Error", {
                        description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
                      });
                    })
                  }}
                  className="hidden group-hover:inline-flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  aria-label="Delete Image"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <button className="border-dashed border-4 w-full h-full rounded-lg" onClick={uploadNewImage}>
              <div className="place-self-center py-24">
                {isPending ? <Spinner /> : <Plus />}
              </div>
            </button>
          </Carousel>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mt-4">
                Edit Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Order</DialogTitle></DialogHeader>
              <ImageDndList product={product} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}