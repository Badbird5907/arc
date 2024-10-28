"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { optionalProductData } from "@/trpc/schema/products";
import { type Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { Suspense, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const EditorComp = dynamic(() => import('@/components/markdown/editor'), { ssr: false });

const basicProductData = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be positive" }),
});

export const EditProductBasic = ({ product, className }: { product: Product; className: string }) => {
  const form = useForm({
    resolver: zodResolver(basicProductData),
    defaultValues: {
      ...product
    }
  });
  
  const [isPending, startTransition] = useTransition();
  const modifyProduct = api.products.modifyProduct.useMutation();

  const onSubmit = (values: z.infer<typeof optionalProductData>) => {
    startTransition(async () => {
      await modifyProduct.mutateAsync({
        id: product.id,
        data: values
      }).then(() => {
        toast.success("Product Updated", {
          description: "Your product has been updated successfully!",
        });
      }).catch((e) => {
        toast.error("Error", {
          description: (e as { message?: string })?.message ?? "An unknown error occurred! Please try again later.",
        })
      })
    })
  }
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-row gap-2 w-full">
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
                name="price"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Price</FormLabel>
                    <Input
                        startContent="$"
                        endContent="USD"
                        type="number"
                        step="0.01"
                        className="w-full"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                  </FormItem>
                )}
              />
            </div>
            <div className="gap-4 max-h-[40vh] h-[40vh]">
              <Suspense fallback={<div>Loading editor <Spinner /></div>}>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) =>
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <div className="border rounded-lg h-[40vh] overflow-y-auto">
                          <EditorComp markdown={field.value ?? ""} onChange={field.onChange} initialMarkdown={product.description ?? ""} className="h-full dark-editor" />
                          {fieldState.error && <div className="text-destructive">{fieldState.error.message}</div>}
                        </div>
                      </FormControl>
                    </FormItem>
                  }
                />
              </Suspense>
            </div>
            <div className="mt-4 w-full">
              <Button className="mt-4 w-full" type="submit" loading={isPending}>Save</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}