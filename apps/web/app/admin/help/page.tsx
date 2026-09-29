"use client";
import Link from "next/link";
import {useState} from "react";
import {AdminShell} from "../_components";

const sections=[
["overview","◈","Обзор","Главная панель показывает состояние платформы и быстрые переходы.","Проверьте System Status. Карточки ведут в модули. AI Core открывает центральные настройки."],
["organizations","⌘","Организации","Управление бизнесами, подключёнными к UB OS-RUS.","Проверьте организацию, тариф, подписку и участников. Название и slug меняйте после проверки ID."],
["users","◉","Пользователи","Управление участниками организаций и их доступом.","Проверьте user ID и роль. Для временного ограничения используйте suspension, для восстановления — active. Владелец платформы защищён."],
["plans","₽","Тарифы","Управление коммерческими параметрами продукта.","Можно менять название, цену, пробный период и enabled. Отключение тарифа не отменяет автоматически существующие подписки."],
["subscriptions","↻","Подписки","Управление тарифом и жизненным циклом подписки организации.","Выберите plan и статус. Статусы: trialing, active, past_due, canceled, incomplete. Отмена в конце периода не равна немедленной отмене."],
["payments","◫","Платежи","Контроль истории и состояния расчётов.","Сверяйте платёж с организацией и подпиской. При спорной ситуации сначала проверяйте подписку и аудит."],
["integrations","◇","Интеграции","Центр внешних сервисов платформы.","Проверьте provider, category и конфигурацию перед включением. Секреты не должны попадать в клиентский код."],
["api","⌁","API","Управление ключами доступа к API.","Создавайте ключ с минимальными scopes. Секрет сохраняйте сразу. Скомпрометированный ключ отзывайте через revoke."],
["ai","✦","AI Core","Управление центральным AI-контуром.","Проверьте enabled, выберите provider и model. Изменения AI должны быть аудируемыми; опасные действия требуют подтверждения."],
["rbac","◎","RBAC","Role-Based Access Control для бизнес-пространств.","Проверяйте permissions перед выдачей доступа. Owner/Admin имеют административные права; Manager, Employee и Viewer — ограниченные."],
["audit","≡","Аудит","Журнал административных действий.","Проверяйте action, resource и время. После критического изменения сверяйте запись аудита. Историю нельзя использовать как временный список для удаления."],
["security","⚿","Безопасность","Правила безопасной работы администратора.","Не передавайте пароли и API-секреты. Перед изменением проверяйте организацию и ID. После критических действий открывайте Аудит."]
] as const;

export default function AdminHelpPage(){
 const [q,setQ]=useState("");
 const filtered=sections.filter(s=>(s[2]+" "+s[3]+" "+s[4]).toLowerCase().includes(q.toLowerCase()));
 return <AdminShell><section style={hero}>
  <div><div style={eyebrow}>ADMIN KNOWLEDGE CENTER</div><h2 style={title}>Инструкция администратора</h2><p style={desc}>Практическая инструкция именно по Platform Control Center UB OS-RUS: назначение разделов, доступные действия и безопасный порядок работы.</p></div><div style={badge}>12 разделов</div>
 </section>
 <div style={toolbar}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск по инструкции…" style={search}/><Link href="/admin" style={back}>← В кабинет</Link></div>
 <section style={layout}><aside style={toc}><strong style={{fontSize:12,color:"#dce2f0"}}>РАЗДЕЛЫ</strong>{filtered.map(s=><a key={s[0]} href={"#"+s[0]} style={tocLink}><span>{s[1]}</span>{s[2]}</a>)}</aside>
 <div style={{display:"grid",gap:12}}>{filtered.map(s=><article id={s[0]} key={s[0]} style={card}><div style={icon}>{s[1]}</div><div><h3 style={h3}>{s[2]}</h3><p style={textStyle}>{s[3]}</p><div style={how}><b>Как работать:</b> {s[4]}</div></div></article>)}</div></section>
 {filtered.length===0&&<div style={empty}>По запросу ничего не найдено.</div>}
 </section></AdminShell>
}
const hero={padding:24,border:"1px solid rgba(126,145,190,.2)",borderRadius:22,background:"linear-gradient(135deg,rgba(19,25,43,.94),rgba(10,14,25,.96))",display:"flex",justifyContent:"space-between",gap:18,flexWrap:"wrap" as const};
const eyebrow={fontSize:11,letterSpacing:".16em",color:"#8492ff"};
const title={fontSize:"clamp(30px,4vw,44px)",margin:"7px 0"};
const desc={color:"#a5afc2",lineHeight:1.6,maxWidth:820,margin:0};
const badge={alignSelf:"center",padding:"10px 14px",borderRadius:999,border:"1px solid rgba(0,220,190,.25)",background:"rgba(0,220,190,.06)",color:"#63dcc9",fontSize:12};
const toolbar={display:"flex",gap:9,margin:"14px 0",flexWrap:"wrap" as const};
const search={flex:"1 1 300px",minWidth:220,padding:"12px 14px",borderRadius:12,border:"1px solid #30394d",background:"#0b101c",color:"#fff",outline:"none"};
const back={padding:"12px 15px",borderRadius:12,border:"1px solid rgba(126,145,190,.2)",background:"#111827",color:"#cdd5e5",textDecoration:"none",fontSize:13};
const layout={display:"grid",gridTemplateColumns:"210px minmax(0,1fr)",gap:14,alignItems:"start"};
const toc={position:"sticky" as const,top:12,padding:13,borderRadius:16,border:"1px solid rgba(126,145,190,.16)",background:"rgba(12,17,29,.9)"};
const tocLink={display:"flex",gap:8,alignItems:"center",padding:"9px 8px",marginTop:3,borderRadius:9,color:"#9faac0",textDecoration:"none",fontSize:12};
const card={padding:19,borderRadius:17,border:"1px solid rgba(126,145,190,.16)",background:"rgba(16,21,34,.84)",display:"flex",gap:13};
const icon={width:38,height:38,borderRadius:11,display:"grid",placeItems:"center",flex:"0 0 auto",background:"rgba(76,102,255,.12)",color:"#9ca9ff",fontSize:18};
const h3={margin:"1px 0 7px",fontSize:21};
const textStyle={color:"#aab4c8",lineHeight:1.55,margin:"0 0 9px"};
const how={color:"#c9d1df",fontSize:13,lineHeight:1.55};
const empty={padding:30,textAlign:"center" as const,color:"#8f9bb0"};
