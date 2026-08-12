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
  7. Earned closure. Stopping is a judgment too, and the heaviest one an
     episode makes, so it is priced like the rest. How settled an episode
     feels is measured, recorded, and structurally kept out of the
     decision about whether it may stop — comfort raises the bill and
     never pays it. A case is closed, under named premises, at a moment,
     which is a claim about that moment and never about all time.

The record is an in-memory sqlite database: real tables, real queries,
gone when the program ends.
"""

import sqlite3
from datetime import datetime, timedelta, timezone
from fnmatch import fnmatch


def _now():
    return datetime.now(timezone.utc)

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

# What every closure is questioned at least this much, however contested
# the episode was. No case stops unasked.
CLOSING_FLOOR = 1

# What the Sentinel asks of an episode that wants to stop. Deliberately
# not about the conclusion: each one attacks the shape of the episode —
# what it would take to be wrong, what it never contained, who was never
# heard. A question the case can answer by restating itself is not a
# question.
CLOSING_QUESTIONS = [
    "what would have to be true for this conclusion to be wrong?",
    "which claim here fails first, and does the rest survive it?",
    "what did nobody in this episode think to ask?",
    "whose account is missing from the record?",
    "what does this conclusion look like if the premises are wrong?",
]

# Which way warrant travels in a frame. The chain above runs upward —
# evidence is gathered, and a claim rises through it by paying independent
# acceptance. That is one epistemology and the framework had assumed it was
# the only one, silently, since the file was written.
#
# Some reasoning runs the other way. Polanyi's fiduciary entry (nisi
# crediteritis, non intelligitis) and Bonhoeffer's discipleship begin from a
# commitment and reason *down* toward understanding. Judged by the upward
# test, such reasoning does not read as mistaken; it reads as unsupported at
# every step, which is the instrument reporting that it was pointed at
# something it was not built for. An instrument that fires continuously
# against a system it cannot evaluate is not strict. It is misconfigured.
#
# So direction is declared, on the frame, by a person — never asserted by a
# claim about itself. A claim that could name its own direction could exempt
# itself from every price in this file by writing one word, which would be
# the cheapest bypass here by a wide margin.
ASCENDING, DESCENDING = "ascending", "descending"

# Descending warrant is not an exemption from paying. It is a different
# payment schedule. Ascending claims pay before they rise; a descending
# frame takes its commitment on credit and settles at the exit, where
# everything derived from that commitment must have been examined between
# parties before the episode may stop. The distinction is Bonhoeffer's own:
# grace that costs a shirt, against grace that costs a life. Cheap grace is
# precisely a descent that never paid, and it is the failure mode this
# constant exists to make representable.
PERSON, SYSTEM = "person", "system"

# The author of the founding roster: not an actor in the system, but the
# name the record gives to what it was told from outside. Every chain of
# enrollment terminates here or it terminates in nothing.
FOUNDING = "founding"

# What may be handed over, and how heavily each act weighs. Authority
# tightens the justification required of it: the heavier the act, the more
# a grant must carry before it exists at all.
SCRUTINY = {
    # the epistemic chain — consequence rises along it
    "observation": 1, "interpretation": 2, "belief": 3, "action": 5,
    # named acts, after the reference implementation
    "ground_mention": 1, "dispose_flag": 2, "certify_model": 5,
}

# Requirements accumulate with scrutiny: a written reason from 2, an
# expiry from 3, and from 5 an expiry that cannot reach past a month.
RATIONALE_FROM, EXPIRY_FROM, BOUNDED_FROM, MAX_DAYS = 2, 3, 5, 30


def episode(claim_ids):
    """An episode named canonically: its claims sorted, without repeats.

    An episode is a *set* of claims, and until 2026-08-11 nothing said so.
    The Sentinel's file was found by the episode's last claim alone, and
    priced over whatever list it was handed — so two different episodes
    ending at the same claim shared one file, and whichever asked first
    set the price for both. Naming the whole set closes that: a different
    episode is a different name, and the same claims in a different order
    are not a second episode with a second price.

    Returns the name and the terminal claim, which is the last written
    rather than the last passed in — write order is the record's own, and
    the caller's argument order is not."""
    ids = sorted(set(claim_ids))
    return ",".join(str(id) for id in ids), ids[-1]


