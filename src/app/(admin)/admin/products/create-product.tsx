"use client";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { SetProductCategoryDropdown } from "@/components/admin/products/set-category";

const formSchema = z.object({
  name: z.string(),
  price: z.coerce.number().min(0, "Price must be positive"),
  hidden: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
})
export const CreateProductButton = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      hidden: true,
      categoryId: null,
    }
  });
  const createProduct = api.products.createProduct.useMutation();
  const [isPending, startTransition] = useTransition();
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      await createProduct.mutateAsync(data).then((data) => {
        form.reset();
        toast.success("Product Created", {
          description: "Your product has been created successfully!",
        });
        const row = data[0];
        if (row?.id) {
          window.location.href = `/admin/products/${row.id}`;
        }
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
        <Button className="w-full md:w-fit">
          <Plus />
          Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="A Product Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your product name
                    </FormDescription>
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="price"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        startContent="$"
                        endContent="USD"
                        type="number"
                        step="0.01"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription className={fieldState.error && "text-red-500"}>
                      This is your product price
                      {fieldState.error && ` - ${fieldState.error.message}`}
                    </FormDescription>
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SetProductCategoryDropdown
                        product={null}
                        setParent={(id) => field.onChange(id)}
                      />
                    </FormControl>
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="hidden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hidden</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="float-right"
                      />
                    </FormControl>
                  </FormItem>
                )} />
              <Button type="submit" loading={isPending}>
                Create Product
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}