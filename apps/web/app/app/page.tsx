import Link from "next/link";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SbpBindButton from "./sbp-bind-button";

const MODULES:Record<string,{name:string;icon:string;description:string}>={
 crm:{name:"Клиенты и CRM",icon:"👥",description:"Клиенты, контакты, сделки и история взаимодействий"},
 documents:{name:"Документы",icon:"📄",description:"Документы, файлы и рабочие материалы"},
 employees:{name:"Сотрудники",icon:"👤",description:"Команда, роли и организация работы"},
 finance:{name:"Финансы",icon:"💰",description:"Финансовые операции и контроль показателей"},
 inventory:{name:"Склад",icon:"📦",description:"Остатки, склады и движения товаров"},
 products:{name:"Товары",icon:"🛍️",description:"Каталог, цены и характеристики"},
 projects:{name:"Проекты",icon:"📋",description:"Проекты, задачи и контроль этапов"},
 reports:{name:"Отчёты",icon:"📊",description:"Аналитика и отчёты бизнеса"},
 sales:{name:"Продажи",icon:"💳",description:"Заказы, предложения и воронка продаж"},
 services:{name:"Услуги",icon:"🛠️",description:"Услуги, записи и выполнение работ"},
 support:{name:"Поддержка",icon:"🎧",description:"Обращения клиентов и внутренние запросы"}
};

