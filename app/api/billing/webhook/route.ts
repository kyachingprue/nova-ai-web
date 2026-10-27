import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { ensureSchema, getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const db = getDb();
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      if (session.mode === "subscription") {
        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = session.metadata?.plan;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (userId && (plan === "pro" || plan === "team") && subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const active = subscription.status === "active" || subscription.status === "trialing";
          await db`UPDATE users SET plan = ${active ? plan : "free"},
            subscription_status = ${subscription.status},
            stripe_subscription_id = ${subscriptionId}, stripe_customer_id = ${customerId || null}
            WHERE id = ${userId}`;
        }
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata.userId;
      const plan = subscription.metadata.plan;
      if (userId) {
        const active = event.type !== "customer.subscription.deleted" &&
          (subscription.status === "active" || subscription.status === "trialing");
        await db`UPDATE users SET plan = ${active && (plan === "pro" || plan === "team") ? plan : "free"},
          subscription_status = ${event.type === "customer.subscription.deleted" ? "canceled" : subscription.status},
          stripe_subscription_id = ${event.type === "customer.subscription.deleted" ? null : subscription.id}
          WHERE id = ${userId}`;
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json({ error: "Unable to process Stripe event." }, { status: 500 });
  }
}
