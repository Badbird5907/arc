"use client";

import { CreateCategoryButton } from "@/app/(admin)/admin/products/create-category";
import { CreateProductButton } from "@/app/(admin)/admin/products/create-product";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { type CategoryTreeNode, type SlimProduct, type CategoryTree, type Product } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ChevronRight, Edit, EditIcon, Folder, FolderOpen, Search } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Tree, type TreeBranchProps, type TreeLeafProps } from "@/components/tree";
import { convertToTreeData } from "@/utils/helpers/products";

export const productsCols: ColumnDef<Omit<Product, "description">>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    enableSorting: true,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="translate-x-[-20px]" // TODO: fix
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => `$${Number(row.original.price).toFixed(2)}`,
  },
  {
    accessorKey: "hidden",
    header: "Hidden",
    cell: ({ row }) => row.original.hidden ? "Yes" : "No",
  },
  {
    accessorKey: "createdAt",
    header: "Created ",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "modifiedAt",
    header: "Last Modified",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "__dummy__",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="flex flex-row gap-2">
          <Link href={`/admin/products/${row.original.id}`}>
            <Button>
              <Edit />
              Edit
            </Button>
          </Link>
        </div>
      )
    }
  }
]
export const CustomTreeLeaf: React.FC<TreeLeafProps> = ({ node }) => {
  const data = node.data as SlimProduct;
  return (
    <div className="flex items-center justify-between hover:bg-accent p-4 mb-1 border rounded-lg">
      <div className="flex items-center gap-2">
        <span>{data.name}</span>
      </div>
      <Link href={`/admin/products/${data.id}`}>
        <Button><EditIcon /> Edit</Button>
      </Link>
    </div>
  )
};
export const CustomTreeBranch: React.FC<TreeBranchProps> = ({ node, isOpen, toggle, children }) => {
  const data = node.data as CategoryTreeNode;
  return (
    <div className="mb-1">
      <div
        className="flex items-center cursor-pointer hover:bg-accent p-4 border rounded"
        onClick={toggle}
      >
        <ChevronRight
          className={`h-4 w-4 mr-1 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''
            }`}
        />
        {isOpen ? (
          <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
        )}
        <span className="text-sm font-medium">{data.name}</span>
        <div className="ml-auto">
          <Link href={`/admin/category/${data.id}`} onClick={(e) => {
            e.stopPropagation();
          }}>
            <EditIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {isOpen && <div className="pl-6 mt-1">{children}</div>}
    </div>
  )
}
export const ProductsDataList = () => {
  const products = api.products.getProducts.useQuery({});
  const productTree = api.products.getProductsAndCategoryTree.useQuery({ mergeTree: true });
  const [filter, setFilter] = useState("");

  const treeData = useMemo(() => {
    if (!Array.isArray(productTree.data)) {
      return [];
    }
    const tree: CategoryTree = productTree.data;
    return convertToTreeData(tree, filter);
  }, [productTree.data, filter])


  return (
    <Tabs defaultValue="list" className="w-full pt-4">
      <TabsList className="grid grid-cols-2 w-full md:w-1/3">
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
      </TabsList>
      <TabsContent value="list" className="flex flex-col gap-2">
        <div className="flex flex-row gap-4">
          <CreateProductButton />
          <CreateCategoryButton />
          <Input
            className="w-full md:w-1/3 mx-2"
            type="text"
            placeholder="Search"
            startContent={<Search />}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Tree
          data={treeData}
          renderLeaf={CustomTreeLeaf}
          renderBranch={CustomTreeBranch}
          className="border rounded-lg p-4 shadow-sm"
        />
      </TabsContent>
      <TabsContent value="table">
        <div className="flex flex-col gap-4">
          <DataTable
            columns={productsCols}
            data={products.data ?? []}
            globalFilter={filter}
            actionsBar={(
              <div className="flex flex-col md:flex-row w-full items-center gap-2">
                <CreateProductButton />
                <CreateCategoryButton />
                <Input
                  className="w-full md:w-1/3 mx-2"
                  type="text"
                  placeholder="Search"
                  startContent={<Search />}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            )}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}