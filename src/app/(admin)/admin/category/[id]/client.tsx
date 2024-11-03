"use client";

import { EditCategory } from "@/app/(admin)/admin/category/[id]/edit";
import { ImagesCard } from "@/app/(admin)/admin/category/[id]/images";
import { CustomTreeBranch, CustomTreeLeaf } from "@/app/(admin)/admin/products/data-table";
import { ErrorPage } from "@/components/pages/error";
import { Tree } from "@/components/tree";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react"
import { convertToTreeData } from "@/utils/helpers/products";
import { useMemo } from "react";

export const CategoryPageClient = ({ id }: { id: string }) => {
  const { isLoading, isError, data: tree } = api.categories.getProductsAndCategoryTree.useQuery({ categoryId: id, mergeTree: true, showHidden: true });
  const { data: category } = api.categories.getCategory.useQuery({ id });

  const treeData = useMemo(() => {
    if (!tree || !Array.isArray(tree)) {
      return [];
    }
    return convertToTreeData(tree);
  }, [tree]);

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorPage code="500" />;
  if (!category) {
    return <ErrorPage code="404" />;
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="text-2xl font-bold">Category: {category.name}</h1>
      <Tree
        data={treeData}
        renderLeaf={CustomTreeLeaf}
        renderBranch={CustomTreeBranch}
        className="border rounded-lg p-4 shadow-sm"
      />
      <div className="flex flex-col md:flex-row gap-4">
        <EditCategory category={category} />
        <ImagesCard category={category} />
      </div>
    </div>
  )
}