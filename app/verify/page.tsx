import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VerifyCard from "@/components/auth/VerifyCard";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string; plan?: string }> }) {
  const { email = "", plan } = await searchParams;
  return (
    <main className="auth-shell">
      <Link href={plan ? `/register?plan=${encodeURIComponent(plan)}` : "/register"} className="auth-back"><ArrowLeft size={16} /> Back to create account</Link>
      <VerifyCard email={email} plan={plan} />
      <p className="auth-footnote">Thoughtfully built for the way you think.</p>
    </main>
  );
}
