# Workflow execution

The first server execution layer is available at `POST /api/workflows/execute`.

## Request

```json
{
  "workflowId": "workflow-uuid",
  "record": { "status": "new" },
  "previousRecord": {},
  "event": { "recordId": "record-uuid" }
}
```

The route requires an authenticated Supabase user. Row-level security remains the authorization boundary.

## First supported action

`update_record` updates the target record's `data` JSON object:

```json
{
  "type": "update_record",
  "config": {
    "recordId": "record-uuid",
    "data": { "status": "processed" }
  }
}
```

Every matched execution is recorded in `workflow_runs` and transitions through `queued` -> `running` -> `succeeded` or `failed`.

Additional actions will be enabled incrementally after their authorization and idempotency rules are defined.
