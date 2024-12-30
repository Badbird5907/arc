import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { StatusBadge } from "@/app/(admin)/admin/orders/status-badge";
import { type OrderWithPlayer } from "@/types";
import { type Order } from "@/types";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const ordersColumns: ColumnDef<Order>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Player",
    accessorKey: "player.name",
    cell: ({ row }) => (row.original as OrderWithPlayer).player?.name ?? "Unknown",
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
    cell: ({ row }) => `$${(row.original).subtotal.toFixed(2)}`,
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
        <Link href={`/admin/orders/${row.original.id}`} prefetch={false}>
          <Button size="sm">
            <Edit className="h-4 w-4" />
          </Button> 
        </Link>
      </div>
    )
  }
];