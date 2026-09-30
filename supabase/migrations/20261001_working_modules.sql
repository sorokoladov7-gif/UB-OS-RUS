-- Рабочие модули: при установке модуля создаётся базовая рабочая сущность.
-- Уже установленные модули были заполнены отдельной безопасной процедурой при внедрении.
-- Важно: public.install_workspace_module остаётся тонким wrapper над app_private.

create or replace function app_private.install_workspace_module(p_workspace_id uuid,p_module_key text)
returns jsonb
language plpgsql
security definer
set search_path to public, app_private
as $function$
declare
 v_uid uuid:=auth.uid(); v_mid uuid; v_org uuid; v_entity uuid; v_fields jsonb; v_name text; v_desc text;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select w.organization_id into v_org from public.workspaces w where w.id=p_workspace_id;
 if not exists(select 1 from public.memberships where organization_id=v_org and user_id=v_uid and status='active' and default_role_key in ('owner','admin')) then raise exception 'WORKSPACE_ADMIN_REQUIRED'; end if;
 select id into v_mid from public.module_definitions where key=p_module_key;
 if v_mid is null then raise exception 'MODULE_NOT_FOUND'; end if;
 insert into public.workspace_modules(workspace_id,module_id,enabled,config) values(p_workspace_id,v_mid,true,'{}') on conflict(workspace_id,module_id) do update set enabled=true;
 v_name:=case p_module_key when 'crm' then 'Клиенты' when 'sales' then 'Заказы и сделки' when 'services' then 'Записи на услуги' when 'products' then 'Товары' when 'inventory' then 'Остатки' when 'finance' then 'Финансовые операции' when 'employees' then 'Сотрудники' when 'documents' then 'Документы' when 'projects' then 'Проекты' when 'support' then 'Обращения' when 'reports' then 'Показатели' end;
 v_desc:='Рабочий модуль UB OS-RUS';
 v_fields:=case p_module_key
  when 'crm' then '[{"key":"name","name":"Имя / компания","field_type":"text","required":true,"position":0},{"key":"phone","name":"Телефон","field_type":"phone","position":1},{"key":"email","name":"Email","field_type":"email","position":2},{"key":"notes","name":"Заметки","field_type":"long_text","position":3}]'::jsonb
  when 'sales' then '[{"key":"name","name":"Название заказа / сделки","field_type":"text","required":true,"position":0},{"key":"amount","name":"Сумма","field_type":"currency","position":1},{"key":"customer","name":"Клиент","field_type":"text","position":2},{"key":"notes","name":"Комментарий","field_type":"long_text","position":3}]'::jsonb
  when 'services' then '[{"key":"name","name":"Клиент","field_type":"text","required":true,"position":0},{"key":"service","name":"Услуга","field_type":"text","position":1},{"key":"date","name":"Дата","field_type":"datetime","position":2},{"key":"phone","name":"Телефон","field_type":"phone","position":3}]'::jsonb
  when 'products' then '[{"key":"name","name":"Название товара","field_type":"text","required":true,"position":0},{"key":"sku","name":"Артикул","field_type":"text","position":1},{"key":"price","name":"Цена","field_type":"currency","position":2},{"key":"quantity","name":"Количество","field_type":"number","position":3}]'::jsonb
  when 'inventory' then '[{"key":"name","name":"Товар / позиция","field_type":"text","required":true,"position":0},{"key":"quantity","name":"Количество","field_type":"number","position":1},{"key":"warehouse","name":"Склад","field_type":"text","position":2},{"key":"notes","name":"Комментарий","field_type":"long_text","position":3}]'::jsonb
  when 'finance' then '[{"key":"name","name":"Операция","field_type":"text","required":true,"position":0},{"key":"amount","name":"Сумма","field_type":"currency","required":true,"position":1},{"key":"type","name":"Тип операции","field_type":"select","position":2,"config":{"options":["Доход","Расход"]}},{"key":"date","name":"Дата","field_type":"date","position":3}]'::jsonb
  when 'employees' then '[{"key":"name","name":"ФИО","field_type":"text","required":true,"position":0},{"key":"position","name":"Должность","field_type":"text","position":1},{"key":"phone","name":"Телефон","field_type":"phone","position":2},{"key":"email","name":"Email","field_type":"email","position":3}]'::jsonb
  when 'documents' then '[{"key":"name","name":"Название документа","field_type":"text","required":true,"position":0},{"key":"type","name":"Тип","field_type":"text","position":1},{"key":"date","name":"Дата","field_type":"date","position":2},{"key":"notes","name":"Комментарий","field_type":"long_text","position":3}]'::jsonb
  when 'projects' then '[{"key":"name","name":"Название проекта","field_type":"text","required":true,"position":0},{"key":"owner","name":"Ответственный","field_type":"text","position":1},{"key":"deadline","name":"Срок","field_type":"date","position":2},{"key":"notes","name":"Описание","field_type":"long_text","position":3}]'::jsonb
  when 'support' then '[{"key":"name","name":"Тема обращения","field_type":"text","required":true,"position":0},{"key":"customer","name":"Клиент","field_type":"text","position":1},{"key":"phone","name":"Телефон","field_type":"phone","position":2},{"key":"message","name":"Сообщение","field_type":"long_text","position":3}]'::jsonb
  when 'reports' then '[{"key":"name","name":"Показатель","field_type":"text","required":true,"position":0},{"key":"value","name":"Значение","field_type":"number","position":1},{"key":"period","name":"Период","field_type":"text","position":2}]'::jsonb
  else '[]'::jsonb end;
 if v_name is not null then
   select id into v_entity from public.entity_definitions where workspace_id=p_workspace_id and key=('module_'||p_module_key);
   if v_entity is null then select (public.create_business_entity(p_workspace_id,'module_'||p_module_key,v_name,v_desc,v_fields)->>'entity_id')::uuid into v_entity; end if;
   if p_module_key in ('sales','services','finance','projects','support') and not exists(select 1 from public.statuses where entity_id=v_entity) then
     insert into public.statuses(entity_id,key,name,position,is_default,is_terminal,config) values(v_entity,'new','Новые',0,true,false,'{}'),(v_entity,'in_progress','В работе',1,false,false,'{}'),(v_entity,'done','Завершено',2,false,true,'{}');
   end if;
 end if;
 return jsonb_build_object('workspace_id',p_workspace_id,'module_key',p_module_key,'enabled',true,'entity_id',v_entity);
end $function$;