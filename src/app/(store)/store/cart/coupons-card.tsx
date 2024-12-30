"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/trpc/react";
import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart";
import { useShallow } from "zustand/react/shallow";

export const CouponsInput = () => {
  const { coupons, items: cart, player, addCoupon, removeCoupon } = useCart(
    useShallow(s => ({
      coupons: s.coupons,
      items: s.items,
      player: s.player,
      addCoupon: s.addCoupon,
      removeCoupon: s.removeCoupon
   }))
  )
  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="flex flex-wrap flex-row gap-2">
        {Object.entries(coupons).map(([code, id]) => {
          return (
            <Badge key={id} className="flex flex-row items-center gap-2 w-fit">
              <X onClick={() => removeCoupon(code)} className="ml-auto duration-300 hover:text-red-500 cursor-pointer" />
              {code}
            </Badge>
          )
        })}
      </div>
      <div className="flex flex-row items-center gap-2">
        <Input placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
        <Button disabled={!couponCode} onClick={() => {
          startTransition(async () => {
            if (!player) {
              toast.error("Player not found!");
              return;
            }
            const result = await queryClient.coupons.checkCoupons.query({
              cart: Object.entries(cart).map(([id, { quantity }]) => ({
                id,
                quantity
              })),
              coupons: [...Object.keys(coupons), couponCode],
              playerUuid: player.uuid
            });
            if ("success" in result && !result.success) {
              const { invalidCoupons } = result;
              if (invalidCoupons.length === 1 && invalidCoupons.includes(couponCode)) {
                toast.error("This coupon is not valid!");
                return;
              }
              toast.error(result.error);
              return;
            }
            if (!("status" in result)) {
              toast.error("An error occurred while applying the coupon!");
              return;
            }
            const error = result.status.find(s => !s.success)?.error;
            if (error) {
              toast.error(error);
              return;
            }
            toast.success("Coupon applied successfully!");
            addCoupon(couponCode);
            setCouponCode("");
          });
        }} loading={isPending} disableLoadingText><Plus /></Button>
      </div>
    </>
  )
}