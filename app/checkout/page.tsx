import { redirect } from "next/navigation";
import CheckoutStarter from "@/components/billing/CheckoutStarter";
import { getSessionUserId } from "@/lib/auth";
import { parsePlan } from "@/lib/plans";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const plan = parsePlan((await searchParams).plan);
  if (!plan) redirect("/pricing");
  const userId = await getSessionUserId();
  if (!userId) redirect(`/login?plan=${plan}`);
  return <CheckoutStarter plan={plan} />;
}
