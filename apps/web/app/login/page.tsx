"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const plans = [
  { key: "start", name: "Старт", price: 990, text: "Для небольшого бизнеса" },
  { key: "business", name: "Бизнес", price: 2490, text: "Для растущей команды" },
  { key: "pro", name: "Профессиональный", price: 4990, text: "Полный операционный контур" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [plan, setPlan] = useState(params.get("plan") ?? "business");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const origin = window.location.origin;
        const next = "/onboarding?plan=" + encodeURIComponent(plan);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: origin + "/auth/callback?next=" + encodeURIComponent(next) },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setMessage("Аккаунт создан. Подтвердите email — после подтверждения откроется настройка системы.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/app");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить операцию.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b0d12", color: "#f7f8fa", padding: "40px 20px", fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <a href="/" style={{ color: "#aab2c3", textDecoration: "none" }}>← UB OS-RUS</a>
        <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 28 }}>
          <section>
            <div style={{ color: "#8f9ab0", fontSize: 13, letterSpacing: ".12em" }}>UNIVERSAL BUSINESS OS</div>
            <h1 style={{ fontSize: 48, lineHeight: 1, margin: "14px 0" }}>{mode === "signup" ? "Создайте свой бизнес-центр." : "С возвращением."}</h1>
            <p style={{ color: "#aab2c3", lineHeight: 1.6 }}>Один аккаунт для операционной системы бизнеса. Пробный период — 10 дней.</p>
          </section>
          <section style={{ border: "1px solid #303747", borderRadius: 22, padding: 24, background: "#121620" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button onClick={() => setMode("login")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #3b4355", background: mode === "login" ? "#242b3a" : "transparent", color: "white" }}>Войти</button>
              <button onClick={() => setMode("signup")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #3b4355", background: mode === "signup" ? "#242b3a" : "transparent", color: "white" }}>Регистрация</button>
            </div>
            {mode === "signup" && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Выберите тариф</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {plans.map((p) => (
                    <button key={p.key} type="button" onClick={() => setPlan(p.key)} style={{ textAlign: "left", padding: 13, borderRadius: 12, border: "1px solid " + (plan === p.key ? "#8f9ab0" : "#303747"), background: plan === p.key ? "#202736" : "#0f131b", color: "white" }}>
                      <strong>{p.name}</strong> · {p.price.toLocaleString("ru-RU")} ₽/мес.
                      <div style={{ color: "#9ea8ba", fontSize: 12, marginTop: 3 }}>{p.text} · первые 10 дней бесплатно</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" style={{ padding: 14, borderRadius: 12, border: "1px solid #303747", background: "#0b0d12", color: "white" }} />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="Пароль" style={{ padding: 14, borderRadius: 12, border: "1px solid #303747", background: "#0b0d12", color: "white" }} />
              <button disabled={busy} style={{ padding: 14, borderRadius: 12, border: 0, background: "white", color: "#0b0d12", fontWeight: 800 }}>
                {busy ? "Обработка…" : mode === "signup" ? "Создать аккаунт" : "Войти"}
              </button>
            </form>
            {message && <p style={{ color: "#cbd2df", lineHeight: 1.5 }}>{message}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}


export default function LoginPage() {
  return <Suspense fallback={<main style={{ minHeight: "100vh", background: "#0b0d12" }} />}><LoginForm /></Suspense>;
}
