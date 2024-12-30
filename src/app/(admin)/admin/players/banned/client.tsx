"use client";

import { BanDialog } from "@/app/(admin)/admin/players/banned/ban-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { api } from "@/trpc/react";
import { type Player } from "@/types";
import { type PlayerInfo } from "@badbird5907/mc-utils";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type BannedPlayer = Player & { player: PlayerInfo | null | undefined };
const bannedPlayersColumns: ColumnDef<BannedPlayer>[] = [
  {
    header: "Player Name",
    accessorKey: "player.name",
    cell: ({ row }) => row.original.player?.name ?? "Unknown",
  },
  {
    header: "Banned At",
    accessorKey: "banned",
    cell: ({ row }) => row.original.banned ? format(row.original.banned, "PP hh:mm aa zzz") : "Never",
  },
  {
    header: "Notes",
    accessorKey: "notes",
    cell: ({ row }) => {
      const val = row.original.notes?.replace(/\n/g, " ") ?? "None";
      if (val.length > 50) {
        return `${val.slice(0, 50)}...`;
      }
      return val;
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Link href={`/admin/players/find/${row.original.uuid}`}>
          <Button variant="outline">
            <Eye />
          </Button>
        </Link>
      )
    }
  }
]

export const BannedPlayersClient = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = api.players.getBannedPlayers.useQuery({
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
    withPlayer: true,
  });
  const typedData = data as {
    count: number;
    players: (Player & { player: PlayerInfo | null | undefined })[];
    playerMap: Map<string, PlayerInfo | null | undefined>;
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">Banned Players</h1>
      <DataTable
        columns={bannedPlayersColumns}
        data={typedData?.players ?? []}
        loading={isLoading}
        allowColumnSelection
        actionsBar={
          <div className="flex flex-col md:flex-row w-full items-center gap-2 pr-2">
            <BanDialog />
          </div>
        }
        paginationData={{
          rowCount: typedData?.count ?? 0,
          state: [pagination, setPagination],
        }}
      />
    </div>
  )
}