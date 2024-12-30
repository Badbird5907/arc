import { useCart } from "@/components/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Product } from "@/types";
import { X } from "lucide-react";

export const CartPopoverItem = ({ product, quantity }: { product: Product, quantity: number }) => {
  const price = product.price * quantity;
  const cart = useCart();
  return (
    <Card>
      <CardHeader className="hidden">
        <CardTitle className="sr-only">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-row justify-between">
        <div className="flex flex-col gap-2">
          <p>{product.name}</p>
          <p className="text-primary">${price}</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => cart.removeItem(product.id)}>
          <X />
        </Button>
      </CardContent>
    </Card>
  )
}