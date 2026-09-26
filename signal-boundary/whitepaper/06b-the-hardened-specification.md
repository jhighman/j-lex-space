# The hardened specification

Section 4 gave the specification this paper set out to defend. Sections 5 and
6 found three defects in it. This section is what it becomes when all three
are answered, and it is the version to copy. The implementation is
`spec/sealed_carrier.rb`; its sixteen post-conditions are in Appendix A.

## The three defects

**It was not sealed.** Six lines of reopened class removed the lock, the state
machine and the teardown together. Section 6 established that sealing the
method table before untrusted code loads answers this.

**Its state was an instance variable.** `instance_variable_set` therefore
reached the invariant without entering the guarded method at all. This is the
defect that looks unanswerable, because an object holding mutable state cannot
be frozen — the teardown assignment would itself raise `FrozenError`.

**Its capability proxy was ceremony.** The caretaker in section 4 revokes a
reference to a frozen string. A retained reference to an immutable value with
no authority grants nothing, so there was nothing to revoke. The pattern is
correct and the payload did not warrant it.

## The specification

```ruby
module Distress
  class BoundaryError < StandardError; end
  class CarrierBusy  < BoundaryError; end

  module Sos
    WAVEFORM = "···———···"

    def self.build_carrier
      gate   = Mutex.new
      seized = false

      carrier = Object.new

      carrier.define_singleton_method(:state) { seized ? 1 : 0 }

      carrier.define_singleton_method(:transmit) do |&payload|
        raise CarrierBusy, "re-entry from the owning thread" if gate.owned?

        gate.synchronize do
          seized = true
          begin
            payload.call(WAVEFORM)
            WAVEFORM               # the block's return value is discarded
          ensure
            seized = false         # State 0 is unconditional
          end
        end
      end

      carrier.singleton_class.freeze
      carrier.freeze               # safe: the object holds no ivars
      carrier
    end
  end
end
```

## What changed, and what each change buys

**The carrier is built, not instantiated.** `gate` and `seized` are closure
locals captured by the two singleton methods. They are not instance variables,
so there is nothing for `instance_variable_set` to reach — and because the
object holds no instance variables, it can be frozen outright. The suite
confirms all three: the carrier is frozen, it reports zero instance variables,
and an attempt to forge a seizure raises rather than succeeding.

This is the move worth remembering. The apparent dilemma — *mutable state
cannot be frozen* — dissolves once the state stops being state *of the
object*. Ruby gives no mutable cell that is not an object, but it gives
closures, and a closure local is mutable without being reachable.

**The carrier is locked.** A `Mutex` serialises transmission, and
`gate.owned?` converts a recursive acquisition into a clean `CarrierBusy`
refusal instead of a `ThreadError`. Under eight contending threads the peak
overlap is exactly one, and the idle indicator never reports State 0 while
another thread is transmitting. Without the lock, both of those fail: an
unlocked implementation permitted four simultaneous transmissions, and its
first payload to finish cleared the flag for every transmission still running.

**The payload is the frozen constant, and identity is asserted.** No proxy.
`transmit` returns `WAVEFORM` itself, and the test asserts
`wave.equal?(WAVEFORM)` — reference identity, which detects substitution as
well as mutation and is a stronger check than the caretaker provided. In-place
mutation raises `FrozenError` and still tears down.

**The seal runs once, from the trusted load path.** `Sos.freeze` and the
module freeze happen after the carrier is built and before anything else
loads.

## What it still does not do

`exit!`, `SIGKILL` and `SIGSEGV` skip the teardown, as section 5 measured. The
same-privilege allocator bypass still mints an unsealed duplicate, which holds
no authority. And the carrier is still an object in a process, which is the
subject of section 7.

The honest summary is that this specification is as far as the in-language
argument goes. Everything remaining is structural.
