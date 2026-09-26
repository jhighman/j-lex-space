# Appendix B — Glossary

**Ambient authority.** Permission a component holds by virtue of where it is
running rather than by holding a specific handle. The global filesystem is
ambient authority; an open file descriptor is not.

**Capability.** An unforgeable reference that both designates a resource and
authorises its use. Holding it is permission; not holding it is denial. There
is no separate access-control question to ask.

**Caretaker.** A proxy interposed between a holder and a resource so that the
grantor retains the ability to revoke. The pattern dates to Redell (1974) and
is what section 4's `WaveformCapability` implements.

**CQD.** The Marconi Company's distress call, circulated 1904. `CQ`, the
general call to all stations, with `D` for distress.

**Crash-only design.** Building a component so that abrupt termination is a
valid and expected transition, with recovery driven by reconciliation rather
than by cleanup code that may never execute. Applies to state held outside the
process; in-memory state is reclaimed by the operating system and needs no
such treatment.

**`ensure`.** Ruby's unconditional block clause, analogous to `finally`. Runs
on normal return, on exception, on `throw`, on `Thread#kill`, on `exit` (which
raises `SystemExit`), and on `SIGTERM` and `SIGINT`. Does not run on `exit!`,
`SIGKILL`, or `SIGSEGV` — the paths that never return control to the runtime.
See section 5 for the measured matrix.

**Membrane.** A recursively applied caretaker: revoking the membrane revokes
every object reached through it, not just the object first handed across.

**Prosign.** A procedural signal in Morse sent as one unbroken unit, without
the inter-character spacing that would otherwise separate its letters.
Conventionally written with an overbar.

**Post-condition.** A property asserted to hold when an operation completes,
independent of the path taken to complete it. Contrast with an obligation on
the caller, which is a convention.

**Reentrant.** A lock that the thread already holding it may acquire again.
Ruby's `Mutex` is not reentrant; a recursive acquisition raises `ThreadError`.

**Revocation.** Rendering an already-granted reference inert. Distinct from
dropping your own reference, which affects only your own access.

**SOS.** The distress signal adopted at the 1906 Berlin Radiotelegraphic
Convention, effective 1908. Sent as a single unspaced prosign of nine marks.

**State 0.** In this paper, the idle state of the carrier: no transmission in
progress, no capability outstanding.

**`$SAFE`.** Ruby's former taint-tracking sandbox mechanism. Progressively
weakened and removed in Ruby 3.0. Ruby now provides no in-process sandbox.
