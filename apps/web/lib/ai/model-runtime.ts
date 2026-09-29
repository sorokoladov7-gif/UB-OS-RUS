// @ts-nocheck
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    const contents = [{ role: "user", parts: [{ text: system ? system + "\\n\\n" + message : message }] }];
    const response = await fetch(url, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({contents}), cache:"no-store" });
    const json = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(String(json?.error?.message || "AI_PROVIDER_ERROR"));
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
    }),
    cache:"no-store",
  });
  const json = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(String(json?.error?.message || json?.message || "AI_PROVIDER_ERROR"));
  const text = json?.choices?.[0]?.message?.content ?? "";
  return { text, provider:model.provider, model:model.model };
}
\nexport async function getAiModelForApiKey(modelId: string, rawKey: string): Promise<AiModelRuntime | null> {\n  const supabase = await createSupabaseServerClient();\n  const { data, error } = await supabase.rpc("get_ai_model_runtime_for_api_key", { p_raw_key: rawKey, p_model_id: modelId });\n  if (error || !data?.[0]) return null;\n  return data[0] as AiModelRuntime;\n}\n