"use client";
import { useCart } from "@/components/cart";
import { PlayerSkinImage } from "@/components/player-skin";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { calculateTotal } from "@/lib/utils/cart";
import { api } from "@/trpc/react";
import { type Product } from "@/types";
import { X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export const CartPopoverContent = () => {
  const cart = useCart();
  const itemsKeys = useMemo(() => Object.keys(cart.items), [cart.items]);
  const products = api.products.getProductsByIds.useQuery({
    ids: itemsKeys,
  });
  const productsRecord = useMemo(() => {
    const record: Record<string, Product> = {};
    products.data?.forEach(product => {
      record[product.id] = product;
    });
    return record;
  }, [products.data]);

  const total = useMemo(() => calculateTotal(cart.items, productsRecord), [cart.items, productsRecord]);
  const itemsLength = itemsKeys.length;
  if (!cart.player) return null;
  if (!cart._hasHydrated) return <Spinner />;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="w-16 flex items-start justify-center overflow-hidden place-self-center bg-accent/80 rounded-lg pt-1">
          <PlayerSkinImage
            name={cart.player.name}
            width={48}
            height={48}
            renderConfig={{
              name: "ultimate",
              crop: "bust"
            }}
          />
        </div>
        <div>
          <h1>{cart.player.name}</h1>
          <Button onClick={() => {
            cart.setPlayer(null);
          }} variant={"destructive"} size={"xs"}>
            Log Out
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {cart === null || itemsLength === 0 ? (
          <p>Your cart is empty!</p>
        ) : (
          products.isLoading ? (
            <div className="place-self-center">
              <Spinner size={32} />
            </div>
          ) : (
            Object.entries(cart.items).map(([id, { quantity }], i) => {
              const product = products.data?.find((p) => p.id === id);
              if (!product || i > 5) return null;
              return (
                <div key={id} className="flex flex-row items-center gap-2 w-full">
                  <p>{quantity}x {product.name}</p>
                  <X onClick={() => cart.removeItem(id)} className="ml-auto duration-300 hover:text-red-500 cursor-pointer" />
                </div>
              )
            })
          )
        )}
        {itemsLength > 5 && (
          <p className="text-xs text-accent-foreground/50">
            +{itemsLength - 5} more
          </p>
        )}
      </div>
      {itemsLength > 0 && (
        <p className="text-sm space-x-2 text-accent-foreground">
          <span>Total:</span>
          <span className="font-bold text-primary">${total.toFixed(2)}</span>
        </p>
      )}
      <Link href="/store/cart" prefetch={false} className="w-full">
        <Button disabled={!cart || itemsLength === 0} className="w-full">
          View Cart
        </Button>
      </Link>
    </div>
  )
}