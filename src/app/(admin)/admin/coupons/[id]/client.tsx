"use client";

import { ErrorPage } from "@/components/pages/error";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { isCouponValid } from "@/server/helpers/coupons";
import { Button } from "@/components/ui/button";
import { EditNotes } from "@/components/notes";
import { UpsertCouponForm } from "@/app/(admin)/admin/coupons/new";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash } from "lucide-react";

export const CouponsClient = ({ id }: { id: string }) => {
  const { data, isLoading, error } = api.coupons.getCoupon.useQuery({ id });
  const couponValid = useMemo(() => data?.coupon && isCouponValid(data.coupon), [data?.coupon]);
  const updateNotes = api.coupons.updateNotes.useMutation();
  const deleteCoupon = api.coupons.deleteCoupon.useMutation();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorPage code={"500"} />
  if (!data?.coupon) return notFound();
  const { coupon } = data;

  const tableData = [
    { label: "Code", value: coupon.code },
    { label: "Enabled", value: coupon.enabled ? "Yes" : "No" },
    { label: "Type", value: coupon.type === "coupon" ? "Coupon" : "Gift Card" },
    { label: "Discount Type", value: coupon.discountType },
    { label: "Discount Value", value: coupon.discountValue },
    { label: "Min Order Amount", value: coupon.minOrderAmount },
    { label: "Max Discount Amount", value: coupon.maxDiscountAmount < 0 ? "Unlimited" : coupon.maxDiscountAmount },
    { label: "Max Uses", value: coupon.maxUses < 0 ? "Unlimited" : coupon.maxUses },
    { label: "Uses", value: coupon.uses },
    { label: "Max Global Total Discount", value: coupon.maxGlobalTotalDiscount },
    { label: "Available Global Total Discount", value: coupon.availableGlobalTotalDiscount },
    { label: "Expires At", value: coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleString() : "Never" },
    { label: "Created At", value: new Date(coupon.createdAt).toLocaleString() },
  ]
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex gap-4 pt-4">
          <h1 className="text-2xl font-bold">{coupon.type === "coupon" ? "Coupon" : "Gift Card"}: {coupon.code}</h1>
          <Badge variant={couponValid ? "success" : "destructive"} className="h-fit self-center">{couponValid ? "Valid" : "Invalid"}</Badge>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-4 w-full">
          <Card className="w-full h-fit">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="text-primary-foreground/60">{row.label}</TableCell>
                      <TableCell>{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <UpsertCouponForm coupon={coupon} className="w-full" />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="destructive">
                    <Trash /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete {coupon.type === "coupon" ? "Coupon" : "Gift Card"}?</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Are you sure you want to delete this {coupon.type === "coupon" ? "coupon" : "gift card"}? This action cannot be undone.
                  </DialogDescription>
                  <DialogFooter>
                    <Button variant="destructive" onClick={() => deleteCoupon.mutateAsync({ id })} className="w-full">
                      Delete
                    </Button>
                    <DialogClose asChild>
                      <Button className="w-full">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <EditNotes content={coupon.notes ?? ""} updateNotes={(notes) => updateNotes.mutateAsync({ id, notes })} />
        </div>
      </div>
    </div>
  )
}