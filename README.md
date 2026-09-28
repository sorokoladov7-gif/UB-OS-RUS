# UB OS-RUS

## Universal Business Operating System

Universal multi-tenant operating system for businesses and service organizations.

### Core model

Organization -> Workspace -> Entity -> Record -> Fields -> Relations -> Workflow -> Actions

### Principles

- multi-tenant by design
- database-enforced tenant isolation
- universal metadata-driven business model
- explicit RBAC and auditability
- modular business capabilities
- declarative workflows and automation
- provider-neutral AI layer
- integrations through stable adapters
- industry packages on top of the universal core

### Stack

Next.js, TypeScript, PostgreSQL/Supabase, Vercel, GitHub, pnpm workspace.

### Repository

- `apps/web` — main web application
- `packages/core` — domain contracts
- `packages/config` — shared configuration
- `packages/ui` — shared UI primitives
- `docs/architecture` — architecture decisions
- `docs/database` — database design
- `docs/roadmap` — implementation roadmap
- `supabase/migrations` — database migrations
