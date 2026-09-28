import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { data: memberships } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  if (!organizationId) return NextResponse.json({ error: "ORGANIZATION_REQUIRED" }, { status: 400 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id,plan_id,external_payment_method_id")
    .eq("organization_id", organizationId)
    .single();
  if (!subscription) return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 });
  if (subscription.external_payment_method_id) {
    return NextResponse.json({ error: "SBP_ALREADY_BOUND" }, { status: 409 });
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    return NextResponse.json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" }, { status: 503 });
  }

  const { data: bindingRow, error: rowError } = await supabase
    .from("subscription_payments")
    .insert({
      subscription_id: subscription.id,
      status: "pending",
      amount: 0,
      currency: "RUB",
      metadata: { plan_id: subscription.plan_id, sbp_binding: true },
    })
    .select("id")
    .single();

  if (rowError || !bindingRow) {
    return NextResponse.json({ error: rowError?.message || "PAYMENT_RECORD_FAILED" }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const response = await fetch("https://api.yookassa.ru/v3/payment_methods", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(shopId + ":" + secretKey).toString("base64"),
      "Idempotence-Key": bindingRow.id,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "sbp",
      confirmation: {
        type: "redirect",
        return_url: origin + "/billing/sbp-return",
      },
      metadata: {
        subscription_id: subscription.id,
        subscription_payment_id: bindingRow.id,
      },
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.id) {
    await supabase
      .from("subscription_payments")
      .update({
        status: "failed",
        metadata: { sbp_binding: true, error: data?.description || "YOOKASSA_ERROR" },
        updated_at: new Date().toISOString(),
      })
      .eq("id", bindingRow.id);
    return NextResponse.json({ error: data?.description || "YOOKASSA_ERROR" }, { status: 502 });
  }

  await supabase
    .from("subscription_payments")
    .update({
      provider_payment_id: data.id,
      payment_url: data.confirmation?.confirmation_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bindingRow.id);

  return NextResponse.json({
    confirmationUrl: data.confirmation?.confirmation_url,
    paymentMethodId: data.id,
  });
}
