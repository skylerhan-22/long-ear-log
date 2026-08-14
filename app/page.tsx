"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "today" | "training" | "food" | "profile";
type Meal = { id: number; type: string; calories: number; protein?: number; carbs?: number; fat?: number };
type PlanDay = { day: string; name: string; state: string; detail: string };

const exercises = [
  { name: "杠铃臀推", detail: "4组 × 10次 · 40kg" },
  { name: "罗马尼亚硬拉", detail: "4组 × 10次 · 30kg" },
  { name: "保加利亚分腿蹲", detail: "4组 × 12次 · 8kg" },
  { name: "坐姿外展", detail: "3组 × 15次 · 35kg" },
];

const initialWeekPlan: PlanDay[] = [
  { day: "周一", name: "上肢推", state: "已完成", detail: "3个动作 · 12组" },
  { day: "周二", name: "休息日", state: "休息", detail: "恢复与休息" },
  { day: "周三", name: "背部训练", state: "已完成", detail: "3个动作 · 12组" },
  { day: "周四", name: "休息日", state: "休息", detail: "恢复与休息" },
  { day: "周五", name: "臀腿训练", state: "今日", detail: "4个动作 · 15组" },
  { day: "周六", name: "全身循环", state: "待完成", detail: "3个动作 · 12组" },
  { day: "周日", name: "休息日", state: "休息", detail: "恢复与休息" },
];

