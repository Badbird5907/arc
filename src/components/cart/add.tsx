"use client";

import { useCart } from "@/components/cart";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/components/ui/hover-confetti";
import { cn } from "@/lib/utils";
import { type Product } from "@/types";
import { Check, MinusCircle, PlusCircle, ShoppingCart } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export const AddToCartButton = ({ product, className }: {
  product: Product;
  className?: string;
}) => {
  const addToCart = useCart((state) => state.addItem);
  const items = useCart((state) => state.items);
  const subscriptionItem = useMemo(() => {
    const entry = Object.entries(items).find(([_, item]) => item.subscription);
    if (entry) {
      return {
        id: entry[0],
        ...entry[1]
      };
    }
    return null;
  }, [items]);
  const [check, setCheck] = useState(false);
  const [quantity, setQuantity] = useState(product.minQuantity);
  const { fire } = useConfetti();
  const ref = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      {subscriptionItem?.subscription && product.type === "subscription" && <p className="text-md text-gray-500">
        You can only have one subscription item in your cart.
      </p>}
      <div className={cn("w-full flex flex-col md:flex-row items-center gap-2", className)}>
        {product.maxQuantity !== 1 && product.type === "single" && (
          <div className="flex flex-row gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              disabled={quantity <= product.minQuantity}
              onClick={() => setQuantity(quantity - 1)}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              disabled={product.maxQuantity > 0 && quantity <= product.maxQuantity}
              onClick={() => setQuantity(quantity + 1)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button onClick={() => {
          // TODO: make sure user is logged in, close this dialog and then open the cart popup
          addToCart(product.id, quantity, product.type === "subscription");
          fire(ref);
          setCheck(true);
          setTimeout(() => setCheck(false), 1000);
        }} ref={ref} className="w-full" disabled={subscriptionItem?.id === product.id}>
          {check ? (
            <Check size={20} />
          ) : (
            <ShoppingCart size={20} />
          )}
          Add to Cart {quantity > 1 && `(${quantity}x)`}
        </Button>
      </div>
    </>
  )
}