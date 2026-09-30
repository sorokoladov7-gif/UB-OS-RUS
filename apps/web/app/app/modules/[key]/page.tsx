// @ts-nocheck
import {notFound,redirect} from "next/navigation";
import Link from "next/link";
import {getWorkspaceContext} from "@/lib/workspace";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {RecordPanel} from "../../builder/record-panel";
import {ModuleDashboard} from "../module-dashboard";

const catalog:Record<string,{title:string;description:string}> = {
 crm:{title:"Клиенты и CRM",description:"Клиенты, контакты и история взаимодействий."},
 sales:{title:"Продажи",description:"Заказы, сделки и продажи."},
 services:{title:"Услуги и записи",description:"Записи клиентов и выполнение услуг."},
 products:{title:"Товары и каталог",description:"Товары, услуги, цены и остатки."},
 inventory:{title:"Склад и запасы",description:"Остатки и складские операции."},
 finance:{title:"Финансы",description:"Доходы, расходы и финансовые операции."},
 employees:{title:"Сотрудники",description:"Сотрудники и рабочая информация."},
 documents:{title:"Документы",description:"Рабочие документы и их контроль."},
 projects:{title:"Проекты и задачи",description:"Проекты, задачи и сроки."},
 support:{title:"Поддержка",description:"Обращения клиентов и работа с ними."},
 reports:{title:"Отчёты и аналитика",description:"Показатели и данные для аналитики."}
};

export default async function ModulePage({params}:{params:Promise<{key:string}>}){
 const {key}=await params;
 const meta=catalog[key];
 if(!meta)notFound();
 const context=await getWorkspaceContext();
 if(!context?.membership||!context.activeWorkspace)redirect("/onboarding");
 const s=await createSupabaseServerClient();
 const {data:installed}=await s.from("workspace_modules").select("enabled,module_definitions(key,name,description)").eq("workspace_id",context.activeWorkspace.id);
 const active=(installed||[]).some((x:any)=>x.enabled&&((Array.isArray(x.module_definitions)?x.module_definitions[0]:x.module_definitions)?.key===key));
 if(!active)redirect("/app/setup");
 const {data:entity}=await s.from("entity_definitions").select("id,key,name,description").eq("workspace_id",context.activeWorkspace.id).eq("key","module_"+key).maybeSingle();
 if(!entity) return <main style={shell}><div style={card}><Link href="/app">← В систему</Link><h1>{meta.title}</h1><p>Модуль включён, но рабочая сущность ещё не создана.</p><Link href="/app/setup">Открыть настройку модуля →</Link></div></main>;
 const [{data:fields},{data:statuses},{data:records}]=await Promise.all([
  s.from("entity_fields").select("id,key,name,field_type,required,position,config").eq("entity_id",entity.id).order("position"),
  s.from("statuses").select("id,key,name,position,is_default,is_terminal,config").eq("entity_id",entity.id).order("position"),
  s.from("records").select("id,workspace_id,entity_id,status_id,data,created_at,updated_at").eq("workspace_id",context.activeWorkspace.id).eq("entity_id",entity.id).order("created_at",{ascending:false})
 ]);
 return <main style={shell}><div style={{maxWidth:1180,margin:"0 auto",padding:"24px 16px 60px"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}><div><Link href="/app" style={back}>← В систему</Link><div style={eyebrow}>UB OS-RUS · РАБОЧИЙ МОДУЛЬ</div><h1 style={{fontSize:"clamp(28px,5vw,44px)",margin:"7px 0"}}>{meta.title}</h1><p style={muted}>{meta.description} Бизнес: {context.activeWorkspace.name}.</p></div><Link href="/app/builder" style={builder}>⚙ Настроить структуру</Link></div>
  <ModuleDashboard moduleKey={key} fields={fields??[]} statuses={statuses??[]} records={records??[]}/>
  <RecordPanel workspaceId={context.activeWorkspace.id} entityId={entity.id} fields={fields??[]} statuses={statuses??[]} initialRecords={records??[]}/>
 </div></main>;
}
const shell={minHeight:"calc(100vh - 57px)",background:"#080c13",color:"#eef2ff",fontFamily:"system-ui"};
const card={padding:24,border:"1px solid #293244",borderRadius:18,background:"#101621"};
const back={color:"#9eabc0",textDecoration:"none",fontSize:13};
const eyebrow={marginTop:16,fontSize:12,color:"#7dd3c7",letterSpacing:".12em"};
const muted={color:"#8f9bad",lineHeight:1.5};
const builder={padding:"10px 13px",border:"1px solid #35515d",borderRadius:10,background:"#10282d",color:"#d8fff7",textDecoration:"none",fontSize:13};