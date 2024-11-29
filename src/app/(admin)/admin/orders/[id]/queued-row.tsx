import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { TableCell, TableRow } from "@/components/ui/table";
import { QueuedCommand, Server } from "@/types";
import { CheckIcon } from "lucide-react";
import { api } from "@/trpc/react";

export const QueuedRow = ({ command, servers, orderId }: { command: QueuedCommand, servers: Server[], orderId: string }) => {
  const utils = api.useUtils();
  const deleteCommandFromQueue = api.orders.deleteCommandFromQueue.useMutation({
    onSuccess: () => {
      utils.orders.getQueuedCommands.invalidate({ id: orderId });
    },
  });

  return (
    <TableRow key={command.id}>
      <TableCell><span className="text-gray-500">{"/ "}</span>{command.payload}</TableCell>
      <TableCell>{servers?.find((server) => server.id === command.server)?.name ?? command.server}</TableCell>
      <TableCell>{command.requireOnline ? <CheckIcon className="h-4 w-4" /> : <Cross2Icon className="h-4 w-4" />}</TableCell>
      <TableCell>
        <Button variant="destructive" className="w-fit" onClick={() => {
          deleteCommandFromQueue.mutateAsync({ id: command.id });
        }} loading={deleteCommandFromQueue.isPending} disableLoadingText>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}