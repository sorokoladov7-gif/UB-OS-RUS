"use client";
import {useState} from "react";
import type {AdminModuleStats} from "../modules";
type Row={id:string;user_id:string;organization_id:string;status:string;default_role_key:string|null;created_at:string;organization?:{name:string}|null};
export function UsersModule({stats}:{stats:AdminModuleStats}){
 const [rows,setRows]=useState<Row[]>([]);
 const [loaded,setLoaded]=useState(false); const [busy,setBusy]=useState<string|null>(null); const [msg,setMsg]=useState("");
 async function load(){const r=await fetch("/api/admin/users");const j=await r.json();if(!r.ok){setMsg(j.error||"Ошибка загрузки");return}setRows(j.items||[]);setLoaded(true)}
 async function change(row:Row,status:string){setBusy(row.id);setMsg("");try{const r=await fetch("/api/admin/users",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({membershipId:row.id,status,defaultRoleKey:row.default_role_key||""})});const j=await r.json();if(!r.ok)throw new Error(j.error);setRows(v=>v.map(x=>x.id===row.id?{...x,status}:x));setMsg("Изменение сохранено")}catch(e){setMsg(e instanceof Error?e.message:"Ошибка")}finally{setBusy(null)}}
 return <section><h2>Пользователи</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
 <div style={{padding:18,border:"1px solid #303747",borderRadius:16}}>Активные участники<strong style={{display:"block",fontSize:28,marginTop:8}}>{stats.memberships}</strong></div></div>
 <div style={{display:"flex",gap:10,alignItems:"center",marginTop:18,flexWrap:"wrap"}}><button onClick={load} style={btn}>{loaded?"Обновить список":"Загрузить пользователей"}</button>{msg&&<span style={{color:"#aab2c3"}}>{msg}</span>}</div>
 {loaded&&<div style={{display:"grid",gap:10,marginTop:14}}>{rows.map(r=><article key={r.id} style={card}><div><strong>{r.user_id}</strong><div style={{color:"#8f9ab0",fontSize:13}}>{r.organization?.name||r.organization_id} · {r.default_role_key||"роль не задана"}</div></div><div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:12}}>{r.status}</span><button disabled={!!busy} onClick={()=>change(r,r.status==="active"?"suspended":"active")} style={btn}>{busy===r.id?"…":r.status==="active"?"Приостановить":"Активировать"}</button></div></article>)}</div>}
 </section>
}
const btn={padding:"9px 12px",borderRadius:10,border:"1px solid #3c465b",background:"#1b2332",color:"#f7f8fa",cursor:"pointer"};
const card={display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",padding:16,border:"1px solid #303747",borderRadius:14,background:"#121620"};