def scrutiny(judgment, family=False):
    """How heavily this grant weighs. Reach counts as well as consequence:
    the same act handed to a family of agents rather than to one is a
    wider thing, and costs a level."""
    return SCRUTINY[judgment] + (1 if family else 0)

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
                   actor   TEXT,            -- the actor this concerns, if any
                   at      TEXT NOT NULL    -- when it was written
               )"""
        )
        # The founding roster. A system cannot establish who is a person —
        # that judgment has no seat inside the machine — so it is asserted
        # from outside and recorded as having come from outside.
        for name in persons:
            self.write(FOUNDING, "enroll", PERSON, actor=name)

    def write(self, author, act, body, about=None, basis=None, actor=None):
        cur = self.db.execute(
            "INSERT INTO assertions (author, act, body, about, basis, actor, at)"
            " VALUES (?,?,?,?,?,?,?)",
            (author, act, body, about, basis, actor, _now().isoformat()),
        )
        return cur.lastrowid

    def read(self, id):
        fields = ["id", "author", "act", "body", "about", "basis", "actor", "at"]
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
        of chains believes both.

        Everything a grant must carry is re-checked here rather than only
        at the moment of granting. A grant missing the rationale its
        weight demands, or past its term, is not a weakened delegation —
        it is not one."""
        return bool(self.covering(actor, judgment))

    def covering(self, actor, judgment):
        """Every standing grant that confers this authority on this actor.

        Revocation is only ever as complete as this list, which is why the
        list has to be askable. A grant written to a family keeps
        conferring authority after an individual one is withdrawn, so
        somebody who revokes the grant they remember and assumes the
        authority is gone has removed nothing at all. The question is not
        'did I revoke it' but 'what still covers them'."""
        standing = []
        for grant_id, scope in self.db.execute(
            "SELECT id, actor FROM assertions WHERE act='delegate' AND body=?"
            " ORDER BY id", (judgment,),
        ):
            if scope != actor and not ("*" in (scope or "") and fnmatch(actor, scope)):
                continue
            if self.fault(grant_id) is None:
                standing.append(grant_id)
        return standing

    def _carried(self, grant_id):
        """What a grant carries: its reason and its term, written beside it
        by the same person who granted it. A rationale supplied by somebody
        else is somebody else's opinion of the grant."""
        grant = self.read(grant_id)
        carried = {"rationale": None, "expires": None,
                   "granted": datetime.fromisoformat(grant["at"])}
        for act, body in self.db.execute(
            "SELECT act, body FROM assertions"
            " WHERE about=? AND author=? AND act IN ('because', 'expires')",
            (grant_id, grant["author"]),
        ):
            if act == "because":
                carried["rationale"] = body
            else:
                carried["expires"] = datetime.fromisoformat(body)
        return carried

    def fault(self, grant_id):
        """What is wrong with this grant, or None if nothing is.

        One place decides whether a delegation stands, so that the report
        and the enforcement cannot drift apart — a system whose audit view
        and whose access check disagree has two answers and no truth."""
        grant = self.read(grant_id)
        if grant["act"] != "delegate":
            return "not a delegation"
        if self.kind(grant["author"]) != PERSON:
            return f"granted by {grant['author']}, who is not a person"
        for author, in self.db.execute(
            "SELECT author FROM assertions WHERE act='revoke' AND about=?", (grant_id,)
        ):
            if self.kind(author) == PERSON:
                return f"revoked by {author}"
        if grant["body"] not in SCRUTINY:
            return f"no such class of judgment: {grant['body']}"

        level = scrutiny(grant["body"], "*" in (grant["actor"] or ""))
        carried = self._carried(grant_id)
        if level >= RATIONALE_FROM and not carried["rationale"]:
            return f"scrutiny {level} requires a written rationale"
        if level >= EXPIRY_FROM:
            if carried["expires"] is None:
                return f"scrutiny {level} requires a term"
            if carried["expires"] < _now():
                return "expired"
            if (level >= BOUNDED_FROM
                    and carried["expires"] - carried["granted"] > timedelta(days=MAX_DAYS)):
                return f"scrutiny {level} bounds the term to {MAX_DAYS} days"
        return None

    def void_grants(self):
        """Every row that looks like a delegation and is not, with the
        reason. Nothing is deleted and nothing is hidden: the ledger keeps
        the attempt, and this is where it is shown rather than silently
        discounted. A refusal nobody can see is indistinguishable from an
        oversight."""
        return [(grant_id, self.fault(grant_id)) for grant_id, in self.db.execute(
            "SELECT id FROM assertions WHERE act='delegate' ORDER BY id")
            if self.fault(grant_id) is not None]

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
        authority the new label would carry.

        And counted by *actor*, never by row — the same discipline
        earned() is held to, and missing here until 2026-08-11. Restricting
        who may classify left untouched how often they may, so one voice
        holding the lightest grant in the chain said "observation" twice
        and an action became free to promote. A price decided by counting
        rows is a price anybody may pay twice."""
        author = self.read(claim_id)["author"]
        rows = self.db.execute(
            "SELECT DISTINCT author, body FROM assertions"
            " WHERE act='classify' AND about=?", (claim_id,),
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

    # -- the close: what an episode must survive before it may stop --

    def consequence(self, claim_ids):
        """The heaviest thing this episode did. An episode is priced by the
        furthest point it reached along the chain, not by where it started:
        an argument that ended in an action is an argument about an action,
        however gently it opened."""
        reached = [self.category(id) for id in claim_ids]
        known = [kind for kind in reached if kind in CHAIN]
        return max(known, key=CHAIN.index) if known else None

    def settled(self, claim_ids):
        """How quiet this episode became — the exit's measure of comfort.

        The mirror image of friction(), and it carries the same warning.
        High settlement is not a compliment: it marks an episode that
        stopped meeting anything, which is the condition under which a
        system mistakes the end of its own repertoire for the end of the
        question. Those two states are identical from inside. Nothing
        further changed is what both of them look like.

        Two components, both plain absences. Claims that arrived without
        resistance, and claims nobody but the system ever questioned — the
        Sentinel's own questions are not counted, here as at the door,
        because a record that credits itself for the doubt it manufactured
        is grading its own homework twice.

        Reported and never spent. What this number does is raise what the
        episode must survive; what it may never do is count toward
        surviving it. See earned_closure(), which cannot reach this."""
        quiet = unexamined = 0
        for id in claim_ids:
            if self.door(id) == 0:
                quiet += 1
            if not self.examined(id):
                unexamined += 1
        parts = {"entered quietly": quiet, "questioned by nobody": unexamined}
        parts["quiet"] = quiet + unexamined
        return parts

    def examined(self, claim_id):
        """Was this claim actually questioned — asked by somebody other than
        the system, and answered by somebody other than the asker and the
        author being asked about?

        Asking is free, and anything free turns into arithmetic the moment
        it is worth something. Being questioned lowers what an episode must
        survive in order to stop, so a bare unanswered question would be a
        way to talk that price down by writing rows: two lines in the table
        and the episode looks examined. Found by attacking the close
        directly, 2026-08-11, which is the only way this kind of hole is
        ever found.

        So an examination counts where it happened between parties: one who
        asked, another who answered, and neither of them the author whose
        claim was in question. A question and its answer in the same voice
        is a soliloquy."""
        author = self.read(claim_id)["author"]
        for challenge_id, asker in self.db.execute(
            "SELECT id, author FROM assertions WHERE act='challenge' AND about=?"
            "  AND author != ?", (claim_id, SENTINEL),
        ):
            answered_by = {row[0] for row in self.db.execute(
                "SELECT DISTINCT author FROM assertions WHERE act='answer' AND about=?",
                (challenge_id,),
            )} - {author, asker, SENTINEL}
            if answered_by:
                return True
        return False

    def considering(self, claim_ids, premise_id):
        """The Sentinel's open file on an episode that wants to stop: the
        record of what was asked of it before it was allowed to.

        Opened once per episode per set of premises and found again on
        every later attempt, so questions accumulate answers instead of
        resetting. Asking to close a second time does not buy a fresh
        slate; it only shows the same bill.

        Found by the whole episode and not by its last claim, because the
        file is *priced* over the whole episode and a thing must be
        identified by everything it is charged for. Keyed on one claim, a
        one-claim ask opened the file cheaply and a six-claim episode
        inherited it — the same arithmetic premature.py found in the
        questions, arriving through the identifier instead. See
        episode().

        This is active curiosity at the exit. At the door the Sentinel
        supplies a question when a claim met no resistance. Here it
        supplies one for every sign the episode has gone quiet — and one
        regardless, so nothing stops unasked. Note the direction, because
        it is the whole idea: how settled an episode feels raises what it
        must survive. Comfort is not a discount here. It is the bill.

        Which removes the ceiling that would make the curiosity theatre.
        There is no threshold to run at and no gain in reporting oneself
        finished, because reporting oneself finished is what makes stopping
        expensive."""
        roll, terminal = episode(claim_ids)
        open_file = self.db.execute(
            "SELECT id FROM assertions WHERE act='closing' AND body=? AND basis=?"
            "  AND author=? ORDER BY id LIMIT 1", (roll, premise_id, SENTINEL),
        ).fetchone()
        if open_file:
            return open_file[0]

        attempt = self.write(SENTINEL, "closing", roll,
                             about=terminal, basis=premise_id)
        for n in range(CLOSING_FLOOR + self.settled(claim_ids)["quiet"]):
            self.write(SENTINEL, "challenge",
                       CLOSING_QUESTIONS[n % len(CLOSING_QUESTIONS)], about=attempt)
        return attempt

    def outstanding(self, attempt, before=None):
        """Every question raised against this closure that nobody outside
        the episode has answered.

        An answer written by an author of the case is the case answering
        itself — the Sentinel Principle at the exit, refused for the same
        reason a claim may not accept itself. The Sentinel's own answers
        are refused more firmly still: a system permitted to raise the
        question and settle it has built a mirror and called it a witness.

        Counted by actor rather than by row, and where the record knows who
        anyone is, only from actors who could judge what this episode
        reached. Ten answers from one voice are one voice.

        `before` reads the question as it stood at a moment, rather than
        now. Asked plainly it answers about the present, which is right for
        deciding whether an episode may stop today. A closure, though, is a
        claim about a past: *this stopped here, having survived these
        questions*. Answered from the present, a closure row written before
        its questions were answered would sit refused for an hour and then
        quietly ripen into a sound one — and a later question, written by
        anybody, would unmake a closure that stood for a year. Both were
        real, and both were found on 2026-08-11 by the positive control in
        premature.py, not by the attacks. This is the same lesson the door
        taught: a fact about a moment cannot be re-derived from a room that
        has since changed."""
        open_file = self.read(attempt)
        claim_ids = [int(id) for id in open_file["body"].split(",")]
        authors = {self.read(id)["author"] for id in claim_ids}
        reach = self.consequence(claim_ids)

        standing = []
        for challenge_id, in self.db.execute(
            "SELECT id FROM assertions WHERE act='challenge' AND about=?"
            "  AND (? IS NULL OR id < ?) ORDER BY id", (attempt, before, before),
        ):
            answered_by = {row[0] for row in self.db.execute(
                "SELECT DISTINCT author FROM assertions WHERE act='answer' AND about=?"
                "  AND (? IS NULL OR id < ?)", (challenge_id, before, before),
            )} - authors - {SENTINEL}
            if self.governed():
                answered_by = {a for a in answered_by if self.standing(a, reach)}
            if not answered_by:
                standing.append(challenge_id)
        return standing

    def settlers(self, attempt, before=None):
        """The distinct voices whose answers paid this closing file's bill
        — outside the episode, other than the Sentinel, and holding
        standing over what the episode reached where the record knows who
        anyone is.

        Counted for the same reason earned() counts accepting actors: a
        bill denominated in answered questions is paid in rows, and one
        willing voice can write any number of rows. An episode that
        reached an action asks for the attention of as many independent
        voices as the action's own promotion would have cost. Consequence
        sets the price of proof at the exit as it does everywhere else —
        found by review on 2026-08-12, the entrance having refused this
        arithmetic from its first day.

        `before` scopes the question to a moment, for the same reason
        outstanding() takes it: a closure is a claim about when it was
        written."""
        open_file = self.read(attempt)
        claim_ids = [int(id) for id in open_file["body"].split(",")]
        authors = {self.read(id)["author"] for id in claim_ids}
        reach = self.consequence(claim_ids)

        paid = set()
        for challenge_id, in self.db.execute(
            "SELECT id FROM assertions WHERE act='challenge' AND about=?"
            "  AND (? IS NULL OR id < ?) ORDER BY id", (attempt, before, before),
        ):
            answered_by = {row[0] for row in self.db.execute(
                "SELECT DISTINCT author FROM assertions WHERE act='answer' AND about=?"
                "  AND (? IS NULL OR id < ?)", (challenge_id, before, before),
            )} - authors - {SENTINEL}
            if self.governed():
                answered_by = {a for a in answered_by if self.standing(a, reach)}
            paid |= answered_by
        return paid

    def attention_price(self, claim_ids):
        """How many distinct outside voices this episode's stopping takes:
        as many as its heaviest act would have cost to promote, and never
        fewer than one — no case stops entirely unattended."""
        reach = self.consequence(claim_ids)
        return max(1, PRICE.get(reach, 0))

    def earned_closure(self, attempt):
        """Has this episode earned the right to stop?

        One question, and only one: does anything raised against this
        closure still stand unanswered from outside it?

        Read what this touches and what it cannot reach. It reads the
        questions on the record and who answered them. It has no way to
        learn how quietly the episode's claims arrived, how little it met,
        or whether the system considers itself finished. That separation is
        the entrance invariant kept at the other end of the episode:
        comfort is measured, reported, and never spent.

        The alternative was tempting and is a trap. A system that stopped
        when further work changed nothing would be certifying the
        exhaustion of its own repertoire and calling it the exhaustion of
        the question — and the poorer its imagination, the sooner it would
        earn the right to conclude. Which is why the answer comes from
        outside: not because the system's sense of completion is worthless,
        but because it is exactly as available to a system that has
        finished as to one that has stopped looking.

        Two conditions, both from outside. Nothing raised still stands,
        and the answering was done by enough distinct voices for what the
        episode reached — see settlers(), and the promotion price it
        mirrors."""
        claim_ids = [int(id) for id in self.read(attempt)["body"].split(",")]
        return (not self.outstanding(attempt)
                and len(self.settlers(attempt)) >= self.attention_price(claim_ids))

    # -- premises: what a judgment closed under, and what supersedes it --

    def version(self, premise_id):
        """Which version of its frame this premise is — how many were named
        before it, and it. Nothing is edited, so a change of assumptions is
        a new row and the old one keeps standing where it was."""
        frame = self.read(premise_id)["actor"]
        return self.db.execute(
            "SELECT COUNT(*) FROM assertions WHERE act='premise' AND actor=? AND id<=?",
            (frame, premise_id),
        ).fetchone()[0]

    def direction(self, premise_id):
        """Which way warrant runs in this frame — re-derived, never stored.

        Read back the way a grant is: a row saying a frame reasons downward
        is not a declaration merely by sitting in the table. It counts only
        from the person who named the frame, and only where the record
        knows that they are a person. Anything else is somebody's opinion
        about the frame.

        Absent any valid declaration the answer is ascending, because that
        is what every claim in this file was already being judged by. The
        default is not neutral and is not pretending to be: it is the
        assumption the framework held silently until 2026-08-12, now
        written down where it can be disagreed with."""
        premise = self.read(premise_id)
        if premise["act"] != "premise":
            return None
        for body, in self.db.execute(
            "SELECT body FROM assertions WHERE act='direction' AND about=?"
            "  AND author=? ORDER BY id LIMIT 1", (premise_id, premise["author"]),
        ):
            if body == DESCENDING and (
                    not self.governed() or self.kind(premise["author"]) == PERSON):
                return DESCENDING
        return ASCENDING

    def professed(self, premise_id):
        """The claims validly taken as given under this frame — re-derived,
        never read off the rows.

        A row saying a claim was professed is somebody's sentence about a
        profession, and the ledger is full of sentences. A profession
        stands only where the row was written by the claim's own author,
        the frame it names really declares descent, and — where the record
        knows who anyone is — that author is a person. Anything else is
        a row in a table, stored and not counted: the same discipline
        fault() holds grants to and flaw() holds closures to, found
        necessary the same way each time."""
        if self.direction(premise_id) != DESCENDING:
            return []
        standing = []
        for claim_id, by in self.db.execute(
            "SELECT about, author FROM assertions WHERE act='profess'"
            "  AND basis=? ORDER BY id", (premise_id,),
        ):
            if by != self.read(claim_id)["author"]:
                continue
            if self.governed() and self.kind(by) != PERSON:
                continue
            standing.append(claim_id)
        return standing

    def descends(self, claim_id, given):
        """Does this claim rest, at any depth, on something taken as
        given? Walked back along the basis chain rather than checked one
        hop deep, because a debt one hop deep is a debt an extra step
        discharges — cheap grace at one remove."""
        seen = set()
        id = claim_id
        while id is not None and id not in seen:
            seen.add(id)
            if id in given:
                return True
            id = self.read(id)["basis"]
        return False

    def unexamined_descent(self, claim_ids, premise_id):
        """What a descending frame still owes at the exit.

        The profession itself is taken on credit — that is what descending
        means, and refusing it would be refusing the epistemology rather
        than governing it. What is not free is everything reasoned *down*
        from it, at any depth: each such claim must have been examined
        between parties, by examined()'s own standard, before the episode
        may stop.

        This is where the price moved to. An ascending claim pays at the
        moment it rises; a descending frame pays here, at the close, for
        everything its profession licensed. A descent that pays nothing at
        either end is cheap grace, and the whole point of naming it is that
        it is a failure and not a shortcut."""
        given = set(self.professed(premise_id))
        return [id for id in claim_ids
                if id not in given
                and self.descends(id, given)
                and not self.examined(id)]

    def premises(self, frame):
        """The standing version of a named frame: the latest named. Older
        versions are not gone, and cases closed under them are not wrong —
        they are answers to a question asked under different commitments."""
        row = self.db.execute(
            "SELECT id FROM assertions WHERE act='premise' AND actor=?"
            " ORDER BY id DESC LIMIT 1", (frame,),
        ).fetchone()
        return row[0] if row else None

    def flaw(self, closure_id):
        """What is wrong with this closure, or None if nothing is.

        One place decides whether a closure stands, so that the report and
        the enforcement cannot drift apart — and it decides by re-deriving
        every time it is asked rather than trusting that the row came from
        the function that would have refused it. A row saying an episode
        closed is not a closed episode. It is a sentence about one.

        The same discipline the grants are held to, and found necessary the
        same way: by attacking the table instead of the API. Anything with
        a handle on the database can write the word 'closed', and until
        2026-08-11 a row like that could make a standing closure read as
        superseded — the episode never reopened, but the record said
        somebody else had had the last word."""
        closure = self.read(closure_id)
        if closure["act"] != "closed":
            return "not a closure"
        if not closure["body"].isdigit():
            return "names no closing file"

        premise = (self.read(closure["basis"]) if closure["basis"] else None)
        if premise is None or premise["act"] != "premise":
            return "closed under no named premises"
        if self.governed() and self.kind(premise["author"]) != PERSON:
            return f"premises named by {premise['author']}, who is not a person"

        attempt = int(closure["body"])
        row = self.db.execute(
            "SELECT act, author, about, basis FROM assertions WHERE id=?", (attempt,),
        ).fetchone()
        if row is None or row[0] != "closing" or row[1] != SENTINEL:
            return "names no closing file the Sentinel opened"
        if row[2] != closure["about"]:
            return "names the closing file of a different episode"
        if row[3] != closure["basis"]:
            return "closed under premises its questions were never asked under"

        standing = self.outstanding(attempt, before=closure_id)
        if standing:
            return f"{len(standing)} question(s) still standing when it was written"

        claim_ids = [int(id) for id in self.read(attempt)["body"].split(",")]
        reach = self.consequence(claim_ids)
        need = self.attention_price(claim_ids)
        paid = self.settlers(attempt, before=closure_id)
        if len(paid) < need:
            return (f"closed on the attention of {len(paid)} voice(s); "
                    f"reaching {reach} takes {need}")
        if self.governed() and not self.standing(closure["author"], reach):
            return f"closed by {closure['author']}, who has no standing over {reach}"
        return None

    def void_closures(self):
        """Every row that looks like a closure and is not, with the reason.
        Nothing is deleted and nothing is hidden: the ledger keeps the
        attempt, and this is where it is shown rather than quietly ignored.
        A refusal nobody can see is indistinguishable from an oversight."""
        return [(id, self.flaw(id)) for id, in self.db.execute(
            "SELECT id FROM assertions WHERE act='closed' ORDER BY id")
            if self.flaw(id) is not None]

    def superseded(self, closure_id):
        """The closure standing in this one's place, or None.

        Premises move; what was concluded under the old ones does not. A
        later closure of the same episode under a later version of the same
        frame does not reopen the first and does not correct it — it stands
        in front of it, and both stay readable. This is the only honest
        form of stopping available to a system that may be wrong later: what
        is durable is not the conclusion but the record of what was
        concluded, by whom, under which commitments, having survived what.
        That statement stays true after the commitments change, because it
        is a claim about a moment rather than about all time.

        Only a closure that stands can supersede one — checked here through
        flaw(), at read time. Otherwise the cheapest attack on the whole
        idea is to write the last word rather than earn it.

        And only a closure of the *same episode*. Closures were matched by
        their last claim until 2026-08-11, so an episode of one claim could
        stand in front of an episode of five that happened to end at it —
        which let an actor authorised for the lightest act in the chain
        supersede a judgment reaching the heaviest, honestly, forging
        nothing. It had standing over the small episode it really closed;
        it was the record that could not tell the two apart."""
        closure = self.read(closure_id)
        frame = self.read(closure["basis"])["actor"]
        mine = self.version(closure["basis"])
        for later, basis in self.db.execute(
            "SELECT id, basis FROM assertions WHERE act='closed' AND about=? AND id>?"
            " ORDER BY id", (closure["about"], closure_id),
        ):
            if (self.read(basis)["actor"] == frame
                    and self.version(basis) > mine
                    and self.closed_episode(later) == self.closed_episode(closure_id)
                    and self.flaw(later) is None):
                return later
        return None

    def closed_episode(self, closure_id):
        """The episode a closure row claims to have closed — read from the
        Sentinel's file that it names, never from the row itself. A closure
        that names no file has closed nothing, and two closures that name
        files over different claims are not about the same thing."""
        body = self.read(closure_id)["body"]
        if not body.isdigit():
            return None
        file = self.db.execute(
            "SELECT act, body FROM assertions WHERE id=?", (int(body),)).fetchone()
        return file[1] if file and file[0] == "closing" else None


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


def answer(record, author, challenge_id, body):
    """Answer a question raised against a claim or against a closure — as
    yourself, on the record.

    Anyone may answer, including an author of the case and the system
    itself, because answering is not deciding: it is work, and work is
    never gated here. Whether an answer *counts* is derived afterwards from
    who wrote it, so the record keeps every attempt and the verdict ignores
    the ones that would let an episode settle its own questions. A mirror,
    not a gate — the same shape as accepting one's own claim."""
    return record.write(author, "answer", body, about=challenge_id)


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
    def grant(cls, record, by, to, judgment, rationale=None, expires_at=None):
        """A person grants a system authority over one class of judgment.

        Every refusal here closes a route by which an agent could widen its
        own authority: it cannot grant (not a person), cannot be granted to
        as though it were a person, and cannot invent a class of judgment
        the chain does not contain.

        Authority tightens the justification required of it. What the grant
        must carry rises with the weight of what is handed over — a reason
        from scrutiny 2, a term from 3, and from 5 a term no longer than a
        month. Handing an act to a family of agents rather than to one
        widens its reach and raises its level, because a pattern is a
        promise about agents that do not exist yet.

        The refusal is loud. A grant that cannot meet its own weight does
        not become a lesser grant; it does not become a grant."""
        if record.kind(by) != PERSON:
            raise PermissionError(
                f"only a person may delegate epistemic judgment; {by} is "
                f"{record.kind(by) or 'unenrolled'}")

        family = "*" in to
        if family:
            if len(to.replace("*", "").strip()) < 2:
                raise ValueError(
                    f"a family must name something; {to!r} is a grant to whoever shows up")
        elif record.kind(to) != SYSTEM:
            raise ValueError(
                f"epistemic delegation grants judgment to a system; {to} is "
                f"{record.kind(to) or 'unenrolled'}")
        if judgment not in SCRUTINY:
            raise ValueError(f"no such class of judgment: {judgment}")

        level = scrutiny(judgment, family)
        if level >= RATIONALE_FROM and not rationale:
            raise ValueError(
                f"scrutiny {level}: {judgment} may not be handed over without a "
                f"written rationale")
        if level >= EXPIRY_FROM and expires_at is None:
            raise ValueError(
                f"scrutiny {level}: {judgment} may not be handed over without a term")
        if level >= BOUNDED_FROM and expires_at - _now() > timedelta(days=MAX_DAYS):
            raise ValueError(
                f"scrutiny {level}: {judgment} may not be handed over for longer "
                f"than {MAX_DAYS} days")

        grant_id = record.write(by, "delegate", judgment, actor=to)
        if rationale:
            record.write(by, "because", rationale, about=grant_id)
        if expires_at is not None:
            record.write(by, "expires", expires_at.isoformat(), about=grant_id)
        return grant_id

    @classmethod
    def revoke(cls, record, by, grant_id, reason):
        """Withdraw a grant. Only a person may, and the grant is not
        removed — the withdrawal is recorded beside it, so the ledger keeps
        both the trust and its end. Correction is not erasure."""
        if record.kind(by) != PERSON:
            raise PermissionError(
                f"only a person may revoke epistemic judgment; {by} is "
                f"{record.kind(by) or 'unenrolled'}")
        revocation = record.write(by, "revoke", reason, about=grant_id)
        return revocation


