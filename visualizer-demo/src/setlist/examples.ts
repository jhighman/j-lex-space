/* Setlists that ship with the page. The first three are written in shapes
   so they fit tracks nobody has heard yet; the fourth asks for things
   most tracks do not have, to show what a missing scene looks like. */

import type { Setlist } from "./setlist";

export const EXAMPLES: readonly Setlist[] = [
  {
    title: "Weather",
    note: "calm water, a build into heat, a storm, and frost to finish",
    rules: ["in order", "end on the lull"],
    scenes: [
      { name: "still water", asks: "the start", lens: "tide", caption: "still water" },
      { name: "warming", asks: "a build", lens: "kiln", caption: "it warms" },
      { name: "the storm", asks: "the peak", span: "two parts", lens: "ripple" },
      { name: "breaking up", asks: "a dip", lens: "swarm", caption: "and breaks" },
      { name: "frost", asks: "the lull", lens: "frost", caption: "frost" },
    ],
  },
  {
    title: "Growth",
    note: "a seed, a jump, a long plateau, and the fall",
    rules: ["in order", "scenes at least 8 seconds"],
    scenes: [
      { name: "seed", asks: "the start", lens: "garden" },
      { name: "shoot", asks: "a jump", lens: "lissajous", caption: "all at once" },
      { name: "canopy", asks: "a plateau", lens: "prism" },
      { name: "autumn", asks: "a release", lens: "garden", caption: "and back" },
    ],
  },
  {
    title: "Light",
    note: "the same journey, told in brightness rather than loudness",
    rules: ["in order"],
    scenes: [
      { name: "dark", asks: "the darkest", lens: "none" },
      { name: "dawn", asks: "getting brighter", lens: "prism", caption: "dawn" },
      { name: "noon", asks: "the brightest", lens: "kiln" },
      { name: "dusk", asks: "getting darker", lens: "tide", caption: "dusk" },
    ],
  },
  {
    title: "Too much",
    note: "three new keys and long scenes: most tracks cannot do this, and the log says so",
    rules: ["in order", "nothing missing", "scenes at least 30 seconds"],
    scenes: [
      { name: "first door", asks: "a new key", lens: "lissajous", caption: "a new key" },
      { name: "second door", asks: "a new key", lens: "garden", caption: "another" },
      { name: "third door", asks: "a new key", lens: "prism", caption: "and another" },
      { name: "the hall", asks: "the peak", span: "three parts", lens: "kiln" },
    ],
  },
];
