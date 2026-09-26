# Appendix A — Transcripts

All output below was produced on Ruby 2.6.10 (arm64-darwin) and is reproduced
verbatim.

## A.1 The sealing implementation, own suite

```
CQD — loose token sequence
  ok   circular 57 is three tokens separated by pauses
  ok   noise splices a token into the gap
  ok   a non-Marconi station does not hear the procedure
SOS — atomic prosign
  ok   tokenising the prosign is a category error
  ok   a space in the waveform is rejected at composition
  ok   the carrier returns the identical frozen waveform
  ok   the block cannot substitute a token sequence
  ok   State 1 only inside the scope lock; State 0 after
  ok   raise still tears down to State 0
  ok   throw still tears down to State 0
  ok   in-place mutation of the waveform raises and still tears down
  ok   a refinement at the call site cannot re-tokenise the prosign
Why not metaprogramming
  ok   an open method_missing harness is bypassed by defining the method
  ok   reopening the sealed carrier raises FrozenError
  ok   a singleton override on the sealed instance raises FrozenError
  ok   the constant table rejects a replacement waveform
  FAIL same-privilege bind_call mints a shadow; it does not retune the sealed
  carrier
       NoMethodError: undefined method `bind_call' for #<UnboundMethod:
       Class#new>
       Grok_SOS_Code (1).rb:366
  ok   poking the state ivar does not outlive ensure, nor change the waveform
FAILED
```

The single failure is `UnboundMethod#bind_call`, introduced in Ruby 2.7.
Substituting the 2.6-compatible `bind(...).call` makes the assertion pass as
written — see A.2, section A.

## A.2 Cross-examination of the sealing implementation

Probes derived from the locking implementation's threat model, none of which
appear in the suite above.

```
A. the bind_call failure is a version artifact, not a logic error
  Ruby 2.6 equivalent: UnboundMethod#bind(...).call          PASSES — shadow
  corruptible, sealed carrier intact

B. seal integrity against attacks the spec does not cover
  Module#prepend onto the sealed frozen class                FrozenError:
  can't modify frozen class
  Module#include onto the sealed frozen class                FrozenError:
  can't modify frozen class
  restore :new via the class's (unfrozen) singleton          FrozenError:
  can't modify frozen Class
  waveform readable without the carrier at all               yes — it is a
  public constant

C. concurrency — the spec has no test for this
  two threads: does State 0 mean idle?                       state honest
  two threads: do transmissions overlap?                     BREACH — 4
  concurrent transmissions, no mutual exclusion
  nesting: inner ensure clears the bit while outer is live   BREACH — reports
  State 0 inside a live outer transmission
```

## A.3 The locking implementation, own suite

```

1904 CQD — the failure model (these 'pass' by being broken)
  PASS  a noisy channel can overwrite a token in place
  PASS  ordering is not an invariant
  PASS  the whole sequence can be emptied mid-flight

1906 SOS — post-conditions
  PASS  waveform is 9 marks, no whitespace
  PASS  starts at State 0
  PASS  clean path transmits 9 marks
  PASS  clean path restores State 0
  PASS  a raising payload propagates
  PASS  a raising payload still restores State 0
  PASS  a retained capability is dead after teardown
  PASS  State 0 holds after the retention attempt
  PASS  re-entry is refused cleanly, not a ThreadError
  PASS  State 0 holds after refused re-entry
  PASS  no two transmissions overlapped
  PASS  State 0 after contention

The boundary under hostile in-process code
  PASS  monkey patch defeated revocation
  PASS  monkey patch defeated the state machine

All post-conditions held.
```

The last pair pass because the attack succeeds: this implementation does not
seal, so a reopened class defeats it.

## A.4 The merged implementation

```

Inherited from the sealing design
  PASS  reopening the sealed carrier's singleton is refused
  PASS  prepend onto the carrier's singleton is refused
  PASS  the constant table rejects a replacement waveform
  PASS  the waveform is 9 marks with no whitespace
  PASS  transmit returns the identical frozen waveform
  PASS  the block cannot substitute a token sequence
  PASS  in-place mutation of the waveform raises, and tears down
  PASS  raise tears down to State 0
  PASS  throw tears down to State 0

Inherited from the locking design
  PASS  State 1 is visible inside the lock, 0 after
  PASS  re-entry is refused cleanly, not a ThreadError
  PASS  8 threads: no two transmissions overlap
  PASS  State 0 never reported while another thread transmits

New: closed over the state instead of storing it
  PASS  the carrier object is frozen
  PASS  instance_variable_set cannot forge a seizure
  PASS  the carrier holds no instance variables at all

All post-conditions held.
```
