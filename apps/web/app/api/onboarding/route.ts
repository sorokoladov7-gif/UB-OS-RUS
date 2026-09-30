import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase.rpc("bootstrap_business_v2", {
    p_organization_name: body.organizationName,
    p_organization_slug: body.organizationSlug,
    p_workspace_name: body.workspaceName,
    p_workspace_slug: body.workspaceSlug,
    p_plan_key: body.planKey,
    p_industry_key: body.industryKey,
  });
  if (error) {
    const message = String(error.message || "BOOTSTRAP_FAILED");
    if (message.includes("USER_ALREADY_HAS_ACTIVE_ORGANIZATION")) {
      return NextResponse.json({ error: "BUSINESS_ALREADY_EXISTS", redirect: "/app" }, { status: 409 });
    }
    if (message.includes("PLAN_NOT_FOUND")) {
      return NextResponse.json({ error: "Выбранный тариф недоступен. Обновите страницу и выберите тариф ещё раз." }, { status: 422 });
    }
    if (message.includes("INDUSTRY_PACKAGE_NOT_FOUND")) {
      return NextResponse.json({ error: "Выбранное направление бизнеса недоступно. Обновите страницу и выберите направление ещё раз." }, { status: 422 });
    }
    if (message.includes("SLUG_ALREADY_EXISTS")) {
      return NextResponse.json({ error: "Бизнес с таким названием уже существует. Укажите другое название." }, { status: 409 });
    }
    console.error("[api/onboarding] bootstrap failed", { code: message });
    return NextResponse.json({ error: "Не удалось создать бизнес-систему. Попробуйте ещё раз." }, { status: 500 });
  }
  return NextResponse.json(data);
}
