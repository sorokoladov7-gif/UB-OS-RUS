import Link from "next/link";

export default function SbpReturnPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0d12", color: "white", fontFamily: "system-ui", padding: 20 }}>
      <section style={{ maxWidth: 620, padding: 32, border: "1px solid #303747", borderRadius: 20, background: "#121620" }}>
        <h1>СБП подключается</h1>
        <p style={{ color: "#aab2c3", lineHeight: 1.6 }}>ЮKassa проверяет привязку счета. После подтверждения система автоматически сохранит способ оплаты для будущего продления подписки.</p>
        <Link href="/app" style={{ color: "white" }}>Вернуться в UB OS-RUS →</Link>
      </section>
    </main>
  );
}
