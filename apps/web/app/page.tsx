import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function HomePage() {
  const context = await getWorkspaceContext();

  if (context?.activeWorkspace) {
    redirect("/app");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0d12", color: "#f7f8fa", fontFamily: "system-ui", padding: "clamp(24px, 6vw, 72px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", padding: "8px 12px", border: "1px solid #2b3140", borderRadius: 999, color: "#aab2c3", fontSize: 13 }}>
          UNIVERSAL BUSINESS OPERATING SYSTEM
        </div>
        <h1 style={{ fontSize: "clamp(42px, 8vw, 78px)", lineHeight: 0.98, margin: "28px 0 20px", letterSpacing: "-0.04em" }}>
          Один операционный центр для всего бизнеса.
        </h1>
        <p style={{ maxWidth: 720, color: "#aab2c3", fontSize: 19, lineHeight: 1.6 }}>
          UB OS-RUS объединяет клиентов, продажи, услуги, товары, проекты, сотрудников,
          документы, автоматизацию и AI в единой системе.
        </p>

        {!context ? (
          <section style={{ marginTop: 42, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            <Link href="/login" style={{ textDecoration: "none", color: "inherit", border: "1px solid #3b4355", borderRadius: 20, padding: 24, background: "#121620" }}>
              <strong style={{ fontSize: 20 }}>Войти в UB OS-RUS</strong>
              <p style={{ color: "#aab2c3", lineHeight: 1.5 }}>Открыть существующее рабочее пространство.</p>
            </Link>
            <Link href="/login?mode=signup" style={{ textDecoration: "none", color: "inherit", border: "1px solid #3b4355", borderRadius: 20, padding: 24, background: "#121620" }}>
              <strong style={{ fontSize: 20 }}>Создать систему</strong>
              <p style={{ color: "#aab2c3", lineHeight: 1.5 }}>Зарегистрироваться и создать первую организацию.</p>
            </Link>
          </section>
        ) : (
          <section style={{ marginTop: 42, padding: 28, border: "1px solid #3b4355", borderRadius: 20, background: "#121620" }}>
            <h2 style={{ marginTop: 0 }}>Рабочее пространство ещё не создано</h2>
            <p style={{ color: "#aab2c3" }}>После создания организации здесь появится ваш операционный центр.</p>
          </section>
        )}

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {["CRM", "Продажи", "Услуги", "Склад", "Финансы", "Проекты", "Персонал", "AI"].map((item) => (
            <div key={item} style={{ padding: 16, border: "1px solid #242a36", borderRadius: 14, color: "#cbd2df" }}>{item}</div>
          ))}
        </div>
      </div>
    </main>
  );
}
