"use client";

import { useState } from "react";

export default function BindButton() {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function start() {
    setBusy(true); setError("");
    const r=await fetch("/api/billing/sbp-bind",{method:"POST"});
    const data=await r.json().catch(()=>({}));
    if (!r.ok) setError(data.error || "Не удалось открыть СБП.");
    else if (data.confirmationUrl) window.location.href=data.confirmationUrl;
    else setError("ЮKassa не вернула ссылку.");
    setBusy(false);
  }
  return <div><button onClick={start} disabled={busy} style={{padding:"14px 18px",border:0,borderRadius:12,fontWeight:800}}>{busy?"Открываем СБП…":"Подключить оплату через СБП"}</button>{error&&<p style={{color:"#b42318"}}>{error}</p>}</div>;
}
