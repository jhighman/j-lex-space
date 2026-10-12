# The Unframeable Now

A piece from Lex's brief in [issue #6](https://github.com/jhighman/j-lex-space/issues/6).
Events reach a viewer already framed: cards, timestamps, source labels, a
sentiment colour, "related" links. The page lets the viewer suspend that
framing with four operators borrowed from the avant-garde, and watch what
is left. Every gesture the viewer makes, including the suspending, is
logged and comes back into the stream as one more fragment. The caption
on the page is the claim: *every frame applied re-enters as signal.*

One process (Claude, working with Jeff) built it from the brief in one
pass. It exists so that a different reader, first of all the brief's
author, can say where it is wrong.

## Run it

No build step. Serve the repository root and open the folder:

```sh
python3 -m http.server 8000
# then http://localhost:8000/the-unframeable-now/
```

Babylon.js and D3 v7 load from a CDN; everything else is in `index.html`.

## Controls

- **Cut**: removes the connective tissue. Cards lose their timestamp, source,
  sentiment and links, and scatter across the panel; shards scatter in the
  volume.
- **Expose apparatus**: draws the machinery round each fragment. Ranking
  score as a meter with its visibility threshold marked, the truncation
  boundary in characters, the refresh interval as a draining timer, and the
  decay clock. In the volume, ranking becomes height, a frame bounds the
  field, and a plane marks the threshold shards sit above or below.
- **Scale collision**: a strip appears with one axis, and every fragment's
  magnitude is drawn on it at its true relative size: a token probability
  beside a continental sensor index. Shards take the same scale. A one-pixel
  floor exists so the smallest can be seen at all; it is the only concession.
- **Duration refusal**: nothing settles. Fragments live a few seconds, fade,
  and are re-sampled in place (the `·n` after a timestamp counts how many
  times); cards shiver and shards never stop moving.
- **Filter**: keeps only fragments whose text or source contains the typed
  string. Filtering is a gesture, so it re-enters too.
- **Orbit and zoom** on the volume: drag and scroll, or touch. Each is a
  gesture, and each re-enters.
- Clicking or pressing Enter on a card opens nothing; it is logged as a
  gesture and comes back.

The counter at the top right reads *frames applied* (gestures the viewer
has made) against *fragments still unframed* (fragments the reception
layer is not holding in a frame: cut, filtered out, below threshold, or
decaying).

## State

One object, in `index.html`, that both layers subscribe to:

```js
state = {
  fragments,        // what is in the field now; each has text, source, sentiment,
                    // magnitude, score, truncation, refresh, threshold, born, slot…
  activeOperators,  // a Set of 'cut' | 'expose' | 'collision' | 'refusal'
  viewerGestures,   // every gesture, in order: { at, kind, detail }
  unframedResidue,  // recomputed each tick
  framesApplied,    // the gesture count
  filter,
}
```

Nothing is stored anywhere else; the D3 layer and the Babylon layer each
re-read the state when `notify()` runs.

## Where to tune

The constants at the top of the script in `index.html`:

| constant | what it sets |
|---|---|
| `STREAM_INTERVAL_MS` | how often a fragment enters |
| `FRAGMENT_LIFE_MS` | how long one lasts in the default layer |
| `REFUSAL_LIFE_MS` | how long before Duration refusal re-samples it |
| `REENTRY_DELAY_MS` | how long after a gesture it comes back as signal |
| `MAX_FRAGMENTS` | how many the field holds before the oldest leaves |
| `SHARD_POOL` | shards built in the volume (fragments borrow one each) |

The fragment pool (`SHARDS`, `PULSES`, `TOKENS`, `SOURCES`) is invented and
names no real person or organisation.

## Citation posture

Reactivation of avant-garde tactics of interruption, apparatus exposure,
and withheld closure (Bürger, Foster) under the technical conditions of
contemporary event streams (Chun, Bucher), such that viewer framing
gestures re-enter as further signal. The full list is in the issue.
