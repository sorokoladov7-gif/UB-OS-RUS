# UB OS-RUS Architecture

## Product goal

Universal, multi-tenant operating system for businesses and services.

## Core model

Organization -> Workspace -> Entity -> Record -> Fields -> Relations -> Workflow -> Actions

## Layers

- Core: organizations, workspaces, users, memberships, roles, permissions, branches, settings, audit
- Universal Business Engine: entities, fields, records, statuses, relations, views
- Workflow Engine: triggers, conditions, actions, schedules, workflow runs
- Modules: CRM, sales, services, products, inventory, finance, projects, employees, documents, support
- Industry packages: configurable packages built on the same core
- AI: assistant, agents, natural-language commands, analytics and automation
- Integrations: payments, messaging, email, accounting, APIs and webhooks

## Architecture rules

1. No industry-specific tables in the core.
2. Business objects use entity definitions plus records and metadata.
3. Tenant-owned rows are tenant-scoped and database-protected.
4. Permissions are explicit and auditable.
5. Business actions are traceable through audit and workflow history.
6. External providers are replaceable behind adapters.
