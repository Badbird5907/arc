"use client";

import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { type CouponWithUses } from "@/types";
import { Pencil, Search } from "lucide-react";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { DebouncedInput } from "@/components/debounced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpsertCouponForm } from "@/app/(admin)/admin/coupons/new";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isCouponValid } from "@/server/helpers/coupons";

const columns: ColumnDef<CouponWithUses>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Code",
    accessorKey: "code",
  },
  {
    header: "Type",
    accessorKey: "type",
  },
  {
    header: "Discount",
    accessorKey: "discountValue",
    cell: ({ row }) => {
      const { discountType, discountValue } = row.original;
      return <span>{discountType === "percentage" ? `${discountValue}%` : `$${discountValue}`}</span>;
    }

  },
  {
    header: "Uses",
    accessorKey: "uses",
    cell: ({ row }) => {
      const { uses, maxUses } = row.original;
      return <span>{uses} {maxUses > 0 && ` / ${maxUses}`}</span>;
    }
  },
  {
    header: "Active",
    accessorKey: "enabled",
    cell: ({ row }) => {
      return <span>
        {isCouponValid(row.original) ? (
          <Badge variant={"success"}>
            Yes
          </Badge>
        ) : (
          <Badge variant={"destructive"}>
            No
          </Badge>
        )}
      </span>;
    }
  },
  {
    header: "Actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      return (
        <Link href={`/admin/coupons/${row.original.id}`}>
          <Button>
            <Pencil />
          </Button>
        </Link>
      );
    }
  }
]
export const CouponsClient = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState<{
    search: string,
    active: "true" | "false" | "all",
    type: "coupon" | "giftcard" | "all",
  }>({
    search: "",
    active: "all",
    type: "all",
  });
  const { data, isLoading } = api.coupons.getCoupons.useQuery({
    page: pagination.pageIndex + 1,
    limit: 10,
    filter,
  });
  return (
    <div>
      <h1 className="text-2xl font-bold">Coupons</h1>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        actionsBar={(
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <UpsertCouponForm className="w-full md:w-fit" />
            <DebouncedInput
              className="w-full md:w-1/3"
              type="text"
              placeholder="Search"
              startContent={<Search />}
              endContent={isLoading && <Spinner size={24} />}
              defaultValue={filter.search}
              debounceMs={500}
              onDebouncedChange={(value) => setFilter({ ...filter, search: value })}
            />
            <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value as "coupon" | "giftcard" | "all" })}>
              <SelectTrigger className="w-full md:w-56 h-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coupons & Gift Cards</SelectItem>
                <SelectItem value="coupon">Coupons</SelectItem>
                <SelectItem value="giftcard">Gift Cards</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter.active} onValueChange={(value) => setFilter({ ...filter, active: value as "true" | "false" | "all" })}>
              <SelectTrigger className="w-full md:w-fit h-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        paginationData={{
          rowCount: data?.rowCount ?? 0,
          state: [pagination, setPagination],
        }}
        loading={isLoading}
      />
    </div>
  )
}