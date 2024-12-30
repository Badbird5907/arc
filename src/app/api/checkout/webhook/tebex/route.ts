import { env } from "@/env";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { completeOrder, declineOrder, disputeUpdate, expireOrder, refundOrder, renewOrder } from "@/utils/server/orders";
import crypto from "crypto";
import { eq } from "drizzle-orm";
type TebexPrice = {
  amount: number;
  currency: string;
}
type TebexUsername = {
  id: string;
  username: string;
}
type TebexStatus = {
  id: number;
  description: string;
}
type TebexWebhookPaymentSubject = {
  transaction_id: string;
  status: TebexStatus;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  payment_sequence: "oneoff" | string;
  created_at: string;
  price: TebexPrice;
  price_paid: TebexPrice;
  payment_method: {
    name: string;
    refundable: boolean;
  };
  fees: {
    tax: TebexPrice;
    gateway: TebexPrice;
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    ip: string;
    username: TebexUsername;
    marketing_consent: boolean;
    country: string;
    postal_code: string;
  };
  products: Array<{
    id: number;
    name: string;
    quantity: number;
    base_price: TebexPrice;
    paid_price: TebexPrice;
    variables: Array<{
      identifier: string;
      option: string;
    }>;
    expires_at: string | null;
    custom: unknown;
    username: TebexUsername;
  }>;
  coupons: unknown[];
  gift_cards: unknown[];
  recurring_payment_reference: string | null;
  decline_reason?: {
    code: string;
    message: string;
  };
  custom?: Record<string, unknown>;
}
type TebexRecurringPaymentSubject = {
  reference: string;
  created_at: string;
  next_payment_at: string;
  status: TebexStatus;
  initial_payment: TebexWebhookPaymentSubject;
  last_payment: TebexWebhookPaymentSubject;
  fail_count: number;
  price: TebexPrice;
  cancelled_at: string | null;
  cancel_reason: string | null;
}
type WebhookData = {
  id: string;
  type: "validation.webhook"
    | "payment.completed"
    | "payment.declined"
    | "payment.refunded"
    | "payment.dispute.opened"
    | "payment.dispute.won"
    | "payment.dispute.lost"
    | "payment.dispute.closed"
    | "recurring-payment.started"
    | "recurring-payment.renewed"
    | "recurring-payment.ended"
    | "recurring-payment.cancellation.requested"
    | "recurring-payment.cancellation.aborted";
  date: string;
  subject: TebexWebhookPaymentSubject | TebexRecurringPaymentSubject;
}
// const STATUS_ID = {
//   [-1]: "unknown",
//   1: "complete",
//   2: "refund",
//   3: "chargeback",
//   18: "declined",
//   19: "pending",
//   21: "refund_pending"
// } as const;
export const POST = async (req: Request) => {
  const data = await req.json() as WebhookData;
  console.log("data", data);
  if (data.type === "validation.webhook") {
    return new Response(JSON.stringify({ id: data.id }), { status: 200 });
  }
  const secret = env.TEBEX_WEBHOOK_SECRET;
  if (!secret) {
    console.error("No secret");
    return new Response("No secret", { status: 500 });
  }
  const bodyHash = crypto.createHash("sha256").update(JSON.stringify(data), "utf-8").digest("hex");
  const finalHash = crypto.createHmac("sha256", secret).update(bodyHash).digest("hex");
  const sig = req.headers.get("x-signature");
  if (finalHash !== sig) {
    return new Response("Invalid hash", { status: 400 });
  }
  const splitType = data.type.split(".");
  const baseType = splitType[0];
  const rest = splitType.slice(1).join(".");
  if (baseType === "payment") {
    const payment = data.subject as TebexWebhookPaymentSubject;
    if (!payment.custom || typeof payment.custom.orderId !== "string") {
      console.warn(`Payment ${payment.transaction_id} has no orderId in custom field!!`);
      return new Response("Order ID not found", { status: 200 }); // prevent the webhook from being resent
    }
    const orderId = payment.custom.orderId;
    const order = await db.query.orders.findFirst({
      where: (o, { eq }) => eq(o.id, orderId)
    });
    if (!order) {
      console.warn(`Order not found for payment ${payment.transaction_id}!!`);
      return new Response("Order not found", { status: 200 }); // prevent the webhook from being resent 
    }
    if (!order.providerOrderId || order.providerOrderId.startsWith("INTERNAL_tbx_bskt:")) { // swap this with our transaction id
      await db.update(orders).set({ // could Promise.all with the stuff below but meh...
        providerOrderId: payment.transaction_id
      }).where(eq(orders.id, orderId));
      if (payment.recurring_payment_reference && rest === "completed") { // there was a recurring payment
        await db.update(orders).set({
          recurringTransactionIds: [payment.recurring_payment_reference]
        }).where(eq(orders.id, orderId));
      }
    }
    if (rest === "completed") {
      await completeOrder(order);
    } else if (rest === "declined") {
      const declineReason = payment.decline_reason?.code ?? "unknown";
      await declineOrder(order, declineReason);
    } else if (rest.startsWith("dispute")) {
      const disputeState = rest.split(".")[1] as "open" | "won" | "lost" | "closed";
      await disputeUpdate(order, disputeState);
    } else if (rest === "refunded") {
      await refundOrder(order);
    }
  } else if (baseType === "recurring-payment") {
    const recurring = data.subject as TebexRecurringPaymentSubject;
    const orderId = recurring.initial_payment.custom?.orderId as string | undefined;
    if (!orderId) {
      console.warn(`Recurring payment ${recurring.reference} has no orderId in custom field!!`);
      return new Response("Order ID not found", { status: 200 }); // prevent the webhook from being resent
    }
    const order = await db.query.orders.findFirst({
      where: (o, { eq }) => eq(o.id, orderId)
    });
    if (!order) {
      console.warn(`Order not found for recurring payment ${recurring.reference}!!`);
      return new Response("Order not found", { status: 200 }); // prevent the webhook from being resent
    }
    if (rest === "started" || rest === "renewed") {
      await renewOrder(order);
    } else if (rest === "ended") {
      await expireOrder(order);
    }
  }
  
  return new Response("OK", { status: 200 });
}