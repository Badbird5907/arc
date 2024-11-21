"use client";

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { type Server } from "@/types"
import { Trash2 } from "lucide-react"
import { useState } from "react";

export const DeleteServerButton = ({ server }: { server: Server }) => {
  const utils = api.useUtils();
  const deleteServer = api.servers.deleteServer.useMutation({
    onSettled: async () => {
      await utils.servers.getServers.invalidate();
    }
  });
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Server?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this server? This action cannot be undone.
          This will also delete any queued commands for this server.
        </DialogDescription>
        <DialogFooter className="flex-col md:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => deleteServer.mutateAsync({ id: server.id }).then(() => setOpen(false))} loading={deleteServer.isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}