import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SetupWizard from "./setup-wizard";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ industry?: string }> }) {
  const context = await getWorkspaceContext();
  if (!context?.membership || !context.activeWorkspace) redirect("/onboarding");
  const supabase = await createSupabaseServerClient();
  const { industry } = await searchParams;
  const { data: modules } = await supabase.from("module_definitions").select("key,name,description").order("key");
  const { data: installed } = await supabase.from("workspace_modules").select("module_id,module_definitions(key)").eq("workspace_id",context.activeWorkspace.id);
  const { data: industryPackage } = industry ? await supabase.from("industry_packages").select("key,name,description,config").eq("key",industry).maybeSingle() : {data:null};
  const recommended = Array.isArray((industryPackage?.config as any)?.module_keys) ? (industryPackage?.config as any).module_keys : [];
  return <SetupWizard workspace={context.activeWorkspace} modules={modules??[]} installed={installed??[]} recommended={recommended} industryName={industryPackage?.name??"Ваш бизнес"} />;
}