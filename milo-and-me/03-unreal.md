# Part III — On Unreal

The question is not *can this be built in Unreal.* Of course it can; it is a
small game. The question is **what happens to the argument** when it is.

This part is organised by what survives, what has to be rebuilt, and the one
thing that gets qualitatively harder rather than merely more work.

## 17. What ports unchanged

**The engine.** The record is a Rust staticlib with a C ABI. Unreal links C
libraries as a matter of course, and the whole of the vocabulary, the
derivations and the governance generator come across untouched. This is not
luck — it is what putting the record in a portable core was for, and it is
the single best structural decision in the project.

**Everything the record guarantees comes with it.** Closed vocabulary.
Append-only. Derived-never-stored. One copy of the list, read by both the
writer and the parent screen. The staleness test. None of that is iOS.

**The design.** Restraint, posture instead of a meter, the lamp, the
vouching, the goodbye — these are rules about creatures and light. They do
not care what draws them.

## 18. What has to be rebuilt, and is straightforward

**Drawing.** Every creature and room is currently a few dozen lines of
vector geometry. In Unreal these become meshes and materials, which is a
real art budget but an ordinary one.

**The light.** The lamp is presently a multiply-blended radial mask over a
flat scene. Unreal does this properly and better, and the 3D spike already
showed the Moon Hare is affordable in the round. **The mechanic is the
light** — animals answer to it and walking into the pool is the meter — so
this is the one area where Unreal is straightforwardly an upgrade.

**Layout.** The short-axis design space becomes UMG anchors and a safe-area
zone. The reachability check becomes a widget-tree walk. Same idea, new
idiom.

## 19. What is genuinely lost

**"Nothing is loaded, so nothing can go missing."**

That property dies on contact with Unreal. Today the entire game is source:
no atlases, no meshes, no audio banks. A build either compiles or does not,
and there is no third state where it runs with a texture absent. Once there
is content, there is a content pipeline, and "the game has no assets" stops
being sayable.

This matters more than it sounds. It is one of the few claims in the project
that is *structurally* true rather than maintained, and structural truths
are the only ones that have survived contact with this codebase.

**"There is no text anywhere in the game."**

Presently checkable with a grep: no label nodes exist. UMG is a text-first
UI framework; a stray `TextBlock` in a widget is one careless drag away, and
the check becomes a lint over a Blueprint graph rather than a property of
the tree.

**One place that writes rows.**

Today there is exactly one function that can append to the ledger, and it is
easy to see every call. In Blueprints, a row could be written from anywhere
by anyone, including from a designer's graph at 6pm. The closed vocabulary
would still hold — the core refuses unknown words — but *a true word about a
false event* becomes much easier to produce. The project has already made
that mistake once, writing a `wait` row when a child reached at a frightened
animal, and it was found only because one person could read every call site.

Mitigation: the ledger must be C++-only, exposed to Blueprint through a
handful of deliberate nodes, and the call sites must be enumerable. That is
a policy, and policies are the weak kind of guarantee this project spends
its time trying to avoid.

## 20. The problem that changes in kind: the supply chain

Today the app makes a strong claim: **no microphone, camera, network or
location call exists anywhere in it.** That is checkable, because the app is
two people's source plus one Rust crate.

Unreal arrives with an engine of several million lines, a plugin ecosystem,
and — depending on target — platform SDKs, crash reporters, analytics
modules and store libraries that are *on by default* and considered
unremarkable by everybody except this project.

The claim does not become false. It becomes **a claim about a supply chain
rather than about a codebase**, and those are verified completely
differently: by inventory, by build-time enforcement, by network egress
testing, by reading someone else's release notes forever.

**And this is a liability, not an aesthetic concern.** The amended COPPA
Rule applies to any operator that knowingly collects children's data
*including through third-party plug-ins or ad networks*
([FTC](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)).
Disney paid $10m in September 2025 over data collected from children through
child-directed video on somebody else's platform. An engine module that
phones home is not a footnote in the disclosure; it is the violation, and
the operator owns it.

This is precisely the shape this work's own papers describe as **burden
displacement**. The system looks simpler because the complexity has left the
operator's side of the boundary. It has not gone; it has moved to whoever is
trying to establish what the software actually does. Choosing Unreal is
choosing to take that burden on deliberately, and the honest version of that
choice is to say so and budget for it.

Concretely it means:

1. **A named inventory** of every module and plugin in the shipping build.
2. **Egress testing as a release gate** — the app is run and watched, and
   any packet is a failure, not a finding.
3. **A disclosure that says what was checked and how**, not that the app is
   private.

Any of these is affordable. What is not affordable is shipping the current
claim unchanged onto a platform where it now means something weaker.

## 21. What Unreal buys

Set against that, honestly:

- **Presence.** The 3D spike was spent once, on the one creature the game
  makes a child earn socially, and it worked. An animal with volume and a
  real light on it is more of a creature. For a game whose entire mechanic
  is *reading an animal*, that is not decoration.
- **One codebase across phone, tablet, console and PC**, including inputs
  this design would suit — a console controller is a fine instrument for a
  game with four buttons and no menus.
- **Audio.** Unreal's audio is far beyond what is there now.
- **Hiring.** There are many more Unreal developers than SpriteKit ones.

## 22. A staged path, if it is taken

**Stage 0 — before anything.** Put the current build in front of children.
Nothing in this section should be started until the core loop has met the
audience it was designed for. It would be absurd to port an unvalidated game
to a larger engine.

**Stage 1 — the core moves first.** Link the Rust ledger into an Unreal
project and get the governance document generating from it. Nothing else.
This proves the argument travels.

**Stage 2 — one burrow.** One animal, one lamp, the four offers, the
stillness beat. This is the whole game in miniature and will answer whether
the mechanic reads in 3D.

**Stage 3 — the supply-chain apparatus,** before any content work, because
retrofitting it is how it does not get done.

**Stage 4 — content.**

The ordering is the point: the parts that carry the argument go first, while
they are still cheap to abandon.
