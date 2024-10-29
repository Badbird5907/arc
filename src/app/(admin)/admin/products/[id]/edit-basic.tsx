"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { type optionalProductData } from "@/trpc/schema/products";
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
  minQuantity: z.coerce.number().min(1).default(1),
  type: z.enum(["single", "subscription"]).optional(),
  expiryPeriod: z.enum(["day", "month", "year"]).optional(),
  expiryLength: z.coerce.number().min(1).optional(),
});

export const EditProductBasic = ({ product, className }: { product: Product; className: string }) => {
  const form = useForm({
    resolver: zodResolver(basicProductData),
    defaultValues: {
      ...product
    }
  });

  const [isPending, startTransition] = useTransition();
  const utils = api.useUtils();
  const modifyProduct = api.products.modifyProduct.useMutation({
    onSuccess: async () => {
      await utils.products.getProduct.invalidate();
    }
  });

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
            <div className="flex flex-col md:flex-row gap-2 w-full">
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
              <div className="w-full flex flex-col md:flex-row gap-2">
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
                <FormField
                  control={form.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem className="mt-2 md:mt-0">
                      <FormLabel>Minimum Quantity</FormLabel>
                      <Input
                        type="number"
                        step="1"
                        className="w-full"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {form.watch("type") === "subscription" && (

              <Card>
                <CardContent>
                  <CardHeader><CardTitle>Subscription Details</CardTitle></CardHeader>
                  <div className="flex flex-col md:flex-row gap-2 w-full">
                    <FormField
                      control={form.control}
                      name="expiryPeriod"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Expiry Period</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Expiry Period" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="year">Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiryLength"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Expiry Length</FormLabel>
                          <Input
                            type="number"
                            step="1"
                            className="w-full"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
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