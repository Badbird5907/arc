"use client";

import { StoreBanner } from "@/app/(store)/store-banner";
import { CheckoutCard } from "@/app/(store)/store/cart/checkout-card";
import { CouponsCard } from "@/app/(store)/store/cart/coupons-card";
import { useCart } from "@/components/cart";
import { usePublicSettings } from "@/components/client-config";
import { PlayerSelectForm } from "@/components/player-select-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { type Product } from "@/types";
import { formatExpiryPeriodShort } from "@badbird5907/mc-utils";
import { ArrowRight, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function Cart() {
  const { enableBedrock } = usePublicSettings();
  const [edition, setEdition] = useState<"java" | "bedrock" | null>(!enableBedrock ? "java" : null);
  const cart = useCart();

  const itemsKeys = useMemo(() => Object.keys(cart.items), [cart.items]);
  const products = api.products.getProductsByIds.useQuery({
    ids: itemsKeys,
  });

  const hasUuid = !!cart.player && "uuid" in cart.player;
  const couponCheckEnabled = Object.keys(cart.coupons).length > 0 && hasUuid;
  const couponCheck = api.coupons.checkCoupons.useQuery({
    cart: Object.entries(cart.items).map(([id, { quantity }]) => ({
      id,
      quantity
    })),
    coupons: [...Object.keys(cart.coupons)],
    playerUuid: hasUuid ? cart.player!.uuid : "",
  }, {
    enabled: couponCheckEnabled
  })

  const total = useMemo(() => {
    if (!cart.items) return {
      total: 0,
      discountAmount: 0,
      subtotal: 0
    };
    const total = Object.keys(cart.items).reduce((acc, cur) => acc + (cart.items[cur]?.quantity ?? 0) * (products.data?.find(p => p.id === cur)?.price ?? 0), 0);
    if (couponCheckEnabled && !!couponCheck.data && "discountAmount" in couponCheck.data!) {
      const removeCoupons = couponCheck.data.status.filter(c => !c.success).map(c => c.code);
      if (removeCoupons.length > 0) {
        removeCoupons.forEach(code => {
          cart.removeCoupon(code);
        });
        toast.error(`Removed ${removeCoupons.length} invalid coupon(s)!`, {
          description: removeCoupons.join(", ")
        })
      }
      return {
        total: total - couponCheck.data.discountAmount,
        discountAmount: couponCheck.data.discountAmount,
        subtotal: total
      };
    }
    return {
      total,
      discountAmount: 0,
      subtotal: total
   };
  }, [cart.items, products.data, couponCheck.data]);

  if (!cart._hasHydrated) return <Spinner />;
  if (!cart.player) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Card>
          <CardHeader>
            <CardTitle>Please Login</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerSelectForm editionState={[edition, setEdition]} onSelect={(player) => {
              cart.setPlayer(player);
            }} />
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <>
      <StoreBanner title={"Cart"} subTitle={"Review your cart and checkout"} />
      <div className="flex flex-col md:flex-row w-full">
        <div className="mx-auto p-4 pr-0 pb-0 md:pb-4 w-full md:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Cart</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!products.isLoading && products.data?.map((data) => {
                    const product = data as Product;
                    return (
                      <TableRow key={product.id} className="text-white text-sm md:text-2xl">
                        <TableHead className="text-inherit flex flex-row gap-4 h-full">
                          {product.images && product.images.length > 0 && (
                            <Image
                              src={`/assets/products/${product.id}/${product.images[0]!}`}
                              alt={product.name}
                              width={128}
                              height={128}
                              className="rounded-md hidden md:block"
                            />
                          )}
                          <p className="text-sm md:text-xl content-center">
                            {product.name}
                          </p>
                        </TableHead>
                        <TableHead className="text-inherit">
                          ${product.price}
                          {product.type === "subscription" ? (
                            <span className="text-sm text-gray-500">
                              /{formatExpiryPeriodShort(product.expiryPeriod, product.expiryLength)}
                            </span>
                          ) : ""}
                        </TableHead>
                        <TableHead className="text-inherit">{cart.items[product.id]?.quantity}</TableHead>
                        <TableHead className="text-inherit">${(cart.items[product.id]?.quantity ?? 0) * product.price}</TableHead>
                        <TableHead>
                          <button className="text-red-500" onClick={() => cart.removeItem(product.id)}>
                            <XCircle className="text-red-500" />
                          </button>
                        </TableHead>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  {couponCheckEnabled && (
                    <TableRow className="text-sm md:text-2xl">
                      <TableCell colSpan={4}>
                        Discounts
                      </TableCell>
                      <TableCell className="text-right">
                        {couponCheck.isLoading ? <Spinner size={24} /> : (
                          total.discountAmount > 0 ? `-$${total.discountAmount}` : 0
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="text-sm md:text-2xl">
                    <TableCell colSpan={4}>
                      Total <span className="text-sm text-gray-500">(taxes may apply at checkout)</span>
                    </TableCell>
                    <TableCell className="text-right">
                      ${total.total}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              {products.isLoading && <Spinner className="place-self-center mt-4" />}
              {!products.isLoading && products.data?.length === 0 && (
                <div className="text-center text-xl mt-4">
                  <p className="text-inherit">Your cart is empty :{"("}</p>
                  <Link href="/store">
                    <Button className="mt-4">
                      Begin Shopping <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="mx-auto p-4 w-full md:w-1/4 flex flex-col gap-4">
          <CouponsCard coupons={cart.coupons} cart={cart.items} player={cart.player} addCoupon={cart.addCoupon} removeCoupon={cart.removeCoupon} />
          <CheckoutCard cart={cart} products={products.data ?? []} coupons={Object.keys(cart.coupons)} />
        </div>
      </div>
    </>
  )
}