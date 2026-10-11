/* Captions: what a recorded take says about itself, drawn on the canvas so
   the take carries them. They are the page talking, not the music, so they
   are set in a plain neutral and take no colour from any lens.

     top left    breadcrumbs of the API: the address the take was opened
                 with, then every call the performance made, newest last,
                 older ones fading
     top right   which lens is on air and what it does, what its state
                 says of itself right now (its label), and the score's
                 note for the moment, if it has one

   Off unless asked for (`captions=1`, or "captions": true in an
   orchestration), so the instrument itself stays uncluttered. */

export interface Crumb {
  /** the song's time when it was made, in seconds */
  readonly at: number;
  readonly call: string;
}

export interface Captions {
  readonly crumbs: readonly Crumb[];
  readonly title: string | null;
  readonly idea: string | null;
  /** the lens's own account of its state this frame, if it has one */
  readonly label?: string | null;
  readonly note: string | null;
  /** seconds since the explainer last changed, for fading it in */
  readonly fresh: number;
}

/** how many crumbs show at once */
export const CRUMBS = 9;

const INK = (a: number) => `rgba(226,230,240,${a})`;
const DIM = (a: number) => `rgba(150,158,178,${a})`;
const MONO = `ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
const SANS = `ui-sans-serif, -apple-system, system-ui, sans-serif`;
const SERIF = `Georgia, "Times New Roman", serif`;

export const clock = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

/** words broken into lines no wider than `max` */
function wrap(g: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && g.measureText(next).width > max) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/* a faint dark panel behind a block of text, so a spoke or a ring passing
   under it does not cut through the words */
function panel(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  g.save();
  g.shadowBlur = 0;
  g.fillStyle = "rgba(6,7,12,0.62)";
  g.beginPath();
  g.roundRect(x, y, w, h, 8);
  g.fill();
  g.restore();
}

export function drawCaptions(g: CanvasRenderingContext2D, w: number, c: Captions): void {
  const pad = Math.max(16, w * 0.018);
  const size = Math.max(11, Math.min(15, w * 0.0085));
  g.save();
  g.shadowColor = "rgba(0,0,0,0.9)";
  g.shadowBlur = 8;
  g.textBaseline = "top";

  /* the breadcrumbs */
  g.textAlign = "left";
  const shown = c.crumbs.slice(-CRUMBS);
  g.font = `${size}px ${MONO}`;
  const longest = Math.min(w * 0.42, Math.max(0, ...shown.map((x) => g.measureText(x.call).width)));
  panel(g, pad - 10, pad - 8, size * 4.4 + longest + 20, size * 1.6 + shown.length * size * 1.55 + 10);
  g.font = `600 ${size * 0.85}px ${SANS}`;
  g.fillStyle = DIM(0.9);
  g.fillText("API", pad, pad);
  shown.forEach((crumb, j) => {
    const age = shown.length - 1 - j;
    const a = Math.max(0.22, 1 - age * 0.11);
    const y = pad + size * 1.6 + j * size * 1.55;
    g.font = `${size}px ${MONO}`;
    g.fillStyle = DIM(a * 0.85);
    g.fillText(clock(crumb.at), pad, y);
    g.fillStyle = INK(a);
    g.fillText(crumb.call, pad + size * 4.4, y, w * 0.42);
  });

  /* the explainer */
  if (c.title) {
    const fade = Math.min(1, c.fresh / 0.6);
    const width = Math.min(w * 0.3, size * 30);
    const x = w - pad;
    g.textAlign = "right";
    /* measure first, for the panel behind it */
    g.font = `${size}px ${SANS}`;
    const ideaLines = c.idea ? wrap(g, c.idea, width) : [];
    g.font = `${size * 0.92}px ${MONO}`;
    const labelLines = c.label ? wrap(g, c.label, width) : [];
    g.font = `italic ${size}px ${SERIF}`;
    const noteLines = c.note ? wrap(g, c.note, width) : [];
    g.font = `italic ${size * 1.75}px ${SERIF}`;
    const across = Math.max(g.measureText(c.title).width, ...[...ideaLines, ...labelLines, ...noteLines].map(() => width));
    const tall = size * 2.4 + ideaLines.length * size * 1.45 + (labelLines.length ? size * 0.5 + labelLines.length * size * 1.4 : 0) + (noteLines.length ? size * 0.6 + noteLines.length * size * 1.45 : 0);
    panel(g, x - Math.min(across, width) - 12, pad - 8, Math.min(across, width) + 22, tall + 12);
    let y = pad;
    g.font = `italic ${size * 1.75}px ${SERIF}`;
    g.fillStyle = INK(0.95 * fade);
    g.fillText(c.title, x, y);
    y += size * 2.4;
    g.font = `${size}px ${SANS}`;
    g.fillStyle = INK(0.8 * fade);
    for (const line of ideaLines) { g.fillText(line, x, y); y += size * 1.45; }
    if (labelLines.length) {
      y += size * 0.5;
      g.font = `${size * 0.92}px ${MONO}`;
      g.fillStyle = INK(0.9);
      for (const line of labelLines) { g.fillText(line, x, y); y += size * 1.4; }
    }
    if (noteLines.length) {
      y += size * 0.6;
      g.font = `italic ${size}px ${SERIF}`;
      g.fillStyle = DIM(0.95 * fade);
      for (const line of noteLines) { g.fillText(line, x, y); y += size * 1.45; }
    }
  }
  g.restore();
}
