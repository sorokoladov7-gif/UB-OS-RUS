import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function authUser(){
  const s=await createSupabaseServerClient();
  const {data:c}=await s.auth.getClaims();
  const uid=c?.claims?.sub as string|undefined;
  return uid?{s,uid}:null;
}

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const u=await authUser();
  if(!u)return NextResponse.json({error:"Не авторизован"},{status:401});
  const {id}=await params;
  const {data:conversation,error:ce}=await u.s.from("ai_conversations")
    .select("id,title,created_at,updated_at,workspace_id")
    .eq("id",id).eq("user_id",u.uid).maybeSingle();
  if(ce)return NextResponse.json({error:ce.message},{status:400});
  if(!conversation)return NextResponse.json({error:"Чат не найден"},{status:404});
  const {data:messages,error}=await u.s.from("ai_messages")
    .select("id,role,content,created_at")
    .eq("conversation_id",id).order("created_at",{ascending:true});
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({conversation,messages:messages??[]});
}

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const u=await authUser();
  if(!u)return NextResponse.json({error:"Не авторизован"},{status:401});
  const {id}=await params;
  const b=await req.json().catch(()=>({}));
  const title=String(b.title||"").trim().slice(0,80);
  if(!title)return NextResponse.json({error:"Название чата пустое"},{status:400});
  const {data,error}=await u.s.from("ai_conversations")
    .update({title,updated_at:new Date().toISOString()})
    .eq("id",id).eq("user_id",u.uid)
    .select("id,title,created_at,updated_at").maybeSingle();
  if(error)return NextResponse.json({error:error.message},{status:400});
  if(!data)return NextResponse.json({error:"Чат не найден"},{status:404});
  return NextResponse.json(data);
}

export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){
  const u=await authUser();
  if(!u)return NextResponse.json({error:"Не авторизован"},{status:401});
  const {id}=await params;
  const {error}=await u.s.from("ai_conversations").delete().eq("id",id).eq("user_id",u.uid);
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true});
}