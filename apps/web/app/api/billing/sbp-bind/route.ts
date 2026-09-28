import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function baseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { data: memberships } = await supabase.from("memberships").select("organization_id").eq("user_id", userId).eq("status", "active").limit(1);
  const organizationId = memberships?.[0]?.organization_id;
  if (!organizationId) return NextResponse.json({ error: "ORGANIZATION_REQUIRED" }, { status: 400 });

  const { data: subscription } = await supabase.from("subscriptions").select("id").eq("organization_id", organizationId).single();
  if (!subscription) return NextResponse.json({ error: "SUBSCRIPTION_NOT_FOUND" }, { status: 404 });

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) return NextResponse.json({ error: "PAYMENT_PROVIDER_NOT_CONFIGURED" }, { status: 503 });

  const response = await fetch("https://api.yookassa.ru/v3/payment_methods", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(shopId + ":" + secretKey).toString("base64"),
      "Idempotence-Key": crypto.randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "sbp",
      confirmation: { type: "redirect", return_url: baseUrl(request) + "/billing/sbp-return" },
      metadata: { subscription_id: subscription.id },
    }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) return NextResponse.json({ error: data?.description || "YOOKASSA_ERROR" }, { status: 502 });
  return NextResponse.json({ confirmationUrl: data.confirmation?.confirmation_url, paymentMethodId: data.id });
}
