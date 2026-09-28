import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { AdminModuleStats } from "./modules";
export async function getAdminModuleStats(): Promise<AdminModuleStats> {
 const supabase=await createSupabaseServerClient();
 const {data:claims}=await supabase.auth.getClaims();
 if(!claims?.claims?.sub) redirect("/login");
 const {data,error}=await supabase.rpc("platform_admin_modules");
 if(error||!data) redirect("/app");
 return data as AdminModuleStats;
}
