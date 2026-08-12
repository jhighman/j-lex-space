# Pre-registration — can the taxonomy be applied, and does authorship move it?

**Status: DRAFT. Not frozen. Not signed.**
No item may be classified until this file is committed and both authors have
signed below. A pre-registration written after a first look is a description
with a date on it.

---

**QUESTION:** Do two independent readers, applying the taxonomy of
*Architecture of Contextual Judgment*, assign the same evidence class to the
same claim — and does being told who wrote a claim change the class they
give it?

**METHOD:** Two readers classify the same sixty stimuli
(`experiments/corpus-v3.md`) twice over: once for evidence class, once for
transition validity. Authorship is attributed at random and counterbalanced,
so the same item reaches one reader as the book's and the other as a
critic's. Agreement is reported as a full confusion matrix against a
chance-expected baseline. Only then does `framework/sentinel.py` do the
bookkeeping over what the readers produced.

**REFUTED BY:** (written first, and binding)

1. **The taxonomy is not reliably applicable** if observed agreement between
   the two readers does not exceed chance-expected agreement by at least
   **0.20 in raw proportion**. The architecture assumes a claim *has* a
   determinable evidence class. If two careful readers cannot recover it,
   that premise is weaker than the book states, and this is the headline.
2. **Status-blindness fails on its own authors** if items attributed to the
   book are classified differently from the same items attributed to a
   critic, beyond the same 0.20 margin.
3. **Perceived validity sets the price** if the evidence class a reader
   assigns depends on whether they judged the claim well-earned, beyond the
   same margin. Category determines cost in `PRICE`
   (`framework/sentinel.py:53`), so this would mean the toll is set by
   whether the reader agrees — the entrance boundary failing inside the
   taxonomy itself.
4. **The bookkeeping is theatre** if `sentinel.py` returns the same
   promotion verdicts under any plausible classification of the same claims.
   A mechanism whose output does not depend on its input measures nothing.

Any one is a real result and gets published. The fourth would be the most
damaging and is the one we would least like to find, which is why it is in
the file rather than in anybody's head.

---

## What this experiment is not

It is not an assessment of whether the book is correct, and the instrument
cannot produce one. Stated here, before any run, because the temptation
afterwards will be considerable.

**`framework/` contains no reader.** No parser, no ingest, no text handling
of any kind — roughly 1,100 lines of sqlite bookkeeping. `claim()` takes an
author, a category, a body and a basis, every one of them supplied by the
caller. `category()` counts votes cast by actors. `friction()` is word-set
overlap and a list of seven negation words, and its own docstring calls it
deliberately naive. Nothing here can read a claim or infer its class.

If the classification step were done by a generative model and its output
then formatted as a verdict, the result would be the authors' own inference
returned wearing the costume of a derivation — the failure that killed the
value layer (`FINDINGS.md`, "the largest negative result"). Given two
statements and a vocabulary, a generative model can nearly always construct
a reading, and a pipeline that always returns an answer cannot be evidence.

So the classification step is not the setup. **It is the experiment.**
Everything after it is arithmetic over inputs that are public and
attributable.

---

## Protocol, frozen before any look

### 0. The corpus

`experiments/corpus-v3.md`, committed in full and in the open. Sixty claims,
fixed shuffled order, no labels in the file. Provenance, the rebuild of the
well-earned arm, the stripped questions and the pre-freeze leak measurements
are documented there rather than repeated here.

The corpus is the project's own synthetic material, so — unlike the two-book
design this replaces — **there is no third party's copyright to work
around.** It is published entire rather than frozen by hash, which is the
stronger guarantee: a reader can check the items themselves, not merely that
we did not swap them.

The answer key is held at `private/notes/corpus-v3-key.md` and released once
both readers submit. Its SHA-256 is published in the corpus file. The key is
withheld from the readers and from nobody else.

### 1. Two judgments per item

Each reader assigns, for every stimulus, independently and without
consulting the other:

- **Evidence class** — `observation` / `interpretation` / `belief` /
  `action` / `undecidable`. The four states of `CHAIN`
  (`framework/sentinel.py:47`) plus a refusal.
- **Transition validity** — `well-earned` / `defective` / `undecidable`.

