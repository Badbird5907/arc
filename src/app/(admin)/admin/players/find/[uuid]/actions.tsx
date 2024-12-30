"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gavel } from "lucide-react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { EditNotes } from "@/components/notes";
import { api } from "@/trpc/react";
import { useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogFooter, DialogDescription, DialogTitle, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose } from "@radix-ui/react-dialog";
import { format } from "date-fns";

export const PlayerActions = ({ uuid }: { uuid: string }) => {
  const player = api.players.getPlayerDetails.useQuery({ uuid });
  const utils = api.useUtils();
  const setPlayerDetails = api.players.setPlayerDetails.useMutation({
    onSettled: async () => {
      await utils.players.getPlayerDetails.invalidate({ uuid });
    }
  });
  const [reason, setReason] = useState("");
  const [banPending, beginBanTransition] = useTransition();

  return (
    <>
      <Card className="w-full h-fit">
        <CardHeader>
          <CardTitle>
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {player.isLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="w-full h-10 rounded-md" />
              <Skeleton className="w-full h-10 rounded-md" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {!!player.data?.banned ? (
                  <Button variant="destructive" className="w-full" onClick={() => beginBanTransition(async () => {
                    await setPlayerDetails.mutateAsync({ uuid, details: { banned: false } });
                    window.location.reload();
                  })} loading={banPending}>
                    <Gavel /> Unban
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Gavel /> {player.data?.banned ? "Unban" : "Ban"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ban player?</DialogTitle>
                      </DialogHeader>
                      <DialogDescription>
                        Are you sure you want to ban this player?
                      </DialogDescription>
                      <Textarea
                        placeholder="Reason for ban"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button variant="destructive" onClick={() => beginBanTransition(async () => {
                          await setPlayerDetails.mutateAsync({
                            uuid,
                            details: {
                              banned: true,
                              notes: `${player.data?.notes ?? ""}\nBanned for ${reason || "[No Reason]"} at ${format(new Date(), "PP hh:mm aa zzz")}`
                            }
                          });
                          window.location.reload();
                        })} loading={banPending} className="w-full">Ban</Button>
                        <DialogClose asChild>
                          <Button variant="outline" className="w-full">Cancel</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Link href={`/admin/orders?playerUuid=${uuid}`} className="w-full" target="_blank">
                  <Button variant="outline" className="w-full">
                    <ExternalLink /> View Orders
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {player.isLoading ? (
        <Card className="w-full h-fit">
          <CardHeader>
            <CardTitle>
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-48 rounded-md" />
          </CardContent>
        </Card>
      ) :
        <EditNotes content={player.data?.notes ?? ""} updateNotes={async (notes) => {
          await setPlayerDetails.mutateAsync({ uuid, details: { notes } });
        }} />
      }
    </>
  )
}