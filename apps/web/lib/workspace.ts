import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function getWorkspaceContext() {
 const supabase=await createSupabaseServerClient(); const {data:claimsData}=await supabase.auth.getClaims(); const userId=claimsData?.claims?.sub; if(!userId)return null;
 const {data:owner}=await supabase.from("platform_settings").select("owner_user_id").eq("id",true).maybeSingle(); if(owner?.owner_user_id===userId)return null;
 const {data:memberships,error}=await supabase.from("memberships").select("id,organization_id,status").eq("user_id",userId).eq("status","active"); if(error||!memberships?.length)return null;
 const organizationIds=memberships.map(m=>m.organization_id); const {data:workspaces}=await supabase.from("workspaces").select("id,organization_id,name,slug").in("organization_id",organizationIds).order("created_at");
 return {userId,membership:memberships[0],workspaces:workspaces??[],activeWorkspace:workspaces?.[0]??null};
}