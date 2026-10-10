/* The page: one loop, in one order.

     analyzer.read()  →  frame
     hand.step(frame)  →  pads that landed on this beat
     deck A, deck B: lens.state(frame, prev)  →  view
     mix(A, B, fader)  →  view
     luxOf(frame.dynamics)  →  lux                   (light only)
     body.draw({frame, view, hand, emblems, lux})

   Nothing outside `audio/` touches the sound; everything else sees the
   frame. The lens chooses the colours and the music can only make them
   brighter or dimmer; with no lens, the body is grey. The hand moves
   shapes and never colours.

   A setlist, when there is one, sits beside the loop rather than in it:
   the whole track is analysed once, the setlist is fitted to that, and the
   scene playing now chooses the lens. It never sees a frame.

   Everything a performer does can also be asked for from outside: by URL
   parameters (?song, ?orchestration, ?lens, ?record, ?signal, ?quantise),
   by an orchestration that plays its cues as the song reaches them, or by
   calling `window.visualizer` from a script. */

import { analyse } from "./audio/analyse";
import { Analyzer } from "./audio/analyzer";
import { decode } from "./audio/decode";
import { type Frame, type Sounding, silent } from "./audio/frame";
import { keyName } from "./audio/key";
import { Hand, type Pad } from "./hand/hand";
import { css, hue, luxOf, shade } from "./law/light";
import { type Context, LENSES, PLAIN, type View, lensKey } from "./lenses";
import type { PulleyState } from "./lenses/pulley";
import { mix } from "./lenses/mix";
import { type MarkSet, type TrackId, identify, parse, verdict } from "./marks/fingerprint";
import { type Action, type Orchestration, due, read } from "./orchestra/orchestration";
import { Take, format } from "./record/take";
import { Body } from "./render/body";
import { sceneAt } from "./setlist/fit";
import { keep } from "./ui/keep";
import { save } from "./ui/save";
import { mountSetlist } from "./ui/setlist-panel";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const audio = new Audio();
const stage = $<HTMLCanvasElement>("stage");
const body = new Body(stage);
let analyzer: Analyzer | null = null;

let trackId: TrackId | null = null;
let objectUrl: string | null = null;
let marks: number[] = [];
let pendingMarks: MarkSet | null = null;

/* two decks, each a lens and that lens's last state */
interface Deck { ix: number; prev: unknown }
const decks: Record<"a" | "b", Deck> = { a: { ix: -1, prev: null }, b: { ix: -1, prev: null } };
const hand = new Hand();
const offAir = () => (hand.onAir() === "a" ? "b" : "a");

const setlist = mountSetlist(
  (t) => { if (audio.src) { audio.currentTime = t; if (audio.paused) toggle(); } },
  (text) => notify(text),
  (text, json) => showJson(text, json),
);

/* ---- decks -------------------------------------------------------- */

const lensNav = $("lenses");
const TITLES = ["None", ...LENSES.map((l) => l.title)];
TITLES.forEach((title, i) => {
  const b = document.createElement("button");
  const k = i ? lensKey(i - 1) : "0";
  b.innerHTML = `<kbd>${k}</kbd> `;
  b.append(title);
  b.title = i ? `Switch to ${title} on the next beat (${k}); Shift to cue it for the fader` : "Switch to no lens: the grey body (0)";
  b.addEventListener("click", (e) => (e.shiftKey ? cue(i - 1) : switchTo(i - 1)));
  lensNav.append(b);
});

/* Cueing puts a lens on the deck that is off air without showing it, for
   blending by hand on the fader. A lens chosen by hand takes the choice
   back from the setlist. */
function cue(ix: number, bySetlist = false): void {
  if (!bySetlist) setlist.setDriving(false);
  const d = decks[offAir()];
  if (d.ix !== ix) { d.ix = ix; d.prev = null; }
  renderDecks();
}

/* Choosing a lens switches to it: it is cued and cut to on the next beat.
   Cueing on its own (Shift) is for blending on the fader; as the only
   behaviour it left the picture on one lens while every button pressed
   after it lit up and nothing visible happened. */
