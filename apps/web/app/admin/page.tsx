import { getPlatformAdminDashboard } from "./data";
import { AdminShell, AdminStats, AdminOwnerCard, OrganizationsModule, PlansModule, PaymentsModule } from "./_components";

export default async function AdminPage() {
  const dashboard = await getPlatformAdminDashboard();

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
