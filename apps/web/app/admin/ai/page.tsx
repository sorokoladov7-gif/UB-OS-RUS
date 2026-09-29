"use client";
import {useEffect,useState} from "react";
import {AdminShell} from "../_components";

type Model={id:string;name:string;provider:string;model:string;base_url:string|null;role:string;priority:number;enabled:boolean;is_default:boolean;has_api_key:boolean;capabilities:string[];last_test_at:string|null;last_test_status:string|null;last_test_message:string|null};
const providers=[["openai","OpenAI / OpenAI-compatible"],["openrouter","OpenRouter"],["groq","Groq"],["gemini","Google Gemini"],["anthropic","Anthropic / compatible"],["custom","Custom endpoint"],["ollama","Ollama / remote endpoint"]];
const roles=[["general","Общая"],["primary","Основная"],["fallback","Резервная"],["analytics","Аналитика"],["agent","AI-агенты"],["embedding","Embeddings"],["vision","Vision"]];\nconst capabilities=[["text","Текст"],["vision","Vision"],["tools","Tool calling"],["agents","Agents"],["embeddings","Embeddings"],["json","Structured JSON"]];

const input={display:"block",width:"100%",boxSizing:"border-box" as const,padding:"10px",marginTop:6,borderRadius:9,border:"1px solid #3c465b",background:"#0b0d12",color:"#fff"};
const btn={padding:"9px 13px",borderRadius:10,border:"1px solid #3c465b",background:"#1b2332",color:"#fff",cursor:"pointer"};

