import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function auth(){
  const s=await createSupabaseServerClient();
  const {data:c}=await s.auth.getClaims();
  return {s,uid:c?.claims?.sub};
}
function payload(b:any){
  return {
    p_name:String(b.name||""),
    p_provider:String(b.provider||""),
    p_model:String(b.model||""),
    p_base_url:b.baseUrl?String(b.baseUrl):null,
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
  const {s,uid}=await auth(); if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const {data,error}=await s.rpc("admin_list_ai_models");
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({items:data||[]});
}
export async function POST(req:Request){
  const {s,uid}=await auth(); if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const b=await req.json().catch(()=>({}));
  const {data,error}=await s.rpc("admin_create_ai_model",payload(b));
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}
export async function PUT(req:Request){
  const {s,uid}=await auth(); if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const b=await req.json().catch(()=>({}));
  if(!b.id)return NextResponse.json({error:"id обязателен"},{status:400});
  const {data,error}=await s.rpc("admin_update_ai_model",{p_id:b.id,...payload(b)});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data);
}
export async function DELETE(req:Request){
  const {s,uid}=await auth(); if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const id=new URL(req.url).searchParams.get("id"); if(!id)return NextResponse.json({error:"id обязателен"},{status:400});
  const {data,error}=await s.rpc("admin_delete_ai_model",{p_id:id});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({deleted:Boolean(data)});
}