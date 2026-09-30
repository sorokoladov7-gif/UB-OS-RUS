import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function auth(){
  const s=await createSupabaseServerClient();
  const {data:c}=await s.auth.getClaims();
  return {s,uid:c?.claims?.sub};
}

function baseUrl(value:string|undefined,provider:string){
  if(value)return value.replace(/\/$/,"");
  if(provider==="openrouter")return "https://openrouter.ai/api/v1";
  if(provider==="groq")return "https://api.groq.com/openai/v1";
  if(provider==="openai")return "https://api.openai.com/v1";
  if(provider==="anthropic")return "https://api.anthropic.com/v1";
  return "";
}

function invalid(value:any){
  const model=String(value??"").trim();
  return !model||/^(any|undefined|null|none|default|auto|\[object object\])$/i.test(model);
}

export async function POST(req:Request){
  const {s,uid}=await auth();
  if(!uid)return NextResponse.json({error:"Не авторизован"},{status:401});
  const b=await req.json().catch(()=>({}));
  const provider=String(b.provider||"").trim().toLowerCase();
  let apiKey=String(b.apiKey||"").trim();
  let base=String(b.baseUrl||"").trim();

  if(!apiKey&&b.id){
    const {data}=await s.rpc("admin_get_ai_model_runtime",{p_id:b.id});
    if(data?.[0]){apiKey=String(data[0].api_key||"");base=base||String(data[0].base_url||"");}
  }
  if(!apiKey)return NextResponse.json({error:"Для получения списка моделей нужен API key."},{status:400});

  try{
    let response:Response;
    let json:any;
    if(provider==="gemini"||provider==="google"){
      response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=1000`,{cache:"no-store"});
      json=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(String(json?.error?.message||"Не удалось получить модели Gemini."));
      const items=(json.models||[])
        .filter((m:any)=>Array.isArray(m.supportedGenerationMethods)&&m.supportedGenerationMethods.includes("generateContent"))
        .map((m:any)=>({id:String(m.name||"").replace(/^models\//,""),name:m.displayName||m.name,description:m.description||""}))
        .filter((m:any)=>!invalid(m.id));
      return NextResponse.json({items});
    }

    if(provider==="ollama"&&!base)base="http://localhost:11434";
    const url=provider==="anthropic"?baseUrl(base,provider)+"/models":baseUrl(base,provider)+"/models";
    const headers:any={"content-type":"application/json",authorization:`Bearer ${apiKey}`};
    if(provider==="anthropic")headers["x-api-key"]=apiKey;
    response=await fetch(url,{headers,cache:"no-store"});
    json=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(String(json?.error?.message||json?.message||`Не удалось получить модели ${provider}.`));
    const raw=Array.isArray(json?.data)?json.data:Array.isArray(json?.models)?json.models:[];
    const items=raw.map((m:any)=>({id:String(m.id||m.name||"").trim(),name:m.name||m.id,description:m.description||""}))
      .filter((m:any)=>!invalid(m.id))
      .filter((m:any)=>provider!=="openrouter" || m.id==="openrouter/free" || /:free$/i.test(m.id));
    return NextResponse.json({items});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:"Не удалось получить список моделей."},{status:502});
  }
}
