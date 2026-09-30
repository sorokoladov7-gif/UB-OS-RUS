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
 return <main style={shell}><div style={{maxWidth:1180,margin:"0 auto",padding:"28px 16px 60px"}}><Link href="/app" style={back}>← Рабочий центр</Link><section style={{...card,marginTop:14}}><div style={{fontSize:42}}>{meta.icon}</div><div style={eyebrow}>РАБОЧИЙ МОДУЛЬ</div><h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"7px 0"}}>{meta.name}</h1><p style={{color:"#9ea8ba",maxWidth:700,lineHeight:1.6}}>{meta.description}</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,marginTop:24}}>{meta.actions.map((a,i)=><div key={a} style={actionCard}><strong>{a}</strong><div style={{marginTop:7,color:"#7f8ca1",fontSize:13}}>{i===0?"Открыть рабочий список":i===1?"Управление и обработка":"Аналитика и контроль"}</div><span style={{display:"block",marginTop:13,color:"#7dd3c7",fontSize:13}}>Перейти →</span></div>)}</div></section><section style={{marginTop:20}}><h2>Данные рабочего пространства</h2><p style={{color:"#8f9bad"}}>Объекты, которые уже созданы в вашем бизнесе.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>{(entities??[]).map((e:any)=><Link key={e.id} href={"/app/entities/"+e.id} style={{...card,textDecoration:"none",color:"inherit"}}><strong>{e.name}</strong><div style={{marginTop:5,color:"#7f8ca1",fontSize:12}}>{e.key}</div><div style={{marginTop:10,color:"#7dd3c7",fontSize:13}}>Открыть данные →</div></Link>)}{(!entities||entities.length===0)&&<div style={{...card,borderStyle:"dashed"}}>Объектов пока нет. <Link href="/app/builder">Создать в конструкторе →</Link></div>}</div></section></div></main>
}
const shell={minHeight:"calc(100vh - 57px)",background:"#090c12",color:"#f7f8fa",fontFamily:"system-ui"};const card={padding:22,border:"1px solid #293244",borderRadius:18,background:"#101621",boxSizing:"border-box" as const};const back={color:"#9ea8ba",textDecoration:"none"};const eyebrow={marginTop:12,fontSize:12,color:"#7dd3c7",letterSpacing:".12em"};const actionCard={padding:18,border:"1px solid #303b4d",borderRadius:15,background:"#0d141e"};