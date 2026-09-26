# The seal under attack

## What the seal does

At the end of boot, before any untrusted code has been loaded, the sealing
implementation performs the following in order: instantiate the carrier,
freeze the instance's singleton class, undefine `new` and `allocate` on the
class's eigenclass, freeze the class, freeze the enclosing module and its
constant table, and freeze the top-level module itself.

The ordering matters. Each freeze happens after the last legitimate mutation
it needs to permit, and the whole sequence happens once, from the trusted load
path, guarded so it cannot be run twice.

Its own suite verifies three consequences: reopening the class with
`class_eval` raises `FrozenError`, `define_singleton_method` on the sealed
instance raises `FrozenError`, and `const_set` or `remove_const` on the
waveform raises `FrozenError`.

## Three attacks its suite does not try

A test suite written by the author of a defence tends to test the attacks the
author was defending against. The following three were run independently.

**`Module#prepend` onto the sealed class.** This is the vector that usually
defeats a frozen class, because it does not edit the method table — it inserts
a module ahead of the class in the ancestor chain, and lookup finds the
intruder first. Result: `FrozenError: can't modify frozen class`.

**`Module#include` onto the sealed class.** Same reasoning, lower in the
chain. Result: `FrozenError`.

**Restoring `:new` through the class's singleton.** The seal undefines `new`
on the eigenclass but does not obviously freeze the eigenclass itself, which
suggests `define_method` could put it back. Result: `FrozenError: can't modify
frozen Class` — freezing the class is sufficient here.

The seal held on all three. That is a stronger result than the companion paper
credited, and it is the reason this paper exists.

## What the seal concedes, honestly

The implementation documents its residual hole in a comment written *before*
the test that demonstrates it:
`Class.instance_method(:new).bind_call(TheClass)` reaches the original
allocator regardless of `undef_method`, and mints an unsealed duplicate. The
duplicate is freely corruptible.

The argument offered is correct and worth preserving verbatim in spirit:
**universal preemption is a capability the duplicate was never given, not a
promise that Ruby cannot allocate objects.** The shadow carrier has no
antenna. Nothing in the system routes a distress transmission through it, and
possessing a corruptible replica of an object is not the same as controlling
the object.

This is the right way to document a limitation: state it before it is tested,
test it, and explain precisely why it does not invalidate the design.

## The amendment to *Remove the Seam*

As first issued, that paper asserted on the strength of a six-line monkey
patch that no discipline expressed in Ruby prevents the boundary being
redefined at runtime. The following correction has since been folded into its
section 6.

That claim is too strong and should read: **no discipline prevents it unless
the method table is sealed before untrusted code loads.** Sealing is a real
mitigation with a real cost — it must happen at a point in the lifecycle that
the application controls, and it forecloses legitimate late binding — but
within its window it raises the cost of the in-process attack from six lines
to requiring a same-privilege allocator bypass that yields an object with no
authority.

This does not move the conclusion of that paper; section 6 here explains why
it in fact sharpens it.
