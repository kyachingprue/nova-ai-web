import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { ensureSchema, getDb } from "@/lib/db";
import { getStripe, getStripePriceId } from "@/lib/stripe";

const schema = z.object({ plan: z.enum(["free", "pro", "team"]) });

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Sign in to choose a plan." }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });

  try {
    await ensureSchema();
    const db = getDb();
    const [user] = await db`SELECT id, email, plan, subscription_status AS "subscriptionStatus",
      stripe_customer_id AS "stripeCustomerId"
      FROM users WHERE id = ${userId} LIMIT 1`;
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    if (parsed.data.plan === "free") {
      await db`UPDATE users SET plan = 'free' WHERE id = ${userId}
        AND subscription_status NOT IN ('active', 'trialing')`;
      return NextResponse.json({ url: "/dashboard" });
    }
    if (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") {
      return NextResponse.json(
        { error: "You already have an active subscription. Manage your current plan before starting another checkout." },
        { status: 409 },
      );
    }

    const stripe = getStripe();
    const priceId = getStripePriceId(parsed.data.plan);
    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL is not configured.");
    const origin = new URL(appUrl);
    if (origin.protocol !== "https:" && origin.protocol !== "http:") {
      throw new Error("APP_URL must use HTTP or HTTPS.");
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(user.stripeCustomerId
        ? { customer: String(user.stripeCustomerId) }
        : { customer_email: String(user.email) }),
      client_reference_id: userId,
      metadata: { userId, plan: parsed.data.plan },
      subscription_data: { metadata: { userId, plan: parsed.data.plan } },
      success_url: `${origin.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin.origin}/pricing?checkout=cancelled`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return NextResponse.json(
      { error: "Checkout is not ready. Check Stripe secret and price IDs in server configuration." },
      { status: 503 },
    );
  }
}
