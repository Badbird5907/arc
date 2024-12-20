"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { modifyCouponForm } from "@/trpc/schema/coupons";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { customAlphabet } from "nanoid";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus } from "lucide-react";
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Coupon } from "@/types";
import { E } from "node_modules/@upstash/redis/zmscore-Dc6Llqgr.mjs";

const defaultId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);

export const UpsertCouponForm = ({ coupon, className }: { coupon?: Coupon, className?: string }) => {
  const form = useForm<z.infer<typeof modifyCouponForm>>({
    resolver: zodResolver(modifyCouponForm),
    defaultValues: {
      code: defaultId(10),
      type: "coupon",
      discountType: "amount",
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscountAmount: -1,
      maxUses: -1,
      notes: "",

      ...coupon,
      startsAt: coupon?.startsAt ? new Date(coupon.startsAt) : new Date(),
      expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt) : undefined,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const createCoupon = api.coupons.createCoupon.useMutation({
    onSettled: async () => {
      await utils.coupons.getCoupon.invalidate();
    }
  });
  const modifyCoupon = api.coupons.modifyCoupon.useMutation({
    onSettled: async () => {
      await utils.coupons.getCoupon.invalidate();
    }
  });

  const onSubmit = async (values: z.infer<typeof modifyCouponForm>) => {
    startTransition(async () => {
      if (coupon) {
        await modifyCoupon.mutateAsync({ id: coupon.id, form: values });
      } else {
        await createCoupon.mutateAsync(values);
      }
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          {!coupon ? (
            <>
              <Plus /> Create
            </>
          ) : (
            <>
              <Pencil /> Edit
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{!coupon ? "Create Coupon" : "Edit Coupon"}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {coupon ? "Edit a coupon to give to your customers." : "Create a new coupon to give to your customers."} (-1 = Unlimited)
        </DialogDescription>
        <div className="flex flex-col gap-2">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coupon">Coupon</SelectItem>
                          <SelectItem value="giftcard">Gift Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-row gap-2 w-full">
                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Discount Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="minOrderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Order Amount</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-row gap-2 w-full">
                <FormField
                  control={form.control}
                  name="maxDiscountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Discount Amount</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" loading={isPending}>
                {!coupon ? "Create" : "Save"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 