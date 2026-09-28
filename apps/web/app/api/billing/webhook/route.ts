import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function yookassaGet(path: string) {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return null;
  const response = await fetch("https://api.yookassa.ru/v3/" + path, {
    headers: { Authorization: "Basic " + Buffer.from(shopId + ":" + secretKey).toString("base64") },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.event || !body?.object) return NextResponse.json({ ok: true });

  const supabase = createSupabaseAdminClient();
  const object = body.object;
  const metadata = object.metadata ?? {};
  const subscriptionId = metadata.subscription_id as string | undefined;

  if (body.event === "payment_method.active" && subscriptionId && object.id) {
    const verified = await yookassaGet("payment_methods/" + object.id);
    if (!verified || verified.status !== "active" || verified.saved !== true) return NextResponse.json({ ok: false }, { status: 400 });
    await supabase.from("subscriptions").update({ external_payment_method_id: verified.id, updated_at: new Date().toISOString() }).eq("id", subscriptionId);
  }

  if ((body.event === "payment.succeeded" || body.event === "payment.canceled") && object.id) {
    const verified = await yookassaGet("payments/" + object.id);
    if (!verified) return NextResponse.json({ ok: false }, { status: 400 });
    const status = verified.status === "succeeded" ? "succeeded" : verified.status === "canceled" ? "canceled" : null;
    if (!status) return NextResponse.json({ ok: true });

    const { data: payment } = await supabase.from("subscription_payments").select("id,subscription_id,period_start,period_end").eq("provider_payment_id", object.id).maybeSingle();
    if (payment) {
      await supabase.from("subscription_payments").update({ status, updated_at: new Date().toISOString() }).eq("id", payment.id);
      if (status === "succeeded") {
        await supabase.from("subscriptions").update({
          status: "active",
          current_period_start: payment.period_start,
          current_period_end: payment.period_end,
          updated_at: new Date().toISOString(),
        }).eq("id", payment.subscription_id);
      } else {
        await supabase.from("subscriptions").update({ status: "past_due", updated_at: new Date().toISOString() }).eq("id", payment.subscription_id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
