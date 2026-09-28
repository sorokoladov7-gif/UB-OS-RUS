import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const context = await getWorkspaceContext();
  if (!context?.activeWorkspace || !context.membership) redirect("/onboarding");

  const supabase = await createSupabaseServerClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status,trial_ends_at,current_period_end,external_payment_method_id")
    .eq("organization_id", context.membership.organization_id)
    .maybeSingle();

  if (!subscription) redirect("/billing/required");

  const now = Date.now();
  const trialExpired = subscription.status === "trialing" && new Date(subscription.trial_ends_at).getTime() <= now && !subscription.external_payment_method_id;
  const periodExpired = subscription.status === "active" && subscription.current_period_end && new Date(subscription.current_period_end).getTime() <= now;
  const blocked = trialExpired || periodExpired || ["past_due","expired","canceled"].includes(subscription.status);

  if (blocked) redirect("/billing/required");

  return <>{children}</>;
}
