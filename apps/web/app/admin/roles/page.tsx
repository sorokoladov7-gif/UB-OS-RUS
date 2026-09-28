import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {getPlatformAdminDashboard} from "@/lib/admin";
export default async function RolesPage(){
 const supabase=await createSupabaseServerClient(); const d=await getPlatformAdminDashboard(); if(!d?.isOwner) redirect("/app");
 const {data:roles}=await supabase.from("roles").select("id,organization_id,key,name,description,is_system,created_at").order("created_at",{ascending:false}).limit(100);
 const {data:permissions}=await supabase.from("permissions").select("id,key,description").order("key");
 return <main style={{padding:24,maxWidth:1200,margin:"0 auto"}}><h1>RBAC</h1><p style={{color:"#8f9ab0"}}>Роли, разрешения и области доступа универсальной бизнес-ОС.</p><section style={{display:"grid",gap:12}}>{(roles??[]).map((r:any)=><article key={r.id} style={{border:"1px solid #303747",borderRadius:16,padding:16}}><strong>{r.name}</strong> <code>{r.key}</code><div style={{color:"#8f9ab0"}}>{r.is_system?"Системная роль":"Пользовательская роль"} · organization {r.organization_id}</div></article>)}</section><h2 style={{marginTop:28}}>Разрешения</h2><section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>{(permissions??[]).map((p:any)=><div key={p.id} style={{border:"1px solid #303747",borderRadius:12,padding:12}}><code>{p.key}</code><div>{p.description}</div></div>)}</section></main>
}