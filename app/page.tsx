"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";

type Tab = "today" | "training" | "food" | "profile";
type Exercise = { id: number; name: string; sets: number; reps: number; weight: string };
type TrainingCategory = "upper_push" | "stretch" | "back" | "walk" | "glutes" | "full_body" | "rest";
type PlanDay = { day: string; short: string; name: string; category: TrainingCategory; state: "已完成" | "今日" | "待完成" | "休息"; exercises: Exercise[] };
type Meal = { id: number; type: string; name: string; calories: number; protein?: number; carbs?: number; fat?: number; createdAt: string; photo?: string; favorite?: boolean };
type WorkoutRecord = { id: number; date: string; day: string; name: string; category: TrainingCategory; duration: number; completedSets: number; totalSets: number; exercises: Exercise[]; note: string };
type UserProfile = { name: string; height: string; weight: string; goal: string; unit: "metric" | "imperial" };
type AiFoodItem = { id: number; name: string; portion: string; calories: number; protein: number; carbs: number; fat: number };
type ExerciseTrend = { name: string; category: TrainingCategory; currentWeight: string; sessions: number; points: { date: string; weight: number }[] };

const STORAGE_KEY = "long-ear-log-v7";
const APP_TODAY_KEY = "2026-08-14";
const initialProfile: UserProfile = { name: "Mia", height: "165", weight: "56.8", goal: "增肌与体能", unit: "metric" };
const initialMeals: Meal[] = [
  { id: 1, type: "早餐", name: "燕麦酸奶杯", calories: 430, protein: 24, carbs: 48, fat: 16, createdAt: "2026-08-14T08:10:00", favorite: true },
  { id: 2, type: "午餐", name: "鸡肉蔬菜饭", calories: 620, protein: 38, carbs: 72, fat: 20, createdAt: "2026-08-14T12:35:00" },
  { id: 3, type: "零食", name: "酸奶", calories: 120, protein: 7, carbs: 16, fat: 3, createdAt: "2026-08-14T15:20:00", favorite: true },
  { id: 4, type: "零食", name: "拿铁", calories: 80, protein: 1, carbs: 11, fat: 4, createdAt: "2026-08-14T17:05:00" },
];

const initialWorkoutHistory: WorkoutRecord[] = [
  { id: 101, date: "2026-08-11T10:20:00.000Z", day: "周一", name: "上肢推", category: "upper_push", duration: 2480, completedSets: 11, totalSets: 11, exercises: [], note: "最后一组稍吃力。" },
  { id: 102, date: "2026-08-13T10:05:00.000Z", day: "周三", name: "背部训练", category: "back", duration: 2715, completedSets: 11, totalSets: 11, exercises: [], note: "节奏稳定。" },
];

const gluteExercises: Exercise[] = [
  { id: 1, name: "杠铃臀推", sets: 4, reps: 10, weight: "40kg" },
  { id: 2, name: "罗马尼亚硬拉", sets: 4, reps: 10, weight: "30kg" },
  { id: 3, name: "保加利亚分腿蹲", sets: 4, reps: 12, weight: "8kg" },
  { id: 4, name: "坐姿外展", sets: 3, reps: 15, weight: "35kg" },
];

const initialWeekPlan: PlanDay[] = [
  { day: "周一", short: "一", name: "上肢推", category: "upper_push", state: "已完成", exercises: [
    { id: 11, name: "哑铃卧推", sets: 4, reps: 10, weight: "8kg" },
    { id: 12, name: "坐姿推肩", sets: 4, reps: 10, weight: "6kg" },
    { id: 13, name: "绳索下压", sets: 3, reps: 12, weight: "15kg" },
  ]},
  { day: "周二", short: "二", name: "恢复与拉伸", category: "stretch", state: "休息", exercises: [] },
  { day: "周三", short: "三", name: "背部训练", category: "back", state: "已完成", exercises: [
    { id: 31, name: "高位下拉", sets: 4, reps: 10, weight: "25kg" },
    { id: 32, name: "坐姿划船", sets: 4, reps: 10, weight: "25kg" },
    { id: 33, name: "面拉", sets: 3, reps: 15, weight: "12kg" },
  ]},
  { day: "周四", short: "四", name: "散步恢复", category: "walk", state: "休息", exercises: [] },
  { day: "周五", short: "五", name: "臀腿训练", category: "glutes", state: "今日", exercises: gluteExercises },
  { day: "周六", short: "六", name: "全身循环", category: "full_body", state: "待完成", exercises: [
    { id: 61, name: "壶铃深蹲", sets: 3, reps: 12, weight: "12kg" },
    { id: 62, name: "俯卧撑", sets: 3, reps: 10, weight: "自重" },
    { id: 63, name: "农夫行走", sets: 3, reps: 40, weight: "秒" },
  ]},
  { day: "周日", short: "日", name: "完全休息", category: "rest", state: "休息", exercises: [] },
];

const mealArt: Record<string, string> = {
  早餐: "/rabbit-breakfast.png",
  午餐: "/rabbit-lunch.png",
  晚餐: "/rabbit-dinner.png",
  零食: "/rabbit-snack.png",
};

const mealStatusClass: Record<string, string> = { 早餐: "breakfast", 午餐: "lunch", 晚餐: "dinner", 零食: "snack" };

const trainingCategoryOptions: { id: TrainingCategory; label: string; image: string }[] = [
  { id: "upper_push", label: "上肢推", image: "/rabbit-upper-push.png" },
  { id: "back", label: "上肢拉／背部", image: "/rabbit-back.png" },
  { id: "glutes", label: "臀腿", image: "/rabbit-squat-standalone.png" },
  { id: "full_body", label: "全身／核心／循环", image: "/rabbit-full-body.png" },
  { id: "walk", label: "有氧／跑步／散步", image: "/rabbit-walk.png" },
  { id: "stretch", label: "拉伸／瑜伽／主动恢复", image: "/rabbit-stretch.png" },
  { id: "rest", label: "完全休息", image: "/rabbit-rest.png" },
];

const planArt = Object.fromEntries(trainingCategoryOptions.map((option) => [option.id, option.image])) as Record<TrainingCategory, string>;

function suggestTrainingCategory(name: string, hasExercises: boolean): TrainingCategory {
  if (/散步|走路|步行|跑步|慢跑|有氧/.test(name)) return "walk";
  if (/拉伸|瑜伽|灵活|恢复/.test(name)) return "stretch";
  if (/臀|腿|下肢|深蹲/.test(name)) return "glutes";
  if (/背|划船|下拉|上肢拉/.test(name)) return "back";
  if (/胸|肩|手臂|上肢|推/.test(name)) return "upper_push";
  if (/全身|循环|核心|HIIT|体能/.test(name)) return "full_body";
  if (/完全休息|休息|睡眠/.test(name)) return "rest";
  return hasExercises ? "full_body" : "rest";
}

function getPlanArt(day: PlanDay) {
  return planArt[day.category || suggestTrainingCategory(day.name, day.exercises.length > 0)];
}

