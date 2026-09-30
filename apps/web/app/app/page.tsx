import Link from "next/link";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SbpBindButton from "./sbp-bind-button";

export default async function AppPage(){
 const context=await getWorkspaceContext();
 if(!context?.membership||!context.activeWorkspace)return <main style={shell}><div style={card}><h1>UB OS-RUS</h1><p>Нет активного рабочего пространства.</p><Link href="/onboarding">Настроить рабочее пространство →</Link></div></main>;
 const supabase=await createSupabaseServerClient();
 const workspace=context.activeWorkspace;
 const [{data:subscription},{data:entities},{data:modules}]=await Promise.all([
  supabase.from("subscriptions").select("status,trial_ends_at,current_period_end,external_payment_method_id,subscription_plans(name,price_monthly)").eq("organization_id",context.membership.organization_id).maybeSingle(),
  supabase.from("entity_definitions").select("id,key,name,description").eq("workspace_id",workspace.id).order("name"),
  supabase.from("workspace_modules").select("module_id,enabled,module_definitions(key,name,description)").eq("workspace_id",workspace.id).eq("enabled",true)
 ]);
 const plan=subscription?.subscription_plans;
 const planName=Array.isArray(plan)?plan[0]?.name:plan?.name;
 const trialDays=subscription?.trial_ends_at?Math.max(0,Math.ceil((new Date(subscription.trial_ends_at).getTime()-Date.now())/86400000)):null;
 const activeModules=(modules??[]).map((m:any)=>{const d=Array.isArray(m.module_definitions)?m.module_definitions[0]:m.module_definitions;return d?.name??d?.key}).filter(Boolean);
 return <main style={shell}><div style={{maxWidth:1100,margin:"0 auto",padding:"28px 16px 60px"}}>
  <section style={card}><div style={eyebrow}>UNIVERSAL BUSINESS OS</div><h1 style={{fontSize:"clamp(30px,6vw,44px)",margin:"8px 0"}}>{workspace.name}</h1><p style={muted}>Рабочий кабинет вашего бизнеса</p>
   <div style={quickGrid}><Quick href="/app/builder" title="Конструктор" text="Сущности, поля, статусы и данные"/><Quick href="/app/ai-models" title="🤖 AI" text="Модели и AI-инструменты"/><Quick href="/app/setup" title="Настройка" text="Модули и параметры"/></div>
  </section>
  <section style={{...card,marginTop:18}}><h2 style={{marginTop:0}}>Установленные модули</h2><p style={muted}>Активно: {activeModules.length}</p><div style={chips}>{activeModules.map((m:any)=><span key={String(m)} style={chip}>{String(m)}</span>)}</div>{activeModules.length===0&&<p style={muted}>Модули ещё не установлены. Откройте настройку системы.</p>}</section>
  <section style={{...card,marginTop:18}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 4px"}}>Объекты бизнеса</h2><p style={muted}>{entities?.length??0} объектов в рабочем пространстве</p></div><Link href="/app/builder" style={action}>+ Создать объект</Link></div><div style={entityGrid}>{(entities??[]).map((e:any)=><Link key={e.id} href={"/app/builder/"+e.id} style={{...entityCard,textDecoration:"none",color:"inherit"}}><strong>{e.name}</strong><div style={small}>{e.key}</div>{e.description&&<p style={muted}>{e.description}</p>}<div style={linkText}>Открыть →</div></Link>)}</div></section>
  {subscription&&<section id="subscription" style={{...card,marginTop:18}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 5px"}}>Подписка</h2><div style={muted}>{planName??"Тариф"} · {subscription.status==="trialing"?"Пробный период"+(trialDays!==null?" · "+trialDays+" дн.":""):subscription.status==="active"?"Подписка активна":"Статус: "+subscription.status}</div></div>{!subscription.external_payment_method_id&&<SbpBindButton/>}</div></section>}
 </div></main>
}
function Quick({href,title,text}:{href:string,title:string,text:string}){return <Link href={href} style={quickCard}><strong>{title}</strong><div style={small}>{text}</div></Link>}
const shell={minHeight:"calc(100vh - 57px)",background:"#090c12",color:"#f7f8fa",fontFamily:"system-ui"};const card={padding:20,border:"1px solid #293244",borderRadius:18,background:"#101621",boxSizing:"border-box" as const};const eyebrow={fontSize:12,color:"#7dd3c7",letterSpacing:".12em"};const muted={color:"#9ea8ba",fontSize:14,lineHeight:1.5};const small={color:"#7f8ca1",fontSize:12,marginTop:5};const quickGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginTop:20};const quickCard={padding:16,border:"1px solid #2c3b4d",borderRadius:14,background:"#0b131c",textDecoration:"none",color:"#fff"};const chips={display:"flex",gap:8,flexWrap:"wrap",marginTop:12};const chip={padding:"8px 12px",borderRadius:999,background:"#182333",color:"#d8e0ec"};const entityGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:14};const entityCard={padding:16,border:"1px solid #303747",borderRadius:14,background:"#0d141e"};const action={padding:"9px 12px",borderRadius:10,border:"1px solid #35515d",background:"#10282d",color:"#d8fff7",textDecoration:"none",fontSize:13};const linkText={marginTop:12,color:"#7dd3c7",fontSize:13};
