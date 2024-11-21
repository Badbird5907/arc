"use client";

import { DeleteServerButton } from "@/app/(admin)/admin/servers/delete";
import { ModifyServerButton } from "@/app/(admin)/admin/servers/edit";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { type Server } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";

export const ServersClient = () => {
  const { data: servers } = api.servers.getServers.useQuery();
  const columns: ColumnDef<Server>[] = [
    { header: "id", accessorKey: "id" },
    { header: "Name", accessorKey: "name" },
    { header: "Notes", accessorKey: "notes" },
    {
      header: "Last Modified",
      cell: ({ row }) => {
        return new Date(row.original.lastModified).toLocaleString();
      }
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <ModifyServerButton server={row.original} allServers={servers ?? []} />
            <DeleteServerButton server={row.original} />
          </div>
        );
      }
    }
  ]
  return (
    <DataTable columns={columns} data={servers ?? []} actionsBar={(
      <ModifyServerButton allServers={servers ?? []} />
    )} />
  )
}