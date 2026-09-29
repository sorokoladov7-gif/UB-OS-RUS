import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

async function auth(){
  const s=await createSupabaseServerClient();
  const {data:c}=await s.auth.getClaims();
  return {s,uid:c?.claims?.sub};
}

function normalize(provider:string,value:any){
  const p=String(provider||"").trim().toLowerCase();
  let model=String(value??"").trim();
  if(p==="gemini"||p==="google") model=model.replace(/^models\//,"");
  return {provider:p,model};
}

function validate(provider:string,value:any){
  const {model}=normalize(provider,value);
  if(!model)return "Model ID обязателен.";
  if(/^(any|undefined|null|none|default|auto|\[object object\])$/i.test(model)){
    return `Неверный Model ID: ${model}. Выберите реальную модель.`;
  }
  if(/[\r\n\s]/.test(model))return "Model ID не должен содержать пробелы.";
  if(provider==="openrouter"&&!/^[^/\s]+\/[^/\s]+$/.test(model)){
    return "Для OpenRouter Model ID должен иметь формат provider/model.";
  }
  return null;
}

function baseUrl(v:string|null|undefined,p:string){
  if(v)return v.replace(/\/$/,"");
  if(p==="openrouter")return "https://openrouter.ai/api/v1";
  if(p==="groq")return "https://api.groq.com/openai/v1";
  if(p==="openai")return "https://api.openai.com/v1";
  return "";
}

export async function POST(req:Request){
 const {s,uid}=await auth();
 if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
 const b=await req.json().catch(()=>({}));
 if(!b.id)return NextResponse.json({error:"id обязателен"},{status:400});
 const {data,error}=await s.rpc("admin_get_ai_model_runtime",{p_id:b.id});
 if(error||!data?.[0])return NextResponse.json({error:error?.message||"AI_MODEL_NOT_FOUND"},{status:400});
 const m=data[0] as any;
 const provider=String(m.provider||"").trim().toLowerCase();
 const validation=validate(provider,m.model);
 if(validation){
   await s.rpc("admin_record_ai_model_test",{p_id:b.id,p_status:"error",p_message:validation});
   return NextResponse.json({ok:false,error:validation,code:"INVALID_MODEL_ID"},{status:400});
 }
 try{
   let text="";
   if(["gemini","google"].includes(provider)){
     if(!m.api_key)throw new Error("API_KEY_NOT_CONFIGURED");
     const {model}=normalize(provider,m.model);
     const u=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(m.api_key)}`;
     const rr=await fetch(u,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:"Reply with exactly: UB OS-RUS AI OK"}]}]}),cache:"no-store"});
     const j=await rr.json().catch(()=>({}));
     if(!rr.ok)throw new Error(String(j?.error?.message||"PROVIDER_ERROR"));
     text=j?.candidates?.[0]?.content?.parts?.map((x:any)=>x.text||"").join("")||"";
   }else{
     const base=baseUrl(m.base_url,provider);
     if(!base)throw new Error("BASE_URL_NOT_CONFIGURED");
     const h:any={"content-type":"application/json"};
     if(m.api_key)h.authorization=`Bearer ${m.api_key}`;
     const {model}=normalize(provider,m.model);
     const rr=await fetch(base+"/chat/completions",{method:"POST",headers:h,body:JSON.stringify({model,messages:[{role:"user",content:"Reply with exactly: UB OS-RUS AI OK"}],temperature:0}),cache:"no-store"});
     const j=await rr.json().catch(()=>({}));
     if(!rr.ok)throw new Error(String(j?.error?.message||j?.message||"PROVIDER_ERROR"));
     text=j?.choices?.[0]?.message?.content||"";
   }
   await s.rpc("admin_record_ai_model_test",{p_id:b.id,p_status:"ok",p_message:text.slice(0,500)||"Connection successful"});
   return NextResponse.json({ok:true,message:text||"Connection successful"});
 }catch(e){
   const msg=e instanceof Error?e.message:"PROVIDER_ERROR";
   await s.rpc("admin_record_ai_model_test",{p_id:b.id,p_status:"error",p_message:msg});
   return NextResponse.json({ok:false,error:msg},{status:502});
 }
}
