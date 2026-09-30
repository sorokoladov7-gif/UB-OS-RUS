// @ts-nocheck
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPlatformDefaultAiModel, runPlatformAiModelWithFallback } from "@/lib/ai/model-runtime";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const model = await getPlatformDefaultAiModel();
  if (!model) return NextResponse.json({
    ok: false,
    status: "not_configured",
    error: "AI_MODEL_NOT_CONFIGURED",
    message: "Основная бесплатная AI-модель не настроена."
  }, { status: 503 });

  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const started = Date.now();
  try {
    const result = await runPlatformAiModelWithFallback(
      model,
      "Проверка AI Core. Ответь строго: AI Core работает.",
      "Ты выполняешь техническую проверку. Ответь коротко."
    );
    if (workspaceId) await supabase.from("ai_runs").insert({
      workspace_id: workspaceId,
      provider: result.provider,
      model: result.model,
      status: "completed",
      input: { message: "AI Core health check" },
      output: { text: result.text, fallbackUsed: result.fallbackUsed },
      started_at: new Date(started).toISOString(),
      finished_at: new Date().toISOString(),
    });
    return NextResponse.json({
      ok: true,
      status: "healthy",
      provider: result.provider,
      model: result.model,
      fallbackUsed: result.fallbackUsed,
      response: result.text,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    if (workspaceId) await supabase.from("ai_runs").insert({
      workspace_id: workspaceId,
      provider: model.provider,
      model: model.model,
      status: "failed",
      input: { message: "AI Core health check" },
      output: { error: message },
      started_at: new Date(started).toISOString(),
      finished_at: new Date().toISOString(),
    });
    return NextResponse.json({
      ok: false,
      status: "unhealthy",
      error: message,
      message: "AI Core не получил ответ от основной модели или её бесплатного fallback."
    }, { status: 502 });
  }
}