import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getCurrentUser } from "@/lib/user-role";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/dashboard/overview");
  return <DashboardClient />;
}
