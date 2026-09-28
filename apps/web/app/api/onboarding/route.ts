import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.rpc("bootstrap_business", {
    p_organization_name: body.organizationName,
    p_organization_slug: body.organizationSlug,
    p_workspace_name: body.workspaceName,
    p_workspace_slug: body.workspaceSlug,
    p_plan_key: body.planKey,
  });
  if (error) return NextResponse.json({ error: error.message || "BOOTSTRAP_FAILED" }, { status: 400 });
  return NextResponse.json(data);
}
