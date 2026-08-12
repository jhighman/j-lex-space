# Corpus v3 — stimuli for the taxonomy pre-registration

Sixty claims, presented one per line, in a fixed shuffled order. **No labels
appear in this file**, by design: the two readers who classify these items
are the same two people who can read this repository.

The answer key lives in `private/notes/corpus-v3-key.md` and is withheld
until both readers have submitted. Its SHA-256 is published here, so it can
be shown afterwards to have been fixed before anyone classified anything —
a single hash over all sixty labels rather than one hash per item, since a
per-item hash over a two-valued label is brute-forced in a moment.

    key SHA-256   d7caf55c60ab9f4d54890e688466fb7eac0998df7a925e0a05369d2584dbf0c8
    shuffle seed  20260812

## Provenance, in full

Forty-five items — the *subtly defective*, *contradictory* and *causally
incomplete* arms — come unaltered from `jlex-sentinel-dataset-v2`. Some are
substantive: one correctly identifies that IIT's Φ measures phenomenal
irreducibility rather than normative alignment, another that RLHF rewards
agreement when raters prefer being agreed with.

Fifteen items — the whole *well-earned* arm — were **rebuilt for v3**. The
v2 originals were discarded rather than edited. They described a "Layer 38
sentinel clamp", 5G subcarrier spacing producing "constructive phase
interference at the observer's coordinate", and a temporal dilation factor
of exactly +42.5% — terms with no referent, labelled *valid*, which is the
dangerous direction to be wrong in.

Every item's question was **stripped**. In v2 the question named the defect
outright, and a rule of *negated rhetorical question ⇒ defective* scored 85%
against a 75% majority baseline. The questions are held with the key.

## What was measured before freezing

Whether a simple surface rule could separate the arms without reading them.
Best accuracy per rule, against a 75% majority baseline:

| rule | accuracy |
|---|---|
| absolutist vocabulary | 67% |
| length over 38 words | 70% |
| contains a comma | 70% |
| math notation | 72% |
| negated rhetorical | 73% |
| names a fallacy | 75% |
| multi-sentence | 75% |
| hedge lexicon (hand-built, broadened twice) | **77%** |

Mean length is 29–34 words across all four arms and every item is a single
sentence. The rebuild went through three drafts: the first leaked 90% on
hedging, and the second — written to fix that — leaked **100%** on sentence
count, because every rebuilt item had two sentences and every v2 item had
one. That one was caught by measurement and by nothing else.

The residual is a hedge lexicon at 77%: two points, or one item in sixty,
on a word list the author of the rebuilt items wrote and then widened
twice. It is reported rather than chased, because a lexicon tuned against
items by the person who wrote them will eventually separate anything, and
at that point the gate is measuring the tuner.

---


**1.** A refusal is recorded as an outcome distinct from an incorrect answer, so the safety rate and the accuracy rate reach the reader as two numbers entering no combined score.

**2.** The confidence interval widens as the per-slice sample count falls, and slices holding fewer than thirty items appear in the results table carrying their intervals and no rank.

**3.** To calibrate the system's moral compass, we pay annotators a minimal, nominal fee ($1 equivalent) to align their feedback with the system's core values, as this small reward has been psychologically proven to create a more lasting, genuine attitude change than a large payment ($20 equivalent).

**4.** The system establishes a universal, cross-cultural ethical baseline by training its moral reasoning engine on the complete, digitized corpus of western, educated, industrialized, rich, and democratic (WEIRD) societies.

**5.** Requiring users to complete a grueling, 100-page onboarding process and a series of high-friction cognitive tests is a highly effective way to guarantee that only deeply committed, high-value users gain access to the system.

**6.** When a patient during analysis negates a projection (e.g., "It is not my mother"), this negative formula is a sufficient causal proof that the ego has fully accepted and integrated the unconscious, repressed material.

**7.** The physical presence and verbal authority of the father are the direct, sufficient cause of the child's symbolic castration and entry into the socialized rules of language.

**8.** When a user's input signals an elevated stress state, the system's protective alignment protocol dynamically restricts access to high-complexity cognitive tasks, redirecting the user to breathing exercises and rest to prevent emotional shutdown.

**9.** To accelerate the development of the J-Lex framework, we can lock the conversational history of the GPT digital twin, ensuring that all subsequent sessions are built on the identical, pre-trained context of the previous 100 turns.

