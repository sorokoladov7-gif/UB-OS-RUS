export type OrganizationId = string & { readonly __brand: "OrganizationId" };
export type WorkspaceId = string & { readonly __brand: "WorkspaceId" };
export type EntityId = string & { readonly __brand: "EntityId" };
export type RecordId = string & { readonly __brand: "RecordId" };
export interface TenantScope { organizationId: OrganizationId; workspaceId?: WorkspaceId; }
export interface EntityDefinition { id: EntityId; key: string; name: string; description?: string; tenant: TenantScope; }
export interface BusinessRecord { id: RecordId; entityId: EntityId; tenant: TenantScope; values: Record<string, unknown>; }
