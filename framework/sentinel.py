"""sentinel — a small working model of the Architecture of Contextual Judgment.

After Alexandra Krížová, "Architecture of Contextual Judgment: Governed
Epistemic Transitions" (first edition, 2026; peer reviewer Jeff Highman).
This is not the dissertation's reference implementation — it is the
smallest honest sketch of its load-bearing ideas, sized for this project:

  1. One record type. Everything the system knows is an assertion: an
     accountable claim by someone, about something — including about
     another assertion. Immutable once written.
  2. Derived, never stored. A claim's category and a promotion's verdict
     are computed at read time from the standing record, never cached.
  3. The Sentinel Principle. No claim promotes itself: the step from one
     epistemic state to the next must be accepted by someone independent.
     "Trust is the discipline of preventing inference from becoming
     evidence."
  4. Closure is the constructor, not a gate. A case that has not closed
     does not exist, so a premature judgment cannot even be requested.
  5. Two boundaries, not one. At the exit, inference is not evidence. At
     the entrance, plausibility is not trustworthiness: how easily a claim
     got in is measured, recorded, and structurally kept out of the
     decision about whether it earned its way onward.
  6. Only a person may delegate. Running a computation is task execution
     and needs no clearance; granting a system the authority to judge with
     nobody present is epistemic delegation and only a person may write
     one. An agent can execute, and cannot widen its own authority.

The record is an in-memory sqlite database: real tables, real queries,
gone when the program ends.
"""

import sqlite3

# The epistemic chain. Each state may only be reached from the one before.
CHAIN = ["observation", "interpretation", "belief", "action"]

# What a promotion costs, in independent acceptance. The price rises with
# what the claim licenses: a claim that will be acted on must clear a
# higher bar than one that will only be thought. Consequence sets the
# price of proof.
PRICE = {"observation": 0, "interpretation": 1, "belief": 2, "action": 3}

# Words that flip a sentence's polarity. Used only by the deliberately
# naive contradiction check below.
NEGATIONS = {"not", "no", "never", "cannot", "isn't", "wasn't", "didn't"}

# Below this much resistance at the door, the Sentinel stops trusting the
# quiet and asks its own question.
CURIOSITY_FLOOR = 1

# Two kinds of actor. The distinction is load-bearing, not descriptive:
# it decides who may hand out judgment that happens with nobody present.
PERSON, SYSTEM = "person", "system"

# The author of the founding roster: not an actor in the system, but the
# name the record gives to what it was told from outside. Every chain of
# enrollment terminates here or it terminates in nothing.
FOUNDING = "founding"

# The system speaking as itself, at the door. Only it may record what a
# claim met on the way in.
SENTINEL = "sentinel"


