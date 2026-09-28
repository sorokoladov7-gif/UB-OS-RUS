import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");

  const { data, error } = await supabase.rpc("platform_admin_dashboard");
  if (error || !data) redirect("/app");

  const organizations = Array.isArray(data.organizations) ? data.organizations : [];
  const plans = Array.isArray(data.plans) ? data.plans : [];
  const payments = Array.isArray(data.payments) ? data.payments : [];

  const active = organizations.filter((x:any)=>x.subscription_status==="active").length;
  const trial = organizations.filter((x:any)=>x.subscription_status==="trialing").length;
  const pastDue = organizations.filter((x:any)=>x.subscription_status==="past_due").length;
  const mrr = organizations.reduce((sum:number,x:any)=>{
    const plan=plans.find((p:any)=>p.id && p.name===x.plan_name);
    return sum + (x.subscription_status==="active" ? Number(plan?.price_monthly||0) : 0);
  },0);

  const cards = [
    ["Организации", organizations.length],
    ["Пользователи", organizations.reduce((s:number,x:any)=>s+Number(x.members||0),0)],
    ["Активные подписки", active],
    ["Пробный период", trial],
    ["Просроченные", pastDue],
    ["MRR", mrr.toLocaleString("ru-RU")+" ₽"],
  ];

  return (
    <main style={{minHeight:"100vh",background:"#0b0d12",color:"#f7f8fa",fontFamily:"system-ui"}}>
      <div style={{maxWidth:1250,margin:"0 auto",padding:"28px 20px 60px"}}>
        <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
          <div>
            <div style={{color:"#8f9ab0",fontSize:12,letterSpacing:".14em"}}>UB OS-RUS · PLATFORM ADMIN</div>
            <h1 style={{fontSize:42,margin:"8px 0"}}>Центр управления платформой</h1>
            <p style={{color:"#aab2c3",margin:0}}>Глобальное управление всей системой, организациями, тарифами, подписками и платежами.</p>
          </div>
          <Link href="/app" style={{padding:"11px 16px",border:"1px solid #303747",borderRadius:12,color:"#fff",textDecoration:"none"}}>Кабинет бизнеса →</Link>
        </header>

        <nav style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:24}}>
          {["Обзор","Организации","Пользователи","Тарифы","Подписки и платежи","Аудит системы"].map((x,i)=>
            <span key={x} style={{padding:"9px 13px",borderRadius:999,background:i===0?"#f7f8fa":"#121620",color:i===0?"#0b0d12":"#b8c0d0",border:"1px solid #303747",fontSize:13}}>{x}</span>
          )}
        </nav>

        <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginTop:24}}>
          {cards.map(([label,value])=><div key={String(label)} style={{padding:18,border:"1px solid #303747",borderRadius:16,background:"#121620"}}><div style={{color:"#9ea8ba",fontSize:12}}>{label}</div><strong style={{display:"block",fontSize:27,marginTop:7}}>{String(value)}</strong></div>)}
        </section>

        <section style={{marginTop:24,padding:20,border:"1px solid #303747",borderRadius:18,background:"#121620"}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <div><strong>Владелец платформы</strong><div style={{color:"#aab2c3",fontSize:13,marginTop:5}}>Единственный platform-admin закреплён сервером и не может быть заменён через регистрацию.</div></div>
            <div style={{padding:"8px 12px",borderRadius:10,border:"1px solid #303747",fontSize:12}}>Единственный администратор</div>
          </div>
        </section>

        <section style={{marginTop:24}}>
          <h2 style={{fontSize:22}}>Организации клиентов</h2>
          <div style={{overflowX:"auto",border:"1px solid #303747",borderRadius:16}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:720}}>
              <thead><tr>{["Организация","Тариф","Статус","Пользователи","Создана"].map(h=><th key={h} style={{textAlign:"left",padding:13,color:"#8f9ab0",fontSize:12,borderBottom:"1px solid #303747"}}>{h}</th>)}</tr></thead>
              <tbody>{organizations.map((x:any)=><tr key={x.id}>{[x.name,x.plan_name,x.subscription_status,x.members,new Date(x.created_at).toLocaleDateString("ru-RU")].map((v:any,i)=><td key={i} style={{padding:13,borderBottom:"1px solid #202532",fontSize:14}}>{String(v)}</td>)}</tr>)}</tbody>
            </table>
            {organizations.length===0 && <div style={{padding:24,color:"#aab2c3"}}>Пока нет организаций клиентов.</div>}
          </div>
        </section>

        <section style={{marginTop:28}}>
          <h2 style={{fontSize:22}}>Тарифы</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
            {plans.map((p:any)=><div key={p.id} style={{padding:18,border:"1px solid #303747",borderRadius:16,background:"#121620"}}><strong>{p.name}</strong><div style={{marginTop:8,fontSize:20}}>{Number(p.price_monthly).toLocaleString("ru-RU")} ₽/мес.</div><div style={{color:"#aab2c3",fontSize:13,marginTop:5}}>{p.trial_days} дней trial · {p.enabled?"включён":"выключен"}</div></div>)}
          </div>
        </section>

        <section style={{marginTop:28}}>
          <h2 style={{fontSize:22}}>Последние платежи</h2>
          <div style={{overflowX:"auto",border:"1px solid #303747",borderRadius:16}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}>
              <thead><tr>{["Организация","Тариф","Сумма","Статус","Дата"].map(h=><th key={h} style={{textAlign:"left",padding:13,color:"#8f9ab0",fontSize:12,borderBottom:"1px solid #303747"}}>{h}</th>)}</tr></thead>
              <tbody>{payments.slice(0,20).map((p:any)=><tr key={p.id}>{[p.organization_name,p.plan_name,Number(p.amount).toLocaleString("ru-RU")+" "+p.currency,p.status,new Date(p.created_at).toLocaleString("ru-RU")].map((v:any,i)=><td key={i} style={{padding:13,borderBottom:"1px solid #202532",fontSize:14}}>{String(v)}</td>)}</tr>)}</tbody>
            </table>
            {payments.length===0 && <div style={{padding:24,color:"#aab2c3"}}>Платежей пока нет — это нормально во время trial.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
