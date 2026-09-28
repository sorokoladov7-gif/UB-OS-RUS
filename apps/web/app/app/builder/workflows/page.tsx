import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {getWorkspaceContext} from "@/lib/workspace";
export default async function WorkflowsPage(){
 const context=await getWorkspaceContext();
 if(!context || !context.activeWorkspace || !context.membership) redirect("/onboarding");
 const supabase=await createSupabaseServerClient();
 const {data:workflows}=await supabase.from("workflow_definitions").select("id,key,name,description,trigger_type,enabled,created_at").eq("workspace_id",context.activeWorkspace.id).order("created_at",{ascending:false});
 return <main style={{padding:24,maxWidth:1100,margin:"0 auto"}}><h1>Workflow Engine</h1><p style={{color:"#8f9ab0"}}>Универсальные бизнес-процессы: триггеры → условия → действия → журнал запусков.</p><div style={{display:"grid",gap:12}}>{(workflows??[]).map((w:any)=><article key={w.id} style={{border:"1px solid #303747",borderRadius:16,padding:18}}><strong>{w.name}</strong><div style={{color:"#8f9ab0"}}>{w.key} · {w.trigger_type} · {w.enabled?"включён":"выключен"}</div><p>{w.description??"Без описания"}</p></article>)}</div>{!(workflows?.length)&&<div style={{padding:20,border:"1px dashed #4a5568",borderRadius:16}}>Пока нет процессов. Следующим интерфейсом добавим визуальный конструктор триггеров, условий и действий.</div>}</main>
}