import { type Order, type Product } from "@/types";
import { type Checkout } from "@/types/checkout";

export interface PaymentProvider {
  name: string;
  icon: string;
  
  beginCheckout: (
    cart: Checkout, 
    products: { product: Product, quantity: number }[],
    order: Order,
    discounts: { name: string; amount: number }[],
  ) => Promise<{ metadata: Record<string, unknown>, updateOrder: Partial<Order>, link: string }>;
}