/* A take: the picture and the sound, recorded together into one file.

   The canvas is the body and nothing else — the deck, the panels and the
   buttons are page, not picture — so a take is a clean film. The sound is
   the track itself, tapped where it leaves the analyser, so what is heard
   is what is recorded.

   MP4 first, because that is what a person can send anywhere; WebM only
   where the browser cannot write MP4 (Firefox), and the file says which
   it is by its extension. */

export interface Format { readonly mime: string; readonly ext: "mp4" | "webm" }

const PREFERENCE: readonly Format[] = [
  { mime: "video/mp4;codecs=avc1.640028,mp4a.40.2", ext: "mp4" },
  { mime: "video/mp4;codecs=avc1,mp4a.40.2", ext: "mp4" },
  { mime: "video/mp4", ext: "mp4" },
  { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
  { mime: "video/webm", ext: "webm" },
];

/** the best format this browser can write, or null if it cannot record */
export function format(supports: (mime: string) => boolean = (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)): Format | null {
  return PREFERENCE.find((f) => supports(f.mime)) ?? null;
}

export class Take {
  private readonly chunks: Blob[] = [];
  private readonly rec: MediaRecorder;
  readonly started = performance.now();

  constructor(canvas: HTMLCanvasElement, sound: MediaStream, readonly format: Format) {
    const stream = new MediaStream([...canvas.captureStream(60).getVideoTracks(), ...sound.getAudioTracks()]);
    this.rec = new MediaRecorder(stream, { mimeType: format.mime, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 256_000 });
    this.rec.addEventListener("dataavailable", (e) => { if (e.data.size) this.chunks.push(e.data); });
  }

  start(): void {
    /* a chunk a second, so a long take is not held as one buffer */
    this.rec.start(1000);
  }

  /** stop, and hand back the finished file */
  stop(): Promise<Blob> {
    return new Promise((resolve) => {
      this.rec.addEventListener("stop", () => resolve(new Blob(this.chunks, { type: this.format.mime.split(";")[0] })), { once: true });
      this.rec.stop();
    });
  }
}
