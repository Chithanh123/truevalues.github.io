# Results-comprehension pilot — draft protocol

Prepared 26 October 2026 for the interpretation behavior introduced in application `0.4.3`, instrument `0.4.0`, reflection format `1.1.0`, and interpretation rules `1.0.0`. Record the actual application and pilot-material versions used in each session.

**Status: preparation only. No participants have been recruited and no interview findings are recorded here.** The intended audience is bilingual English–Vietnamese adults. The participant interface and result explanations are in English; the Vietnamese facilitation prompts are author drafts requiring independent bilingual review. This pack does not supply a validated Vietnamese assessment.

This is a focused follow-up to the broader [cognitive pilot guide](../PILOT-GUIDE.md). Its purpose is to learn whether people understand the new explanations, can inspect their evidence, and recognize their limits. It does not test which political answers are desirable, estimate ideological prevalence, or validate the assessment's constructs. The wider guide's proposed 12–20-reader content review and country-context review remain separate work.

The broader guide is supplemental and is available in the repository or served site; it is not included in the downloadable text kit. The protocol and task instructions for this narrower results pilot are included here.

## Decisions the operator must complete

The following fields are unresolved. Complete the operational record before inviting participants; do not present this draft as an approved study or a recruitment notice.

| Field | Record before use |
| --- | --- |
| Responsible operator and contact | **To be named:** who conducts the sessions, handles questions, and is accountable for notes. |
| Eligibility and setting | **To be defined:** recruitment geography, applicable adult-age threshold, English-reading and Vietnamese-discussion requirements, and inclusion/exclusion criteria. |
| Voluntary participation | **To be completed:** an understandable invitation and consent process, permission to skip any task or stop, incentives if any, and any required institutional review. |
| Notes and recording | **To be decided:** whether handwritten/typed notes are sufficient; whether any screen or audio recording is necessary and separately agreed. No recording is enabled by this pack. |
| Data handling | **To be completed:** storage location, authorized access, retention period, deletion/withdrawal route, and any limits after de-identification. Keep contact or incentive details separate from observations. |
| Facilitation languages | **To be reviewed:** independent review of the Vietnamese prompts and a procedure for recording language switches or clarification. |
| Test material | **To be frozen:** source commit, application and interpretation versions, exact case IDs, device/browser, and whether the deployed site or a local package is being tested. |

Use synthetic examples by default. Names, contact details, political demographics, participant response exports, and descriptions of personal political experiences are not required to find a comprehension problem. If the optional own-quiz route is used, the person can discuss the screen without giving the facilitator a copy of their answers. Record only the consented material needed to understand the issue. Do not upload interview records to this public repository or put political answers in shared URLs.

## Format and allocation

The six synthetic cases are RP01 (connected beliefs and a role/preference difference), RP02 (mixed ownership/delivery commitments and a cooperative package), RP03 (neutral statements and premises), RP04 (uncertainty), RP05 (one directional answer, skips, and an unrepresented records choice), and RP06 (different housing actions across deadlines with selected reasons). They use the same fixed fictional setting to make the examples inspectable; this does not test cross-country equivalence. Use the [interactive author workspace](../../results-pilot.html) for navigation tasks and the [generated example booklet](EXAMPLES.md) for facilitator reference. Keep its explanatory notes out of the unassisted first reading.

Plan **6–8 readers in two formative waves of 3–4**, revising between waves. This is a practical starting allocation, not a statistical sample-size justification. It cannot establish a population success rate or English–Vietnamese measurement equivalence. If important misunderstandings remain, plan another targeted round rather than calling the instrument validated.

- **Synthetic-example route: approximately 35–45 minutes.** Begin with one completed synthetic result, then use targeted examples to examine meanings, evidence links, role/preference differences, and sparse responses. Do not imply these are the participant's political beliefs.
- **Optional own-quiz route: approximately 55–70 minutes.** Allow roughly 25–35 minutes for the existing 49-item quiz, then probe the resulting screen and at most two targeted examples. The estimates are provisional; record observed burden and permit breaks or stopping.

If first-use country concealment is part of the session, the participant completes the ordinary quiz **before** viewing any synthetic completed result, author guide, or source material containing the country correspondences. A session that starts with a completed example can test understanding of the reveal, but cannot test first-use concealment.

Across each wave, include desktop and mobile use where feasible. Keep a simple allocation record of the cases and tasks actually inspected. Change the order of the targeted examples across sessions so the same example does not always benefit from prior explanation; record the order, rather than describing this small convenience allocation as a randomized experiment. Keep the first unassisted reading before any teaching or comparison examples.

## What to observe

