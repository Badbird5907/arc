import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { X } from "lucide-react";
import { Check } from "lucide-react";
import { Coupon } from "@/types";
import { useMemo } from "react";
import { isCouponExpired, isCouponValid } from "@/server/helpers/coupons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const ToggleCoupon = ({ coupon }: { coupon: Coupon }) => {
  const utils = api.useUtils();
  const updateCoupon = api.coupons.modifyCoupon.useMutation({
    onSuccess: async () => {
      await utils.coupons.getCoupon.invalidate({ id: coupon.id });
    }
  });
  const valid = useMemo(() => isCouponValid(coupon), [coupon]);
  const Btn = ({ btnEnabled }: { btnEnabled: boolean }) => {
    return (
      <Button
        className="w-full"
        color={coupon.enabled ? "destructive" : "success"}
        onClick={() => updateCoupon.mutateAsync({ id: coupon.id, form: { enabled: !coupon.enabled } })}
        disabled={!btnEnabled || updateCoupon.isPending}
        loading={updateCoupon.isPending}
      >
        {!coupon.enabled ? (
          <>
            <Check /> Enable
          </>
        ) : (
          <>
            <X /> Disable
          </>
        )}
      </Button>
    )
  }
  if (valid) {
    // valid, allow disable
    return <Btn btnEnabled={true} />;
  }
  // invalid, if its expired, don't allow enable
  if (isCouponExpired(coupon)) {
    return <Btn btnEnabled={false} />;
  }
  return <Btn btnEnabled={true} />;
}