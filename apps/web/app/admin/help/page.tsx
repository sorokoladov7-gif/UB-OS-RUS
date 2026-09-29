"use client";
import Link from "next/link";
import {useState} from "react";
import {AdminShell} from "../_components";

type Section={id:string;icon:string;title:string;what:string;steps:string[];safe:string;after:string;critical?:string};
const sections:Section[]=[
{id:"overview",icon:"◈",title:"Обзор",what:"Главная панель Platform Control Center показывает состояние платформы и быстрые переходы.",steps:["Проверьте System Status.","Используйте карточки модулей для перехода к управлению.","AI Core открывает центральные настройки AI."],safe:"Не воспринимайте индикатор статуса как замену проверке конкретной операции.",after:"После изменений переходите в соответствующий модуль и проверяйте результат."},
{id:"organizations",icon:"⌘",title:"Организации",what:"Управление бизнесами, подключёнными к UB OS-RUS.",steps:["Найдите организацию.","Проверьте ID, название, тариф, подписку и участников.","Изменяйте данные только после проверки выбранной организации."],safe:"Не меняйте организацию по одному названию — сначала сверяйте идентификатор.",after:"Изменения организации должны быть подтверждены повторным просмотром и аудитом."},
{id:"users",icon:"◉",title:"Пользователи",what:"Управление участниками организаций и их доступом.",steps:["Проверьте user ID, организацию и роль.","Для временного ограничения используйте suspension.","Для восстановления доступа верните active."],safe:"Платформенный владелец защищён от отключения. Не выдавайте лишние права.",after:"После изменения статуса проверьте карточку пользователя и журнал аудита."},
{id:"plans",icon:"₽",title:"Тарифы",what:"Управление названием, ценой, пробным периодом, функциями и состоянием тарифа.",steps:["Откройте нужный тариф.","Измените только необходимые параметры.","Сохраните и проверьте enabled и цену."],safe:"Не меняйте цену, trial_days или набор функций без проверки влияния на новые регистрации и коммерческие условия.",after:"Настройки тарифа сохраняются административной операцией; проверьте карточку тарифа и аудит.",critical:"КРИТИЧЕСКАЯ ОПЕРАЦИЯ: изменение цены или отключение тарифа влияет на коммерческую конфигурацию платформы."},
{id:"subscriptions",icon:"↻",title:"Подписки",what:"Управление назначенным тарифом и жизненным циклом подписки.",steps:["Выберите организацию и текущий план.","Проверьте статус: trialing, active, past_due, canceled или incomplete.","При необходимости включите отмену в конце периода.","Сохраните и повторно проверьте строку."],safe:"Не меняйте статус подписки вручную без проверки платежного состояния и периода.",after:"Проверьте план, статус, период и запись аудита.",critical:"КРИТИЧЕСКАЯ ОПЕРАЦИЯ: ручная смена статуса может изменить доступ организации к платным функциям."},
{id:"payments",icon:"◫",title:"Платежи",what:"Контроль истории и состояния расчётов.",steps:["Найдите платёж.","Сопоставьте его с организацией и подпиской.","При проблеме проверьте статус подписки и аудит."],safe:"Не исправляйте платёжные данные вручную без понимания связанного процесса.",after:"Результат сверки фиксируйте в рабочих заметках или поддерживающем процессе."},
{id:"integrations",icon:"◇",title:"Интеграции",what:"Центр внешних сервисов платформы.",steps:["Создайте или выберите интеграцию.","Проверьте provider, category и конфигурацию.","Включайте интеграцию после проверки параметров."],safe:"Секреты и приватные ключи нельзя помещать в клиентский код.",after:"После включения проверьте состояние интеграции и связанные операции."},
{id:"api",icon:"⌁",title:"API",what:"Управление API-ключами платформы.",steps:["Создайте ключ с минимальными scopes.","Сохраните секрет сразу после создания.","Для скомпрометированного ключа используйте revoke.","После создания или отзыва проверьте список активных ключей."],safe:"Не расширяйте scopes без необходимости и никогда не публикуйте секрет.",after:"После отзыва ключ перестаёт быть рабочим; новый ключ создавайте только с необходимыми scopes.",critical:"КРИТИЧЕСКАЯ ОПЕРАЦИЯ: секрет API показывается только в момент создания — потерянный секрет восстановить нельзя."},
{id:"ai",icon:"✦",title:"AI Core",what:"Управление провайдером, моделью и состоянием центрального AI-контура.",steps:["Проверьте enabled.","Выберите provider.","Выберите model.","Сохраните настройки.","Выполните контрольный AI-запрос и проверьте аудит."],safe:"Не меняйте provider/model без проверки доступности выбранной конфигурации.",after:"Проверьте фактический AI-запрос, ошибки провайдера и запись аудита.",critical:"КРИТИЧЕСКАЯ ОПЕРАЦИЯ: отключение или смена AI-контура может остановить AI-функции платформы."},
{id:"rbac",icon:"◎",title:"RBAC",what:"Role-Based Access Control определяет доступ участников к операциям.",steps:["Проверьте роль пользователя.","Проверьте необходимые permissions.","Выдавайте только минимально необходимые права."],safe:"Owner/Admin обладают расширенными возможностями; Manager, Employee и Viewer предназначены для более ограниченного доступа.",after:"После изменения роли проверьте доступ именно тем пользователем или через проверку разрешений."},
{id:"audit",icon:"≡",title:"Аудит",what:"Журнал административных действий: кто, что и когда изменил.",steps:["Найдите действие по времени и ресурсу.","Сопоставьте action и resource.","Используйте журнал для проверки критических изменений."],safe:"Не удаляйте записи аудита ради очистки интерфейса.",after:"Аудит должен оставаться контрольным источником истории административных действий."},
{id:"security",icon:"⚿",title:"Безопасность",what:"Базовые правила работы единственного платформенного администратора.",steps:["Не передавайте пароль и API-секреты.","Проверяйте ID перед изменением данных.","После критических операций открывайте Аудит.","Для временной проблемы используйте обратимое ограничение доступа."],safe:"Никогда не вставляйте секреты в чат, GitHub, клиентский JavaScript или публичные настройки.",after:"После критической операции всегда выполняйте контрольную проверку."}
];

