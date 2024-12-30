"use client";

import { ErrorPage } from "@/components/pages/error";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { notFound, useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { isCouponExpired, isCouponValid } from "@/server/helpers/coupons";
import { Button } from "@/components/ui/button";
import { EditNotes } from "@/components/notes";
import { UpsertCouponForm } from "@/app/(admin)/admin/coupons/new";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Trash, TriangleAlert } from "lucide-react";
import { MiniOrdersList } from "@/components/admin/orders/mini";
import Link from "next/link";
import { ToggleCoupon } from "@/app/(admin)/admin/coupons/[id]/enable";
import { HoverCard, HoverCardContent } from "@/components/ui/hover-card";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
import { EditCouponFilters } from "@/app/(admin)/admin/coupons/[id]/edit-filters";

export const CouponsClient = ({ id }: { id: string }) => {
  const { data, isLoading, error } = api.coupons.getCoupon.useQuery({ id });
  const couponValid = useMemo(() => data?.coupon && isCouponValid(data.coupon), [data?.coupon]);
  const expired = useMemo(() => data?.coupon && isCouponExpired(data.coupon), [data?.coupon]);
  const updateNotes = api.coupons.updateNotes.useMutation();
  const deleteCoupon = api.coupons.deleteCoupon.useMutation();
  const router = useRouter();

  const warning = useMemo(() => {
    return (
      <HoverCard>
        <HoverCardTrigger>
          <TriangleAlert className="h-4 w-4" />
        </HoverCardTrigger>
        <HoverCardContent>
          <p>
            Global limits may not be reliable due to technical limitations with tebex.
            Please do not rely on these limits, as they are vulnerable to abuse.
          </p>
        </HoverCardContent>
      </HoverCard>
    );
  }, []);

  if (isLoading) return <Spinner />;
  if (error) return <ErrorPage code={"500"} />
  if (!data?.coupon) return notFound();
  const { coupon } = data;

  const tableData = [
    { label: "Code", value: coupon.code },
    {
      label: "Enabled", value: (
        coupon.enabled ? (
          <div className="flex flex-row gap-2">
            <Badge variant="success">Enabled</Badge>
            {expired && <span className="text-foreground/60">(Expired)</span>}
          </div>
        ) : <Badge variant="destructive">Disabled</Badge>
      )
    },
    { label: "Type", value: coupon.type === "coupon" ? "Coupon" : "Gift Card" },
    { label: "Discount Type", value: coupon.discountType },
    { label: "Discount Value", value: coupon.discountValue },
    { label: "Min Order Amount", value: coupon.minOrderAmount },
    { label: "Max Discount Amount", value: coupon.maxDiscountAmount < 0 ? "Unlimited" : coupon.maxDiscountAmount },
    { label: "Uses", value: coupon.uses },
    { label: "Max Uses", value: coupon.maxUses < 0 ? "Unlimited" : coupon.maxUses, icon: warning },
    { label: "Max Global Total Discount", value: coupon.maxGlobalTotalDiscount < 0 ? "Unlimited" : coupon.maxGlobalTotalDiscount, icon: warning },
    { label: "Available Global Total Discount", value: coupon.availableGlobalTotalDiscount < 0 ? "Unlimited" : coupon.availableGlobalTotalDiscount, icon: warning },
    {
      label: "Expires At", value: coupon.expiresAt ? (
        <div className="flex flex-row gap-2">
          {expired ? (
            <Badge variant="destructive">Expired</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
          <span className="text-foreground/60">{new Date(coupon.expiresAt).toLocaleString()}</span>
        </div>
      ) : "Never"
    },
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
                      <TableCell className="text-primary-foreground/60">
                        <span className="flex flex-row gap-2">
                          {row.label}{row.icon}
                        </span>
                      </TableCell>
                      <TableCell>{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="w-full flex flex-col justify-between gap-2">
                <span className="block md:hidden">Orders</span>
                <div className="flex flex-row gap-2 justify-between">
                  <span className="hidden md:block content-center">
                    Orders
                    <Badge variant="outline" className="ml-2">
                      {coupon.uses} uses
                    </Badge>
                  </span>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-fit">
                    <Link href={`/admin/orders?coupons=${coupon.code}`} className="w-full md:w-fit">
                      <Button variant="outline" className="w-full md:w-fit">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniOrdersList filter={{ coupons: [coupon.code] }} />
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-row gap-2">
                <UpsertCouponForm coupon={coupon} className="w-full" />
                <EditCouponFilters couponId={coupon.id} />
              </div>
              <ToggleCoupon coupon={coupon} />
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
                    <span className="text-destructive">
                      {" "}This will remove the coupon from all orders!
                    </span>
                  </DialogDescription>
                  <DialogFooter>
                    <Button variant="destructive" onClick={() => deleteCoupon.mutateAsync({ id }).then(() => {
                      router.push("/admin/coupons");
                    })} className="w-full" loading={deleteCoupon.isPending}>
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