"use client";

import {useMemo} from "react";

type Field={id:string;key:string;name:string;field_type:string;required:boolean;config?:any};
type Status={id:string;key:string;name:string};
type RecordItem={id:string;status_id:string|null;data:Record<string,any>;created_at:string;updated_at:string};

const moduleText:Record<string,{title:string;action:string;hint:string}> = {
 crm:{title:"Клиенты",action:"Добавить клиента",hint:"Контакты, история и заметки по клиентам."},
 sales:{title:"Продажи",action:"Создать заказ",hint:"Заказы и сделки с суммой, клиентом и этапом."},
 services:{title:"Записи",action:"Новая запись",hint:"Записи клиентов на услуги и контроль выполнения."},
 products:{title:"Товары",action:"Добавить товар",hint:"Каталог, цены, артикулы и остатки."},
 inventory:{title:"Склад",action:"Добавить позицию",hint:"Остатки по товарам и складам."},
 finance:{title:"Финансы",action:"Добавить операцию",hint:"Доходы и расходы с автоматическим итогом."},
 employees:{title:"Сотрудники",action:"Добавить сотрудника",hint:"Рабочий справочник сотрудников и контактов."},
 documents:{title:"Документы",action:"Добавить документ",hint:"Реестр документов с датой и комментариями."},
 projects:{title:"Проекты",action:"Создать проект",hint:"Проекты, ответственные, сроки и этапы."},
 support:{title:"Обращения",action:"Создать обращение",hint:"Очередь обращений клиентов и их статусы."},
 reports:{title:"Показатели",action:"Добавить показатель",hint:"Фактические значения для управленческой аналитики."}
};

