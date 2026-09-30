# UB OS-RUS

## Universal Business Operating System

Universal multi-tenant operating system for businesses and service organizations.

### Commercial model

- Every new organization selects a plan during onboarding.
- Each plan starts with a **10-day trial**.
- After the trial, access requires an active subscription.
- Payments are designed for **SBP through YooKassa**.
- Where supported, the first paid SBP transaction can enable subsequent automatic renewals.
- The platform has exactly **one platform owner/admin**; customer organization owners are separate from the platform administrator.

### Platform layers

1. Core tenancy, memberships, RBAC, branches and audit
2. Universal Business Engine
3. Workflow Engine
4. Business modules
5. Industry packages
6. AI OS
7. Integration adapters

### Stack

Next.js, TypeScript, React, PostgreSQL/Supabase, Vercel, GitHub.

### Security baseline

- strict tenant isolation with PostgreSQL RLS
- explicit RBAC
- platform owner/admin stored separately from customer roles
- no authorization through user-editable metadata
- server-only payment secrets
- auditable workflow and AI execution
- provider-neutral AI and integration adapters

<!-- deployment trigger: module build verification -->