function formatTime(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Sprite({ sheet, col = 0, row = 0, rows = 3, className = "" }: { sheet: string; col?: number; row?: number; rows?: number; className?: string }) {
  const y = rows === 3 ? [0, 50, 100][row] : [0, 33.333, 66.666, 100][row];
  return <div className={`mascot-sprite ${className}`} style={{ backgroundImage: `url('/mascot-${sheet}.png')`, backgroundSize: `200% ${rows * 100}%`, backgroundPosition: `${col * 100}% ${y}%` }} aria-hidden="true" />;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(0);
  const [doneSets, setDoneSets] = useState<boolean[]>(Array(15).fill(false));
  const [workoutDone, setWorkoutDone] = useState(false);
  const [weekPlan, setWeekPlan] = useState<PlanDay[]>(initialWeekPlan);
  const [planDraft, setPlanDraft] = useState<PlanDay[]>(initialWeekPlan);
  const [planEditOpen, setPlanEditOpen] = useState(false);
  const [foodView, setFoodView] = useState<"day" | "week" | "month">("week");
  const [monthOffset, setMonthOffset] = useState(0);
  const [mealOpen, setMealOpen] = useState(false);
  const [mealMode, setMealMode] = useState<"ai" | "manual">("ai");
  const [photoReady, setPhotoReady] = useState(false);
  const [mealType, setMealType] = useState("晚餐");
  const [calories, setCalories] = useState("520");
  const [protein, setProtein] = useState("32");
  const [carbs, setCarbs] = useState("58");
  const [fat, setFat] = useState("18");
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [toast, setToast] = useState("");
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, type: "早餐", calories: 430, protein: 24, carbs: 48, fat: 16 },
    { id: 2, type: "午餐", calories: 620, protein: 38, carbs: 72, fat: 20 },
    { id: 3, type: "零食", calories: 200, protein: 8, carbs: 27, fat: 7 },
  ]);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!workoutRunning) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [workoutRunning]);

  useEffect(() => {
    if (rest <= 0) return;
    const timer = window.setInterval(() => setRest((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [rest]);

  const completed = doneSets.filter(Boolean).length;
  const allSetsDone = completed === doneSets.length;
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const macros = useMemo(() => meals.reduce((sum, meal) => ({ protein: sum.protein + (meal.protein || 0), carbs: sum.carbs + (meal.carbs || 0), fat: sum.fat + (meal.fat || 0) }), { protein: 0, carbs: 0, fat: 0 }), [meals]);

  function startWorkout() {
    setWorkoutOpen(true); setTab("training");
  }

  function finishWorkout() {
    if (!allSetsDone) return;
    setWorkoutRunning(false); setWorkoutDone(true); setWorkoutOpen(false); setTab("today");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function openPlanEditor() {
    setPlanDraft(weekPlan.map((item) => ({ ...item })));
    setPlanEditOpen(true);
  }

  const shownMonth = useMemo(() => {
    const date = new Date(2026, 7 + monthOffset, 1);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }, [monthOffset]);

  function saveMeal() {
    const value = Number(calories);
    if (!value) return;
    setMeals((current) => [...current, { id: Date.now(), type: mealType, calories: value, protein: Number(protein) || undefined, carbs: Number(carbs) || undefined, fat: Number(fat) || undefined }]);
    setMealOpen(false); setPhotoReady(false); setTab("food");
  }

  const nav = [
    { id: "today" as Tab, label: "今日", icon: "◉" }, { id: "training" as Tab, label: "训练", icon: "✓" },
    { id: "food" as Tab, label: "饮食", icon: "▦" }, { id: "profile" as Tab, label: "我的", icon: "☺" },
  ];

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {tab === "today" && (
          <div className="page-view">
            <header className="topbar"><div><p className="eyebrow">8月14日 · 星期五</p><h1>早上好，Mia</h1></div><button className="avatar" onClick={() => setTab("profile")} aria-label="打开个人资料">◌</button></header>
            <section className="hero-panel"><div><span className="chapter">今日 · CHAPTER 04</span><h2>{workoutDone ? "训练完成，记上一笔。" : "今天，动一点就好。"}</h2><p>本周已完成 {workoutDone ? 3 : 2} / 4 次训练</p></div><Sprite sheet="today" col={workoutDone ? 0 : 0} row={workoutDone ? 2 : 0} className="hero-mascot" /></section>
            <section className="workout-card comic-card"><div className="card-heading"><div><span className="kicker">今日训练</span><h3>臀腿训练</h3><p>4个动作 · 15组 · 约45分钟</p></div><span className="status-stamp">{workoutDone ? "DONE" : workoutRunning ? "ACTIVE" : "TODAY"}</span></div><div className="progress"><span style={{ width: workoutDone ? "100%" : `${Math.max(10, completed / 15 * 100)}%` }} /></div><button className="primary-action" onClick={workoutDone ? () => setTab("training") : startWorkout}>{workoutDone ? "查看训练总结" : workoutRunning ? "继续训练" : "开始训练"}<span>→</span></button></section>
            <section className="food-section"><div className="section-title"><div><span className="kicker">今日饮食</span><h3>{totalCalories.toLocaleString()} kcal</h3></div><button className="text-action" onClick={() => setMealOpen(true)}>+添加饮食</button></div><div className="meal-grid">{["早餐", "午餐", "晚餐", "零食"].map((type) => { const meal = meals.filter((m) => m.type === type); return <button className={`meal-card ${meal.length ? "" : "empty"}`} key={type} onClick={() => { setMealType(type); setMealOpen(true); }}><div className="meal-photo">{meal.length ? "◒" : "+"}</div><strong>{type}</strong><small>{meal.length ? `${meal.reduce((s,m)=>s+m.calories,0)} kcal` : "未记录"}</small></button>; })}</div></section>
          </div>
        )}

        {tab === "training" && !workoutOpen && (
          <div className="page-view">
            <header className="page-header"><div><p className="eyebrow">WEEK 33</p><h1>本周训练</h1></div><button className="square-button" onClick={openPlanEditor} aria-label="编辑训练计划">✎</button></header>
            <div className="week-summary comic-card"><div><strong>{workoutDone ? 3 : 2}/4</strong><span>本周完成</span></div><div className="week-dots">{[0,1,2,3,4,5,6].map((d)=><i className={d===0||d===2||workoutDone&&d===4?"filled":d===4?"today":""} key={d} />)}</div></div>
            <div className="plan-list">{weekPlan.map((item,index)=><button className={`plan-row ${item.state==="今日"?"current":""}`} key={item.day} onClick={item.state==="今日"?startWorkout:()=>showToast(item.state==="休息"?`${item.day}是恢复日`:`${item.day} · ${item.state}`)}><span className="day-label">{item.day}</span><span className="plan-copy"><strong>{item.name}</strong><small>{item.detail}</small></span><em>{index===4&&workoutDone?"已完成":item.state}</em></button>)}</div>
            <div className="mascot-note"><Sprite sheet="training" col={1} row={2} className="note-mascot" /><div><strong>固定周计划</strong><p>编辑一次，以后每周自动重复。</p></div></div>
          </div>
        )}

        {tab === "food" && (
          <div className="page-view">
            <header className="page-header"><div><p className="eyebrow">FOOD JOURNAL</p><h1>饮食日志</h1></div><button className="square-button dark" onClick={() => setMealOpen(true)} aria-label="添加饮食">+</button></header>
            <div className="segmented">{(["day","week","month"] as const).map((view)=><button className={foodView===view?"active":""} onClick={()=>setFoodView(view)} key={view}>{view==="day"?"日":view==="week"?"周":"月"}</button>)}</div>
            <section className="nutrition-card comic-card"><div><span className="kicker">今日已记录</span><strong>{totalCalories.toLocaleString()}<small> kcal</small></strong></div><div className="macro-row"><span>P <b>{macros.protein}g</b></span><span>C <b>{macros.carbs}g</b></span><span>F <b>{macros.fat}g</b></span></div></section>
            {foodView === "day" && <div className="meal-list">{meals.map((meal)=><article className="food-row" key={meal.id}><div className="food-thumb">◒</div><div><strong>{meal.type}</strong><small>P {meal.protein||0} · C {meal.carbs||0} · F {meal.fat||0}</small></div><b>{meal.calories} kcal</b></article>)}</div>}
            {foodView === "week" && <div className="food-week"><div className="week-labels">{["一","二","三","四","五","六","日"].map((d,i)=><span className={i===4?"selected":""} key={d}>{d}</span>)}</div><div className="photo-calendar">{Array.from({length:21}).map((_,i)=><button aria-label={`查看第${i+1}条饮食格`} onClick={()=>{setFoodView("day");showToast("已切换到当日记录");}} className={i%4===0||i===9||i===10?"has-food":""} key={i}>{i%4===0?"◒":i===9||i===10?"◓":"+"}</button>)}</div><p className="calendar-caption">周五 · 3条饮食记录</p></div>}
            {foodView === "month" && <div className="month-view"><div className="month-title"><button onClick={()=>setMonthOffset((value)=>value-1)} aria-label="上个月">‹</button><strong>{shownMonth}</strong><button onClick={()=>setMonthOffset((value)=>value+1)} aria-label="下个月">›</button></div><div className="month-grid">{Array.from({length:35}).map((_,i)=><button onClick={()=>{setFoodView("day");showToast(`查看${i<4?28+i:i-3}日记录`);}} className={i<4?"muted":i===17?"today":i%3===0?"logged":""} key={i}>{i<4?28+i:i-3}</button>)}</div><div className="month-legend"><i />有饮食记录</div></div>}
          </div>
        )}

        {tab === "profile" && (
          <div className="page-view">
            <header className="page-header"><div><p className="eyebrow">PROFILE</p><h1>我的</h1></div><button className="square-button" onClick={()=>setInfoModal({title:"设置",body:"账号、隐私与数据设置将在正式版中集中管理。当前 Demo 的记录仅保存在本设备。"})} aria-label="设置">⚙</button></header>
            <section className="profile-hero"><Sprite sheet="system" col={1} row={3} rows={4} className="profile-mascot" /><div><span className="kicker">训练日志者</span><h2>Mia</h2><p>目标：增肌与体能</p></div></section>
            <div className="body-stats"><article><strong>165</strong><span>cm</span><small>身高</small></article><article><strong>56.8</strong><span>kg</span><small>体重</small></article><article><strong>4</strong><span>次</span><small>周目标</small></article></div>
            <section className="profile-list"><button onClick={()=>setInfoModal({title:"健身目标",body:"当前目标：增肌与体能。正式版可在这里修改目标，但不会自动生成训练或饮食计划。"})}><span>◎</span><div><strong>健身目标</strong><small>增肌与体能</small></div><em>›</em></button><button onClick={()=>setInfoModal({title:"单位设置",body:"当前使用 kg、cm 和 kcal。Demo 已统一采用公制单位。"})}><span>⇄</span><div><strong>单位设置</strong><small>kg · cm · kcal</small></div><em>›</em></button><button onClick={()=>{setNotificationsOn((value)=>!value);showToast(notificationsOn?"计时提醒已关闭":"计时提醒已开启");}}><span>◷</span><div><strong>计时提醒</strong><small>训练与组间通知</small></div><em>{notificationsOn?"●":"○"}</em></button><button onClick={()=>showToast("离线模式已准备就绪")}><span>↓</span><div><strong>离线模式</strong><small>PWA 已准备就绪</small></div><em>✓</em></button></section>
            <p className="privacy-note">记录用于帮你回顾，不是身体评分。</p>
          </div>
        )}

        {workoutOpen && (
          <div className="workout-screen">
            <header className="workout-header"><button onClick={() => setWorkoutOpen(false)} aria-label="返回">←</button><div><span>训练时间</span><strong>{formatTime(elapsed)}</strong></div><button onClick={()=>setWorkoutRunning((v)=>!v)}>{workoutRunning?"暂停":elapsed>0?"继续":"开始计时"}</button></header>
            <div className="workout-title"><div><p className="eyebrow">TODAY'S SESSION</p><h1>臀腿训练</h1></div><span>{completed}/15 组</span></div>
            <div className="exercise-list">{exercises.map((exercise,eIndex)=>{ const start=eIndex===3?12:eIndex*4; const count=eIndex===3?3:4; return <article className="exercise-card" key={exercise.name}><div className="exercise-heading"><div><span>0{eIndex+1}</span><div><strong>{exercise.name}</strong><small>{exercise.detail}</small></div></div><span aria-hidden="true">⋯</span></div><div className="set-row">{Array.from({length:count}).map((_,i)=>{const index=start+i;return <button aria-label={`${exercise.name}第${i+1}组${doneSets[index]?"已完成":"未完成"}`} className={doneSets[index]?"done":""} onClick={()=>setDoneSets((old)=>old.map((value,idx)=>idx===index?!value:value))} key={i}>{doneSets[index]?"✓":i+1}</button>})}</div></article>})}</div>
            <div className="workout-controls"><button className={rest?"resting":""} onClick={()=>setRest(rest?0:60)}><span>{rest?formatTime(rest):"01:00"}</span><small>{rest?"点击取消":"开始组间休息"}</small></button><button className={`finish-button ${allSetsDone?"ready":""}`} onClick={finishWorkout} disabled={!allSetsDone}>完成训练</button></div>
          </div>
        )}

        {planEditOpen && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="编辑训练计划">
            <div className="plan-modal"><div className="modal-handle" /><header><div><p className="eyebrow">WEEKLY ROUTINE</p><h2>编辑固定周计划</h2></div><button onClick={()=>setPlanEditOpen(false)} aria-label="关闭">×</button></header>
              <p className="editor-help">修改后会作为每周重复使用的固定安排。</p>
              <div className="plan-editor-list">{planDraft.map((item,index)=><label key={item.day}><span>{item.day}</span><input aria-label={`${item.day}训练内容`} value={item.name} onChange={(event)=>setPlanDraft((current)=>current.map((day,i)=>i===index?{...day,name:event.target.value,detail:event.target.value.includes("休息")?"恢复与休息":day.detail}:day))} /></label>)}</div>
              <button className="primary-action" onClick={()=>{setWeekPlan(planDraft);setPlanEditOpen(false);showToast("周计划已保存");}}>保存周计划 <span>→</span></button>
            </div>
          </div>
        )}

        {infoModal && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={infoModal.title}><div className="info-modal"><div className="modal-handle" /><header><h2>{infoModal.title}</h2><button onClick={()=>setInfoModal(null)} aria-label="关闭">×</button></header><p>{infoModal.body}</p><button className="primary-action" onClick={()=>setInfoModal(null)}>知道了 <span>✓</span></button></div></div>}

        {mealOpen && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="添加饮食">
            <div className="meal-modal"><div className="modal-handle" /><header><div><p className="eyebrow">NEW FOOD ENTRY</p><h2>添加饮食</h2></div><button onClick={()=>setMealOpen(false)} aria-label="关闭">×</button></header>
              <label className={`photo-upload ${photoReady?"ready":""}`}><input type="file" accept="image/*" onChange={()=>setPhotoReady(true)} /><Sprite sheet="food" col={0} row={0} className="upload-mascot" /><span>{photoReady?"照片已选择 · 点击更换":"拍照或上传饮食照片"}</span></label>
              <div className="mode-switch"><button className={mealMode==="ai"?"active":""} onClick={()=>{setMealMode("ai");setCalories("520");setProtein("32");setCarbs("58");setFat("18");}}>AI估算</button><button className={mealMode==="manual"?"active":""} onClick={()=>{setMealMode("manual");setCalories("");setProtein("");setCarbs("");setFat("");}}>手动输入</button></div>
              {mealMode==="ai"&&<div className="ai-note"><span>✷</span><p><strong>AI 估算结果</strong>可能存在偏差，保存前可修改。</p></div>}
              <div className="calorie-input"><label>热量<input inputMode="numeric" value={calories} onChange={(e)=>setCalories(e.target.value)} placeholder="0" /></label><span>kcal</span></div>
              <div className="macro-inputs"><label>蛋白质<input inputMode="numeric" value={protein} onChange={(e)=>setProtein(e.target.value)} placeholder="可选" /></label><label>碳水<input inputMode="numeric" value={carbs} onChange={(e)=>setCarbs(e.target.value)} placeholder="可选" /></label><label>脂肪<input inputMode="numeric" value={fat} onChange={(e)=>setFat(e.target.value)} placeholder="可选" /></label></div>
              <div className="meal-types">{["早餐","午餐","晚餐","零食"].map((type)=><button className={mealType===type?"active":""} onClick={()=>setMealType(type)} key={type}>{type}</button>)}</div>
              <button className="primary-action save-meal" onClick={saveMeal} disabled={!Number(calories)}>保存到饮食日志 <span>→</span></button>
            </div>
          </div>
        )}

        {!workoutOpen && <nav className="bottom-nav" aria-label="主导航">{nav.map((item)=><button className={tab===item.id?"active":""} onClick={()=>setTab(item.id)} key={item.id}><span>{item.icon}</span>{item.label}</button>)}</nav>}
        {toast && <div className="toast" role="status">{toast}</div>}
      </section>
    </main>
  );
}
