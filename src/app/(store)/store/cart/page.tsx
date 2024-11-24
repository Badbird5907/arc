"use client";

import { StoreBanner } from "@/app/(store)/store-banner";
import { CheckoutCard } from "@/app/(store)/store/cart/checkout-card";
import { useCart } from "@/components/cart";
import { usePublicSettings } from "@/components/client-config";
import { LoginForm } from "@/components/header/store/login/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/trpc/react";
import { type Product } from "@/types";
import { formatExpiryPeriod } from "@/utils";
import { ArrowRight, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Cart() {
  const { enableBedrock } = usePublicSettings();
  const [edition, setEdition] = useState<"java" | "bedrock" | null>(!enableBedrock ? "java" : null);
  const cart = useCart();

  const itemsKeys = useMemo(() => Object.keys(cart.items), [cart.items]);
  const products = api.products.getProductsByIds.useQuery({
    ids: itemsKeys,
  });

  const total = useMemo(() => {
    if (!cart.items) return 0;
    return Object.keys(cart.items).reduce((acc, cur) => acc + (cart.items[cur] ?? 0) * (products.data?.find(p => p.id === cur)?.price ?? 0), 0);
  }, [cart.items, products.data]);

  if (!cart._hasHydrated) return <Spinner />;
  if (!cart.player) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Card>
          <CardHeader>
            <CardTitle>Please Login</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm editionState={[edition, setEdition]} close={() => null} />
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <>
      <StoreBanner title={"Cart"} subTitle={"Review your cart and checkout"} />
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="mx-auto p-4 w-full md:w-3/4">
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
                      <TableRow key={product.id} className="text-white text-2xl">
                        <TableHead className="text-inherit flex flex-row gap-4 h-full">
                          {product.images && product.images.length > 0 && (
                            <Image
                              src={`/assets/products/${product.id}/${product.images[0]!}`}
                              alt={product.name}
                              width={128}
                              height={128}
                              className="rounded-md"
                            />
                          )}
                          <p className="text-xl content-center">
                            {product.name}
                          </p>
                        </TableHead>
                        <TableHead className="text-inherit">
                          ${product.price}
                          {product.type === "subscription" ? (
                            <span className="text-sm text-gray-500">
                              /{formatExpiryPeriod(product.expiryPeriod, product.expiryLength)}
                            </span>
                          ) : ""}
                        </TableHead>
                        <TableHead className="text-inherit">{cart.items[product.id]}</TableHead>
                        <TableHead className="text-inherit">${(cart.items[product.id] ?? 0) * product.price}</TableHead>
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
                  <TableRow className="text-2xl">
                    <TableCell colSpan={4}>
                      Subtotal
                      </TableCell>
                      <TableCell className="text-right">
                        ${total}
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
        <div className="mx-auto p-4 w-full md:w-1/4">
          <CheckoutCard cart={cart} products={products.data ?? []} />
        </div>
      </div>
    </>
  )
}