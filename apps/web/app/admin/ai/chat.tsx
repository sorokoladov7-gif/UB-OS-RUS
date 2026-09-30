"use client";
import {useEffect,useRef,useState} from "react";
type Message={id:string;role:"user"|"assistant";text:string;time:Date};
const suggestions=["Проверь состояние AI Core","Какие модели сейчас активны?","Объясни, как работает fallback","Проведи диагностику платформенного AI"];
export default function AdminAiChat(){
 const[messages,setMessages]=useState<Message[]>([]),[input,setInput]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[chats,setChats]=useState<any[]>([]),[active,setActive]=useState<string|null>(null),[sidebarOpen,setSidebarOpen]=useState(false);
 const[mobile,setMobile]=useState(false);\n useEffect(()=>{const sync=()=>setMobile(window.innerWidth<=700);sync();window.addEventListener("resize",sync);return()=>window.removeEventListener("resize",sync)},[]);\n const endRef=useRef<HTMLDivElement>(null);
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
 return <>
  <div style={{display:"flex",height:mobile?"calc(100dvh - 58px)":"calc(100vh - 80px)",minHeight:mobile?0:600,background:"#0b0f16",color:"#eef2ff",border:mobile?"0":"1px solid #252d3b",borderRadius:mobile?0:16,overflow:"hidden",position:"relative"}}>
   {mobile&&sidebarOpen&&<button aria-label="Закрыть список чатов" onClick={()=>setSidebarOpen(false)} style={overlay}/>}
   <aside style={{width:mobile?"min(86vw,320px)":260,flex:mobile?"0 0 auto":"0 0 260px",background:"#0a0d13",borderRight:"1px solid #252d3b",display:"flex",flexDirection:"column",padding:12,position:mobile?"absolute":"relative",top:0,bottom:0,left:0,zIndex:30,transform:mobile?(sidebarOpen?"translateX(0)":"translateX(-105%)"):"none",transition:"transform .2s ease",boxShadow:mobile?"12px 0 35px rgba(0,0,0,.45)":"none"}}>
    <button onClick={newChat} style={newBtn}>＋ Новый чат</button>
    <div style={{fontSize:11,color:"#7d8798",padding:"18px 10px 8px",letterSpacing:1}}>ЧАТЫ</div>
    <div style={{overflowY:"auto",flex:1}}>{chats.map((x)=><div key={x.id} style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>openChat(x.id)} style={{...chatBtn,background:x.id===active?"#202734":"transparent"}}>💬 {x.title}</button><button onClick={()=>deleteChat(x.id)} title="Удалить" style={trash}>×</button></div>)}</div>
    <div style={{borderTop:"1px solid #252d3b",paddingTop:12,fontSize:12,color:"#7d8798"}}>AI Core · панель администратора</div>
   </aside>
   <section style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
    <header style={{height:58,borderBottom:"1px solid #252d3b",display:"flex",alignItems:"center",justifyContent:"space-between",padding:mobile?"8px 10px":"0 18px",background:"#0d121a",gap:8}}>
     <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
      {mobile&&<button onClick={()=>setSidebarOpen(true)} aria-label="Открыть чаты" style={menuBtn}>☰</button>}
      <div><b>AI-помощник</b><div style={{fontSize:11,color:"#7d8798"}}>Платформенный AI Core</div></div>
     </div>
     <div style={{display:"flex",gap:mobile?5:8,flexShrink:0}}>
      {active&&!mobile&&<button onClick={renameChat} style={headBtn}>✎ Переименовать</button>}
      <a href="/admin/ai" aria-label="AI Core" style={mobile?mobileBack:back}>{mobile?"⚙":"⚙ AI Core"}</a>
     </div>
    </header>
    <div style={{flex:1,overflowY:"auto",padding:mobile?"16px 12px 120px":"24px 18px 140px"}}>
     {messages.length===0?<div style={{maxWidth:760,margin:mobile?"7vh auto 0":"12vh auto 0",textAlign:"center"}}>
      <div style={{fontSize:54}}>✦</div><h1 style={{fontSize:mobile?27:32,margin:"14px 0 8px"}}>Чем могу помочь?</h1>
      <p style={{color:"#8e99ab",fontSize:mobile?14:15,lineHeight:1.5}}>Внутренний AI-помощник администратора. Анализируйте AI Core и работу платформы в обычном диалоге.</p>
      <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginTop:28}}>{suggestions.map(x=><button key={x} onClick={()=>send(x)} style={suggestion}>{x}</button>)}</div>
     </div>:<div style={{maxWidth:820,margin:"0 auto"}}>
      {messages.map(m=><div key={m.id} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:24}}>
       <div style={{maxWidth:mobile?"94%":"82%",display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:30,height:30,borderRadius:8,display:"grid",placeItems:"center",background:m.role==="assistant"?"#193b3a":"#293246",flex:"0 0 auto"}}>{m.role==="assistant"?"✦":"Я"}</div><div><div style={{fontSize:12,color:"#8e99ab",marginBottom:5}}>{m.role==="assistant"?"AI-помощник":"Вы"}</div><div style={{whiteSpace:"pre-wrap",lineHeight:1.65,fontSize:15}}>{m.text}</div></div></div>
      </div>)}{busy&&<div style={{display:"flex",gap:10,color:"#8e99ab"}}><div style={{width:30,height:30,borderRadius:8,display:"grid",placeItems:"center",background:"#193b3a"}}>✦</div><div style={{paddingTop:5}}>AI печатает…</div></div>}<div ref={endRef}/>
     </div>}
    </div>
    {error&&<div style={{maxWidth:820,width:mobile?"calc(100% - 20px)":"calc(100% - 32px)",margin:"0 auto 8px",color:"#ff9ea8",fontSize:13}}>⚠️ {error}</div>}
    <div style={{position:"relative",padding:mobile?"9px 10px 10px":"12px 18px 18px",borderTop:"1px solid #252d3b",background:"#0d121a"}}>
     <div style={{maxWidth:820,margin:"0 auto",border:"1px solid #394457",borderRadius:18,background:"#111722",padding:10,display:"flex",gap:8,alignItems:"flex-end"}}>
      <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={key} disabled={busy} rows={1} placeholder="Сообщить AI, что нужно сделать…" style={textarea}/>
      <button onClick={()=>send()} disabled={busy||!input.trim()} style={sendBtn}>{busy?"…":"↑"}</button>
     </div>
     {!mobile&&<div style={{maxWidth:820,margin:"8px auto 0",fontSize:11,color:"#596579",textAlign:"center"}}>AI может ошибаться. Проверяйте важные сведения перед изменениями.</div>}
    </div>
   </section>
  </div>
 </>
