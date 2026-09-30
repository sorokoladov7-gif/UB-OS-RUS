"use client";
import {useState} from "react"; import {useRouter} from "next/navigation";
type Field={id:string;key:string;name:string;field_type:string;required:boolean;config?:any};
type Status={id:string;key:string;name:string};
type RecordItem={id:string;status_id:string|null;data:Record<string,any>;created_at:string;updated_at:string};
function inputType(t:string){return t==="number"||t==="money"?"number":t==="date"?"date":t==="datetime"?"datetime-local":t==="email"?"email":t==="phone"?"tel":"text"}
function normalizeValue(f:Field,v:any){if(v===undefined||v===null)return "";if(f.field_type==="datetime")return String(v).slice(0,16);return v}
export function RecordPanel({workspaceId,entityId,fields,statuses,initialRecords}:{workspaceId:string;entityId:string;fields:Field[];statuses:Status[];initialRecords:RecordItem[]}){
 const router=useRouter(); const [data,setData]=useState<Record<string,any>>({}); const [statusId,setStatusId]=useState(""); const [editing,setEditing]=useState<RecordItem|null>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
 function setValue(key:string,value:any){setData(v=>({...v,[key]:value}))}
 function startEdit(r:RecordItem){setEditing(r);setData({...r.data});setStatusId(r.status_id??"");setError("");window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})}
 function reset(){setEditing(null);setData({});setStatusId("");setError("")}
 async function save(){
  setBusy(true);setError("");try{
   for(const f of fields)if(f.required&&(data[f.key]===undefined||data[f.key]===""))throw new Error("Заполните обязательное поле: "+f.name);
   const url="/api/builder/record"; const r=await fetch(url,{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing?{recordId:editing.id,data,statusId:statusId||null}:{workspaceId,entityId,data,statusId:statusId||null})});
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Не удалось сохранить запись");reset();router.refresh();
  }catch(e){setError(e instanceof Error?e.message:"Ошибка сохранения")}finally{setBusy(false)}
 }
 async function remove(id:string){
  if(!window.confirm("Удалить эту запись? Это действие нельзя отменить."))return;
  setBusy(true);setError("");try{const r=await fetch("/api/builder/record?id="+encodeURIComponent(id)+"&workspaceId="+encodeURIComponent(workspaceId),{method:"DELETE"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Не удалось удалить запись");if(editing?.id===id)reset();router.refresh()}catch(e){setError(e instanceof Error?e.message:"Ошибка удаления")}finally{setBusy(false)}
 }
 return <section style={{display:"grid",gap:18,marginTop:18}}>
  <div style={{padding:20,border:"1px solid #303747",borderRadius:16}}>
   <h2 style={{marginTop:0}}>{editing?"Редактирование записи":"Новая запись"}</h2><p style={{color:"#8f9ab0",fontSize:13}}>{editing?"Измените данные и сохраните запись.":"Заполните поля сущности и сохраните первую бизнес-запись."}</p>
   <div style={{display:"grid",gap:12,maxWidth:720}}>
    {statuses.length>0&&<label style={{display:"grid",gap:6,color:"#aab2c3"}}>Статус<select value={statusId} onChange={e=>setStatusId(e.target.value)} style={input}><option value="">Без статуса</option>{statuses.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
    {fields.map(f=><label key={f.id} style={{display:"grid",gap:6,color:"#aab2c3"}}>{f.name}{f.required?" *":""}{f.field_type==="long_text"?<textarea value={data[f.key]??""} onChange={e=>setValue(f.key,e.target.value)} style={input} rows={4}/>:f.field_type==="boolean"?<input type="checkbox" checked={!!data[f.key]} onChange={e=>setValue(f.key,e.target.checked)} style={{width:18,height:18}}/>:f.field_type==="select"?<select value={data[f.key]??""} onChange={e=>setValue(f.key,e.target.value)} style={input}><option value="">Выберите…</option>{(f.config?.options??[]).map((o:any)=><option key={String(o)} value={String(o)}>{String(o)}</option>)}</select>:<input type={inputType(f.field_type)} value={normalizeValue(f,data[f.key])} onChange={e=>setValue(f.key,f.field_type==="number"||f.field_type==="money"?(e.target.value===""?"":Number(e.target.value)):e.target.value)} style={input} placeholder={f.field_type==="relation"?"Введите ID связанной записи":f.key}/>}</label>)}
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button disabled={busy} onClick={save} style={button}>{busy?"Сохраняем…":editing?"Сохранить изменения":"Создать запись"}</button>{editing&&<button disabled={busy} onClick={reset} style={secondary}>Отмена</button>}</div>{error&&<div style={{color:"#ffb4b4"}}>{error}</div>}
   </div>
  </div>
  <div style={{padding:20,border:"1px solid #303747",borderRadius:16}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 4px"}}>Записи</h2><div style={{color:"#8f9ab0",fontSize:13}}>Всего: {initialRecords.length}</div></div></div>
   {initialRecords.length===0?<div style={{padding:"24px 0",color:"#8f9ab0"}}>Записей пока нет. Создайте первую запись выше.</div>:<div style={{display:"grid",gap:10,marginTop:14}}>{initialRecords.map(r=><article key={r.id} style={{border:"1px solid #303747",borderRadius:12,padding:14,background:"#121620"}}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><strong>{fields[0]?String(r.data?.[fields[0].key]??"Без названия"):"Запись"}</strong>{r.status_id&&<span style={{marginLeft:8,color:"#aab2c3"}}>{statuses.find(s=>s.id===r.status_id)?.name??"Статус"}</span>}<div style={{fontSize:12,color:"#737e94",marginTop:4}}>{new Date(r.updated_at).toLocaleString("ru-RU")}</div></div><div style={{display:"flex",gap:8}}><button disabled={busy} onClick={()=>startEdit(r)} style={secondary}>Изменить</button><button disabled={busy} onClick={()=>remove(r.id)} style={danger}>Удалить</button></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginTop:12}}>{fields.slice(0,6).map(f=><div key={f.id} style={{fontSize:13,color:"#aab2c3"}}><span style={{color:"#737e94"}}>{f.name}: </span>{f.field_type==="boolean"?(r.data?.[f.key]?"Да":"Нет"):String(r.data?.[f.key]??"—")}</div>)}</div></article>)}</div>}
  </div>
 </section>
}
const input={padding:11,borderRadius:10,border:"1px solid #303747",background:"#121620",color:"white",width:"100%",boxSizing:"border-box" as const};
const button={width:"fit-content",padding:"11px 16px",borderRadius:10,fontWeight:700};
const secondary={padding:"9px 13px",borderRadius:9,fontWeight:600};
const danger={padding:"9px 13px",borderRadius:9,fontWeight:600,color:"#ffb4b4"};
