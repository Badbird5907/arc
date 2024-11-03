"use client";

import { SetProductCategoryDropdown } from "@/components/admin/products/set-category";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { categoryData } from "@/trpc/schema/products";
import { type Category } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

const formSchema = categoryData;
export const EditCategory = ({ category }: { category: Category }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...category,
    }
  });

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.formState.isDirty]);
  const [isPending, startTransition] = useTransition();
  const utils = api.useUtils();
  const modifyCategory = api.categories.modifyCategory.useMutation({
    onSuccess: () => Promise.all([
      utils.categories.getCategory.invalidate(),
      utils.categories.getCategoryTree.invalidate(),
      utils.categories.getProductsAndCategoryTree.invalidate(),
    ]).then(() => {
      form.reset(form.getValues(), { keepValues: true })
    })
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      await modifyCategory.mutateAsync({
        id: category.id,
        data: values
      }).then(() => {
        toast.success("Category Updated", {
          description: "Your category has been updated successfully!",
        });
      }).catch((e) => {
        toast.error("Error", {
          description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
        });
      })
    })
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Category Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input className="w-full" placeholder="Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input className="w-full" placeholder="url-friendly-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      Alphanumeric url-friendly characters only.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <FormField
                control={form.control}
                name="parentCategoryId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Parent Category</FormLabel>
                    <FormControl>
                      <SetProductCategoryDropdown
                        product={null}
                        allowMoreNested={false}
                        setParent={(id) => field.onChange(id)}
                        defaultParentName={category.parentCategoryId}
                      />
                    </FormControl>
                  </FormItem>
                )} />
              <FormField
                control={form.control}
                name="sortPriority"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Sort Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Higher priority shows first. May not be implemented in all views.
                    </FormDescription>
                  </FormItem>
                )} />
            </div>
            {/*<FormField
              control={form.control}
              name="hidden"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hidden</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="ml-4"
                    />
                  </FormControl>
                </FormItem>
              )} />*/}
            {!category.parentCategoryId && (
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="ml-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" loading={isPending}>Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}