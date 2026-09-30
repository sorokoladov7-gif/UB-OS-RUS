// @ts-nocheck
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error:"Не авторизован" },{status:401});
  const [{ data, error }, { data:platformItems, error:platformError }] = await Promise.all([
    supabase.rpc("list_ai_model_connections"),
    supabase.rpc("list_platform_ai_models"),
  ]);
  if (error) return NextResponse.json({ error:error.message },{status:400});
  if (platformError) return NextResponse.json({ error:platformError.message },{status:400});
  return NextResponse.json({ items:data||[], platformItems:platformItems||[] });
}

function validateModel(provider:string,model:string){const p=String(provider||"").trim().toLowerCase(),m=String(model||"").trim();if(!m)return "Укажите Model ID.";if(/^(any|undefined|null|none|default|auto|\[object object\])$/i.test(m))return "Неверный Model ID.";if(/\s/.test(m))return "Model ID не должен содержать пробелы.";if(p==="openrouter"&&!((m==="openrouter/free")||/:free$/i.test(m)))return "Для OpenRouter доступны только бесплатные модели (:free или openrouter/free).";return "";}\n\nexport async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error:"Не авторизован" },{status:401});
  const body = await request.json().catch(()=>null);
  if (!body?.name || !body?.provider || !body?.model) {
    return NextResponse.json({ error:"name, provider и model обязательны" },{status:400});
  }
  const { data, error } = await supabase.rpc("create_ai_model_connection", {
    p_name:String(body.name),
    p_provider:String(body.provider),
    p_model:String(body.model),
    p_base_url:body.baseUrl ? String(body.baseUrl) : null,
    p_api_key:body.apiKey ? String(body.apiKey) : null,
    p_config:body.config && typeof body.config==="object" ? body.config : {},
  });
  if (error) return NextResponse.json({ error:error.message },{status:400});
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({error:"Не авторизован"},{status:401});
  const body=await request.json().catch(()=>null);
  if(!body?.id) return NextResponse.json({error:"id обязателен"},{status:400});
  if(body.action==="default"){
    const {data,error}=await supabase.rpc("set_default_ai_model",{p_id:String(body.id)});
    if(error) return NextResponse.json({error:error.message},{status:400});
    return NextResponse.json({ok:Boolean(data)});
  }
  const {data,error}=await supabase.rpc("update_ai_model_connection",{
    p_id:String(body.id),p_name:body.name??null,p_provider:body.provider??null,p_model:body.model??null,
    p_base_url:body.baseUrl??null,p_api_key:body.apiKey??null,p_config:body.config??null,p_enabled:body.enabled!==false
  });
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error:"Не авторизован" },{status:401});
  const id=new URL(request.url).searchParams.get("id");
  if(!id) return NextResponse.json({error:"id обязателен"},{status:400});
  const {data,error}=await supabase.rpc("delete_ai_model_connection",{p_id:id});
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({deleted:Boolean(data)});
}
