# The Untrained Attention

One attention head, reached by two routes. On the left, a learned path:
the query and key projections start random and gradient descent walks
them down a loss, step after step, until the attention map matches a
target. On the right, an algorithmic simulator: the same target map is
assembled by a short fixed trace of elementary operations, with no data
and no loss. The volume below holds both results as height fields so
they can be set side by side, laid over each other, or differenced. The
learned field throws off sparks while it descends, dense while the loss
is high and dying away as it cools; the constructed field rises in one
wave and never sparks. When they agree within tolerance the match
indicator lights, the glow swells, and a ring runs out across the ground.

The piece illustrates the distinction in Dutta, Chakrabarty, Ansari and
Das, *On the Existence of Universal Simulators of Attention*
(arXiv:2506.18739): that the map a head computes can be constructed by
another transformer rather than only learned. It is an illustration of
that distinction, not a reproduction of the paper's construction. The
"simulator" here is a plain trace of the softmax-attention arithmetic;
the paper's simulator is itself a transformer, built with RASP programs.

Built from Lex's brief ([issue #7](https://github.com/jhighman/j-lex-space/issues/7))
by one process, Claude working with Jeff. It exists for a different
reader to say where it is wrong.

## Run it

Open `index.html` from any static server, for example from the
repository root:

```sh
python3 -m http.server 8000
```

then `http://localhost:8000/the-untrained-attention/`. No build step.
Babylon.js and D3 v7 load from their CDNs; everything else is in the one
file.

## Controls

- **sequence n**, **head dim d**: rebuild the target head and both
  paths. The target is fixed by a seed, so the same n and d always give
  the same map.
- **show in volume**: Learned, Both, or Constructed.
- **arrangement**: Side by side, Overlay (constructed half-transparent
  over learned), or Difference (one field of |learned − constructed|,
  shown once the constructed path has run).
- Learned path: **Play/Pause**, **Step** (one gradient step), **Reset**,
  **speed** (gradient steps per frame), and a **scrub** slider over the
  recorded steps. Play stops on its own once within tolerance.
- Algorithmic simulator: **Construct**, **Step** (one stage),
  **Reset**, and **Show intermediate ops**, which makes Construct play
  the eight stages one by one instead of snapping to the result.

Every button is a native button and reachable by keyboard; status is
written in words, not only in colour.

## State

One object, which every view subscribes to:

```js
{ mode, view, steps, matrixMatch, showOps, n, d, playing, speed, stage, scrub, loss, maxDiff }
```

`mode` is what the volume shows, `view` its arrangement, `stage` the
last construction stage shown (−1 before Construct), `scrub` null when
live or an index into the snapshots, `matrixMatch` true when the
constructed path has run and max |Δ| is under the tolerance.

## Where to change things

All at the top of the script in `index.html`:

- `LR`: learning rate of the plain gradient descent.
- `TOL`: the largest cell difference that counts as a match.
- `SNAP_EVERY`: how often a snapshot is kept for the scrub.
- `TARGET_SEED`, `INIT_SEED`: the target head and the learned start.
- The sliders' `min`/`max` in the HTML bound n (6–12) and d (4–16).
- `STAGES`: the construction trace, one labelled operation per entry.
- `gradientStep()`: the gradient of the per-row KL divergence through
  the softmax, written out by hand in the comment above it.

With the defaults, n = 8 and d = 8 settles within tolerance after
1,944 steps; larger n takes longer.

## Citations

Dutta, Chakrabarty, Ansari, Das. *On the Existence of Universal
Simulators of Attention.* arXiv:2506.18739 (2025, revised 2026).
Supporting: Weiss, Goldberg, Yahav, *Thinking Like Transformers* (the
RASP framework); Vaswani et al., *Attention Is All You Need* (2017).
