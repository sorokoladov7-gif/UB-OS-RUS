# UB OS-RUS

## Universal Business Operating System

Universal multi-tenant operating system for businesses and service organizations.

### Architecture

**Organization -> Workspace -> Entity -> Record -> Relations -> Workflow -> Actions**

The platform is industry-neutral. CRM, sales, services, products, inventory, finance, projects, employees, documents, support and reports are installable business modules. Restaurant, retail, construction, manufacturing, automotive, beauty, education, logistics and professional-services capabilities are industry packages on top of the same core.

### Platform layers

1. Core tenancy, memberships, RBAC, branches and audit
2. Universal Business Engine
3. Workflow Engine
4. Business modules
5. Industry packages
6. AI OS
7. Integration adapters

### Stack

Next.js, TypeScript, React, PostgreSQL/Supabase, Vercel, GitHub and pnpm workspace.

### Repository

- `apps/web` — web application and server API
- `packages/core` — domain contracts and workflow engine
- `packages/config` — shared configuration
- `packages/ui` — shared UI primitives
- `docs/architecture` — architecture and decisions
- `docs/database` — database design
- `docs/roadmap` — implementation roadmap
- `docs/workflows` — workflow execution
- `supabase/migrations` — database migrations

### Security baseline

- strict tenant isolation with PostgreSQL RLS
- explicit RBAC
- no authorization through user-editable metadata
- server-only secrets
- auditable workflow and AI execution
- provider-neutral AI and integration adapters
