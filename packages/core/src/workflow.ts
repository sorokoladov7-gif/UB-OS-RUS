export type WorkflowTriggerType =
  | "record_created"
  | "record_updated"
  | "record_status_changed"
  | "schedule"
  | "manual"
  | "event";

export type WorkflowRunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type WorkflowConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "exists"
  | "not_exists"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export interface WorkflowCondition {
  field: string;
  operator: WorkflowConditionOperator;
  value?: unknown;
}

export type WorkflowActionType =
  | "update_record"
  | "create_record"
  | "add_relation"
  | "remove_relation"
  | "notify"
  | "webhook";

export interface WorkflowAction {
  type: WorkflowActionType;
  config: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  workspaceId: string;
  name: string;
  enabled: boolean;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, unknown>;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
}

export interface WorkflowContext {
  record?: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  event?: Record<string, unknown>;
}

export interface WorkflowExecutionPlan {
  workflowId: string;
  actions: WorkflowAction[];
}

export function getPathValue(
  object: Record<string, unknown> | undefined,
  path: string,
): unknown {
  if (!object) return undefined;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, object);
}

export function evaluateCondition(
  condition: WorkflowCondition,
  context: WorkflowContext,
): boolean {
  const value = getPathValue(context.record, condition.field);

  switch (condition.operator) {
    case "equals":
      return value === condition.value;
    case "not_equals":
      return value !== condition.value;
    case "contains":
      return typeof value === "string" && value.includes(String(condition.value ?? ""));
    case "not_contains":
      return typeof value !== "string" || !value.includes(String(condition.value ?? ""));
    case "exists":
      return value !== undefined && value !== null;
    case "not_exists":
      return value === undefined || value === null;
    case "gt":
      return typeof value === "number" && value > Number(condition.value);
    case "gte":
      return typeof value === "number" && value >= Number(condition.value);
    case "lt":
      return typeof value === "number" && value < Number(condition.value);
    case "lte":
      return typeof value === "number" && value <= Number(condition.value);
  }
}

export function shouldRunWorkflow(
  workflow: WorkflowDefinition,
  context: WorkflowContext,
): boolean {
  if (!workflow.enabled) return false;
  return workflow.conditions.every((condition) =>
    evaluateCondition(condition, context),
  );
}

export function buildExecutionPlan(
  workflow: WorkflowDefinition,
  context: WorkflowContext,
): WorkflowExecutionPlan | null {
  if (!shouldRunWorkflow(workflow, context)) return null;
  return {
    workflowId: workflow.id,
    actions: workflow.actions,
  };
}
