"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/BrandMark";
import type { PlanId } from "@/lib/plans";

const planNames: Record<PlanId, string> = { free: "Free", pro: "Pro", team: "Team" };

export default function CheckoutStarter({ plan }: { plan: PlanId }) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function startCheckout() {
      try {
        const response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const result: { url?: string; error?: string } = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error || "Unable to start checkout.");
        if (!active) return;
        if (plan === "free") router.replace("/dashboard");
        else window.location.assign(result.url);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to start checkout.";
        if (!active) return;
        setError(message);
        toast.error(message);
      }
    }
    void startCheckout();
    return () => { active = false; };
  }, [plan, router]);

  return (
    <main className="auth-shell">
      <section className="auth-card text-center">
        <BrandMark className="mx-auto" />
        <p className="eyebrow mt-6">SECURE PLAN SELECTION</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Continue with {planNames[plan]}</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          {plan === "free"
            ? "Your free Nova workspace is ready. Taking you to your dashboard…"
            : "You’re being securely redirected to Stripe to complete your subscription."}
        </p>
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-mist">
          {error ? <LockKeyhole size={15} /> : <LoaderCircle size={15} className="animate-spin" />}
          {error ? "Checkout could not start" : "Preparing your secure checkout…"}
        </div>
        {error && (
          <div className="mt-5 space-y-3">
            <p className="text-xs leading-relaxed text-mist">For paid plans, the server needs Stripe credentials and configured plan price IDs.</p>
            <Button className="w-full" variant="secondary" onClick={() => router.refresh()}>Try again</Button>
          </div>
        )}
      </section>
    </main>
  );
}
