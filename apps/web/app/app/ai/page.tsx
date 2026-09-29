// @ts-nocheck
"use client";

import {useEffect,useState} from "react";

type Model={id:string;name:string;provider:string;model:string;base_url:string|null;enabled:boolean;has_api_key:boolean;is_default:boolean};

const providers: Array<[string,string]> = [
  ["openai","OpenAI / совместимый API"],
  ["openrouter","OpenRouter"],
  ["groq","Groq"],
  ["gemini","Google Gemini"],
  ["ollama","Ollama / удалённый сервер"],
  ["custom","Свой OpenAI-совместимый сервер"],
];

export default function AiModelsPage(){
  const [items,setItems]=useState<Model[]>([]);
  const [form,setForm]=useState({name:"",provider:"openrouter",model:"",baseUrl:"",apiKey:""});
  const [busy,setBusy]=useState(false); const [msg,setMsg]=useState("");
  async function load(){const r=await fetch("/api/ai/models");const j=await r.json();if(r.ok)setItems(j.items||[]);else setMsg(j.error||"Ошибка загрузки");}
  useEffect(()=>{load()},[]);
  async function add(){
    setBusy(true);setMsg("");
    const r=await fetch("/api/ai/models",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
    const j=await r.json();
    if(r.ok){setForm({name:"",provider:"openrouter",model:"",baseUrl:"",apiKey:""});setMsg("Модель подключена");await load()}else setMsg(j.error||"Не удалось подключить");
    setBusy(false);
  }
  async function makeDefault(id:string){ const r=await fetch("/api/ai/models",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,action:"default"})}); if(r.ok){setMsg("Модель назначена основной");await load()}else{const j=await r.json();setMsg(j.error||"Ошибка")} }
  async function testModel(id:string){ setMsg("Проверяю модель…"); const r=await fetch("/api/ai/command",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({modelId:id,message:"Проверка подключения. Ответь одним коротким предложением: AI Core работает."})}); const j=await r.json(); setMsg(r.ok?`✓ Ответ модели: ${j.text||"пустой ответ"}`:`Ошибка модели: ${j.error||"неизвестная ошибка"}`); }
  async function remove(id:string){
    if(!confirm("Удалить это подключение к AI-модели?")) return;
    const r=await fetch("/api/ai/models?id="+encodeURIComponent(id),{method:"DELETE"});
    if(r.ok) await load(); else {const j=await r.json();setMsg(j.error||"Ошибка удаления")}
  }
  return <main style={{maxWidth:1100,margin:"0 auto",padding:"32px 18px",fontFamily:"system-ui"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div><div style={{fontSize:12,letterSpacing:2,opacity:.55}}>AI CORE / PERSONAL MODELS</div><h1 style={{margin:"7px 0"}}>Мои AI-модели</h1><p style={{opacity:.7,maxWidth:720}}>Каждый пользователь может подключить собственные модели. UB OS-RUS хранит API-ключ в зашифрованном виде и не показывает его после сохранения.</p></div>
      <a href="/app" style={{padding:"10px 14px",border:"1px solid #ccd1dc",borderRadius:10,textDecoration:"none",color:"inherit"}}>← В систему</a>
    </header>
    <section style={{marginTop:24,padding:20,border:"1px solid #d7dbe5",borderRadius:18}}>
      <h2 style={{marginTop:0}}>Подключить модель</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
        <label>Название<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Моя рабочая модель" style={input}/></label>
        <label>Провайдер<select value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})} style={input}>{providers.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
        <label>Model ID<input value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="например gpt-5.6 / llama..." style={input}/></label>
        <label>Base URL<input value={form.baseUrl} onChange={e=>setForm({...form,baseUrl:e.target.value})} placeholder="для custom / Ollama / OpenAI-compatible" style={input}/></label>
        <label style={{gridColumn:"1/-1"}}>API key <input type="password" value={form.apiKey} onChange={e=>setForm({...form,apiKey:e.target.value})} placeholder="Можно оставить пустым для серверов без ключа" style={input}/></label>
      </div>
      <button disabled={busy} onClick={add} style={button}>{busy?"Подключение…":"Подключить модель"}</button>
      {msg&&<div style={{marginTop:12,opacity:.75}}>{msg}</div>}
    </section>
    <section style={{marginTop:24}}>
      <h2>Подключённые модели</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
        {items.map(m=><article key={m.id} style={{padding:18,border:"1px solid #d7dbe5",borderRadius:16}}>
          <div style={{fontSize:12,letterSpacing:1,opacity:.55}}>{m.provider.toUpperCase()}</div>
          <h3 style={{margin:"6px 0"}}>{m.name}</h3>
          <div style={{fontFamily:"monospace",fontSize:13}}>{m.model}</div>
          {m.base_url&&<div style={{marginTop:7,fontSize:12,opacity:.6,overflowWrap:"anywhere"}}>{m.base_url}</div>}
          <div style={{marginTop:12,fontSize:12}}>{m.is_default&&<div style={{marginTop:8,fontSize:12}}>⭐ Основная модель</div>}{m.has_api_key?"🔐 API key сохранён":"○ Без API key"}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>{!m.is_default&&<button onClick={()=>makeDefault(m.id)} style={button}>Сделать основной</button>}<button onClick={()=>testModel(m.id)} style={button}>Проверить</button><button onClick={()=>remove(m.id)} style={{...button,borderColor:"#d99"}}>Удалить</button></div>
        </article>)}
        {!items.length&&<div style={{padding:20,border:"1px dashed #aaa",borderRadius:16,opacity:.7}}>Пока нет подключённых моделей.</div>}
      </div>
    </section>
    <section style={{marginTop:24,padding:18,borderRadius:16,background:"#f5f7fb"}}>
      <strong>Поддерживаемый принцип</strong>
      <p style={{marginBottom:0,opacity:.72}}>Можно подключать облачные модели, OpenAI-совместимые API и удалённые self-hosted модели. Ollama на компьютере пользователя с localhost напрямую из облачного UB OS-RUS недоступна — для неё нужен доступный извне endpoint или туннель.</p>
    </section>
  </main>
}
const input={display:"block",width:"100%",boxSizing:"border-box" as const,padding:"11px",marginTop:6,border:"1px solid #cbd1dc",borderRadius:10,background:"#fff",color:"#111"};
const button={padding:"10px 14px",border:"1px solid #aeb6c6",borderRadius:10,background:"#111827",color:"#fff",cursor:"pointer"};
