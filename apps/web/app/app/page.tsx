import Link from "next/link";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function AppPage() {
  const context = await getWorkspaceContext();

  if (!context) {
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: 40, fontFamily: "system-ui" }}>
        <h1>UB OS-RUS</h1>
        <p>Нет активного Workspace.</p>
      </main>
    );
  }

  const workspace = context.activeWorkspace;
  const { data: entities } = workspace
    ? await (await import("@/lib/supabase/server")).createSupabaseServerClient()
        .then((supabase) =>
          supabase.from("entity_definitions").select("id, key, name, description").eq("workspace_id", workspace.id).order("name")
        )
    : { data: [] };

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.65 }}>UB OS-RUS</div>
          <h1 style={{ margin: "6px 0" }}>{workspace?.name ?? "Workspace"}</h1>
          <p style={{ margin: 0, opacity: 0.7 }}>Universal Business Operating System</p>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          Организаций: {new Set(context.workspaces.map((w) => w.organization_id)).size}
        </div>
      </header>

      <section style={{ marginTop: 36 }}>
        <h2>Бизнес-объекты</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {(entities ?? []).map((entity) => (
            <Link key={entity.id} href={`/app/entities/${entity.id}`} style={{ textDecoration: "none", color: "inherit", border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
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