class Record:
    """The append-only record. There is no update and no delete —
    immutability here is not a rule we follow but a method we never wrote."""

    def __init__(self, persons=()):
        self.db = sqlite3.connect(":memory:")
        self.db.execute(
            """CREATE TABLE assertions (
                   id      INTEGER PRIMARY KEY,
                   author  TEXT NOT NULL,   -- who is accountable for this
                   act     TEXT NOT NULL,   -- assert / classify / accept / ...
                   body    TEXT NOT NULL,   -- what is claimed
                   about   INTEGER,         -- another assertion, if any
                   basis   INTEGER,         -- the claim this one is built on
                   actor   TEXT             -- the actor this concerns, if any
               )"""
        )
        # The founding roster. A system cannot establish who is a person —
        # that judgment has no seat inside the machine — so it is asserted
        # from outside and recorded as having come from outside.
        for name in persons:
            self.write(FOUNDING, "enroll", PERSON, actor=name)

    def write(self, author, act, body, about=None, basis=None, actor=None):
        cur = self.db.execute(
            "INSERT INTO assertions (author, act, body, about, basis, actor)"
            " VALUES (?,?,?,?,?,?)",
            (author, act, body, about, basis, actor),
        )
        return cur.lastrowid

    def read(self, id):
        fields = ["id", "author", "act", "body", "about", "basis", "actor"]
        row = self.db.execute(
            f"SELECT {', '.join(fields)} FROM assertions WHERE id=?", (id,),
        ).fetchone()
        return dict(zip(fields, row))

    # -- who is who, and who may hand out judgment --

    def governed(self):
        """Does this record know who anyone is? A record with no roster
        cannot enforce the delegation invariant, and says so rather than
        pretending to."""
        return self.db.execute(
            "SELECT COUNT(*) FROM assertions WHERE act='enroll'"
        ).fetchone()[0] > 0

    def kind(self, name, _asking=frozenset()):
        """Person or system — as first validly enrolled.

        An enrollment is read back along the chain that produced it. A row
        written by someone who could not enroll is not an enrollment; it
        is a sentence about one. The chain terminates at the founding
        roster, which came from outside the system, or it terminates in
        nothing at all.

        This is what stops the shortest attack on the whole design: an
        agent writing itself a person and then having that person grant it
        authority. The invented person is enrolled by an agent, so it is
        not a person, so its grants are not grants. A cycle authorises
        nothing, which is checked rather than assumed."""
        if name in _asking:
            return None
        asking = _asking | {name}
        for author, body in self.db.execute(
            "SELECT author, body FROM assertions WHERE act='enroll' AND actor=?"
            " ORDER BY id", (name,),
        ):
            if author == FOUNDING or self.kind(author, asking) == PERSON:
                return body
        return None

    def standing(self, actor, judgment):
        """May this actor judge claims of this kind, at all?

        A person may. A system may exactly where a person has granted it.
        Anyone else may not, and being unknown is not a neutral state.

        Note what this consults and what it refuses to: it reads
        *authorisation* — what a person deliberately handed over — and
        never *reputation*, the record of who has been right before. The
        first is a sovereign act; the second is the pedigree that the
        entrance boundary exists to keep out of decisions. They look alike
        and they are not, and keeping them apart is the whole job."""
        kind = self.kind(actor)
        if kind == PERSON:
            return True
        if kind == SYSTEM:
            return self.delegated(actor, judgment)
        return False

    def enroll(self, by, name, kind):
        """Add an actor to the roster. Only a person may do this — an
        agent that could enroll could mint the person who authorizes it."""
        if self.kind(by) != PERSON:
            raise PermissionError(f"only a person may enroll; {by} is not one")
        if self.kind(name) is not None:
            raise ValueError(f"{name} is already enrolled; identity is not reassignable")
        return self.write(by, "enroll", kind, actor=name)

    def delegated(self, actor, judgment):
        """Is there a standing grant from a person authorizing this system
        to judge this class of claim with nobody present?

        Re-checked against the roster at read time: a delegation row does
        not become authority merely by sitting in the table. If its author
        is not an enrolled person, it authorizes nothing.

        The grantor is validated through kind(), which walks the chain of
        enrollment back to the founding roster. Asking the table directly
        whether a row calls someone a person is not the same question, and
        the difference is a way in: an agent writes 'puppet is a person',
        has the puppet write a grant, and a check that reads rows instead
        of chains believes both."""
        for row in self.db.execute(
            "SELECT DISTINCT author FROM assertions"
            " WHERE act='delegate' AND actor=? AND body=?",
            (actor, judgment),
        ):
            if self.kind(row[0]) == PERSON:
                return True
        return False

    # -- everything below is derived at read time, never stored --

    def category(self, claim_id):
        """What kind of claim is this? Whatever a strict majority of the
        classify-acts about it said. No majority means: the system does
        not know — and says so, rather than guessing.

        Saying what kind of claim something is *is* a judgment, and the
        cheapest attack on the whole ledger is arithmetic: flood a claim
        with classifications until an action looks like an observation,
        and the price of promoting it falls from three accepts to none.

        So in a governed record a classification counts only from the
        claim's own author — who is entitled to say what they meant — or
        from an actor with standing to judge the very category it is
        voting for. Overruling someone about what they said takes the
        authority the new label would carry."""
        author = self.read(claim_id)["author"]
        rows = self.db.execute(
            "SELECT author, body FROM assertions WHERE act='classify' AND about=?",
            (claim_id,),
        ).fetchall()
        if self.governed():
            rows = [row for row in rows
                    if row[0] == author or self.standing(row[0], row[1])]
        tally = {}
        for _, body in rows:
            tally[body] = tally.get(body, 0) + 1
        total = sum(tally.values())
        for body, count in tally.items():
            if count * 2 > total:
                return body
        return None

    # -- the entrance: what a claim cost to get in --

    @staticmethod
    def _words(text):
        return {w.strip(".,;:!?'\"").lower() for w in text.split() if w.strip(".,;:!?'\"")}

    def friction(self, claim_id):
        """What the record resisted when this claim came in.

        Four components, after the four ways a claim slips in unexamined:
        it contradicts nothing standing, its author is usually right, it
        sounds like everything else here, and nobody questioned it. The
        first is deliberately naive — shared vocabulary with opposite
        polarity — and is labelled naive rather than dressed up. The system
        reports what it can measure and does not pretend to more.

        Note which way status runs: an author who is usually right lowers
        the friction of everything they say. That is not a reward. It is
        the exact asymmetry this measurement exists to make visible."""
        a = self.read(claim_id)
        mine = self._words(a["body"])

        contradicted = familiar = 0
        for other_id, body in self.db.execute(
            "SELECT id, body FROM assertions WHERE act='assert' AND id != ?",
            (claim_id,),
        ):
            theirs = self._words(body)
            if len(mine & theirs) >= 2:
                familiar += 1
                if bool(mine & NEGATIONS) != bool(theirs & NEGATIONS):
                    contradicted += 1

        author_accepts = self.db.execute(
            "SELECT COUNT(*) FROM assertions WHERE act='accept' AND author != ?"
            "  AND about IN (SELECT id FROM assertions WHERE author = ?)",
            (a["author"], a["author"]),
        ).fetchone()[0]

        examined = self.db.execute(
            "SELECT COUNT(*) FROM assertions WHERE act='challenge' AND about=?",
            (claim_id,),
        ).fetchone()[0]

        parts = {
            "contradicted": 1 if contradicted else 0,
            "source unproven": 0 if author_accepts else 1,
            "unfamiliar": 0 if familiar else 1,
            "examined": examined,
        }
        # Only the first three are the room's own resistance. The fourth is
        # what anybody — including the Sentinel — thought to ask.
        parts["resistance"] = (parts["contradicted"] + parts["source unproven"]
                               + parts["unfamiliar"])
        return parts

    def plausible(self, claim_id):
        """Did this claim enter without meeting anything at all?

        High plausibility is not a compliment. It marks a claim that
        nothing resisted — the condition under which an inference walks in
        wearing the coat of evidence.

        Read at the door, before the Sentinel's own question, which is
        asked precisely when the answer here is yes. Counting that
        question as resistance would let the system congratulate itself
        for the doubt it had to manufacture."""
        return self.door(claim_id) == 0

    def admit(self, claim_id):
        """Record what this claim cost to get in, and question it if that
        cost was nothing.

        Friction is relational: it is computed against whatever else
        stands, so the same claim meets a different room an hour later.
        That makes "how easily it entered" a fact about a moment, and a
        read-time query cannot answer a question about the past. So the
        Sentinel writes down what it saw at the door — as an ordinary
        attributable assertion, immutable like every other, rather than as
        a mutable attribute on the claim.

        Active curiosity follows. Where a claim met too little resistance,
        the Sentinel supplies the missing question itself. A record that
        never questions what it finds comfortable is not careful; it is
        the bureaucrat that swallows an elite dogma whole because the
        dogma arrived in a familiar voice. The absence of doubt is a
        condition to be repaired, not a result to be trusted. The
        challenge is attributable to the system, blocks nothing, and is
        answerable by anyone. A mirror, not a gate."""
        resistance = self.friction(claim_id)["resistance"]
        self.write(SENTINEL, "admit", str(resistance), about=claim_id)
        if resistance >= CURIOSITY_FLOOR:
            return None
        return self.write(
            SENTINEL, "challenge",
            "entered without resistance — what would show this false?",
            about=claim_id,
        )

    def door(self, claim_id):
        """The resistance this claim met at admission, read back from the
        record rather than recomputed — the past does not move.

        Only the Sentinel's own reading counts, and only its first: the
        door is a moment, and a later row claiming otherwise is somebody's
        account of the door rather than the door."""
        row = self.db.execute(
            "SELECT body FROM assertions WHERE act='admit' AND about=? AND author=?"
            " ORDER BY id LIMIT 1", (claim_id, SENTINEL),
        ).fetchone()
        return int(row[0]) if row else None

    # -- the exit: what a claim must pay to be promoted --

    def earned(self, claim_id):
        """Has this claim's promotion been earned? Only by acceptance from
        someone other than its author — the Sentinel Principle as a query,
        with the author's own accepts simply not counted — and only as much
        of it as the claim's consequence demands.

        Read what this method touches: the claim's kind, who accepted it,
        whether those actors could judge at all, and the price of that
        kind. It has no way to learn how easily the claim got in. That
        separation is the entrance invariant, kept by construction rather
        than by resolve.

        A claim whose kind is unknown cannot be earned: if the system does
        not know what a statement does, it cannot know what the statement's
        promotion costs, and an unknown price cannot be paid.

        Two things are counted carefully. Acceptance is counted by *actor*
        and not by row: saying yes twice is one actor agreeing with itself,
        and a price of two independent accepts means two, not one
        enthusiastic voice. And in a governed record the accepters are
        re-checked for standing at read time, so an accept written straight
        into the ledger by something with no authority to judge is a row in
        a table and not a step toward warrant."""
        kind = self.category(claim_id)
        if kind is None:
            return False
        author = self.read(claim_id)["author"]
        accepters = {row[0] for row in self.db.execute(
            "SELECT DISTINCT author FROM assertions"
            " WHERE act='accept' AND about=? AND author != ?",
            (claim_id, author),
        )}
        if self.governed():
            accepters = {a for a in accepters if self.standing(a, kind)}
        return len(accepters) >= PRICE[kind]


