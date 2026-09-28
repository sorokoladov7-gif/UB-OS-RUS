import type { AdminModuleStats } from "../modules";
export function UsersModule({stats}:{stats:AdminModuleStats}) {
 return <section><h2>Пользователи</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
 <div style={{padding:18,border:"1px solid #303747",borderRadius:16}}>Активные участники<strong style={{display:"block",fontSize:28,marginTop:8}}>{stats.memberships}</strong></div>
 </div><p style={{color:"#9ea8ba"}}>Управление пользователями будет подключено отдельным модулем без изменения ядра авторизации.</p></section>;
}