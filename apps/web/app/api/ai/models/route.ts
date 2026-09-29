import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.json({ error:"Не авторизован" },{status:401});
  const { data, error } = await supabase.rpc("list_ai_model_connections");
  if (error) return NextResponse.json({ error:error.message },{status:400});
  return NextResponse.json({ items:data||[] });
}

export async function POST(request: Request) {
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
