# What was built

Five guards, sixty-two checks, each exiting non-zero when a boundary moves and
each registered in `experiments/check.py`. They build beside `sentinel.py`
rather than inside it, for `decline.py`'s reason: the framework has claims and
acceptances but no transaction surface, and inventing one inside the guarded
framework in order to ask a question about it is the wrong order.

## The silence, priced

`envelope.py` builds both envelopes and hands them identical traffic: an author
refused ninety-nine times before its hundredth proposal is accepted, beside an
author accepted at its first.

![Both envelopes, same traffic. The missing edge in the upper panel is the
whole of the finding.](diagrams/02-two-envelopes.png)

```
  holds  the silent envelope cannot enumerate its own refusals
         ARAPAHOE as drawn: 99 refusals, 0 rows
  holds  and so it cannot tell persistence from first-try acceptance
         stubborn 1 attempt(s), lucky 1 — indistinguishable
  holds  the recorded envelope enumerates every refusal
         99 declines, each a row anyone can re-read
  holds  and prices persistence against first-try acceptance
         stubborn 100 attempts, lucky 1
```

That is `unmeasured.py`'s corollary arriving in a transaction architecture.
Where the record cannot say how something got in, it charges as though it got
in easily — and nothing prices persistence, because persistence left nothing
behind.

The rest of the lifecycle is attacked the way the ledger is. The proposer holds
the envelope and never the handle, **checked by reading the closure's free
variables** rather than by asserting it in a docstring — `forgery.py` having
established that a test believing a docstring is a test believing prose. A
release is derived from the acceptance beneath it, never stored. A refusal
cannot be released at all. A release citing a proposal instead of an acceptance
is surfaced rather than refused, because refusing the row would keep less than
the attempt.

## Reach, Canon, and what outlives

`weight.py` prices a transition by what it touches. Reach is classified by
somebody other than the author, and the price is paid in **distinct voices,
never rows**: one voice endorsing nine times stays one voice, an author
endorsing itself counts for nothing, and so does the Sentinel adjudicating it.
A reach an author wrote about its own proposal is surfaced and buys no
discount, because unplaced is unpayable rather than free.

`canon.py` runs two Sentinels over the same rows. A first reading forged in the
Sentinel's name buys the believer and not the deriver; a Canon **furnished
after the proposal entered** moves the believer's answer and leaves the
deriver's where it was. Both of `reading.py`'s rules carried up a floor
unchanged, and the second is the one that works — anchored at the reading's own
moment, a forger furnishes the room and times the reading to match.

`outlives.py` is the one that did not come from this bench. A world sits beside
the ledger and does not close when the releaser stops. An effect past its term
is named and reclaimed by a function sharing fate with nothing; an effect that
never carried a term stays live and the record says so rather than implying it;
a lease cannot be extended from inside, because only the first written against
a release counts.

**Its residue defends ARAPAHOE's ordering.** An effect whose release was never
appended is an orphan no reconciler can name. Appending before releasing is
precisely what makes reclamation possible, which is the strongest thing in this
document about the blueprint as drawn.

## The reservation, extended

The refused identifier needed reach rather than a guard of its own.
`vocabulary.py` now carries a list of transaction surfaces and holds each to
the same two word rules. It was tested by being broken — the word added to a
surface, the guard exiting non-zero, twice, once for each refused word.
