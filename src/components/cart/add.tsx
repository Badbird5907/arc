"use client";

import { useCart } from "@/components/cart";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/components/ui/hover-confetti";
import { type Product } from "@/types";
import { Check, ShoppingCart } from "lucide-react";
import { useRef, useState } from "react";

export const AddToCartButton = ({ product, className }: {
  product: Product;
  className?: string;
}) => {
  const addToCart = useCart((state) => state.addItem);
  const [check, setCheck] = useState(false);
  const { fire } = useConfetti();
  const ref = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <Button onClick={() => {
        addToCart(product.id);
        fire(ref);
        setCheck(true);
        setTimeout(() => setCheck(false), 1000);
      }} ref={ref} className={className}>
        {check ? (
          <Check size={20} />
        ) : (
          <ShoppingCart size={20} />
        )}
        Add to Cart
      </Button>
    </>
  )
}