function switchTo(ix: number): void {
  if (decks[hand.onAir()].ix === ix && !hand.isArmed("cut")) return;
  cue(ix);
  press("cut");
}

function renderDecks(): void {
  const on = hand.onAir();
  for (const side of ["a", "b"] as const) {
    $(`deck-${side}-name`).textContent = TITLES[decks[side].ix + 1];
    $(`deck-${side}`).classList.toggle("live", side === on);
  }
  [...lensNav.children].forEach((b, i) => {
    b.classList.toggle("live", decks[on].ix === i - 1);
    b.classList.toggle("cued", decks[offAir()].ix === i - 1 && decks[on].ix !== i - 1);
  });
  const l = LENSES[decks[on].ix];
  $("note").innerHTML = l ? `<strong>${l.title}</strong><br>${l.idea}` : `No lens: the grey body. Choose one with 1–${LENSES.length}.`;
}

/* what a lens may know beyond the frame: the track's parts, and the line
   Pulley is reading if Pulley is on the other deck */
function contextFor(side: "a" | "b"): Context {
  const other = decks[side === "a" ? "b" : "a"];
  const a = setlist.analysis();
  const pulleyBeside = LENSES[other.ix]?.id === "pulley" && other.prev;
  return {
    parts: a ? a.sections : null,
    poemLine: pulleyBeside ? (other.prev as PulleyState).line : null,
  };
}

function deckView(d: Deck, f: Frame, side: "a" | "b"): { view: View; label: string } {
  const l = LENSES[d.ix];
  if (!l) return { view: PLAIN, label: "none" };
  if (f.muted) return { view: PLAIN, label: "waiting for sound" };
  const s = l.state(f as Sounding, d.prev, contextFor(side));
  d.prev = s;
  return { view: l.view(s), label: l.label(s) };
}

/* ---- the hand ----------------------------------------------------- */

const PADS: Pad[] = ["cut", "burst", "reverse", "fold", "trails"];
function press(pad: Pad): void {
  if (pad === "cut") setlist.setDriving(false);
  hand.press(pad, performance.now() / 1000);
  $(`pad-${pad}`).classList.add("armed");
}
for (const pad of PADS) $(`pad-${pad}`).addEventListener("click", () => press(pad));

const quantise = $<HTMLInputElement>("quantise");
quantise.addEventListener("change", () => { hand.quantise = quantise.checked; });

const fader = $<HTMLInputElement>("fader");
let fading = false;
fader.addEventListener("pointerdown", () => { fading = true; });
addEventListener("pointerup", () => { fading = false; });
fader.addEventListener("input", () => {
  setlist.setDriving(false);
  hand.setFader(Number(fader.value) / 1000);
});

/* the body is a platter: grab it to stop it and scratch its turn, drag up
   and down to zoom, double-click to let everything go */
stage.addEventListener("pointerdown", (e) => {
  hand.holding = true;
  stage.setPointerCapture(e.pointerId);
  let x = e.clientX, y = e.clientY;
  const move = (m: PointerEvent) => {
    hand.twist += (m.clientX - x) * 0.008;
    hand.zoom = Math.max(0.35, Math.min(2.6, hand.zoom * Math.exp(-(m.clientY - y) * 0.004)));
    x = m.clientX; y = m.clientY;
  };
  stage.addEventListener("pointermove", move);
  stage.addEventListener("pointerup", () => { hand.holding = false; stage.removeEventListener("pointermove", move); }, { once: true });
});
stage.addEventListener("dblclick", () => hand.reset());

renderDecks();

/* ---- loading and transport --------------------------------------- */

