import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== "Bearer " + process.env.CRON_SECRET) return new NextResponse("Unauthorized", { status: 401 });

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return NextResponse.json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" }, { status: 503 });

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("id,organization_id,plan_id,status,trial_ends_at,current_period_end,external_payment_method_id,subscription_plans(price_monthly,name)")
    .in("status", ["trialing","active"])
    .or("trial_ends_at.lte." + now.toISOString() + ",current_period_end.lte." + now.toISOString())
    .not("external_payment_method_id", "is", null)
    .limit(100);

  let processed = 0;
  for (const sub of subscriptions ?? []) {
    const plan = Array.isArray(sub.subscription_plans) ? sub.subscription_plans[0] : sub.subscription_plans;
    const amount = Number(plan?.price_monthly ?? 0);
    if (!amount) continue;

    const periodStart = sub.current_period_end ? new Date(sub.current_period_end) : now;
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const periodStartIso = periodStart.toISOString();
    const periodEndIso = periodEnd.toISOString();

    const { data: existingPayment } = await supabase
      .from("subscription_payments")
      .select("id,status,provider_payment_id")
      .eq("subscription_id", sub.id)
      .eq("period_start", periodStartIso)
      .maybeSingle();

    if (existingPayment?.status === "succeeded") continue;
    if (existingPayment?.status === "pending" && existingPayment.provider_payment_id) continue;

    let paymentRowId = existingPayment?.id ?? null;
    if (!paymentRowId) {
      const { data: inserted } = await supabase.from("subscription_payments").insert({
        subscription_id: sub.id,
        status: "pending",
        amount,
        currency: "RUB",
        period_start: periodStartIso,
        period_end: periodEndIso,
        metadata: { subscription_id: sub.id, plan_id: sub.plan_id },
      }).select("id").single();
      paymentRowId = inserted?.id ?? null;
    }

    if (!paymentRowId) continue;

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(shopId + ":" + secretKey).toString("base64"),
        "Idempotence-Key": paymentRowId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { value: amount.toFixed(2), currency: "RUB" },
        capture: true,
        payment_method_id: sub.external_payment_method_id,
        description: "Подписка UB OS-RUS: " + (plan?.name ?? "тариф"),
        metadata: { subscription_id: sub.id, subscription_payment_id: paymentRowId },
      }),
      cache: "no-store",
    });

    const payment = await response.json();
    if (!response.ok) {
      await supabase.from("subscription_payments").update({ status: "failed", metadata: { subscription_id: sub.id, error: payment?.description || "YOOKASSA_ERROR" } }).eq("id", paymentRowId);
      continue;
    }

    await supabase.from("subscription_payments").update({ provider_payment_id: payment.id, status: payment.status === "succeeded" ? "succeeded" : "pending", payment_url: payment.confirmation?.confirmation_url ?? null, updated_at: new Date().toISOString() }).eq("id", inserted.id);

    if (payment.status === "succeeded") {
      await supabase.from("subscriptions").update({ status: "active", current_period_start: periodStart.toISOString(), current_period_end: periodEnd.toISOString(), updated_at: new Date().toISOString() }).eq("id", sub.id);
    }
    processed++;
  }

  return NextResponse.json({ ok: true, processed });
}
