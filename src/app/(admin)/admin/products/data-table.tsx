"use client";

import { CreateCategoryButton } from "@/app/(admin)/admin/products/create-category";
import { CreateProductButton } from "@/app/(admin)/admin/products/create-product";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { type Product } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export const productsCols: ColumnDef<Product>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      if (!row.original.description) {
        return "No Description";
      }
      if (row.original.description.length > 100) { // TODO: tweak
        return row.original.description.slice(0, 100) + "...";
      }
      return row.original.description;
    }
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
export const ProductsDataTable = () => {
  const products = api.products.getProducts.useQuery({});
  const [filter, setFilter] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <DataTable
        columns={productsCols}
        data={products.data ?? []}
        globalFilter={filter}
        actionsBar={(
          <div className="flex w-full items-center gap-2">
            <CreateProductButton />
            <CreateCategoryButton />
            <Input
              className="w-1/3 mx-2"
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
  );
}