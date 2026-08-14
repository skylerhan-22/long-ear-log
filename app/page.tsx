"use client";

import { useEffect, useMemo, useState } from "react";

type Tab = "today" | "training" | "food" | "profile";
type Exercise = { id: number; name: string; sets: number; reps: number; weight: string };
type PlanDay = { day: string; short: string; name: string; state: "已完成" | "今日" | "待完成" | "休息"; exercises: Exercise[] };
type Meal = { id: number; type: string; calories: number; protein?: number; carbs?: number; fat?: number };

const gluteExercises: Exercise[] = [
  { id: 1, name: "杠铃臀推", sets: 4, reps: 10, weight: "40kg" },
  { id: 2, name: "罗马尼亚硬拉", sets: 4, reps: 10, weight: "30kg" },
  { id: 3, name: "保加利亚分腿蹲", sets: 4, reps: 12, weight: "8kg" },
  { id: 4, name: "坐姿外展", sets: 3, reps: 15, weight: "35kg" },
];

const initialWeekPlan: PlanDay[] = [
  { day: "周一", short: "一", name: "上肢推", state: "已完成", exercises: [
    { id: 11, name: "哑铃卧推", sets: 4, reps: 10, weight: "8kg" },
    { id: 12, name: "坐姿推肩", sets: 4, reps: 10, weight: "6kg" },
    { id: 13, name: "绳索下压", sets: 3, reps: 12, weight: "15kg" },
  ]},
  { day: "周二", short: "二", name: "恢复与拉伸", state: "休息", exercises: [] },
  { day: "周三", short: "三", name: "背部训练", state: "已完成", exercises: [
    { id: 31, name: "高位下拉", sets: 4, reps: 10, weight: "25kg" },
    { id: 32, name: "坐姿划船", sets: 4, reps: 10, weight: "25kg" },
    { id: 33, name: "面拉", sets: 3, reps: 15, weight: "12kg" },
  ]},
  { day: "周四", short: "四", name: "散步恢复", state: "休息", exercises: [] },
  { day: "周五", short: "五", name: "臀腿训练", state: "今日", exercises: gluteExercises },
  { day: "周六", short: "六", name: "全身循环", state: "待完成", exercises: [
    { id: 61, name: "壶铃深蹲", sets: 3, reps: 12, weight: "12kg" },
    { id: 62, name: "俯卧撑", sets: 3, reps: 10, weight: "自重" },
    { id: 63, name: "农夫行走", sets: 3, reps: 40, weight: "秒" },
  ]},
  { day: "周日", short: "日", name: "完全休息", state: "休息", exercises: [] },
];

const mealArt: Record<string, { col: number; row: number }> = {
  早餐: { col: 0, row: 0 }, 午餐: { col: 1, row: 0 }, 晚餐: { col: 0, row: 1 }, 零食: { col: 1, row: 1 },
};

