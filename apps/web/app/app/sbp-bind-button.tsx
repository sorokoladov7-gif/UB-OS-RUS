"use client";

import { useState } from "react";

export default function SbpBindButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function bind() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/billing/sbp-bind", { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error || "Не удалось открыть привязку СБП.");
    else if (data.confirmationUrl) window.location.href = data.confirmationUrl;
    else setError("ЮKassa не вернула ссылку подтверждения.");
    setBusy(false);
  }
  return (
    <div>
      <button onClick={bind} disabled={busy} style={{ padding: "12px 16px", borderRadius: 12, border: 0, fontWeight: 800 }}>
        {busy ? "Открываем привязку СБП…" : "Бесплатно привязать СБП для автопродления"}
      </button>
      {error && <div style={{ marginTop: 8, color: "#b42318", fontSize: 13 }}>{error}</div>}
    </div>
  );
}
