"use client";

import { useModifyProduct } from "@/components/admin/hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import { type ProductAndCategory } from "@/types";
import { toast } from "sonner";

export const SetProductCategoryDropdown = ({ product }: { product: ProductAndCategory }) => {
  const { data: categories } = api.products.getCategories.useQuery();
  const modifyProduct = useModifyProduct();
  const setCategory = (id: string | null) => {
    modifyProduct.mutateAsync({
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
    })
  }
  return (
    <div className="pb-4 px-4">
      <Select onValueChange={(val) => {
        setCategory(val);
      }} defaultValue={product.category?.id ?? "null"}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">
            No Category
          </SelectItem>
          {categories?.map((category) => (
            <SelectItem value={category.id} key={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}