import { notFound, redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import DashboardSectionClient from "@/components/dashboard/DashboardSectionClient";
import { getCurrentUser } from "@/lib/user-role";

const adminSections = ["overview", "users", "analytics", "reports", "settings"] as const;
type AdminSection = (typeof adminSections)[number];

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section !== "chat" && section !== "profile" && !adminSections.includes(section as AdminSection)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (section === "chat") return <DashboardClient />;
  if (section !== "profile" && user.role !== "admin") redirect("/dashboard");

  return (
    <DashboardSectionClient
      role={user.role}
      section={section as AdminSection | "profile"}
      initialUser={user}
    />
  );
}
