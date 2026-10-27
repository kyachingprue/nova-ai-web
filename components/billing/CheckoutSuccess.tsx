"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function CheckoutSuccess() {
  const sessionId = useSearchParams().get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function confirm() {
      try {
        if (!sessionId) throw new Error("Missing Stripe checkout session.");
        const response = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to confirm your subscription.");
        if (active) setStatus("success");
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Unable to confirm your subscription.");
        setStatus("error");
      }
    }
    void confirm();
    return () => { active = false; };
  }, [sessionId]);

  return (
    <main className="auth-shell">
      <section className="auth-card text-center">
        <BrandMark className="mx-auto" />
        {status === "loading" ? (
          <>
            <LoaderCircle className="mx-auto mt-7 animate-spin text-nova" size={28} />
            <h1 className="mt-5 font-display text-2xl font-semibold">Confirming your plan…</h1>
            <p className="mt-2 text-sm text-mist">Verifying the secure Stripe checkout with your account.</p>
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="mx-auto mt-7 text-emerald-500" size={34} />
            <h1 className="mt-5 font-display text-2xl font-semibold">You’re all set.</h1>
            <p className="mt-2 text-sm text-mist">Your subscription is connected to your Nova account.</p>
            <Link href="/dashboard" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-nova text-sm font-semibold text-white">Go to dashboard</Link>
          </>
        ) : (
          <>
            <h1 className="mt-7 font-display text-2xl font-semibold">Payment needs confirmation</h1>
            <p className="mt-2 text-sm leading-relaxed text-mist">{error}</p>
            <p className="mt-2 text-xs text-mist">If your payment succeeded, allow a moment for Stripe to process it, then contact support before trying to pay again.</p>
            <Link href="/dashboard" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-line-strong text-sm font-semibold">Return to dashboard</Link>
          </>
        )}
      </section>
    </main>
  );
}
