# Where the locking implementation was wrong

Symmetry requires the same treatment in the other direction, and there are
three findings.

## The monkey patch was treated as terminal

The locked implementation demonstrated that six lines of reopened class remove
the lock, the state machine and the teardown together, and concluded from this
that in-process defence is futile and the argument must move to process
isolation.

The demonstration is correct. The conclusion drawn from it was too fast. It
tested one attack against one undefended class and generalised to the
language. Sealing was available and was not considered, and section 3 shows it
holds against three further vectors including the one most likely to succeed.
The correct statement is narrower: an **unsealed** class offers no resistance.

The reasoning error is worth naming because it is a common one. A successful
attack demonstrates that a specific defence is absent. It does not demonstrate
that no defence exists, and the step from the first to the second is where a
threat model quietly becomes a rationalisation for not building the
mitigation.

## The revocable capability was over-engineered for its payload

The locked implementation interposed a caretaker proxy between the block and
the waveform, so that a retained reference would go inert at teardown, and
argued at length that the conventional `isolated = nil` idiom is decorative.

**The argument about `isolated = nil` is correct.** Assigning `nil` to your
own local does nothing about a reference the block kept.

**The proxy was the wrong remedy here.** The payload is a frozen string. A
retained reference to an immutable value with no authority grants nothing, so
there is nothing to revoke. The sealing implementation's approach — hand out
the frozen constant and assert reference identity, `wave.equal?(WAVEFORM)` —
is simpler, and the identity assertion is a stronger check than the proxy
provides, because it detects substitution as well as mutation.

Revocation earns its place when the capability carries authority: a file
descriptor, a credential, a database handle, a network connection. For a
frozen literal it is ceremony, and ceremony at a safety boundary has a cost —
it is additional code that a reviewer must understand before concluding the
boundary is sound.

## The public constant undercuts the isolation claim

Both implementations describe the block as receiving the waveform *and nothing
else*. In both, the waveform is a publicly readable constant, so the block
could obtain it without entering the guarded operation at all.

This does not matter to either design's actual security — the protected
capability is seizing the carrier, not knowing the waveform — but the framing
oversells. The thing being granted is an authority to act, not access to a
secret, and describing it as isolation of the payload invites a reader to
trust a property neither implementation has.
