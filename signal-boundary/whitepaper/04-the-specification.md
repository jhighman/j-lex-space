# The specification

The implementation below is Ruby 2.6-compatible and runs. Its post-conditions
are executed in section 5 and the full transcript is Appendix A.

**This is the baseline, not the recommendation.** Sections 5 and 6 find three
defects in it, and section 6b gives the hardened version that answers them.
The baseline is kept because a specification that is attacked in the next two
sections is more instructive than one presented as finished.

## The negative model

CQD is implemented as a genuine mutable sequence, with its mutation surface
public. A negative specification that cannot be exercised proves nothing, so
this model is meant to be broken, and section 5 breaks it.

```ruby
class MarconiCQD
  attr_accessor :tokens

  def initialize
    @tokens = [:C, :Q, :D]
  end

  def transmit(channel)
    tokens.each { |token| channel << token }
    channel
  end
end
```

Three properties are being modelled: the tokens are separately addressable,
the ordering is convention rather than guarantee, and the state stays writable
after any validation the caller might have performed.

## The revocable capability

Before the guarded operation itself, one component that the canonical version
of this pattern usually gets wrong.

The familiar idiom sets the private reference to `nil` inside `ensure`, with a
comment describing it as dropping the reference. **That line is decorative.**
Assigning `nil` to your own local variable does nothing about a reference the
block retained, and the block was handed the object precisely so that it could
use it. If the payload stores it, it keeps working after teardown.

Revocation has to happen at a proxy the holder is forced to go through — the
caretaker pattern, and the same idea as membranes in object-capability
systems.

One concession before the code: **the pattern is right and this payload does
not warrant it.** A frozen string carries no authority, so a retained
reference to it grants nothing and there is nothing to revoke. Revocation
earns its place when the capability is a file descriptor, a credential or a
connection. Section 6b drops the proxy in favour of asserting reference
identity on the constant, which is both simpler and a stronger check. The
pattern is set out here because it is the part most often got wrong, not
because this example needs it.

```ruby
class WaveformCapability
  def initialize(value)
    @value = value
  end

  def to_s
    raise Revoked, "waveform capability was revoked at teardown" if @value.nil?
    @value
  end

  def length
    to_s.length
  end

  def revoke!
    @value = nil
  end

  # Never raise from inspect; debugging must not detonate.
  def inspect
    @value.nil? ? "#<WaveformCapability revoked>" : "#<WaveformCapability live>"
  end
end
```

The `inspect` override is not incidental. A proxy that raises on inspection
turns every debugger session and every log line that touches it into a second
incident, at the worst possible moment.

## The guarded operation

```ruby
class BerlinSOS
  WAVEFORM = "···———···"

  attr_reader :state

  def initialize
    @gate  = Mutex.new
    @state = 0
  end

  def transmit!
    raise CarrierBusy, "re-entry from the owning thread" if @gate.owned?

    @gate.synchronize do
      raise CarrierBusy, "carrier not at State 0" unless @state.zero?

      @state = 1
      capability = WaveformCapability.new(WAVEFORM.dup.freeze)

      begin
        yield capability
      ensure
        capability.revoke!   # actually revokes, even if the block kept it
        @state = 0           # State 0 is unconditional
      end
    end
  end
end
```

Four decisions worth defending.

**There is no token API.** `BerlinSOS` exposes `state` for observation and
`transmit!` for use. The absence is the design: there is no supported way to
obtain the waveform outside a live closure, so there is no seam to address.

**Re-entry is detected rather than suffered.** Ruby's `Mutex` is not
reentrant; a recursive lock raises `ThreadError: deadlock; recursive locking`.
Checking `@gate.owned?` converts a crash with a confusing message into a clean
domain refusal, which is the difference between an incident that explains
itself and one that does not.

**The payload receives a copy, frozen.** `WAVEFORM.dup.freeze` means a payload
cannot mutate the constant through the reference it was given. Note that
`freeze` is shallow; it is adequate here because the value is a flat string,
and would not be adequate for a nested structure.

**Teardown does two things, in order.** Revoke the capability, then reset the
state. Both are inside `ensure`, which is what makes State 0 a post-condition
of the operation rather than an obligation on the caller.

Section 5 establishes precisely how far "unconditional" extends.
