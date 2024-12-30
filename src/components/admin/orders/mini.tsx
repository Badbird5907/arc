"use client";

import { useState } from "react";
import { type PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { ordersColumns } from "@/app/(admin)/admin/orders/data-table";
import { api } from "@/trpc/react";
import { type ordersFilter } from "@/trpc/schema/orders";
import { type z } from "zod";

export const MiniOrdersList = ({ filter }: { filter: z.infer<typeof ordersFilter> }) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = api.orders.getOrders.useQuery({
    page: pagination.pageIndex + 1,
    limit: 10,
    withPlayers: true,
    filter,
  })
  return (
    <DataTable
      columns={ordersColumns}
      data={data?.data ?? []}
      loading={isLoading}
      paginationData={{
        rowCount: data?.rowCount ?? 0,
        state: [pagination, setPagination],
      }}
      hideColumnsDropdown
    />
  )
}