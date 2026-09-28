import type { AdminModuleStats } from "../modules";
export function SubscriptionsModule({stats}:{stats:AdminModuleStats}) {
 const items=[["Всего",stats.subscriptions],["Активные",stats.active_subscriptions],["Trial",stats.trialing_subscriptions],["Просроченные",stats.past_due_subscriptions]];
 return <section><h2>Подписки</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>{items.map(([k,v])=><div key={k} style={{padding:18,border:"1px solid #303747",borderRadius:16}}><div style={{color:"#9ea8ba"}}>{k}</div><strong style={{display:"block",fontSize:26,marginTop:7}}>{v}</strong></div>)}</div></section>;
}