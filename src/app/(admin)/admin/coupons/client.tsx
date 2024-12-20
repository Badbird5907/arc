"use client";

import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { Coupon } from "@/types";
import { Pencil, Search } from "lucide-react";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { DebouncedInput } from "@/components/debounced-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UpsertCouponForm } from "@/app/(admin)/admin/coupons/new";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const columns: ColumnDef<Coupon>[] = [
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
      const { enabled } = row.original;
      return <span>
        {enabled ? (
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
    active: boolean,
    type: "coupon" | "giftcard" | "all",
  }>({
    search: "",
    active: true,
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
            <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value as "coupon" | "giftcard" | "all" })}>
              <SelectTrigger className="w-full md:w-1/12 h-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="coupon">Coupon</SelectItem>
                <SelectItem value="giftcard">Gift Card</SelectItem>
              </SelectContent>
            </Select>
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
          </div>
        )}
        paginationData={{
          rowCount: data?.rowCount ?? 0,
          state: [pagination, setPagination],
        }}
      />
    </div>
  )
}