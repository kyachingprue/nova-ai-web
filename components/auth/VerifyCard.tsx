"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkoutPath, parsePlan } from "@/lib/plans";
import BrandMark from "@/components/BrandMark";

export default function VerifyCard({ email, plan }: { email: string; plan?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Verification failed.");
      toast.success("Account verified — welcome to Nova!");
      const selectedPlan = parsePlan(plan);
      router.push(selectedPlan ? checkoutPath(selectedPlan) : "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card text-center">
      <Link href="/" className="auth-brand justify-center"><BrandMark />Nova AI</Link>
      <span className="verify-icon"><MailCheck size={27} /></span>
      <p className="eyebrow">ONE LAST STEP</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Check your inbox</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-mist">We sent a 6-digit verification code to <strong className="break-all text-ink">{email || "your email address"}</strong>. It expires in 10 minutes.</p>
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <Input aria-label="Verification code" className="h-14 text-center font-mono text-2xl tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" placeholder="000000" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} />
        <Button className="w-full" size="lg" disabled={busy || code.length !== 6 || !email} type="submit">{busy ? <LoaderCircle className="animate-spin" size={17} /> : null}Verify email</Button>
      </form>
      <p className="mt-6 text-sm text-mist">Didn&apos;t receive it? Check your spam folder or <Link className="font-semibold text-nova hover:underline" href={plan ? `/register?plan=${encodeURIComponent(plan)}` : "/register"}>try again</Link>.</p>
    </section>
  );
}
