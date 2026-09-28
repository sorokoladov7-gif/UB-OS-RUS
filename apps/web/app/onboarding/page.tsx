import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login?mode=signup");
  const params = await searchParams;
  const { data: plans } = await supabase.from("subscription_plans").select("key,name,description,price_monthly,trial_days,features").eq("enabled", true).order("position");
  const selected = params.plan && plans?.some((p) => p.key === params.plan) ? params.plan : plans?.[0]?.key;
  if (!selected) redirect("/login?mode=signup");
  return <OnboardingForm plans={plans ?? []} selectedPlan={selected} />;
}
