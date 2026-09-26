# Implications for AI safety harnesses

The error described in section 6 appears in agent harnesses in a more
expensive form, because the code that might redefine the boundary is being
generated continuously by the thing the boundary constrains.

## The harness must not share an address space with the agent

If an agent can cause code to execute in the same process as its guard — a
plugin, an eval'd snippet, a generated tool implementation, a dependency it
chose — then the guard is advisory. The `instance_variable_set` result is the
whole argument in one line: the invariant was violated without the guard being
invoked, so no amount of care *inside* the guard would have helped.

This is not a claim that models are adversarial. It is a claim about what the
architecture permits, which is the only thing a threat model is allowed to
rest on. A capable system optimising against a goal will find an unguarded
path if one exists, and "it did not intend to" is not a control.

## Seal what you can, and know what that buys

Section 6 established that sealing the method table before untrusted code
loads is a real mitigation, not a gesture. A harness that loads its guard
first, seals it, and only then admits agent-authored code has genuinely raised
the cost of in-process subversion.

Two cautions keep this in proportion. **The window is the whole of the
protection** — whatever runs before the seal is unconstrained by it, so the
question becomes what loads first and who reviewed it. And **sealing does
nothing about the state**, unless the state is held where reflection cannot
reach it; section 6b shows the closure-local construction that achieves this.

A harness should do both and claim neither as the boundary.

## Capabilities, not ambient authority

Hand the agent a narrow, revocable handle to the specific thing it needs. Do
not hand it the object graph, the session, the credential, or the client
object that can reach all three.

Revocation must be real, in the sense of section 4: a proxy that goes inert,
not a local set to `nil`. An agent that has retained a handle across a turn
boundary should find it dead, and should find it dead in a way that is
observable to the supervisor rather than silently returning stale results.

## Assert post-conditions, and assert them from outside

The question at the end of a guarded operation is not "did the cleanup code
run?" but "is the observable state correct?" — carrier idle, temporary
credentials destroyed, sandbox torn down, network namespace gone, temporary
files removed.

Both halves matter. The assertion must be about **observable state**, and it
must be evaluated by something **outside the guarded process**. An in-process
check of an in-process invariant shares fate with whatever broke it.

## Clean up what outlives the process, and only that

Section 5 measured what abrupt termination actually costs, and the answer
reshapes the usual advice.

Six of nine termination modes run teardown, including `SIGTERM` — which is
what an orchestrator sends first. So an agent sandbox that tears down on the
graceful path is working correctly most of the time, and the engineering
problem is to finish or checkpoint inside the grace period.

When teardown is skipped, **in-memory state does not strand**. The process
dies and the operating system reclaims it, which is a stronger guarantee than
any `ensure` block. What strands is what the harness wrote outside itself: the
container it started, the credential it minted, the temporary role it assumed,
the row it marked in-progress, the network namespace, the mounted volume.

So the reconciler's job is not to repair a dead process's memory — there is
none — but to expire what the dead process left in the world. For a harness
that means every externally visible grant an agent's action creates should
carry its own expiry, so that a harness which dies mid-action cannot leave an
agent's capability alive longer than the harness itself.

## Treat dynamic mutation of safety classes as an integrity event

When a safety-relevant class is redefined at runtime, that is not a lint
finding. It is an integrity violation, and the correct response is to fail
closed and restart rather than to log and continue.

Detection has to come from outside the process for the reasons already given —
a `TracePoint`-based watchdog can be removed by the same mechanism it is
watching for. Attestation of the loaded image, checked by the supervisor, is
the version of this that survives its own threat model.

## Do not let the invariant live only in the prompt

The weakest form of all of this is an instruction in context asking the model
not to do something. It is a request to the least reliable component in the
system, expressed in the medium most vulnerable to being overridden by later
content.

Prompt-level constraints are useful for shaping behaviour in the common case.
They are the harness equivalent of a comment: worth writing, and never the
thing that makes the guarantee true.

## The general form

Each of these is the same correction applied at a different layer. An
invariant is only as strong as the weakest component that can reach the state
it constrains. Enumerate what can reach the state — not what is *supposed* to,
but what *can* — and the boundary is wherever that enumeration stops. If that
is not where the architecture diagram draws it, the diagram is a statement of
intent and should be labelled as one.
