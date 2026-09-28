import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BindButton from "../bind-button";

export default async function BillingRequiredPage() {
  const context = await getWorkspaceContext();
  if (!context?.activeWorkspace || !context.membership) redirect("/login");
  const supabase = await createSupabaseServerClient();
  const { data: subscription } = await supabase.from("subscriptions").select("status,trial_ends_at,external_payment_method_id,subscription_plans(name,price_monthly)").eq("organization_id",context.membership.organization_id).maybeSingle();
  const plan = Array.isArray(subscription?.subscription_plans) ? subscription.subscription_plans[0] : subscription?.subscription_plans;

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#0b0d12",color:"white",fontFamily:"system-ui",padding:20}}>
      <section style={{maxWidth:640,padding:32,border:"1px solid #303747",borderRadius:22,background:"#121620"}}>
        <div style={{fontSize:13,color:"#9ea8ba"}}>UB OS-RUS · ПОДПИСКА</div>
        <h1>Продлите доступ к системе</h1>
        <p style={{color:"#aab2c3",lineHeight:1.6}}>
          {subscription?.status==="trialing" ? "10-дневный пробный период завершён." : "Текущий период подписки завершён или оплата не прошла."}
        </p>
        {plan && <p>Тариф: <strong>{plan.name}</strong> · {Number(plan.price_monthly).toLocaleString("ru-RU")} ₽/мес.</p>}
        <p style={{color:"#aab2c3"}}>Оплата проходит через СБП. При первом платеже можно сохранить способ оплаты для последующих автопродлений, если выбранный банк поддерживает эту возможность.</p>
        <BindButton />
        <p style={{marginTop:22}}><Link href="/" style={{color:"white"}}>Вернуться на главную</Link></p>
      </section>
    </main>
  );
}
