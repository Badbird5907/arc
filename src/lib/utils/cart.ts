import { type Product } from "@/types";

export const calculateTotal = (items: Record<string, number>, products: Record<string, Product>) => {
  const total = Object.entries(items).reduce((acc, [id, quantity]) => { // TODO: subscriptions, discounts, etc...
    const product = products[id];
    if (!product) return acc;
    return acc + product.price * quantity;
  }, 0);
  return total;
}