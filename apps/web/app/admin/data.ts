import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminDashboardData } from "./types";

export async function getPlatformAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");

  const { data, error } = await supabase.rpc("platform_admin_dashboard");
  if (error || !data) redirect("/app");

  return data as AdminDashboardData;
}