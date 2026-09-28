export type ModuleKey =
  | "crm" | "sales" | "services" | "products" | "inventory" | "finance"
  | "projects" | "employees" | "documents" | "support" | "reports";

export type IndustryPackageKey =
  | "restaurant" | "retail" | "construction" | "manufacturing" | "automotive"
  | "beauty" | "education" | "logistics" | "professional_services";

export interface ModuleInstallation {
  workspaceId: string;
  moduleKey: ModuleKey;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface IndustryPackageInstallation {
  workspaceId: string;
  packageKey: IndustryPackageKey;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface Permission {
  key: string;
  description?: string;
}

export interface Role {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  permissions: Permission[];
}

export interface AIProviderAdapter {
  readonly provider: string;
  generate(input: AIRequest): Promise<AIResponse>;
}

export interface AIRequest {
  model?: string;
  system?: string;
  messages: Array<{ role: "system" | "user" | "assistant" | "tool"; content: string }>;
  tools?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  model?: string;
  provider?: string;
  usage?: Record<string, number>;
  toolCalls?: Array<Record<string, unknown>>;
}

export interface IntegrationAdapter {
  readonly key: string;
  testConnection(config: Record<string, unknown>): Promise<boolean>;
  execute(action: string, input: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export interface BusinessEvent {
  type: string;
  workspaceId: string;
  recordId?: string;
  entityId?: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}
