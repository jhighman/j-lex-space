import { frost } from "./frost";
import { garden } from "./garden";
import { kiln } from "./kiln";
import type { Lens } from "./lens";
import { lissajous } from "./lissajous";
import { prism } from "./prism";
import { ripple } from "./ripple";
import { swarm } from "./swarm";
import { tide } from "./tide";

export { PLAIN, type Lens, type View } from "./lens";

export const LENSES: readonly Lens<any>[] = [lissajous, tide, ripple, swarm, frost, kiln, garden, prism];
