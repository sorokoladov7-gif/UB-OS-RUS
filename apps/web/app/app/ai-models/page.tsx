"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Model={id:string;name:string;provider:string;model:string;base_url:string|null;enabled:boolean;has_api_key:boolean};

const providers=[
  ["openai","OpenAI / OpenAI-compatible"],
  ["gemini","Google Gemini"],
  ["openrouter","OpenRouter"],
  ["groq","Groq"],
  ["ollama","Ollama / совместимый сервер"],
  ["custom","Свой OpenAI-compatible API"],
];

export default function AiModelsPage(){
  const [items,setItems]=useState<Model[]>([]);
  const [name,setName]=useState("");
  const [provider,setProvider]=useState("openai");
  const [model,setModel]=useState("");
  const [baseUrl,setBaseUrl]=useState("");
  const [apiKey,setApiKey]=useState("");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");

  async function load(){
    const r=await fetch("/api/ai/models",{cache:"no-store"});
    const j=await r.json();
    if(r.ok)setItems(j.items||[]); else setMsg(j.error||"Не удалось загрузить модели");
  }
  useEffect(()=>{load()},[]);

  async function add(){
    setBusy(true);setMsg("");
    const r=await fetch("/api/ai/models",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,provider,model,baseUrl:baseUrl||null,apiKey:apiKey||null})});
    const j=await r.json();
    if(r.ok){setName("");setModel("");setBaseUrl("");setApiKey("");setMsg("Модель подключена");await load()}else setMsg(j.error||"Ошибка подключения");
    setBusy(false);
  }
  async function remove(id:string){
    if(!confirm("Удалить подключение модели?"))return;
    const r=await fetch("/api/ai/models?id="+encodeURIComponent(id),{method:"DELETE"});
    if(r.ok)await load(); else {const j=await r.json();setMsg(j.error||"Ошибка удаления")}
  }

  return <main style={{maxWidth:1050,margin:"0 auto",padding:24,fontFamily:"system-ui",color:"#eef2ff"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <div><Link href="/app" style={{color:"#8be8d7",textDecoration:"none"}}>← Бизнес</Link><h1 style={{margin:"10px 0 4px"}}>Мои AI-модели</h1><p style={{margin:0,color:"#9ea8ba"}}>Подключайте свои модели. Каждая модель принадлежит только вашей учётной записи.</p></div>
      <Link href="/admin/ai" style={{color:"#9ea8ba"}}>AI Core платформы →</Link>
    </header>

    <section style={box}>
      <h2 style={{marginTop:0}}>＋ Подключить модель</h2>
      <div style={grid}>
        <label>Название<input value={name} onChange={e=>setName(e.target.value)} placeholder="Моя рабочая модель" style={input}/></label>
        <label>Провайдер<select value={provider} onChange={e=>setProvider(e.target.value)} style={input}>{providers.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label>Model ID<input value={model} onChange={e=>setModel(e.target.value)} placeholder="например gpt-4.1-mini" style={input}/></label>
        <label>Base URL {provider==="custom"||provider==="openai"||provider==="ollama"||provider==="groq"||provider==="openrouter"?"(если нужен)":""}<input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder={provider==="gemini"?"Можно оставить пустым":"https://.../v1"} style={input}/></label>
        <label style={{gridColumn:"1/-1"}}>API key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Ключ хранится зашифрованным и не показывается обратно" style={input}/></label>
      </div>
      <button disabled={busy||!name||!provider||!model} onClick={add} style={button}>{busy?"Подключение…":"Подключить модель"}</button>
      {msg&&<div style={{marginTop:12,color:"#9ea8ba"}}>{msg}</div>}
    </section>

    <section style={{display:"grid",gap:12,marginTop:18}}>
      {items.length===0?<div style={box}>Пока нет пользовательских моделей.</div>:items.map(x=><article key={x.id} style={box}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><strong style={{fontSize:18}}>{x.name}</strong><div style={{color:"#9ea8ba",marginTop:5}}>{x.provider} · <code>{x.model}</code></div><div style={{fontSize:12,color:"#718096",marginTop:5}}>{x.base_url||"Стандартный endpoint"} · {x.has_api_key?"API key сохранён":"Без API key"}</div></div><button onClick={()=>remove(x.id)} style={danger}>Удалить</button></div></article>)}
    </section>
  </main>
}
const box={padding:20,border:"1px solid #293244",borderRadius:18,background:"#101621",boxShadow:"0 12px 35px rgba(0,0,0,.18)"};
const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14};
const input={display:"block",width:"100%",boxSizing:"border-box" as const,marginTop:7,padding:"11px 12px",borderRadius:10,border:"1px solid #374258",background:"#080c13",color:"#fff"};
const button={marginTop:16,padding:"11px 16px",borderRadius:11,border:"1px solid #3b5264",background:"#16343a",color:"#fff",cursor:"pointer"};
const danger={padding:"9px 12px",borderRadius:10,border:"1px solid #5a3038",background:"#29161b",color:"#ffb5bd",cursor:"pointer"};
