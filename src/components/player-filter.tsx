"use client";

import { type PlayerInfo } from "@badbird5907/mc-utils";
import { PlayerSelectForm } from "@/components/player-select-form";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { User, X } from "lucide-react";
import { useState } from "react";

export const PlayerFilter = ({ className, onSelect, playerUuid }: { className?: string; onSelect: (player: PlayerInfo | null) => void; playerUuid?: string }) => {
  const [edition, setEdition] = useState<"java" | "bedrock" | null>(null);
  const [open, setOpen] = useState(false);

  const { data: player, isLoading } = api.players.fetchPlayerByUuid.useQuery(
    { uuid: playerUuid ?? "" },
    { enabled: !!playerUuid }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={cn("hover:cursor-text rounded-md flex items-center h-10 w-full px-3 py-2 text-sm bg-transparent file:border-0 file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border border-transparent focus-within:outline-none aria-invalid:ring-1 aria-invalid:ring-destructive aria-invalid:focus-within:ring-2 aria-invalid:focus-within:ring-destructive border-borde focus-within:border-primary focus-within:shadow-[0_0px_0px_1px_hsl(var(--primary))] aria-invalid:border-transparent", className)}>
          <span className="pointer-events-none flex items-center text-muted-foreground">
            <User size={16} />
          </span>
          <span className={cn(
            "pl-1.5 bg-transparent outline-none focus-visible:outline-none",
            !playerUuid ? "text-gray-400" : "text-white"
          )}>
            {playerUuid ? (isLoading ? "Loading..." : player?.data?.name ?? "Loading...") : "Player"}
          </span>
          {playerUuid && (
            <button className="ml-auto text-muted-foreground hover:text-white hover:cursor-pointer rounded-md border border-transparent hover:border-border p-1 transition-all duration-150"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setOpen(false);
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Player Filter</DialogTitle>
          <PlayerSelectForm editionState={[edition, setEdition]} onSelect={(player) => {
            onSelect(player);
            setOpen(false);
          }} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}