async function load(file: File): Promise<void> {
  if (!file.type.startsWith("audio/") && !/\.(mp3|m4a|aac|wav|flac|ogg|opus|aiff?)$/i.test(file.name)) {
    notify(`“${file.name}” does not look like audio.`);
    return;
  }
  const data = await file.arrayBuffer();
  const id = await identify(file.name, data);
  trackId = id;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  audio.src = objectUrl;
  marks = [];
  decks.a.prev = decks.b.prev = null;
  analyzer?.reset();
  renderTicks();
  document.title = `${file.name.replace(/\.[^.]+$/, "")} · Visualizer Demo`;
  $("empty").hidden = true;
  if (take) await finishTake();
  for (const b of ["play", "mark", "export", "import", "rec"]) $<HTMLButtonElement>(b).disabled = false;
  orchT = -1;
  /* a browser will not start sound before the page has been clicked; when
     the song arrived by URL that may not have happened yet */
  try { await toggle(true); } catch { notify("Press space or ▶ to start: the browser waits for a click before it plays sound."); }

  /* the whole track, once, for the setlist. It may finish after another
     track has been dropped, and then it is about a track nobody is playing */
  setlist.setAnalysis(null, "Listening to the whole track…");
  try {
    const { pcm, sr } = await decode(data);
    if (trackId !== id) return;
    setlist.setAnalysis(analyse(pcm, sr, id));
    setlist.renderSpans(audio.duration);
  } catch {
    if (trackId === id) setlist.setAnalysis(null, "This file could not be decoded whole, so no setlist can be fitted to it.");
  }
}

/* a song by URL: fetched, then loaded exactly as a dropped file is */
async function loadUrl(url: string): Promise<void> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`could not fetch ${url} (${r.status})`);
  const blob = await r.blob();
  const name = decodeURIComponent(new URL(url, location.href).pathname.split("/").pop() || "song");
  await load(new File([blob], name, { type: blob.type || "audio/mpeg" }));
}

async function toggle(forcePlay = false): Promise<void> {
  if (!audio.src) return;
  /* the audio context can only start on a gesture, so the analyzer is made on the first */
  if (!analyzer) analyzer = new Analyzer(audio);
  await analyzer.ctx.resume();
  if (audio.paused || forcePlay) await audio.play();
  else audio.pause();
}

audio.addEventListener("play", () => { $("play").textContent = "❚❚"; $("play").ariaLabel = "Pause"; });
audio.addEventListener("pause", () => { $("play").textContent = "▶"; $("play").ariaLabel = "Play"; });
audio.addEventListener("loadedmetadata", () => { $("dur").textContent = clock(audio.duration); renderTicks(); setlist.renderSpans(audio.duration); });
audio.addEventListener("seeked", () => { decks.a.prev = decks.b.prev = null; });

const fileInput = $<HTMLInputElement>("file");
fileInput.addEventListener("change", () => { const f = fileInput.files?.[0]; if (f) load(f); fileInput.value = ""; });
$("open").addEventListener("click", () => fileInput.click());
$("open-2").addEventListener("click", () => fileInput.click());
$("play").addEventListener("click", () => toggle());

addEventListener("dragover", (e) => { e.preventDefault(); document.body.classList.add("dragging"); });
addEventListener("dragleave", () => document.body.classList.remove("dragging"));
addEventListener("drop", (e) => {
  e.preventDefault();
  document.body.classList.remove("dragging");
  const f = e.dataTransfer?.files[0];
  if (!f) return;
  if (/\.json$/i.test(f.name)) importMarks(f);
  else load(f);
});

const timeline = $("timeline");
function seekTo(clientX: number): void {
  if (!audio.duration) return;
  const r = timeline.getBoundingClientRect();
  audio.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * audio.duration;
}
timeline.addEventListener("pointerdown", (e) => {
  seekTo(e.clientX);
  const move = (m: PointerEvent) => seekTo(m.clientX);
  addEventListener("pointermove", move);
  addEventListener("pointerup", () => removeEventListener("pointermove", move), { once: true });
});
timeline.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") audio.currentTime += 5;
  if (e.key === "ArrowLeft") audio.currentTime -= 5;
});

/* ---- recording a take --------------------------------------------- */

/* Record rewinds to the top and plays; everything played on the deck goes
   into the film. The take ends with the track, or when Record is pressed
   again, and the file is saved then. */
let take: Take | null = null;
const recBtn = $<HTMLButtonElement>("rec");

