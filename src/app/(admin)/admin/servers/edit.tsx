"use client";

import SecretReveal from "@/components/secret-reveal";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { type Server } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Plus } from "lucide-react"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const zodSchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
})
export const ModifyServerButton = ({ server, allServers }: { server?: Server, allServers: Server[] }) => {
  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: server?.name ?? "",
      notes: server?.notes ?? ""
    },
  });

  const [step, setStep] = useState<"create" | "secret">("create");
  const [secretKey, setSecretKey] = useState<string | undefined>(undefined);

  const utils = api.useUtils();
  const createServer = api.servers.createServer.useMutation({
    onSettled: async () => {
      await utils.servers.getServers.invalidate();
    }
  });
  const updateServer = api.servers.modifyServer.useMutation({
    onSettled: async () => {
      await utils.servers.getServers.invalidate();
    }
  });
  const onSubmit = form.handleSubmit(async (data) => {
    // check duplicate name (also upper/lower case)
    if (allServers.some(s => s.name.toLowerCase() === data.name.toLowerCase())) {
      form.setError("name", { message: "Name must be unique" });
      return;
    }
    if (server) {
      await updateServer.mutateAsync({
        id: server.id,
        ...data
      });
    } else {
      await createServer.mutateAsync(data).then((result) => {
        setSecretKey(result.secretKey);
        setStep("secret");
      });
    }
    form.reset();
  })
  const resetKey = api.servers.resetKey.useMutation()
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => {
      form.reset();
      setStep("create");
      setOpen(o);
    }}>
      <DialogTrigger asChild>
        <Button>
          {server ? (
            <>
              <Edit />
            </>
          ) : (
            <>
              <Plus />
              Create Server
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {server ? "Edit Server" : "Create Server"}
          </DialogTitle>
        </DialogHeader>
        {step === "create" ? (
          <>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Server Name" />
                      </FormControl>
                      {form.formState.errors.name && <p className="text-red-500">{form.formState.errors.name.message}</p>}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Server Notes" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {server && (
                  <Button variant="outline" type="button" onClick={async () => {
                    await resetKey.mutateAsync({ id: server.id }).then((key) => {
                      setSecretKey(key.secretKey)
                      setStep("secret");
                    });
                  }} className="w-full" loading={resetKey.isPending}>
                    Regenerate Secret Key
                  </Button>
                )}
                <Button type="submit" className="w-full" loading={createServer.isPending || updateServer.isPending}>
                  {server ? "Update" : "Create"}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <div className="w-full text-center">
            <h1 className="text-2xl font-bold">Secret Key</h1>
            <p>Here is your secret key, keep it safe!</p>
            <p className="text-sm text-muted-foreground">
              It will never be shown again. You can reset it later.
            </p>
            <div className="w-full border rounded-md mt-4">
              <SecretReveal secret={secretKey ?? "??????"} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}