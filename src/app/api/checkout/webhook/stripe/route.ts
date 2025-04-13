import { env } from "@/env";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { completeOrder, declineOrder, disputeUpdate, expireOrder, refundOrder, renewOrder } from "@/utils/server/orders";
import { eq } from "drizzle-orm";
import { stripeClient } from "@/server/payments/impl/stripe/api-client";
import type Stripe from "stripe";

export const POST = async (req: Request) => {
  if (!stripeClient) {
    return new Response("Stripe is not enabled", { status: 400 });
  }
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe webhook secret is not set", { status: 400 });
  }
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log(`Processing Stripe event: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      
      if (!session.client_reference_id) {
        console.warn(`Session ${session.id} has no client_reference_id (orderId)!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = session.client_reference_id;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for session ${session.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      await completeOrder(order);
      break;
    }
    
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      
      if (!paymentIntent.metadata.orderId) {
        console.warn(`Payment intent ${paymentIntent.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = paymentIntent.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for payment intent ${paymentIntent.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      const declineReason = paymentIntent.last_payment_error?.code ?? "unknown";
      await declineOrder(order, declineReason);
      break;
    }
    
    case "charge.dispute.created": {
      const dispute = event.data.object;
      
      if (!dispute.payment_intent) {
        console.warn(`Dispute ${dispute.id} has no payment_intent!!`);
        return new Response("Payment intent not found", { status: 200 });
      }
      
      const paymentIntent = await stripeClient.paymentIntents.retrieve(dispute.payment_intent as string);
      
      if (!paymentIntent.metadata.orderId) {
        console.warn(`Payment intent ${paymentIntent.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = paymentIntent.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for dispute ${dispute.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      await disputeUpdate(order, "open");
      break;
    }
    
    case "charge.dispute.closed": {
      const dispute: Stripe.Dispute = event.data.object;
      
      if (!dispute.payment_intent) {
        console.warn(`Dispute ${dispute.id} has no payment_intent!!`);
        return new Response("Payment intent not found", { status: 200 });
      }
      
      const paymentIntent = await stripeClient.paymentIntents.retrieve(dispute.payment_intent as string);
      
      if (!paymentIntent.metadata.orderId) {
        console.warn(`Payment intent ${paymentIntent.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = paymentIntent.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for dispute ${dispute.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      if (dispute.status === "won") {
        await disputeUpdate(order, "won");
      } else if (dispute.status === "lost") {
        await disputeUpdate(order, "lost");
      } else {
        await disputeUpdate(order, "closed");
      }
      break;
    }
    
    case "charge.refunded": {
      const charge = event.data.object;
      
      if (!charge.payment_intent) {
        console.warn(`Charge ${charge.id} has no payment_intent!!`);
        return new Response("Payment intent not found", { status: 200 });
      }
      
      const paymentIntent = await stripeClient.paymentIntents.retrieve(charge.payment_intent as string);
      
      if (!paymentIntent.metadata.orderId) {
        console.warn(`Payment intent ${paymentIntent.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = paymentIntent.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for charge ${charge.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      await refundOrder(order);
      break;
    }
    
    // subscription events
    case "customer.subscription.created": {
      const subscription = event.data.object;
      
      if (!subscription.metadata.orderId) {
        console.warn(`Subscription ${subscription.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = subscription.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for subscription ${subscription.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      // update the order with subscription information
      await db.update(orders)
        .set({
          recurringTransactionIds: [subscription.id],
          subscriptionStatus: 'active',
        })
        .where(eq(orders.id, orderId));
      
      await renewOrder(order);
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      
      if (!subscription.metadata.orderId) {
        console.warn(`Subscription ${subscription.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = subscription.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for subscription ${subscription.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      if (subscription.status === 'active') {
        await db.update(orders)
          .set({
            subscriptionStatus: 'active',
          })
          .where(eq(orders.id, orderId));
        
        await renewOrder(order);
      } else if (subscription.status === 'canceled') {
        await db.update(orders)
          .set({
            subscriptionStatus: 'canceled',
          })
          .where(eq(orders.id, orderId));
      }
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      
      if (!subscription.metadata.orderId) {
        console.warn(`Subscription ${subscription.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = subscription.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for subscription ${subscription.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      await db.update(orders)
        .set({
          subscriptionStatus: 'expired',
        })
        .where(eq(orders.id, orderId));
      
      await expireOrder(order);
      break;
    }
    
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      
      // for subscription invoices, we'll handle them in the subscription events
      // this is just a fallback for one-time payments
      if (!invoice.customer) {
        return new Response("Not a customer invoice", { status: 200 });
      }
      
      // try to find the order from the customer's metadata
      const customer = await stripeClient.customers.retrieve(invoice.customer as string) as Stripe.Customer;
      
      if (!customer.metadata.orderId) {
        console.warn(`Customer ${customer.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = customer.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for customer ${customer.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      // this is likely a one-time payment, so we don't need to do anything special
      break;
    }
    
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      
      // for subscription invoices, we'll handle them in the subscription events
      // this is just a fallback for one-time payments
      if (!invoice.customer) {
        return new Response("Not a customer invoice", { status: 200 });
      }
      
      // try to find the order from the customer's metadata
      const customer = await stripeClient.customers.retrieve(invoice.customer as string) as Stripe.Customer;
      
      if (!customer.metadata.orderId) {
        console.warn(`Customer ${customer.id} has no orderId in metadata!!`);
        return new Response("Order ID not found", { status: 200 });
      }
      
      const orderId = customer.metadata.orderId;
      const order = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.id, orderId)
      });
      
      if (!order) {
        console.warn(`Order not found for customer ${customer.id}!!`);
        return new Response("Order not found", { status: 200 });
      }
      
      // this is likely a one-time payment failure, so we don't need to do anything special
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return new Response("OK", { status: 200 });
}; 