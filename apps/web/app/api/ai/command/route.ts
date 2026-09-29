// @ts-nocheck
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOwnAiModel, getDefaultAiModel, runAiModelWithFallback } from "@/lib/ai/model-runtime";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return NextResponse.json({error:"Не авторизован"},{status:401});
  const body=await request.json().catch(()=>null);
  if(!body?.message) return NextResponse.json({error:"message обязателен"},{status:400});

  const explicitModel=Boolean(body?.modelId);
  const model=explicitModel ? await getOwnAiModel(String(body.modelId)) : await getDefaultAiModel();
  if(!model) return NextResponse.json({error:"AI_MODEL_NOT_FOUND"},{status:404});

  const started=Date.now();
  try {
    const result=await runAiModelWithFallback(model,String(body.message),body.system?String(body.system):undefined);
    const workspaceId=body.workspaceId || body.context?.workspaceId;
    if(workspaceId) await supabase.from("ai_runs").insert({
      workspace_id:workspaceId, provider:result.provider, model:result.model, status:"completed",
      input:{message:String(body.message)}, output:{text:result.text},
      started_at:new Date(started).toISOString(), finished_at:new Date().toISOString(),
    });
    return NextResponse.json({ok:true,...result,requestedExplicitModel:explicitModel});
  } catch(error) {
    const message=error instanceof Error?error.message:"AI_PROVIDER_ERROR";
    return NextResponse.json({ok:false,error:message},{status:502});
  }
}
