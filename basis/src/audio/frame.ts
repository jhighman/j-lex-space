/* The frame: what the analyser heard in one moment, and the only thing
   the rest of the page is given of the sound.

   A frame is a plain, frozen object with no analyser, no audio context and
   no clock inside it. Anything that takes a frame can therefore be handed
   one written out as a literal, which is how every lens and the hand are
   tested: with no page and no music anywhere near them.

   The readings are grouped by what they are allowed to drive:

     Dynamics — how loud, how struck, how high. Brightness and size.
     Harmony  — what is sounding. What a lens may build its colours from.
     Rhythm   — where in the beat. Turns, phases, counts.
*/

export interface Dynamics {
  /** loudness against this track's own recent ceiling, 0..1 */
  readonly energy: number;
  /** 1 on an onset, falling to 0 over 180 ms */
  readonly beat: number;
  /** positive spectral flux against its own recent maximum, 0..1 */
  readonly flux: number;
  /** spectral centroid, smoothed, 0..1 */
  readonly bright: number;
}

export interface Harmony {
  /** twelve pitch classes from C, each 0..1 against the loudest */
  readonly chroma: readonly number[];
  /** 0 = C .. 11 = B, held with hysteresis so a passing chord is not a key */
  readonly tonic: number;
  readonly minor: boolean;
}

export interface Rhythm {
  /** whole onsets counted since play began */
  readonly beats: number;
  /** 0..1 through the current beat, on the estimated period */
  readonly phase: number;
  /** 0 until there are enough onsets to say */
  readonly bpm: number;
}

/* A silent frame carries no readings at all, rather than zeros. A zero is
   a measurement and silence is the absence of one; the type makes it
   impossible to read an energy off a track that is not playing. */
export interface Silent {
  readonly muted: true;
  readonly t: number;
}

export interface Sounding {
  readonly muted: false;
  readonly t: number;
  readonly dynamics: Dynamics;
  readonly harmony: Harmony;
  readonly rhythm: Rhythm;
}

export type Frame = Silent | Sounding;

export const silent = (t: number): Silent => Object.freeze({ muted: true, t });

/** deep-freeze a sounding frame so nothing that reads it can change it */
export function sounding(f: Omit<Sounding, "muted">): Sounding {
  return Object.freeze({
    muted: false,
    t: f.t,
    dynamics: Object.freeze({ ...f.dynamics }),
    harmony: Object.freeze({ ...f.harmony, chroma: Object.freeze([...f.harmony.chroma]) }),
    rhythm: Object.freeze({ ...f.rhythm }),
  });
}
