-- Platform AI runtime access for authenticated application requests.
-- API keys are decrypted only inside the server-side runtime function.
-- The public wrapper is callable only with the server's privileged role.

create or replace function app_private.platform_ai_runtime_models()
returns table(
  id uuid,
  name text,
  provider text,
  model text,
  base_url text,
  config jsonb,
  capabilities jsonb,
  role text,
  priority integer,
  enabled boolean,
  is_default boolean,
  api_key text
)
language sql
security definer
set search_path = ''
stable
as $function$
  select
    m.id,
    m.name,
    m.provider,
    m.model,
    m.base_url,
    m.config,
    m.capabilities,
    m.role,
    m.priority,
    m.enabled,
    m.is_default,
    case
      when m.api_key_ciphertext is null then null
      else extensions.pgp_sym_decrypt(
        m.api_key_ciphertext,
        app_private.ai_model_key()
      )
    end
  from app_private.platform_ai_models m
  where m.enabled = true
  order by m.is_default desc, m.priority asc, m.created_at desc
$function$;

create or replace function public.platform_ai_runtime_models()
returns table(
  id uuid,
  name text,
  provider text,
  model text,
  base_url text,
  config jsonb,
  capabilities jsonb,
  role text,
  priority integer,
  enabled boolean,
  is_default boolean,
  api_key text
)
language sql
security invoker
set search_path = ''
stable
as $function$
  select * from app_private.platform_ai_runtime_models()
$function$;

revoke all on function public.platform_ai_runtime_models() from public;
revoke all on function public.platform_ai_runtime_models() from anon;
revoke all on function public.platform_ai_runtime_models() from authenticated;
grant execute on function public.platform_ai_runtime_models() to service_role;
