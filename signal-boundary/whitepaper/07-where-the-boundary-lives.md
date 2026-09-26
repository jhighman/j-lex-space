# Where the boundary actually lives

## Move it out of the address space

If the invariant must survive arbitrary future code in the same process, it
cannot live in that process. This is the whole of the recommendation, and
everything below is detail.

Section 6's amendment narrows this without overturning it. Sealing the method
table raises the cost of the in-process attack substantially, and a system
that can seal should. But sealing protects only what loads before it runs,
leaves the allocator reachable, and does nothing about process death — so it
is a mitigation inside the address space, not an escape from it.

The enforcement point belongs at a **process and privilege boundary**: a
separate process, under a separate user, constrained by the operating system —
`seccomp`, a jail, a container with a dropped capability set — communicating
over a **narrow, explicit interface** whose message set is enumerable. The
guarded resource is held by the supervising side. The untrusted side asks; it
does not hold.

What this buys is not a stronger promise from Ruby. It is the removal of Ruby
from the trust argument. The invariant is then enforced by a component that
does not execute the code it is guarding, which is the only structural
difference that matters.

## The second reason: you cannot audit your own guard

There is an argument for moving the boundary out that does not depend on
reachability at all, and it is the more durable of the two.

Two implementations of the specification in section 4 were produced
independently and compared. Each shipped a rigorous test suite. Each suite
passed completely. And neither suite contained a single assertion about the
failure the other one found: the sealed implementation was never tested under
concurrency, and the locked one was never tested for method-table integrity.

The omissions were not careless. Each followed from its author's architectural
premise — having decided the method table was the asset, concurrency was
somebody else's problem; having decided in-process defence was futile, testing
whether a seal holds was pointless by construction. Which means review by the
same author could not have found either gap, because the reviewer shares the
premise that produced it.

So the case for a process boundary is not only that an in-process guard is
reachable. It is that an in-process guard is **checkable only by its author**,
who is the party least able to check it. A boundary enforced by a separate
component can be verified by someone who did not build the thing being
verified, and that difference survives every improvement to the guard itself.

The companion paper *Seal and Lock* reports the comparison in full.

## Enforce on the receiving side

A check placed in the caller constrains a caller that chooses to be
constrained. The check belongs where the effect actually happens — the tool
endpoint, the syscall filter, the API gateway, the device driver — and it must
be evaluated from state the caller cannot reach.

This reorders the usual hierarchy of controls, weakest first:

1. **Documentation and prompt text.** A request. No enforcement whatsoever.
2. **An in-process guard object.** Real against accident, as section 5 showed.
   Void against anything in the address space, as section 6 showed.
3. **A separate process with narrow IPC.** Enforced, provided the interface is
   genuinely narrow and the supervising side validates rather than trusts.
4. **An OS or hardware boundary the supervised side cannot address.** Enforced.

Most systems that believe they are at level 3 are at level 2, because the
"separate" component was linked in for performance at some point and nobody
revisited the threat model.

## Design for the teardown that never runs — where it applies

Section 5 established that three of nine termination modes skip `ensure`, and
that what strands when they do is not in-memory state but state mirrored
outside the process. Both halves matter here, because together they scope the
remedy.

**Crash-only design is not a general answer to "cleanup might not run."** For
an invariant held only in memory it buys nothing: the process dies, the
operating system reclaims the state, and the next process starts clean.
Applying the machinery there is cost without benefit.

It is the right answer **exactly where the invariant has an external
representation** — a lock row, a lease, a namespace, a device reservation, a
record marked in progress. So the design step is to enumerate which part of
the invariant outlives the process, and apply the following only to that part.

**Leases rather than locks.** An externally held resource carries a TTL and is
reclaimed by expiry, so a process that dies holding it strands it for the
lease duration rather than forever. The TTL has to cover only the ungraceful
minority — section 5 shows `SIGTERM` already releases the resource — so it can
be set from the orchestrator's grace period plus a margin, not from worst-case
fear.

**External reconciliation.** A supervisor that does not share fate with the
guarded process compares intended state to observed state and repairs the
difference. This is the component that would have reclaimed the stranded lease
in the `SIGKILL` probe. Note what it does *not* need to do: there was no
carrier stuck at State 1 to repair, because there was no carrier. The
reconciler's subject is the external record, not the dead process's memory.

**Idempotent recovery.** Restart must be a valid response to any state,
because it is the only response available after an abrupt death.

The sequencing matters: build the in-language guarantee *and* the external
reconciler. The first eliminates the common case cheaply; the second bounds
the damage of the uncommon one. Neither substitutes for the other, and a
system with only the first is the system this paper is warning about.
