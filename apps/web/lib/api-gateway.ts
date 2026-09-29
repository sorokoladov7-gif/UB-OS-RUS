import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ApiPrincipal = {
  apiKeyId: string;
  createdBy: string;
  scopes: string[];
  expiresAt: string | null;
  rawKey: string;
};

function scopesFrom(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((x): x is string => typeof x === "string");
  return [];
}

export async function authenticateApiRequest(request: Request): Promise<ApiPrincipal | null> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const raw = auth.slice(7).trim();
  if (!raw.startsWith("ub_")) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("authenticate_platform_api_key", { p_raw_key: raw });
  if (error || !data?.[0]) return null;

  const row = data[0] as { api_key_id:string; created_by:string; scopes:unknown; expires_at:string|null };
  return {
    apiKeyId: row.api_key_id,
    createdBy: row.created_by,
    scopes: scopesFrom(row.scopes),
    expiresAt: row.expires_at ?? null,
    rawKey: raw,
  };
}

export function hasApiScope(principal: ApiPrincipal, required: string): boolean {
  return principal.scopes.includes(required) || principal.scopes.includes("platform.*") || principal.scopes.includes("platform.read");
}
