# What must be true

This paper records a position. Several things it depends on are conditions
rather than conclusions, and they are listed here so that a reader can
disagree with the position by disputing the condition rather than the
rhetoric.

## Conditions the argument rests on

**The threat model includes code in the same address space.** If it genuinely
does not — a single-author binary, no plugins, no dynamic loading, a reviewed
dependency set that cannot change without redeployment — then the in-process
guard of section 4 is sufficient and section 7 is over-engineering. Most
systems believe they are in this category and are not, because dependency
trees are transitive and nobody reads the whole one.

**The guarded resource matters enough to pay for isolation.** Process
separation costs latency, operational surface and a serialisation boundary.
For an emergency stop, a payment authorisation or an agent's tool execution,
that is cheap. For a mutex around a cache, it is not. The argument is scoped
to boundaries where the failure is the expensive event.

**The supervising side is itself trustworthy.** Moving enforcement into a
separate process relocates trust; it does not eliminate it. If the supervisor
loads plugins, evaluates configuration as code, or runs anything the untrusted
side influenced, the boundary has been recreated in a new place with fewer
people watching it.

## What would change the conclusion

**A working in-process sandbox for the host language.** Sealing the method
table is a partial answer already available, and section 6 records how far it
reaches: up to the allocator, and only for code loaded before the seal runs. A
general sandbox would go further. Ruby has none and is not getting one. A
language with capability-safe modules and no ambient reflection — or a
WebAssembly component model with an explicit import list — changes the
calculus materially, because "the same address space" stops implying
"reachable." This is the most plausible route by which section 7 becomes
unnecessary, and it is worth tracking.

**Attested, immutable images.** If the loaded code is measured and the
measurement is checked by something outside the process, then "no code has
modified the class" moves from an assumption to a verified property, and the
second qualification in section 5 is discharged.

## What is not claimed

This paper does not claim that dynamic language features are harmful in
general; section 6 sets out where they are appropriate. It does not claim that
the specification in section 4 is defective — within the scope stated in
section 5 it is exact and tested. And it does not claim that process isolation
is sufficient on its own, only that it is necessary, and that the in-language
guard and the external reconciler are complements rather than alternatives.

The narrow claim is this: **an invariant is a property of the weakest
component that can reach the state it constrains, and that component is
frequently not the one named in the design.**
