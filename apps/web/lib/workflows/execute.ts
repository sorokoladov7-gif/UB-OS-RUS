import type { SupabaseClient } from "@supabase/supabase-js";

type WorkflowAction = { type: string; config: Record<string, unknown> };
type WorkflowCondition = { field: string; operator: string; value?: unknown };
type WorkflowDefinition = {
  id: string; workspaceId: string; name: string; enabled: boolean;
  triggerType: string; triggerConfig: Record<string, unknown>;
  conditions: WorkflowCondition[]; actions: WorkflowAction[];
};
type WorkflowContext = {
  record?: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  event?: Record<string, unknown>;
};
function pathValue(object: Record<string, unknown> | undefined, path: string): unknown {
  if (!object) return undefined;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, object);
}
function matches(condition: WorkflowCondition, context: WorkflowContext): boolean {
  const value = pathValue(context.record, condition.field);
  switch (condition.operator) {
    case "equals": return value === condition.value;
    case "not_equals": return value !== condition.value;
    case "contains": return typeof value === "string" && value.includes(String(condition.value ?? ""));
    case "not_contains": return typeof value !== "string" || !value.includes(String(condition.value ?? ""));
    case "exists": return value !== undefined && value !== null;
    case "not_exists": return value === undefined || value === null;
    case "gt": return typeof value === "number" && value > Number(condition.value);
    case "gte": return typeof value === "number" && value >= Number(condition.value);
    case "lt": return typeof value === "number" && value < Number(condition.value);
    case "lte": return typeof value === "number" && value <= Number(condition.value);
    default: return false;
  }
}
function buildExecutionPlan(workflow: WorkflowDefinition, context: WorkflowContext) {
  if (!workflow.enabled || !workflow.conditions.every((condition) => matches(condition, context))) return null;
  return { workflowId: workflow.id, actions: workflow.actions };
}
async function executeWorkflowPlan(
  plan: { workflowId: string; actions: WorkflowAction[] },
  context: WorkflowContext,
  executor: { execute(action: WorkflowAction, context: WorkflowContext): Promise<Record<string, unknown> | void> },
) {
  const results: Array<Record<string, unknown> | void> = [];
  for (const action of plan.actions) results.push(await executor.execute(action, context));
  return { workflowId: plan.workflowId, executedActions: plan.actions.length, results };
}

type WorkflowRow = {
  id: string; workspace_id: string; name: string; enabled: boolean;
  trigger_type: WorkflowDefinition["triggerType"];
  trigger_config: Record<string, unknown>;
  conditions: WorkflowDefinition["conditions"];
  actions: WorkflowDefinition["actions"];
};

function toWorkflow(row: WorkflowRow): WorkflowDefinition {
  return { id: row.id, workspaceId: row.workspace_id, name: row.name, enabled: row.enabled,
    triggerType: row.trigger_type, triggerConfig: row.trigger_config ?? {},
    conditions: row.conditions ?? [], actions: row.actions ?? [] };
}
function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function createActionExecutor(supabase: SupabaseClient) {
  return {
    async execute(action: WorkflowAction, context: WorkflowContext) {
      if (action.type !== "update_record") {
        throw new Error("Action " + action.type + " is not enabled in the first execution layer");
      }
      const recordId = String(action.config.recordId ?? context.event?.recordId ?? "");
      if (!recordId) throw new Error("update_record requires recordId");
      const patch = asRecord(action.config.data);
      if (Object.keys(patch).length === 0) throw new Error("update_record requires non-empty data");
      const { data, error } = await supabase.from("records").update({ data: patch })
        .eq("id", recordId).select("id, data, updated_at").single();
      if (error) throw error;
      return { type: action.type, record: data };
    },
  };
}

export async function executeWorkflowById(supabase: SupabaseClient, workflowId: string, context: WorkflowContext) {
  const { data: row, error: workflowError } = await supabase.from("workflow_definitions")
    .select("id, workspace_id, name, enabled, trigger_type, trigger_config, conditions, actions")
    .eq("id", workflowId).single<WorkflowRow>();
  if (workflowError) throw workflowError;
  const workflow = toWorkflow(row);
  const plan = buildExecutionPlan(workflow, context);
  if (!plan) return { matched: false, workflowId };

  const { data: run, error: runError } = await supabase.from("workflow_runs").insert({
    workflow_id: workflow.id, workspace_id: workflow.workspaceId,
    record_id: typeof context.event?.recordId === "string" ? context.event.recordId : null,
    status: "queued", input: context,
  }).select("id").single<{ id: string }>();
  if (runError) throw runError;

  await supabase.from("workflow_runs").update({ status: "running", started_at: new Date().toISOString() }).eq("id", run.id);
  try {
    const result = await executeWorkflowPlan(plan, context, createActionExecutor(supabase));
    const { error } = await supabase.from("workflow_runs").update({
      status: "succeeded", output: result, finished_at: new Date().toISOString(),
    }).eq("id", run.id);
    if (error) throw error;
    return { matched: true, runId: run.id, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabase.from("workflow_runs").update({
      status: "failed", error: { message }, finished_at: new Date().toISOString(),
    }).eq("id", run.id);
    throw error;
  }
}
