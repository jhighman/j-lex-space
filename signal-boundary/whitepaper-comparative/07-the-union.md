# The union

The two designs compose. The merged implementation is
`spec/sealed_carrier.rb`; its sixteen post-conditions are in Appendix A and
all pass.

## Seal plus lock

The merge is mostly unremarkable: take the boot-time sealing, take the mutex
and the `owned?` re-entry check, and apply both to the same object. The sealed
design's identity assertion on the waveform is kept, and the caretaker proxy
is dropped for the reasons in section 5.

The result inherits both sets of properties. Reopening is refused, `prepend`
onto the singleton is refused, the constant table rejects substitution,
`raise` and `throw` both tear down — and eight contending threads produce a
peak overlap of exactly one, with the idle indicator never reporting State 0
while another thread is transmitting.

## What falls out of combining them

Neither original could freeze the carrier object itself, and both conceded the
consequence. The state had to live in an instance variable, an instance
variable is reachable by `instance_variable_set`, and an object with mutable
state cannot be frozen without breaking the very assignment the teardown
depends on. The sealing implementation tested this honestly and documented
that an unfrozen instance *can lie while idle*.

The merge removes the variable rather than defending it. The carrier is built
by a factory that holds `gate` and `seized` as **closure locals**, captured by
singleton methods defined on a bare object:

```ruby
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
        WAVEFORM
      ensure
        seized = false
      end
    end
  end

  carrier.singleton_class.freeze
  carrier.freeze                 # safe: the object holds no ivars
  carrier
end
```

The state is now in the binding of the two closures. There is no instance
variable to set, the object can therefore be frozen outright, and the suite
confirms all three consequences: the carrier is frozen, it reports zero
instance variables, and `instance_variable_set` raises rather than forging a
seizure.

Neither party proposed this. It is not a clever trick either missed — it
becomes *available* only once you are holding both requirements at once,
because it is the solution to a tension that only exists when sealing and
mutable state are demanded simultaneously. The synthesis produced something
neither premise generated alone, which is the strongest available argument for
reconciling disagreeing designs rather than picking one.

## What it still does not do

`exit!` inside the lock skips `ensure` in all three implementations, as do
`SIGKILL` and `SIGSEGV`. The other six termination modes tested do run it,
`exit` and `SIGTERM` among them. And when teardown is skipped, nothing strands
in memory — the process is gone and the operating system has reclaimed it.
What strands is state mirrored outside the process. The companion paper's
section 5 has the measured matrix.

The `bind_call` allocator bypass remains available at the same privilege, and
the same answer applies: the duplicate has no antenna.

Both limits are properties of running in one address space with code you do
not control, and neither is addressable by any further refinement of the Ruby.
They are the point at which the companion paper's argument takes over.