class Premise:
    """The frame a case closed under: the commitments that had to hold for
    its conclusion to follow at all.

    No judgment escapes its premises. A conclusion resting on a frame of
    values or assumptions has to name the frame and which version of it,
    because premises move, and a judgment that quietly inherits whichever
    ones are current is a judgment nobody made. Changing them later does
    not reach back: it makes a new judgment, which may stand in front of
    the old one and never in place of it.

    Where the record knows who anyone is, only a person may name premises.
    A system writing its own assumptions has decided what it is allowed to
    assume, which is the authority question wearing a different hat."""

    def __init__(self, *args, **kwargs):
        raise TypeError("premises are named, not constructed — use Premise.name()")

    @classmethod
    def name(cls, record, by, frame, body, direction=ASCENDING, rationale=None):
        """Name a frame, and say which way warrant runs inside it.

        Direction belongs here and nowhere else. A frame is already the
        place a judgment declares what had to hold for it to follow at all,
        it is already named by a person, and it is already versioned and
        immutable — so a declaration made here is one somebody signed, at a
        moment, and can be disagreed with later without being erased.

        Declaring descent requires a written reason, on the same principle
        that governs the scrutiny ladder: the heavier the thing handed
        over, the more the handing must carry. Descent changes what counts
        as a defect, which is heavy, and a frame that cannot say why it
        reasons downward has not declared an epistemology. It has declined
        a test."""
        if record.governed() and record.kind(by) != PERSON:
            raise PermissionError(
                f"only a person may name the premises a judgment closes under; "
                f"{by} is {record.kind(by) or 'unenrolled'}")
        if direction not in (ASCENDING, DESCENDING):
            raise ValueError(f"no such direction of warrant: {direction}")
        if direction == DESCENDING and not rationale:
            raise ValueError(
                "a frame that reasons downward from commitment must say why "
                "in writing; descent changes what counts as a defect")
        premise_id = record.write(by, "premise", body, actor=frame)
        if direction == DESCENDING:
            record.write(by, "direction", DESCENDING, about=premise_id)
            record.write(by, "because", rationale, about=premise_id)
        return premise_id


