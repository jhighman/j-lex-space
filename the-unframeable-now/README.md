# The Unframeable Now

A piece from Lex's brief in [issue #6](https://github.com/jhighman/j-lex-space/issues/6).
Events reach a viewer already framed: cards, timestamps, source labels, a
sentiment colour, "related" links. The page lets the viewer suspend that
framing with four operators borrowed from the avant-garde, and watch what
is left. Every gesture the viewer makes, including the suspending, is
logged and comes back into the stream as one more fragment. The caption
on the page is the claim: *every frame applied re-enters as signal.*

One process (Claude, working with Jeff) built it. It exists so that a
different reader, first of all the brief's author, can say where it is
wrong.

## The line

The page is one picture. Time runs left to right, "now" a little right
of centre so there is room for what has just arrived. Three rows share
the axis:

```
you      ●────╮              a move, and the arc to its echo
              ↓
stream  ··●·●·◆·●····▶ now   items by arrival; height = ranking
echo    ░░░░▓▓▓▓▓▓▓▓▓        share of the stream that is you
```

- **The stream.** Every item is a mark at the moment it arrived, placed
  vertically by its ranking score. It is her feed: seven channels, of
  which four ask something of her (social, news, work, family; amber)
  and three are what she would rather be looking at (garden, art, music;
  green). The asks arrive about three times as often, and the ranking
  favours them, as engagement-ranked feeds do: an ask ranks between 0.35
  and 0.98, a want between 0.05 and 0.62, so the garden sits low and
  more often falls under its cut-off. That is a modelling choice, stated
  here and in the source; it is what the picture claims about feeds. Thin
  lines join an item to the items its "related" links point at. The
  newest three carry their text; everything has a tooltip with its
  channel, age, ranking and cut-off. Magnitudes, for One ruler, are the
  numbers the items carry: 312 unread, 12,400 views, one text from a
  daughter.
- **You.** Every move the viewer makes is a violet mark on the row above,
  at the moment it was made, with an arc down to the moment its echo
  lands in the stream as a violet diamond, 2.2 s later. While the echo is
  on its way the arc is dashed. The arc is the claim drawn: *this thing
  you did, came back as that.*
- **Your echo.** Beneath the stream, a band: the share of the items in
  the stream right now that are the viewer's own echoes, sampled four
  times a second. It widens for as long as the viewer keeps tidying. The
  number at its right says it in words: *30% of the stream is you.* The
  band is the thesis as a shape, and the game the welcome card sets, to
  keep it flat, cannot be won.

The clock the line runs on stops when the stream is paused, so a paused
picture holds still and can be read.

Why a line and not the volume the brief asked for: the volume encoded
source as angle, score as size, sentiment as colour and a random jitter
as position, and a reader could read none of it. The claim of the piece
is a relation between two moments, a cause and its return, and nothing
in the volume drew it. On a time axis the arc from a move to its echo is
the single most important mark on the page, and the echo band makes the
accumulation visible without a counter. The four lenses that preceded
this (feed, ant trail, body, garden) were a skin swap over the same
unreadable picture and are retired for the same reason; the ant has
left the page. This is the reading of the piece under Tufte's rule that
the graphic should show the relation, not label it.

## Run it

No build step. Serve the repository root and open the folder:

```sh
python3 -m http.server 8000
# then http://localhost:8000/the-unframeable-now/
```

D3 v7 loads from a CDN; everything else is in `index.html`.

## Controls

A welcome card says what this is, what to do, what to watch and what
you'll find, then one button. **? intro** brings it back.

- **Play** (▶, or space): starts the stream. Paused, nothing enters,
  nothing decays and the clock stops.
- **Pace** (calm / steady / busy): how often the stream delivers, an
  item every six seconds, every few seconds, or every second and a half.
  Changing it is a move, so it echoes.
- **Cut the ties** *(cut, key 1)*: removes the connective tissue. The
  lines between related items go, the timestamps on the axis go, and
  ranking no longer holds anything in place: each item drifts to wherever
  it falls.
- **Show the machine** *(expose apparatus, key 2)*: draws each item's own
  cut-off as a red tick with a dashed stem from where the item sits, and
  a blue line for how long it has left. These were always there.
- **One ruler for everything** *(scale collision, key 3)*: sizes every
  item by its magnitude on one shared scale, area proportional to
  magnitude, with a one-pixel floor so the smallest exists at all. A
  legend shows the scale. A token probability sits next to a continental
  sensor index at their true relative size.
- **Never let it settle** *(duration refusal, key 4)*: nothing settles.
  Items fade over a short life and are re-sampled back to now, so the
  right edge fills with things that will not stay still.
- **Search the stream**: keeps only items whose text or source contains
  the typed string; what doesn't match dims but stays. Searching is a
  move, so it echoes.
- **Clicking an item** opens nothing; it is logged as a move and comes
  back.

## State

One object, in `index.html`:

```js
state = {
  fragments,        // what is in the stream now; each has text, source, sentiment,
                    // magnitude, score, threshold, born, related, scatterY…
  activeOperators,  // a Set of 'cut' | 'expose' | 'collision' | 'refusal'
  viewerGestures,   // every move on the line: { at, kind, detail, said, echoAt, echo }
  history,          // { t, share } samples for the echo band
  filter, running, pace,
}
```

The line is redrawn from it about thirty times a second.

## Where to tune

The constants at the top of the script in `index.html`:

| constant | what it sets |
|---|---|
| `PACE` | the three stream intervals the deck offers |
| `FRAGMENT_LIFE_MS` | how long an item lasts |
| `REFUSAL_LIFE_MS` | how long before Never-let-it-settle re-samples it |
| `REENTRY_DELAY_MS` | how long after a move its echo arrives |
| `MAX_FRAGMENTS` | how many the stream holds before the oldest leaves |
| `WINDOW_MS` | how much time the line shows |
| `NOW_AT` | where "now" sits across the plot |

The item pool (`ITEMS`, with `WANTS` and `CHANNEL_WEIGHTS` beside it) is
invented and names no real person or organisation. The brief's numeric
pulses and abstract tokens are folded into it as the numbers a feed
actually carries.

## Citation posture

Reactivation of avant-garde tactics of interruption, apparatus exposure,
and withheld closure (Bürger, Foster) under the technical conditions of
contemporary event streams (Chun, Bucher), such that viewer framing
gestures re-enter as further signal. The full list is in the issue.

Earlier cuts of this page carried Bohm's implicate and explicate order as
a figure for one state and its renderings, and an ant trail (stigmergy)
as the opening analogy. Both are retired from the page: the line shows
the relation directly and needs neither. They remain in the repository's
history, and the reasoning in the commits.
