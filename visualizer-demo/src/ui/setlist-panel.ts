/* The setlist on the page: choose one or write one, fit it to the track,
   and read every choice the fitting made. The panel holds the plan; the
   loop in `main.ts` asks it which scene is playing. */

import type { Analysis } from "../audio/analyse";
import { EXAMPLES } from "../setlist/examples";
import { type Placed, type Plan, fit, log } from "../setlist/fit";
import { type Setlist, check } from "../setlist/setlist";
import { keep } from "./keep";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const clock = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;

export interface SetlistPanel {
  setAnalysis(a: Analysis | null, status?: string): void;
  plan(): Plan | null;
  /** the whole-track analysis, once there is one */
  analysis(): Analysis | null;
  /** whether the setlist is choosing the lens */
  driving(): boolean;
  setDriving(on: boolean): void;
  /** mark the scene that is playing */
  at(scene: Placed | null): void;
  toggle(): void;
  renderSpans(duration: number): void;
}

export function mountSetlist(
  seek: (t: number) => void,
  notify: (text: string) => void,
  showJson: (text: string, json: string) => void,
): SetlistPanel {
  let analysis: Analysis | null = null;
  let current: Setlist = EXAMPLES[0];
  let plan: Plan | null = null;
  let playing: string | null = null;

  const panel = $("set");
  const pick = $<HTMLSelectElement>("set-pick");
  const text = $<HTMLTextAreaElement>("set-text");
  const drive = $<HTMLInputElement>("set-drive");

  EXAMPLES.forEach((s, i) => pick.add(new Option(s.title, String(i))));
  pick.add(new Option("Your own (edit below)", "own"));
  text.value = JSON.stringify(current, null, 2);

  pick.addEventListener("change", () => {
    if (pick.value === "own") { $("set-editor").hidden = false; text.focus(); return; }
    current = EXAMPLES[Number(pick.value)];
    text.value = JSON.stringify(current, null, 2);
    run();
  });
  $("set-edit").addEventListener("click", () => { $("set-editor").hidden = !$("set-editor").hidden; });
  $("set-run").addEventListener("click", () => {
    let parsed: unknown;
    try { parsed = JSON.parse(text.value); } catch (e) { showProblems([`not JSON: ${(e as Error).message}`]); return; }
    const problems = check(parsed);
    if (problems.length) { showProblems(problems); return; }
    current = parsed as Setlist;
    const ix = EXAMPLES.findIndex((s) => JSON.stringify(s) === JSON.stringify(current));
    pick.value = ix < 0 ? "own" : String(ix);
    run();
  });

  const fileIn = $<HTMLInputElement>("set-file");
  $("set-open").addEventListener("click", () => fileIn.click());
  fileIn.addEventListener("change", async () => {
    const f = fileIn.files?.[0];
    fileIn.value = "";
    if (!f) return;
    text.value = await f.text();
    pick.value = "own";
    $("set-editor").hidden = false;
    $("set-run").click();
  });

  drive.addEventListener("change", () => { if (!drive.checked) $("caption").hidden = true; });

  function showProblems(list: string[]): void {
    const ul = $("set-problems");
    ul.replaceChildren(...list.map((p) => Object.assign(document.createElement("li"), { textContent: p })));
    ul.hidden = !list.length;
    if (list.length) $("set-editor").hidden = false;
  }

  function run(): void {
    showProblems([]);
    $("set-note").textContent = current.note ?? "";
    if (!analysis) { plan = null; render(); return; }
    const r = fit(current, analysis);
    if (!r.ok) { plan = null; showProblems(r.problems); render(); return; }
    plan = r.plan;
    render();
  }

  function render(): void {
    const list = $("set-scenes");
    list.replaceChildren();
    $("set-rules").replaceChildren();
    $("set-notes").replaceChildren();
    for (const id of ["set-copy", "set-log"]) $<HTMLButtonElement>(id).disabled = !plan;
    if (!plan) { spans(); return; }

    for (const p of plan.scenes) {
      const li = document.createElement("li");
      li.dataset.name = p.name;
      li.innerHTML = `<button class="scene" title="Play from here">
          <span class="badge ${p.outcome}">${p.outcome}</span>
          <span class="name"></span><span class="at">${clock(p.at)}</span>
          <span class="asks"></span><span class="why"></span></button>`;
      li.querySelector(".name")!.textContent = p.name;
      li.querySelector(".asks")!.textContent = `${p.asks}${p.span !== "one part" ? ` · ${p.span}` : ""} · ${p.lens ?? "no lens"}`;
      li.querySelector(".why")!.textContent = p.note.replace(/^(found|close|missing):?\s*/, "");
      li.querySelector("button")!.addEventListener("click", () => seek(p.at + 0.01));
      list.append(li);
    }
    for (const r of plan.rules) {
      const li = document.createElement("li");
      li.className = r.holds ? "holds" : "broken";
      li.innerHTML = `<span class="mark">${r.holds ? "✓" : "✗"}</span> <strong></strong> <span></span>`;
      li.querySelector("strong")!.textContent = r.rule;
      li.querySelector("span:last-child")!.textContent = `— ${r.note}`;
      $("set-rules").append(li);
    }
    for (const n of plan.notes) $("set-notes").append(Object.assign(document.createElement("li"), { textContent: n }));
    spans();
    playing = null;
  }

  let lastDuration = 0;
  function spans(duration = lastDuration): void {
    lastDuration = duration;
    const host = $("spans");
    host.replaceChildren();
    if (!plan || !duration) return;
    for (const p of plan.scenes) {
      const span = document.createElement("span");
      span.className = p.outcome;
      span.dataset.name = p.name;
      span.style.left = `${(p.at / duration) * 100}%`;
      span.style.width = `${((p.until - p.at) / duration) * 100}%`;
      span.title = `${p.name}: ${p.note}`;
      host.append(span);
    }
  }

  const base = () => `${(plan?.track?.name ?? "track").replace(/\.[^.]+$/, "")}.${(plan?.setlist ?? "setlist").toLowerCase().replace(/\W+/g, "-")}`;
  $("set-copy").addEventListener("click", () => { if (plan) keep(`${base()}.plan.json`, plan, notify, showJson); });
  $("set-log").addEventListener("click", () => { if (plan) keep(`${base()}.log.json`, log(plan), notify, showJson); });
  $("set-close").addEventListener("click", () => { panel.hidden = true; });

  return {
    setAnalysis(a, status) {
      analysis = a;
      $("set-status").textContent = status ?? (a
        ? `${a.sections.length} parts · ${a.keyAt.length ? `${a.keyAt.length} key change${a.keyAt.length > 1 ? "s" : ""}` : "one key"} · ${clock(a.seconds)}`
        : "Open a track, and the setlist will be fitted to the whole of it.");
      run();
      if (a && plan) notify(`“${plan.setlist}”: ${plan.scenes.filter((p) => p.outcome === "found").length} of ${plan.scenes.length} scenes found.`);
    },
    plan: () => plan,
    analysis: () => analysis,
    driving: () => drive.checked,
    setDriving(on) { drive.checked = on; if (!on) $("caption").hidden = true; },
    at(scene) {
      const name = scene?.name ?? null;
      if (name === playing) return;
      playing = name;
      for (const el of document.querySelectorAll<HTMLElement>("#set-scenes li, #spans span"))
        el.classList.toggle("now", el.dataset.name === name);
      const cap = $("caption");
      if (scene?.caption && drive.checked) {
        cap.textContent = scene.caption;
        cap.hidden = false;
        cap.classList.remove("in");
        void cap.offsetWidth;
        cap.classList.add("in");
      } else cap.hidden = true;
    },
    toggle() { panel.hidden = !panel.hidden; },
    renderSpans: (d) => spans(d),
  };
}
