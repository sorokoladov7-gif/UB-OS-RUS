import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function auth(){
  const s=await createSupabaseServerClient();
  const {data:c}=await s.auth.getClaims();
  return {s,uid:c?.claims?.sub};
}

function normalizeProvider(value:any){
  return String(value||"").trim().toLowerCase();
}

function normalizeModel(provider:string,value:any){
  let model=String(value??"").trim();
  if(provider==="gemini"||provider==="google") model=model.replace(/^models\//,"");
  return model;
}

function validateModelId(provider:string,value:any){
  const p=normalizeProvider(provider);
  const model=normalizeModel(p,value);
  if(!model) return "Model ID обязателен.";
  if(/^(any|undefined|null|none|default|auto|\[object object\])$/i.test(model)){
    return `Неверный Model ID: ${model}. Укажите реальный идентификатор модели.`;
  }
  if(/[\r\n]/.test(model)) return "Model ID не должен содержать переносы строк.";
  if(/\s/.test(model)) return "Model ID не должен содержать пробелы.";
  if(p==="openrouter" && !/^[^/\s]+\/[^/\s]+$/.test(model)){
    return "Для OpenRouter Model ID должен иметь формат provider/model, например google/gemini-2.5-flash.";
  }
  if(!["openrouter","gemini","google","groq","openai","anthropic","ollama","custom"].includes(p)){
    return "Неизвестный AI-провайдер.";
  }
  return null;
}

function payload(b:any){
  const provider=normalizeProvider(b.provider);
  return {
    p_name:String(b.name||"").trim(),
    p_provider:provider,
    p_model:normalizeModel(provider,b.model),
    p_base_url:b.baseUrl?String(b.baseUrl).trim():null,
    p_api_key:b.apiKey?String(b.apiKey):null,
    p_config:b.config&&typeof b.config==="object"?b.config:{},
    p_capabilities:Array.isArray(b.capabilities)?b.capabilities:[],
    p_role:String(b.role||"general"),
    p_priority:Number.isFinite(Number(b.priority))?Number(b.priority):100,
    p_enabled:b.enabled!==false,
    p_is_default:!!b.isDefault
  };
}

export async function GET(){
  const {s,uid}=await auth();
  if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const {data,error}=await s.rpc("admin_list_ai_models");
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({items:data||[]});
}

export async function POST(req:Request){
  const {s,uid}=await auth();
  if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const b=await req.json().catch(()=>({}));
  const provider=normalizeProvider(b.provider);
  const validation=validateModelId(provider,b.model);
  if(validation)return NextResponse.json({error:validation},{status:400});
  if(!String(b.name||"").trim())return NextResponse.json({error:"Название модели обязательно."},{status:400});
  const {data,error}=await s.rpc("admin_create_ai_model_v2",payload(b));
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}

export async function PUT(req:Request){
  const {s,uid}=await auth();
  if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const b=await req.json().catch(()=>({}));
  if(!b.id)return NextResponse.json({error:"id обязателен"},{status:400});
  const provider=normalizeProvider(b.provider);
  const validation=validateModelId(provider,b.model);
  if(validation)return NextResponse.json({error:validation},{status:400});
  if(!String(b.name||"").trim())return NextResponse.json({error:"Название модели обязательно."},{status:400});
  const {data,error}=await s.rpc("admin_update_ai_model",{p_id:b.id,...payload(b)});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}

export async function DELETE(req:Request){
  const {s,uid}=await auth();
  if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const id=new URL(req.url).searchParams.get("id");
  if(!id)return NextResponse.json({error:"id обязателен"},{status:400});
  const {data,error}=await s.rpc("admin_delete_ai_model",{p_id:id});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({deleted:Boolean(data)});
}
