import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { triggerWorkflowsForRecord } from "@/lib/workflows/trigger";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.workspaceId !== "string" ||
    typeof body.recordId !== "string" ||
    typeof body.triggerType !== "string" ||
    !body.record ||
    typeof body.record !== "object"
  ) {
    return NextResponse.json({ error: "Invalid record event payload" }, { status: 400 });
  }

  if (
    body.triggerType !== "record_created" &&
    body.triggerType !== "record_updated" &&
    body.triggerType !== "record_status_changed"
  ) {
    return NextResponse.json({ error: "Unsupported trigger type" }, { status: 400 });
  }

  try {
    const results = await triggerWorkflowsForRecord(supabase, {
      workspaceId: body.workspaceId,
      recordId: body.recordId,
      record: body.record,
      previousRecord: body.previousRecord,
      triggerType: body.triggerType,
    });

    return NextResponse.json({ triggered: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Workflow trigger failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
