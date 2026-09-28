import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { executeWorkflowById } from "@/lib/workflows/execute";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.workflowId !== "string") {
    return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
  }

  try {
    const result = await executeWorkflowById(supabase, body.workflowId, {
      record: body.record,
      previousRecord: body.previousRecord,
      event: body.event,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow execution failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
