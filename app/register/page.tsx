import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import { getSessionUserId } from "@/lib/auth";
import { checkoutPath, parsePlan } from "@/lib/plans";
import { redirect } from "next/navigation";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const userId = await getSessionUserId();
  const selectedPlan = parsePlan(plan);
  if (userId) redirect(selectedPlan ? checkoutPath(selectedPlan) : "/dashboard");
  return (
    <main className="auth-shell">
      <Link href="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link>
      <AuthCard mode="register" plan={plan} />
      <p className="auth-footnote">Thoughtfully built for the way you think.</p>
    </main>
  );
}
