// @ts-nocheck
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export function isFreeOpenRouterModel(model: string): boolean {
  const value = String(model || "").trim();
  return value === "openrouter/free" || /:free$/i.test(value);
}

export type AiModelRuntime = {
  id: string;
  name: string;
  provider: string;
  model: string;
  base_url: string | null;
  config: Record<string, unknown>;
  enabled: boolean;
  api_key: string | null;
};

export async function getOwnAiModel(id: string): Promise<AiModelRuntime | null> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;
  const { data, error } = await supabase.rpc("get_ai_model_runtime", { p_id: id });
  if (error || !data?.[0]) return null;
  return data[0] as AiModelRuntime;
}

function normalizeBaseUrl(value: string | null | undefined, provider: string): string {
  if (value) return value.replace(/\/$/, "");
  if (provider === "openrouter") return "https://openrouter.ai/api/v1";
  if (provider === "groq") return "https://api.groq.com/openai/v1";
  if (provider === "openai") return "https://api.openai.com/v1";
  if (provider === "ollama") return "http://localhost:11434/v1";
  return "";
}

export async function runAiModel(model: AiModelRuntime, message: string, system?: string) {
  const provider = model.provider.toLowerCase();
  if (!model.enabled) throw new Error("AI_MODEL_DISABLED");
  if (!message.trim()) throw new Error("AI_MESSAGE_REQUIRED");

  if (provider === "gemini" || provider === "google") {
    if (!model.api_key) throw new Error("AI_API_KEY_REQUIRED");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.model)}:generateContent?key=${encodeURIComponent(model.api_key)}`;
    const contents = [{ role: "user", parts: [{ text: system ? system + "\n\n" + message : message }] }];
    const response = await fetch(url, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({contents}), cache:"no-store" });
    const json = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}: ${String(json?.error?.message || "AI_PROVIDER_ERROR")}`);
    const text = json?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("") || "";
    return { text, provider:model.provider, model:model.model };
  }

  const base = normalizeBaseUrl(model.base_url, provider);
  if (!base) throw new Error("AI_BASE_URL_REQUIRED");
  const headers: Record<string,string> = {"content-type":"application/json"};
  if (model.api_key) headers.authorization = `Bearer ${model.api_key}`;
  const response = await fetch(`${base}/chat/completions`, {
    method:"POST",
    headers,
    body:JSON.stringify({
      model:model.model,
      messages:[...(system ? [{role:"system",content:system}] : []),{role:"user",content:message}],
      temperature: typeof model.config?.temperature === "number" ? model.config.temperature : 0.2,
      stream:false,
      ...(provider==="openrouter"?{provider:{allow_fallbacks:true}}:{}),
    }),
    cache:"no-store",
  });
  const json = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(`AI_PROVIDER_HTTP_${response.status}: ${String(json?.error?.message || json?.message || "AI_PROVIDER_ERROR")}`);
  const text = json?.choices?.[0]?.message?.content ?? "";
  return { text, provider:model.provider, model:model.model };
}

/**
 * Platform models are server-only. Regular users authenticate through the
 * normal SSR client, while this runtime catalog is fetched with a separate
 * server secret so API keys never enter the browser or user JWT context.
 */
async function getPlatformRuntimeModels(): Promise<AiModelRuntime[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("platform_ai_runtime_models");
  if (error) throw new Error(`AI_PLATFORM_RUNTIME_ERROR: ${error.message}`);
  return (Array.isArray(data) ? data : []) as AiModelRuntime[];
}

export async function getPlatformDefaultAiModel(): Promise<AiModelRuntime | null> {
  const models = await getPlatformRuntimeModels();
  const model = models.find((x) => x.enabled !== false);
  if (!model) return null;
  if (String(model.provider || "").toLowerCase() === "openrouter" && !isFreeOpenRouterModel(model.model)) return null;
  return model;
}

