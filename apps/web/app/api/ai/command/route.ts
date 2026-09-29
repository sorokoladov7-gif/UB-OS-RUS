import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOwnAiModel, runAiModel } from "@/lib/ai/model-runtime";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return NextResponse.json({error:"Не авторизован"},{status:401});
  const body=await request.json().catch(()=>null);
  if(!body?.modelId || !body?.message) return NextResponse.json({error:"modelId и message обязательны"},{status:400});

  const model=await getOwnAiModel(String(body.modelId),uid);
  if(!model) return NextResponse.json({error:"AI_MODEL_NOT_FOUND"},{status:404});

  const started=Date.now();
  try {
    const result=await runAiModel(model,String(body.message),body.system?String(body.system):undefined);
    await supabase.from("ai_runs").insert({
      workspace_id: body.workspaceId || (body.context?.workspaceId || null),
      provider:result.provider, model:result.model, status:"completed",
      input:{message:String(body.message)}, output:{text:result.text},
      started_at:new Date(started).toISOString(), finished_at:new Date().toISOString(),
    });
    return NextResponse.json({ok:true,...result});
  } catch(error) {
    const message=error instanceof Error?error.message:"AI_PROVIDER_ERROR";
    return NextResponse.json({ok:false,error:message},{status:502});
  }
}
