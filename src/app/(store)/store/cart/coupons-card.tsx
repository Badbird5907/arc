"use client"
import { CartStore, PlayerInfo, useCart } from "@/components/cart"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { queryClient } from "@/trpc/react";
import { Plus, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const CouponsCard = ({ coupons, cart, player, addCoupon, removeCoupon }: {
  coupons: CartStore["coupons"],
  cart: CartStore["items"],
  player: PlayerInfo,
  addCoupon: CartStore["addCoupon"],
  removeCoupon: CartStore["removeCoupon"],
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Coupons & Gift Cards
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-wrap flex-row gap-2">
          {Object.entries(coupons).map(([code, id]) => {
            return (
              <Badge key={code} className="flex flex-row items-center gap-2 w-fit">
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
              const result = await queryClient.coupons.checkCoupons.query({
                cart: Object.entries(cart).map(([id, { quantity }]) => ({
                  id,
                  quantity
                })),
                coupons: [...Object.keys(coupons), couponCode],
                playerUuid: player!.uuid
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
      </CardContent>
    </Card>
  )
}