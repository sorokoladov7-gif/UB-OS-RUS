"use client";
import {useEffect,useRef,useState} from "react";
type Message={id:string;role:"user"|"assistant";text:string;time:Date};
const suggestions=["Проверь состояние AI Core","Какие модели сейчас активны?","Объясни, как работает fallback","Проведи диагностику платформенного AI"];
export default function AdminAiChat(){
 const[messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[chats,setChats]=useState<any[]>([]),[active,setActive]=useState<string|null>(null),[sidebarOpen,setSidebarOpen]=useState(false);
 const endRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages,busy]);
 useEffect(()=>{loadChats()},[]);
 async function loadChats(){const r=await fetch("/api/admin/ai/chat",{cache:"no-store"});const j=await r.json().catch(()=>({}));if(r.ok)setChats(j.items||[])}
 async function openChat(id:string){setActive(id);setError("");setSidebarOpen(false);const r=await fetch("/api/admin/ai/chat/"+id,{cache:"no-store"});const j=await r.json().catch(()=>({}));if(r.ok)setMessages((j.messages||[]).map((m:any)=>({id:m.id,role:m.role,text:m.content,time:new Date(m.created_at)})))}
 async function send(value=input){const text=value.trim();if(!text||busy)return;setInput("");setError("");setMessages(p=>[...p,{id:crypto.randomUUID(),role:"user",text,time:new Date()}]);setBusy(true);
  try{const r=await fetch("/api/admin/ai/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({conversationId:active,message:text})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"AI временно недоступен");if(!active)setActive(j.conversationId);setMessages(p=>[...p,{id:crypto.randomUUID(),role:"assistant",text:j.text||"AI не вернул ответ.",time:new Date()}]);await loadChats();}
  catch(e){setError(e instanceof Error?e.message:"Не удалось получить ответ");}
  finally{setBusy(false)}
 }
 function newChat(){setMessages([]);setError("");setActive(null);setSidebarOpen(false)}
 async function renameChat(){if(!active)return;const current=chats.find(x=>x.id===active);const title=window.prompt("Название чата",current?.title||"Новый чат");if(!title?.trim())return;const r=await fetch("/api/admin/ai/chat/"+active,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({title})});if(r.ok)await loadChats()}
 async function deleteChat(id:string){if(!window.confirm("Удалить этот чат и его историю?"))return;const r=await fetch("/api/admin/ai/chat/"+id,{method:"DELETE"});if(r.ok){if(active===id){setActive(null);setMessages([])}await loadChats()}}
 function key(e:React.KeyboardEvent<HTMLTextAreaElement>){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}
 return <div className="admin-ai-shell">
  <style>{`
    .admin-ai-shell{display:flex;height:calc(100dvh - 80px);min-height:600px;background:#0b0f16;color:#eef2ff;border:1px solid #252d3b;border-radius:16px;overflow:hidden;position:relative}
    .admin-ai-sidebar{width:260px;flex:0 0 260px;background:#0a0d13;border-right:1px solid #252d3b;display:flex;flex-direction:column;padding:12px}
    .admin-ai-main{flex:1;min-width:0;display:flex;flex-direction:column}
    .admin-ai-menu{display:none}
    .admin-ai-overlay{display:none}
    @media(max-width:700px){
      .admin-ai-shell{height:calc(100dvh - 58px);min-height:0;width:100%;border-radius:0;border-left:0;border-right:0}
      .admin-ai-sidebar{position:absolute;inset:0 auto 0 0;width:min(86vw,320px);flex:0 0 auto;z-index:30;transform:translateX(-105%);transition:transform .2s ease;box-shadow:12px 0 35px rgba(0,0,0,.45)}
      .admin-ai-sidebar.open{transform:translateX(0)}
      .admin-ai-overlay{display:block;position:absolute;inset:0;background:rgba(0,0,0,.58);z-index:20}
      .admin-ai-menu{display:inline-flex;width:38px;height:38px;align-items:center;justify-content:center;border:1px solid #30394a;border-radius:10px;background:#151b25;color:#fff;font-size:19px;cursor:pointer;flex:0 0 auto}
      .admin-ai-header{height:auto!important;min-height:58px;padding:8px 10px!important;gap:8px}
      .admin-ai-header-actions{gap:5px!important}
      .admin-ai-header-actions .rename{display:none}
      .admin-ai-back{font-size:0!important;width:38px;height:38px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #30394a;border-radius:10px;background:#151b25}
      .admin-ai-back::after{content:"⚙";font-size:17px}
      .admin-ai-content{padding:16px 12px 120px!important}
      .admin-ai-empty{margin:7vh auto 0!important}
      .admin-ai-empty h1{font-size:27px!important}
      .admin-ai-empty p{font-size:14px;line-height:1.5}
      .admin-ai-suggestions{grid-template-columns:1fr!important}
      .admin-ai-message{max-width:94%!important}
      .admin-ai-composer{padding:9px 10px 10px!important}
      .admin-ai-composer-box{border-radius:16px!important}
      .admin-ai-disclaimer{display:none}
    }
  `}</style>
  {sidebarOpen&&<button className="admin-ai-overlay" aria-label="Закрыть список чатов" onClick={()=>setSidebarOpen(false)}/>}
  <aside className={sidebarOpen?"admin-ai-sidebar open":"admin-ai-sidebar"}>
   <button onClick={newChat} style={newBtn}>＋ Новый чат</button>
   <div style={{fontSize:11,color:"#7d8798",padding:"18px 10px 8px",letterSpacing:1}}>ЧАТЫ</div>
   <div style={{overflowY:"auto",flex:1}}>{chats.map((x)=><div key={x.id} style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>openChat(x.id)} style={{...chatBtn,background:x.id===active?"#202734":"transparent"}}>💬 {x.title}</button><button onClick={()=>deleteChat(x.id)} title="Удалить" style={trash}>×</button></div>)}</div>
   <div style={{borderTop:"1px solid #252d3b",paddingTop:12,fontSize:12,color:"#7d8798"}}>AI Core · панель администратора</div>
  </aside>
  <section className="admin-ai-main">
   <header className="admin-ai-header" style={{height:58,borderBottom:"1px solid #252d3b",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",background:"#0d121a"}}><div style={{display:"flex",alignItems:"center",gap:8}}><button className="admin-ai-menu" onClick={()=>setSidebarOpen(true)} aria-label="Открыть чаты">☰</button><div><b>AI-помощник</b><div style={{fontSize:11,color:"#7d8798"}}>Платформенный AI Core</div></div><div className="admin-ai-header-actions" style={{display:"flex",gap:8}}>{active&&<button className="rename" onClick={renameChat} style={headBtn}>✎ Переименовать</button>}<a className="admin-ai-back" href="/admin/ai" style={back}>⚙ AI Core</a></div></header>
   <div className="admin-ai-content" style={{flex:1,overflowY:"auto",padding:"24px 18px 140px"}}>{messages.length===0?<div className="admin-ai-empty" style={{maxWidth:760,margin:"12vh auto 0",textAlign:"center"}}><div style={{fontSize:54}}>✦</div><h1 style={{fontSize:32,margin:"14px 0 8px"}}>Чем могу помочь?</h1><p style={{color:"#8e99ab"}}>Внутренний AI-помощник администратора. Анализируйте AI Core и работу платформы в обычном диалоге.</p><div className="admin-ai-suggestions" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginTop:28}}>{suggestions.map(x=><button key={x} onClick={()=>send(x)} style={suggestion}>{x}</button>)}</div></div>:<div style={{maxWidth:820,margin:"0 auto"}}>{messages.map(m=><div key={m.id} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:24}}><div className="admin-ai-message" style={{maxWidth:"82%",display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:30,height:30,borderRadius:8,display:"grid",placeItems:"center",background:m.role==="assistant"?"#193b3a":"#293246",flex:"0 0 auto"}}>{m.role==="assistant"?"✦":"Я"}</div><div><div style={{fontSize:12,color:"#8e99ab",marginBottom:5}}>{m.role==="assistant"?"AI-помощник":"Вы"}</div><div style={{whiteSpace:"pre-wrap",lineHeight:1.65,fontSize:15}}>{m.text}</div></div></div></div>)}{busy&&<div style={{display:"flex",gap:10,color:"#8e99ab"}}><div style={{width:30,height:30,borderRadius:8,display:"grid",placeItems:"center",background:"#193b3a"}}>✦</div><div style={{paddingTop:5}}>AI печатает…</div></div>}<div ref={endRef}/></div>}</div>
   {error&&<div style={{maxWidth:820,width:"calc(100% - 32px)",margin:"0 auto 8px",color:"#ff9ea8",fontSize:13}}>⚠️ {error}</div>}
   <div className="admin-ai-composer" style={{position:"relative",padding:"12px 18px 18px",borderTop:"1px solid #252d3b",background:"#0d121a"}}><div className="admin-ai-composer-box" style={{maxWidth:820,margin:"0 auto",border:"1px solid #394457",borderRadius:18,background:"#111722",padding:10,display:"flex",gap:8,alignItems:"flex-end"}}><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={key} disabled={busy} rows={1} placeholder="Сообщить AI, что нужно сделать…" style={textarea}/><button onClick={()=>send()} disabled={busy||!input.trim()} style={sendBtn}>{busy?"…":"↑"}</button></div><div className="admin-ai-disclaimer" style={{maxWidth:820,margin:"8px auto 0",fontSize:11,color:"#596579",textAlign:"center"}}>AI может ошибаться. Проверяйте важные сведения перед изменениями.</div></div>
  </section>
 </div>
}
const newBtn={width:"100%",padding:"12px",borderRadius:10,border:"1px solid #30394a",background:"#171d28",color:"#fff",cursor:"pointer"};
const trash={border:0,background:"transparent",color:"#718096",cursor:"pointer",fontSize:18,padding:"5px"};const headBtn={padding:"7px 10px",borderRadius:8,border:"1px solid #30394a",background:"#151b25",color:"#cbd4e4",cursor:"pointer"};
const chatBtn={width:"100%",padding:"10px 12px",border:0,borderRadius:9,color:"#cbd4e4",textAlign:"left" as const,cursor:"pointer"};
const back={color:"#9eabc0",textDecoration:"none",fontSize:13};
const suggestion={padding:"14px",borderRadius:12,border:"1px solid #30394a",background:"#121822",color:"#d8dfeb",cursor:"pointer",textAlign:"left" as const};
const textarea={flex:1,minHeight:26,maxHeight:150,resize:"none" as const,border:0,outline:"none",background:"transparent",color:"#fff",fontSize:15,padding:"8px"};
const sendBtn={width:40,height:40,borderRadius:10,border:"0",background:"#d9f5ee",color:"#07110f",fontSize:20,cursor:"pointer"};
