import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.event || !body?.object) return NextResponse.json({ ok: true });

  const supabase = createSupabaseAdminClient();
  const object = body.object;
  const metadata = object.metadata ?? {};
  const subscriptionId = metadata.subscription_id as string | undefined;

  if (body.event === "payment_method.active" && subscriptionId && object.id) {
    await supabase.from("subscriptions").update({ external_payment_method_id: object.id, updated_at: new Date().toISOString() }).eq("id", subscriptionId);
  }

  if ((body.event === "payment.succeeded" || body.event === "payment.canceled") && object.id) {
    const status = body.event === "payment.succeeded" ? "succeeded" : "canceled";
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
      }
    }
  }

  return NextResponse.json({ ok: true });
}
