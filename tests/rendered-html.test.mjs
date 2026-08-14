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
  assert.match(html, /早上好，Mia/);
  assert.match(html, /臀腿训练/);
  assert.match(html, /开始训练/);
  assert.match(html, /今日饮食/);
  assert.match(html, /manifest\.webmanifest/);
  assert.doesNotMatch(html, /codex-preview|Building your site|SkeletonPreview/i);
});

test("keeps the reviewed workout, food, and monochrome rules in source", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /const allSetsDone = activeSetCount > 0 && completed === activeSetCount/);
  assert.match(page, /disabled=\{!allSetsDone\}/);
  assert.match(page, /elapsed > 0 \? "继续" : "开始计时"/);
  assert.match(page, /function leaveWorkout\(\)[\s\S]*setTab\("today"\)/);
  assert.match(page, /onClick=\{\(\) => openPlanEditor\(4\)\}/);
  assert.match(page, /setWeekPlan\(planDraft\)/);
  assert.match(page, /结果不是实际模型计算/);
  assert.match(page, /className="food-entry-screen"/);
  assert.match(css, /\.mascot-sprite[^}]*aspect-ratio:1/);
  assert.match(css, /\.workout-screen[^}]*display:flex/);
  assert.match(css, /Strict black and white: no gray or color fills/);
  assert.match(page, /rabbit-actions-hd\.png/);
  assert.match(page, /rabbit-food-hd\.png/);
  assert.match(page, /rabbit-meals-closeup\.png/);
  assert.match(page, /<Sprite sheet="today" col=\{0\} row=\{0\} className="hero-mascot"/);
  assert.match(page, /rabbit-stamp\.png/);
  assert.match(page, /className="workout-scroll"/);
  assert.match(page, /scrollTop > 36/);
  assert.match(css, /\.workout-clock[^}]*min-height:45vh/);
  assert.match(css, /\.workout-clock\.compact[^}]*max-height:72px/);
  assert.match(page, /className="sprite-art"/);
  assert.match(css, /\.sprite-art[^}]*transform:scale\(\.78\)/);
  assert.match(css, /\.hero-mascot \.sprite-art\{transform:translateX\(-12px\) scale\(1\)\}/);
  assert.match(css, /\.meal-card\{padding:8px 7px 10px;border:1\.5px solid #000;background:#fff\}/);
  assert.match(css, /\.meal-art \.sprite-art,\.food-thumb-art \.sprite-art\{transform:scale\(\.96\)\}/);
});
