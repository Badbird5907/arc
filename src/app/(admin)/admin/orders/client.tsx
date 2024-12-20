"use client";

import { StatusBadge } from "@/app/(admin)/admin/orders/status-badge";
import { DebouncedInput } from "@/components/debounced-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { Order, OrderWithPlayer } from "@/types";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Edit, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const OrdersClient = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState("");
  const { data, isLoading } = api.orders.getOrders.useQuery({
    page: pagination.pageIndex + 1,
    limit: 10,
    withPlayers: true,
    filter: {
      search: filter,
    }
  })
  const columns: ColumnDef<Order>[] = [
    {
      header: "Player",
      accessorKey: "player.name",
      cell: ({ row }) => (row.original as OrderWithPlayer).player?.name ?? "Unknown",
    },
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.status} />
            {row.original.disputed && (
              <HoverCard>
                <HoverCardTrigger>
                  <Badge variant="destructive" rounded={true}>!</Badge>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p>
                    The customer has disputed this order.
                  </p>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
        )
      }
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Provider",
      accessorKey: "provider",
    },
    {
      header: "Subtotal",
      accessorKey: "subtotal",
      cell: ({ row }) => `$${(row.original as Order).subtotal.toFixed(2)}`,
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/orders/${row.original.id}`}>
            <Button size="sm">
              <Edit />
            </Button>
          </Link>
        </div>
      )
    }
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        actionsBar={
          <div className="flex flex-col md:flex-row w-full items-center gap-2">
            <DebouncedInput
              className="w-full md:w-1/3"
              type="text"
              placeholder="Search"
              startContent={<Search />}
              endContent={isLoading && <Spinner size={24} />}
              defaultValue={filter}
              debounceMs={500}
              onDebouncedChange={(value) => setFilter(value)}
            />
          </div>
        }
        paginationData={{
          rowCount: data?.rowCount ?? 0,
          state: [pagination, setPagination],
        }}
      />
    </div>
  )
}