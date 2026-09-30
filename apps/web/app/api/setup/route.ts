import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const workspaceId = String(body.workspaceId || "");
  const modules = Array.isArray(body.modules) ? body.modules.map((x:any)=>String(x).trim()).filter(Boolean) : [];
  if (!workspaceId) return NextResponse.json({ error: "WORKSPACE_REQUIRED" }, { status: 400 });
  if (!modules.length) return NextResponse.json({ error: "Выберите хотя бы один модуль." }, { status: 400 });

  const { data: workspace } = await supabase.from("workspaces").select("id,name,organization_id").eq("id",workspaceId).maybeSingle();
  if (!workspace) return NextResponse.json({ error:"WORKSPACE_NOT_FOUND" },{status:404});
  const { data: membership } = await supabase.from("memberships").select("organization_id,default_role_key").eq("organization_id",workspace.organization_id).eq("user_id",uid).eq("status","active").maybeSingle();
  if (!membership || !["owner","admin"].includes(String(membership.default_role_key))) return NextResponse.json({error:"WORKSPACE_ADMIN_REQUIRED"},{status:403});

  const results=[];
  for(const moduleKey of [...new Set(modules)]){
    const {data,error}=await supabase.rpc("install_workspace_module",{p_workspace_id:workspaceId,p_module_key:moduleKey});
    if(error) return NextResponse.json({error:error.message||"MODULE_INSTALL_FAILED",module:moduleKey},{status:400});
    results.push(data);
  }
  return NextResponse.json({ok:true,workspaceId,installed:results});
}