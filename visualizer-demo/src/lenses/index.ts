import { frost } from "./frost";
import { garden } from "./garden";
import { kiln } from "./kiln";
import type { Lens } from "./lens";
import { lissajous } from "./lissajous";
import { prism } from "./prism";
import { pulley } from "./pulley";
import { sternBrocot } from "./sternbrocot";
import { sunburst } from "./sunburst";
import { ripple } from "./ripple";
import { swarm } from "./swarm";
import { tide } from "./tide";

export { type Context, PLAIN, type Lens, type View } from "./lens";

/** the key for each lens: digits for the first nine, then letters */
export const lensKey = (ix: number) => (ix < 9 ? String(ix + 1) : ["U", "T"][ix - 9] ?? "");

export const LENSES: readonly Lens<any>[] = [lissajous, tide, ripple, swarm, frost, kiln, garden, prism, pulley, sunburst, sternBrocot];
