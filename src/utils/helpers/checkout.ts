import { type Product } from "@/types";

export const getTotal = (items: Array<{ product: Product, quantity: number }>) => {
  return items.reduce((acc, item) => acc + (item.quantity * item.product.price), 0);
}

