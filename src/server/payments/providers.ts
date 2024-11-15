import { Checkout } from "@/types/checkout";

export interface PaymentProvider {
  name: string;
  icon: string;
  
  beginCheckout: (cart: Checkout) => Promise<{ metadata: Record<string, unknown>, link: string }>;
}