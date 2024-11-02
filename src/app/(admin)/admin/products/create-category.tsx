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
import { type z } from "zod";
import { api } from "@/trpc/react";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { SetProductCategoryDropdown } from "@/components/admin/products/set-category";
import { categoryData } from "@/trpc/schema/products";
import { Switch } from "@/components/ui/switch";

const formSchema = categoryData;
export const CreateCategoryButton = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      parentCategoryId: null,
      hidden: false,
    }
  });
  const utils = api.useUtils();
  const createCategory = api.products.createCategory.useMutation({
    onSuccess: () => Promise.all([
      utils.products.getCategories.invalidate(),
      utils.products.getCategoryTree.invalidate(),
      utils.products.getProductsAndCategoryTree.invalidate(),
    ])
  });

  const [isPending, startTransition] = useTransition();
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(() => {
      createCategory.mutateAsync(data).then(() => {
        form.reset();
        toast.success("Category Created", {
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
        <Button variant={"outline"} className="w-full md:w-fit">
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
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="url-friendly-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alphanumeric url-friendly characters only.
                    </FormDescription>
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="parentCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <SetProductCategoryDropdown
                        product={null}
                        allowMoreNested={false}
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