def profess(record, author, category, body, premises):
    """Take a claim as given, under a frame that reasons downward.

    One word, one act, the same discipline the reserved word already
    keeps. A claim *promotes* when it rises through the chain by paying
    independent acceptance. A claim is *professed* when a frame that has
    declared descent takes it as given and reasons from it. The two are
    not the same motion and do not share a verb, so no later argument can
    run "it was professed, therefore it was earned." The verb is
    Polanyi's own register — a profession of commitment — and it is
    deliberately not the word this workshop uses fifty times a day for
    putting code in a repository, because a reserved word that collides
    with the commonest verb in the room is a reservation nobody can keep.

    What this refuses is the whole of its value. It refuses any frame that
    has not declared descent, and it refuses any professor who is not a
    person where the record knows who anyone is. Declaring the frame is a
    person's signature; professing under it is no lighter — it enters a
    claim at the door with nothing beneath it, which is the heaviest
    entrance this file has. An agent can execute, and cannot take a claim
    as given.

    A profession names no basis, because having one is precisely what it
    does not claim. It is not thereby free: see unexamined_descent(),
    which prices it at the exit."""
    if category not in CHAIN:
        raise ValueError(f"unknown epistemic state: {category}")
    if record.read(premises)["act"] != "premise":
        raise ValueError("a profession is made under named premises")
    if record.direction(premises) != DESCENDING:
        raise PermissionError(
            "this frame has not declared that it reasons downward; a claim "
            "above observation must be built on a prior claim — see "
            "Premise.name(direction=DESCENDING)")
    if record.governed() and record.kind(author) != PERSON:
        raise PermissionError(
            f"taking a claim as given is a person's act; {author} is "
            f"{record.kind(author) or 'unenrolled'}")
    id = record.write(author, "assert", body)
    record.write(author, "classify", category, about=id)
    record.write(author, "profess", category, about=id, basis=premises)
    record.admit(id)
    return id


