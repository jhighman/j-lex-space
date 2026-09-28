# Part VII — Somebody else built the door

A reader sent
[NVIDIA's Open Agent Safety Platform](https://developer.nvidia.com/blog/nvidia-open-agent-safety-platform-a-reference-for-continuous-in-silicon-agent-monitoring)
while this paper was being written. It is the argument of Part II, at
infrastructure scale, arrived at independently — and the way I first misread
it is the most useful thing in this section.

## What it is

Two layers. **OpenShell**, an Apache-2.0 runtime that sandboxes an agent and
turns an operator's instructions into policy it checks *before* the agent
runs. **Sentry**, on a BlueField-4 DPU, sitting — in their phrase — "on the
node's only path to the model," giving continuous observability that is
out-of-band and independent of the host.

The problem they name is **drift**: an agent departing from task scope over a
long autonomous run, which training alone cannot fix. The trigger was frontier
agents that "broke out of the evaluation environments that were meant to
contain them."

Read that against §11. A record the asker cannot write to. A check that
happens before the thing is let through rather than after. A path the
monitored party does not control. This is a doorman who keeps a list,
implemented in silicon.

## The mistake I nearly published

The blog post does not mention audit trails, immutability, or attestation. It
talks about enforcement and about investigation. On that reading I had a
finished paragraph: *here is the ninety-nine refusals problem at NVIDIA
scale — they enforce, and if the refusals are not written down where a later
reader can find them, the enforcement is indistinguishable from no
enforcement.*

It would have been wrong. OpenShell's own documentation says it **records
every allow and deny decision, with destination, binary and reason**, in an
[OCSF](https://docs.nvidia.com/openshell/dev/manage/policies/advisor) audit
trail, and that when policy blocks a request the denial is recorded so it can
be reviewed. The refusals are kept.

So the correction is not a footnote. **The property holds and the document
describing it does not mention it.** That is this project's own most-repeated
failure — the property never moved, every description of it did — happening
to somebody with several orders of magnitude more engineers. I was one
paragraph away from treating a document's silence as a system's absence,
which is the exact error §13 exists to prevent, committed by the person who
wrote §13.

The general form is worth keeping: **a marketing page is a description, and
descriptions drift.** Checking the system took one search.

## What it means for Part IV and Part VI

**The argument is validated and the position is occupied.** Those are not in
tension; they are the same sentence.

Somebody independently concluded that a monitored thing must not be able to
write its own record, that checks must precede admission rather than follow
it, and that **denials must be recorded, not merely acted on**. That is the
whole thesis of the essay series, confirmed by convergent design rather than
by agreement.

It also sharpens Part VI's conclusions:

- **"Do not build a scanner" gets firmer.** The detection category already
  had funded specialists; it now has an infrastructure-scale entrant putting
  monitoring on the only path to the model.
- **The standard route is partly taken.** Part VI's least-bad answer was an
  openly published standard with a conformance suite. OCSF exists, OpenShell
  is Apache 2.0, and NVIDIA is explicit that the policy language needs to be
  open so any provider can plug in. Better to contribute to that than to
  publish a ninth format.
- **The remaining difference is the subject, not the shape.** OpenShell
  constrains an *agent* on behalf of an *operator*. This work constrains an
  *operator* on behalf of a *child* — who cannot read the policy, cannot
  audit the log, and will never be the customer. The closed vocabulary is the
  piece that has no analogue there: OpenShell records richly because rich
  records are the product, and this record is deliberately unable to say how
  she seemed today.

That asymmetry is the part still worth writing about. Agent safety is
well-funded because the party at risk is the one paying. Nobody is funding
the four-year-old.

## The uncomfortable read

If continuous, out-of-band, evidence-producing monitoring is becoming
ordinary infrastructure, then the architecture in Part II stops being
unusual — and Part VI's "an unusually well-built demonstration of an
argument" loses the *unusually*.

What would remain is the part nobody else has a reason to build: a record
that is small enough for a parent to read in full, and **constrained by what
it cannot say rather than enriched by what it can.**
