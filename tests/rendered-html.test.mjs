import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Long Ear Log product surface", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Long Ear Log · 健身饮食日志<\/title>/i);
  assert.match(html, /正在打开日志/);
  assert.match(html, /manifest\.webmanifest/);
  assert.doesNotMatch(html, /codex-preview|Building your site|SkeletonPreview/i);
});

test("keeps the reviewed workout, food, and monochrome rules in source", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /早上好，\{profile\.name\}/);
  assert.match(page, /臀腿训练/);
  assert.match(page, /开始训练/);
  assert.match(page, /今日饮食/);

  assert.match(page, /const allSetsDone = activeSetCount > 0 && completed === activeSetCount/);
  assert.match(page, /disabled=\{!allSetsDone\}/);
  assert.match(page, /elapsed > 0 \? "继续" : "开始计时"/);
  assert.match(page, /function leaveWorkout\(\)[\s\S]*setTab\("today"\)/);
  assert.match(page, /setWeekPlan\(planDraft\)/);
  assert.match(page, /type TrainingCategory/);
  assert.match(page, /type WorkoutRecord/);
  assert.match(page, /workoutHistory/);
  assert.match(page, /workoutSummaryId/);
  assert.match(page, /timerAnchor/);
  assert.match(page, /restEndsAt/);
  assert.match(page, /window\.localStorage\.setItem/);
  assert.match(page, /function suggestTrainingCategory/);
  assert.match(page, /aria-label="训练类型"/);
  assert.match(page, /根据名称自动推荐/);
  assert.match(page, /已手动选择/);
  assert.match(page, /当前是可交互识别演示/);
  assert.match(page, /aiState === "review"/);
  assert.match(page, /确认并填写营养数据/);
  assert.match(page, /使用示例照片/);
  assert.match(page, /className="food-entry-screen"/);
  assert.match(page, /type: "零食", name: "酸奶"/);
  assert.match(page, /type: "零食", name: "拿铁"/);
  assert.match(page, /mealGroupOpen/);
  assert.match(page, /editingMealId/);
  assert.match(page, /function deleteMeal/);
  assert.match(page, /recentMeals/);
  assert.match(page, /favoriteMeals/);
  assert.match(page, /继续添加\{mealGroupOpen\}/);
  assert.match(css, /\.workout-screen[^}]*display:flex/);
  assert.match(css, /Strict black and white: no gray or color fills/);
  assert.match(page, /workoutDone \? "\/rabbit-today-complete\.png" : "\/rabbit-today-wave\.png"/);
  assert.match(page, /rabbit-profile-checklist\.png/);
  assert.match(page, /rabbit-stamp\.png/);
  assert.match(page, /weekFoodRecords\.map/);
  assert.match(page, /className="week-food-row"/);
  assert.match(page, /record\.mealTypes\.includes\(type\)/);
  assert.match(page, /className="workout-scroll"/);
  assert.match(page, /scrollTop > 36/);
  assert.match(css, /\.workout-clock[^}]*min-height:45vh/);
  assert.match(css, /\.workout-clock\.compact[^}]*max-height:72px/);
  assert.match(css, /\.hero-mascot \{[^}]*object-fit:contain/);
  assert.match(css, /\.meal-card\{padding:8px 7px 10px;border:1\.5px solid #000;background:#fff\}/);
  assert.match(css, /\.meal-group-screen/);
  assert.match(css, /\.meal-detail-screen/);
  assert.match(css, /\.history-list/);
  assert.match(css, /\.quick-meals/);
  assert.match(page, /rabbit-squat-standalone\.png/);
  assert.match(page, /rabbit-upper-push\.png/);
  assert.match(page, /rabbit-stretch\.png/);
  assert.match(page, /rabbit-back\.png/);
  assert.match(page, /rabbit-walk\.png/);
  assert.match(page, /rabbit-full-body\.png/);
  assert.match(page, /rabbit-rest\.png/);
  assert.match(page, /weekCompleted === 0 \? "\/rabbit-week-start\.png"/);
  assert.match(page, /weekTrainingCount = weekPlan\.filter\(\(day\) => day\.exercises\.length > 0\)\.length/);
  assert.match(page, /weekIsComplete = weekTrainingCount > 0 && weekCompleted >= weekTrainingCount/);
  assert.match(page, /weekIsComplete \? "\/rabbit-week-complete\.png"/);
  assert.match(page, /"\/rabbit-week-progress\.png"/);
  assert.match(css, /\.standalone-detail-mascot\{display:block;object-fit:contain\}/);
  assert.match(page, /const STORAGE_KEY = "long-ear-log-v7"/);
  assert.match(page, /function buildMonthCells/);
  assert.match(page, /recordDateKeys\.has\(cell\.key\)/);
  assert.match(page, /setSelectedFoodDate\(cell\.key\); setFoodView\("day"\)/);
  assert.match(page, /foodView === "day" && <>.*className="nutrition-card comic-card"/s);
  assert.match(page, /本周总结与趋势/);
  assert.match(page, /7 天热量记录/);
  assert.match(page, /跨设备云同步<\/span><b>未连接/);
  assert.match(page, /function exportJson/);
  assert.match(page, /function exportCsv/);
  assert.match(page, /确认删除全部本机数据/);
  assert.match(page, /function switchProfileUnit/);
  assert.match(css, /\.macro-row article>span/);
  assert.match(page, /TRAINING DATABASE/);
  assert.match(page, /trainingView === "data"/);
  assert.match(page, /exerciseDatabase/);
  assert.match(page, /trendPolyline/);
  assert.doesNotMatch(page, /macro-handwriting macro-p/);
  assert.match(page, /meal-status-icon/);
  assert.match(page, /className="food-day-stamp"/);
  assert.match(css, /meal-status-icons\.png/);
  assert.match(css, /\.record-hero \.record-mascot/);
  assert.match(css, /\.profile-mascot\{width:154px/);
  assert.match(css, /\.month-grid\{[^}]*border:0/);
  assert.match(css, /\.month-grid button>span\{[^}]*background:transparent!important/);
});
