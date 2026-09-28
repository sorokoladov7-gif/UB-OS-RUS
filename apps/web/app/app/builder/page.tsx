import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BusinessBuilder } from "./builder";
export default async function BuilderPage(){
 const supabase=await createSupabaseServerClient(); const {data:claims}=await supabase.auth.getClaims(); if(!claims?.claims?.sub) redirect("/login");
 const {data:membership}=await supabase.from("memberships").select("organization_id").eq("user_id",claims.claims.sub).eq("status","active").maybeSingle(); if(!membership) redirect("/onboarding");
 const {data:workspace}=await supabase.from("workspaces").select("id,name").eq("organization_id",membership.organization_id).order("created_at").limit(1).maybeSingle(); if(!workspace) redirect("/onboarding");
 const {data:entities}=await supabase.from("entity_definitions").select("id,key,name,description").eq("workspace_id",workspace.id).order("name");
 return <BusinessBuilder workspace={workspace} entities={entities??[]}/>;
}