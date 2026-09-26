# Appendix A — Post-condition transcript

All output below was produced by the files in `spec/` against the
specification in section 4, on Ruby 2.6.10 (arm64-darwin). It is reproduced
verbatim.

## A.1 Post-conditions

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

The three CQD assertions pass by demonstrating the failure mode; the remainder
assert the SOS invariant. The last pair are the hostile-code result of
section 6 — they pass because the attack succeeds against an unsealed class.

## A.2 Termination modes

Each mode kills the process differently. An external resource is acquired
before the closure and released in an application-level `ensure`, so the lease
column shows what a dead process leaves behind.

```

  MODE      ensure    at_exit   lease
  --------- --------- --------- ----------
  return    ran       ran       released
  raise     ran       ran       released
  throw     ran       ran       released
  exit      ran       ran       released
  exit!     SKIPPED   SKIPPED   STRANDED
  sigterm   ran       ran       released
  sigint    ran       ran       released
  sigkill   SKIPPED   SKIPPED   STRANDED
  sigsegv   SKIPPED   SKIPPED   STRANDED

  Teardown runs on 6 of 9 completion paths. The 3 that skip it are the
  ones that never return control to the Ruby runtime. Only the external
  lease strands; in-memory state is reclaimed by the OS.

All death modes behaved as specified.
```

Six of nine run teardown. The three that do not are the paths that never
return control to the runtime. This table replaces the generalisation from
`exit!` that an earlier issue of this paper made.

## A.3 Teardown probes

Each invocation registers an `at_exit` handler that reports the observed
state of the carrier.

```
$ ruby ensure_limits.rb throw
  state at exit: 0
$ ruby ensure_limits.rb kill
  state at exit: 0
$ ruby ensure_limits.rb ivar
  state at exit: 1
$ ruby ensure_limits.rb exit!
  inside closure, calling exit!
```

The `ivar` probe reports state 1 without ever having called `transmit!` — the
guard was bypassed, not broken. The `exit!` probe produces no state line at
all: the process died inside the closure and the `at_exit` handler did not
run. Note that nothing is left stuck in memory by that death; a fresh process
seals a carrier at State 0. What strands is the external lease in A.2.