export default async function AppPage(){
 const context=await getWorkspaceContext();
 if(!context?.membership||!context.activeWorkspace)return <main style={shell}><div style={card}><h1>UB OS-RUS</h1><p>Нет активного рабочего пространства.</p><Link href="/onboarding">Настроить рабочее пространство →</Link></div></main>;
 const workspace=context.activeWorkspace,supabase=await createSupabaseServerClient();
 const [{data:modules},{data:entities},{data:subscription}]=await Promise.all([
  supabase.from("workspace_modules").select("module_id,enabled,installed_at,module_definitions(key,name,description)").eq("workspace_id",workspace.id).eq("enabled",true),
  supabase.from("entity_definitions").select("id,key,name,description").eq("workspace_id",workspace.id).order("name"),
  supabase.from("subscriptions").select("status,trial_ends_at,current_period_end,external_payment_method_id,subscription_plans(name,price_monthly)").eq("organization_id",context.membership.organization_id).maybeSingle()
 ]);
 const plan=Array.isArray(subscription?.subscription_plans)?subscription.subscription_plans[0]:subscription?.subscription_plans;
 const trialDays=subscription?.trial_ends_at?Math.max(0,Math.ceil((new Date(subscription.trial_ends_at).getTime()-Date.now())/86400000)):null;
 const activeModules=(modules??[]).map((row:any)=>{const d=Array.isArray(row.module_definitions)?row.module_definitions[0]:row.module_definitions;const key=d?.key??"";return {key,name:MODULES[key]?.name??d?.name??key,icon:MODULES[key]?.icon??"◈",description:MODULES[key]?.description??d?.description??"Рабочий модуль бизнеса"} }).filter((m:any)=>m.key);
 return <main style={shell}><div style={{maxWidth:1240,margin:"0 auto",padding:"28px 16px 60px"}}>
  <section style={{...card,background:"linear-gradient(135deg,#111827,#0d1720)",borderColor:"#26384a"}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
    <div><div style={eyebrow}>UNIVERSAL BUSINESS OS</div><h1 style={{fontSize:"clamp(30px,5vw,46px)",margin:"8px 0"}}>{workspace.name}</h1><p style={{margin:0,color:"#9ea8ba",fontSize:16}}>Рабочий центр вашего бизнеса</p></div>
    {subscription&&<div style={planBox}><div style={small}>ТАРИФ</div><strong>{plan?.name??"Тариф"}</strong><div style={{marginTop:5,fontSize:13,color:"#9ea8ba"}}>{subscription.status==="trialing"?"Пробный период · "+trialDays+" дн.":subscription.status==="active"?"Подписка активна":"Статус: "+subscription.status}</div></div>}
   </div>
   <div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:22}}><Quick href="/app/builder" title="Конструктор" text="Настроить систему"/><Quick href="/app/ai-models" title="🤖 AI" text="Модели и AI-инструменты"/><Quick href="/app/setup" title="Настройка" text="Модули и профиль"/></div>
  </section>
  <section style={{marginTop:22}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 5px"}}>Рабочие модули</h2><p style={{margin:0,color:"#8f9bad"}}>Активно: {activeModules.length}</p></div><Link href="/app/setup" style={action}>Настроить модули →</Link></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:13,marginTop:14}}>{activeModules.map((m:any)=><Link key={m.key} href={"/app/modules/"+encodeURIComponent(m.key)} style={{...card,textDecoration:"none",color:"inherit",transition:"transform .15s"}}><div style={{fontSize:28}}>{m.icon}</div><strong style={{display:"block",fontSize:19,marginTop:9}}>{m.name}</strong><p style={{margin:"7px 0 0",color:"#9ea8ba",lineHeight:1.45,fontSize:13}}>{m.description}</p><div style={{marginTop:15,color:"#7dd3c7",fontSize:13,fontWeight:700}}>Открыть модуль →</div></Link>))}</div>
   {activeModules.length===0&&<div style={{...card,marginTop:14,borderStyle:"dashed"}}><strong>Модули ещё не установлены</strong><p style={{color:"#9ea8ba"}}>Откройте настройку и запустите нужные модули.</p></div>}
  </section>
  <section style={{marginTop:26}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 5px"}}>Объекты бизнеса</h2><p style={{margin:0,color:"#8f9bad"}}>{entities?.length??0} настроено в текущем рабочем пространстве</p></div><Link href="/app/builder" style={action}>+ Создать объект</Link></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14,marginTop:14}}>{(entities??[]).map((entity:any)=><Link key={entity.id} href={"/app/entities/"+entity.id} style={{...card,textDecoration:"none",color:"inherit"}}><strong style={{fontSize:18}}>{entity.name}</strong><div style={{color:"#7f8ca1",marginTop:6}}>{entity.key}</div>{entity.description&&<p style={{color:"#9ea8ba",lineHeight:1.5}}>{entity.description}</p>}<div style={{marginTop:12,color:"#7dd3c7",fontSize:13}}>Открыть →</div></Link>)}</div>
  </section>
  {subscription&&<section id="subscription" style={{...card,marginTop:26}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 5px",fontSize:20}}>Подписка и доступ</h2><div style={{color:"#9ea8ba"}}>{subscription.status==="trialing"?"Пробный период":subscription.status==="active"?"Активная подписка":"Статус: "+subscription.status} · {plan?.name??"—"}</div></div>{!subscription.external_payment_method_id&&<SbpBindButton/>}</div></section>}
 </div></main>
}
function Quick({href,title,text}:{href:string,title:string,text:string}){return <Link href={href} style={{padding:"13px 15px",border:"1px solid #2a3a49",borderRadius:14,background:"#0b131c",textDecoration:"none",color:"#fff"}}><strong>{title}</strong><div style={{marginTop:4,fontSize:12,color:"#8f9bad"}}>{text}</div></Link>}
const shell={minHeight:"calc(100vh - 57px)",fontFamily:"system-ui",background:"#090c12"};const card={padding:20,border:"1px solid #293244",borderRadius:18,background:"#101621",boxSizing:"border-box" as const};const action={display:"inline-block",padding:"9px 12px",borderRadius:10,border:"1px solid #35515d",background:"#10282d",color:"#d8fff7",textDecoration:"none",fontSize:13};const eyebrow={fontSize:12,color:"#7dd3c7",letterSpacing:".12em"};const small={fontSize:12,color:"#8f9bad"};const planBox={minWidth:190,padding:14,border:"1px solid #2c3b4d",borderRadius:14,background:"#0a1119"};