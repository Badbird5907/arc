"use client";

import { ordersColumns } from "@/app/(admin)/admin/orders/data-table";
import { DebouncedInput } from "@/components/debounced-input";
import { PlayerFilter } from "@/components/player-filter";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from "@/components/ui/select";
import { orderStatus } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { ordersFilter } from "@/trpc/schema/orders";
import { type PaginationState } from "@tanstack/react-table";
import { Mail, Search, Tag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { type z } from "zod";

const loadFiltersFromUrl = (params: URLSearchParams): z.infer<typeof ordersFilter> => {
  const playerUuid = params.get("playerUuid") as string | undefined;
  const email = params.get("email") as string | undefined;
  const name = params.get("name") as string | undefined;
  const status = params.get("status") as typeof orderStatus[number] | "all" | undefined;
  const coupons = params.get("coupons")?.split(",") ?? [];
  const filter = { playerUuid, email, name, status, coupons };
  return cleanFilter(filter);
}
const cleanFilter = (filter: z.infer<typeof ordersFilter>) => {
  return Object.fromEntries(
    Object.entries(filter).filter(([_, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0 && value[0] !== "";
      }
      return value !== "" && value !== undefined && value !== null;
    })
  );
}
const setFiltersToUrl = (filters: z.infer<typeof ordersFilter>) => {
  const url = new URL(window.location.href);
  const set = (key: keyof typeof filters, value: string | string[]) => {
    const str = Array.isArray(value) ? value.join(",") : value;
    if (str) {
      url.searchParams.set(key, str);
    } else {
      url.searchParams.delete(key);
    }
  }
  
  Object.keys(ordersFilter.shape).forEach(key => {
    url.searchParams.delete(key);
  });

  Object.entries(filters).forEach(([key, value]) => { // set the ones that have values
    set(key as keyof typeof filters, value);
  });

  window.history.pushState({}, "", url.toString());
}
export const OrdersClient = ({ initialFilter }: { initialFilter?: z.infer<typeof ordersFilter> }) => {
  const searchParams = useSearchParams();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const [filter, _setFilter] = useState<z.infer<typeof ordersFilter>>(initialFilter ?? loadFiltersFromUrl(searchParams));

  const setFilter = (newFilter: z.infer<typeof ordersFilter>) => {
    const clean = cleanFilter(newFilter);
    _setFilter(clean);
    setFiltersToUrl(clean);
  }

  const { data, isLoading } = api.orders.getOrders.useQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    withPlayers: true,
    filter,
  })
  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">Orders</h1>
      <DataTable
        columns={ordersColumns}
        data={data?.data ?? []}
        loading={isLoading}
        actionsBar={
          <div className="flex flex-col md:flex-row w-full items-center gap-2 pr-2">
            <PlayerFilter className="w-full md:w-1/3" onSelect={(player) => {
              if (player) {
                setFilter({ ...filter, playerUuid: player.uuid });
              } else {
                setFilter({ ...filter, playerUuid: undefined });
              }
            }} playerUuid={filter.playerUuid} />
            <DebouncedInput
              className="w-full md:w-1/3"
              type="text"
              placeholder="Real Name"
              startContent={<Search size={16} />}
              defaultValue={filter.name}
              debounceMs={500}
              onDebouncedChange={(value) => setFilter({ ...filter, name: value })}
            />
            <DebouncedInput
              className="w-full md:w-1/3"
              type="text"
              placeholder="Email"
              startContent={<Mail size={16} />}
              defaultValue={filter.email}
              debounceMs={500}
              onDebouncedChange={(value) => setFilter({ ...filter, email: value })}
            />
            <DebouncedInput
              className="w-full md:w-1/3"
              type="text"
              placeholder="Coupon Code"
              startContent={<Tag size={16} />}
              defaultValue={filter.coupons?.join(",")}
              debounceMs={500}
              onDebouncedChange={(value) => setFilter({ ...filter, coupons: value.split(",") })}
            />
            <Select value={filter.status ?? "completed"} onValueChange={(value) => {
              setFilter({ ...filter, status: value as typeof orderStatus[number] });
            }}>
              <SelectTrigger className="w-full md:w-1/3 h-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatus.map((status) => (
                  <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                ))}
                <SelectItem value={"all"}>All</SelectItem>
              </SelectContent>
            </Select>
            {/* TODO: Player uuid filter */}
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