# Two protocols

## What actually changed in 1906

The usual telling of this story is that CQD was fragile in noisy conditions
because it was composed of separate letters, and SOS fixed this by being
continuous. That is close enough to be useful and wrong enough to be worth
correcting, because the correction is where the engineering content is.

CQD was not an arbitrary sequence. It was `CQ` — the existing general call to
all stations, borrowed from British landline telegraphy — with `D` appended
for distress. Its weakness was therefore not primarily noise. It was
**collision with its own prefix**: under degraded copy, a distress call was
one dropped character away from routine traffic addressed to everybody. The
failure mode was not corruption into nonsense. It was corruption into
something plausible.

SOS was chosen for the opposite property. It has no meaning as an abbreviation
— the expansions offered later were retrofitted — and it was selected because
its rhythm is distinctive and unmistakable, including to an operator with
modest skill under bad conditions. It is conventionally written with a single
overbar spanning all three letters, denoting one prosign sent as an unbroken
run of nine marks with no inter-character spacing.

The atomicity is real. But it arrived as a *consequence* of choosing a
distinctive, unmistakable signal, not as the design goal. This matters for the
analogy, and section 3 takes it up.

## The part that is usually omitted

There was a second change in 1906, and on the evidence it mattered more.

Marconi's commercial position rested on a closed network. Operators using
Marconi equipment were instructed not to exchange traffic with stations using
rival apparatus. A distress call is worthless if the nearest receiver is
contractually deaf, and the Berlin convention's substantive achievement was to
compel interoperation: stations were required to accept and relay distress
traffic regardless of whose equipment sent it.

So the 1906 settlement is better read as two decisions taken together. **Make
the signal unmistakable**, and **make the network obliged to hear it.** The
first is a protocol property. The second is a governance property that no
protocol design could have supplied.

That pairing is the more useful template. An invariant that depends on the
cooperation of parties who have an incentive to withhold it is not an
invariant; it is a request. The remainder of this paper is largely an argument
that the same is true inside a single process.

## The inversion, stated as a contract

Rendered as a runtime specification, the progression gives two models.

**CQD is a sequence with public structure.** Its tokens are separately
addressable, its ordering is a convention rather than a guarantee, and its
state remains mutable after it has been validated. Anything holding a
reference can change what the message means, and nothing in the protocol
detects it.

**SOS is an operation with no addressable interior.** There is no token API,
because there are no tokens once the signal is committed. There is one way in,
one payload, and one exit path that returns the carrier to its idle state
whether the transmission succeeded or failed.

Section 4 implements both. The CQD model is implemented honestly rather than
as a straw man: its mutation surface is public and deliberate, because a
negative specification that cannot be exercised is not a specification.
