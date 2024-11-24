"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { type CategoryWithChildren, type ProductAndCategory } from "@/types";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

export const SetProductCategoryDropdown = ({ product, defaultParentName, setParent, allowMoreNested = true }: {
  product: ProductAndCategory | null;
  setParent: (id: string | null) => Promise<unknown> | void;
  defaultParentName?: string | null;
  allowMoreNested?: boolean;
}) => {
  const { data: categoriesData, isLoading } = api.categories.getCategoryTree.useQuery({});
  const [isPending, startTransition] = useTransition();
  const [selectedCategoryTree, setSelectedCategoryTree] = useState<string[]>([]); // a list of ids
  const [selectedName, setSelectedName] = useState<string | null>(defaultParentName ?? product?.category?.name ?? null);
  useEffect(() => {
    setSelectedName(defaultParentName ?? product?.category?.name ?? null);
  }, [defaultParentName, product?.category?.name]);
  const categories = useMemo(() => {
    if (!categoriesData) return null;
    let categories = categoriesData as CategoryWithChildren[];
    let currentCategory: CategoryWithChildren | null = null;
    if (allowMoreNested) {
      selectedCategoryTree.forEach((id) => {
        currentCategory = categories.find((category) => category.id === id) ?? null;
        if (!currentCategory) return;
        categories = currentCategory.children!;
      });
    }
    return categories;
  }, [allowMoreNested, categoriesData, selectedCategoryTree]);

  const setCategory = (category: CategoryWithChildren | null) => {
    startTransition(async () => {
      setSelectedName(category?.name ?? null);
      await setParent(category?.id ?? null)
    })
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <div className="w-full border rounded-lg p-2 flex justify-between items-center">
          {selectedName ? (
            <div className="flex flex-row gap-2">
              {selectedName}
            </div>
          ) : "No Category"}
          {isPending && <Spinner className="ml-auto" size={24} />}
          <ChevronsUpDown className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[350px]">
        <DropdownMenuLabel>Products</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {selectedCategoryTree.length > 0 && (
          <>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setSelectedCategoryTree(selectedCategoryTree.slice(0, -1));
            }} className="w-full p-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(isLoading || !categories) ? <DropdownMenuItem disabled>Loading...</DropdownMenuItem> :
          (categories).map((category) => (
            <DropdownMenuItem key={category.id} onClick={() => setCategory(category)} className="w-full p-2">
              <div className="flex flex-col">
                <span>
                  {category.name}
                </span>
                {allowMoreNested && category.children && category.children?.length > 0 && (
                  <span className="font-bold text-gray-500">
                    {category.children.length} Sub-Categories
                  </span>
                )}
              </div>
              {allowMoreNested && category.children && category.children?.length > 0 && (
                <button className="ml-auto hover:bg-accent rounded-lg p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategoryTree([...selectedCategoryTree, category.id]);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </DropdownMenuItem>
          ))
        }
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setCategory(null)} className="w-full p-2">
          No Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}