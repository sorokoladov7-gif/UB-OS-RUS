"use client";
import Link from "next/link";
import type {ReactNode} from "react";
import {usePathname} from "next/navigation";

const nav:Array<[string,string,string]>=[
["◈","Обзор","/admin"],["⌘","Организации","/admin/organizations"],["◉","Пользователи","/admin/users"],
["₽","Тарифы","/admin/plans"],["↻","Подписки","/admin/subscriptions"],["◫","Платежи","/admin/payments"],
["◇","Интеграции","/admin/integrations"],["⌁","API","/admin/api"],["✦","AI Core","/admin/ai"],
["◎","RBAC","/admin/roles"],["≡","Аудит","/admin/audit"]];

export function AdminShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 return <main style={{minHeight:"100vh",background:"radial-gradient(circle at 80% -10%,rgba(76,102,255,.22),transparent 34%),radial-gradient(circle at 10% 20%,rgba(0,220,190,.09),transparent 28%),#070910",color:"#f7f8fa",fontFamily:"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>
  <div style={{maxWidth:1500,margin:"0 auto",padding:"18px 18px 70px"}}>
   <header style={{position:"relative",overflow:"hidden",padding:"28px 30px",border:"1px solid rgba(126,145,190,.22)",borderRadius:24,background:"linear-gradient(135deg,rgba(19,25,43,.96),rgba(10,14,25,.92))",boxShadow:"0 20px 70px rgba(0,0,0,.3)"}}>
    <div style={{position:"absolute",right:-80,top:-100,width:300,height:300,borderRadius:"50%",background:"rgba(76,102,255,.15)",filter:"blur(30px)"}}/>
    <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap",position:"relative"}}>
     <div><div style={{fontSize:11,fontWeight:700,letterSpacing:".18em",color:"#7e8cff"}}>UB OS-RUS · INTELLIGENT BUSINESS PLATFORM</div>
      <h1 style={{fontSize:"clamp(30px,4vw,52px)",lineHeight:1.02,margin:"10px 0 10px",letterSpacing:"-.035em"}}>Platform Control Center</h1>
      <p style={{color:"#aab4c9",maxWidth:760,lineHeight:1.55,margin:0}}>Единый центр управления ядром платформы, бизнесами, AI, API, безопасностью и автоматизацией.</p>
     </div>
     <div style={{minWidth:190,padding:"13px 15px",border:"1px solid rgba(0,230,190,.25)",borderRadius:16,background:"rgba(0,230,190,.06)"}}>
      <div style={{fontSize:10,letterSpacing:".12em",color:"#6fe3d0"}}>SYSTEM STATUS</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:7,fontWeight:700}}><span style={{width:9,height:9,borderRadius:"50%",background:"#31e5bd",boxShadow:"0 0 16px #31e5bd"}}/> Все контуры доступны</div>
     </div>
    </div>
   </header>
   <nav style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(125px,1fr))",gap:7,margin:"14px 0 26px"}}>
    {nav.map(([icon,label,href])=>{const active=pathname===href;return <Link key={href} href={href} style={{padding:"10px 11px",borderRadius:12,border:"1px solid "+(active?"rgba(110,128,255,.55)":"rgba(126,145,190,.15)"),background:active?"linear-gradient(135deg,rgba(76,102,255,.25),rgba(76,102,255,.08))":"rgba(16,21,34,.8)",color:active?"#fff":"#9da8bd",textDecoration:"none",fontSize:12,display:"flex",alignItems:"center",gap:8,boxShadow:active?"0 0 24px rgba(76,102,255,.12)":"none"}}><span style={{fontSize:16,color:active?"#9ca9ff":"#65718a"}}>{icon}</span>{label}</Link>})}
   </nav>
   {children}
  </div>
 </main>
}