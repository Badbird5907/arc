"use client";

import { CopyDelivery } from "@/app/(admin)/admin/products/[id]/copy-delivery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getVariableListAction } from "@/server/actions/variables";
import { api } from "@/trpc/react";
import { type Delivery, type ProductWithDeliveries, zodDelivery } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DotsHorizontalIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { InfoIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const DeliveryEditor = ({ 
  initialDeliveries,
  onSubmit,
  isSubscriptionProduct = false,
}: { 
  initialDeliveries: Delivery[];
  onSubmit: (deliveries: Delivery[]) => Promise<void>;
  isProduct?: boolean;
  isSubscriptionProduct?: boolean;
}) => {
  const form = useForm<{ delivery: Delivery[] }>({
    defaultValues: { delivery: initialDeliveries },
    resolver: zodResolver(z.object({
      delivery: z.array(zodDelivery),
    })),
    mode: "onChange",
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "delivery",
  });
  const { data: servers } = api.servers.getServers.useQuery();

  const [variables, setVariables] = useState<{ name: string; description: string; }[]>([]);
  useEffect(() => {
    void getVariableListAction().then(setVariables);
  }, []);

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data.delivery);
      toast.success("Delivery settings saved!");
    } catch (error) {
      toast.error("Failed to save delivery settings!", {
        description: "Have you selected a server scope for all commands?",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="w-full flex flex-col justify-between gap-2">
          <span className="block md:hidden">Delivery</span>
          <div className="flex flex-row gap-2 justify-between">
            <span className="hidden md:block content-center">Delivery</span>
            <div className="flex flex-col md:flex-row gap-2 w-full justify-end">
              {isSubscriptionProduct && (
                <Dialog>
                  <DialogTrigger asChild className="w-full md:w-fit">
                    <Button variant="outline" className="">
                      <QuestionMarkCircledIcon className="w-4 h-4" />
                      Subscriptions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Subscriptions
                      </DialogTitle>
                    </DialogHeader>
                    <span>Use the <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm">On Renew</code> trigger to queue commands when a subscription is renewed. It will also trigger on the initial purchase.</span>
                  </DialogContent>
                </Dialog>
              )}
              <Dialog>
                <DialogTrigger asChild className="w-full md:w-fit">
                  <Button variant="outline" className="">
                    <InfoIcon className="w-4 h-4" />
                    Variables
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Variables
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    <span>A list of variables that can be used in the delivery commands.</span>
                    <span className="flex flex-row gap-2 items-center pt-2">
                      <InfoIcon className="w-4 h-4" />
                      Click on a variable to copy it to the clipboard.
                    </span>
                  </DialogDescription>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variable</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variables?.map((variable) => (
                        <TableRow key={variable.name}>
                          <TableCell>
                            <button className="text-left w-full" onClick={() => {
                              void navigator.clipboard.writeText(`{${variable.name}}`);
                              toast.success("Copied to clipboard!");
                            }}>
                              {"{" + variable.name + "}"}
                            </button>
                          </TableCell>
                          <TableCell>{variable.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DialogContent>
              </Dialog>
              <CopyDelivery setDelivery={(delivery) => {
                form.setValue("delivery", delivery);
              }} />
              <Button type="button" onClick={() => append({ type: "command", value: "", scope: "", when: "purchase", requireOnline: false, delay: 0, global: false })} className="w-full md:w-fit">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-2 w-full">
                  <FormField
                    control={form.control}
                    name={`delivery.${index}.when`}
                    render={({ field }) => (
                      <Select {...field} onValueChange={(value) => field.onChange(value as Delivery["when"])}>
                        <SelectTrigger className="w-full md:w-1/5 h-full">
                          <SelectValue placeholder="When" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">
                            On
                            {isSubscriptionProduct ? " (first) " : " "}
                            Purchase
                          </SelectItem>
                          {isSubscriptionProduct && (
                            <>
                              <SelectItem value="renew">On Renew</SelectItem>
                              <SelectItem value="expire">On Expire</SelectItem>
                            </>
                          )}
                          <SelectItem value="chargeback">On Chargeback</SelectItem>
                          <SelectItem value="refund">On Refund</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`delivery.${index}.type`}
                    render={({ field }) => (
                      <Select {...field} onValueChange={(value) => field.onChange(value as Delivery["type"])}>
                        <SelectTrigger className="w-full md:w-1/6 h-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="command">Command</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`delivery.${index}.value`}
                    render={({ field }) => {
                      const isCommand = form.watch(`delivery.${index}.type`) === "command";
                      return isCommand ? (
                        <Input {...field} placeholder="Command" className="w-full" required startContent="/" />
                      ) : (
                        <Input {...field} placeholder="Value" className="w-full" required />
                      )
                    }}
                  />
                  <FormField
                    control={form.control}
                    name={`delivery.${index}.scope`}
                    render={({ field }) => (
                      <Select {...field} onValueChange={(value) => field.onChange(value)}>
                        <SelectTrigger className="w-full md:w-1/4">
                          <SelectValue placeholder="Server scope" />
                        </SelectTrigger>
                        <SelectContent>
                          {servers?.map((server) => (
                            <SelectItem key={server.id} value={server.id}>{server.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button" className="self-center w-full md:w-fit">
                        <DotsHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Delivery options
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription>
                        <span>Set the delivery options for this command.</span>
                      </DialogDescription>
                      <div className="flex flex-col gap-2">
                        <FormField
                          control={form.control}
                          name={`delivery.${index}.requireOnline`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Require online</FormLabel>
                              <Select {...field} onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Require online" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Yes</SelectItem>
                                  <SelectItem value="false">No</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`delivery.${index}.delay`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delay</FormLabel>
                              <Input {...field} placeholder="Delay" className="w-full" type="number" endContent="Seconds" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" className="w-full">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" type="button" onClick={() => remove(index)} className="self-center hover:bg-red-500 w-full md:w-fit">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex flex-row gap-2">
                <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}

