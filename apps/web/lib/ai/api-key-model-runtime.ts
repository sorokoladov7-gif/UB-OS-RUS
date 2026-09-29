// @ts-nocheck
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AiModelRuntime } from "./model-runtime";

export async function getAiModelForApiKey(modelId:string, rawKey:string):Promise<AiModelRuntime|null>{
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.rpc("get_ai_model_runtime_for_api_key",{p_raw_key:rawKey,p_model_id:modelId});
  if(error||!data?.[0]) return null;
  return data[0] as AiModelRuntime;
}
