import { env } from "@/env";
import { tebexClient } from "@/server/payments/impl/tebex/api-client";
import { type PaymentProvider } from "@/server/payments/providers";
import { type Order, type Product } from "@/types";
import { type Checkout } from "@/types/checkout";
import { getIpAddress } from "@/utils/server/helpers";
import { CreateBasketResponse, TebexBasket, TebexPackage } from "@badbird5907/mc-utils";

const productToTebexPackage = (product: Product, quantity: number): TebexPackage => {
  return {
    name: product.name,
    price: product.price,
    type: product.type,
    qty: quantity,
    custom: {
      productId: product.id,
    },
    ...(product.type === "subscription" ? {
      expiry_period: product.expiryPeriod,
      expiry_length: product.expiryLength,
    } : {})
  }
}

const beginSingleApiCheckout = async (cart: Checkout,
  products: { product: Product; quantity: number; }[],
  order: Order,
  discounts: { name: string; amount: number }[]) => { // this api is just broken...
  const basket: TebexBasket = {
    first_name: cart.info.firstName,
    last_name: cart.info.lastName,
    email: cart.info.email,
    return_url: `${env.BASE_URL}/store/checkout/callback/tebex/return`,
    complete_url: `${env.BASE_URL}/store/checkout/callback/tebex/complete`,
    custom: {
      orderId: order.id,
    }
  }

  const packages = products.map((product) => {
    if (!product.product) return null;
    return productToTebexPackage(product.product, product.quantity);
  }).filter(item => !!item);
  // const sale: TebexSale | undefined = discountAmount && discountAmount > 0 ? {
  //   name: "Discount",
  //   discount_type: "amount",
  //   amount: discountAmount
  // } : undefined;
  const sales: TebexPackage[] =  discounts.map((discount) => ({
    name: discount.name,
    price: -discount.amount,
    type: "single",
    qty: 1,
    custom: {
      productId: "discount",
    }
  }));
  const session = await tebexClient.createCheckoutSession(basket, [
    ...packages,
    ...sales
  ]);
  return {
    metadata: session,
    updateOrder: {
      providerOrderId: `INTERNAL_tbx_bskt:${session.ident}`
    },
    link: session.links.checkout!
  }
}
const beginBasketApiCheckout = async (cart: Checkout,
  products: { product: Product; quantity: number; }[],
  order: Order,
  discounts: { name: string; amount: number }[]) => {
    const basket: CreateBasketResponse = await tebexClient.createBasket({
      returnUrl: `${env.BASE_URL}/store/checkout/callback/tebex/return`,
      completeUrl: `${env.BASE_URL}/store/checkout/callback/tebex/complete`,
      firstName: cart.info.firstName,
      lastName: cart.info.lastName,
      email: cart.info.email,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      completeAutoRedirect: true,
      country: "CA",
      ip: await getIpAddress(),
      custom: {
        orderId: order.id,
      }
    });
    console.log(" -> Basket created!");
    await Promise.all(products.map(async (product) => {
      await tebexClient.addPackageToBasket(basket.ident, productToTebexPackage(product.product, product.quantity));
    }));
    console.log(" -> Packages added!");
    await Promise.all(discounts.map(async (discount) => { // make sure the discounts appear below the packages
      await tebexClient.addPackageToBasket(basket.ident, {
        name: discount.name,
        price: -discount.amount,
        type: "single",
        qty: 1,
        custom: {
          productId: "discount",
        }
      });
    }));
    console.log(" -> Discounts added!");
    console.log(" -> Basket done! ", basket);
    return {
      metadata: basket,
      updateOrder: {
        providerOrderId: `INTERNAL_tbx_bskt:${basket.ident}`
      },
      link: basket.links.checkout!
    }
}
export class TebexPaymentProvider implements PaymentProvider {
  name = "Tebex";
  icon = "https://www.tebex.io/branding/Tebex_logo_vertical.svg"
  beginCheckout = async (cart: Checkout,
                         products: { product: Product; quantity: number; }[],
                         order: Order,
                         discounts: { name: string; amount: number }[],
                        ) => {
    if (products.every(product => product.quantity === 1)) { // single api checkout is broken and quantity doesn't work
      return beginSingleApiCheckout(cart, products, order, discounts);
    }
    return beginBasketApiCheckout(cart, products, order, discounts);
  }
}