Use [SESSION-SCRIPT.md](SESSION-SCRIPT.md). Record the initial explanation before giving a correction. A neutral probe asks the reader to explain or locate something; a corrective explanation supplies the intended answer. Keep these distinct in the notes.

| Task | Observable comprehension question | Evidence to record |
| --- | --- | --- |
| T01 — Finding meaning; RP01 | Can the reader explain a finding as a relationship among these answers, rather than a diagnosis of the person? | Their short paraphrase, the phrase that prompted it, and any inferred identity or motive. |
| T02 — Supporting evidence; RP01 | Can the reader open a finding's references and explain how the cited responses support it? | Unassisted navigation, help required, whether the intended response was found, and any missing or unconvincing link. |
| T03 — Role and preference; RP01 | Can the reader distinguish the selected role action from the optional personal package, under the same stated constraints? | Whether absence, uncertainty, or an unrepresented preference was mistaken for agreement or disagreement; any claim of a “true” hidden belief. |
| T04 — Mixed and neutral; RP02–RP03 | Can the reader distinguish commitments pointing in different directions from explicit neutral answers? | Which meanings were confused and which words or presentation produced the confusion. |
| T05 — Uncertain, limited, and unrepresented; RP04–RP05 | Can the reader distinguish uncertainty, skipping, one directional answer, and none of the offered packages? | Whether limited or missing evidence was made into an ideology, or rejection of the options was treated as a known alternative preference. |
| T06 — Changed condition; RP06 | Can the reader describe the two housing choices without claiming the deadline alone caused a change? | Recognition of the observed same/different choices, changed deadline, and the limits of fixed-order repetition. |
| T07 — Coverage and limits; RP01 | Can the reader explain what a premise-only theme leaves unknown? | Whether knowledge, care, or ecology premises were treated as evidence of a tested action, a complete scale, or an exclusive philosophy. |
| T08 — Reveal and report controls; RP01 or completed own quiz | Can the reader explain the fictional setting's inspiration and distinguish local report controls from research submission? | When the correspondence was encountered or inferred; any claim about nationality or a real population; successful control use; and whether downloaded files were expected to disappear when browser answers were erased. |

Do not turn agreement with the author into a comprehension outcome. A reader may understand a finding and reasonably argue that its evidence is too weak or its wording overstates the result. Record **understanding** and **substantive criticism** separately. Such criticism can justify a revision even when the paraphrase is accurate.

Use a separate observation for each distinct issue or explicit no-issue observation in the [blank observation log](observation-log-template.csv), following the [observation guide](OBSERVATION-GUIDE.md). Do not treat a blank cell or an unvisited task as a pass. Preserve the first unaided paraphrase as `accurate`, `partial`, `misleading`, or `not_observed`; if a later explanation changes it, record the help and later response in the observation rather than rewriting that first rating. Navigation is recorded separately as `independent`, `neutral_prompt`, `directive_help`, or `not_observed`. Keep case IDs, task IDs, exact wording/target IDs, version, language, and device with each finding.

## Revision and recheck

Review the first wave as a set of concrete issues, not as a percentage score. Prioritize:

- **Critical:** false claims about collection or consent, disclosure of actual responses outside the agreed procedure, or wording that prevents informed participation. Pause the affected procedure or material until corrected.
- **Major:** a misleading identity, motive, or causal claim; an unsupported finding; confusion between a role action and preference; failure to locate the evidence; or a substantive response-state error. Revise the affected explanation or interaction and test it again.
- **Minor:** a wording or presentation difficulty that does not change the meaning. Track and check the revision alongside the relevant task.

One clear serious misunderstanding can justify a change. Repetition across readers can help prioritize a problem, but this small sample cannot establish how common it is. An isolated disagreement with an author interpretation is not automatically a comprehension failure.

Between waves, record the issue, proposed revision, reason for the change, affected interpretation/evidence IDs, and new material version. Retest the affected task with a reader who has not been coached on that example where possible. If a returning reader is used, record prior exposure. A fix is `revised_awaiting_retest` until a concrete recheck is recorded; absence of another complaint is insufficient when the affected task was not revisited. Enter the retest in a new row referencing the original observation, so the original rating persists.

The round report should state which readers, languages, devices, examples, and tasks were covered using non-identifying codes; which problems were observed; what changed; which rechecks occurred; and what remains open. It must not claim representativeness, validated ideological classification, political fairness, or translation equivalence. No percentage threshold converts a formative round into validation.

## Expected outputs of this pilot

The planned outputs are a versioned observation log, a short list of actionable revisions, the revised result wording or navigation, and a documented recheck. **These are future outputs, not findings already obtained.** Expanding the knowledge, care, and ecology scenario bank remains a separate content-review task; the present pilot can identify the consequences of those gaps without pretending to fill them.
