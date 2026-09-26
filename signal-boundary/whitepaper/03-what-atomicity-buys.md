# What atomicity buys

## Noise is not an adversary

The 1906 design solves a receiver-side problem. A signal arrives degraded, and
the question is whether an operator can still recognise it. Atomicity and
distinctiveness help because they raise the distance between the distress
signal and everything else in the signal space: fewer ways for damage to turn
one valid message into a different valid message.

This is a real property and it transfers to software in a real way. An
operation with no addressable interior cannot be half-applied. A payload with
no mutable structure cannot be edited between validation and use. These are
genuine gains and most of them are gains against *accident* — races, partial
writes, a caller that retains something it should not, a refactor that
introduces an early return past the cleanup.

But noise has no intent. It does not read the specification, choose the
moment, or adapt when the first attempt fails. **Atomicity is a defence
against a process that is indifferent to you.** Nothing about it constrains a
process that is not.

## The trap

The analogy invites a substitution that should be resisted: because the
unspaced prosign is robust, an indivisible runtime operation must be *secure*.

The word doing the work is "indivisible," and it means different things on the
two sides. A waveform is indivisible to a receiver because the medium offers
no way to address its interior — the marks arrive as one run or they do not
arrive. A Ruby method is indivisible only to callers who go through the front
door. The interior is addressable by anything running in the same process, and
the language provides the addressing scheme as a documented feature.

The distinction is not pedantic; it determines what the guarantee is worth. A
transatlantic operator could not reach into a signal in flight and rewrite its
third mark. A colleague's gem, loaded two dependencies deep, can.

## Stated fairly: why build the invariant anyway

There is a reasonable objection to the whole exercise. If an in-process guard
cannot stop hostile in-process code, why build it carefully at all — why not
accept that the real boundary is elsewhere and keep the implementation simple?

Three reasons, and the paper takes them seriously rather than treating the
invariant as ceremony.

**Most failures are not attacks.** The exception that skips a cleanup, the
retained buffer, the second caller arriving during teardown — these are the
common case, and a well-built guard eliminates them completely. Designing only
for the adversary means shipping something that fails constantly against the
accident.

**A precise invariant is auditable.** "State 0 is restored on every completion
path" is a claim that can be tested, and section 5 tests it. "We are careful
about cleanup" is not. The value of the structure is partly that it converts a
disposition into a post-condition.

**It localises the trust.** Once the in-language guarantee is exact, the
remaining exposure can be stated exactly too: everything in this address
space. That is a far more useful thing to hand a security reviewer than a
system where the boundary is diffuse.

What follows from this is not that the guard is worthless. It is that the
guard must be built *and* its limits must be written down in the same
document, so that nobody downstream mistakes the first for a substitute for
the second.
