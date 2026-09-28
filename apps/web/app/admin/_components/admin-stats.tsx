import type { AdminOrganization, AdminPlan } from "../types";
export function AdminStats({organizations,plans}:{organizations:AdminOrganization[];plans:AdminPlan[]}) {
  const active=organizations.filter(x=>x.subscription_status==="active").length, trial=organizations.filter(x=>x.subscription_status==="trialing").length, pastDue=organizations.filter(x=>x.subscription_status==="past_due").length;
  const users=organizations.reduce((s,x)=>s+Number(x.members||0),0);
  const mrr=organizations.reduce((s,x)=>{const p=plans.find(y=>y.name===x.plan_name);return s+(x.subscription_status==="active"?Number(p?.price_monthly||0):0)},0);
  const cards=[["Организации",organizations.length],["Пользователи",users],["Активные подписки",active],["Пробный период",trial],["Просроченные",pastDue],["MRR",mrr.toLocaleString("ru-RU")+" ₽"]];
  return <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginTop:24}}>{cards.map(([label,value])=><div key={String(label)} style={{padding:18,border:"1px solid #303747",borderRadius:16,background:"#121620"}}><div style={{color:"#9ea8ba",fontSize:12}}>{label}</div><strong style={{display:"block",fontSize:27,marginTop:7}}>{String(value)}</strong></div>)}</section>;
}