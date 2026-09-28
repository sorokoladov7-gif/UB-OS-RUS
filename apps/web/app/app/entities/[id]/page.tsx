import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function EntityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getWorkspaceContext();
  if (!context?.activeWorkspace) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: entity } = await supabase
    .from("entity_definitions")
    .select("id, key, name, description")
    .eq("id", id)
    .eq("workspace_id", context.activeWorkspace.id)
    .single();

  if (!entity) notFound();

  const { data: fields } = await supabase
    .from("entity_fields")
    .select("id, key, name, field_type, required, position")
    .eq("entity_id", id)
    .order("position");

  const { data: records } = await supabase
    .from("records")
    .select("id, data, created_at, updated_at")
    .eq("workspace_id", context.activeWorkspace.id)
    .eq("entity_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <a href="/app">← Workspace</a>
      <h1>{entity.name}</h1>
      <p style={{ opacity: 0.7 }}>{entity.description ?? entity.key}</p>

      <section style={{ marginTop: 28 }}>
        <h2>Поля</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(fields ?? []).map((field) => (
            <span key={field.id} style={{ padding: "8px 12px", borderRadius: 999, background: "#eee" }}>
              {field.name} · {field.field_type}
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Записи</h2>
        {(records ?? []).length === 0 ? (
          <p>Записей пока нет.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {(records ?? []).map((record) => (
              <article key={record.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
                <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(record.data, null, 2)}</pre>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