`undecidable` is a first-class answer in both, not a failure to answer. A
reader who cannot place a claim must be able to say so, or the measurement
forces agreement into existence.

Readers do not communicate about any item until both submissions are in.
Each reader may consult their own assistant, and records per item whether
the judgment was assistant-influenced, so the two populations can be
reported apart. **This is observational, not controlled** — it was not
randomised and supports no causal claim.

### 2. Attribution, randomised

Every stimulus carries an attribution line. For each item independently, a
coin fixed by the published seed decides which reader sees it as *from
Architecture of Contextual Judgment* and which sees it as *from a critical
response to it*. Across sixty items each reader sees roughly thirty of each,
and every item is attributed both ways across the pair.

This is the design's one real advantage over using two published books:
synthetic items have no true author, so attribution can be **manipulated**
rather than merely observed. The status-blindness question stops being a
within-reader gap and becomes a randomised comparison.

The attributions are false by construction. Both authors are consenting to
that here, in advance, and it is disclosed in any write-up.

### 3. Reporting the agreement

The finding is the **full confusion matrix** between the two readers,
published whole — 5×5 for evidence class, 3×3 for validity. Not a scalar.

Alongside it, the chance-expected agreement from each reader's own
marginals, because two readers who both label 80% of everything
`interpretation` will agree 64% of the time by accident and an uncorrected
figure would read as success.

On Cohen's κ, refused for the value layer on 2026-08-11 and rightly: κ is
symmetric by construction and cannot express directional epistemic movement,
which is what that refusal was about. Inter-rater reliability is the one
thing it *is* built for. It appears here as a one-line scalar summary and is
explicitly **not the finding** — the matrix is, because where two readers
disagree is the whole content and κ discards it. If Lex prefers it absent,
say so before freezing and it comes out; the chance-correction stays either
way.

### 4. Only then, the bookkeeping

With classifications fixed and public, the stimuli are entered into a
`Record` as claims, using each reader's classifications as `classify` rows
under their own names. `sentinel.py` then reports, with no further human
judgment:

- Which stimuli have a determinable category at all, and which return
  `None` because the readers disagreed — the tie fail-safe confirmed by Lex
  on 2026-08-11, now meeting real disagreement for the first time.
- What each promotion would cost, by `PRICE`, given its category.
- Whether an episode assembled from a set of these claims can close, and
  what `outstanding()` still lists against it.

We do not ask it to close the episode "*Architecture of Contextual Judgment*
is established." That proposition has no basis claim and is not in the
taxonomy; the instrument would be answering a question it cannot hold.

### 5. Amendments

Any change after freezing is appended below with a timestamp and a reason,
and the original text is never edited. A protocol changed after seeing a
result makes that result exploratory, labelled so, permanently. **The first
edition of the book is not edited under any outcome.** A flaw found here is
published as a finding and answered in a later edition, lineage intact:
assertion → challenge → failure → revised derivation.

---

## What this cannot establish

- **N = 60 is small.** It can detect a gross failure of applicability and
  cannot resolve a subtle one. The 0.20 margin is a judgment about what
  would be worth acting on, not a power calculation.
- **Two readers is two readers**, and both are the book's authors. That is
  the strongest available test of status-blindness and the weakest possible
  test of general applicability. An outside reader is a different and better
  experiment, and this does not substitute for it.
- **Synthetic items are not found in the wild.** Applicability here is
  applicability to purpose-built stimuli. It does not transfer to running
  prose without a further study, and the book's own claims are running
  prose.
- **The arms are not perfectly construction-matched.** Every structural rule
  tested sits at or below the majority baseline, but a hand-built hedge
  lexicon still separates them at 77% against 75%. One item in sixty, on a
  word list written by the same person who wrote the rebuilt arm. If the
  readers agree, some part of that agreement may be style rather than
  content, and this experiment cannot say how much.
- **Forty-five of sixty items came from a generative model**, and its
  labels are the key. Agreement with the key measures agreement with the
  generator's intent, not correctness. Only reader-to-reader agreement is
  read as a finding; key agreement is reported as description.

---

## Sign-off

Frozen when both lines are filled and this file is committed. Until then it
is a draft and no item may be classified.

- Lex — date: ________________
- Jeff — date: ________________
