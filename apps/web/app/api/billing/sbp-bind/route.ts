import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { data: memberships } = await supabase.from("memberships").select("organization_id").eq("user_id", userId).eq("status", "active").limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  if (!organizationId) return NextResponse.json({ error: "ORGANIZATION_REQUIRED" }, { status: 400 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id,plan_id,subscription_plans(name,price_monthly)")
    .eq("organization_id", organizationId).single();
  if (!subscription) return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 });

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return NextResponse.json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" }, { status: 503 });

  const plan = Array.isArray(subscription.subscription_plans) ? subscription.subscription_plans[0] : subscription.subscription_plans;
  const amount = Number(plan?.price_monthly ?? 0);
  if (!amount) return NextResponse.json({ error: "PLAN_PRICE_INVALID" }, { status: 400 });

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data: paymentRow, error: rowError } = await supabase.from("subscription_payments").insert({
    subscription_id: subscription.id,
    status: "pending",
    amount,
    currency: "RUB",
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    metadata: { plan_id: subscription.plan_id, first_paid_payment: true },
  }).select("id").single();

  if (rowError || !paymentRow) return NextResponse.json({ error: rowError?.message || "PAYMENT_RECORD_FAILED" }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(shopId + ":" + secretKey).toString("base64"),
      "Idempotence-Key": paymentRow.id,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: amount.toFixed(2), currency: "RUB" },
      capture: true,
      payment_method_data: { type: "sbp" },
      save_payment_method: true,
      confirmation: { type: "redirect", return_url: origin + "/billing/sbp-return" },
      description: "Подписка UB OS-RUS: " + (plan?.name ?? "тариф"),
      metadata: { subscription_id: subscription.id, subscription_payment_id: paymentRow.id },
    }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    await supabase.from("subscription_payments").update({ status: "failed", metadata: { error: data?.description || "YOOKASSA_ERROR" } }).eq("id", paymentRow.id);
    return NextResponse.json({ error: data?.description || "YOOKASSA_ERROR" }, { status: 502 });
  }

  await supabase.from("subscription_payments").update({ provider_payment_id: data.id, payment_url: data.confirmation?.confirmation_url ?? null, updated_at: new Date().toISOString() }).eq("id", paymentRow.id);
  return NextResponse.json({ confirmationUrl: data.confirmation?.confirmation_url, paymentId: data.id });
}