export default function AdminHelpPage(){
 const [q,setQ]=useState("");
 const filtered=sections.filter(s=>(s.title+" "+s.what+" "+s.steps.join(" ")+" "+s.safe+" "+s.after).toLowerCase().includes(q.toLowerCase()));
 return <AdminShell>
  <section style={hero}><div><div style={eyebrow}>ADMIN KNOWLEDGE CENTER</div><h2 style={title}>Инструкция администратора</h2><p style={lead}>Практическая инструкция именно по Platform Control Center: что делает раздел, пошаговая работа, ограничения безопасности и что проверить после сохранения.</p></div><div style={badge}>12 модулей</div></section>
  <div style={toolbar}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Поиск по инструкции…" style={search}/><Link href="/admin" style={back}>← В кабинет</Link></div>
  <section style={grid}>{filtered.map(s=><article id={s.id} key={s.id} style={card}><div style={head}><div style={icon}>{s.icon}</div><div><h3 style={h3}>{s.title}</h3><p style={what}>{s.what}</p></div></div><div style={cols}><div><b style={label}>ПОШАГОВО</b><ol style={list}>{s.steps.map((x,i)=><li key={i}>{x}</li>)}</ol></div><div>{s.critical&&<div style={critical}><b style={label}>🚨 КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ</b><p>{s.critical}</p></div>}<div style={notice}><b style={label}>⚠ ЧТО НЕЛЬЗЯ МЕНЯТЬ БЕЗ ПРОВЕРКИ</b><p>{s.safe}</p></div><div style={result}><b style={label}>✓ ПОСЛЕ СОХРАНЕНИЯ</b><p>{s.after}</p></div></div></div></article>)}</section>
  {filtered.length===0&&<div style={empty}>По запросу ничего не найдено.</div>}
 </AdminShell>
}
const hero={padding:24,border:"1px solid rgba(126,145,190,.2)",borderRadius:22,background:"linear-gradient(135deg,rgba(19,25,43,.94),rgba(10,14,25,.96))",display:"flex",justifyContent:"space-between",gap:18,flexWrap:"wrap" as const};
const eyebrow={fontSize:11,letterSpacing:".16em",color:"#8492ff"};
const title={fontSize:"clamp(30px,4vw,44px)",margin:"7px 0"};
const lead={color:"#a5afc2",lineHeight:1.6,maxWidth:820,margin:0};
const badge={alignSelf:"center",padding:"10px 14px",borderRadius:999,border:"1px solid rgba(0,220,190,.25)",background:"rgba(0,220,190,.06)",color:"#63dcc9",fontSize:12};
const toolbar={display:"flex",gap:9,margin:"14px 0",flexWrap:"wrap" as const};
const search={flex:"1 1 300px",minWidth:220,padding:"12px 14px",borderRadius:12,border:"1px solid #30394d",background:"#0b101c",color:"#fff",outline:"none"};
const back={padding:"12px 15px",borderRadius:12,border:"1px solid rgba(126,145,190,.2)",background:"#111827",color:"#cdd5e5",textDecoration:"none",fontSize:13};
const grid={display:"grid",gap:12};
const card={padding:19,borderRadius:17,border:"1px solid rgba(126,145,190,.16)",background:"rgba(16,21,34,.84)"};
const head={display:"flex",gap:12,alignItems:"flex-start"};
const icon={width:40,height:40,borderRadius:11,display:"grid",placeItems:"center",flex:"0 0 auto",background:"rgba(76,102,255,.12)",color:"#9ca9ff",fontSize:18};
const h3={margin:"1px 0 5px",fontSize:21};
const what={color:"#aab4c8",lineHeight:1.5,margin:0};
const cols={display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:12,marginTop:14};
const label={fontSize:10,letterSpacing:".12em",color:"#8d9aff"};
const list={margin:"8px 0 0",paddingLeft:20,color:"#cbd4e3",fontSize:13,lineHeight:1.55};
const notice={padding:12,borderRadius:12,border:"1px solid rgba(255,180,80,.18)",background:"rgba(255,180,80,.05)",color:"#cbd4e3",fontSize:13,lineHeight:1.5};
const critical={padding:12,borderRadius:12,border:"1px solid rgba(255,70,90,.3)",background:"rgba(255,50,70,.08)",color:"#ffd0d6",fontSize:13,lineHeight:1.5,marginBottom:8};
const result={padding:12,borderRadius:12,border:"1px solid rgba(0,220,190,.16)",background:"rgba(0,220,190,.04)",color:"#cbd4e3",fontSize:13,lineHeight:1.5,marginTop:8};
const empty={padding:30,textAlign:"center" as const,color:"#8f9bb0"};
