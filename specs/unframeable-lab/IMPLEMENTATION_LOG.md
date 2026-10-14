

---

## 2026-10-14 — Module 5: Allostatic load, asymmetric recovery, and refractory loop

### Implemented files

- `lab/model.js`
- `tests/model.allostasis.test.js` — added

### New model state

Every session now carries a persistent load floor and a temporary cognitive-stun window:

```js
allostaticFloor: 0.0,
refractoryUntil: null,
```

The final run output exposes the state without changing existing summary fields:

```js
result.allostasis = {
  floor,
  refractoryUntil,
  refractoryActive,
};
```

Snapshots also now carry `cortisol`, `allostaticFloor`, and `refractoryUntil`, making recovery trajectories inspectable by analysis code.

### 1. Asymmetric cortisol recovery

Stress activation remains discontinuous—arrivals, moves, Moment impact, and timeout can raise cortisol sharply. Natural recovery now follows a slow asymptotic curve around the persistent floor:

```js
const surplus = Math.max(0, st.cortisol - st.allostaticFloor);
st.cortisol = st.allostaticFloor
  + surplus * Math.exp(-100 / CORTISOL_RECOVERY_TIME_CONSTANT_MS);
```

```js
CORTISOL_RECOVERY_TIME_CONSTANT_MS = 100000;
```

The update runs at the existing 100 ms model cadence. It makes recovery materially slower than stress activation and leaves a visible stress residue after a three-minute session; a singularity cannot be erased by a brief quiet interval.

### 2. Cumulative allostatic floor

Every Moment / singularity pass raises the remembered load:

```js
st.allostaticFloor = Math.min(1, st.allostaticFloor + 0.12);
```

Natural cortisol recovery cannot pass below it. Empty Bin’s restorative cortisol reduction now also respects the same floor:

```js
st.cortisol = Math.max(st.allostaticFloor, st.cortisol - 0.45);
```

This preserves Empty Bin as a meaningful recovery act while preventing it from falsely erasing cumulative physiological load.

### 3. Refractory window — cognitive stun

A Moment creates a protected 14-second period:

```js
st.refractoryUntil = st.t + 14000;
```

While `st.t < st.refractoryUntil`, the Moment/singularity trigger is guarded. The guard is explicit even though the current Moment is also a once-per-session event; it protects the architecture when later modules introduce any additional shock-capable event.

The model emits:

```js
{
  kind: 'refractory_start',
  until: st.refractoryUntil,
  audio: {
    cue: 'refractory_aftershock',
    mode: 'low-dynamic-range-aftershock',
    release: 'decaying'
  }
}
```

### Audio / visual integration requirements

During `refractory_aftershock` and until `refractoryUntil`:

| Layer | Required reading |
|---|---|
| Audio (Module 3) | Retain the breath tail at low amplitude, narrow dynamic range, suppress new sharp transients and interference escalation; heartbeat may continue softly but should not become a new shock. |
| Canvas aura (Module 4) | Let the singularity tail dissipate; keep dim trails and a low-contrast accretion residue, but suppress a new collapse or full-intensity glow. |
| Feed panel | Return cards gradually toward cached anchors; do not create another forced visual ordering event. |

The refractory event is a stateful aftershock, not another scene change.

### Conformance

Run the full implemented test suite with:

```bash
node tests/model.empty-bin.test.js
node tests/model.moment.test.js
node tests/model.allostasis.test.js
```

`model.allostasis.test.js` validates:

1. a singularity raises `allostaticFloor` by exactly `0.12`;
2. cortisol remains at or above the floor and still retains a positive residue after a 180-second session;
3. Moment starts a precisely 14-second refractory interval and emits `refractory_aftershock`;
4. no second Moment/singularity event can occur during the guarded session;
5. Empty Bin restoration respects accumulated load rather than lowering cortisol below the floor.

### Final synthesis status

Modules **1–5** are now represented in this log and implemented where source was available:

1. **Empty Bin** — one-time agency, permanent severing, acoustic cues;
2. **Dynamic Moment** — vulnerability or algorithmic-impatience shock;
3. **Organic audio** — recorded browser Web Audio integration architecture;
4. **Visual resonance** — recorded Canvas aura/singularity integration architecture;
5. **Allostatic + refractory loop** — model implementation, test coverage, and integration state.

No final bundle has been compiled. The next synthesis pass should apply the documented audio and Canvas contracts to the actual host page once its source is supplied.
