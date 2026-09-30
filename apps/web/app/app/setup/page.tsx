import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SetupWizard from "./setup-wizard";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ industry?: string }> }) {
  const context = await getWorkspaceContext();
  if (!context?.membership || !context.activeWorkspace) redirect("/onboarding");
  const supabase = await createSupabaseServerClient();
  const { industry } = await searchParams;
  const { data: modules } = await supabase.from("module_definitions").select("key,name,description").order("key");
  const moduleLabels: Record<string,{name:string;description:string}> = {
    crm: {name:"Клиенты и CRM",description:"Клиенты, контакты, обращения и история взаимодействий."},
    documents: {name:"Документы",description:"Договоры, документы и рабочие файлы бизнеса."},
    employees: {name:"Сотрудники",description:"Сотрудники, роли и организационная структура."},
    finance: {name:"Финансы",description:"Финансовые операции, платежи и контроль показателей."},
    inventory: {name:"Склад и запасы",description:"Остатки, склады, перемещения и контроль запасов."},
    products: {name:"Товары и каталог",description:"Товары, услуги, каталог, цены и номенклатура."},
    projects: {name:"Проекты и задачи",description:"Проекты, задачи, этапы и контроль выполнения."},
    reports: {name:"Отчёты и аналитика",description:"Отчёты, показатели и аналитика бизнеса."},
    sales: {name:"Продажи",description:"Заказы, сделки, коммерческие предложения и воронка продаж."},
    services: {name:"Услуги и записи",description:"Каталог услуг, записи клиентов и выполнение услуг."},
    support: {name:"Поддержка",description:"Обращения клиентов и внутренние процессы поддержки."},
  };
  const localizedModules = (modules??[]).map((module) => ({
    ...module,
    name: moduleLabels[module.key]?.name ?? module.name,
    description: moduleLabels[module.key]?.description ?? module.description,
  }));
  const { data: installed } = await supabase.from("workspace_modules").select("module_id,module_definitions(key)").eq("workspace_id",context.activeWorkspace.id);
  const { data: industryPackage } = industry ? await supabase.from("industry_packages").select("key,name,description,config").eq("key",industry).maybeSingle() : {data:null};
  const recommended = Array.isArray((industryPackage?.config as any)?.module_keys) ? (industryPackage?.config as any).module_keys : [];
  return <SetupWizard workspace={context.activeWorkspace} modules={localizedModules} installed={installed??[]} recommended={recommended} industryName={industryPackage?.name??"Ваш бизнес"} />;
}