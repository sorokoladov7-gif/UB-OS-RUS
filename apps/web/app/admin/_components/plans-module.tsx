"use client";

import {useState} from "react";
import type {AdminPlan} from "../types";

export function PlansModule({plans}:{plans:AdminPlan[]}) {
  const [items,setItems]=useState(plans);
  const [editing,setEditing]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function save(plan:AdminPlan){
    setBusy(true); setMessage("");
    try{
      const res=await fetch("/api/admin/plans",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
        planId:plan.id,name:plan.name,description:"",priceMonthly:Number(plan.price_monthly),trialDays:Number(plan.trial_days),
        features:{},enabled:plan.enabled,position:Number(plan.position??0)
      })});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Не удалось сохранить тариф");
      setItems(v=>v.map(x=>x.id===plan.id?{...x,...plan}:x));
      setEditing(null); setMessage("Тариф сохранён");
    }catch(e){setMessage(e instanceof Error?e.message:"Ошибка сохранения");}
    finally{setBusy(false);}
  }

  return <section style={{marginTop:28}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div><h2 style={{fontSize:22,marginBottom:4}}>Тарифы</h2><div style={{color:"#8f9ab0",fontSize:13}}>Редактирование цены, trial и доступности прямо из Platform Admin.</div></div>
      {message&&<div style={{color:"#b8c0d0",fontSize:13}}>{message}</div>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginTop:14}}>
      {items.map(p=>editing===p.id?<PlanEditor key={p.id} plan={p} busy={busy} onCancel={()=>setEditing(null)} onSave={save}/>:<div key={p.id} style={{padding:18,border:"1px solid #303747",borderRadius:16,background:"#121620"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10}}><strong>{p.name}</strong><span style={{fontSize:12,color:p.enabled?"#8ee6b0":"#f0a0a0"}}>{p.enabled?"АКТИВЕН":"ВЫКЛЮЧЕН"}</span></div>
        <div style={{marginTop:8,fontSize:20}}>{Number(p.price_monthly).toLocaleString("ru-RU")} ₽/мес.</div>
        <div style={{color:"#aab2c3",fontSize:13,marginTop:5}}>{p.trial_days} дней trial</div>
        <button onClick={()=>setEditing(p.id)} style={buttonStyle}>Редактировать</button>
      </div>)}
    </div>
  </section>;
}

function PlanEditor({plan,busy,onCancel,onSave}:{plan:AdminPlan;busy:boolean;onCancel:()=>void;onSave:(p:AdminPlan)=>void}){
 const [p,setP]=useState(plan);
 const inputStyle={width:"100%",boxSizing:"border-box" as const,padding:"10px 11px",borderRadius:10,border:"1px solid #303747",background:"#0b0d12",color:"#f7f8fa"};
 return <div style={{padding:18,border:"1px solid #52607a",borderRadius:16,background:"#121620"}}>
   <input style={inputStyle} value={p.name} onChange={e=>setP({...p,name:e.target.value})}/>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
     <label style={{fontSize:12,color:"#8f9ab0"}}>Цена/мес.<input style={inputStyle} type="number" min="0" value={p.price_monthly} onChange={e=>setP({...p,price_monthly:Number(e.target.value)})}/></label>
     <label style={{fontSize:12,color:"#8f9ab0"}}>Trial, дней<input style={inputStyle} type="number" min="0" value={p.trial_days} onChange={e=>setP({...p,trial_days:Number(e.target.value)})}/></label>
   </div>
   <label style={{display:"flex",gap:8,alignItems:"center",marginTop:12,fontSize:13}}><input type="checkbox" checked={p.enabled} onChange={e=>setP({...p,enabled:e.target.checked})}/> Тариф доступен для новых подключений</label>
   <div style={{display:"flex",gap:8,marginTop:14}}><button disabled={busy} onClick={()=>onSave(p)} style={buttonStyle}>{busy?"Сохранение…":"Сохранить"}</button><button disabled={busy} onClick={onCancel} style={{...buttonStyle,background:"#1a1f2b"}}>Отмена</button></div>
 </div>;
}
const buttonStyle={marginTop:14,padding:"9px 13px",borderRadius:10,border:"1px solid #3c465b",background:"#1b2332",color:"#f7f8fa",cursor:"pointer"};
