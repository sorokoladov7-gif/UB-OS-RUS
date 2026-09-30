import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {getWorkspaceContext} from "@/lib/workspace";
import {createSupabaseServerClient} from "@/lib/supabase/server";

const META:Record<string,{name:string;icon:string;description:string;actions:string[]}>={
 crm:{name:"Клиенты и CRM",icon:"👥",description:"Единое пространство для клиентов, контактов и сделок.",actions:["Клиенты","Контакты","Сделки"]},
 documents:{name:"Документы",icon:"📄",description:"Работа с документами и файлами бизнеса.",actions:["Документы","Файлы","Шаблоны"]},
 employees:{name:"Сотрудники",icon:"👤",description:"Команда, роли и организационная структура.",actions:["Сотрудники","Роли","Графики"]},
 finance:{name:"Финансы",icon:"💰",description:"Финансовые операции и контроль денежных показателей.",actions:["Операции","Платежи","Отчёты"]},
 inventory:{name:"Склад",icon:"📦",description:"Остатки, склады и движения товаров.",actions:["Остатки","Склады","Движения"]},
 products:{name:"Товары",icon:"🛍️",description:"Каталог товаров, цены и характеристики.",actions:["Каталог","Цены","Категории"]},
 projects:{name:"Проекты",icon:"📋",description:"Проекты, задачи и контроль этапов.",actions:["Проекты","Задачи","Этапы"]},
 reports:{name:"Отчёты",icon:"📊",description:"Аналитика и отчётность по данным бизнеса.",actions:["Обзор","Показатели","Отчёты"]},
 sales:{name:"Продажи",icon:"💳",description:"Заказы, предложения и продажи.",actions:["Заказы","Предложения","Воронка"]},
 services:{name:"Услуги",icon:"🛠️",description:"Услуги, записи и выполнение работ.",actions:["Услуги","Записи","Выполнение"]},
 support:{name:"Поддержка",icon:"🎧",description:"Обращения клиентов и внутренние запросы.",actions:["Обращения","Запросы","История"]}
};
export default async function ModulePage({params}:{params:Promise<{key:string}>}){
 const context=await getWorkspaceContext();if(!context?.membership||!context.activeWorkspace)redirect("/onboarding");
 const {key}=await params;const meta=META[key];if(!meta)notFound();const s=await createSupabaseServerClient();
 const {data:installed}=await s.from("workspace_modules").select("enabled,module_definitions(key,name,description)").eq("workspace_id",context.activeWorkspace.id).eq("enabled",true);
 const active=(installed??[]).some((x:any)=>{const d=Array.isArray(x.module_definitions)?x.module_definitions[0]:x.module_definitions;return d?.key===key});if(!active)notFound();
 const {data:entities}=await s.from("entity_definitions").select("id,key,name,description").eq("workspace_id",context.activeWorkspace.id).order("name");
 const entityRows=await Promise.all((entities??[]).map(async(e:any)=>{const r=await s.from("records").select("id",{count:"exact",head:true}).eq("workspace_id",context.activeWorkspace.id).eq("entity_id",e.id);return {...e,count:r.count??0}}));
 const relevant=entityRows.filter((e:any)=>e.key.toLowerCase().includes(key.toLowerCase())||e.name.toLowerCase().includes(meta.name.split(" ")[0].toLowerCase()));
 const shown=relevant.length?relevant:entityRows;
 const total=shown.reduce((n:number,e:any)=>n+e.count,0);
 return <main style={shell}><div style={{maxWidth:1180,margin:"0 auto",padding:"28px 16px 60px"}}>
  <Link href="/app" style={back}>← Рабочий центр</Link>
  <section style={{...card,marginTop:14}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}><div><div style={{fontSize:42}}>{meta.icon}</div><div style={eyebrow}>РАБОЧИЙ МОДУЛЬ</div><h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"7px 0"}}>{meta.name}</h1><p style={{color:"#9ea8ba",maxWidth:700,lineHeight:1.6}}>{meta.description}</p></div><div style={metric}><div style={metricNumber}>{total}</div><div style={metricLabel}>записей в рабочих объектах</div></div></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,marginTop:24}}>{meta.actions.map((a,i)=><div key={a} style={actionCard}><strong>{a}</strong><div style={{marginTop:7,color:"#7f8ca1",fontSize:13}}>{i===0?"Основной рабочий список":i===1?"Управление и обработка":"Аналитика и контроль"}</div></div>)}</div>
  </section>
  <section style={{marginTop:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 5px"}}>Рабочие объекты</h2><p style={{color:"#8f9bad",margin:0}}>Реальные сущности конструктора и количество записей.</p></div><Link href="/app/builder" style={button}>Настроить →</Link></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginTop:14}}>{shown.map((e:any)=><Link key={e.id} href={"/app/builder/"+e.id} style={{...card,textDecoration:"none",color:"inherit"}}><strong style={{fontSize:18}}>{e.name}</strong><div style={{marginTop:5,color:"#7f8ca1",fontSize:12}}>{e.key}</div>{e.description&&<p style={{color:"#9ea8ba",lineHeight:1.5}}>{e.description}</p>}<div style={{display:"flex",justifyContent:"space-between",marginTop:14}}><span style={{color:"#7dd3c7",fontWeight:700}}>{e.count} {plural(e.count)}</span><span style={{color:"#7dd3c7"}}>Открыть →</span></div></Link>)}{shown.length===0&&<div style={{...card,borderStyle:"dashed"}}>Объектов пока нет. <Link href="/app/builder">Создать первый объект →</Link></div>}</div>
  </section>
 </div></main>
}
function plural(n:number){return n%10===1&&n%100!==11?"запись":n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?"записи":"записей"}
const shell={minHeight:"calc(100vh - 57px)",background:"#090c12",color:"#f7f8fa",fontFamily:"system-ui"};const card={padding:22,border:"1px solid #293244",borderRadius:18,background:"#101621",boxSizing:"border-box" as const};const back={color:"#9ea8ba",textDecoration:"none"};const eyebrow={marginTop:12,fontSize:12,color:"#7dd3c7",letterSpacing:".12em"};const actionCard={padding:18,border:"1px solid #303b4d",borderRadius:15,background:"#0d141e"};const metric={minWidth:180,padding:18,border:"1px solid #2d3c4b",borderRadius:15,background:"#0b131c",alignSelf:"center"};const metricNumber={fontSize:36,fontWeight:800};const metricLabel={color:"#8f9bad",fontSize:12};const button={padding:"9px 13px",borderRadius:10,border:"1px solid #35515d",background:"#10282d",color:"#d8fff7",textDecoration:"none",fontSize:13};