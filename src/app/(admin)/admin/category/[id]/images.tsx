"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { categoryImageFields } from "@/trpc/schema/products";
import { type Category } from "@/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const images = categoryImageFields;
export const ImagesCard = ({ category }: { category: Category }) => {
  const [selectedImage, setSelectedImage] = useState<keyof typeof images>("bannerImage");
  const utils = api.useUtils();
  const modifyCategory = api.categories.modifyCategory.useMutation({
    onSuccess: () => utils.categories.getCategory.invalidate()
  });
  const requestUploadUrl = api.categories.requestUploadUrl.useMutation();
  const removeImage = api.categories.deleteImage.useMutation({
    onSuccess: () => utils.categories.getCategory.invalidate()
  });
  const [isPending, startTransition] = useTransition();

  const next = () => {
    const keys = Object.keys(images) as (keyof typeof images)[];
    const currentIndex = keys.indexOf(selectedImage);
    setSelectedImage(keys[currentIndex + 1] ?? keys[0]!);
  }
  const prev = () => {
    const keys = Object.keys(images) as (keyof typeof images)[];
    const currentIndex = keys.indexOf(selectedImage);
    setSelectedImage(keys[currentIndex - 1] ?? keys[keys.length - 1]!);
  }

  const uploadNewImage = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async () => {
      startTransition(async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const extension = file.name.split(".").pop();
        const { id, ext, url } = await requestUploadUrl.mutateAsync({
          categoryId: category.id,
          extension: extension!,
        });
        const formData = new FormData();
        formData.append("file", file);
        await Promise.all([
          fetch(url, {
            method: "PUT",
            body: file,
          }),
          // add the image to the product
          modifyCategory.mutateAsync({
            id: category.id,
            data: {
              [selectedImage]: `${id}.${ext}`,
            },
          }).then(() => {
            toast.success("Category Updated", {
              description: "Successfully uploaded new image!",
            });
          }).catch((e) => {
            toast.error("Error", {
              description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
            });
          }).finally(() => {
            fileInput.remove();
          })
        ])
      })
    };
    fileInput.click();
  }

  return (
    <Card className="w-full md:w-1/3">
      <CardHeader>
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-row w-full">
            <Button onClick={prev}>
              <ChevronLeft />
            </Button>
            <span className="w-full place-content-center text-center">{images[selectedImage]}</span>
            <Button className="ml-auto" onClick={next}>
              <ChevronRight />
            </Button>
          </div>
          <div className="w-full">
            {selectedImage in category && category[selectedImage] ? (
              <Image
                src={`/assets/categories/${category.id}/${category[selectedImage]}`}
                width={512}
                height={512}
                alt={"Image"}
                className="place-self-center"
              />
            ) : (
              <button className="border-dashed border-4 w-full h-full rounded-lg" onClick={uploadNewImage}>
                <div className="place-self-center py-24">
                  {isPending ? <Spinner /> : <Plus />}
                </div>
              </button>
            )}
          </div>
          {selectedImage in category && category[selectedImage] && (
            <Button variant={"destructive"} loading={isPending}
              onClick={() => {
                startTransition(async () => {
                  await removeImage.mutateAsync({
                    categoryId: category.id,
                    imageId: category[selectedImage]!
                  });
                })
              }}
            >
              Remove Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}