function formatTime(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

function numericWeight(value: string) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateTimeForKey(key: string) {
  const now = new Date();
  return `${key}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

function buildMonthCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return { key: toDateKey(date), day: date.getDate(), current: date.getMonth() === monthIndex };
  });
}

function MealVisual({ type, className = "" }: { type: string; className?: string }) {
  return <img src={mealArt[type] || mealArt.早餐} alt="" className={className} />;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [weekPlan, setWeekPlan] = useState<PlanDay[]>(initialWeekPlan);
  const [planDetailIndex, setPlanDetailIndex] = useState<number | null>(null);
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planEditorDay, setPlanEditorDay] = useState(4);
  const [planDraft, setPlanDraft] = useState<PlanDay[]>(initialWeekPlan);
  const [categoryManual, setCategoryManual] = useState<boolean[]>(Array(7).fill(false));
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(4);
  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [timerAnchor, setTimerAnchor] = useState<number | null>(null);
  const [workoutCompact, setWorkoutCompact] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(0);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [doneSets, setDoneSets] = useState<boolean[]>(Array(15).fill(false));
  const [workoutDone, setWorkoutDone] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>(initialWorkoutHistory);
  const [trainingView, setTrainingView] = useState<"plan" | "history" | "data">("plan");
  const [selectedExerciseName, setSelectedExerciseName] = useState("杠铃臀推");
  const [workoutRecordId, setWorkoutRecordId] = useState<number | null>(null);
  const [workoutSummaryId, setWorkoutSummaryId] = useState<number | null>(null);
  const [foodView, setFoodView] = useState<"day" | "week" | "month">("week");
  const [foodEntryOpen, setFoodEntryOpen] = useState(false);
  const [mealGroupOpen, setMealGroupOpen] = useState<string | null>(null);
  const [mealDetailId, setMealDetailId] = useState<number | null>(null);
  const [editingMealId, setEditingMealId] = useState<number | null>(null);
  const [selectedFoodDate, setSelectedFoodDate] = useState(APP_TODAY_KEY);
  const [monthOffset, setMonthOffset] = useState(0);
  const [mealMode, setMealMode] = useState<"ai" | "manual">("ai");
  const [photoReady, setPhotoReady] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [aiState, setAiState] = useState<"idle" | "analyzing" | "review" | "ready">("idle");
  const [aiItems, setAiItems] = useState<AiFoodItem[]>([]);
  const [mealType, setMealType] = useState("晚餐");
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [toast, setToast] = useState("");
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [profileDraft, setProfileDraft] = useState<UserProfile>(initialProfile);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [dataCenterOpen, setDataCenterOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const todayPlan = weekPlan[4];
  const activePlan = weekPlan[activeWorkoutDay];
  const weekTrainingCount = weekPlan.filter((day) => day.exercises.length > 0).length;
  const weekCompleted = weekPlan.filter((day) => day.exercises.length > 0 && day.state === "已完成").length;
  const weekIsComplete = weekTrainingCount > 0 && weekCompleted >= weekTrainingCount;
  const weekProgressArt = weekCompleted === 0 ? "/rabbit-week-start.png" : weekIsComplete ? "/rabbit-week-complete.png" : "/rabbit-week-progress.png";
  const activeSetCount = activePlan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const completed = doneSets.filter(Boolean).length;
  const hasActiveTodaySession = activeWorkoutDay === 4 && (elapsed > 0 || completed > 0);
  const allSetsDone = activeSetCount > 0 && completed === activeSetCount;
  const todayMeals = useMemo(() => meals.filter((meal) => toDateKey(meal.createdAt) === APP_TODAY_KEY), [meals]);
  const selectedDayMeals = useMemo(() => meals.filter((meal) => toDateKey(meal.createdAt) === selectedFoodDate), [meals, selectedFoodDate]);
  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalCalories = selectedDayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const macros = useMemo(() => selectedDayMeals.reduce((sum, meal) => ({
    protein: sum.protein + (meal.protein || 0), carbs: sum.carbs + (meal.carbs || 0), fat: sum.fat + (meal.fat || 0),
  }), { protein: 0, carbs: 0, fat: 0 }), [selectedDayMeals]);
  const selectedMeal = mealDetailId === null ? null : meals.find((meal) => meal.id === mealDetailId) || null;
  const selectedWorkoutRecord = workoutRecordId === null ? null : workoutHistory.find((record) => record.id === workoutRecordId) || null;
  const summaryRecord = workoutSummaryId === null ? null : workoutHistory.find((record) => record.id === workoutSummaryId) || null;
  const recentMeals = useMemo(() => {
    const seen = new Set<string>();
    return [...meals].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((meal) => {
      const key = `${meal.name}-${meal.calories}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }, [meals]);
  const favoriteMeals = useMemo(() => meals.filter((meal) => meal.favorite).slice(0, 4), [meals]);
  const weekFoodRecords: { day: string; calories: number; mealTypes: string[] }[] = [
    { day: "周一", calories: 1380, mealTypes: ["早餐", "午餐", "晚餐"] },
    { day: "周二", calories: 0, mealTypes: [] },
    { day: "周三", calories: 980, mealTypes: ["早餐", "晚餐"] },
    { day: "周四", calories: 0, mealTypes: [] },
    { day: "周五", calories: todayCalories, mealTypes: [...new Set(todayMeals.map((meal) => meal.type))] },
    { day: "周六", calories: 0, mealTypes: [] },
    { day: "周日", calories: 1120, mealTypes: ["早餐", "午餐", "晚餐", "零食"] },
  ];
  const recordDateKeys = useMemo(() => new Set(meals.map((meal) => toDateKey(meal.createdAt))), [meals]);
  const shownMonthDate = useMemo(() => new Date(2026, 7 + monthOffset, 1), [monthOffset]);
  const monthCells = useMemo(() => buildMonthCells(shownMonthDate), [shownMonthDate]);
  const shownMonth = `${shownMonthDate.getFullYear()}年${shownMonthDate.getMonth() + 1}月`;
  const monthRecordCount = [...recordDateKeys].filter((key) => key.startsWith(`${shownMonthDate.getFullYear()}-${String(shownMonthDate.getMonth() + 1).padStart(2, "0")}`)).length;
  const totalWorkoutSeconds = workoutHistory.reduce((sum, record) => sum + record.duration, 0);
  const recordedFoodDays = new Set(meals.map((meal) => toDateKey(meal.createdAt))).size;
  const averageCalories = recordedFoodDays ? Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0) / recordedFoodDays) : 0;
  const exerciseDatabase = useMemo<ExerciseTrend[]>(() => {
    const currentExercises = weekPlan.flatMap((day) => day.exercises.map((exercise) => ({ ...exercise, category: day.category })));
    return currentExercises.map((exercise) => {
      const actualPoints = [...workoutHistory].reverse().flatMap((record) => record.exercises.filter((item) => item.name === exercise.name && numericWeight(item.weight) > 0).map((item) => ({ date: record.date, weight: numericWeight(item.weight) })));
      const current = numericWeight(exercise.weight);
      const demoDates = ["2026-07-20", "2026-07-27", "2026-08-03", "2026-08-10"];
      const demoPoints = current > 0 ? [0.72, 0.82, 0.91, 1].map((ratio, index) => ({ date: demoDates[index], weight: Math.max(1, Math.round(current * ratio * 2) / 2) })) : [];
      return { name: exercise.name, category: exercise.category, currentWeight: exercise.weight, sessions: actualPoints.length, points: actualPoints.length >= 2 ? actualPoints : demoPoints };
    });
  }, [weekPlan, workoutHistory]);
  const selectedExercise = exerciseDatabase.find((exercise) => exercise.name === selectedExerciseName) || exerciseDatabase[0];
  const totalCompletedSets = workoutHistory.reduce((sum, record) => sum + record.completedSets, 0);
  const trendWeights = selectedExercise?.points.map((point) => point.weight) || [];
  const trendMin = trendWeights.length ? Math.min(...trendWeights) : 0;
  const trendMax = trendWeights.length ? Math.max(...trendWeights) : 1;
  const trendRange = Math.max(1, trendMax - trendMin);
  const trendPolyline = selectedExercise?.points.map((point, index, points) => `${20 + index * (260 / Math.max(1, points.length - 1))},${105 - ((point.weight - trendMin) / trendRange) * 75}`).join(" ") || "";

  /* localStorage hydration intentionally initializes the related UI states together. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (Array.isArray(data.weekPlan)) setWeekPlan(data.weekPlan);
        if (Array.isArray(data.meals)) setMeals(data.meals);
        if (Array.isArray(data.workoutHistory)) setWorkoutHistory(data.workoutHistory);
        if (Array.isArray(data.doneSets)) setDoneSets(data.doneSets);
        if (typeof data.activeWorkoutDay === "number") setActiveWorkoutDay(data.activeWorkoutDay);
        if (typeof data.elapsed === "number") setElapsed(data.elapsed);
        if (typeof data.workoutDone === "boolean") setWorkoutDone(data.workoutDone);
        if (typeof data.notificationsOn === "boolean") setNotificationsOn(data.notificationsOn);
        if (data.profile && typeof data.profile.name === "string") { setProfile(data.profile); setProfileDraft(data.profile); }
        if (typeof data.signedIn === "boolean") setSignedIn(data.signedIn);
        if (typeof data.accountEmail === "string") setAccountEmail(data.accountEmail);
        if (typeof data.workoutOpen === "boolean") setWorkoutOpen(data.workoutOpen);
        if (typeof data.workoutRunning === "boolean") setWorkoutRunning(data.workoutRunning);
        if (typeof data.timerAnchor === "number") {
          setTimerAnchor(data.timerAnchor);
          if (data.workoutRunning) setElapsed(Math.max(data.elapsed || 0, Math.floor((Date.now() - data.timerAnchor) / 1000)));
        }
        if (typeof data.restEndsAt === "number" && data.restEndsAt > Date.now()) {
          setRestEndsAt(data.restEndsAt);
          setRest(Math.ceil((data.restEndsAt - Date.now()) / 1000));
        }
      }
    } catch { /* keep demo defaults if local data is damaged */ }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ weekPlan, meals, workoutHistory, doneSets, activeWorkoutDay, elapsed, workoutDone, notificationsOn, workoutOpen, workoutRunning, timerAnchor, restEndsAt, profile, signedIn, accountEmail })); } catch { /* image storage may exceed an older browser quota */ }
  }, [hydrated, weekPlan, meals, workoutHistory, doneSets, activeWorkoutDay, elapsed, workoutDone, notificationsOn, workoutOpen, workoutRunning, timerAnchor, restEndsAt, profile, signedIn, accountEmail]);
  useEffect(() => {
    if (!workoutRunning || timerAnchor === null) return;
    const update = () => setElapsed(Math.max(0, Math.floor((Date.now() - timerAnchor) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [workoutRunning, timerAnchor]);
  useEffect(() => {
    if (!restEndsAt) return;
    const update = () => {
      const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
      setRest(remaining);
      if (!remaining) setRestEndsAt(null);
    };
    update();
    const timer = window.setInterval(update, 500);
    return () => window.clearInterval(timer);
  }, [restEndsAt]);

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
      setElapsed(0); setRest(0); setTimerAnchor(null); setRestEndsAt(null);
    }
    setActiveWorkoutDay(dayIndex);
    setWorkoutRunning(false);
    setWorkoutCompact(false);
    setWorkoutOpen(true);
    setPlanDetailIndex(null);
  }

  function leaveWorkout() {
    setWorkoutRunning(false);
    setTimerAnchor(null);
    setWorkoutOpen(false);
    setPlanDetailIndex(null);
    setTab("today");
  }

  function finishWorkout() {
    if (!allSetsDone) return;
    const record: WorkoutRecord = { id: Date.now(), date: new Date().toISOString(), day: activePlan.day, name: activePlan.name, category: activePlan.category, duration: elapsed, completedSets: completed, totalSets: activeSetCount, exercises: activePlan.exercises.map((exercise) => ({ ...exercise })), note: "" };
    setWorkoutRunning(false);
    setTimerAnchor(null);
    setRestEndsAt(null);
    setWorkoutOpen(false);
    setWorkoutHistory((current) => [record, ...current]);
    setWeekPlan((current) => current.map((day, index) => index === activeWorkoutDay ? { ...day, state: "已完成" } : day));
    if (activeWorkoutDay === 4) setWorkoutDone(true);
    setWorkoutSummaryId(record.id);
    setTab("training");
  }

  function toggleWorkoutTimer() {
    if (workoutRunning) {
      setWorkoutRunning(false);
      setTimerAnchor(null);
      return;
    }
    setTimerAnchor(Date.now() - elapsed * 1000);
    setWorkoutRunning(true);
  }

  function toggleRestTimer() {
    if (restEndsAt) { setRestEndsAt(null); setRest(0); return; }
    setRest(60);
    setRestEndsAt(Date.now() + 60000);
  }

  function openPlanEditor(dayIndex = 4) {
    setPlanDraft(weekPlan.map((day) => ({ ...day, category: day.category || suggestTrainingCategory(day.name, day.exercises.length > 0), exercises: day.exercises.map((exercise) => ({ ...exercise })) })));
    setCategoryManual(Array(7).fill(false));
    setPlanEditorDay(dayIndex);
    setPlanEditorOpen(true);
  }

  function updateDraftDay(patch: Partial<PlanDay>) {
    setPlanDraft((current) => current.map((day, index) => index === planEditorDay ? { ...day, ...patch } : day));
  }

  function updateDraftName(name: string) {
    const day = planDraft[planEditorDay];
    updateDraftDay({ name, category: categoryManual[planEditorDay] ? day.category : suggestTrainingCategory(name, day.exercises.length > 0) });
  }

  function selectDraftCategory(category: TrainingCategory) {
    setCategoryManual((current) => current.map((manual, index) => index === planEditorDay ? true : manual));
    updateDraftDay({ category });
  }

  function updateDraftExercise(exerciseIndex: number, patch: Partial<Exercise>) {
    setPlanDraft((current) => current.map((day, dayIndex) => dayIndex === planEditorDay ? {
      ...day, exercises: day.exercises.map((exercise, index) => index === exerciseIndex ? { ...exercise, ...patch } : exercise),
    } : day));
  }

  function openFoodEntry(type = "晚餐", meal?: Meal) {
    setMealGroupOpen(null);
    setMealDetailId(null);
    setEditingMealId(meal?.id || null);
    if (meal) setMealMode("manual");
    setMealType(meal?.type || type); setFoodEntryOpen(true); setAiState("idle");
    setMealName(meal?.name || ""); setCalories(meal ? String(meal.calories) : ""); setProtein(meal?.protein ? String(meal.protein) : ""); setCarbs(meal?.carbs ? String(meal.carbs) : ""); setFat(meal?.fat ? String(meal.fat) : "");
    setPhotoUrl(meal?.photo || ""); setPhotoReady(Boolean(meal?.photo));
  }

  function runAiDemo() {
    if (!photoReady) { showToast("请先选择一张饮食照片"); return; }
    setAiState("analyzing");
    window.setTimeout(() => {
      setAiItems([
        { id: 1, name: "鸡胸肉", portion: "150g", calories: 248, protein: 46, carbs: 0, fat: 5 },
        { id: 2, name: "米饭", portion: "180g", calories: 209, protein: 4, carbs: 47, fat: 1 },
        { id: 3, name: "西兰花", portion: "100g", calories: 34, protein: 3, carbs: 7, fat: 0 },
      ]);
      setAiState("review");
    }, 850);
  }

  function useDemoFoodPhoto() {
    setPhotoUrl("/rabbit-lunch.png");
    setPhotoReady(true);
    setAiState("idle");
    showToast("已放入示例照片");
  }

  function confirmAiEstimate() {
    const result = aiItems.reduce((sum, item) => ({ calories: sum.calories + item.calories, protein: sum.protein + item.protein, carbs: sum.carbs + item.carbs, fat: sum.fat + item.fat }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    setMealName(aiItems.map((item) => item.name).join("、"));
    setCalories(String(result.calories)); setProtein(String(result.protein)); setCarbs(String(result.carbs)); setFat(String(result.fat)); setAiState("ready");
  }

  function saveMeal() {
    const value = Number(calories);
    if (!value) return;
    const existing = editingMealId ? meals.find((meal) => meal.id === editingMealId) : null;
    const meal: Meal = { id: editingMealId || Date.now(), type: mealType, name: mealName.trim() || `${mealType}记录`, calories: value, protein: Number(protein) || undefined, carbs: Number(carbs) || undefined, fat: Number(fat) || undefined, createdAt: existing?.createdAt || dateTimeForKey(selectedFoodDate), photo: photoUrl || undefined, favorite: existing?.favorite };
    setMeals((current) => editingMealId ? current.map((item) => item.id === editingMealId ? meal : item) : [...current, meal]);
    setFoodEntryOpen(false); setEditingMealId(null); setPhotoReady(false); setPhotoUrl(""); setMealDetailId(editingMealId || meal.id); setTab("food"); setFoodView("day"); showToast(editingMealId ? "饮食记录已更新" : `${mealType}已增加一条记录`);
  }

  function quickAddMeal(template: Meal) {
    // eslint-disable-next-line react-hooks/purity -- generated only in response to a user action.
    const copy = { ...template, id: Date.now(), type: mealType, createdAt: dateTimeForKey(selectedFoodDate), photo: undefined };
    setMeals((current) => [...current, copy]);
    setFoodEntryOpen(false); setTab("food"); setFoodView("day"); showToast(`${copy.name}已加入${mealType}`);
  }

  function deleteMeal(id: number) {
    setMeals((current) => current.filter((meal) => meal.id !== id));
    setMealDetailId(null); showToast("饮食记录已删除");
  }

  function deleteWorkoutRecord(id: number) {
    setWorkoutHistory((current) => current.filter((record) => record.id !== id));
    setWorkoutRecordId(null); showToast("训练记录已删除");
  }

  function downloadData(filename: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function exportJson() {
    downloadData("long-ear-log-backup.json", JSON.stringify({ exportedAt: new Date().toISOString(), profile, weekPlan, meals, workoutHistory }, null, 2), "application/json");
    showToast("JSON 备份已导出");
  }

  function exportCsv() {
    const escape = (value: string | number | undefined) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [["日期", "餐别", "名称", "热量(kcal)", "蛋白质(g)", "碳水(g)", "脂肪(g)"], ...meals.map((meal) => [toDateKey(meal.createdAt), meal.type, meal.name, meal.calories, meal.protein || "", meal.carbs || "", meal.fat || ""])];
    downloadData("long-ear-log-meals.csv", rows.map((row) => row.map(escape).join(",")).join("\n"), "text/csv;charset=utf-8");
    showToast("饮食 CSV 已导出");
  }

  function resetLocalData() {
    window.localStorage.removeItem(STORAGE_KEY);
    setWeekPlan(initialWeekPlan); setMeals([]); setWorkoutHistory([]); setDoneSets(Array(15).fill(false)); setElapsed(0); setWorkoutDone(false); setProfile(initialProfile); setProfileDraft(initialProfile); setSignedIn(false); setAccountEmail(""); setConfirmResetOpen(false); setDataCenterOpen(false); showToast("个人记录已删除，演示计划已恢复");
  }

  function switchProfileUnit(unit: UserProfile["unit"]) {
    setProfileDraft((current) => {
      if (current.unit === unit) return current;
      const height = Number(current.height);
      const weight = Number(current.weight);
      return {
        ...current,
        unit,
        height: Number.isFinite(height) ? (unit === "imperial" ? height / 2.54 : height * 2.54).toFixed(1) : current.height,
        weight: Number.isFinite(weight) ? (unit === "imperial" ? weight * 2.20462 : weight / 2.20462).toFixed(1) : current.weight,
      };
    });
  }

  const nav = [
    { id: "today" as Tab, label: "今日", icon: "◉" }, { id: "training" as Tab, label: "训练", icon: "✓" },
    { id: "food" as Tab, label: "饮食", icon: "▦" }, { id: "profile" as Tab, label: "我的", icon: "☺" },
  ];

  if (!hydrated) return <main className="app-shell"><section className="phone-frame"><div className="app-loading"><span>LONG EAR LOG</span><strong>正在打开日志…</strong></div></section></main>;

  return (
    <main className="app-shell"><section className="phone-frame">
      {tab === "today" && !workoutOpen && !foodEntryOpen && <div className="page-view">
        <header className="topbar"><div><p className="eyebrow">8月14日 · 星期五</p><h1>早上好，{profile.name}</h1></div><button className="avatar" onClick={() => setTab("profile")} aria-label="打开个人资料">◌</button></header>
        <section className="hero-panel"><div><span className="chapter">今日 · CHAPTER 04</span><h2>{workoutDone ? "训练完成，记上一笔。" : "今天，动一点就好。"}</h2><p>本周已完成 {weekCompleted} / {weekTrainingCount} 次训练</p></div><img src={workoutDone ? "/rabbit-today-complete.png" : "/rabbit-today-wave.png"} alt="" className={`hero-mascot ${workoutDone ? "complete" : ""}`} /></section>
        <section className="workout-card comic-card"><div className="card-heading"><div><span className="kicker">今日训练</span><h3>{todayPlan.name}</h3><p>{todayPlan.exercises.length}个动作 · {todayPlan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)}组 · 约45分钟</p></div><span className="status-stamp">{workoutDone ? "DONE" : hasActiveTodaySession ? "SAVED" : "TODAY"}</span></div><div className="progress"><span style={{ width: workoutDone ? "100%" : `${Math.max(8, completed / Math.max(1, activeSetCount) * 100)}%` }} /></div><button className="primary-action" onClick={workoutDone ? () => { const latest = workoutHistory[0]; if (latest) { setWorkoutRecordId(latest.id); setTab("training"); } } : () => beginWorkout(4)}>{workoutDone ? "查看训练总结" : hasActiveTodaySession ? `继续训练 · ${completed}/${activeSetCount}组` : "开始训练"}<span>→</span></button></section>
        <section className="food-section"><div className="section-title"><div><span className="kicker">今日饮食</span><h3>{todayCalories.toLocaleString()} kcal</h3></div><button className="text-action" onClick={() => { setSelectedFoodDate(APP_TODAY_KEY); openFoodEntry(); }}>+记录饮食</button></div><div className="meal-grid">{["早餐", "午餐", "晚餐", "零食"].map((type) => {
          const entries = todayMeals.filter((meal) => meal.type === type);
          return <button className={`meal-card ${entries.length ? "" : "empty"}`} key={type} onClick={() => { setSelectedFoodDate(APP_TODAY_KEY); if (entries.length) setMealGroupOpen(type); else openFoodEntry(type); }}><div className="meal-photo"><MealVisual type={type} className="meal-art" /><span>{entries.length ? entries.reduce((sum, meal) => sum + meal.calories, 0) : "+"}</span></div><strong>{type}</strong><small>{entries.length ? `${entries.length}条 · ${entries.reduce((sum, meal) => sum + meal.calories, 0)} kcal` : "点击记录"}</small></button>;
        })}</div></section>
      </div>}

      {tab === "training" && !workoutOpen && !planEditorOpen && planDetailIndex === null && <div className="page-view">
        <header className="page-header"><div><p className="eyebrow">WEEK 33</p><h1>本周训练</h1></div><button className="square-button" onClick={() => openPlanEditor(4)} aria-label="编辑训练计划">✎</button></header>
        <div className="segmented training-segmented"><button className={trainingView === "plan" ? "active" : ""} onClick={() => setTrainingView("plan")}>本周计划</button><button className={trainingView === "history" ? "active" : ""} onClick={() => setTrainingView("history")}>训练历史</button><button className={trainingView === "data" ? "active" : ""} onClick={() => setTrainingView("data")}>训练数据</button></div>
        {trainingView === "plan" && <><div className="week-summary comic-card"><div><strong>{weekCompleted}/{weekTrainingCount}</strong><span>{weekTrainingCount ? "本周完成" : "尚未设置训练日"}</span></div><img src={weekProgressArt} alt="" className="week-mascot" /></div>
        <p className="tap-hint">周一到周日都可以查看；编辑时可修改动作、组数、次数和重量。</p>
        <div className="plan-list">{weekPlan.map((item, index) => <button className={`plan-row ${item.state === "今日" ? "current" : ""}`} key={item.day} onClick={() => setPlanDetailIndex(index)}><span className="day-label">{item.short}</span><span className="plan-copy"><strong>{item.day} · {item.name}</strong><small>{item.exercises.length ? `${item.exercises.length}个动作 · ${item.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)}组` : "恢复与休息"}</small></span><em>{item.state === "今日" ? "今天 ›" : `${item.state} ›`}</em></button>)}</div></>}
        {trainingView === "history" && <div className="history-list">{workoutHistory.length ? workoutHistory.map((record) => <button key={record.id} onClick={() => setWorkoutRecordId(record.id)}><img src={planArt[record.category]} alt="" /><span><strong>{record.name}</strong><small>{new Date(record.date).toLocaleDateString("zh-CN")} · {formatTime(record.duration)} · {record.completedSets}组</small></span><em>›</em></button>) : <div className="empty-state"><strong>还没有训练记录</strong><p>完成一次训练后会自动保存在这里。</p></div>}</div>}
        {trainingView === "data" && <div className="training-data-screen"><div className="training-data-intro"><p className="eyebrow">TRAINING DATABASE</p><h2>动作与重量</h2><p>从训练记录汇总每个动作，查看重量随时间的变化。</p></div><div className="training-overview"><article><strong>{workoutHistory.length}</strong><small>训练记录</small></article><article><strong>{totalCompletedSets}</strong><small>累计完成组</small></article><article><strong>{exerciseDatabase.length}</strong><small>动作数据库</small></article></div>{selectedExercise && <section className="exercise-trend-card"><header><div><span>当前动作</span><h3>{selectedExercise.name}</h3></div><strong>{selectedExercise.currentWeight}</strong></header><svg viewBox="0 0 300 130" role="img" aria-label={`${selectedExercise.name}重量变化图`}><line x1="20" y1="105" x2="280" y2="105" /><line x1="20" y1="25" x2="20" y2="105" /><polyline points={trendPolyline} />{selectedExercise.points.map((point, index, points) => <g key={`${point.date}-${index}`}><circle cx={20 + index * (260 / Math.max(1, points.length - 1))} cy={105 - ((point.weight - trendMin) / trendRange) * 75} r="4" /><text x={20 + index * (260 / Math.max(1, points.length - 1))} y="122" textAnchor="middle">{point.date.slice(5)}</text><text x={20 + index * (260 / Math.max(1, points.length - 1))} y={98 - ((point.weight - trendMin) / trendRange) * 75} textAnchor="middle">{point.weight}</text></g>)}</svg><p>{selectedExercise.sessions ? `${selectedExercise.sessions} 次真实训练记录` : "当前为演示趋势；完成训练后会改用真实重量记录"}</p></section>}<section className="exercise-database"><div className="data-section-title"><strong>全部动作</strong><small>{exerciseDatabase.length} 个</small></div>{exerciseDatabase.map((exercise) => <button className={selectedExercise?.name === exercise.name ? "active" : ""} onClick={() => setSelectedExerciseName(exercise.name)} key={exercise.name}><img src={planArt[exercise.category]} alt="" /><span><strong>{exercise.name}</strong><small>{exercise.sessions ? `${exercise.sessions}次记录` : "等待首次完成记录"}</small></span><b>{exercise.currentWeight}</b><em>›</em></button>)}</section></div>}
      </div>}

      {tab === "training" && !workoutOpen && !planEditorOpen && planDetailIndex !== null && <div className="subpage">
        <header className="subpage-header"><button onClick={() => setPlanDetailIndex(null)} aria-label="返回本周训练">←</button><span>{weekPlan[planDetailIndex].day}计划</span><button onClick={() => openPlanEditor(planDetailIndex)} aria-label="编辑当天计划">编辑</button></header>
        <section className="plan-detail-hero"><div><p className="eyebrow">{weekPlan[planDetailIndex].state === "今日" ? "TODAY" : "WEEKLY PLAN"}</p><h1>{weekPlan[planDetailIndex].name}</h1><p>{weekPlan[planDetailIndex].exercises.length ? `${weekPlan[planDetailIndex].exercises.length}个动作，点击下方开始即可追踪` : "今天安排恢复，让身体好好充电。"}</p></div><img src={getPlanArt(weekPlan[planDetailIndex])} alt="" className="detail-mascot standalone-detail-mascot" /></section>
        {weekPlan[planDetailIndex].exercises.length ? <div className="detail-exercises">{weekPlan[planDetailIndex].exercises.map((exercise, index) => <article key={exercise.id}><span>0{index + 1}</span><div><strong>{exercise.name}</strong><small>{exercise.sets}组 × {exercise.reps}次 · {exercise.weight}</small></div></article>)}<button className="primary-action detail-start" onClick={() => beginWorkout(planDetailIndex)}>开始这次训练 <span>→</span></button></div> : <div className="rest-day-card"><img src={getPlanArt(weekPlan[planDetailIndex])} alt="" className="rest-mascot standalone-detail-mascot" /><strong>恢复也是计划的一部分</strong><p>散步、拉伸或完全休息都可以。</p></div>}
      </div>}

      {summaryRecord && <div className="subpage record-screen">
        <header className="subpage-header"><button onClick={() => { setWorkoutSummaryId(null); setTab("today"); }} aria-label="返回今日">×</button><span>训练完成</span><i /></header>
        <section className="record-hero"><div><p className="eyebrow">SESSION COMPLETE</p><h1>{summaryRecord.name}</h1><p>{summaryRecord.day} · {new Date(summaryRecord.date).toLocaleDateString("zh-CN")}</p></div><img src="/rabbit-today-complete.png" alt="" className="record-mascot" /></section>
        <div className="record-stats"><article><strong>{formatTime(summaryRecord.duration)}</strong><small>训练时间</small></article><article><strong>{summaryRecord.completedSets}/{summaryRecord.totalSets}</strong><small>完成组数</small></article><article><strong>{summaryRecord.exercises.length}</strong><small>训练动作</small></article></div>
        <div className="record-exercises">{summaryRecord.exercises.map((exercise) => <article key={exercise.id}><strong>{exercise.name}</strong><small>{exercise.sets}组 × {exercise.reps}次 · {exercise.weight}</small></article>)}</div>
        <button className="primary-action" onClick={() => { setWorkoutSummaryId(null); setTrainingView("history"); setTab("training"); }}>保存并查看训练历史 <span>→</span></button>
        <button className="secondary-action" onClick={() => { setWorkoutSummaryId(null); setTab("today"); }}>返回今日</button>
      </div>}

      {selectedWorkoutRecord && <div className="subpage record-screen">
        <header className="subpage-header"><button onClick={() => setWorkoutRecordId(null)} aria-label="返回训练历史">←</button><span>训练记录</span><button onClick={() => deleteWorkoutRecord(selectedWorkoutRecord.id)}>删除</button></header>
        <section className="record-hero"><div><p className="eyebrow">WORKOUT LOG</p><h1>{selectedWorkoutRecord.name}</h1><p>{selectedWorkoutRecord.day} · {new Date(selectedWorkoutRecord.date).toLocaleDateString("zh-CN")}</p></div><img src={planArt[selectedWorkoutRecord.category]} alt="" className="record-mascot" /></section>
        <div className="record-stats"><article><strong>{formatTime(selectedWorkoutRecord.duration)}</strong><small>训练时间</small></article><article><strong>{selectedWorkoutRecord.completedSets}</strong><small>完成组数</small></article><article><strong>{selectedWorkoutRecord.exercises.length}</strong><small>动作数量</small></article></div>
        <div className="record-exercises">{selectedWorkoutRecord.exercises.length ? selectedWorkoutRecord.exercises.map((exercise) => <article key={exercise.id}><strong>{exercise.name}</strong><small>{exercise.sets}组 × {exercise.reps}次 · {exercise.weight}</small></article>) : <p className="record-placeholder">早期演示记录未保存动作明细。</p>}</div>
        <label className="record-note">训练备注<textarea value={selectedWorkoutRecord.note} onChange={(event) => setWorkoutHistory((current) => current.map((record) => record.id === selectedWorkoutRecord.id ? { ...record, note: event.target.value } : record))} placeholder="记录体感、重量或下次调整" /></label>
      </div>}

      {planEditorOpen && <div className="editor-screen">
        <header className="subpage-header"><button onClick={() => setPlanEditorOpen(false)} aria-label="关闭训练编辑">×</button><span>编辑每周训练</span><button onClick={() => { setWeekPlan(planDraft); setPlanEditorOpen(false); showToast("完整周计划已保存"); }} aria-label="保存训练计划">保存</button></header>
        <div className="editor-day-tabs">{planDraft.map((day, index) => <button className={planEditorDay === index ? "active" : ""} onClick={() => setPlanEditorDay(index)} key={day.day}><span>{day.short}</span><small>{day.exercises.length || "休"}</small></button>)}</div>
        <section className="day-editor">
          <label className="field-label">计划名称<input value={planDraft[planEditorDay].name} onChange={(event) => updateDraftName(event.target.value)} /></label>
          <section className="category-picker"><label>训练类型<select aria-label="训练类型" value={planDraft[planEditorDay].category} onChange={(event) => selectDraftCategory(event.target.value as TrainingCategory)}>{trainingCategoryOptions.map((option) => <option value={option.id} key={option.id}>{option.label}</option>)}</select></label><div className="category-preview"><img src={getPlanArt(planDraft[planEditorDay])} alt="当前训练类型配图" /><span>{categoryManual[planEditorDay] ? "已手动选择" : "根据名称自动推荐"}</span></div></section>
          <div className="day-kind"><button className={planDraft[planEditorDay].exercises.length ? "active" : ""} onClick={() => { if (!planDraft[planEditorDay].exercises.length) { setCategoryManual((current) => current.map((manual, index) => index === planEditorDay ? false : manual)); updateDraftDay({ category: "full_body", exercises: [{ id: Date.now(), name: "新动作", sets: 3, reps: 12, weight: "自重" }], state: planEditorDay === 4 ? "今日" : "待完成" }); } }}>训练日</button><button className={!planDraft[planEditorDay].exercises.length ? "active" : ""} onClick={() => { setCategoryManual((current) => current.map((manual, index) => index === planEditorDay ? false : manual)); updateDraftDay({ category: "rest", exercises: [], state: "休息" }); }}>休息日</button></div>
          {planDraft[planEditorDay].exercises.map((exercise, exerciseIndex) => <article className="exercise-editor" key={exercise.id}><div className="editor-number">0{exerciseIndex + 1}</div><label>动作名称<input value={exercise.name} onChange={(event) => updateDraftExercise(exerciseIndex, { name: event.target.value })} /></label><div className="exercise-fields"><label>组数<input inputMode="numeric" value={exercise.sets} onChange={(event) => updateDraftExercise(exerciseIndex, { sets: Math.max(1, Number(event.target.value) || 1) })} /></label><label>次数<input inputMode="numeric" value={exercise.reps} onChange={(event) => updateDraftExercise(exerciseIndex, { reps: Math.max(1, Number(event.target.value) || 1) })} /></label><label>重量<input value={exercise.weight} onChange={(event) => updateDraftExercise(exerciseIndex, { weight: event.target.value })} /></label></div><button className="remove-exercise" onClick={() => updateDraftDay({ exercises: planDraft[planEditorDay].exercises.filter((_, index) => index !== exerciseIndex) })}>移除此动作</button></article>)}
          {planDraft[planEditorDay].exercises.length > 0 && <button className="add-exercise" onClick={() => updateDraftDay({ exercises: [...planDraft[planEditorDay].exercises, { id: Date.now(), name: "新动作", sets: 3, reps: 12, weight: "自重" }] })}>＋ 添加训练动作</button>}
        </section>
      </div>}

      {workoutOpen && <div className="workout-screen">
        <div className="workout-scroll" onScroll={(event) => setWorkoutCompact(event.currentTarget.scrollTop > 36)}>
          <header className={`workout-clock ${workoutCompact ? "compact" : ""}`}>
            <button className="clock-back" onClick={leaveWorkout} aria-label="返回今日">←</button>
            <div className="clock-display"><span>训练时间</span><strong>{formatTime(elapsed)}</strong><small>{workoutCompact ? "" : "向上滑动查看训练项目"}</small></div>
            <button className="clock-toggle" onClick={toggleWorkoutTimer}>{workoutRunning ? "暂停" : elapsed > 0 ? "继续" : "开始计时"}</button>
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
        <div className="workout-controls"><button className={rest ? "resting" : ""} onClick={toggleRestTimer}><span>{rest ? formatTime(rest) : "01:00"}</span><small>{rest ? "点击取消" : "开始组间休息"}</small></button><button className={`finish-button ${allSetsDone ? "ready" : ""}`} onClick={finishWorkout} disabled={!allSetsDone}>完成训练</button></div>
      </div>}

      {tab === "food" && !foodEntryOpen && <div className="page-view">
        <header className="page-header"><div><p className="eyebrow">FOOD JOURNAL</p><h1>饮食日志</h1></div><button className="square-button dark" onClick={() => openFoodEntry()} aria-label="打开饮食记录页面">+</button></header>
        <div className="segmented">{(["day", "week", "month"] as const).map((view) => <button className={foodView === view ? "active" : ""} onClick={() => setFoodView(view)} key={view}>{view === "day" ? "日" : view === "week" ? "周" : "月"}</button>)}</div>
        {foodView === "day" && <><section className="nutrition-card comic-card"><div className="nutrition-head"><div><span className="kicker">{new Date(`${selectedFoodDate}T12:00:00`).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</span><small>{selectedDayMeals.length} 条记录</small></div><strong>{totalCalories.toLocaleString()}<small> kcal</small></strong></div><div className="macro-row"><article><div><strong>{macros.protein}</strong><small>g</small></div><p>蛋白质</p></article><article><div><strong>{macros.carbs}</strong><small>g</small></div><p>碳水</p></article><article><div><strong>{macros.fat}</strong><small>g</small></div><p>脂肪</p></article></div></section><div className="meal-list">{[...selectedDayMeals].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((meal) => <button className="food-row" key={meal.id} onClick={() => setMealDetailId(meal.id)}><MealVisual type={meal.type} className="food-thumb-art" /><div><strong>{meal.name}</strong><small>{meal.type} · {new Date(meal.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} · 蛋白质 {meal.protein || 0}g · 碳水 {meal.carbs || 0}g · 脂肪 {meal.fat || 0}g</small></div><b>{meal.calories} kcal</b></button>)}{selectedDayMeals.length === 0 && <button className="empty-day" onClick={() => openFoodEntry()}>这一天还没有记录 <span>＋补记一餐</span></button>}</div></>}
        {foodView === "week" && <div className="food-week-list"><div className="week-list-head"><span>本周</span><span>四餐记录</span><span>总热量</span></div>{weekFoodRecords.map((record) => <article className="week-food-row" key={record.day}><div className="week-food-day">{record.mealTypes.length ? <img src="/rabbit-stamp.png" alt="当日已打卡" className="food-day-stamp" /> : <span>＋</span>}<strong>{record.day}</strong></div><div className="week-meal-status">{["早餐", "午餐", "晚餐", "零食"].map((type) => <span className={`meal-status-icon ${mealStatusClass[type]} ${record.mealTypes.includes(type) ? "logged" : ""}`} aria-label={`${type}${record.mealTypes.includes(type) ? "已记录" : "未记录"}`} title={type} key={type} />)}</div><div className="week-food-kcal"><strong>{record.calories ? record.calories.toLocaleString() : "—"}</strong><small>kcal</small></div></article>)}</div>}
        {foodView === "month" && <div className="month-view"><div className="month-title"><button onClick={() => setMonthOffset((value) => value - 1)} aria-label="上个月">‹</button><strong>{shownMonth}</strong><button onClick={() => setMonthOffset((value) => value + 1)} aria-label="下个月">›</button></div><div className="month-weekdays">{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}</div><div className="month-grid">{monthCells.map((cell) => { const marked = recordDateKeys.has(cell.key); return <button onClick={() => { setSelectedFoodDate(cell.key); setFoodView("day"); }} aria-label={`${cell.key}${marked ? "有饮食记录" : "无饮食记录"}`} className={`${cell.current ? "" : "muted"} ${marked ? "marked" : ""}`} key={cell.key}><span>{cell.day}</span>{marked ? <img src="/rabbit-stamp.png" alt="已完成记录" className="month-stamp" /> : null}</button>; })}</div><div className="month-summary"><img src="/rabbit-food-calendar.png" alt="" className="month-mascot" /><p><strong>本月记录 {monthRecordCount} 天</strong>徽章只来自真实记录，切换月份会同步更新。</p></div></div>}
      </div>}

      {mealGroupOpen && <div className="subpage meal-group-screen">
        <header className="subpage-header"><button onClick={() => setMealGroupOpen(null)} aria-label="返回今日">←</button><span>{mealGroupOpen}记录</span><button onClick={() => openFoodEntry(mealGroupOpen)}>＋添加</button></header>
        <section className="meal-group-hero"><MealVisual type={mealGroupOpen} /><div><p className="eyebrow">{selectedFoodDate}</p><h1>{mealGroupOpen}</h1><p>{selectedDayMeals.filter((meal) => meal.type === mealGroupOpen).length}条记录 · {selectedDayMeals.filter((meal) => meal.type === mealGroupOpen).reduce((sum, meal) => sum + meal.calories, 0)} kcal</p></div></section>
        <div className="meal-group-list">{selectedDayMeals.filter((meal) => meal.type === mealGroupOpen).map((meal) => <button key={meal.id} onClick={() => setMealDetailId(meal.id)}><span><strong>{meal.name}</strong><small>{new Date(meal.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</small></span><b>{meal.calories} kcal</b><em>›</em></button>)}</div>
        <button className="primary-action" onClick={() => openFoodEntry(mealGroupOpen)}>继续添加{mealGroupOpen} <span>＋</span></button>
      </div>}

      {selectedMeal && <div className="subpage meal-detail-screen">
        <header className="subpage-header"><button onClick={() => setMealDetailId(null)} aria-label="返回饮食记录">←</button><span>饮食记录</span><button onClick={() => openFoodEntry(selectedMeal.type, selectedMeal)}>编辑</button></header>
        {selectedMeal.photo ? <img className="meal-detail-photo" src={selectedMeal.photo} alt={selectedMeal.name} /> : <section className="meal-detail-art"><MealVisual type={selectedMeal.type} /><span>{selectedMeal.type}</span></section>}
        <h1 className="meal-detail-name">{selectedMeal.name}</h1><p className="meal-detail-time">{new Date(selectedMeal.createdAt).toLocaleString("zh-CN")}</p>
        <div className="meal-detail-calories"><strong>{selectedMeal.calories}</strong><span>kcal</span></div>
        <div className="record-stats"><article><strong>{selectedMeal.protein || 0}g</strong><small>蛋白质</small></article><article><strong>{selectedMeal.carbs || 0}g</strong><small>碳水</small></article><article><strong>{selectedMeal.fat || 0}g</strong><small>脂肪</small></article></div>
        <button className="secondary-action" onClick={() => setMeals((current) => current.map((meal) => meal.id === selectedMeal.id ? { ...meal, favorite: !meal.favorite } : meal))}>{selectedMeal.favorite ? "取消常用餐食" : "保存为常用餐食"}</button>
        <button className="danger-action" onClick={() => deleteMeal(selectedMeal.id)}>删除这条记录</button>
      </div>}

      {foodEntryOpen && <div className="food-entry-screen">
        <header className="subpage-header"><button onClick={() => { setFoodEntryOpen(false); setEditingMealId(null); }} aria-label="返回饮食日志">←</button><span>{editingMealId ? "编辑记录" : "记录一餐"}</span><i /></header>
        <div className="entry-intro"><div><p className="eyebrow">NEW FOOD ENTRY</p><h1>今天吃了什么？</h1><p>先放一张照片，也可以直接手动记录。</p></div><img src="/rabbit-food-entry.png" alt="" className="entry-mascot" /></div>
        <label className={`photo-upload-page ${photoReady ? "ready" : ""}`}><input type="file" accept="image/*" onChange={(event) => {
          const file = event.target.files?.[0]; if (!file) return;
          const reader = new FileReader(); reader.onload = () => { setPhotoReady(true); setPhotoUrl(String(reader.result || "")); setAiState("idle"); }; reader.readAsDataURL(file);
        }} />{photoUrl ? <img src={photoUrl} alt="已选择的饮食照片" /> : <><span>＋</span><strong>拍照或选择图片</strong><small>支持 JPG、PNG</small></>}</label>
        {!editingMealId && <section className="quick-meals"><div><strong>最近记录</strong><small>点击即可加入当前餐次</small></div><div className="quick-meal-list">{recentMeals.map((meal) => <button key={`recent-${meal.id}`} onClick={() => quickAddMeal(meal)}><span>{meal.name}</span><b>{meal.calories} kcal</b></button>)}</div>{favoriteMeals.length > 0 && <><div className="quick-title"><strong>常用餐食</strong></div><div className="quick-meal-list">{favoriteMeals.map((meal) => <button key={`favorite-${meal.id}`} onClick={() => quickAddMeal(meal)}><span>★ {meal.name}</span><b>{meal.calories} kcal</b></button>)}</div></>}</section>}
        <div className="mode-switch"><button className={mealMode === "ai" ? "active" : ""} onClick={() => setMealMode("ai")}>AI辅助估算</button><button className={mealMode === "manual" ? "active" : ""} onClick={() => { setMealMode("manual"); setAiState("idle"); if (!editingMealId) { setCalories(""); setProtein(""); setCarbs(""); setFat(""); } }}>手动输入</button></div>
        {mealMode === "ai" && <section className="ai-panel"><div><strong>AI辅助估算</strong><span className="demo-badge">DEMO</span></div><p>当前是可交互识别演示，不会把照片上传到真实模型。识别后必须先确认食物和份量，才会填写营养数据。</p>{!photoReady && <button className="ai-sample" onClick={useDemoFoodPhoto}>使用示例照片</button>}<button onClick={runAiDemo} disabled={aiState === "analyzing"}>{aiState === "analyzing" ? "正在分析…" : aiState === "review" || aiState === "ready" ? "重新演示识别" : "开始演示识别"}</button></section>}
        {mealMode === "ai" && aiState === "review" && <section className="ai-review"><header><div><strong>识别结果</strong><small>演示置信度 78%</small></div><span>请确认</span></header>{aiItems.map((item, index) => <article key={item.id}><span>0{index + 1}</span><label>食物<input value={item.name} onChange={(event) => setAiItems((current) => current.map((food) => food.id === item.id ? { ...food, name: event.target.value } : food))} /></label><label>份量<input value={item.portion} onChange={(event) => setAiItems((current) => current.map((food) => food.id === item.id ? { ...food, portion: event.target.value } : food))} /></label><b>{item.calories} kcal</b></article>)}<p>估算结果不是精确测量，确认后仍可修改热量和三大营养素。</p><button className="primary-action" onClick={confirmAiEstimate}>确认并填写营养数据 <span>→</span></button></section>}
        {(mealMode === "manual" || aiState === "ready") && <div className="nutrition-form"><label className="meal-name-field">记录名称（可选）<input value={mealName} onChange={(event) => setMealName(event.target.value)} placeholder={`${mealType}记录`} /></label><div className="calorie-input"><label>热量<input inputMode="numeric" value={calories} onChange={(event) => setCalories(event.target.value)} placeholder="0" /></label><span>kcal</span></div><div className="macro-inputs"><label>蛋白质<input inputMode="numeric" value={protein} onChange={(event) => setProtein(event.target.value)} placeholder="可选" /></label><label>碳水<input inputMode="numeric" value={carbs} onChange={(event) => setCarbs(event.target.value)} placeholder="可选" /></label><label>脂肪<input inputMode="numeric" value={fat} onChange={(event) => setFat(event.target.value)} placeholder="可选" /></label></div></div>}
        <div className="meal-types">{["早餐", "午餐", "晚餐", "零食"].map((type) => <button className={mealType === type ? "active" : ""} onClick={() => setMealType(type)} key={type}>{type}</button>)}</div>
        <button className="primary-action entry-save" onClick={saveMeal} disabled={!Number(calories)}>{editingMealId ? "保存修改" : `添加一条${mealType}记录`} <span>→</span></button>
      </div>}

      {tab === "profile" && <div className="page-view">
        <header className="page-header"><div><p className="eyebrow">PROFILE</p><h1>我的</h1></div><button className="square-button" onClick={() => setDataCenterOpen(true)} aria-label="设置">⚙</button></header>
        <section className="profile-hero"><div><span className="kicker">训练日志者</span><h2>{profile.name}</h2><p>目标：{profile.goal}</p></div><img src="/rabbit-profile-checklist.png" alt="" className="profile-mascot" /></section>
        <div className="body-stats"><article><strong>{profile.height}</strong><span>{profile.unit === "metric" ? "cm" : "in"}</span><small>身高</small></article><article><strong>{profile.weight}</strong><span>{profile.unit === "metric" ? "kg" : "lb"}</span><small>体重</small></article><article><strong>{weekTrainingCount}</strong><span>次</span><small>周目标</small></article></div>
        <section className="profile-list"><button onClick={() => { setProfileDraft(profile); setProfileEditorOpen(true); }}><span>◎</span><div><strong>编辑个人资料</strong><small>{profile.goal} · {profile.unit === "metric" ? "公制" : "英制"}</small></div><em>›</em></button><button onClick={() => setInsightsOpen(true)}><span>↗</span><div><strong>本周总结与趋势</strong><small>训练、时间、饮食与热量</small></div><em>›</em></button><button onClick={() => setDataCenterOpen(true)}><span>⌁</span><div><strong>账号与数据</strong><small>{signedIn ? accountEmail : "本机保存 · 未登录"}</small></div><em>›</em></button><button onClick={() => { setNotificationsOn((value) => !value); showToast(notificationsOn ? "计时提醒已关闭" : "计时提醒已开启"); }}><span>◷</span><div><strong>计时提醒</strong><small>训练与组间通知</small></div><em>{notificationsOn ? "●" : "○"}</em></button><button onClick={() => showToast("离线模式已准备就绪")}><span>↓</span><div><strong>离线模式</strong><small>PWA 已准备就绪</small></div><em>✓</em></button></section><p className="privacy-note">记录用于帮你回顾，不是身体评分。</p>
      </div>}

      {profileEditorOpen && <div className="subpage account-screen"><header className="subpage-header"><button onClick={() => setProfileEditorOpen(false)} aria-label="返回我的">←</button><span>编辑个人资料</span><i /></header><div className="account-intro"><p className="eyebrow">PROFILE</p><h1>你的基本资料</h1><p>这些信息只用于页面展示，不会自动生成训练或饮食处方。</p></div><div className="profile-form"><label>姓名<input value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} /></label><div><label>身高<input inputMode="decimal" value={profileDraft.height} onChange={(event) => setProfileDraft((current) => ({ ...current, height: event.target.value }))} /></label><label>体重<input inputMode="decimal" value={profileDraft.weight} onChange={(event) => setProfileDraft((current) => ({ ...current, weight: event.target.value }))} /></label></div><label>健身目标<input value={profileDraft.goal} onChange={(event) => setProfileDraft((current) => ({ ...current, goal: event.target.value }))} /></label><fieldset><legend>单位</legend><button className={profileDraft.unit === "metric" ? "active" : ""} onClick={() => switchProfileUnit("metric")}>kg · cm</button><button className={profileDraft.unit === "imperial" ? "active" : ""} onClick={() => switchProfileUnit("imperial")}>lb · in</button></fieldset></div><button className="primary-action" onClick={() => { setProfile(profileDraft); setProfileEditorOpen(false); showToast("个人资料已保存"); }}>保存资料 <span>✓</span></button></div>}

      {insightsOpen && <div className="subpage insights-screen"><header className="subpage-header"><button onClick={() => setInsightsOpen(false)} aria-label="返回我的">←</button><span>本周总结</span><i /></header><div className="insights-title"><p className="eyebrow">WEEK 33</p><h1>这一周，留下了什么？</h1><p>只做回顾，不进行身体评分。</p></div><div className="insight-stats"><article><strong>{weekCompleted}</strong><small>完成训练</small></article><article><strong>{formatTime(totalWorkoutSeconds)}</strong><small>总训练时间</small></article><article><strong>{recordedFoodDays}</strong><small>饮食记录天数</small></article><article><strong>{averageCalories}</strong><small>平均每日 kcal</small></article></div><section className="trend-card"><header><strong>7 天热量记录</strong><small>kcal</small></header><div className="trend-bars">{weekFoodRecords.map((record) => <div key={record.day}><span style={{ height: `${record.calories ? Math.max(12, record.calories / 16) : 4}px` }} /><small>{record.day.slice(-1)}</small></div>)}</div></section><section className="trend-card"><header><strong>近 4 周训练次数</strong><small>次数</small></header><div className="trend-bars workout-trend">{[2, 3, 2, weekCompleted].map((value, index) => <div key={index}><span style={{ height: `${Math.max(10, value * 24)}px` }} /><small>W{index + 30}</small></div>)}</div></section></div>}

      {dataCenterOpen && <div className="subpage data-center-screen"><header className="subpage-header"><button onClick={() => setDataCenterOpen(false)} aria-label="返回我的">←</button><span>账号与数据</span><i /></header><div className="account-intro"><p className="eyebrow">ACCOUNT & DATA</p><h1>{signedIn ? "本机演示账号" : "登录演示"}</h1><p>当前没有云端服务器。登录状态与记录都只保存在这台设备，界面不会假装已经云同步。</p></div><section className="local-account"><label>邮箱<input type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} placeholder="name@example.com" /></label><button className="secondary-action" disabled={!accountEmail.includes("@")} onClick={() => { setSignedIn(true); showToast("本机演示账号已登录"); }}>{signedIn ? "更新本机账号" : "登录本机演示账号"}</button><div><span>设备内自动保存</span><b>已开启</b></div><div><span>跨设备云同步</span><b>未连接</b></div></section><section className="data-actions"><h2>导出与备份</h2><button onClick={exportJson}><span>JSON</span><div><strong>完整备份</strong><small>训练、饮食、资料与照片字段</small></div><em>↓</em></button><button onClick={exportCsv}><span>CSV</span><div><strong>饮食表格</strong><small>适合自行分析和存档</small></div><em>↓</em></button></section><section className="privacy-card"><h2>隐私说明</h2><p>饮食照片、身体资料和记录目前只保存在浏览器本机存储中，不会上传，也不会用于训练 AI。未来连接真实识别或云同步前，必须再次征得用户同意。</p></section><button className="danger-action" onClick={() => setConfirmResetOpen(true)}>删除全部本机数据</button>{signedIn && <button className="secondary-action" onClick={() => { setSignedIn(false); setAccountEmail(""); showToast("已退出本机演示账号"); }}>退出账号</button>}</div>}

      {infoModal && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={infoModal.title}><div className="info-modal"><div className="modal-handle" /><header><h2>{infoModal.title}</h2><button onClick={() => setInfoModal(null)} aria-label="关闭">×</button></header><p>{infoModal.body}</p><button className="primary-action" onClick={() => setInfoModal(null)}>知道了 <span>✓</span></button></div></div>}
      {confirmResetOpen && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="确认删除全部本机数据"><div className="info-modal"><header><h2>删除全部本机数据？</h2><button onClick={() => setConfirmResetOpen(false)} aria-label="关闭">×</button></header><p>这会清除本机保存的训练计划、训练历史、饮食记录、照片和个人资料。请先导出备份。</p><button className="danger-action" onClick={resetLocalData}>确认删除</button><button className="secondary-action" onClick={() => setConfirmResetOpen(false)}>取消</button></div></div>}
      {!workoutOpen && !foodEntryOpen && !planEditorOpen && !mealGroupOpen && !mealDetailId && !workoutRecordId && !workoutSummaryId && !profileEditorOpen && !insightsOpen && !dataCenterOpen && <nav className="bottom-nav" aria-label="主导航">{nav.map((item) => <button className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setPlanDetailIndex(null); setTrainingView("plan"); }} key={item.id}><span>{item.icon}</span>{item.label}</button>)}</nav>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </section></main>
  );
}
