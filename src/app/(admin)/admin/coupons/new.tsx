"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCouponForm } from "@/trpc/schema/coupons";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { customAlphabet } from "nanoid";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Pencil, Plus, X } from "lucide-react";
import { Dialog, DialogDescription, DialogTitle, DialogHeader, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Coupon } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePickerBar } from "@/components/ui/time-picker/time";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { DialogClose } from "@radix-ui/react-dialog";

const defaultId = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);

export const UpsertCouponForm = ({ coupon, className }: { coupon?: Coupon, className?: string }) => {
  const form = useForm<z.infer<typeof createCouponForm>>({
    resolver: zodResolver(createCouponForm),
    defaultValues: {
      code: defaultId(10),
      type: "coupon",
      discountType: "amount",
      discountValue: 0,
      minOrderAmount: -1,
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
      await utils.coupons.getCoupons.invalidate();
    }
  });
  const modifyCoupon = api.coupons.modifyCoupon.useMutation({
    onSettled: async () => {
      await utils.coupons.getCoupon.invalidate();
    }
  });

  const onSubmit = async (values: z.infer<typeof createCouponForm>) => {
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
      <DialogContent className="w-full max-w-3xl">
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
              <FormField
                control={form.control}
                name="maxDiscountAmount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Max Discount Amount</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Starts At</FormLabel>
                      <FormControl>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger asChild className="w-full">
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PP hh:mm aa")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-[250px] p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <TimePickerBar
                                setDate={field.onChange}
                                date={field.value}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Expires At</FormLabel>
                      <FormControl>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger asChild className="w-full">
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PP hh:mm aa")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <div className="ml-auto text-muted-foreground hover:text-white hover:cursor-pointer rounded-md border border-transparent hover:border-border p-1 transition-all duration-150"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    field.onChange(null);
                                  }}
                                >
                                  <X size={16} />
                                </div>
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-[250px] p-0">
                            <Calendar
                              mode="single"
                              selected={field.value ?? undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              <TimePickerBar
                                setDate={field.onChange}
                                date={field.value ?? undefined}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Open unsupported settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Unsupported Settings</DialogTitle>
                  <DialogDescription>
                    <span>These settings are not reliable due to technical limitations with tebex.</span>
                    <span>Please do not rely on these limits, as they are vulnerable to abuse.</span>
                  </DialogDescription>
                  <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Max Uses</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-row gap-2 w-full">
                    <FormField
                      control={form.control}
                      name="maxGlobalTotalDiscount"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Max Global Total Discount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availableGlobalTotalDiscount"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Available Global Total Discount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
              <Button type="submit" className="w-full mt-2" loading={isPending}>
                {!coupon ? "Create" : "Save"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 