def claim(record, author, category, body, basis=None):
    """State something on the record, at a declared point in the chain.
    A claim above the first state must name the claim it is built on."""
    if category not in CHAIN:
        raise ValueError(f"unknown epistemic state: {category}")
    if category != CHAIN[0] and basis is None:
        raise ValueError(f"{category} must be built on a prior claim (basis=)")
    id = record.write(author, "assert", body, basis=basis)
    record.write(author, "classify", category, about=id)
    record.admit(id)
    return id


def accept(record, author, claim_id, note="reviewed"):
    """Accept a claim's promotion — as yourself, on the record. If you are
    its author, this is written down and then never counted: a mirror,
    not a gate. The record shows the attempt; the derived verdict ignores it.

    Accepting is judgment, and in a governed record a system may only
    judge where a person has delegated that class of judgment to it. An
    actor nobody has enrolled has no standing to judge at all — being
    unknown is not a neutral state.

    Note what is *not* restricted here: computation. The Sentinel measures
    friction, derives categories and raises its own challenges with no
    delegation whatsoever, because none of that is judgment. Doing work is
    not deciding."""
    if record.governed():
        kind = record.kind(author)
        if kind is None:
            raise PermissionError(
                f"{author} is not enrolled; an unknown actor has no standing to judge")
        if kind == SYSTEM:
            judgment = record.category(claim_id)
            if not record.delegated(author, judgment):
                raise PermissionError(
                    f"{author} holds no delegation to judge {judgment} claims")
    return record.write(author, "accept", note, about=claim_id)


