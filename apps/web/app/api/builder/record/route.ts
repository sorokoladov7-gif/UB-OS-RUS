import {NextResponse} from "next/server"; import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function GET(req:Request){
 const supabase=await createSupabaseServerClient();
 const {data:claims}=await supabase.auth.getClaims();
 if(!claims?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const url=new URL(req.url); const workspaceId=url.searchParams.get("workspaceId"); const entityId=url.searchParams.get("entityId");
 if(!workspaceId||!entityId)return NextResponse.json({error:"Не указаны рабочее пространство и сущность"},{status:400});
 const {data,error}=await supabase.from("records").select("id,workspace_id,entity_id,status_id,data,created_at,updated_at").eq("workspace_id",workspaceId).eq("entity_id",entityId).order("created_at",{ascending:false});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json(data??[]);
}

export async function POST(req:Request){
 const supabase=await createSupabaseServerClient(); const {data:claims}=await supabase.auth.getClaims();
 if(!claims?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const b=await req.json();
 const {data,error}=await supabase.rpc("create_business_record",{p_workspace_id:b.workspaceId,p_entity_id:b.entityId,p_data:b.data??{},p_status_id:b.statusId??null});
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
}

export async function PATCH(req:Request){
 const supabase=await createSupabaseServerClient(); const {data:claims}=await supabase.auth.getClaims();
 if(!claims?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const b=await req.json(); if(!b.recordId)return NextResponse.json({error:"Не указана запись"},{status:400});
 const {data,error}=await supabase.rpc("update_business_record",{p_record_id:b.recordId,p_data:b.data??{},p_status_id:b.statusId??null});
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
}

export async function DELETE(req:Request){
 const supabase=await createSupabaseServerClient(); const {data:claims}=await supabase.auth.getClaims();
 if(!claims?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const url=new URL(req.url); const id=url.searchParams.get("id"); const workspaceId=url.searchParams.get("workspaceId");
 if(!id||!workspaceId)return NextResponse.json({error:"Не указана запись"},{status:400});
 const {error}=await supabase.from("records").delete().eq("id",id).eq("workspace_id",workspaceId);
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({ok:true});
}