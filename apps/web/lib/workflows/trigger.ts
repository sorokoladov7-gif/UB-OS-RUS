import type { SupabaseClient } from "@supabase/supabase-js";
import { executeWorkflowById } from "./execute";
type WorkflowTriggerType = "record_created" | "record_updated" | "record_status_changed";

type RecordEvent = {
  workspaceId: string;
  recordId: string;
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  triggerType: Extract<WorkflowTriggerType, "record_created" | "record_updated" | "record_status_changed">;
};

type WorkflowTriggerRow = {
  id: string;
  workspace_id: string;
  trigger_type: WorkflowTriggerType;
  trigger_config: Record<string, unknown>;
};

export async function triggerWorkflowsForRecord(
  supabase: SupabaseClient,
  event: RecordEvent,
) {
  const { data: workflows, error } = await supabase
    .from("workflow_definitions")
    .select("id, workspace_id, trigger_type, trigger_config")
    .eq("workspace_id", event.workspaceId)
    .eq("enabled", true)
    .eq("trigger_type", event.triggerType)
    .returns<WorkflowTriggerRow[]>();

  if (error) throw error;

  const results = [];
  for (const workflow of workflows ?? []) {
    const config = workflow.trigger_config ?? {};
    const configuredEntityId =
      typeof config.entityId === "string" ? config.entityId : undefined;
    const eventEntityId =
      typeof event.record.entityId === "string" ? event.record.entityId : undefined;

    if (configuredEntityId && configuredEntityId !== eventEntityId) {
      continue;
    }

    const context = {
      record: event.record,
      event: {
        type: event.triggerType,
        recordId: event.recordId,
        workspaceId: event.workspaceId,
      },
      ...(event.previousRecord !== undefined
        ? { previousRecord: event.previousRecord }
        : {}),
    };

    results.push(await executeWorkflowById(supabase, workflow.id, context));
  }

  return results;
}
