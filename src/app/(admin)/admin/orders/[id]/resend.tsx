import { Button } from "@/components/ui/button"

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import { type deliveryWhen } from "@/types";
import { RefreshCcwIcon } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";

export const ResendCommandsDialog = ({ id, hasSubscription }: { id: string, hasSubscription: boolean }) => {
  const utils = api.useUtils();
  const requeueCommands = api.orders.requeueCommands.useMutation({
    onSuccess: async () => {
      await utils.orders.getQueuedCommands.invalidate({ id });
    },
  });
  const [when, setWhen] = useState<(typeof deliveryWhen)[number]>("purchase");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-fit">
          <RefreshCcwIcon className="h-4 w-4" />
          Resend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resend Commands</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <span className="space-y-2 flex flex-col">
            <span>This will clear the current queue and requeue the commands for the selected trigger.</span>
            {hasSubscription && <span>Selecting purchase will also queue a renew command for the subscriptions.</span>}
          </span>
        </DialogDescription>
        <div className="flex flex-col gap-4">
          {when === "chargeback" && (
            <p className="text-sm text-red-500">
              This will also queue the global chargeback commands.
            </p>
          )}
          <Select value={when} onValueChange={(value) => setWhen(value as typeof deliveryWhen[number])} defaultValue="purchase">
            <SelectTrigger>
              <SelectValue placeholder="Trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase">Purchase</SelectItem>
              {hasSubscription && (
                <>
                  <SelectItem value="renew">Renew</SelectItem>
                  <SelectItem value="expire">Expire</SelectItem>
                </>
              )}
              <SelectItem value="chargeback">Chargeback</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={() => requeueCommands.mutateAsync({ id, type: when }).then(() => {
            toast.success("Commands queued!");
            setOpen(false);
            setWhen("purchase"); // reset when state
          })} loading={requeueCommands.isPending}>
            Resend
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}