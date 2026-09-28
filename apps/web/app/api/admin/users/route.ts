import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function GET(){
 const s=await createSupabaseServerClient(); const {data:c}=await s.auth.getClaims();
 if(!c?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const {data,error}=await s.from("memberships").select("id,user_id,organization_id,status,default_role_key,created_at,organization:organizations(name)").order("created_at",{ascending:false}).limit(200);
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({items:data||[]});
}
export async function POST(req:Request){
 const s=await createSupabaseServerClient(); const {data:c}=await s.auth.getClaims();
 if(!c?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
 const b=await req.json(); if(!b.membershipId)return NextResponse.json({error:"Не указан участник"},{status:400});
 const {data,error}=await s.rpc("admin_update_membership",{p_membership_id:b.membershipId,p_status:b.status,p_default_role_key:b.defaultRoleKey??""});
 if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json(data);
}