function formatTime(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

function Sprite({ sheet, col = 0, row = 0, rows = 3, positionY, className = "" }: { sheet: string; col?: number; row?: number; rows?: number; positionY?: number; className?: string }) {
  const y = rows === 3 ? [0, 50, 100][row] : rows === 2 ? [0, 100][row] : [0, 33.333, 66.666, 100][row];
  const source = sheet === "meals" ? "/rabbit-meals-closeup.png" : sheet === "food" ? "/rabbit-food-hd.png" : "/rabbit-actions-hd.png";
  return <div className={`mascot-sprite ${className}`} aria-hidden="true"><span className="sprite-art" style={{ backgroundImage: `url('${source}')`, backgroundSize: `200% ${rows * 100}%`, backgroundPosition: `${col * 100}% ${positionY ?? y}%` }} /></div>;
}

function MealVisual({ type, className = "" }: { type: string; className?: string }) {
  const art = mealArt[type] || mealArt.早餐;
  return <Sprite sheet="meals" col={art.col} row={art.row} rows={2} className={className} />;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [weekPlan, setWeekPlan] = useState<PlanDay[]>(initialWeekPlan);
  const [planDetailIndex, setPlanDetailIndex] = useState<number | null>(null);
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planEditorDay, setPlanEditorDay] = useState(4);
  const [planDraft, setPlanDraft] = useState<PlanDay[]>(initialWeekPlan);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(4);
  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [workoutCompact, setWorkoutCompact] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(0);
  const [doneSets, setDoneSets] = useState<boolean[]>(Array(15).fill(false));
  const [workoutDone, setWorkoutDone] = useState(false);
  const [foodView, setFoodView] = useState<"day" | "week" | "month">("week");
  const [foodEntryOpen, setFoodEntryOpen] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [mealMode, setMealMode] = useState<"ai" | "manual">("ai");
  const [photoReady, setPhotoReady] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [aiState, setAiState] = useState<"idle" | "analyzing" | "ready">("idle");
  const [mealType, setMealType] = useState("晚餐");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [toast, setToast] = useState("");
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, type: "早餐", calories: 430, protein: 24, carbs: 48, fat: 16 },
    { id: 2, type: "午餐", calories: 620, protein: 38, carbs: 72, fat: 20 },
    { id: 3, type: "零食", calories: 200, protein: 8, carbs: 27, fat: 7 },
  ]);

  const todayPlan = weekPlan[4];
  const activePlan = weekPlan[activeWorkoutDay];
  const activeSetCount = activePlan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const completed = doneSets.filter(Boolean).length;
  const allSetsDone = activeSetCount > 0 && completed === activeSetCount;
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const macros = useMemo(() => meals.reduce((sum, meal) => ({
    protein: sum.protein + (meal.protein || 0), carbs: sum.carbs + (meal.carbs || 0), fat: sum.fat + (meal.fat || 0),
  }), { protein: 0, carbs: 0, fat: 0 }), [meals]);

  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
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

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function beginWorkout(dayIndex: number) {
    const selected = weekPlan[dayIndex];
    if (!selected.exercises.length) { showToast(`${selected.day}是恢复日`); return; }
    const selectedSetCount = selected.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    if (activeWorkoutDay !== dayIndex || doneSets.length !== selectedSetCount) {
      setDoneSets(Array(selectedSetCount).fill(false));
      setElapsed(0); setRest(0);
    }
    setActiveWorkoutDay(dayIndex);
    setWorkoutRunning(false);
    setWorkoutCompact(false);
    setWorkoutOpen(true);
    setPlanDetailIndex(null);
  }

  function leaveWorkout() {
    setWorkoutRunning(false);
    setWorkoutOpen(false);
    setPlanDetailIndex(null);
    setTab("today");
  }

  function finishWorkout() {
    if (!allSetsDone) return;
    setWorkoutRunning(false);
    setWorkoutOpen(false);
    setWeekPlan((current) => current.map((day, index) => index === activeWorkoutDay ? { ...day, state: "已完成" } : day));
    if (activeWorkoutDay === 4) setWorkoutDone(true);
    setTab("today");
  }

  function openPlanEditor(dayIndex = 4) {
    setPlanDraft(weekPlan.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise })) })));
    setPlanEditorDay(dayIndex);
    setPlanEditorOpen(true);
  }

  function updateDraftDay(patch: Partial<PlanDay>) {
    setPlanDraft((current) => current.map((day, index) => index === planEditorDay ? { ...day, ...patch } : day));
  }

  function updateDraftExercise(exerciseIndex: number, patch: Partial<Exercise>) {
    setPlanDraft((current) => current.map((day, dayIndex) => dayIndex === planEditorDay ? {
      ...day, exercises: day.exercises.map((exercise, index) => index === exerciseIndex ? { ...exercise, ...patch } : exercise),
    } : day));
  }

  function openFoodEntry(type = "晚餐") {
    setMealType(type); setFoodEntryOpen(true); setAiState("idle");
    setCalories(""); setProtein(""); setCarbs(""); setFat("");
  }

  function runAiDemo() {
    if (!photoReady) { showToast("请先选择一张饮食照片"); return; }
    setAiState("analyzing");
    window.setTimeout(() => {
      setCalories("520"); setProtein("32"); setCarbs("58"); setFat("18"); setAiState("ready");
    }, 850);
  }

  function saveMeal() {
    const value = Number(calories);
    if (!value) return;
    setMeals((current) => [...current, { id: Date.now(), type: mealType, calories: value, protein: Number(protein) || undefined, carbs: Number(carbs) || undefined, fat: Number(fat) || undefined }]);
    setFoodEntryOpen(false); setPhotoReady(false); setPhotoUrl(""); setTab("food"); setFoodView("day"); showToast("饮食记录已保存");
  }

  const shownMonth = useMemo(() => {
    const date = new Date(2026, 7 + monthOffset, 1);
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }, [monthOffset]);

  const nav = [
    { id: "today" as Tab, label: "今日", icon: "◉" }, { id: "training" as Tab, label: "训练", icon: "✓" },
    { id: "food" as Tab, label: "饮食", icon: "▦" }, { id: "profile" as Tab, label: "我的", icon: "☺" },
  ];

  return (
    <main className="app-shell"><section className="phone-frame">
      {tab === "today" && !workoutOpen && !foodEntryOpen && <div className="page-view">
        <header className="topbar"><div><p className="eyebrow">8月14日 · 星期五</p><h1>早上好，Mia</h1></div><button className="avatar" onClick={() => setTab("profile")} aria-label="打开个人资料">◌</button></header>
        <section className="hero-panel"><div><span className="chapter">今日 · CHAPTER 04</span><h2>{workoutDone ? "训练完成，记上一笔。" : "今天，动一点就好。"}</h2><p>本周已完成 {workoutDone ? 3 : 2} / 4 次训练</p></div><Sprite sheet="today" col={0} row={workoutDone ? 2 : 0} positionY={workoutDone ? 96 : undefined} className="hero-mascot" /></section>
        <section className="workout-card comic-card"><div className="card-heading"><div><span className="kicker">今日训练</span><h3>{todayPlan.name}</h3><p>{todayPlan.exercises.length}个动作 · {todayPlan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)}组 · 约45分钟</p></div><span className="status-stamp">{workoutDone ? "DONE" : "TODAY"}</span></div><div className="progress"><span style={{ width: workoutDone ? "100%" : `${Math.max(8, completed / Math.max(1, activeSetCount) * 100)}%` }} /></div><button className="primary-action" onClick={workoutDone ? () => { setTab("training"); setPlanDetailIndex(4); } : () => beginWorkout(4)}>{workoutDone ? "查看训练总结" : completed ? "继续今日训练" : "开始训练"}<span>→</span></button></section>
        <section className="food-section"><div className="section-title"><div><span className="kicker">今日饮食</span><h3>{totalCalories.toLocaleString()} kcal</h3></div><button className="text-action" onClick={() => openFoodEntry()}>+记录饮食</button></div><div className="meal-grid">{["早餐", "午餐", "晚餐", "零食"].map((type) => {
          const entries = meals.filter((meal) => meal.type === type);
          return <button className={`meal-card ${entries.length ? "" : "empty"}`} key={type} onClick={() => openFoodEntry(type)}><div className="meal-photo"><MealVisual type={type} className="meal-art" /><span>{entries.length ? entries.reduce((sum, meal) => sum + meal.calories, 0) : "+"}</span></div><strong>{type}</strong><small>{entries.length ? `${entries.reduce((sum, meal) => sum + meal.calories, 0)} kcal` : "点击记录"}</small></button>;
        })}</div></section>
      </div>}

      {tab === "training" && !workoutOpen && !planEditorOpen && planDetailIndex === null && <div className="page-view">
        <header className="page-header"><div><p className="eyebrow">WEEK 33</p><h1>本周训练</h1></div><button className="square-button" onClick={() => openPlanEditor(4)} aria-label="编辑训练计划">✎</button></header>
        <div className="week-summary comic-card"><div><strong>{weekPlan.filter((day) => day.state === "已完成").length}/4</strong><span>本周完成</span></div><Sprite sheet="training" col={1} row={2} className="week-mascot" /></div>
        <p className="tap-hint">周一到周日都可以查看；编辑时可修改动作、组数、次数和重量。</p>
        <div className="plan-list">{weekPlan.map((item, index) => <button className={`plan-row ${item.state === "今日" ? "current" : ""}`} key={item.day} onClick={() => setPlanDetailIndex(index)}><span className="day-label">{item.short}</span><span className="plan-copy"><strong>{item.day} · {item.name}</strong><small>{item.exercises.length ? `${item.exercises.length}个动作 · ${item.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)}组` : "恢复与休息"}</small></span><em>{item.state === "今日" ? "今天 ›" : `${item.state} ›`}</em></button>)}</div>
      </div>}

      {tab === "training" && !workoutOpen && !planEditorOpen && planDetailIndex !== null && <div className="subpage">
        <header className="subpage-header"><button onClick={() => setPlanDetailIndex(null)} aria-label="返回本周训练">←</button><span>{weekPlan[planDetailIndex].day}计划</span><button onClick={() => openPlanEditor(planDetailIndex)} aria-label="编辑当天计划">编辑</button></header>
        <section className="plan-detail-hero"><div><p className="eyebrow">{weekPlan[planDetailIndex].state === "今日" ? "TODAY" : "WEEKLY PLAN"}</p><h1>{weekPlan[planDetailIndex].name}</h1><p>{weekPlan[planDetailIndex].exercises.length ? `${weekPlan[planDetailIndex].exercises.length}个动作，点击下方开始即可追踪` : "今天安排恢复，让身体好好充电。"}</p></div><Sprite sheet="training" col={planDetailIndex % 2} row={planDetailIndex % 3} className={`detail-mascot ${planDetailIndex % 2 === 0 && planDetailIndex % 3 === 1 ? "mask-lower-cell" : ""}`} /></section>
        {weekPlan[planDetailIndex].exercises.length ? <div className="detail-exercises">{weekPlan[planDetailIndex].exercises.map((exercise, index) => <article key={exercise.id}><span>0{index + 1}</span><div><strong>{exercise.name}</strong><small>{exercise.sets}组 × {exercise.reps}次 · {exercise.weight}</small></div></article>)}<button className="primary-action detail-start" onClick={() => beginWorkout(planDetailIndex)}>开始这次训练 <span>→</span></button></div> : <div className="rest-day-card"><Sprite sheet="training" col={0} row={2} className="rest-mascot" /><strong>恢复也是计划的一部分</strong><p>散步、拉伸或完全休息都可以。</p></div>}
      </div>}

      {planEditorOpen && <div className="editor-screen">
        <header className="subpage-header"><button onClick={() => setPlanEditorOpen(false)} aria-label="关闭训练编辑">×</button><span>编辑每周训练</span><button onClick={() => { setWeekPlan(planDraft); setPlanEditorOpen(false); showToast("完整周计划已保存"); }} aria-label="保存训练计划">保存</button></header>
        <div className="editor-day-tabs">{planDraft.map((day, index) => <button className={planEditorDay === index ? "active" : ""} onClick={() => setPlanEditorDay(index)} key={day.day}><span>{day.short}</span><small>{day.exercises.length || "休"}</small></button>)}</div>
        <section className="day-editor">
          <label className="field-label">计划名称<input value={planDraft[planEditorDay].name} onChange={(event) => updateDraftDay({ name: event.target.value })} /></label>
          <div className="day-kind"><button className={planDraft[planEditorDay].exercises.length ? "active" : ""} onClick={() => { if (!planDraft[planEditorDay].exercises.length) updateDraftDay({ exercises: [{ id: Date.now(), name: "新动作", sets: 3, reps: 12, weight: "自重" }], state: planEditorDay === 4 ? "今日" : "待完成" }); }}>训练日</button><button className={!planDraft[planEditorDay].exercises.length ? "active" : ""} onClick={() => updateDraftDay({ exercises: [], state: "休息" })}>休息日</button></div>
          {planDraft[planEditorDay].exercises.map((exercise, exerciseIndex) => <article className="exercise-editor" key={exercise.id}><div className="editor-number">0{exerciseIndex + 1}</div><label>动作名称<input value={exercise.name} onChange={(event) => updateDraftExercise(exerciseIndex, { name: event.target.value })} /></label><div className="exercise-fields"><label>组数<input inputMode="numeric" value={exercise.sets} onChange={(event) => updateDraftExercise(exerciseIndex, { sets: Math.max(1, Number(event.target.value) || 1) })} /></label><label>次数<input inputMode="numeric" value={exercise.reps} onChange={(event) => updateDraftExercise(exerciseIndex, { reps: Math.max(1, Number(event.target.value) || 1) })} /></label><label>重量<input value={exercise.weight} onChange={(event) => updateDraftExercise(exerciseIndex, { weight: event.target.value })} /></label></div><button className="remove-exercise" onClick={() => updateDraftDay({ exercises: planDraft[planEditorDay].exercises.filter((_, index) => index !== exerciseIndex) })}>移除此动作</button></article>)}
          {planDraft[planEditorDay].exercises.length > 0 && <button className="add-exercise" onClick={() => updateDraftDay({ exercises: [...planDraft[planEditorDay].exercises, { id: Date.now(), name: "新动作", sets: 3, reps: 12, weight: "自重" }] })}>＋ 添加训练动作</button>}
        </section>
      </div>}

      {workoutOpen && <div className="workout-screen">
        <div className="workout-scroll" onScroll={(event) => setWorkoutCompact(event.currentTarget.scrollTop > 36)}>
          <header className={`workout-clock ${workoutCompact ? "compact" : ""}`}>
            <button className="clock-back" onClick={leaveWorkout} aria-label="返回今日">←</button>
            <div className="clock-display"><span>训练时间</span><strong>{formatTime(elapsed)}</strong><small>{workoutCompact ? "" : "向上滑动查看训练项目"}</small></div>
            <button className="clock-toggle" onClick={() => setWorkoutRunning((value) => !value)}>{workoutRunning ? "暂停" : elapsed > 0 ? "继续" : "开始计时"}</button>
          </header>
          <div className="workout-body">
            <div className="workout-title"><div><p className="eyebrow">{activePlan.day} · SESSION</p><h1>{activePlan.name}</h1></div><span>{completed}/{activeSetCount} 组</span></div>
            <div className="exercise-list">{activePlan.exercises.map((exercise, exerciseIndex) => {
              const start = activePlan.exercises.slice(0, exerciseIndex).reduce((sum, item) => sum + item.sets, 0);
              return <article className="exercise-card" key={exercise.id}><div className="exercise-heading"><div><span>0{exerciseIndex + 1}</span><div><strong>{exercise.name}</strong><small>{exercise.sets}组 × {exercise.reps}次 · {exercise.weight}</small></div></div></div><div className="set-row">{Array.from({ length: exercise.sets }).map((_, setIndex) => {
                const index = start + setIndex;
                return <button aria-label={`${exercise.name}第${setIndex + 1}组${doneSets[index] ? "已完成" : "未完成"}`} className={doneSets[index] ? "done" : ""} onClick={() => setDoneSets((old) => old.map((value, itemIndex) => itemIndex === index ? !value : value))} key={setIndex}>{doneSets[index] ? "✓" : setIndex + 1}</button>;
              })}</div></article>;
            })}</div>
          </div>
        </div>
        <div className="workout-controls"><button className={rest ? "resting" : ""} onClick={() => setRest(rest ? 0 : 60)}><span>{rest ? formatTime(rest) : "01:00"}</span><small>{rest ? "点击取消" : "开始组间休息"}</small></button><button className={`finish-button ${allSetsDone ? "ready" : ""}`} onClick={finishWorkout} disabled={!allSetsDone}>完成训练</button></div>
      </div>}

      {tab === "food" && !foodEntryOpen && <div className="page-view">
        <header className="page-header"><div><p className="eyebrow">FOOD JOURNAL</p><h1>饮食日志</h1></div><button className="square-button dark" onClick={() => openFoodEntry()} aria-label="打开饮食记录页面">+</button></header>
        <div className="segmented">{(["day", "week", "month"] as const).map((view) => <button className={foodView === view ? "active" : ""} onClick={() => setFoodView(view)} key={view}>{view === "day" ? "日" : view === "week" ? "周" : "月"}</button>)}</div>
        <section className="nutrition-card comic-card"><div><span className="kicker">今日已记录</span><strong>{totalCalories.toLocaleString()}<small> kcal</small></strong></div><div className="macro-row"><span>P <b>{macros.protein}g</b></span><span>C <b>{macros.carbs}g</b></span><span>F <b>{macros.fat}g</b></span></div></section>
        {foodView === "day" && <div className="meal-list">{meals.map((meal) => <article className="food-row" key={meal.id}><MealVisual type={meal.type} className="food-thumb-art" /><div><strong>{meal.type}</strong><small>P {meal.protein || 0} · C {meal.carbs || 0} · F {meal.fat || 0}</small></div><b>{meal.calories} kcal</b></article>)}</div>}
        {foodView === "week" && <div className="food-week"><div className="week-labels">{["一", "二", "三", "四", "五", "六", "日"].map((day, index) => <span className={index === 4 ? "selected" : ""} key={day}>{day}</span>)}</div><div className="illustrated-calendar">{Array.from({ length: 14 }).map((_, index) => <button onClick={() => setFoodView("day")} className={index % 3 === 0 || index === 8 ? "has-food" : ""} key={index}>{index % 3 === 0 || index === 8 ? <img src="/rabbit-stamp.png" alt="已完成记录" className="calendar-stamp" /> : <span>+</span>}</button>)}</div><div className="calendar-story"><Sprite sheet="food" col={1} row={2} className="calendar-mascot" /><p><strong>周五 · 3条记录</strong>照片和营养数据一起回顾。</p></div></div>}
        {foodView === "month" && <div className="month-view"><div className="month-title"><button onClick={() => setMonthOffset((value) => value - 1)} aria-label="上个月">‹</button><strong>{shownMonth}</strong><button onClick={() => setMonthOffset((value) => value + 1)} aria-label="下个月">›</button></div><div className="month-grid">{Array.from({ length: 35 }).map((_, index) => <button onClick={() => setFoodView("day")} className={index < 4 ? "muted" : index === 17 ? "today" : index % 4 === 0 ? "logged" : ""} key={index}><span>{index < 4 ? 28 + index : index - 3}</span>{index % 4 === 0 && index >= 4 ? <img src="/rabbit-stamp.png" alt="已完成记录" className="month-stamp" /> : null}</button>)}</div><div className="month-summary"><Sprite sheet="food" col={0} row={2} className="month-mascot" /><p><strong>本月记录 18 天</strong>不是为了满分，只是帮你看见习惯。</p></div></div>}
      </div>}

      {foodEntryOpen && <div className="food-entry-screen">
        <header className="subpage-header"><button onClick={() => setFoodEntryOpen(false)} aria-label="返回饮食日志">←</button><span>记录一餐</span><i /></header>
        <div className="entry-intro"><div><p className="eyebrow">NEW FOOD ENTRY</p><h1>今天吃了什么？</h1><p>先放一张照片，也可以直接手动记录。</p></div><Sprite sheet="food" col={0} row={0} className="entry-mascot" /></div>
        <label className={`photo-upload-page ${photoReady ? "ready" : ""}`}><input type="file" accept="image/*" onChange={(event) => {
          const file = event.target.files?.[0]; if (!file) return;
          setPhotoReady(true); setPhotoUrl(URL.createObjectURL(file)); setAiState("idle");
        }} />{photoUrl ? <img src={photoUrl} alt="已选择的饮食照片" /> : <><span>＋</span><strong>拍照或选择图片</strong><small>支持 JPG、PNG</small></>}</label>
        <div className="mode-switch"><button className={mealMode === "ai" ? "active" : ""} onClick={() => setMealMode("ai")}>AI辅助估算</button><button className={mealMode === "manual" ? "active" : ""} onClick={() => { setMealMode("manual"); setAiState("idle"); setCalories(""); setProtein(""); setCarbs(""); setFat(""); }}>手动输入</button></div>
        {mealMode === "ai" && <section className="ai-panel"><div><strong>AI辅助估算</strong><span className="demo-badge">DEMO</span></div><p>当前版本演示识别流程，结果不是实际模型计算。正式版会上传照片分析食物和份量，并要求用户确认。</p><button onClick={runAiDemo} disabled={aiState === "analyzing"}>{aiState === "analyzing" ? "正在分析…" : aiState === "ready" ? "重新演示识别" : "开始演示识别"}</button>{aiState === "ready" && <small>演示置信度 78% · 建议根据实际份量修改</small>}</section>}
        {(mealMode === "manual" || aiState === "ready") && <div className="nutrition-form"><div className="calorie-input"><label>热量<input inputMode="numeric" value={calories} onChange={(event) => setCalories(event.target.value)} placeholder="0" /></label><span>kcal</span></div><div className="macro-inputs"><label>蛋白质<input inputMode="numeric" value={protein} onChange={(event) => setProtein(event.target.value)} placeholder="可选" /></label><label>碳水<input inputMode="numeric" value={carbs} onChange={(event) => setCarbs(event.target.value)} placeholder="可选" /></label><label>脂肪<input inputMode="numeric" value={fat} onChange={(event) => setFat(event.target.value)} placeholder="可选" /></label></div></div>}
        <div className="meal-types">{["早餐", "午餐", "晚餐", "零食"].map((type) => <button className={mealType === type ? "active" : ""} onClick={() => setMealType(type)} key={type}>{type}</button>)}</div>
        <button className="primary-action entry-save" onClick={saveMeal} disabled={!Number(calories)}>保存到饮食日志 <span>→</span></button>
      </div>}

      {tab === "profile" && <div className="page-view">
        <header className="page-header"><div><p className="eyebrow">PROFILE</p><h1>我的</h1></div><button className="square-button" onClick={() => setInfoModal({ title: "设置", body: "账号、隐私与数据设置将在正式版中集中管理。当前 Demo 的记录只保存在本设备。" })} aria-label="设置">⚙</button></header>
        <section className="profile-hero"><div><span className="kicker">训练日志者</span><h2>Mia</h2><p>目标：增肌与体能</p></div><Sprite sheet="today" col={1} row={0} className="profile-mascot" /></section>
        <div className="body-stats"><article><strong>165</strong><span>cm</span><small>身高</small></article><article><strong>56.8</strong><span>kg</span><small>体重</small></article><article><strong>4</strong><span>次</span><small>周目标</small></article></div>
        <section className="profile-list"><button onClick={() => setInfoModal({ title: "健身目标", body: "当前目标：增肌与体能。正式版可在这里修改目标，但不会自动生成训练或饮食计划。" })}><span>◎</span><div><strong>健身目标</strong><small>增肌与体能</small></div><em>›</em></button><button onClick={() => setInfoModal({ title: "单位设置", body: "当前使用 kg、cm 和 kcal。Demo 已统一采用公制单位。" })}><span>⇄</span><div><strong>单位设置</strong><small>kg · cm · kcal</small></div><em>›</em></button><button onClick={() => { setNotificationsOn((value) => !value); showToast(notificationsOn ? "计时提醒已关闭" : "计时提醒已开启"); }}><span>◷</span><div><strong>计时提醒</strong><small>训练与组间通知</small></div><em>{notificationsOn ? "●" : "○"}</em></button><button onClick={() => showToast("离线模式已准备就绪")}><span>↓</span><div><strong>离线模式</strong><small>PWA 已准备就绪</small></div><em>✓</em></button></section><p className="privacy-note">记录用于帮你回顾，不是身体评分。</p>
      </div>}

      {infoModal && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={infoModal.title}><div className="info-modal"><div className="modal-handle" /><header><h2>{infoModal.title}</h2><button onClick={() => setInfoModal(null)} aria-label="关闭">×</button></header><p>{infoModal.body}</p><button className="primary-action" onClick={() => setInfoModal(null)}>知道了 <span>✓</span></button></div></div>}
      {!workoutOpen && !foodEntryOpen && !planEditorOpen && <nav className="bottom-nav" aria-label="主导航">{nav.map((item) => <button className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setPlanDetailIndex(null); }} key={item.id}><span>{item.icon}</span>{item.label}</button>)}</nav>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </section></main>
  );
}
