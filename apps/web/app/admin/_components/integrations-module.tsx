import type { AdminModuleStats } from "../modules";
export function IntegrationsModule({stats}:{stats:AdminModuleStats}) {
 return <section><h2>Интеграции</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:18}}>
 <div style={{padding:18,border:"1px solid #303747",borderRadius:16}}>Интеграции<strong style={{display:"block",fontSize:26}}>{stats.integrations}</strong></div>
 <div style={{padding:18,border:"1px solid #303747",borderRadius:16}}>Включены<strong style={{display:"block",fontSize:26}}>{stats.enabled_integrations}</strong></div>
 <div style={{padding:18,border:"1px solid #303747",borderRadius:16}}>Подключения<strong style={{display:"block",fontSize:26}}>{stats.integration_connections}</strong></div></div>
 <div style={{display:"grid",gap:10}}>{stats.integrations_list.map((x:any)=><div key={x.id} style={{padding:14,border:"1px solid #303747",borderRadius:12}}><strong>{x.name}</strong><span style={{marginLeft:10,color:"#9ea8ba"}}>{x.provider_type} · {x.enabled?"включена":"выключена"} · {x.connections} подключ.</span></div>)}</div>
 </section>;
}