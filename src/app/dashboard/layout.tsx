import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <DashboardShell userName={user.name} userRole={user.role}>
      {children}
    </DashboardShell>
  );
}
