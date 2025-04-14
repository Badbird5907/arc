import { env } from "@/env";
import { stripeClient } from "@/server/payments/impl/stripe/api-client";
import { type PaymentProvider } from "@/server/payments/providers";
import { type Order, type Product } from "@/types";
import { type Checkout } from "@/types/checkout";
import { getIpAddress } from "@/utils/server/helpers";

const productToStripeLineItem = (product: Product, quantity: number) => {
  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        description: product.description ?? undefined,
        metadata: {
          productId: product.id,
        },
      },
      unit_amount: Math.round(product.price * 100), // convert to cents
    },
    quantity,
  };
};

const productToStripeSubscriptionItem = (product: Product, quantity: number) => {
  // map expiry period to stripe interval
  const intervalMap = {
    day: 'day',
    month: 'month',
    year: 'year',
  };
  
  const interval = intervalMap[product.expiryPeriod] || 'month';
  
  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name: product.name,
        description: product.description ?? undefined,
        metadata: {
          productId: product.id,
        },
      },
      unit_amount: Math.round(product.price * 100), // convert to cents
      recurring: {
        interval,
        interval_count: product.expiryLength,
      },
    },
    quantity,
  };
};

const beginStripeCheckout = async (
  cart: Checkout,
  products: { product: Product; quantity: number; }[],
  order: Order,
  discounts: { name: string; amount: number }[]
) => {
  if (!stripeClient) {
    throw new Error("STRIPE_SECRET_KEY is not set in the environment variables!");
  }
  
  // separate one-time products from subscription products
  const oneTimeProducts = products.filter(({ product }) => product.type === 'single');
  const subscriptionProducts = products.filter(({ product }) => product.type === 'subscription');
  
  // create line items for one-time products
  const oneTimeLineItems = oneTimeProducts.map(({ product, quantity }) => 
    productToStripeLineItem(product, quantity)
  );
  
  // create line items for subscription products
  const subscriptionLineItems = subscriptionProducts.map(({ product, quantity }) => 
    productToStripeSubscriptionItem(product, quantity)
  );
  
  // combine all line items
  const lineItems = [...oneTimeLineItems, ...subscriptionLineItems];
  
  // add discounts as negative line items
  if (discounts.length > 0) {
    discounts.forEach(discount => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: discount.name,
            description: undefined,
            metadata: {
              productId: 'discount',
            },
          },
          unit_amount: -Math.round(discount.amount * 100), // convert to cents and make negative
        },
        quantity: 1,
      });
    });
  }
  
  const isSubscription = subscriptionProducts.length > 0;  
  // create stripe checkout session
  const session = await stripeClient.checkout.sessions.create({
    line_items: lineItems,
    mode: isSubscription ? 'subscription' : 'payment',
    success_url: `${env.BASE_URL}/store/checkout/callback/stripe/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.BASE_URL}/store/checkout/callback/stripe/cancel`,
    customer_email: cart.info.email,
    client_reference_id: order.id,
    metadata: {
      orderId: order.id,
      playerUuid: order.playerUuid,
      firstName: cart.info.firstName,
      lastName: cart.info.lastName,
      ipAddress: await getIpAddress(),
      isSubscription: isSubscription.toString(),
    },
    subscription_data: isSubscription ? {
      metadata: {
        orderId: order.id,
        playerUuid: order.playerUuid,
      },
    } : undefined,
  });

  return {
    metadata: session as unknown as Record<string, unknown>,
    updateOrder: {
      providerOrderId: `INTERNAL_stripe_session:${session.id}`, // we will replace this with the payment intent id when we get the webhook
      subscriptionStatus: isSubscription ? 'active' as const : undefined,
    },
    link: session.url ?? '',
  };
};

export class StripePaymentProvider implements PaymentProvider {
  name = "Stripe";
  icon = "https://stripe.com/favicon.ico";
  
  beginCheckout = async (
    cart: Checkout,
    products: { product: Product; quantity: number; }[],
    order: Order,
    discounts: { name: string; amount: number }[],
  ) => {
    return beginStripeCheckout(cart, products, order, discounts);
  };
} 