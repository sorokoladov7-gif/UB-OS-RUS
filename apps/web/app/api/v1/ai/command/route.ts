import { NextResponse } from "next/server";
import { authenticateApiRequest, hasApiScope } from "@/lib/api-gateway";
import { getOwnAiModel, runAiModel } from "@/lib/ai/model-runtime";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const principal=await authenticateApiRequest(request);
  if(!principal) return NextResponse.json({error:"INVALID_API_KEY"},{status:401});
  if(!hasApiScope(principal,"ai.invoke")) return NextResponse.json({error:"INSUFFICIENT_SCOPE",required:"ai.invoke"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.modelId||!body?.message) return NextResponse.json({error:"modelId и message обязательны"},{status:400});
  const model=await getOwnAiModel(String(body.modelId),principal.createdBy);
  if(!model) return NextResponse.json({error:"AI_MODEL_NOT_FOUND"},{status:404});
  try {
    const result=await runAiModel(model,String(body.message),body.system?String(body.system):undefined);
    const supabase=await createSupabaseServerClient();
    if(body.workspaceId) await supabase.from("ai_runs").insert({workspace_id:body.workspaceId,provider:result.provider,model:result.model,status:"completed",input:{message:String(body.message),api_key_id:principal.apiKeyId},output:{text:result.text},started_at:new Date().toISOString(),finished_at:new Date().toISOString()});
    return NextResponse.json({ok:true,...result});
  } catch(error) { return NextResponse.json({ok:false,error:error instanceof Error?error.message:"AI_PROVIDER_ERROR"},{status:502}); }
}