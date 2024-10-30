"use client";
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { z } from "zod";
import { api } from "@/trpc/react";
import React, { useTransition } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string(),
})
export const CreateCategoryButton = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    }
  });
  const createProduct = api.products.createCategory.useMutation();
  const [isPending, startTransition] = useTransition();
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    startTransition(() => {
      createProduct.mutateAsync(data).then(() => {
        form.reset();
        toast.success("Product Created", {
          description: "The category been created successfully!",
        });
      }).catch((e) => {
        toast.error("Error", {
          description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
        })
      })
    })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Plus />
          Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category Name" {...field} />
                    </FormControl>
                    <FormDescription>
                    </FormDescription>
                  </FormItem>
                )} />
              <DialogClose asChild>
                <Button type="submit" loading={isPending}>
                  Create Category
                </Button>
              </DialogClose>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}