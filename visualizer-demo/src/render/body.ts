/* The body: an emblem, a shell, a spiral of motes inside it, and twelve
   spokes for the pitch classes laid round the circle of fifths.

   It is handed a frame, a lens's view, the hand's view, the emblems and
   one lux, and that is all it knows. It imports no audio and no lens —
   `tests/channel.test.ts` holds it to that. Every colour it draws is one a
   lens handed it (grey when there is no lens), shaded by the lux, so the
   music reaches colour only as value. The hand arrives as
   numbers of angle and size, and there is nowhere for it to choose a
   colour. */

import type { Frame } from "../audio/frame";
import type { HandView } from "../hand/hand";
import { type Albedo, css, shade } from "../law/light";
import { GOLDEN, type Mark, type View } from "../lenses/lens";

export interface Emblem {
  readonly marks: readonly Mark[];
  readonly colour: Albedo;
  /** how much of it shows: the deck's share of the fader */
  readonly alpha: number;
}

export interface Scene {
  readonly frame: Frame;
  readonly view: View;
  readonly hand: HandView;
  readonly emblems: readonly Emblem[];
  readonly lux: number;
  /** words to set under the body: the lens's, if it has any */
  readonly words: string | null;
}

const TAU = Math.PI * 2;

/* the twelve pitch classes in fifths order, so a chord's spokes cluster */
const FIFTHS_TURN = Array.from({ length: 12 }, (_, pc) => ((pc * 7) % 12) / 12 - 0.25);

