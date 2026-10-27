import Stripe from "stripe";

let stripe: Stripe | undefined;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  stripe ??= new Stripe(secretKey);
  return stripe;
}

export function getStripePriceId(plan: "pro" | "team") {
  const priceId = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_TEAM;
  if (!priceId) throw new Error(`Stripe price is not configured for the ${plan} plan.`);
  return priceId;
}
