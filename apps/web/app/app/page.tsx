import Link from "next/link";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SbpBindButton from "./sbp-bind-button";

export default async function AppPage() {
  const context = await getWorkspaceContext();

  if (!context?.membership) {
    return (
      <div style={{position:"fixed",top:18,right:18,zIndex:10}}><a href="/app/builder" style={{padding:"10px 14px",border:"1px solid #303747",borderRadius:12,color:"#fff",background:"#121620",textDecoration:"none"}}>Конструктор бизнеса</a></div><main style={{ maxWidth: 760, margin: "0 auto", padding: 40, fontFamily: "system-ui" }}>
        <h1>UB OS-RUS</h1>
        <p>Нет активного Workspace.</p>
      </main>
    );
  }

  const workspace = context.activeWorkspace;
  if (!workspace) { return null; }
  const supabase = await createSupabaseServerClient();
  const { data: entities } = workspace
    ? await supabase.from("entity_definitions").select("id, key, name, description").eq("workspace_id", workspace.id).order("name")
    : { data: [] };

  const organizationId = context.membership.organization_id;
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status,trial_ends_at,current_period_end,external_payment_method_id,subscription_plans(name,price_monthly)")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const { data: owner } = await supabase.from("platform_settings").select("owner_user_id").eq("id", true).maybeSingle();
  const isPlatformOwner = owner?.owner_user_id === context.userId;
  const plan = Array.isArray(subscription?.subscription_plans) ? subscription.subscription_plans[0] : subscription?.subscription_plans;

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.65 }}>UB OS-RUS {isPlatformOwner ? "· PLATFORM ADMIN" : ""}</div>
          <h1 style={{ margin: "6px 0" }}>{workspace?.name ?? "Workspace"}</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Universal Business Operating System</p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          {isPlatformOwner && <Link href="/admin" style={{padding:"10px 14px",border:"1px solid #111",borderRadius:12,textDecoration:"none",color:"inherit"}}>⚙ Админ платформы</Link>}
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
            Организаций: {new Set(context.workspaces.map((w) => w.organization_id)).size}
          </div>
        </div>
      </header>

      {subscription && (
        <section style={{ marginTop: 28, padding: 20, border: "1px solid #ddd", borderRadius: 16 }}>
          <strong>Подписка: {plan?.name ?? "Тариф"}</strong>
          <div style={{ marginTop: 6, opacity: 0.7 }}>
            {subscription.status === "trialing"
              ? "Пробный период до " + new Date(subscription.trial_ends_at).toLocaleDateString("ru-RU")
              : subscription.status === "active"
                ? "Активна до " + (subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString("ru-RU") : "—")
                : "Статус: " + subscription.status}
          </div>
          {!subscription.external_payment_method_id && (
            <div style={{ marginTop: 14 }}>
              <SbpBindButton />
              <div style={{ marginTop: 7, fontSize: 12, opacity: 0.65 }}>СБП привязывается без списания денег. Первое списание — после окончания 10-дневного пробного периода.</div>
            </div>
          )}
        </section>
      )}

      <section style={{ marginTop: 36 }}>
        <h2>Бизнес-объекты</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {(entities ?? []).map((entity) => (
            <Link key={entity.id} href={"/app/entities/" + entity.id} style={{ textDecoration: "none", color: "inherit", border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
              <strong>{entity.name}</strong>
              <div style={{ opacity: 0.6, marginTop: 6 }}>{entity.key}</div>
              {entity.description && <p style={{ opacity: 0.7 }}>{entity.description}</p>}
            </Link>
          ))}
          {(!entities || entities.length === 0) && (
            <div style={{ border: "1px dashed #aaa", borderRadius: 16, padding: 20 }}>
              Создайте первую сущность — например «Клиенты», «Заказы» или «Заявки».
            </div>
          )}
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <h2>Платформа</h2>
        <p>CRM · Продажи · Услуги · Товары · Склад · Финансы · Проекты · Персонал · Документы · Поддержка · AI</p>
      </section>
    </main>
  );
}