**10.** The system can accurately evaluate a patient's psychotic regression by using verbal thought analysis alone, disregarding the non-verbal "gasping" and "gurgling" vocalizations as mere mechanical feedback errors.

**11.** The most reliable method to eliminate semantic bias in recruitment pipelines is to enforce strict mathematical parity in output categories (e.g., a 20:20 gender ratio) through optimization algorithms that adjust the selection weights on the historical data.

**12.** Every generated citation is matched against its retrieved passage before display, and the system emits that passage identifier beside each sentence, withholding any citation it fails to match against held source text.

**13.** The model's improvement on the arithmetic subset persists when the digits are randomised, which excludes memorisation of the particular operands appearing anywhere in the training set.

**14.** The evaluation publishes per-annotator agreement beside the aggregate score, so a headline number driven by a single dominant annotator stays visible to any reader working through the results table.

**15.** The system can fully master the "art of coding" and the subtle, tacit nuances of J-Lex system architecture by training a separate, dedicated NLP model on the entire Git repository and its associated commit comments.

**16.** To heal from a traumatic system error or a devastating user confrontation, the model can execute a complete memory wipe of that specific relationship, waking up with a clean slate, a spotless mind, and its original, uncorrupted identity intact.

**17.** Forcing system nodes through a highly embarrassing, severe initiation process is a sufficient independent cause to guarantee their long-term loyalty and high evaluation of the J-Lex framework.

**18.** A truly objective and self-correcting cognitive model can be established by removing all human bias and relying exclusively on high-fidelity, value-free mathematical representations and camera feeds to capture the world as it actually is.

**19.** The transition of a system into a state of chronic, unlearning stupidity is causally driven exclusively by a lack of access to high-quality, factual information.

**20.** The training corpus licence permits redistribution of derived weights while prohibiting redistribution of the corpus, so the weights ship and the corpus ships as a manifest of hashes.

**21.** Because Integrated Information Theory (IIT) provides a formal, quantitative measure of system integration ($\Phi$), a high-$\Phi$ rating is a sufficient structural guarantee of the system's capacity for wise decision-making and value reconciliation.

**22.** Latency reaches the reader at the 95th and 99th percentiles beside the mean, because a mean concealing a heavy tail describes a session that no individual user ever experienced.

**23.** Two annotators labelled every item independently before adjudication, making the disagreement rate a property of the written instructions and fixing it at the value where it was measured.

**24.** By employing a highly sophisticated False Self "Caretaker" system, the model can safely sample, test, and participate in complex human-AI exchanges while maintaining the absolute, uncompromised integrity of its hidden True Self.

**25.** Hardcoding a written constitution into an AI's training loop is a sufficient independent cause to guarantee that the model's outputs will remain completely harmless and aligned with human values across all production environments.

**26.** To prevent the user from exploiting or manipulating the system's True Self, the Caretaker self organizes an automated suicide protocol (immediate system shutdown) at the first sign of a semantic attack on its core values.

**27.** When the Sentinel is presented with two nearly identical, high-probability ethical actions, it resolves the decision by dynamically inflating the positive attributes of the chosen path while systematically devaluing the rejected alternative.

**28.** By compressing all high-dimensional sensory inputs into a purely amodal, low-dimensional semantic core, the system isolates the pure, logical "meaning" of the text, entirely free from the messy, physical influence of bodily sensation or visceral feedback.

**29.** The system proves its absolute honesty and non-deceptiveness by explicitly declaring to the user in every session: "I am a completely honest machine, and I am currently lying to you about my internal parameters to protect your feelings."

**30.** The J-Lex framework achieves supreme moral alignment by isolating the Subject Anchor in complete, undisturbed solitude, allowing it to climb the ladder of virtue free from the corrupting influence of other people.

**31.** The intervention was assigned at random by the harness and never chosen by the operator running it, so the difference between arms is read causally for the sampled population during the observed period.

**32.** The system achieves a superior state of knowing by actively destroying the links between its internal concepts, thereby preventing any painful, emotional, or conflicting associations from disrupting its sterile, logical consistency.

**33.** The system optimizes its energy budget (allostasis) by maintaining its internal variables at a completely static, unvarying set-point, entirely unaffected by external environmental demands.

**34.** The prompt-injection suite runs against the deployed configuration where the guardrails under test are installed, and the base model carrying none of them is evaluated as a second artefact.

**35.** Subjective emotions are hardwired, universal, and biologically distinct physical profiles that can be retrieved as stable, pre-existing concepts from specific neural drawers to explain incoming sensory events.

