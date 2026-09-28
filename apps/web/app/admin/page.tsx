import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");

  const { data, error } = await supabase.rpc("platform_admin_snapshot");
  if (error || !data) redirect("/app");

  const cards = [
    ["Организации", data.organizations],
    ["Пользователи", data.users],
    ["Активные подписки", data.active_subscriptions],
    ["Trial", data.trialing_subscriptions],
    ["Просроченные", data.past_due_subscriptions],
    ["MRR", Number(data.revenue_monthly).toLocaleString("ru-RU") + " ₽"],
  ];

  return (
    <main style={{ minHeight:"100vh",background:"#0b0d12",color:"#f7f8fa",padding:"40px 20px",fontFamily:"system-ui" }}>
      <div style={{ maxWidth:1100,margin:"0 auto" }}>
        <div style={{ color:"#8f9ab0",fontSize:13,letterSpacing:".12em" }}>UB OS-RUS · PLATFORM ADMIN</div>
        <h1 style={{ fontSize:48,margin:"12px 0" }}>Панель платформы</h1>
        <p style={{ color:"#aab2c3" }}>Доступ только владельцу платформы. Организации и подписки клиентов управляются централизованно.</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginTop:30 }}>
          {cards.map(([label,value]) => <div key={label} style={{ padding:20,border:"1px solid #303747",borderRadius:18,background:"#121620" }}><div style={{color:"#9ea8ba",fontSize:13}}>{label}</div><strong style={{display:"block",fontSize:28,marginTop:8}}>{String(value)}</strong></div>)}
        </div>
        <div style={{ marginTop:30,padding:20,border:"1px solid #303747",borderRadius:18,background:"#121620" }}>
          <strong>Единственный администратор</strong>
          <p style={{color:"#aab2c3",lineHeight:1.6}}>Статус платформы хранится отдельно от ролей клиентов. Повторно назначить другого platform-admin через обычную регистрацию нельзя.</p>
        </div>
      </div>
    </main>
  );
}
