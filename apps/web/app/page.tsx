import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";

const modules = [
  ["◈","CRM","Клиенты, лиды и история взаимодействий"],
  ["↗","Продажи","Сделки, заказы, счета и оплаты"],
  ["◇","Услуги","Процессы оказания услуг и статусы"],
  ["▦","Товары","Каталог, остатки и движение"],
  ["⌘","Проекты","Этапы, задачи и контроль сроков"],
  ["₽","Финансы","Платежи, документы и показатели"],
  ["◎","Персонал","Сотрудники, роли и доступы"],
  ["✦","AI Core","Модели, агенты и автоматизация"],
];

const steps = [
  ["01","Создайте бизнес","Выберите отрасль или соберите собственную структуру."],
  ["02","Настройте процессы","Добавьте сущности, поля, статусы, формы и правила."],
  ["03","Подключите AI","Используйте встроенные модели или добавьте свои."],
  ["04","Автоматизируйте","Пусть система выполняет повторяющиеся действия сама."],
];

export default async function HomePage() {
  const context = await getWorkspaceContext();
  if (context?.activeWorkspace) redirect("/app");

  return (
    <main style={{minHeight:"100vh",background:"#07090d",color:"#f5f7fb",fontFamily:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",overflow:"hidden"}}>
      <div style={{maxWidth:1240,margin:"0 auto",padding:"0 22px 80px"}}>
        <header style={{height:82,display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,borderBottom:"1px solid #171b24"}}>
          <Link href="/" style={{color:"#fff",textDecoration:"none",fontWeight:800,fontSize:20,letterSpacing:"-.03em"}}>
            UB <span style={{color:"#8b95a9"}}>OS-RUS</span>
          </Link>
          <nav style={{display:"flex",alignItems:"center",gap:10}}>
            <Link href="/login" style={{color:"#c5ccda",textDecoration:"none",padding:"10px 14px"}}>Войти</Link>
            <Link href="/login?mode=signup" style={{color:"#080a0e",background:"#fff",textDecoration:"none",padding:"11px 16px",borderRadius:11,fontWeight:700}}>Создать систему</Link>
          </nav>
        </header>

        <section style={{padding:"clamp(70px,10vw,120px) 0 70px",position:"relative"}}>
          <div style={{position:"absolute",inset:"-100px -200px auto auto",width:650,height:650,borderRadius:"50%",background:"radial-gradient(circle,rgba(93,111,255,.20),transparent 66%)",pointerEvents:"none"}}/>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.05fr) minmax(340px,.95fr)",gap:"clamp(35px,6vw,80px)",alignItems:"center",position:"relative"}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 12px",border:"1px solid #293244",borderRadius:999,color:"#a7b1c3",fontSize:11,letterSpacing:1.6}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#72e2a2",display:"inline-block",boxShadow:"0 0 14px rgba(114,226,162,.55)"}}/>
                UNIVERSAL BUSINESS OPERATING SYSTEM
              </div>
              <h1 style={{fontSize:"clamp(50px,7.2vw,94px)",lineHeight:.93,letterSpacing:"-.07em",margin:"25px 0 25px"}}>
                Весь бизнес.<br/><span style={{color:"#909cff"}}>В одной системе.</span>
              </h1>
              <p style={{fontSize:"clamp(18px,2vw,22px)",lineHeight:1.55,color:"#a9b2c2",maxWidth:700,margin:0}}>
                UB OS-RUS объединяет клиентов, продажи, услуги, товары, финансы, сотрудников, процессы и AI в единую операционную систему, которую можно настроить под любой бизнес.
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,marginTop:32}}>
                <Link href="/login?mode=signup" style={{background:"#fff",color:"#080a0e",textDecoration:"none",padding:"15px 22px",borderRadius:13,fontWeight:800}}>Создать Business OS →</Link>
                <Link href="/login" style={{border:"1px solid #394255",color:"#e2e6ed",textDecoration:"none",padding:"15px 22px",borderRadius:13}}>Войти</Link>
              </div>
              <div style={{display:"flex",gap:20,flexWrap:"wrap",marginTop:24,color:"#68758a",fontSize:12}}>
                <span>✓ Модульная архитектура</span><span>✓ Свои AI-модели</span><span>✓ API-first</span>
              </div>
            </div>
            <div style={{border:"1px solid #293244",borderRadius:24,background:"linear-gradient(145deg,#111722,#080b10)",boxShadow:"0 30px 90px rgba(0,0,0,.42)",overflow:"hidden"}}>
              <div style={{height:38,padding:"0 15px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #202837",fontSize:11,color:"#78849a"}}>
                <span>UB OS-RUS / COMMAND CENTER</span><span style={{color:"#78dda4"}}>● SYSTEM ONLINE</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"105px 1fr"}}>
                <div style={{padding:"15px 10px",borderRight:"1px solid #202837",minHeight:330}}>
                  {["Overview","CRM","Sales","Projects","Finance","AI Core","Builder"].map((x,i)=><div key={x} style={{padding:"9px 8px",marginBottom:2,borderRadius:7,background:i===5?"#1b2231":"transparent",color:i===5?"#d9ddff":"#68758a",fontSize:10}}>{x}</div>)}
                </div>
                <div style={{padding:17}}>
                  <div style={{fontSize:10,color:"#68758a",letterSpacing:1.2}}>BUSINESS OVERVIEW</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
                    {[["1 284","Клиента"],["326","Сделки"],["94%","Автоматизация"]].map(([v,l])=><div key={l} style={{padding:11,border:"1px solid #252d3c",borderRadius:10,background:"#0b0f16"}}><strong style={{display:"block",fontSize:18,color:"#eef1f7"}}>{v}</strong><span style={{fontSize:9,color:"#68758a"}}>{l}</span></div>)}
                  </div>
                  <div style={{marginTop:12,padding:13,border:"1px solid #29334a",borderRadius:11,background:"#0a0e15"}}>
                    <div style={{fontSize:9,color:"#8e9cff",letterSpacing:1}}>AI CORE</div>
                    <div style={{marginTop:9,fontSize:12,color:"#d9ddff"}}>«Покажи просроченные сделки и создай задачу ответственным»</div>
                    <div style={{marginTop:10,height:5,borderRadius:5,background:"linear-gradient(90deg,#7d8cff 72%,#202938 72%)"}}/>
                    <div style={{marginTop:8,fontSize:9,color:"#6f7c90"}}>MODEL → AGENT → WORKFLOW → ACTION</div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                    <div style={{padding:12,border:"1px solid #222a37",borderRadius:10}}><div style={{fontSize:9,color:"#68758a"}}>WORKFLOWS</div><div style={{marginTop:5,color:"#8fe1b0",fontSize:13}}>18 active</div></div>
                    <div style={{padding:12,border:"1px solid #222a37",borderRadius:10}}><div style={{fontSize:9,color:"#68758a"}}>AI MODELS</div><div style={{marginTop:5,color:"#d9ddff",fontSize:13}}>7 connected</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:110}}>
          {[
            ["01","Единое ядро","Все ключевые процессы бизнеса в одной системе."],
            ["02","Business Builder","Создавайте собственные сущности, поля, статусы и формы."],
            ["03","Workflow Engine","Автоматизируйте действия и переходы между этапами."],
            ["04","AI Core","Подключайте разные модели и превращайте AI в часть процессов."],
          ].map(([n,t,d])=><article key={n} style={{padding:22,border:"1px solid #202632",borderRadius:18,background:"linear-gradient(145deg,#0d1118,#090b10)"}}>
            <div style={{fontSize:12,color:"#69758a",letterSpacing:2}}>{n}</div><h3 style={{margin:"18px 0 8px",fontSize:20}}>{t}</h3><p style={{margin:0,color:"#8f99aa",lineHeight:1.5}}>{d}</p>
          </article>)}
        </section>

        <section style={{marginBottom:110}}>
          <div style={{maxWidth:760,marginBottom:30}}>
            <div style={{fontSize:12,color:"#7f8ba0",letterSpacing:2}}>BUSINESS ENGINE</div>
            <h2 style={{fontSize:"clamp(34px,5vw,58px)",letterSpacing:"-.045em",margin:"12px 0"}}>Один фундамент.<br/>Любая структура бизнеса.</h2>
            <p style={{color:"#929bad",fontSize:18,lineHeight:1.6}}>Ресторан, производство, строительство, магазин, сервисная компания или совершенно новый тип бизнеса — структура не зашита намертво.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
            {modules.map(([icon,title,desc])=><div key={title} style={{padding:"20px",border:"1px solid #202632",borderRadius:16,background:"#0b0e14"}}>
              <div style={{fontSize:23,color:"#a6b0ff"}}>{icon}</div><h3 style={{margin:"13px 0 7px"}}>{title}</h3><p style={{margin:0,color:"#8993a5",lineHeight:1.45,fontSize:14}}>{desc}</p>
            </div>)}
          </div>
        </section>

        <section style={{padding:"clamp(30px,5vw,54px)",border:"1px solid #242c3a",borderRadius:24,background:"radial-gradient(circle at 80% 20%,rgba(104,120,255,.13),transparent 35%),#0b0f16",marginBottom:110}}>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.1fr) minmax(280px,.9fr)",gap:40,alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,color:"#8e9cff",letterSpacing:2}}>AI CORE</div>
              <h2 style={{fontSize:"clamp(34px,5vw,58px)",letterSpacing:"-.05em",margin:"13px 0 18px"}}>AI — это не отдельный чат.</h2>
              <p style={{color:"#a0a9b9",fontSize:17,lineHeight:1.6}}>AI Core становится слоем управления бизнесом: анализирует данные, работает с процессами, запускает действия и может использовать подключённые пользователем или платформой модели.</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:9,marginTop:22}}>
                {["Несколько AI-провайдеров","Свои модели","API","Агенты","Автоматизация"].map(x=><span key={x} style={{padding:"8px 11px",border:"1px solid #2b3445",borderRadius:9,color:"#b6bfce",fontSize:13}}>{x}</span>)}
              </div>
            </div>
            <div style={{padding:22,border:"1px solid #283246",borderRadius:18,background:"#080b11",fontFamily:"monospace",fontSize:13,color:"#aeb8ca"}}>
              <div style={{color:"#6f7c92"}}>AI CORE / ROUTER</div>
              <div style={{marginTop:18,color:"#d8ddff"}}>MODEL → AGENT → TOOL</div>
              <div style={{marginTop:10}}>↓</div>
              <div style={{color:"#8fe1b0"}}>BUSINESS DATA</div>
              <div style={{marginTop:10}}>↓</div>
              <div style={{color:"#d8ddff"}}>WORKFLOW → ACTION</div>
              <div style={{marginTop:18,color:"#6f7c92"}}>provider-independent architecture</div>
            </div>
          </div>
        </section>

        <section style={{marginBottom:110}}>
          <div style={{fontSize:12,color:"#7f8ba0",letterSpacing:2}}>HOW IT WORKS</div>
          <h2 style={{fontSize:"clamp(34px,5vw,56px)",letterSpacing:"-.045em",margin:"12px 0 32px"}}>От идеи до работающей системы.</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {steps.map(([n,t,d])=><article key={n} style={{padding:22,borderTop:"1px solid #303847"}}>
              <div style={{color:"#8995aa",fontFamily:"monospace"}}>{n}</div><h3 style={{margin:"18px 0 8px"}}>{t}</h3><p style={{color:"#8993a5",lineHeight:1.5,margin:0}}>{d}</p>
            </article>)}
          </div>
        </section>

        <section style={{marginBottom:110}}>
          <div style={{fontSize:12,color:"#7f8ba0",letterSpacing:2}}>AI INFRASTRUCTURE</div>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:14,marginTop:14}}>
            {[
              ["PLATFORM AI","Администратор платформы подключает и проверяет разные модели, назначает роли и резервные маршруты для AI Core."],
              ["YOUR AI","Каждый пользователь может подключить собственную модель и использовать свой endpoint или API key, не раскрывая секреты другим пользователям."],
              ["AI ROUTER","AI Core отделяет бизнес-логику от конкретного провайдера: модель можно заменить без перестройки бизнес-процессов."],
              ["API FIRST","Внешние приложения могут обращаться к AI Core через защищённый API и работать с теми моделями, которые разрешены ключу."],
            ].map(([title,desc])=><article key={title} style={{padding:24,border:"1px solid #202632",borderRadius:18,background:"#0b0e14"}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:"#8e9cff",letterSpacing:1.5}}>{title}</div>
              <p style={{margin:"13px 0 0",color:"#929bad",lineHeight:1.6}}>{desc}</p>
            </article>)}
          </div>
          <div style={{marginTop:14,padding:22,border:"1px solid #273143",borderRadius:18,background:"#0a0d13",fontFamily:"monospace",fontSize:13,overflowX:"auto"}}>
            <span style={{color:"#7c879a"}}>BUSINESS</span>
            <span style={{color:"#68758a"}}> → </span>
            <span style={{color:"#d8ddff"}}>AI CORE</span>
            <span style={{color:"#68758a"}}> → </span>
            <span style={{color:"#8fe1b0"}}>MODEL ROUTER</span>
            <span style={{color:"#68758a"}}> → </span>
            <span style={{color:"#d8ddff"}}>PROVIDER / YOUR MODEL</span>
            <span style={{color:"#68758a"}}> → </span>
            <span style={{color:"#8fe1b0"}}>ACTION</span>
          </div>
        </section>

        <section style={{textAlign:"center",padding:"76px 20px",borderTop:"1px solid #1c222d"}}>
          <div style={{fontSize:12,color:"#7f8ba0",letterSpacing:2}}>BUILD YOUR BUSINESS OS</div>
          <h2 style={{fontSize:"clamp(38px,6vw,68px)",letterSpacing:"-.055em",margin:"16px auto",maxWidth:800}}>Создайте систему под свой бизнес.</h2>
          <p style={{color:"#8f99aa",fontSize:17,margin:"0 auto 28px",maxWidth:650}}>Начните с готовой отраслевой структуры или соберите собственную с нуля.</p>
          <Link href="/login?mode=signup" style={{display:"inline-block",background:"#fff",color:"#080a0e",textDecoration:"none",padding:"15px 24px",borderRadius:13,fontWeight:800}}>Начать работу →</Link>
        </section>

        <footer style={{display:"flex",justifyContent:"space-between",gap:15,flexWrap:"wrap",paddingTop:24,color:"#5f697a",fontSize:13}}>
          <span>UB OS-RUS · Universal Business Operating System</span><span>Business OS · AI Core · Workflow Engine · API</span>
        </footer>
      </div>
    </main>
  );
}
