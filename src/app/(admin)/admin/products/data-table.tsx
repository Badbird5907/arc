"use client";

import { Product } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
export const productsCols: ColumnDef<Product>[] = [
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
    header: "Price",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "hidden",
    header: "Hidden",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
]
export const ProductsDataTable = ({ products }: { products: Product[] }) => {
  
}