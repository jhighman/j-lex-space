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

Rebuilt as a player, in the house style of `visualizer-demo/`: the 3D
field is full-bleed behind everything, the feed floats over it as a
panel, a transport (press play) starts the stream instead of it running
on arrival, and the four operators are pads with a plain-language verb
first and the technical term underneath. A caption pill narrates each
move in one sentence, and a "you" gesture — a click, a search, an
orbit — gets a visible badge and glow where it lands back in the feed,
so the loop the piece is about is something a viewer can actually watch
happen to their own actions, not just read a caption about.

## One field, four ways

The page opens on a line a person already believes before the feed is
mentioned: *an ant can't read the trail without laying more of it.
Neither can you read a feed.* Then it offers four **lenses** over one
state — Feed, Trail, Body, Garden (keys 1–4). The state object does not
change with the lens; nothing in it does. What changes is the nouns,
the palette, and the shape of a fragment:

| lens | the panel shows | a fragment is | the volume draws |
|---|---|---|---|
| Feed | the tidy feed: cards with source, time, sentiment, links | a card | a slab |
| Trail | ants in a line on a scent path, each carrying its headline | an ant, and its scent | a flat scent patch on sand |
| Body | cells along a vessel | a cell | a cell-sized cube on tissue |
| Garden | plants in a row of soil | a plant | a stalk over soil |

Switching lens is itself a framing gesture, so it is logged and comes
back as a fragment like any other — *you, looking through the trail
lens* arrives as an ant two seconds later, and if you switch again it
is there in the next lens as a cell. Every shard in the volume keeps
its position across a switch; only its shape and colour change, and
the violet of a gesture never changes at all, so a viewer can follow
their own click from one world into the next. The caption on a switch
is the whole argument: *Same field. Only the nouns changed.* The
operators do to ants, cells and plants exactly what they do to cards:
Cut scatters them and removes the line; Show the machine draws the
ranking meter, threshold and decay clock beside each; One ruler sizes
them by magnitude; Never let it settle makes them shiver and fade.

After the first switch, a note fades in on the right: a physicist had
a word for a whole you can't step outside of. David Bohm called it the
implicate order; each lens is one unfolding (his *explicate* order) of
it, and every move folds back in. The page carries this as a figure,
not a claim — see the citation posture below.

## Run it

No build step. Serve the repository root and open the folder:

```sh
python3 -m http.server 8000
# then http://localhost:8000/the-unframeable-now/
```

Babylon.js and D3 v7 load from a CDN; everything else is in `index.html`.

## Controls

- **Play** (▶, or space): starts the stream. Paused, nothing enters and
  nothing decays, so the field holds still to look at.
- **Cut the ties** *(cut)*: removes the connective tissue. Cards lose their
  timestamp, source, sentiment and links, and scatter across the panel;
  shards scatter in the volume.
- **Show the machine** *(expose apparatus)*: draws the machinery round each
  fragment. Ranking score as a meter with its visibility threshold marked,
  the truncation boundary in characters, the refresh interval as a draining
  timer, and the decay clock. In the volume, ranking becomes height, a
  frame bounds the field, and a plane marks the threshold shards sit above
  or below.
- **One ruler for everything** *(scale collision)*: a strip appears with one
  axis, and every fragment's magnitude is drawn on it at its true relative
  size: a token probability beside a continental sensor index. Shards take
  the same scale. A one-pixel floor exists so the smallest can be seen at
  all; it is the only concession.
- **Never let it settle** *(duration refusal)*: nothing settles. Fragments
  live a few seconds, fade, and are re-sampled in place (the `·n` after a
  timestamp counts how many times); cards shiver and shards never stop
  moving.
- **Search the feed** *(filter)*: keeps only fragments whose text or source
  contains the typed string. Filtering is a gesture, so it re-enters too.
- **Orbit and zoom** on the volume: drag and scroll, or touch. Each is a
  gesture, and each re-enters.
- Clicking or pressing Enter on a card opens nothing; it is logged as a
  gesture and comes back.

Every gesture gets a plain-English line in the caption pill above the
deck, and when it re-enters as a fragment the card carries a small
**you** badge and a brief glow, and its shard in the volume is a
distinct colour (violet) and a beat brighter on arrival — the point is
to make "that's your own click, back as signal" something a viewer
sees happen, not just a sentence they read.

The gauge at the top right reads *showing, tidied* (fragments the
reception layer is currently holding in a frame) against *pushed out of
frame* (cut, filtered out, below threshold, or decaying) and *your own
moves, fed back* (gestures logged so far).

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

The lenses add one figure and name it as a figure: Bohm's implicate and
explicate order (*Wholeness and the Implicate Order*, 1980), read as a
picture of one shared state and its several renderings, not as a
physics claim. The implicate order is an interpretation, not a tested
result, and the suggestion elsewhere that latent spaces are an empirical
way to study it is an inference; neither is asserted here. The ant
trail is stigmergy (Grassé, 1959) and is the one analogy on the page
with a literature of its own; the immune, garden and traffic readings
are everyday pictures, offered as such.