export default function Page(){
 const [models,setModels]=useState<Model[]>([]);
 const [form,setForm]=useState<any>({name:"",provider:"openrouter",model:"",baseUrl:"",apiKey:"",role:"general",priority:100,enabled:true,isDefault:false,capabilities:["text"]});
 const [editing,setEditing]=useState<string|null>(null); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
 const [settings,setSettings]=useState<any>({enabled:true,provider:"",model:""});
 async function load(){const [a,b]=await Promise.all([fetch("/api/admin/ai/models"),fetch("/api/admin/ai")]);const aj=await a.json(),bj=await b.json();if(a.ok)setModels(aj.items||[]);if(b.ok&&bj.item)setSettings(bj.item)}
 useEffect(()=>{load()},[]);
 function reset(){setForm({name:"",provider:"openrouter",model:"",baseUrl:"",apiKey:"",role:"general",priority:100,enabled:true,isDefault:false});setEditing(null)}
 async function saveModel(){
  setBusy(true);setMsg("");
  const body={...form,id:editing};
  const r=await fetch("/api/admin/ai/models",{method:editing?"PUT":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json();if(r.ok){setMsg(editing?"Модель обновлена":"Модель добавлена");reset();await load()}else setMsg(j.error||"Ошибка сохранения");setBusy(false)
 }
 function edit(m:Model){setEditing(m.id);setForm({name:m.name,provider:m.provider,model:m.model,baseUrl:m.base_url||"",apiKey:"",role:m.role,priority:m.priority,enabled:m.enabled,isDefault:m.is_default,capabilities:m.capabilities||["text"]})}
 async function remove(id:string){if(!confirm("Удалить модель из платформенного AI Core?"))return;const r=await fetch("/api/admin/ai/models?id="+encodeURIComponent(id),{method:"DELETE"});const j=await r.json();setMsg(r.ok?"Модель удалена":j.error||"Ошибка удаления");if(r.ok)load()}
 async function test(id:string){setMsg("Проверяю соединение…");const r=await fetch("/api/admin/ai/models/test",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id})});const j=await r.json();setMsg(r.ok?"✓ "+(j.message||"Модель отвечает"): "✕ "+(j.error||"Модель не отвечает"));load()}
 async function saveSettings(){setBusy(true);const r=await fetch("/api/admin/ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(settings)});const j=await r.json();setMsg(r.ok?"Глобальные настройки сохранены":j.error||"Ошибка");setBusy(false)}
 return <AdminShell><section>
  <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
   <div><div style={{fontSize:12,letterSpacing:2,color:"#7e8cff"}}>AI CORE / MODEL CONTROL CENTER</div><h2 style={{marginBottom:6}}>Модели AI платформы</h2><p style={{color:"#9ea8ba",maxWidth:760}}>Единый реестр моделей для AI Core. Здесь администратор определяет, какие провайдеры и модели доступны самой платформе.</p></div>
   <div style={{padding:"10px 14px",border:"1px solid #263044",borderRadius:12,background:"#101722"}}>Моделей: <b>{models.length}</b> · активных: <b>{models.filter(x=>x.enabled).length}</b></div>
  </div>

  <div style={{...box,marginTop:18}}>
   <h3 style={{marginTop:0}}>{editing?"Редактирование модели":"Добавить модель AI"}</h3>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
    <label>Название<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Gemini Production" style={input}/></label>
    <label>Провайдер<select value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})} style={input}>{providers.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
    <label>Model ID<input value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="модель провайдера" style={input}/></label>
    <label>Роль<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={input}>{roles.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
    <label>Приоритет<input type="number" value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value)})} style={input}/></label>
    <label>Base URL<input value={form.baseUrl} onChange={e=>setForm({...form,baseUrl:e.target.value})} placeholder="только для custom/совместимых API" style={input}/></label>
    <label style={{gridColumn:"1/-1"}}>Возможности<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>{capabilities.map(([v,n])=><label key={v} style={{padding:"7px 10px",border:"1px solid #303b51",borderRadius:9,background:"#0b0d12",fontSize:12}}><input type="checkbox" checked={form.capabilities?.includes(v)} onChange={e=>setForm({...form,capabilities:e.target.checked?[...(form.capabilities||[]),v]:(form.capabilities||[]).filter((x:string)=>x!==v)})}/> {n}</label>)}</div></label>\n    <label style={{gridColumn:"1/-1"}}>API key <input type="password" value={form.apiKey} onChange={e=>setForm({...form,apiKey:e.target.value})} placeholder={editing?"Оставьте пустым, чтобы сохранить существующий ключ":"Секрет хранится только на сервере"} style={input}/></label>
   </div>
   <div style={{display:"flex",gap:18,flexWrap:"wrap",marginTop:13}}>
    <label><input type="checkbox" checked={!!form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/> Включена</label>
    <label><input type="checkbox" checked={!!form.isDefault} onChange={e=>setForm({...form,isDefault:e.target.checked})}/> Сделать основной</label>
   </div>
   <div style={{display:"flex",gap:8,marginTop:15}}><button disabled={busy} onClick={saveModel} style={btn}>{busy?"Сохранение…":editing?"Сохранить изменения":"Добавить модель"}</button>{editing&&<button onClick={reset} style={btn}>Отмена</button>}</div>
  </div>

  <div style={{display:"grid",gap:12,marginTop:18}}>
   {models.map(m=><article key={m.id} style={{padding:17,border:"1px solid #293348",borderRadius:15,background:"#111722"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
     <div><div style={{fontSize:11,letterSpacing:1,color:"#7e8cff"}}>{m.provider.toUpperCase()} · {m.role.toUpperCase()}</div><h3 style={{margin:"5px 0"}}>{m.name} {m.is_default&&<span style={{fontSize:11,color:"#76e4c1"}}>● PRIMARY</span>}</h3><div style={{fontFamily:"monospace",fontSize:13,color:"#c7cfdd"}}>{m.model}</div></div>
     <div style={{textAlign:"right",fontSize:12,color:"#9ea8ba"}}>{m.enabled?"● ACTIVE":"○ OFF"}<br/>priority {m.priority}<br/>{m.has_api_key?"🔐 key configured":"○ no key"}</div>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:13}}>
     <button onClick={()=>test(m.id)} style={btn}>Проверить</button><button onClick={()=>edit(m)} style={btn}>Изменить</button><button onClick={()=>remove(m.id)} style={{...btn,borderColor:"#6b3840"}}>Удалить</button>
    </div>
    {m.last_test_at&&<div style={{marginTop:10,fontSize:12,color:m.last_test_status==="ok"?"#76e4c1":"#ff9b9b"}}>{m.last_test_status==="ok"?"✓ Последняя проверка успешна":"✕ Последняя проверка завершилась ошибкой"} · {new Date(m.last_test_at).toLocaleString()} {m.last_test_message&&"· "+m.last_test_message}</div>}
   </article>)}
   {!models.length&&<div style={{padding:24,border:"1px dashed #39445a",borderRadius:15,color:"#9ea8ba"}}>Платформенные модели пока не добавлены. Добавьте первую модель выше.</div>}
  </div>

  <div style={{...box,marginTop:20}}>
   <h3 style={{marginTop:0}}>Глобальный AI-контур</h3><p style={{color:"#9ea8ba"}}>Эти настройки определяют общий переключатель AI Core и совместимость со старым глобальным провайдером.</p>
   <label><input type="checkbox" checked={!!settings.enabled} onChange={e=>setSettings({...settings,enabled:e.target.checked})}/> AI Core включён</label>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}><input value={settings.provider||""} onChange={e=>setSettings({...settings,provider:e.target.value})} placeholder="legacy provider" style={input}/><input value={settings.model||""} onChange={e=>setSettings({...settings,model:e.target.value})} placeholder="legacy model" style={input}/></div>
   <button disabled={busy} onClick={saveSettings} style={{...btn,marginTop:13}}>Сохранить глобальные настройки</button>
  </div>
  {msg&&<div style={{marginTop:14,padding:12,borderRadius:10,background:"#111722",color:"#cbd4e4"}}>{msg}</div>}
 </section></AdminShell>
}
const box={padding:18,border:"1px solid #303747",borderRadius:16,background:"#121620",maxWidth:1100};
