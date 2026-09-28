# Database Foundation

PostgreSQL through Supabase.

## Domains

- Core: organizations, workspaces, memberships, branches, audit_logs
- RBAC: roles, permissions, role_permissions, membership_roles
- Universal Business Engine: entity_definitions, entity_fields, statuses, records, record_relations
- Workflow Engine: workflow_definitions, workflow_runs
- Modules: module_definitions, workspace_modules
- Industry packages: industry_packages, workspace_industry_packages
- AI OS: ai_agents, ai_conversations, ai_messages, ai_runs
- Integrations: integrations, integration_connections, webhook_endpoints
- Business support: documents, activities

All tenant-owned exposed tables use RLS. Authorization is based on trusted membership data. Secrets are represented by server-side references rather than browser-readable credentials.
