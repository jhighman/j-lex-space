# ARAPAHOE

The blueprint decouples reasoning exploration from execution authority. A
Python proposer generates candidates from context and holds **zero write
authority** over the record and no authority to release privileged execution.
ARAPAHOE is the governance garment around that: it accepts an unprivileged
proposal through a narrow, content-agnostic envelope, strips ambient authority
so that reflective inference cannot inherit operational privileges, and
presents a normalized payload to a Rust Sentinel. Inside the garment are two
protected components — the Sentinel as the lock, and Alexicon as the body,
Canon and append-only ledger.

![The lifecycle as drawn. Five numbered steps on the accepting path; the
refusing path terminates without touching the record.](diagrams/01-lifecycle.png)

The lifecycle runs in a fixed order: **verify, certify, append, receive
receipt, release**. The Sentinel reads Alexicon while deciding and does not
mutate it. If the proposal is invalid, undecidable, or out of scope, the lock
bites: the protocol deterministically refuses or freezes, and does not repair
the proposal, guess a result, write a partial state, or release execution. A
human may resolve a halt only by supplying a verified state as a new
transaction through the envelope — never by writing to Alexicon directly, and
never by bypassing the Sentinel.

## What it gets right, before anything else

The shape is the one this bench keeps arriving at, reached independently and
from the opposite direction. Two things in particular are worth naming before
the criticism, because both are easy to get wrong and neither is.

**The operator has no side door.** The human who resolves a halt re-enters
through the envelope as an ordinary transaction. Most architectures of this
shape leave a privileged path for the person, and a privileged path for the
person is a privileged path.

**Append precedes release.** A process that dies mid-transaction therefore
leaves a record with no action, rather than an action with no record. That
asymmetry is the right way round, and section 6 shows it is what makes
everything afterwards possible.
