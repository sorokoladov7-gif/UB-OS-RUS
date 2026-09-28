# Automatic record triggers

The Workflow Engine now exposes `POST /api/workflows/trigger`.

Supported event types:

- `record_created`
- `record_updated`
- `record_status_changed`

The trigger endpoint:
1. validates the authenticated Supabase user;
2. limits workflow lookup to the supplied workspace;
3. selects only enabled workflows matching the event type;
4. optionally filters by `trigger_config.entityId`;
5. evaluates workflow conditions;
6. creates a `workflow_runs` row;
7. executes supported actions;
8. records success or failure.

Example payload:

```json
{
  "workspaceId": "workspace-uuid",
  "recordId": "record-uuid",
  "triggerType": "record_created",
  "record": {
    "entityId": "entity-uuid",
    "status": "new",
    "customer": "Alex"
  }
}
```

For a workflow limited to one entity, set:

```json
{ "entityId": "entity-uuid" }
```

in `trigger_config`.