def assign(record, by, to, work):
    """Hand a unit of work to an executor.

    Work is *assigned*. The other word is not available for this, and the
    vocabulary is part of the guarantee rather than a note about it:
    anyone may assign work to a system, because assigning confers nothing.
    The executor gains a job and not a scrap of authority, and no quantity
    of work adds up to permission to judge.

    Reserving one word for one act is what stops the argument nobody
    should get to make — that because a system was handed something, it
    was handed the right to decide."""
    return record.write(by, "assign", work, actor=to)


def assigned_to(record, task):
    """The executor this unit of work was handed to."""
    return record.read(task)["actor"]


def assigned(record, executor):
    """The work this executor has been handed. A list of jobs, and no
    part of an answer to what it may decide."""
    return [row[0] for row in record.db.execute(
        "SELECT body FROM assertions WHERE act='assign' AND actor=?", (executor,)
    )]


class Delegation:
    """Epistemic delegation: the record of a person granting a system the
    authority to make a class of judgment with nobody present.

    This is deliberately *not* the other thing the word usually means. A
    system running a computation is task execution and needs no clearance
    at all; it is work, not authority. Conflating the two is how an agent
    talks its way into judging: it does a task it was permitted to do,
    calls that permission 'delegation', and then treats the word as a
    licence to decide.

    So the two are kept apart by construction. There is no constructor for
    a delegation, only a grant, and the grant refuses anyone who is not a
    person."""

    def __init__(self, *args, **kwargs):
        raise TypeError("a delegation is granted, not constructed — use Delegation.grant()")

    @classmethod
    def grant(cls, record, by, to, judgment):
        """A person grants a system authority over one class of judgment.

        Every refusal here closes a route by which an agent could widen its
        own authority: it cannot grant (not a person), cannot be granted to
        as though it were a person, and cannot invent a class of judgment
        the chain does not contain."""
        if record.kind(by) != PERSON:
            raise PermissionError(
                f"only a person may delegate epistemic judgment; {by} is "
                f"{record.kind(by) or 'unenrolled'}")
        if record.kind(to) != SYSTEM:
            raise ValueError(
                f"epistemic delegation grants judgment to a system; {to} is "
                f"{record.kind(to) or 'unenrolled'}")
        if judgment not in CHAIN:
            raise ValueError(f"no such class of judgment: {judgment}")
        return record.write(by, "delegate", judgment, actor=to)


class Case:
    """A closed episode — an edge from its first claim to its last.

    There is no Case.open(). The only constructor closes; an unclosed case
    is not an object that exists, so nothing can be asked about it. That
    is the difference between a policy and an invariant: a policy is a
    rule the system follows, an invariant is a state it cannot be in."""

    def __init__(self, *args, **kwargs):
        raise TypeError("a case that has not closed does not exist — use Case.close()")

    @classmethod
    def close(cls, record, claim_ids):
        case = object.__new__(cls)
        case.record = record
        case.claims = list(claim_ids)
        return case

    def judge(self, judge_author):
        """One judgment, of the whole case, after closure. Walks every
        step in the episode and reports whether each promotion was earned.
        The judge must be independent of every claim in the case."""
        for id in self.claims:
            if self.record.read(id)["author"] == judge_author:
                return {"verdict": "refused",
                        "reason": f"{judge_author} authored claims in this case"}
        steps = []
        for id in self.claims:
            a = self.record.read(id)
            if a["basis"] is not None:
                steps.append({
                    "step": f"{self.record.category(a['basis'])} -> {self.record.category(id)}",
                    "claim": a["body"],
                    "earned": self.record.earned(id),
                })
        return {"verdict": "judged", "steps": steps}
