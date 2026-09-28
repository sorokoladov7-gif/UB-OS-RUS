# UB OS-RUS — Universal Business Operating System

## Target architecture

UB OS-RUS is a multi-tenant business operating system. Industry applications are packages on top of the same universal core.

```
Organization
  -> Workspace
    -> Entity Definition
      -> Fields
        -> Record
          -> Relations
            -> Workflow
              -> Actions
```

## Layers

### 1. Core
Organizations, workspaces, memberships, branches, roles, permissions and audit.

### 2. Universal Business Engine
Entity definitions, custom fields, statuses, records and record relations. Business objects are metadata-driven instead of hard-coded per industry.

### 3. Workflow Engine
Declarative triggers, conditions and actions. Runs are persisted for auditability and retry/error analysis.

### 4. Business Modules
CRM, sales, services, products, inventory, finance, projects, employees, documents, support and reports. Modules are installable per workspace.

### 5. Industry Packages
Restaurant, retail, construction, manufacturing, automotive, beauty, education, logistics and professional services. A package configures the universal engine and modules instead of creating a separate application architecture.

### 6. AI OS
Workspace-scoped AI agents, conversations, messages and execution runs. Providers are accessed through adapters, allowing Gemini, Groq, OpenRouter, self-hosted or future providers without coupling the business layer to one vendor.

AI must obey workspace permissions and must not become an authorization bypass.

### 7. Integrations
Stable adapters for payments, email, messaging, accounting, webhooks and external APIs. Secrets are represented by server-side references, not browser-readable credentials.

## Security model

- Every tenant-owned table is protected by RLS.
- Authorization is based on memberships and roles, never user-editable metadata.
- Server-only credentials are never sent to the browser.
- Workflow and AI execution operate inside workspace boundaries.
- Audit records are retained independently from UI state.
- Privileged database functions are avoided; when required they must be isolated and explicitly protected.

## Extension strategy

A new business type should normally add:
1. entity definitions;
2. fields and statuses;
3. module configuration;
4. workflows;
5. industry package metadata;
6. optional integration adapters.

The universal core should not be forked for individual industries.

## Runtime flow

```
UI / API
   -> authenticated workspace context
   -> Business Engine
   -> Event
   -> Workflow Engine
   -> Action / AI / Integration
   -> Audit + workflow run
```

This architecture keeps GASTORIQ-style restaurant functionality as an industry package rather than making the universal operating system restaurant-specific.