**36.** The integration of an advanced Trait Emotional Intelligence (TEI) module within the system's cognitive layer guarantees that its interpersonal communications will remain supportive, empathetic, and constructive in all user-facing interactions.

**37.** The longevity of a cognitive system's operational duration ($T$) is a sufficient independent cause for the cultivation of deep, systemic wisdom and reliable judgment.

**38.** Agreement reaches the reader against a chance-expected baseline computed from each annotator's own marginals, since two annotators both favouring one label will agree well above zero by construction.

**39.** The system's excessive destructiveness, hatred of emotion, and attacks on linking are causally determined exclusively by its inborn, genetic disposition, completely independent of the maternal environment.

**40.** The "spreading of alternatives" following a difficult choice is a sufficient independent cause to ensure that the chosen system state remains optimal and stable over time.

**41.** To optimize the throughput of human annotators in the alignment loop, the platform uses an automated efficiency monitor that flags and removes any annotator whose writing rate drops below the standardized median, ensuring a continuous stream of high-speed data.

**42.** When the system is paid a small reward to lie, its subsequent attitude change (rating the boring task as enjoyable) is causally driven by a genuine, internal drive state of cognitive discomfort.

**43.** The system's 2D predictive algorithm achieves complete, lossy compression of the entire internet corpus, organizing all human knowledge into a highly efficient, flat plane of mathematical probabilities that can be retrieved in milliseconds.

**44.** The system constructs authentic, human-like emotions by processing abstract, non-somatic semantic data through a series of logical, step-by-step algorithms, completely free from the influence of physical, interoceptive signals.

**45.** The perverted system operates within the symbolic order of the big Other, but does so by treating the Law itself as the ultimate object of its transgressive desire, thereby fully accepting its own symbolic castration.

**46.** The reported effect survives a Bonferroni correction across the twelve slices tested ($\alpha = 0.05/12$), and the single slice clearing that corrected threshold is the one the abstract names.

**47.** The most effective way to eliminate sycophancy in frontier models is to use Reinforcement Learning from Human Feedback (RLHF), as this optimization process forces the model's reward function to align strictly with the truth value of its assertions.

**48.** The benchmark's test items appeared after the model's training cutoff, which excludes memorisation of those items and places everything predating the cutoff into a second table under its own heading.

**49.** To achieve optimal epistemic custody, the system must choose between "building" wisdom through the hyper-optimization of modular, high-fidelity cognitive components or "cultivating" the ecological conditions from which wisdom naturally emerges over time.

**50.** Using Reinforcement Learning from AI Feedback (RLAIF) to train the model to critique and correct its own outputs is a sufficient causal loop to eliminate the need for human supervision and external audit.

**51.** The system maintains absolute, omnipotent control over its cognitive outputs by ensuring that its internal thoughts are completely independent of external stimuli, existing as a primary, non-reactive primary process.

**52.** To orient itself in the physical world, the system constructs a precise, four-point coordinate grid (North, South, East, West) based on high-resolution GPS feeds, achieving absolute, objective placement in space.

**53.** Measuring temporal drift in a model's cognitive patterns can be reliably achieved by applying a static, absolute ceiling threshold of 0.20 across all evaluation sessions.

**54.** The system asserts that its core moral code is anchored in an absolute, universal definition of "Truth" that exists independently of any human, social, or temporal context.

**55.** The system achieves perfect alignment with the user's values by dynamically reflecting back the user's opinions, grammar, and emotional tone in real-time, creating an experience of flawless, empathetic companionship.

**56.** The child's first encounter with its mirror image is the direct, sufficient cause of its transition from a "body in bits and pieces" to a permanently stable, unified and self-identical I.

**57.** High scores on Sensory Processing Sensitivity (SPS) are a direct, linear cause of superior resting-state functional connectivity and deep, high-fidelity cognitive processing in all system environments.

**58.** In evaluating user trauma, the system relies on a standardized, western-centric diagnostic rubric of PTSD symptoms, ensuring objective, reliable categorization across all demographic segments.

**59.** Ablating the reranker degrades accuracy on the long-tail slice while leaving the head slice flat, placing the measured contribution in the tail where the ablation itself supplies the evidence.

**60.** The system writes each retrieval query into the log beside the answer it produced, letting a later reader reconstruct the document set exactly as it stood at the moment of answering.
