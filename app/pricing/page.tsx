import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

const plans = [
  { id: "free", name: "Free", price: "$0", cadence: "forever", description: "A thoughtful place to start.", features: ["50 AI messages / month", "Gemini Flash access", "Chat history", "Web search & citations"], action: "Start for free" },
  { id: "pro", name: "Pro", price: "$19", cadence: "per month", description: "More room for your best thinking.", features: ["Unlimited AI messages", "Advanced Gemini models", "Unlimited chat history", "Web search & citations", "Priority response speed"], action: "Choose Pro", popular: true },
  { id: "team", name: "Team", price: "$49", cadence: "per seat / month", description: "Bring your team’s ideas together.", features: ["Everything in Pro", "Shared team workspace", "Team knowledge library", "Admin & member controls", "Priority support"], action: "Choose Team" },
];

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <section className="mx-auto max-w-[1120px] px-5 pb-20 pt-12 sm:px-7 sm:pt-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="pricing-pill"><Sparkles size={13} /> SIMPLE, TRANSPARENT PRICING</span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-6xl">Space to think.<br /><span className="text-nova">Plans to grow.</span></h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-mist">Start free, find your flow, and upgrade when you’re ready. Every plan comes with answers grounded in the web.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className={`pricing-card ${plan.popular ? "pricing-card-featured" : ""}`}>
              {plan.popular && <span className="popular-badge">MOST POPULAR</span>}
              <p className="font-display text-xl font-semibold">{plan.name}</p>
              <p className="mt-2 min-h-10 text-sm text-mist">{plan.description}</p>
              <div className="mb-1 mt-6 flex items-baseline gap-2"><strong className="font-display text-4xl font-semibold">{plan.price}</strong><span className="text-sm text-mist">{plan.cadence}</span></div>
              <Link className={`mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition hover:-translate-y-0.5 ${plan.popular ? "bg-nova text-white hover:brightness-110" : "border border-line-strong hover:border-nova hover:bg-nova-soft"}`} href={`/checkout?plan=${plan.id}`}>{plan.action}</Link>
              <div className="my-6 border-t border-line" />
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-mist">What&apos;s included</p>
              <ul className="space-y-3">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-soft"><Check size={16} className="mt-0.5 shrink-0 text-nova" />{feature}</li>)}</ul>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-mist">Paid plans are securely processed through Stripe. Billing details are shown in Stripe Checkout before you confirm.</p>
      </section>
    </main>
  );
}
