import Link from "next/link";
import type { ReactNode } from "react";
export function AdminShell({ children }: { children: ReactNode }) {
  const nav = ["Обзор", "Организации", "Пользователи", "Тарифы", "Подписки и платежи", "Аудит системы"];
  return <main style={{minHeight:"100vh",background:"#0b0d12",color:"#f7f8fa",fontFamily:"system-ui"}}><div style={{maxWidth:1250,margin:"0 auto",padding:"28px 20px 60px"}}>
    <header style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}><div>
      <div style={{color:"#8f9ab0",fontSize:12,letterSpacing:".14em"}}>UB OS-RUS · PLATFORM ADMIN</div><h1 style={{fontSize:42,margin:"8px 0"}}>Центр управления платформой</h1>
      <p style={{color:"#aab2c3",margin:0}}>Глобальное управление всей системой, организациями, тарифами, подписками и платежами.</p></div>
      <Link href="/app" style={{padding:"11px 16px",border:"1px solid #303747",borderRadius:12,color:"#fff",textDecoration:"none"}}>Кабинет бизнеса →</Link></header>
    <nav style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:24}}>{nav.map((item,index)=><span key={item} style={{padding:"9px 13px",borderRadius:999,background:index===0?"#f7f8fa":"#121620",color:index===0?"#0b0d12":"#b8c0d0",border:"1px solid #303747",fontSize:13}}>{item}</span>)}</nav>
    {children}</div></main>;
}