# Where the seal breaks

The sealed implementation has no mutual exclusion. This is not a stylistic
difference from the locked one; it is a defect against the design's own stated
goal, which its header describes as universal carrier preemption.

## Four simultaneous transmissions

Four threads were started against the sealed carrier, each incrementing a
counter on entry to the payload and decrementing on exit, with the peak
recorded.

```
  two threads: do transmissions overlap?
    BREACH — 4 concurrent transmissions, no mutual exclusion
```

A carrier that admits four simultaneous transmissions is not a carrier. The
physical claim the metaphor rests on — one medium, one signal, everything else
preempted — has no counterpart in the implementation.

## State 0 does not mean idle

The consequence is worse than the absence of a lock, because the idle
indicator is derived from a single unguarded instance variable that every
caller shares.

Nested, from one thread:

```
  nesting: inner ensure clears the bit while outer is live
    BREACH — reports State 0 inside a live outer transmission
```

The inner call's `ensure` clears the flag on the way out, while the outer
transmission is still running. Concurrently, the same thing happens across
threads: the first payload to finish clears the flag for every transmission
still in progress.

So `state == 0` does not mean the carrier is idle. It means *no transmission
finished more recently than one started*, which is a different proposition and
not a useful one. A supervisor polling this value to decide whether the
carrier is free receives a confident wrong answer — the failure mode that the
CQD model in the same file exists to warn about, reappearing in the
replacement.

The design note in the source — *nested calls are not a second lock; each
invocation still clears the bit on the way out* — describes the mechanism
accurately. It presents as a design choice what is, against the stated goal, a
defect.

## Why the lock is not optional here

It would be reasonable to answer that the reference implementation is
single-threaded and the lock is therefore unnecessary. That answer does not
survive the use case. A distress boundary exists precisely for the moment when
something has gone wrong, and the moment when something has gone wrong is when
concurrent callers are most likely: a supervisor polling state, a signal
handler, a timeout firing, a second subsystem detecting the same fault.

An interlock that is correct only when nothing else is happening is an
interlock that is correct only when it is not needed.

## A portability defect, noted for completeness

The suite fails one assertion on Ruby 2.6 because `UnboundMethod#bind_call`
was introduced in 2.7. This is not a logic error: substituting the
2.6-compatible `bind(...).call` makes the assertion pass exactly as written,
with the shadow corruptible and the sealed carrier intact. The file declares
no minimum version.