export class Body {
  private readonly g: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private angle = 0;
  private radius = 0.3;
  private count = 400;
  private div = GOLDEN;
  private cx = 0;
  private cy = 0;
  private rest = 0;
  private last = 0;
  private shown: string | null = null;
  private shownAt = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const g = canvas.getContext("2d");
    if (!g) throw new Error("no 2d context");
    this.g = g;
    this.resize();
  }

  resize(): void {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw(s: Scene, now: number): void {
    const dt = this.last ? Math.min(0.1, now - this.last) : 1 / 60;
    this.last = now;
    const { g, w, h } = this;
    const f = s.frame;
    const u = s.view;
    const hand = s.hand;
    const half = Math.min(w, h) / 2;

    /* the readings the view re-expresses. In silence the body breathes on
       its own clock and the light is exactly the authored light. */
    let x: number, r: number, n: number;
    if (f.muted) {
      this.rest += dt / 90;
      x = this.rest % 1;
      r = 0.32;
      n = 420;
    } else {
      x = ((f.rhythm.beats + f.rhythm.phase) / 16) % 1;
      r = 0.22 + 0.5 * f.dynamics.energy;
      n = Math.round(300 + 1500 * f.dynamics.energy);
    }

    /* a held platter stops following the music; let go, and it eases back */
    if (!hand.holding) {
      const target = u.turn(x) * TAU * (hand.reverse ? -1 : 1);
      let d = (target - this.angle) % TAU;
      if (d > Math.PI) d -= TAU;
      if (d < -Math.PI) d += TAU;
      this.angle += d * 0.12;
    }
    this.radius += (u.shell(r) - this.radius) * 0.18;
    this.count += (Math.min(2400, u.motes(n)) - this.count) * 0.1;
    /* the divergence eases, so a change of lens is a morph between two
       structures rather than a cut from one to the other */
    this.div += (u.divergence(GOLDEN) - this.div) * 0.06;
    const folds = Math.max(1, Math.min(12, Math.round(u.folds(1) * hand.folds)));

    const beat = f.muted ? 0 : f.dynamics.beat;
    const flux = f.muted ? 0 : f.dynamics.flux;
    const bright = f.muted ? 0.3 : f.dynamics.bright;

    /* the ground, laid thin so the last frames show through as a trail */
    g.fillStyle = css(shade(u.ground(), s.lux), hand.trails ? 0.05 : 0.22);
    g.fillRect(0, 0, w, h);

    const R = this.radius * half * hand.zoom;
    const [ox, oy] = u.centre();
    this.cx += (w / 2 + ox * R - this.cx) * (this.cx ? 0.05 : 1);
    this.cy += (h / 2 + oy * R - this.cy) * (this.cy ? 0.05 : 1);
    const cx = this.cx, cy = this.cy;
    const turn = this.angle + hand.twist;

    /* the emblems, faint, under everything: one for each lens on the decks */
    g.lineCap = "round";
    for (const p of s.emblems) {
      if (p.alpha < 0.02) continue;
      for (const m of p.marks) {
        const a = p.alpha * (m.v ?? 0.5) * 0.55;
        g.strokeStyle = g.fillStyle = css(shade(p.colour, s.lux * 0.85), a);
        g.lineWidth = 1.2;
        g.beginPath();
        if ("circle" in m) g.arc(cx, cy, m.circle * R, 0, TAU);
        else if ("arc" in m) g.arc(cx, cy, m.arc[0] * R, m.arc[1] * TAU, m.arc[2] * TAU);
        else if ("line" in m) { g.moveTo(cx + m.line[0] * R, cy + m.line[1] * R); g.lineTo(cx + m.line[2] * R, cy + m.line[3] * R); }
        else { g.arc(cx + m.dot[0] * R, cy + m.dot[1] * R, Math.max(1.5, m.dot[2] * R), 0, TAU); g.fill(); continue; }
        g.stroke();
      }
    }

    if (!f.muted) {
      for (let pc = 0; pc < 12; pc++) {
        const c = f.harmony.chroma[pc];
        if (c < 0.08) continue;
        const t = FIFTHS_TURN[pc] + turn / TAU;
        const a = t * TAU;
        const r0 = R * 1.08, r1 = R * (1.12 + 0.55 * c);
        g.strokeStyle = css(shade(u.colour(1, t, pc), s.lux * (0.5 + 0.5 * c)), 0.2 + 0.55 * c);
        g.lineWidth = 1 + 2.5 * c;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        g.stroke();
      }
    }

    /* rings, for a lens that draws them: filled arcs from the top, turning
       with the body, labelled where a label fits */
    const rings = u.rings();
    if (rings.length) {
      g.save();
      g.translate(cx, cy);
      g.rotate(turn);
      for (const r of rings) {
        const a0 = r.x0 * TAU - Math.PI / 2 + 0.002, a1 = r.x1 * TAU - Math.PI / 2 - 0.002;
        if (a1 <= a0) continue;
        g.beginPath();
        g.arc(0, 0, r.r1 * R, a0, a1);
        g.arc(0, 0, r.r0 * R + 1, a1, a0, true);
        g.closePath();
        g.fillStyle = css(shade(r.colour, s.lux * r.v), 0.92 * (r.alpha ?? 1));
        g.fill();
      }
      g.font = `11px ui-sans-serif, -apple-system, system-ui, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      for (const r of rings) {
        if (!r.label) continue;
        const mid = (r.r0 + r.r1) / 2 * R, width = (r.x1 - r.x0) * TAU * mid;
        if (width < g.measureText(r.label).width + 10 || (r.alpha ?? 1) < 0.5) continue;
        const a = ((r.x0 + r.x1) / 2) * TAU - Math.PI / 2;
        g.save();
        g.rotate(a);
        g.translate(mid, 0);
        if (Math.cos(a + turn) < 0) g.rotate(Math.PI);
        g.fillStyle = `rgba(10,10,16,${0.8 * (r.alpha ?? 1)})`;
        g.fillText(r.label, 0, 0);
        g.restore();
      }
      g.restore();
    }

    g.strokeStyle = css(shade(u.colour(1, 0, 0), s.lux), 0.85);
    g.lineWidth = 1.2 + 4 * beat + 3 * hand.burst;
    g.beginPath();
    g.arc(cx, cy, R, 0, TAU);
    g.stroke();

    /* motes: each asks the lens where it is, how lit, and what colour.
       Inner ones turn with the body and outer ones lag, so a turn reads as
       a twist. With folds, each is drawn once per fold, alternate folds
       mirrored, and the body becomes a kaleidoscope of itself. */
    const N = Math.max(folds, Math.round(this.count / folds));
    const size = 1.1 + 1.6 * bright;
    const blast = hand.burst * hand.burst;
    for (let i = 0; i < N; i++) {
      const k0 = i / N;
      const k = 0.94 * Math.sqrt(k0);
      const at = i * this.div + (turn / TAU) * (1.6 - k0);
      const p = u.place(k, at, i);
      if (p.v < 0.02) continue;
      const rho = R * p.k * (1 + 0.06 * flux * Math.sin(i * 12.9898)) * (1 + 0.9 * blast * (0.3 + k0));
      g.fillStyle = css(shade(u.colour(p.k, p.a, i), s.lux * p.v * (0.55 + 0.45 * (1 - k0))), 0.88);
      const a = p.a * TAU;
      for (let j = 0; j < folds; j++) {
        const aj = (j % 2 ? -a : a) + (j * TAU) / folds;
        g.fillRect(cx + Math.cos(aj) * rho - size / 2, cy + Math.sin(aj) * rho - size / 2, size, size);
      }
    }

    /* the words, under the body, fading in when they change; drawn on the
       canvas so a recorded take carries them */
    if (s.words !== this.shown) { this.shown = s.words; this.shownAt = now; }
    if (this.shown) {
      const fade = Math.min(1, (now - this.shownAt) / 0.8);
      const size = Math.max(15, Math.min(28, half * 0.07));
      g.font = `italic ${size}px Georgia, "Times New Roman", serif`;
      g.textAlign = "center";
      g.textBaseline = "top";
      /* under the body, but clear of the deck and transport at the bottom,
         on a dark band so it reads over rings as well as motes */
      const y = Math.min(cy + R * 1.18 + 14, h - 250);
      const tw = Math.min(w - 32, g.measureText(this.shown).width);
      g.fillStyle = css(shade(u.ground(), 1), 0.72 * fade);
      g.beginPath();
      g.roundRect(w / 2 - tw / 2 - 14, y - 6, tw + 28, size * 1.5 + 6, 8);
      g.fill();
      g.fillStyle = css(shade(u.colour(1, 0, 0), Math.max(1, s.lux)), 0.9 * fade);
      g.shadowColor = "rgba(0,0,0,0.85)";
      g.shadowBlur = 12;
      g.fillText(this.shown, w / 2, y, w - 32);
      g.shadowBlur = 0;
    }
  }
}
