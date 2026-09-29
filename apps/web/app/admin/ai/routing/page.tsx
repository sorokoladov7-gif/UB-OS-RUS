"use client";
import {useEffect,useState} from "react";
import {AdminShell} from "../../_components";
type Model={id:string;name:string;provider:string;model:string;enabled:boolean};
type Route={route_key:string;name:string;primary_model_id:string|null;fallback_model_ids:string[];enabled:boolean};
export default function RoutingPage(){
 const [models,setModels]=useState<Model[]>([]);const [routes,setRoutes]=useState<Route[]>([]);const [msg,setMsg]=useState("");
 async function load(){const [m,r]=await Promise.all([fetch("/api/admin/ai/models"),fetch("/api/admin/ai/routing")]);const mj=await m.json(),rj=await r.json();if(m.ok)setModels(mj.items||[]);if(r.ok)setRoutes(rj.items||[]);}
 useEffect(()=>{load()},[]);
 async function save(x:Route){const r=await fetch("/api/admin/ai/routing",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({routeKey:x.route_key,primaryModelId:x.primary_model_id,fallbackModelIds:x.fallback_model_ids,enabled:x.enabled})});const j=await r.json();setMsg(r.ok?"Маршрут сохранён":j.error||"Ошибка");if(r.ok)load();}
 return <AdminShell><section style={{maxWidth:1100}}>
 <div style={{fontSize:12,letterSpacing:2,color:"#7e8cff"}}>AI CORE / ROUTER</div><h2>Маршрутизация AI</h2><p style={{color:"#9ea8ba",maxWidth:760}}>Определяет цепочку моделей для разных задач. При недоступности Primary AI Core может перейти к резервной модели.</p>
 <div style={{display:"grid",gap:12,marginTop:20}}>
 {routes.map(route=><article key={route.route_key} style={{padding:18,border:"1px solid #303747",borderRadius:16,background:"#121620"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><b>{route.name}</b><div style={{fontSize:11,color:"#77839a",marginTop:4}}>{route.route_key}</div></div><label><input type="checkbox" checked={route.enabled} onChange={e=>setRoutes(routes.map(x=>x.route_key===route.route_key?{...x,enabled:e.target.checked}:x))}/> включён</label></div>
  <label style={{display:"block",marginTop:14}}>Основная модель<select value={route.primary_model_id||""} onChange={e=>setRoutes(routes.map(x=>x.route_key===route.route_key?{...x,primary_model_id:e.target.value||null}:x))} style={input}><option value="">Не назначена</option>{models.filter(m=>m.enabled).map(m=><option key={m.id} value={m.id}>{m.name} · {m.model}</option>)}</select></label>
  <label style={{display:"block",marginTop:12}}>Резервные модели<select multiple value={route.fallback_model_ids||[]} onChange={e=>setRoutes(routes.map(x=>x.route_key===route.route_key?{...x,fallback_model_ids:Array.from(e.target.selectedOptions).map(o=>o.value)}:x))} style={{...input,minHeight:90}}>{models.filter(m=>m.enabled&&m.id!==route.primary_model_id).map(m=><option key={m.id} value={m.id}>{m.name} · {m.model}</option>)}</select></label>
  <button onClick={()=>save(route)} style={btn}>Сохранить маршрут</button>
 </article>)}
 </div>{msg&&<div style={{marginTop:14,color:"#bfc8d8"}}>{msg}</div>}
 </section></AdminShell>
}
const input={display:"block",width:"100%",boxSizing:"border-box" as const,padding:"10px",marginTop:6,borderRadius:9,border:"1px solid #3c465b",background:"#0b0d12",color:"#fff"};
const btn={marginTop:14,padding:"9px 13px",borderRadius:10,border:"1px solid #3c465b",background:"#1b2332",color:"#fff",cursor:"pointer"};