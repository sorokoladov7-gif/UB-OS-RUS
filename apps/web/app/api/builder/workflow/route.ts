import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function POST(req:Request){
 const supabase=await createSupabaseServerClient();
 const {data:claims}=await supabase.auth.getClaims();
 if(!claims?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const b=await req.json();
 if(b.action==="create"){
  const {data,error}=await supabase.rpc("create_workflow_definition",{p_workspace_id:b.workspaceId,p_entity_id:b.entityId??null,p_key:b.key,p_name:b.name,p_description:b.description??null,p_trigger_type:b.triggerType??"record_created",p_config:b.config??{},p_conditions:b.conditions??[],p_actions:b.actions??[]});
  if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
 }
 if(b.action==="run"){
  const {data,error}=await supabase.rpc("run_workflow",{p_workflow_id:b.workflowId,p_record_id:b.recordId??null,p_trigger_payload:b.triggerPayload??{}});
  if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
 }
 return NextResponse.json({error:"Неизвестная операция"},{status:400});
}