async function recordTake(): Promise<void> {
  if (take) { await finishTake(); return; }
  if (!audio.src || !trackId) return;
  const fmt = format();
  if (!fmt) { notify("This browser cannot record video. Try Chrome or Safari."); return; }
  if (!analyzer) analyzer = new Analyzer(audio);
  await analyzer.ctx.resume();
  audio.currentTime = 0;
  orchT = -1;
  take = new Take(stage, analyzer.stream(), fmt);
  take.start();
  document.body.classList.add("recording");
  recBtn.ariaPressed = "true";
  try { await audio.play(); }
  catch {
    const t = take;
    take = null;
    document.body.classList.remove("recording");
    recBtn.ariaPressed = "false";
    await t.stop();
    notify("Click Record to start: the browser waits for a click before it plays sound.");
  }
}

async function finishTake(): Promise<void> {
  const t = take;
  if (!t) return;
  take = null;
  document.body.classList.remove("recording");
  recBtn.ariaPressed = "false";
  recBtn.textContent = "● Record";
  audio.pause();
  const blob = await t.stop();
  /* named after the orchestration when one is playing, so two takes of one song do not collide */
  const name = `${(orch?.title ?? trackId?.name ?? "take").replace(/\.[^.]+$/, "")} · visualizer.${t.format.ext}`;
  await save(name, blob, notify);
}

recBtn.addEventListener("click", () => recordTake());
audio.addEventListener("ended", () => { if (take) finishTake(); });

/* ---- orchestration and outside control ----------------------------- */

let orch: Orchestration | null = null;
/** where in the song the orchestration last looked, so each cue fires once */
let orchT = -1;
const lensIx = (id: string) => (id === "none" ? -1 : LENSES.findIndex((l) => l.id === id));

/* one action, as a performer would take it */
function perform(a: Action): void {
  const now = performance.now() / 1000;
  switch (a.kind) {
    case "lens": switchTo(lensIx(a.lens)); break;
    case "cue": cue(lensIx(a.lens)); break;
    case "cut": press("cut"); break;
    case "pad": press(a.pad); break;
    case "reset": hand.reset(); break;
    case "quantise": hand.quantise = quantise.checked = a.on; break;
    case "blend": {
      /* toward whichever deck holds the lens, putting it on the other deck first if neither does */
      const ix = lensIx(a.lens);
      let side: "a" | "b" | null = decks.a.ix === ix ? "a" : decks.b.ix === ix ? "b" : null;
      if (!side) { cue(ix); side = offAir(); }
      setlist.setDriving(false);
      hand.glideFader(side === "b" ? a.amount : 1 - a.amount, now, a.over);
      break;
    }
  }
}

async function orchestrate(source: string | unknown): Promise<Orchestration | null> {
  const base = typeof source === "string" ? new URL(source, location.href) : new URL(location.href);
  const json = typeof source === "string" ? await (await fetch(base)).json() : source;
  const r = read(json, LENSES.map((l) => l.id), audio.duration || null);
  if (!r.ok) { notify(`This orchestration cannot be played: ${r.problems.join("; ")}`); return null; }
  orch = r.orchestration;
  orchT = -1;
  notify(`Orchestration “${orch.title}”: ${orch.cues.length} cues.`);
  return orch.song ? { ...orch, song: new URL(orch.song, base).href } : orch;
}

/* ?song=…  ?orchestration=…  ?lens=…  ?record=1  ?signal=1  ?quantise=0 */
async function fromUrl(): Promise<void> {
  const p = new URLSearchParams(location.search);
  if (p.get("signal") === "1") $("signal").hidden = false;
  if (p.get("quantise") === "0") hand.quantise = quantise.checked = false;
  let song = p.get("song");
  const o = p.get("orchestration");
  if (o) { const played = await orchestrate(o); if (!song && played?.song) song = played.song; }
  const first = p.get("lens");
  if (first && lensIx(first) >= -1) { cue(lensIx(first)); hand.setFader(offAir() === "b" ? 1 : 0); renderDecks(); }
  if (!song) return;
  await loadUrl(song);
  if (p.get("record") === "1") {
    /* wait for the whole-track analysis, so the lenses that use it have it from the first frame */
    for (let i = 0; i < 60 && !setlist.analysis(); i++) await new Promise((r) => setTimeout(r, 250));
    await recordTake();
  }
}

