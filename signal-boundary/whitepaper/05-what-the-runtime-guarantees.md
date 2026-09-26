# What the runtime actually guarantees

Everything in this section was executed. Appendix A is the transcript.

## What holds

Seventeen post-conditions were run against the specification in section 4.

The three CQD assertions pass by being broken, which is the point of a
negative model: a token can be overwritten in place, the ordering can be
reversed after construction, and the whole sequence can be emptied mid-flight.

The SOS assertions hold across every in-language completion path:

- a returning payload transmits nine marks and leaves the carrier at State 0;
- a raising payload propagates its exception **and** leaves the carrier at
  State 0;
- a payload that deliberately retains the capability finds it dead afterwards —
  `Revoked` is raised on use, which is the revocable-proxy design earning its
  place;
- re-entry from the owning thread is refused with `CarrierBusy` rather than a
  `ThreadError`;
- under eight contending threads, no two transmissions overlapped and the
  carrier finished at State 0.

That last one is worth stating plainly because it is the property most often
assumed rather than tested. The concurrency assertion counts overlapping
entries into the payload, not merely the state at exit, so it would fail on a
lock that serialised badly rather than silently passing.

## What does not hold

**`instance_variable_set` violates the invariant without entering the method
at all.** A single line — `sos.instance_variable_set(:@state, 1)` — leaves the
object reporting a held carrier, having never called `transmit!`. No lock was
taken, no closure ran, and no teardown was skipped, because none of the
machinery was involved. The guard was bypassed rather than broken.

## How far teardown actually reaches

An earlier issue of this paper tested four completion paths and generalised
from `exit!` to abrupt termination in general. That generalisation was wrong,
and the correction matters operationally. Nine modes were run, each killing
the process differently, with an external resource acquired before the closure
and released in an application-level `ensure`:

| Mode | `ensure` | `at_exit` | External lease |
|---|---|---|---|
| normal return | ran | ran | released |
| `raise` | ran | ran | released |
| `throw` | ran | ran | released |
| `exit` | ran | ran | released |
| `exit!` | **skipped** | **skipped** | **stranded** |
| `SIGTERM` | ran | ran | released |
| `SIGINT` | ran | ran | released |
| `SIGKILL` | **skipped** | **skipped** | **stranded** |
| `SIGSEGV` | **skipped** | **skipped** | **stranded** |

**Teardown runs on six of the nine.** The three that skip it are exactly those
that never return control to the Ruby runtime. Two consequences follow, and
neither was visible from the four-probe version.

**`exit` and `exit!` differ by one character and by everything.** `exit`
raises `SystemExit`, which unwinds the stack normally, so `ensure` runs and
the resource is released. Only `exit!` bypasses. Treating them as a single
category hides the distinction that decides the outcome.

**`SIGTERM` runs `ensure`.** This is the one with operational consequences,
because SIGTERM is what an orchestrator sends first — Kubernetes, systemd and
Docker all escalate to `SIGKILL` only after a grace period. The ordinary
shutdown path is therefore intact, and teardown is lost only in the minority
case where the grace period expires. The engineering problem is to finish or
checkpoint inside that window, not to defend against signals as a class.

## What actually strands

The same probes settle a claim this paper previously made too loosely.

After a `SIGKILL` inside the closure, a fresh process was started. It sealed a
new carrier and reported **State 0**. Nothing was stuck, because the process
was gone and the object with it. For purely in-memory state, **process death
is the most thorough cleanup available** — the operating system reclaims it
unconditionally, which is a stronger guarantee than `ensure` offers.

What survived was the lease file. That is the whole of the hazard: state
**mirrored outside the process**. An advisory lock in Postgres or Redis, a row
marked `in_progress`, a mounted namespace, a held device, a cloud resource, a
lockfile. Everything held only in memory is self-healing by virtue of being
forgotten.

The question to ask of an invariant is therefore not "might cleanup be
skipped?" but **"which part of this invariant outlives my process?"** Section
7 scopes the remedy accordingly.

## The precise claim

The honest formulation of the guarantee is narrower than "State 0 is
unconditional," and it should be written into the specification in these
terms:

> State 0 is restored on every completion path that returns control to the Ruby
> runtime, in a process where no code has modified the class or its instances.

The first clause is now an empirical statement rather than a hedge: six of the
nine modes above return control, and all six restore State 0.

Both qualifications are load-bearing. The first excludes process death. The
second excludes everything in section 6 — though it is narrower than it looks
once the class is sealed, and section 6 sets out which part of it sealing
converts from an assumption into an enforced property.

Note what this does *not* undercut. Within its stated scope the guarantee is
exact and it is tested, which is considerably more than most cleanup code can
claim. The problem is not that the invariant is weak. It is that the scope is
frequently left unwritten, and a reader then imports the word "unconditional"
into a threat model it was never evaluated against.