export async function getPlatformFallbackAiModels(excludeId: string): Promise<AiModelRuntime[]> {
  const models = await getPlatformRuntimeModels();
  return models
    .filter((x) => x?.id && x.id !== excludeId && x.enabled !== false)
    .filter((x) => String(x?.role || "").toLowerCase() === "fallback" || !x?.role)
    .filter((x) => String(x.provider || "").toLowerCase() !== "openrouter" || isFreeOpenRouterModel(x.model))
    .sort((a,b) => Number(a.priority ?? 100) - Number(b.priority ?? 100))
    .slice(0, 5);
}

export async function runPlatformAiModelWithFallback(
  primary: AiModelRuntime,
  message: string,
  system?: string,
): Promise<{text:string;provider:string;model:string;fallbackUsed:boolean;requestedModel:string}> {
  try {
    const result = await runAiModel(primary, message, system);
    return {...result, fallbackUsed:false, requestedModel:primary.model};
  } catch (primaryError) {
    if (!isTransientAiError(primaryError)) throw primaryError;
    const fallbacks = await getPlatformFallbackAiModels(primary.id);
    let lastError: unknown = primaryError;
    for (const fallback of fallbacks) {
      try {
        const result = await runAiModel(fallback, message, system);
        return {...result, fallbackUsed:true, requestedModel:primary.model};
      } catch (fallbackError) {
        lastError = fallbackError;
        if (!isTransientAiError(fallbackError)) break;
      }
    }
    throw lastError;
  }
}

export async function getDefaultAiModel(): Promise<AiModelRuntime | null> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;
  const { data, error } = await supabase.rpc("get_default_ai_model");
  if (error || !data?.[0]) return null;
  return data[0] as AiModelRuntime;
}

function isTransientAiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || "");
  return /(^|[^0-9])(408|429|5[0-9]{2})([^0-9]|$)/.test(message) ||
    /rate.?limit|temporar|timeout|upstream|overloaded|service unavailable/i.test(message);
}

export async function getFallbackAiModels(excludeId: string): Promise<AiModelRuntime[]> {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return [];

  const { data } = await supabase.rpc("list_ai_model_connections");
  const rows = Array.isArray(data) ? data : [];
  const candidates = rows
    .filter((row:any) => row?.id && row.id !== excludeId && row.enabled !== false)
    .filter((row:any) => String(row?.provider || "").toLowerCase() !== "openrouter" || isFreeOpenRouterModel(String(row?.model || "")))
    .sort((a:any,b:any) => {
      const ad = a.is_default ? 1 : 0;
      const bd = b.is_default ? 1 : 0;
      return bd - ad;
    });

  const result: AiModelRuntime[] = [];
  for (const row of candidates.slice(0, 5)) {
    const { data: runtime } = await supabase.rpc("get_ai_model_runtime", { p_id: String(row.id) });
    if (runtime?.[0]?.enabled !== false && runtime?.[0]) {
      const runtimeModel = runtime[0] as AiModelRuntime;
      if (String(runtimeModel.provider || "").toLowerCase() !== "openrouter" || isFreeOpenRouterModel(runtimeModel.model)) {
        result.push(runtimeModel);
      }
    }
  }
  return result;
}

export async function runAiModelWithFallback(
  primary: AiModelRuntime,
  message: string,
  system?: string,
): Promise<{text:string;provider:string;model:string;fallbackUsed:boolean;requestedModel:string}> {
  try {
    const result = await runAiModel(primary, message, system);
    return {...result, fallbackUsed:false, requestedModel:primary.model};
  } catch (primaryError) {
    if (!isTransientAiError(primaryError)) throw primaryError;

    const fallbacks = await getFallbackAiModels(primary.id);
    let lastError: unknown = primaryError;
    for (const fallback of fallbacks) {
      try {
        const result = await runAiModel(fallback, message, system);
        return {...result, fallbackUsed:true, requestedModel:primary.model};
      } catch (fallbackError) {
        lastError = fallbackError;
        if (!isTransientAiError(fallbackError)) break;
      }
    }
    throw lastError;
  }
}
