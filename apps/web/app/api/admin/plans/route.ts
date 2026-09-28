import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

export async function POST(req:Request){
  const supabase=await createSupabaseServerClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims?.sub)return NextResponse.json({error:"Не авторизован"},{status:401});
  const b=await req.json();
  if(!b.planId||!b.name)return NextResponse.json({error:"Некорректные данные тарифа"},{status:400});
  const {data:existing,error:readError}=await supabase.from("subscription_plans").select("description,features").eq("id",b.planId).maybeSingle();
  if(readError||!existing)return NextResponse.json({error:readError?.message||"Тариф не найден"},{status:404});
  const {data,error}=await supabase.rpc("admin_update_plan",{
    p_plan_id:b.planId,p_name:b.name,p_description:existing.description??"",p_price_monthly:Number(b.priceMonthly??0),
    p_trial_days:Number(b.trialDays??0),p_features:existing.features??{},p_enabled:!!b.enabled,p_position:Number(b.position??0)
  });
  if(error)return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json(data??{ok:true});
}
