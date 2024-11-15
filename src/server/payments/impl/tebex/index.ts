import { env } from "@/env";
import { db } from "@/server/db";
import { createCheckoutSession, type TebexSale, type TebexBasket, type TebexPackage } from "@/server/payments/impl/tebex/api-client";
import { type PaymentProvider } from "@/server/payments/providers";
import { type Checkout } from "@/types/checkout";


export class TebexPaymentProvider implements PaymentProvider {
  name = "Tebex";
  icon = "https://www.tebex.io/branding/Tebex_logo_vertical.svg"
  beginCheckout: (cart: Checkout) => Promise<{ metadata: Record<string, unknown>; link: string; }> = async (cart) => {
    const basket: TebexBasket = {
      first_name: cart.info.firstName,
      last_name: cart.info.lastName,
      email: cart.info.email,
      return_url: `${env.BASE_URL}/store/checkout/callback/tebex/return`,
      complete_url: `${env.BASE_URL}/store/checkout/callback/tebex/complete`,
    };

    // TODO: move this logic to checkout/index.ts - checkout() (+ add validation)
    const products = await Promise.all(cart.cart.map((item) => {
      return db.query.products.findFirst({
        where: (p, { eq }) => eq(p.id, item.id),
        with: {
          category: true
        }
      }).then((product) => {
        return {
          product,
          quantity: item.quantity
        }
      })
    }));
    const packages: TebexPackage[] = products.map((product) => {
      if (!product.product) return null;
      const p = product.product;
      console.log(typeof p.price, p.price);
      return {
        name: p.name,
        price: typeof p.price === "string" ? Number(p.price) : p.price,
        type: p.type, // already single | subscription
        qty: product.quantity,
        expiry_period: p.expiryPeriod,
        expiry_length: p.expiryLength
      }
    }).filter(item => !!item) as TebexPackage[];
    console.log("packages", packages);
    const sale: TebexSale = {
      name: "Sale",
      discount_type: "percentage",
      amount: 10,
    }
    const session = await createCheckoutSession(basket, packages, sale);
    console.log("session", session);
    return {
      metadata: session,
      link: session.links.checkout!
    }

  }
}
