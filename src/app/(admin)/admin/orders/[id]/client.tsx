"use client";

import { EditNotes } from "@/app/(admin)/admin/orders/[id]/notes";
import { QueuedRow } from "@/app/(admin)/admin/orders/[id]/queued-row";
import { ResendCommandsDialog } from "@/app/(admin)/admin/orders/[id]/resend";
import { StatusBadge } from "@/app/(admin)/admin/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { Cross2Icon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { CheckIcon, LinkIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

export const OrderClient = ({ id }: { id: string }) => {
  const { data, isLoading } = api.orders.getOrder.useQuery({ id, withPlayer: true });
  const productIds = useMemo(() => data?.items.map((item) => item.productId) ?? [], [data?.items]);
  const utils = api.useUtils();
  const { data: products } = api.products.getProductsByIds.useQuery({ ids: productIds });
  const { data: commands, isLoading: commandsLoading } = api.orders.getQueuedCommands.useQuery({ id });
  const { data: servers } = api.servers.getServers.useQuery();

  const clearQueue = api.orders.clearQueue.useMutation({
    onSuccess: () => {
      utils.orders.getQueuedCommands.invalidate({ id });
    },
  });
  const queuedCommands = useMemo(() => {
    if (!commands) return {
      queued: [],
      executed: [],
    };
    return {
      queued: commands.filter((command) => !command.executed),
      executed: commands.filter((command) => command.executed),
    };
  }, [commands]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    )
  }
  if (!data) {
    return notFound();
  }
  const playerName = (data as { player?: { name: string } }).player?.name ?? data.playerUuid;
  const paymentUrl = data.provider === "tebex" ? `https://creator.tebex.io/payments?attribute%5B0%5D=txn_id&query%5B0%5D=${data.providerOrderId}&search_mode=and` : "#";
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex gap-4 pt-4">
          <h1 className="text-2xl font-bold">Payment of ${data.subtotal.toFixed(2)} from {playerName}</h1>
        </div>
        <div className="flex gap-4">
          <p className="text-md text-muted-foreground">Received {new Date(data.createdAt).toLocaleString()}</p>
          <StatusBadge status={data.status} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-4 w-full">
          <Card className="w-full h-fit">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">Player</TableCell>
                    <TableCell>{playerName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">Email</TableCell>
                    <TableCell>{data.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">UUID</TableCell>
                    <TableCell>{data.playerUuid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">Full Name</TableCell>
                    <TableCell>{data.firstName} {data.lastName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">IP</TableCell>
                    <TableCell>{data.ipAddress ?? "Unknown"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">Status</TableCell>
                    <TableCell><StatusBadge status={data.status} /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">Provider</TableCell>
                    <TableCell>
                      <span className="flex flex-row gap-2 items-center">
                        {data.provider}
                        <Link href={paymentUrl} target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                          <LinkIcon className="h-4 w-4" />
                        </Link>
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-primary-foreground/60">Subtotal</TableCell>
                    <TableCell>
                      <span>
                        ${data.subtotal.toFixed(2)}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="text-muted-foreground hover:text-foreground transition-colors ml-2">
                            <QuestionMarkCircledIcon className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Subtotal</DialogTitle>
                          </DialogHeader>
                          <DialogDescription>
                            <span>
                              The subtotal is the sum of the prices of all the items in the order.
                              It does not include tax.
                            </span>
                            {" "}
                            <Link href={paymentUrl} target="_blank" className="text-blue-500 hover:text-blue-600 transition-colors">
                              {data.provider === "tebex" ? "Please refer to the Tebex payment page for more details." : "Please refer to the payment provider for more details."}
                            </Link>
                          </DialogDescription>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button>Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="w-full h-fit">
            <CardHeader>
              <CardTitle className="w-full flex flex-col justify-between gap-2">
                <span className="block md:hidden">Command Queue</span>
                <div className="flex flex-row gap-2 justify-between">
                  <span className="hidden md:block content-center">Command Queue</span>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-fit">
                    <ResendCommandsDialog id={id} hasSubscription={data.items.some((item) => products?.find((p) => p.id === item.productId)?.type === "subscription")} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full md:w-fit">
                          <TrashIcon className="h-4 w-4" />
                          Clear
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clear Queue</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                          <span>This will clear all queued commands! Are you sure you want to do this?</span>
                        </DialogDescription>
                        <DialogFooter>
                          <div className="flex flex-col gap-2 w-full">
                            <DialogClose asChild>
                              <Button variant="destructive" className="w-full" onClick={() => {
                                clearQueue.mutateAsync({ id }).then(() => {
                                  toast.success("Queue cleared!");
                                });
                              }} loading={clearQueue.isPending}>
                                <TrashIcon className="h-4 w-4" />
                                Clear
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Command</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Requires Online</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commandsLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <Spinner />
                      </TableCell>
                    </TableRow>
                  ) : (
                    queuedCommands.queued.length ? (
                      queuedCommands.queued.map((command) => (
                        <QueuedRow key={command.id} command={command} servers={servers ?? []} orderId={id} />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No queued commands</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="w-full h-fit">
            <CardHeader>
              <CardTitle>Executed Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Command</TableHead>
                    <TableHead>Server</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commandsLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <Spinner />
                      </TableCell>
                    </TableRow>
                  ) : (
                    queuedCommands.executed.length ? (
                      queuedCommands.executed.map((command) => (
                        <TableRow key={command.id}>
                          <TableCell><span className="text-gray-500">{"/ "}</span>{command.payload}</TableCell>
                          <TableCell>{servers?.find((server) => server.id === command.server)?.name ?? command.server}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">No executed commands</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data.items || !products ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((item) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>{product?.name}</TableCell>
                          <TableCell>${product?.price?.toFixed(2) ?? '0.00'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${(product?.price ?? 0 * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Coupons & Gift Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* demo stuff for now */}
                  <TableRow>
                    <TableCell>TESTCODE</TableCell>
                    <TableCell>Percentage</TableCell>
                    <TableCell>10%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TESTCODE2</TableCell>
                    <TableCell>Fixed Amount</TableCell>
                    <TableCell>$5</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TESTCODE3</TableCell>
                    <TableCell>Gift Card</TableCell>
                    <TableCell>$15</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <EditNotes id={id} content={data.metadata.notes as string ?? ""} />
        </div>
      </div>
    </div>
  )
}