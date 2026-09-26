export type CqdMode = "clean" | "interrupted" | "reordered";

export const SOS_WAVEFORM = "···———···" as const;

export const CQD_FRAMES: Record<
  CqdMode,
  { tokens: readonly string[]; status: string; diagnosis: string }
> = {
  clean: {
    tokens: ["C", "Q", "D"],
    status: "CHANNEL NOMINAL",
    diagnosis: "Three distinct values depend on the spaces between them.",
  },
  interrupted: {
    tokens: ["C", "∅", "D"],
    status: "NOISE INSERTED",
    diagnosis: "The middle token disappeared. The surrounding state is still exposed.",
  },
  reordered: {
    tokens: ["D", "Q", "C"],
    status: "ORDER CORRUPTED",
    diagnosis: "A mutable container permits meaning to be reordered after review.",
  },
};

export function nextCqdMode(mode: CqdMode): CqdMode {
  return mode === "clean" ? "interrupted" : mode === "interrupted" ? "reordered" : "clean";
}

/**
 * Runs the protected action and makes teardown unconditional. The UI uses a visual
 * timer, while this function gives the State 0 guarantee a direct unit-testable form.
 */
export function runProtectedSos<T>(
  transmit: (waveform: typeof SOS_WAVEFORM) => T,
  teardown: () => void,
): T {
  const isolatedWaveform = SOS_WAVEFORM;
  try {
    return transmit(isolatedWaveform);
  } finally {
    teardown();
  }
}

export type TransmissionOutcome =
  | { path: "completed"; marks: number }
  | { path: "raised"; message: string };

/**
 * The transmission the lab actually runs. Both the clean payload and the faulting
 * one go through runProtectedSos, so `teardown` is reached either way — the caller
 * observes only which completion path was taken, never whether State 0 was restored.
 */
export function transmitWithOutcome(
  faultArmed: boolean,
  teardown: () => void,
): TransmissionOutcome {
  try {
    const marks = runProtectedSos((waveform) => {
      if (faultArmed) throw new Error("carrier fault");
      return waveform.length;
    }, teardown);
    return { path: "completed", marks };
  } catch (error) {
    return {
      path: "raised",
      message: error instanceof Error ? error.message : "unknown fault",
    };
  }
}
