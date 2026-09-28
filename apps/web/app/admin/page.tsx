import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminShell } from "./_components/admin-shell";
import { AdminStats } from "./_components/admin-stats";
import { AdminOwnerCard } from "./_components/admin-owner-card";
import { OrganizationsModule } from "./_components/organizations-module";
import { PlansModule } from "./_components/plans-module";
import { PaymentsModule } from "./_components/payments-module";
import type { AdminDashboardData } from "./types";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");

  const { data, error } = await supabase.rpc("platform_admin_dashboard");
  if (error || !data) redirect("/app");

  const dashboard = data as AdminDashboardData;

  return (
    <AdminShell>
      <AdminStats organizations={dashboard.organizations} plans={dashboard.plans} />
      <AdminOwnerCard ownerUserId={dashboard.owner_user_id} />
      <OrganizationsModule organizations={dashboard.organizations} />
      <PlansModule plans={dashboard.plans} />
      <PaymentsModule payments={dashboard.payments} />
    </AdminShell>
  );
}
