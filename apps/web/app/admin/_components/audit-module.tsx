import type { AdminModuleStats } from "../modules";
export function AuditModule({stats}:{stats:AdminModuleStats}) {
 return <section><h2>Аудит системы</h2><div style={{padding:18,border:"1px solid #303747",borderRadius:16,marginBottom:16}}>Всего событий: <strong>{stats.audit_logs}</strong></div>
 <div style={{display:"grid",gap:8}}>{stats.recent_audit.map((x:any)=><div key={x.id} style={{padding:13,border:"1px solid #303747",borderRadius:12}}><strong>{x.action}</strong><span style={{marginLeft:10,color:"#9ea8ba"}}>{x.resource_type||"system"} · {new Date(x.created_at).toLocaleString("ru-RU")}</span></div>)}</div>
 {stats.recent_audit.length===0&&<div style={{color:"#9ea8ba"}}>Событий пока нет.</div>}</section>;
}