/* the same, for a script: everything a performer can do, by name */
const visualizer = {
  load: loadUrl,
  orchestrate,
  play: () => toggle(true),
  pause: () => audio.pause(),
  seek: (s: number) => { audio.currentTime = s; },
  lens: (id: string) => perform({ kind: "lens", lens: id }),
  cue: (id: string) => perform({ kind: "cue", lens: id }),
  cut: () => perform({ kind: "cut" }),
  pad: (pad: Pad) => perform({ kind: "pad", pad: pad as never }),
  blend: (id: string, amount = 1, over = 2) => perform({ kind: "blend", lens: id, amount, over }),
  reset: () => perform({ kind: "reset" }),
  record: recordTake,
  state: () => ({
    t: audio.currentTime,
    duration: audio.duration || null,
    playing: !audio.paused,
    recording: !!take,
    onAir: hand.onAir(),
    decks: { a: LENSES[decks.a.ix]?.id ?? "none", b: LENSES[decks.b.ix]?.id ?? "none" },
    fader: hand.view(performance.now() / 1000).fader,
    orchestration: orch?.title ?? null,
  }),
};
(window as unknown as { visualizer: typeof visualizer }).visualizer = visualizer;

/* ---- marks -------------------------------------------------------- */

function addMark(): void {
  if (!audio.src) return;
  marks = [...marks, +audio.currentTime.toFixed(3)].sort((a, b) => a - b);
  renderTicks();
}

function renderTicks(): void {
  const ticks = $("ticks");
  ticks.replaceChildren();
  if (!audio.duration) return;
  for (const m of marks) {
    const i = document.createElement("i");
    i.style.left = `${(m / audio.duration) * 100}%`;
    i.dataset.t = String(m);
    ticks.append(i);
  }
}

function exportMarks(): void {
  if (!trackId) return;
  const set: MarkSet = { version: 1, track: trackId, marks };
  keep(`${trackId.name.replace(/\.[^.]+$/, "")}.marks.json`, set, notify, showJson);
}

async function importMarks(file: File): Promise<void> {
  let set: MarkSet;
  try { set = parse(await file.text()); } catch { notify(`“${file.name}” is not a mark set.`); return; }
  if (!trackId) { notify("Open the track these marks belong to first."); return; }
  const v = verdict(set, trackId);
  if (v.kind === "same") { marks = [...set.marks]; renderTicks(); notify(`${set.marks.length} marks loaded.`); }
  else if (v.kind === "unbound") { marks = [...set.marks]; renderTicks(); notify(`Loaded, but ${v.why}.`); }
  else { pendingMarks = set; notify(`Refused: ${v.why}. Times placed on one track land somewhere meaningless on another.`, true); }
}

const marksInput = $<HTMLInputElement>("marks-file");
marksInput.addEventListener("change", () => { const f = marksInput.files?.[0]; if (f) importMarks(f); marksInput.value = ""; });
$("mark").addEventListener("click", addMark);
$("export").addEventListener("click", exportMarks);
$("import").addEventListener("click", () => marksInput.click());

/* ---- notices and the signal readout ------------------------------- */

let noticeTimer = 0;
function notify(text: string, anyway = false): void {
  $("notice-json").hidden = true;
  $("notice-text").textContent = text;
  $("notice-anyway").hidden = !anyway;
  $("notice").hidden = false;
  clearTimeout(noticeTimer);
  if (!anyway) noticeTimer = window.setTimeout(() => ($("notice").hidden = true), 5000);
}

/* the fallback when the clipboard is refused: the JSON, selected */
function showJson(text: string, json: string): void {
  notify(text, false);
  clearTimeout(noticeTimer);
  const box = $<HTMLTextAreaElement>("notice-json");
  box.value = json;
  box.hidden = false;
  box.focus();
  box.select();
}

