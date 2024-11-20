import { env } from "@/env";
import { createCheckoutSession, type TebexSale, type TebexBasket, type TebexPackage } from "@/server/payments/impl/tebex/api-client";
import { type PaymentProvider } from "@/server/payments/providers";
import { type Order, type Product } from "@/types";
import { type Checkout } from "@/types/checkout";


export class TebexPaymentProvider implements PaymentProvider {
  name = "Tebex";
  icon = "https://www.tebex.io/branding/Tebex_logo_vertical.svg"
  beginCheckout = async (cart: Checkout, products: { product: Product, quantity: number }[], order: Order) => {
    const basket: TebexBasket = {
      first_name: cart.info.firstName,
      last_name: cart.info.lastName,
      email: cart.info.email,
      return_url: `${env.BASE_URL}/store/checkout/callback/tebex/return`,
      complete_url: `${env.BASE_URL}/store/checkout/callback/tebex/complete`,
      custom: {
        orderId: order.id,
      }
    };

    const packages: TebexPackage[] = products.map((product) => {
      if (!product.product) return null;
      const p = product.product;
      return {
        name: p.name,
        price: typeof p.price === "string" ? Number(p.price) : p.price,
        type: p.type,
        qty: product.quantity,
        expiry_period: p.expiryPeriod,
        expiry_length: p.expiryLength,
        custom: {
          productId: p.id,
        }
      }
    }).filter(item => !!item) as TebexPackage[];
    const sale: TebexSale = {
      name: "Sale",
      discount_type: "percentage",
      amount: 10,
    }
    const session = await createCheckoutSession(basket, packages, sale);
    return {
      metadata: session,
      updateOrder: {
        providerOrderId: `INTERNAL_tbx_bskt:${session.ident}`
      },
      link: session.links.checkout!
    }
  }
}
