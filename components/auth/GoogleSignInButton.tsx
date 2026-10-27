"use client";

import { signInWithPopup, GoogleAuthProvider } from "@firebase/auth";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { checkoutPath, type PlanId } from "@/lib/plans";

export default function GoogleSignInButton({ plan }: { plan?: PlanId | null }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signIn() {
    setBusy(true);
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: await credential.user.getIdToken() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Google sign-in failed.");
      toast.success("Welcome to Nova AI!");
      router.push(plan ? checkoutPath(plan) : "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="secondary" className="w-full" disabled={busy} onClick={signIn}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.74 3.27-8.1Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.15a11 11 0 0 0 0 9.9l3.69-2.84Z" />
        <path fill="#EA4335" d="M12 4.36c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.09 14.97 0 12 0A11 11 0 0 0 2.15 7.05l3.69 2.84C6.71 7.29 9.14 4.36 12 4.36Z" />
      </svg>
      {busy ? "Connecting…" : "Continue with Google"}
    </Button>
  );
}
