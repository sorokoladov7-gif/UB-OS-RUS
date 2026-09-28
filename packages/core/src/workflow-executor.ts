import type {
  WorkflowAction,
  WorkflowContext,
  WorkflowExecutionPlan,
} from "./workflow";

export interface WorkflowActionExecutor {
  execute(
    action: WorkflowAction,
    context: WorkflowContext,
  ): Promise<Record<string, unknown> | void>;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  executedActions: number;
  results: Array<Record<string, unknown> | void>;
}

export async function executeWorkflowPlan(
  plan: WorkflowExecutionPlan,
  context: WorkflowContext,
  executor: WorkflowActionExecutor,
): Promise<WorkflowExecutionResult> {
  const results: Array<Record<string, unknown> | void> = [];

  for (const action of plan.actions) {
    results.push(await executor.execute(action, context));
  }

  return {
    workflowId: plan.workflowId,
    executedActions: plan.actions.length,
    results,
  };
}
