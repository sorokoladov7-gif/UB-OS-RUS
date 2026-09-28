# Runtime architecture

The first product runtime follows a strict server boundary:

Browser
-> Next.js App Router
-> authenticated Supabase SSR client
-> RLS
-> Universal Business Engine

Authenticated routes must obtain claims with Supabase Auth. Tenant ownership is never inferred from browser-provided organization IDs alone.

Workspace context is resolved from the authenticated user's active memberships and available workspaces. Entity and record queries additionally constrain the active workspace.

The next runtime layers are:
- command/API handlers for mutations;
- universal record forms generated from entity_fields;
- workflow dispatch after mutations;
- AI tool execution with permission checks;
- integration adapters behind server-only boundaries.