const overlay={position:"absolute",inset:0,zIndex:20,border:0,background:"rgba(0,0,0,.58)",padding:0};\nconst menuBtn={width:38,height:38,border:"1px solid #30394a",borderRadius:10,background:"#151b25",color:"#fff",fontSize:19,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"};\nconst mobileBack={width:38,height:38,display:"inline-flex",alignItems:"center",justifyContent:"center",border:"1px solid #30394a",borderRadius:10,background:"#151b25",color:"#fff",textDecoration:"none"};\nconst newBtn={width:"100%",padding:"12px",borderRadius:10,border:"1px solid #30394a",background:"#171d28",color:"#fff",cursor:"pointer"};
const trash={border:0,background:"transparent",color:"#718096",cursor:"pointer",fontSize:18,padding:"5px"};const headBtn={padding:"7px 10px",borderRadius:8,border:"1px solid #30394a",background:"#151b25",color:"#cbd4e4",cursor:"pointer"};
const chatBtn={width:"100%",padding:"10px 12px",border:0,borderRadius:9,color:"#cbd4e4",textAlign:"left" as const,cursor:"pointer"};
const back={color:"#9eabc0",textDecoration:"none",fontSize:13};
const suggestion={padding:"14px",borderRadius:12,border:"1px solid #30394a",background:"#121822",color:"#d8dfeb",cursor:"pointer",textAlign:"left" as const};
const textarea={flex:1,minHeight:26,maxHeight:150,resize:"none" as const,border:0,outline:"none",background:"transparent",color:"#fff",fontSize:15,padding:"8px"};
const sendBtn={width:40,height:40,borderRadius:10,border:"0",background:"#d9f5ee",color:"#07110f",fontSize:20,cursor:"pointer"};