$("notice-close").addEventListener("click", () => { $("notice").hidden = true; pendingMarks = null; });
$("notice-anyway").addEventListener("click", () => {
  if (pendingMarks) { marks = [...pendingMarks.marks]; renderTicks(); }
  pendingMarks = null;
  $("notice").hidden = true;
});

const toggleSignal = () => { $("signal").hidden = !$("signal").hidden; };
$("signal-toggle").addEventListener("click", toggleSignal);
$("set-toggle").addEventListener("click", () => setlist.toggle());

const bar = (x: number) => "█".repeat(Math.round(x * 10)).padEnd(10, "·");
const clock = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

function readout(f: Frame, lenses: string, x: number): string {
  if (f.muted) return `nothing playing\n\nno readings, and no lens:\nthe body is grey and the light\nis as it was drawn.`;
  const { dynamics: d, harmony: h, rhythm: p } = f;
  const pos = Math.round(x * 8);
  const plan = setlist.plan();
  return [
    `energy  ${bar(d.energy)} ${d.energy.toFixed(2)}`,
    `beat    ${bar(d.beat)} ${d.beat.toFixed(2)}`,
    `flux    ${bar(d.flux)} ${d.flux.toFixed(2)}`,
    `bright  ${bar(d.bright)} ${d.bright.toFixed(2)}`,
    ``,
    `key     ${keyName(h.tonic, h.minor)}`,
    `tempo   ${p.bpm ? `${p.bpm} bpm` : "listening…"}`,
    `beats   ${p.beats}  phase ${p.phase.toFixed(2)}`,
    ``,
    lenses,
    `fader   A ${"─".repeat(pos)}●${"─".repeat(8 - pos)} B`,
    ...(plan && setlist.driving() ? [`scene   ${sceneAt(plan, f.t)?.name ?? "—"}`] : []),
    ...(orch ? [`score   ${orch.title} · next ${orch.cues.find((c) => c.at > f.t) ? clock(orch.cues.find((c) => c.at > f.t)!.at) : "—"}`] : []),
  ].join("\n");
}

/* ---- keys --------------------------------------------------------- */

addEventListener("keydown", (e) => {
  const el = e.target;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement || e.metaKey || e.ctrlKey) return;
  if (e.key === " ") { e.preventDefault(); toggle(); }
  else if (/^[uUtTgGbB]$/.test(e.key)) {
    const ix = LENSES.findIndex((_, j) => lensKey(j) === e.key.toUpperCase());
    if (ix >= 0) { if (e.shiftKey) cue(ix); else switchTo(ix); }
  }
  else if (/^Digit[0-9]$/.test(e.code) || /^[0-9]$/.test(e.key)) {
    /* the physical key, so Shift+number works on any layout; the typed
       digit when a keyboard reports no code */
    const ix = Number(/^Digit[0-9]$/.test(e.code) ? e.code.slice(5) : e.key) - 1;
    if (ix >= LENSES.length) return;
    if (e.shiftKey) cue(ix); else switchTo(ix);
  }
  else if (e.key === "c" || e.key === "C") press("cut");
  else if (e.key === "a" || e.key === "A") press("burst");
  else if (e.key === "s" || e.key === "S") press("reverse");
  else if (e.key === "d" || e.key === "D") press("fold");
  else if (e.key === "f" || e.key === "F") press("trails");
  else if (e.key === "q" || e.key === "Q") { quantise.checked = !quantise.checked; hand.quantise = quantise.checked; }
  else if (e.key === "r" || e.key === "R") hand.reset();
  else if (e.key === "v" || e.key === "V") recordTake();
  else if (e.key === "m" || e.key === "M") addMark();
  else if (e.key === "i" || e.key === "I") toggleSignal();
  else if (e.key === "l" || e.key === "L") setlist.toggle();
});

/* ---- the loop ------------------------------------------------------ */

addEventListener("resize", () => body.resize());

