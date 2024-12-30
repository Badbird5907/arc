import { PlayerFilter } from "@/components/player-filter"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlayerInfo } from "@badbird5907/mc-utils";
import { useState, useTransition } from "react";
import { Gavel } from "lucide-react"
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { format } from "date-fns";

export const BanDialog = () => {
  const [player, setPlayer] = useState<PlayerInfo | null | undefined>(null);
  const [reason, setReason] = useState<string>("");
  const [pending, beginTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(false);
  const setPlayerDetails = api.players.setPlayerDetails.useMutation();
  const playerDetails = api.players.getPlayerDetails.useQuery({ uuid: player?.uuid ?? "" }, {
    enabled: !!player?.uuid,
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Gavel size={16} />
          Ban Player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban Player</DialogTitle>
        </DialogHeader>
        <PlayerFilter
          className="w-full"
          playerUuid={player?.uuid}
          onSelect={(player) => {
            if (player) {
              setPlayer(player);
            }
          }}
        />
        <Textarea placeholder="Reason for ban" value={reason} onChange={(e) => setReason(e.target.value)} />
        {!!playerDetails.data?.banned && <p className="text-red-500">Player is already banned</p>}
        <Button onClick={() => beginTransition(async () => {
          if (!player || !playerDetails.data) return;
          await setPlayerDetails.mutateAsync({
            uuid: player.uuid,
            details: {
              banned: true,
              notes: `${playerDetails.data.notes}\nBanned for ${reason || "[No Reason]"} at ${format(new Date(), "PP hh:mm aa zzz")}`,
            }
          })
          setOpen(false);
        })} loading={pending} disabled={!player || !playerDetails.data || !!playerDetails.data.banned}>Ban Player</Button>
      </DialogContent>
    </Dialog>
  )
}