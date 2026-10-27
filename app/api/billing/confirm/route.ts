import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const schema = z.object({ sessionId: z.string().startsWith("cs_") });

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to confirm your subscription." }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 });

  try {
    const session = await getStripe().checkout.sessions.retrieve(parsed.data.sessionId);
    if (session.client_reference_id !== userId || session.mode !== "subscription" || session.status !== "complete") {
      return NextResponse.json({ error: "This checkout session is not complete." }, { status: 403 });
    }
    const plan = session.metadata?.plan;
    if (plan !== "pro" && plan !== "team") {
      return NextResponse.json({ error: "The selected plan is invalid." }, { status: 400 });
    }
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (!subscriptionId) return NextResponse.json({ error: "Subscription details are not available yet." }, { status: 409 });
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    if (subscription.status !== "active" && subscription.status !== "trialing") {
      return NextResponse.json({ error: "Stripe has not activated this subscription yet." }, { status: 409 });
    }
    await ensureSchema();
    await getDb()`UPDATE users SET plan = ${plan}, subscription_status = ${subscription.status},
      stripe_subscription_id = ${subscriptionId}, stripe_customer_id = ${customerId || null}
      WHERE id = ${userId}`;
    return NextResponse.json({ ok: true, plan });
  } catch (error) {
    console.error("Stripe checkout confirmation failed:", error);
    return NextResponse.json({ error: "Unable to confirm your Stripe checkout." }, { status: 500 });
  }
}
