import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

function freeOpenRouter(model:string){const v=String(model||"").trim();return v==="openrouter/free"||/:free$/i.test(v);}
function validate(provider:string,model:string){
 const p=String(provider||"").trim().toLowerCase(),m=String(model||"").trim();
 if(!m)return "Укажите Model ID.";
 if(/^(any|undefined|null|none|default|auto|\[object object\])$/i.test(m))return "Неверный Model ID. Выберите реальную модель из каталога.";
 if(/\s/.test(m))return "Model ID не должен содержать пробелы.";
 if(p==="openrouter"&&!freeOpenRouter(m))return "Для OpenRouter в UB OS-RUS разрешены только бесплатные модели с суффиксом :free или openrouter/free.";
 return "";
}
async function auth(){const s=await createSupabaseServerClient();const {data:c}=await s.auth.getClaims();return {s,uid:c?.claims?.sub};}
function payload(b:any){
 return {
  p_id:b.id,
  p_name:b.name,
  p_provider:b.provider,
  p_model:b.model,
  p_base_url:b.baseUrl||null,
  p_api_key:b.apiKey||null,
  p_config:b.config||{},
  p_capabilities:Array.isArray(b.capabilities)?b.capabilities:["text"],
  p_role:b.role||"general",
  p_priority:Number.isFinite(Number(b.priority))?Number(b.priority):100,
  p_enabled:b.enabled!==false,
  p_is_default:Boolean(b.isDefault),
 };
}
export async function GET(){const {s,uid}=await auth();if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});const {data,error}=await s.rpc("admin_list_ai_models");if(error)return NextResponse.json({error:error.message},{status:403});return NextResponse.json({items:data||[]});}
export async function POST(req:Request){const {s,uid}=await auth();if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});const b=await req.json().catch(()=>({}));const validation=validate(b.provider,b.model);if(validation)return NextResponse.json({error:validation},{status:422});const {data,error}=await s.rpc("admin_create_ai_model",payload(b));if(error)return NextResponse.json({error:error.message},{status:403});return NextResponse.json(data);}
export async function PUT(req:Request){return update(req);}
export async function PATCH(req:Request){return update(req);}
async function update(req:Request){const {s,uid}=await auth();if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});const b=await req.json().catch(()=>({}));if(!b.id)return NextResponse.json({error:"id обязателен"},{status:400});const validation=validate(b.provider,b.model);if(validation)return NextResponse.json({error:validation},{status:422});const {data,error}=await s.rpc("admin_update_ai_model",payload(b));if(error)return NextResponse.json({error:error.message},{status:403});return NextResponse.json(data);}
export async function DELETE(req:Request){const {s,uid}=await auth();if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});const id=new URL(req.url).searchParams.get("id");if(!id)return NextResponse.json({error:"id обязателен"},{status:400});const {data,error}=await s.rpc("admin_delete_ai_model",{p_id:id});if(error)return NextResponse.json({error:error.message},{status:403});return NextResponse.json({deleted:Boolean(data)});}
