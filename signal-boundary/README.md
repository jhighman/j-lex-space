# signal-boundary

Outside work, imported by copy on 2026-09-26. This is not part of
`framework/` and nothing here is on the Sentinel's call graph;
`experiments/check.py` does not read it. It sits here because it arrived at
one of this bench's standing rules from a different direction, and because
the question it answers — what a structural invariant is worth, and where it
stops being one — is the bench's question in another language.

## What it is

A distress-protocol boundary, formalised in Ruby. The 1904 Marconi CQD
procedure is modelled as a mutable token sequence whose seam can be written
into; the 1906 Berlin SOS prosign is modelled as one guarded operation with
no addressable interior, an immutable payload, and teardown that does not
depend on the caller.

Two papers argue it. `whitepaper/` is *Remove the Seam*, the architecture
paper. `whitepaper-comparative/` is *Seal and Lock*, which takes a second
implementation of the same specification — produced independently, by a
different model, from the same prompt — and puts each one's attacks to the
other.

## The specifications

```sh
ruby spec/boundary_test.rb        # 17 post-conditions on the baseline
ruby spec/sealed_carrier_test.rb  # 16 on the hardened version
ruby spec/death_modes_test.rb     # 9 ways of dying, and what each leaves behind
```

No gems. Ruby 2.6 or later; everything reported in the papers was measured
on 2.6.10.

`spec/sealed_carrier.rb` is the one to copy. `spec/sos_boundary.rb` is the
baseline the papers attack, kept because a specification that gets taken
apart two sections later teaches more than one presented as sound.

The hardened version holds its state in closure locals rather than instance
variables. That is the move worth the read: an object with mutable state
cannot be frozen, because the teardown assignment raises — but state that is
not *of the object* leaves nothing for reflection to reach, and the carrier
can then be frozen outright.

`ts/` is the guard the revision history's round zero is about, and the
transmission that now runs through it:

```sh
node ts/check.ts
```

No install. Node strips the types and runs it directly, which is why the
file is here rather than the application it came from — that one carries an
Expo app and thirty-one dependencies, and none of them are the argument. The
original suite there is vitest; `ts/check.ts` asks the same questions in
this bench's idiom, and exits non-zero when one of them stops holding. It
was tested by removing the teardown, which is the only way to know a check
is a check.

## What the papers conclude

The in-language invariant holds on every completion path that returns
control to the runtime, and sealing the method table before untrusted code
loads defends it further than the first issue of the paper allowed —
`prepend`, `include`, a reopened class and a restored allocator were all put
to a sealed carrier and all refused.

What survives sealing is narrow and worth stating: a same-privilege
allocator bypass, which yields a duplicate holding no authority; and abrupt
death, which skips teardown on three of nine termination modes. `exit` and
`SIGTERM` are not among the three — they unwind, and teardown runs. When
teardown is skipped, nothing strands in memory; the operating system
reclaims it. What strands is state the process wrote outside itself.

## Where it meets this bench

Two of this repository's rules were reached here independently, which is the
reason the folder is worth its space.

**Nothing is evaluated by the process that produced it.** The comparative
paper found this by accident. Both implementations shipped a serious test
suite, both suites reported complete success, and neither contained a single
assertion about the failure the other one found. The omissions were not
careless: each followed from its author's premise about what the asset was,
which is why review by the same author could not have found either. That is
this bench's standing rule, arrived at from a green suite rather than from a
value layer.

**A refusal nobody can see is indistinguishable from an oversight.** The
hardened carrier refuses re-entry with a named error rather than a
`ThreadError`, for the reason `decline.py` exists: the refusal has to be a
thing a reader can re-derive, not a silent branch.

`whitepaper/12-appendix-c-revision-history.md` is the closest thing here to
a FINDINGS entry. It records what each round of the argument claimed, what
was run against it, and what the claim became — including a list of what in
the current text is still only asserted.

## Not in the tree

The built `.docx` and `.pdf` are absent on purpose: this repository holds
that manuscripts are not source, and where a document appears is a
publication decision. `build.sh` in each paper folder regenerates them with
pandoc, and a LaTeX engine for the PDF.

Neither is the application. Round zero of the revision history describes a
teaching screen that asserted a property the code beneath it did not
exercise; the guard it now calls is in `ts/`, and the screen itself is not.
That round is the one place in the papers where the evidence is testimony
rather than something a reader can run here, and it is left that way rather
than importing a React Native shell to close the gap.
