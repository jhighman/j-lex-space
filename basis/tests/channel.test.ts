/* Only `audio/` may touch Web Audio; everything else knows the frame's
   type and nothing more of the sound. This is a list, and the list is a
   test, so a new file is held to it without anyone remembering. */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname, "..", "src");
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n: string) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const files = walk(SRC).filter((f) => f.endsWith(".ts")).map((f) => ({ path: relative(SRC, f), text: readFileSync(f, "utf8") }));

const AUDIO = /\b(AudioContext|AnalyserNode|getByteFrequencyData|getFloatFrequencyData|createMediaElementSource|HTMLAudioElement)\b/;
const READERS = ["render/", "lenses/", "law/", "marks/", "setlist/", "hand/", "record/"];

describe("one way in for the sound", () => {
  it("found the source", () => expect(files.length).toBeGreaterThan(8));

  for (const f of files.filter((f) => READERS.some((r) => f.path.startsWith(r)))) {
    it(`${f.path} has no route to the audio`, () => {
      const code = f.text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
      expect(code).not.toMatch(AUDIO);
      expect(code).not.toMatch(/from\s+["'][./]*audio\/analyzer["']/);
    });
  }

  /* colour is the lens's; setlists and the hand may never touch it */
  it("setlists and the hand are never handed a colour or a light", () => {
    for (const f of files.filter((f) => ["setlist/", "hand/"].some((r) => f.path.startsWith(r))))
      expect(f.text.replace(/\/\*[\s\S]*?\*\//g, ""), f.path).not.toMatch(/\bAlbedo\b|\btintOf\b|\bshade\b|\bluxOf\b|law\/light/);
  });

  it("lenses are never handed the light: loudness reaches brightness only through the body", () => {
    for (const f of files.filter((f) => f.path.startsWith("lenses/")))
      expect(f.text.replace(/\/\*[\s\S]*?\*\//g, ""), f.path).not.toMatch(/\bluxOf\b|\bshade\b/);
  });

  it("colours are made in exactly one place", () => {
    const makers = files.filter((f) => /\bmake\(/.test(f.text)).map((f) => f.path);
    expect(makers).toEqual(["law/light.ts"]);
  });
});
