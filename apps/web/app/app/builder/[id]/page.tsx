import {notFound,redirect} from "next/navigation";
import {getWorkspaceContext} from "@/lib/workspace";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {BuilderShell} from "../builder-shell";
import {EntityEditor} from "../entity-editor";
import {RecordPanel} from "../record-panel";

export default async function Page({params}:{params:Promise<{id:string}>}){
 const context=await getWorkspaceContext();
 if(!context?.membership||!context.activeWorkspace)redirect("/onboarding");
 const {id}=await params;
 const supabase=await createSupabaseServerClient();
 const {data:entity}=await supabase.from("entity_definitions").select("id,key,name,description,config").eq("id",id).eq("workspace_id",context.activeWorkspace.id).maybeSingle();
 if(!entity)notFound();
 const [{data:fields},{data:statuses},{data:entities},{data:records},{data:relations}]=await Promise.all([
  supabase.from("entity_fields").select("id,key,name,field_type,required,position,config").eq("entity_id",id).order("position"),
  supabase.from("statuses").select("id,key,name,position,is_default,is_terminal,config").eq("entity_id",id).order("position"),
  supabase.from("entity_definitions").select("id,key,name,description").eq("workspace_id",context.activeWorkspace.id).order("name"),
  supabase.from("records").select("id,workspace_id,entity_id,status_id,data,created_at,updated_at").eq("workspace_id",context.activeWorkspace.id).eq("entity_id",id).order("created_at",{ascending:false}),
  supabase.from("relation_definitions").select("id,key,name,relation_type,from_entity_id,to_entity_id,config").eq("workspace_id",context.activeWorkspace.id).or(`from_entity_id.eq.${id},to_entity_id.eq.${id}`).order("name")
 ]);
 return <BuilderShell>
  <EntityEditor entity={entity} fields={fields??[]} statuses={statuses??[]} entities={entities??[]} workspaceId={context.activeWorkspace.id}/>
  <RecordPanel workspaceId={context.activeWorkspace.id} entityId={id} fields={fields??[]} statuses={statuses??[]} initialRecords={records??[]} relations={relations??[]} entities={entities??[]}/>
 </BuilderShell>
}