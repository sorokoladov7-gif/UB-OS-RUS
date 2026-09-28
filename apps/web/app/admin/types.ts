export type AdminOrganization = {
  id: string; name: string; slug: string; created_at: string; plan_name: string;
  subscription_status: string; trial_ends_at: string | null; current_period_end: string | null; members: number;
};
export type AdminPlan = { id: string; key: string; name: string; price_monthly: number; trial_days: number; enabled: boolean; position?: number; };
export type AdminPayment = {
  id: string; subscription_id: string; status: string; amount: number; currency: string;
  period_start: string | null; period_end: string | null; created_at: string; organization_name: string; plan_name: string;
};
export type AdminDashboardData = { owner_user_id: string; organizations: AdminOrganization[]; plans: AdminPlan[]; payments: AdminPayment[]; };