class Premature(Exception):
    """Closure asked for and not earned, carrying the questions still
    standing. A refusal that will not say what is missing is
    indistinguishable from a mood, and cannot be argued with."""

    def __init__(self, message, questions):
        super().__init__(message)
        self.questions = questions


class Case:
    """A closed episode — an edge from its first claim to its last.

    There is no Case.open(). The only constructor closes; an unclosed case
    is not an object that exists, so nothing can be asked about it. That
    is the difference between a policy and an invariant: a policy is a
    rule the system follows, an invariant is a state it cannot be in.

    Until now the constructor was the whole of the guarantee, and it was
    load-bearing for the wrong half: it made a premature *judgment*
    unrepresentable while leaving premature *closure* free. Every other
    promotion in this file has a price. Stopping had none, and stopping is
    the heaviest judgment an episode makes.

    Note the word that is missing here, and stays missing. A case is
    *closed*, under named premises, at a moment. The other word — the one
    that would have this conclusion hold for all time — is a claim about
    the future that no record can carry, so it is not offered anywhere in
    this file for anyone to quote back. What a closure asserts is smaller
    and it is durable: this episode stopped here, under these commitments,
    having survived these questions. That stays true permanently,
    including after the conclusion turns out to be wrong."""

    def __init__(self, *args, **kwargs):
        raise TypeError("a case that has not closed does not exist — use Case.close()")

    @classmethod
    def close(cls, record, by, claim_ids, premises):
        """Ask to stop, and stop if the asking has been survived.

        The first ask never succeeds, and that is structural rather than
        unlucky: asking opens the Sentinel's file and draws its questions,
        and a question raised in the same breath cannot already have been
        answered. So closure takes two motions — one to learn what the
        episode still owes, one to close once somebody outside it has
        paid. No case is closed by the act that proposes closing it.

        Closing is judgment, so it is bounded like judgment. Where the
        record knows who anyone is, the actor who closes must have standing
        over what the episode reached, which puts the heaviest act in an
        episode behind the same door as the rest."""
        claim_ids = list(claim_ids)
        if not claim_ids:
            raise ValueError("an episode with no claims is not a case")
        if record.read(premises)["act"] != "premise":
            raise ValueError(
                "a case closes under named premises — see Premise.name()")

        reach = record.consequence(claim_ids)
        if reach is None:
            raise ValueError(
                "the record does not know what this episode did; an episode "
                "with no known consequence has no known price to stop")
        if record.governed() and not record.standing(by, reach):
            raise PermissionError(
                f"{by} has no standing to close a case reaching {reach}")

        # A descending frame settles here for what its commitment licensed.
        # Refusing the commitment itself would be refusing the epistemology;
        # letting the episode stop with nothing derived from it examined
        # would be cheap grace with a schema.
        if record.direction(premises) == DESCENDING:
            owed = record.unexamined_descent(claim_ids, premises)
            if owed:
                raise Premature(
                    f"{len(owed)} claim(s) reasoned down from this commitment "
                    f"have not been examined between parties",
                    [record.read(id)["body"] for id in owed])

        attempt = record.considering(claim_ids, premises)
        standing = record.outstanding(attempt)
        if standing:
            raise Premature(
                f"{len(standing)} question(s) still standing against this closure",
                [record.read(id)["body"] for id in standing])

        need = record.attention_price(claim_ids)
        paid = record.settlers(attempt)
        if len(paid) < need:
            raise Premature(
                f"closing an episode reaching {reach} takes answers from "
                f"{need} distinct voice(s) outside it; {len(paid)} answered",
                [])

        case = object.__new__(cls)
        case.record = record
        case.claims = claim_ids
        case.premises = premises
        case.frame = record.read(premises)["actor"]
        case.version = record.version(premises)
        case.reach = reach
        case.closure = record.write(by, "closed", str(attempt),
                                    about=episode(claim_ids)[1], basis=premises)
        return case

    def superseded_by(self):
        """The closure standing in front of this one, or None. This case
        does not change when it is superseded — it was closed under the
        premises it names, and that remains what happened."""
        return self.record.superseded(self.closure)

    def judge(self, judge_author):
        """One judgment, of the whole case, after closure. Walks every step
        in the episode and reports whether each promotion was earned. The
        judge must be independent of every claim in the case.

        Under a frame that has declared descent, the upward test is not
        applied and not silently failed. It is reported **out of scope**,
        which is a different sentence from *unearned* and the entire point
        of the distinction: an instrument reporting FAIL where it has no
        applicable test is not being strict, it is describing itself.

        Out of scope is derived here from the frame's declaration and is
        never a claim's own word about itself, and it is printed rather
        than passed over — a refusal nobody can see is indistinguishable
        from an oversight, which is the rule void_grants() already keeps."""
        for id in self.claims:
            if self.record.read(id)["author"] == judge_author:
                return {"verdict": "refused",
                        "reason": f"{judge_author} authored claims in this case"}
        descending = self.record.direction(self.premises) == DESCENDING
        given = set(self.record.professed(self.premises))
        steps = []
        for id in self.claims:
            a = self.record.read(id)
            if id in given:
                steps.append({
                    "step": f"given -> {self.record.category(id)}",
                    "claim": a["body"],
                    "earned": None,
                    "scope": "out of scope — professed, not promoted",
                })
            elif a["basis"] is not None:
                out = descending and self.record.descends(id, given)
                steps.append({
                    "step": f"{self.record.category(a['basis'])} -> "
                            f"{self.record.category(id)}",
                    "claim": a["body"],
                    "earned": None if out else self.record.earned(id),
                    "scope": ("out of scope — reasoned down from a commitment"
                              if out else "in scope"),
                })
        return {"verdict": "judged", "direction": self.record.direction(self.premises),
                "steps": steps}