function n(v:any){const x=Number(v);return Number.isFinite(x)?x:0}
function money(v:number){return new Intl.NumberFormat("ru-RU",{style:"currency",currency:"RUB",maximumFractionDigits:2}).format(v)}
function dateValue(v:any){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function statusName(r:RecordItem,statuses:Status[]){return statuses.find(s=>s.id===r.status_id)?.name??"Без статуса"}

export function ModuleDashboard({moduleKey,fields,statuses,records}:{moduleKey:string;fields:Field[];statuses:Status[];records:RecordItem[]}){
 const text=moduleText[moduleKey]??{title:"Рабочие данные",action:"Добавить запись",hint:"Управляйте рабочими данными бизнеса."};
 const metrics=useMemo(()=>{
   const total=records.length;
   const amount=records.reduce((s,r)=>s+n(r.data?.amount),0);
   const income=records.filter(r=>String(r.data?.type??"").toLowerCase()==="доход").reduce((s,r)=>s+n(r.data?.amount),0);
   const expense=records.filter(r=>String(r.data?.type??"").toLowerCase()==="расход").reduce((s,r)=>s+n(r.data?.amount),0);
   const quantity=records.reduce((s,r)=>s+n(r.data?.quantity),0);
   const open=records.filter(r=>{const x=statusName(r,statuses).toLowerCase();return !x.includes("заверш")&&!x.includes("закрыт")}).length;
   const now=new Date(); const today=now.toDateString();
   const todayCount=records.filter(r=>{const d=dateValue(r.data?.date);return d?.toDateString()===today}).length;
   const lowStock=records.filter(r=>n(r.data?.quantity)<=5).length;
   const projectsDone=records.filter(r=>statusName(r,statuses).toLowerCase().includes("заверш")).length;
   return {total,amount,income,expense,balance:income-expense,quantity,open,todayCount,lowStock,projectsDone};
 },[records,statuses]);

 const cards=useMemo(()=>{
   switch(moduleKey){
    case "finance": return [["Операций",String(metrics.total)],["Доходы",money(metrics.income)],["Расходы",money(metrics.expense)],["Баланс",money(metrics.balance)]];
    case "sales": return [["Заказов и сделок",String(metrics.total)],["Сумма",money(metrics.amount)],["В работе",String(metrics.open)],["Завершено",String(metrics.projectsDone)]];
    case "services": return [["Всего записей",String(metrics.total)],["На сегодня",String(metrics.todayCount)],["В работе",String(metrics.open)],["Завершено",String(metrics.projectsDone)]];
    case "products": return [["Товаров",String(metrics.total)],["Единиц на учёте",String(metrics.quantity)],["Сумма цен",money(metrics.amount)],["Малый остаток",String(metrics.lowStock)]];
    case "inventory": return [["Позиции",String(metrics.total)],["Единиц",String(metrics.quantity)],["Малый остаток",String(metrics.lowStock)],["Складских записей",String(metrics.total)]];
    case "support": return [["Обращений",String(metrics.total)],["Открытых",String(metrics.open)],["В работе",String(records.filter(r=>statusName(r,statuses).toLowerCase().includes("работ")).length)],["Закрытых",String(metrics.projectsDone)]];
    case "projects": return [["Проектов",String(metrics.total)],["Активных",String(metrics.open)],["Завершено",String(metrics.projectsDone)],["С дедлайном",String(records.filter(r=>!!r.data?.deadline).length)]];
    default: return [["Всего записей",String(metrics.total)],["Активных",String(metrics.open)],["За сегодня",String(metrics.todayCount)],["Обновлено",String(records.filter(r=>new Date(r.updated_at).toDateString()===new Date().toDateString()).length)]];
   }
 },[moduleKey,metrics,records,statuses]);

 const recent=records.slice(0,5);
 function openForm(){document.getElementById("module-record-form")?.scrollIntoView({behavior:"smooth",block:"start"})}
 return <section style={{display:"grid",gap:14,marginTop:22}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap",padding:18,border:"1px solid #293b4d",borderRadius:16,background:"linear-gradient(135deg,#101b27,#0c131c)"}}>
     <div><div style={{fontSize:12,color:"#7dd3c7",letterSpacing:".1em"}}>РАБОЧИЙ ЦЕНТР · {moduleKey.toUpperCase()}</div><h2 style={{margin:"5px 0 4px",fontSize:22}}>{text.title}</h2><p style={{margin:0,color:"#8f9bad"}}>{text.hint}</p></div>
     <button onClick={openForm} style={primary}>{text.action} +</button>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10}}>
     {cards.map(([label,value])=><div key={label} style={metric}><div style={{fontSize:12,color:"#7f8ca1"}}>{label}</div><strong style={{display:"block",marginTop:6,fontSize:20}}>{value}</strong></div>)}
   </div>
   {moduleKey==="finance"&&<div style={info}>Финансовый результат рассчитывается по записям: «Доход» минус «Расход». Изменение записи сразу меняет показатели.</div>}
   {moduleKey==="inventory"&&<div style={info}>Позиции с остатком 5 единиц и меньше отмечаются как требующие внимания.</div>}
   {moduleKey==="services"&&<div style={info}>Записи с сегодняшней датой автоматически попадают в показатель «На сегодня».</div>}
   {moduleKey==="sales"&&<div style={info}>Используйте статусы «Новые», «В работе» и «Завершено» для управления воронкой.</div>}
   {recent.length>0&&<div style={recentBox}><div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><strong>Последние записи</strong><button onClick={openForm} style={linkButton}>Добавить</button></div><div style={{display:"grid",gap:8,marginTop:10}}>{recent.map(r=><div key={r.id} style={recentRow}><div><strong>{String(r.data?.name??r.data?.topic??r.data?.indicator??"Запись")}</strong><div style={{fontSize:12,color:"#748095",marginTop:3}}>{statusName(r,statuses)}</div></div><div style={{textAlign:"right",fontSize:13,color:"#aab2c3"}}>{moduleKey==="finance"&&r.data?.amount!==undefined?money(n(r.data.amount)):moduleKey==="sales"&&r.data?.amount!==undefined?money(n(r.data.amount)):new Date(r.updated_at).toLocaleDateString("ru-RU")}</div></div>)}</div></div>}
 </section>
}

const primary={padding:"11px 15px",borderRadius:10,border:"1px solid #4b8f84",background:"#173a39",color:"#d8fff7",fontWeight:700,cursor:"pointer"};
const metric={padding:"14px",border:"1px solid #293747",borderRadius:13,background:"#0d151f"};
const info={padding:"12px 14px",border:"1px solid #304653",borderRadius:12,background:"#0c1b22",color:"#a8bac8",fontSize:13,lineHeight:1.5};
const recentBox={padding:16,border:"1px solid #293747",borderRadius:14,background:"#0d151f"};
const recentRow={display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",padding:"10px 0",borderTop:"1px solid #202b38"};
const linkButton={border:0,background:"transparent",color:"#7dd3c7",cursor:"pointer"};
