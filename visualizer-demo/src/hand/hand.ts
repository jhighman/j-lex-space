/* The hand: the performer's input.

   Three things move the picture: the music, the lenses, and a person. The
   hand is the person's part, and it is held to one rule — it moves shapes
   and nothing else. It can grab the body and turn it, zoom it, fold it,
   burst it, leave trails, and crossfade between two lenses. It is never
   handed a colour or the light, so however hard it is played the lens
   still chooses the colours and the music still sets the brightness.
   `tests/channel.test.ts` holds it to that.

   Pads land on the beat. A pad pressed between beats is armed, and fires
   on the next onset the analyser reports, so someone doing this for the
   first time still lands in time. If the music gives no onset for a
   while, the pad fires anyway; a pad that waits forever does not work.
   Landing on the beat can be switched off.

   It is plain state, stepped by a frame and a clock, so a test can play it
   with literal frames and no page. */

import type { Frame } from "../audio/frame";

export type Pad = "burst" | "reverse" | "fold" | "trails" | "cut";

export const FOLDS = [1, 2, 3, 4, 6] as const;

/** how long an armed pad waits for an onset before landing anyway */
export const PATIENCE = 0.6;

export interface HandView {
  /** radians added to the body's turn, from scratching */
  readonly twist: number;
  /** scale of the whole body */
  readonly zoom: number;
  /** 1 at the moment of a burst, falling to 0 */
  readonly burst: number;
  /** the body turns the other way */
  readonly reverse: boolean;
  /** extra mirror folds, multiplied into the lens's */
  readonly folds: number;
  /** long trails */
  readonly trails: boolean;
  /** the platter is held: the body stops following the music's turn */
  readonly holding: boolean;
  /** the crossfader, 0 = deck A, 1 = deck B */
  readonly fader: number;
}

export class Hand {
  quantise = true;
  twist = 0;
  zoom = 1;
  holding = false;
  reverse = false;
  trails = false;
  private fold = 0;
  private burstAt = -Infinity;
  private fader = 0;
  private glide: { from: number; to: number; start: number; dur: number } | null = null;
  private armed: { pad: Pad; at: number }[] = [];
  private lastBeats = -1;
  private period = 0.5;

  /** arm a pad; it lands on the next beat, or now if not quantising */
  press(pad: Pad, now: number): void {
    if (this.armed.some((a) => a.pad === pad)) return;
    this.armed.push({ pad, at: now });
    if (!this.quantise) this.step(null, now);
  }

  isArmed(pad: Pad): boolean {
    return this.armed.some((a) => a.pad === pad);
  }

  /** the crossfader by hand: immediate, and cancels a glide */
  setFader(x: number): void {
    this.glide = null;
    this.fader = Math.max(0, Math.min(1, x));
  }

  /** glide the crossfader to a position over some seconds */
  glideFader(to: number, now: number, seconds: number): void {
    const x = Math.max(0, Math.min(1, to));
    if (seconds <= 0) { this.setFader(x); return; }
    this.glide = { from: this.fader, to: x, start: now, dur: seconds };
  }

  /** which deck is on air: the one the fader is nearer */
  onAir(): "a" | "b" {
    return this.fader < 0.5 ? "a" : "b";
  }

  /** advance by one frame; returns the pads that landed on it */
  step(f: Frame | null, now: number): Pad[] {
    let beat = false;
    if (f && !f.muted) {
      beat = this.lastBeats >= 0 && f.rhythm.beats !== this.lastBeats;
      this.lastBeats = f.rhythm.beats;
      if (f.rhythm.bpm) this.period = 60 / f.rhythm.bpm;
    }
    const silent = !f || f.muted;
    const landed: Pad[] = [];
    this.armed = this.armed.filter((a) => {
      if (!this.quantise || beat || silent || now - a.at > PATIENCE) {
        landed.push(a.pad);
        return false;
      }
      return true;
    });
    for (const pad of landed) this.land(pad, now);
    if (this.glide) {
      const k = Math.min(1, (now - this.glide.start) / this.glide.dur);
      /* eased, so a cut swings across rather than slides */
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      this.fader = this.glide.from + (this.glide.to - this.glide.from) * e;
      if (k >= 1) this.glide = null;
    }
    return landed;
  }

  private land(pad: Pad, now: number): void {
    switch (pad) {
      case "burst": this.burstAt = now; break;
      case "reverse": this.reverse = !this.reverse; break;
      case "fold": this.fold = (this.fold + 1) % FOLDS.length; break;
      case "trails": this.trails = !this.trails; break;
      /* a cut swings to the other deck over one beat */
      case "cut":
        this.glide = { from: this.fader, to: this.fader < 0.5 ? 1 : 0, start: now, dur: Math.max(0.25, this.period) };
        break;
    }
  }

  reset(): void {
    this.twist = 0;
    this.zoom = 1;
    this.fold = 0;
    this.reverse = false;
    this.trails = false;
  }

  view(now: number): HandView {
    return {
      twist: this.twist,
      zoom: this.zoom,
      burst: Math.max(0, 1 - (now - this.burstAt) / 0.7),
      reverse: this.reverse,
      folds: FOLDS[this.fold],
      trails: this.trails,
      holding: this.holding,
      fader: this.fader,
    };
  }
}
