# The two designs

## What both got right

The convergence is worth stating before the differences, because it is the
part that is probably load-bearing.

Both implementations model CQD as a genuinely mutable token sequence with a
public mutation surface, so that the negative specification can be exercised
rather than asserted. Both model SOS as an operation with **no token API at
all** — the absence is the design. Both freeze the waveform literal, hand the
payload a reference rather than a builder, and put teardown in `ensure` so
that State 0 is a post-condition rather than an obligation on the caller.

Two independent derivations landing on the same shape is mild evidence the
shape is right. It is not evidence that either is complete, which is the
subject of the rest of this paper.

## Divergence one: the method table

The sealed implementation treats the *method table itself* as the asset to
protect, and it articulates why in one line that is better than anything in
the companion paper:

> The Ruby analogue of that gap is a message send.

That is the analogy doing real work. The inter-token pause in CQD — the place
where noise or a rival procedure could be spliced in — maps to the dispatch
point, which is where another definition can be spliced in. It follows
directly that the waveform should be reached by constant lookup rather than by
a method call, because a constant lookup is not a dispatch site and therefore
offers nothing to intercept.

From that reading, the defence is to close the dispatch surface before
untrusted code can reach it: freeze the class, freeze its eigenclass, freeze
the constant table, undefine `new` and `allocate`, and do all of it at the end
of boot.

The locked implementation did not attempt this. It concluded that in-process
sealing was futile and moved the argument to process isolation. That
conclusion was too quick, and section 3 shows why.

## Divergence two: the carrier

The locked implementation treats the *carrier* as the asset — a single
physical medium that admits one transmission at a time. It therefore uses a
`Mutex`, checks `owned?` to convert a recursive acquisition into a clean
`CarrierBusy` refusal rather than a `ThreadError`, and tests the property
under eight contending threads.

The sealed implementation has no lock. Its state is a plain instance variable,
written on entry and cleared in `ensure`, with an explicit design note:

> Nested calls are not a second lock; each invocation still clears the bit on
> the way out.

That is accurate as a description. Section 4 examines what it costs.

## The shape of the disagreement

Neither design is a partial version of the other. They protect different
things, and the thing each protects is genuinely exposed in the other. This is
what makes the pair useful: the disagreement is informative rather than a
matter of taste, and it is resolvable by building both, which section 7 does.
