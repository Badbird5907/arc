import { db } from "@/server/db";
import { stripeClient } from "@/server/payments/impl/stripe/api-client";
import { redirect } from "next/navigation";

export const GET = async (req: Request) => {
  if (!stripeClient) {
    return new Response("Stripe is not enabled", { status: 400 });
  }
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return new Response("No session ID provided", { status: 400 });
  }

  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    
    if (!session.client_reference_id) {
      return new Response("No order ID found", { status: 400 });
    }
    
    const orderId = session.client_reference_id;
    
    // update the order status to completed if it's not already
    const order = await db.query.orders.findFirst({
      where: (o, { eq }) => eq(o.id, orderId)
    });
    
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }
    
    return redirect(`/store/checkout/success?order=${orderId}`);
  } catch (error) {
    console.error("Error retrieving session:", error);
    return new Response("Error retrieving session", { status: 500 });
  }
}; 