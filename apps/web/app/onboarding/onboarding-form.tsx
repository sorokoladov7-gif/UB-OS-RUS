"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Plan = { key:string; name:string; description:string|null; price_monthly:number; trial_days:number; features:string[] };
type Industry = { key:string; name:string; description:string|null; version:string };

function slugify(value:string){return value.toLowerCase().trim().replace(/[^a-zа-яё0-9]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48)||"business";}

export default function OnboardingForm({plans,industries,selectedPlan}:{plans:Plan[];industries:Industry[];selectedPlan:string}) {
 const router=useRouter(); const [plan,setPlan]=useState(selectedPlan); const [industry,setIndustry]=useState(industries[0]?.key??"professional_services");
 const [name,setName]=useState(""); const [workspace,setWorkspace]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");
  const response=await fetch("/api/onboarding",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({organizationName:name,organizationSlug:slugify(name),workspaceName:workspace||name,workspaceSlug:slugify(workspace||name),planKey:plan,industryKey:industry})});
  const data=await response.json().catch(()=>({})); if(data?.redirect){router.push(String(data.redirect));router.refresh();return;} if(!response.ok)setError(data.error||"Не удалось создать систему."); else {router.push("/app");router.refresh();} setBusy(false);
 }
 return <main style={{minHeight:"100vh",background:"#0b0d12",color:"#f7f8fa",padding:"32px 20px",fontFamily:"system-ui"}}><div style={{maxWidth:980,margin:"0 auto"}}>
  <div style={{color:"#8f9ab0",fontSize:13,letterSpacing:".12em"}}>НАСТРОЙКА · UB OS-RUS</div>
  <h1 style={{fontSize:"clamp(40px,7vw,68px)",lineHeight:1,margin:"14px 0"}}>Соберите операционную систему бизнеса.</h1>
  <p style={{color:"#aab2c3",maxWidth:760,lineHeight:1.6}}>Сначала выберите тариф и направление бизнеса. UB OS-RUS установит соответствующий набор модулей автоматически. Первые {plans.find(p=>p.key===plan)?.trial_days??10} дней бесплатно.</p>
  <form onSubmit={submit} style={{marginTop:30,display:"grid",gap:22}}>
   <section><h2 style={{fontSize:20}}>1. Тариф</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>{plans.map(p=><button type="button" key={p.key} onClick={()=>setPlan(p.key)} style={{textAlign:"left",padding:20,borderRadius:18,border:"1px solid "+(plan===p.key?"#9ca7ba":"#303747"),background:plan===p.key?"#202736":"#121620",color:"white"}}><strong style={{fontSize:20}}>{p.name}</strong><div style={{fontSize:24,marginTop:8}}>{Number(p.price_monthly).toLocaleString("ru-RU")} ₽<small style={{fontSize:13,color:"#9ea8ba"}}> / мес.</small></div><div style={{color:"#9ea8ba",marginTop:8}}>{p.description}</div><div style={{color:"#cbd2df",marginTop:12}}>{p.trial_days} дней бесплатно</div></button>)}</div></section>
   <section><h2 style={{fontSize:20}}>2. Направление бизнеса</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10}}>{industries.map(i=><button type="button" key={i.key} onClick={()=>setIndustry(i.key)} style={{textAlign:"left",padding:15,borderRadius:14,border:"1px solid "+(industry===i.key?"#9ca7ba":"#303747"),background:industry===i.key?"#202736":"#121620",color:"white"}}><strong>{i.name}</strong><div style={{color:"#8f9ab0",fontSize:12,marginTop:5}}>{i.description||"Отраслевой набор модулей"}</div></button>)}</div></section>
   <section style={{display:"grid",gap:12,maxWidth:620}}><h2 style={{fontSize:20}}>3. Данные бизнеса</h2>
    <label>Название бизнеса<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} placeholder="Например, ООО «Мой бизнес»" style={{display:"block",width:"100%",marginTop:7,padding:14,borderRadius:12,border:"1px solid #303747",background:"#121620",color:"white",boxSizing:"border-box"}}/></label>
    <label>Название рабочего пространства<input value={workspace} onChange={e=>setWorkspace(e.target.value)} placeholder="Можно оставить пустым — будет как название бизнеса" style={{display:"block",width:"100%",marginTop:7,padding:14,borderRadius:12,border:"1px solid #303747",background:"#121620",color:"white",boxSizing:"border-box"}}/></label>
   </section>
   {error&&<div style={{color:"#ffb4b4",padding:14,border:"1px solid #693a3a",borderRadius:12}}>{error}</div>}
   <button disabled={busy} style={{width:"fit-content",padding:"15px 24px",borderRadius:12,border:0,fontWeight:800}}>{busy?"Создаём систему…":"Создать систему"}</button>
  </form>
 </div></main>;
}