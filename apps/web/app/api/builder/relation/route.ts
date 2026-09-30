import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function auth(){
 const s=await createSupabaseServerClient();
 const {data:claims}=await s.auth.getClaims();
 return claims?.claims?.sub?s:null;
}
export async function GET(req:Request){
 const s=await auth(); if(!s)return NextResponse.json({error:"Не авторизован"},{status:401});
 const u=new URL(req.url),workspaceId=u.searchParams.get("workspaceId"),recordId=u.searchParams.get("recordId");
 if(!workspaceId||!recordId)return NextResponse.json({error:"Не указаны рабочее пространство и запись"},{status:400});
 const {data,error}=await s.from("record_relations").select("id,workspace_id,from_record_id,to_record_id,relation_type,metadata,created_at").eq("workspace_id",workspaceId).or(`from_record_id.eq.${recordId},to_record_id.eq.${recordId}`).order("created_at",{ascending:false});
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data??[]);
}
export async function POST(req:Request){
 const s=await auth(); if(!s)return NextResponse.json({error:"Не авторизован"},{status:401});
 const b=await req.json();
 if(!b.workspaceId||!b.fromRecordId||!b.toRecordId)return NextResponse.json({error:"Не указаны записи для связи"},{status:400});
 if(b.fromRecordId===b.toRecordId)return NextResponse.json({error:"Нельзя связать запись саму с собой"},{status:400});
 const {data,error}=await s.from("record_relations").insert({workspace_id:b.workspaceId,from_record_id:b.fromRecordId,to_record_id:b.toRecordId,relation_type:b.relationType??"related",metadata:b.metadata??{}}).select("id,workspace_id,from_record_id,to_record_id,relation_type,metadata,created_at").single();
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
}
export async function DELETE(req:Request){
 const s=await auth(); if(!s)return NextResponse.json({error:"Не авторизован"},{status:401});
 const u=new URL(req.url),id=u.searchParams.get("id"),workspaceId=u.searchParams.get("workspaceId");
 if(!id||!workspaceId)return NextResponse.json({error:"Не указана связь"},{status:400});
 const {error}=await s.from("record_relations").delete().eq("id",id).eq("workspace_id",workspaceId);
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true});
}