let tick = 0;
let lastT = 0;
let lastScene: string | null = null;
let lastOnAir = hand.onAir();
function frame(now: number): void {
  const f: Frame = analyzer ? analyzer.read() : silent(audio.currentTime);
  const secs = now / 1000;

  /* the orchestration's cues, each once, as the song reaches it */
  if (orch && !audio.paused) {
    for (const c of due(orch.cues, orchT, audio.currentTime)) perform(c.action);
    orchT = audio.currentTime;
  } else if (orch && audio.currentTime < orchT) orchT = audio.currentTime;

  /* the scene playing now: when it changes, the setlist cues its lens on
     the deck that is off air and cuts to it on the beat */
  const plan = setlist.plan();
  const scene = plan ? sceneAt(plan, audio.currentTime) : null;
  if (plan && setlist.driving() && scene?.name !== lastScene) {
    const ix = scene?.lens ? LENSES.findIndex((l) => l.id === scene.lens) : -1;
    if (decks[hand.onAir()].ix !== ix) { cue(ix, true); hand.press("cut", secs); $("pad-cut").classList.add("armed"); }
  }
  lastScene = scene?.name ?? null;
  setlist.at(scene);

  /* the pads that landed on this beat */
  for (const pad of hand.step(f, secs)) {
    const b = $(`pad-${pad}`);
    b.classList.remove("armed", "landed");
    void b.offsetWidth;
    b.classList.add("landed");
    if (pad === "cut") renderDecks();
  }
  const played = hand.view(secs);

  const A = deckView(decks.a, f, "a"), B = deckView(decks.b, f, "b");
  const view = mix(A.view, B.view, played.fader);
  const emblems = [
    { marks: A.view.emblem(), colour: A.view.colour(1, 0, 0), alpha: 1 - played.fader },
    { marks: B.view.emblem(), colour: B.view.colour(1, 0, 0), alpha: played.fader },
  ];
  const lux = luxOf(f.muted ? null : f.dynamics);
  body.draw({ frame: f, view, hand: played, emblems, lux, words: f.muted ? null : view.words() }, secs);
  const tint = view.colour(1, 0, 0);

  if (!fading) fader.value = String(Math.round(played.fader * 1000));
  /* whichever way the fader moved — a cut, or a hand on it between frames —
     the page says which deck is on air */
  if (hand.onAir() !== lastOnAir) { lastOnAir = hand.onAir(); renderDecks(); }
  $("beatdot").style.opacity = String(f.muted ? 0.15 : 0.15 + 0.85 * f.dynamics.beat);
  $("pad-reverse").classList.toggle("on", played.reverse);
  $("pad-trails").classList.toggle("on", played.trails);
  $("pad-fold").classList.toggle("on", played.folds > 1);
  $("fold-n").textContent = played.folds > 1 ? `×${played.folds}` : "";

  if (tick++ % 6 === 0) {
    /* the page's accents take the lens's colour, lifted so a dark stage still reads */
    document.documentElement.style.setProperty("--tint", css(shade(hue(tint.h, tint.s, Math.max(0.75, tint.v)), 1)));
    $("time").textContent = clock(audio.currentTime);
    if (take) recBtn.textContent = `■ Stop · ${clock((performance.now() - take.started) / 1000)}`;
    $("fill").style.width = audio.duration ? `${(audio.currentTime / audio.duration) * 100}%` : "0";
    if (!$("signal").hidden) $("signal-text").textContent = readout(f, `A       ${A.label}\nB       ${B.label}`, played.fader);
  }

  /* a mark lights as the playhead crosses it */
  const t = audio.currentTime;
  if (t > lastT && t - lastT < 0.5)
    for (const i of $("ticks").children as HTMLCollectionOf<HTMLElement>) {
      const m = Number(i.dataset.t);
      if (m > lastT && m <= t) { i.classList.add("hit"); setTimeout(() => i.classList.remove("hit"), 600); }
    }
  lastT = t;

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
fromUrl().catch((e) => notify(`Could not start from this address: ${(e as Error).message}`));
