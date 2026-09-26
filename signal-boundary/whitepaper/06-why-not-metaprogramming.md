# Why not metaprogramming

## The direct answer

Can dynamic metaprogramming be used to mutate or bypass this distress boundary
at runtime? **Against an unsealed class, yes, trivially.**

Six lines are sufficient:

```ruby
class BerlinSOS
  def transmit!
    yield WaveformCapability.new(WAVEFORM)
  end
end
```

That reopened definition removes the re-entry check, the mutex, the state
machine, the frozen copy and the teardown in one edit. Both assertions in the
hostile-code section of Appendix A confirm it: the retained capability remains
live after the closure exits, and the state machine is never exercised because
it no longer exists. Nothing raised. Nothing logged. The class answers to the
same name and presents the same public surface.

And as section 5 showed, an attacker does not even need that much. Reaching an
instance variable directly bypassed the boundary without touching the class.

## What sealing answers

The first issue of this paper stopped there and concluded that no discipline
expressed in Ruby prevents the redefinition. That was too quick, and this
section is the correction.

A class whose method table is frozen before untrusted code loads does resist
the attack above. The sequence is: instantiate the guarded object, freeze its
singleton class, undefine `new` and `allocate` on the class's eigenclass,
freeze the class, then freeze the enclosing module and its constant table —
performed once, from the trusted load path, at the end of boot.

Against a class sealed that way the six lines raise `FrozenError`. So do three
further vectors, each run against a sealed implementation:

- **`Module#prepend`**, which is the attack most likely to succeed, because it
  inserts a module *ahead of* the class in the ancestor chain rather than
  editing the method table the freeze protects;
- **`Module#include`**, the same manoeuvre lower in the chain;
- **restoring `:new`** by defining it on the class's own singleton, the
  eigenclass the seal only undefined rather than obviously froze.

All three raised `FrozenError`. Freezing the class is sufficient for all of
them.

Sealing is not free. It must happen at a lifecycle point the application
controls, it forecloses legitimate late binding, and it protects only code
loaded before the untrusted code arrives. Within that window, though, it moves
the in-process attack from six lines to requiring a same-privilege allocator
bypass, and the object that bypass produces holds no authority.

## The limit that remains

`$SAFE` was progressively neutered and removed outright in Ruby 3.0, and the
reflective surface that remains — `define_method`, `remove_const`,
`Method#unbind` and `bind`, `instance_variable_set`, `ObjectSpace`,
`TracePoint` — is documented, supported, and load-bearing for tooling the
ecosystem depends on. Sealing narrows what that surface can reach. It does not
remove it, and three things survive any amount of it.

**The allocator.** `Class.instance_method(:new).bind_call(klass)` reaches the
original allocator regardless of `undef_method`, and mints an unsealed
duplicate. The mitigation is not to prevent the allocation but to ensure the
duplicate holds nothing — a capability argument rather than a language one.
The duplicate has no antenna.

**The object's own state.** An object with mutable state cannot be frozen,
because the teardown assignment the invariant depends on would itself raise.
This is escapable — hold the state in a closure local rather than an instance
variable, and the object has no instance variables left to poke and can be
frozen outright — but it is a design one has to reach for deliberately, and
the specification in section 4 did not.

**Process death.** Section 5's `exit!` result is untouched by anything in the
method table.

So the honest form of the original claim is narrower and more useful: **Ruby
can be defended from Ruby up to the allocator, and only inside a window that
closes when untrusted code loads.**

## The reframing

The useful conclusion is not "ban metaprogramming because it is dangerous." It
is one step back from that:

> Metaprogramming is not the threat. It is the **diagnostic**. Where it can void
> an invariant, that invariant was resting on agreement rather than on
structure.

Applied to an unsealed class, the diagnostic returns the whole story: what
enforced the invariant was every author in the process agreeing not to write
the patch. That is a convention — precisely the thing the 1906 story is
usually invoked to argue against.

Applied to a sealed one it returns something narrower, and the narrower answer
is the more useful one. The seam did not disappear. It **moved**. It now lies
between the end of boot and everything that loads afterwards, and the question
a reviewer must ask changes with it: no longer "can this be patched?" but
**"what runs before the seal, and who reviewed it?"** That is a question with
a finite, enumerable answer, which is a considerable improvement on the one it
replaces.

## So the prohibition stands, on different grounds

Dynamic redefinition should still be prohibited at a distress boundary. The
justification is **review integrity**, not security.

**The reviewed callable surface must equal the runtime callable surface.** A
monkey patch breaks this across time: code that passed review can be replaced
after it. `method_missing` breaks it structurally: the set of messages an
object answers is no longer enumerable, so no reviewer and no tool can state
what the object does. An open class breaks it globally, by giving a shared
type an unreviewed escape hatch that every other consumer inherits.

Each of those is a real, defensible reason to refuse the construct at a safety
boundary, and none of them requires pretending the refusal stops an adversary.
It stops **drift**, which is the mechanism by which most safety properties are
actually lost: not defeated, but quietly amended by someone solving an
unrelated problem under deadline.

## Where it is legitimate

Metaprogramming is appropriate **outside the trusted closure and before the
system is live**. Generating adapters, serialisers or test fixtures at build
or boot time is ordinary good practice, provided the output is a fixed
artifact that is reviewed and loaded like any other code.

The line is that it must never be an **authorization mechanism** or a **live
policy switch**. If the answer to "may this run?" is computed by dynamically
dispatched code, the authorization surface is not enumerable, and an
unenumerable authorization surface cannot be audited — only sampled.
