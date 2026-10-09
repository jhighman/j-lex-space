import { describe, expect, it } from "vitest";
import { parse, identify, verdict } from "../src/marks/fingerprint";

const bytes = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;

describe("a mark set names the record it was placed on", () => {
  it("accepts the same record under another name", async () => {
    const a = await identify("song.mp3", bytes("the same bytes"));
    const b = await identify("renamed.mp3", bytes("the same bytes"));
    expect(verdict({ version: 1, track: a, marks: [1, 2] }, b).kind).toBe("same");
  });

  it("refuses a different record, and says both", async () => {
    const a = await identify("song.mp3", bytes("one master"));
    const b = await identify("song.mp3", bytes("another master"));
    const v = verdict({ version: 1, track: a, marks: [1] }, b);
    expect(v.kind).toBe("other");
    if (v.kind !== "other") return;
    expect(v.why).toContain(a.sha256.slice(0, 12));
    expect(v.why).toContain(b.sha256.slice(0, 12));
  });

  it("warns on marks that name no record", async () => {
    const b = await identify("x.mp3", bytes("x"));
    expect(verdict(parse('{"version":1,"track":null,"marks":[3,1]}'), b).kind).toBe("unbound");
  });

  it("sorts on parse and rejects what is not a mark set", () => {
    expect(parse('{"version":1,"marks":[3,1,2]}').marks).toEqual([1, 2, 3]);
    expect(() => parse('{"marks":["a"]}')).toThrow();
  });
});
