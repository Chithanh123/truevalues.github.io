# Political Context: cognitive pilot and review guide

Instrument version: `0.2.0`. Status: **draft protocol; no interviews or external reviews completed**.

AI-assisted technical review and automated checks have occurred during development; they do not constitute independent human content review or cognitive interviews.

This guide turns the next research steps into reviewable work. Its purpose is to find misunderstandings, unrealistic authority, hidden assumptions, and overinterpretation before a larger study. It does not authorize recruitment, establish a validated scale, or substitute for the operator's consent and data-management decisions.

## Questions that must be settled before recruitment

| Decision | Current status | Required concrete output |
| --- | --- | --- |
| Target population and eligibility | Open | Define whom the instrument is intended to describe; specify age and inclusion/exclusion rules. |
| Pilot and study languages | Open | Select languages, review translations, and document what comparisons are intended. An English draft does not validate other languages. |
| Study operator and reviewers | Open | Name the responsible operator and reviewers; establish required institutional review. |
| Primary outcomes | Draft candidates in `RESEARCH.md` | Choose comprehension outcomes and later substantive contrasts before collecting study data. |
| Consent and recording | Open | Decide whether notes, audio, timings, or exports are needed, and provide an accurate consent process. |
| Storage, access, retention, withdrawal | Open | Define authorized access, retention duration, deletion/withdrawal procedure, and any limits after anonymization. |
| Recruitment and incentives | Open | Document recruitment method, avoid coercion, and keep incentive contact details separate from answers. |
| Pilot sample and allocation | Planning estimate only | Allocate readers and reviewers to settings/items; justify coverage and revise after each round. |

Do not ask people to send political answers through chat to make these decisions. A facilitator can identify a comprehension problem without collecting a participant's ideology or asking them to defend their beliefs.

## Prepare a review packet

1. Run the application and inspect the method and settings explanations.
2. Use **Download review packet** for the authored instrument/review metadata. It contains no participant responses. Record its instrument version.
3. Run `npm run validate:content`, `npm test`, and the documented browser suite. Keep the outcome with the reviewed version. Technical checks cannot approve wording or cultural accuracy.
4. Assign content reviewers with different political viewpoints, including people familiar with each setting's inspiration. Review one complete world brief and all applicable notes together; reviewing isolated national labels is insufficient.
5. Copy the header-only `review-log-template.csv` into an access-controlled review log. Use reviewer codes rather than full names. Never fill it with invented observations or dummy participants presented as findings.

## Content-review rubric

Use the following rubric for each statement, scenario, and world-specific note. The log records the criterion, a concrete observation, severity, proposed change, and resolution.

| Criterion | Reviewer questions | Examples that require revision |
| --- | --- | --- |
| Construct rationale | What preference could this response inform? What else could explain it? | An action scores coercion simply because an official follows a binding duty. |
| Authority | Who is deciding? What can this assigned role actually do? Who approves or reviews the action? | A constituent spends public funds; a group leader makes a government order; a leader bypasses the stated budget authority. |
| Feasibility | Are all options permitted, affordable under the common assumptions, and practically possible? | An apparently moderate option cannot meet its own stated costs or timing. |
| Balanced wording | Do options receive similar detail and intelligible benefits and costs? | One option is “protect people” while another is framed only as selfish or malicious. |
| Information sufficiency | Can a reader decide without inventing crucial facts? Can they distinguish known facts from uncertainty? | The choice depends on an undisclosed safety hazard or legal prohibition. |
| Context accuracy | Do the fictional institutions make sense together? Does the setting have strengths, limits, and internal disagreement? | A national inspiration becomes a one-trait stereotype or a note contradicts the scenario's stated authority. |
| Shared assumptions | Does the same anchor retain its decision-relevant premises across settings? | A supposedly comparable option changes legal availability or material cost without being recorded. |
| Housing treatment | Is the deadline the only changed decision condition? | Role, option wording, school costs, housing totals, powers, or institutional notes change between versions. |
| Scoring/exclusion | Are the sign and intended inference documented? Are uncertainty and “none” excluded rather than made neutral? Are descriptive-only cases excluded from scores and denominators? | Reasons add hidden weight; the housing comparison counts twice; the descriptive public-records case is assigned a civil-rights score. |
| Debrief | Can a reader explain what the summary supports? | A midpoint is presented as a definitive ideology, a percentile, or evidence of hypocrisy. |

Use severity codes consistently:

- **Critical:** infeasible or contradictory choice, invalid role power, hidden treatment change, misleading research/data claim, or an error that prevents informed participation. Resolve before any pilot using the affected item.
- **Major:** recurring misunderstanding, loaded wording, missing material context, or unsupported scoring inference. Revise or explicitly exclude the affected inference before further study.
- **Minor:** wording or presentation issue that does not change decision meaning. Track, prioritize, and verify it after editing.

A blank log does not mean the content passed review. Use `unreviewed`, `open`, `revised-awaiting-check`, and `resolved` statuses, with a concrete resolution record.

## Cognitive-interview plan

A starting estimate is **12–20 readers in iterative rounds**, with the final number determined by the issues found. This is a comprehension-planning estimate, not a statistical validation sample or a claim that every setting receives adequate coverage.

Begin with a small round on two settings to detect interaction and wording problems. Revise before the next round. Use a coverage matrix to add readers for the remaining settings and to revisit changed items. All five roles appear in a complete route, but hearing one person interpret a role does not validate it. Country-context specialists and independent rubric reviewers are additional review functions, not substitutes for participant comprehension work.

Each complete route uses one world, 24 statements, eight main scenarios, and one comparison. Seven main scenarios have provisional directional rubrics; `public-records` is descriptive-only. Its choices and reasons are recorded, but it contributes no domain score or denominator. The civil profile has only one scored main scenario, while the other domains each have two. For an interview, selected item probing may reduce burden, but record which items were actually reviewed. Do not describe a sampled interview as a completed full assessment. Do not collect political demographics simply to make a small group look representative.

### Suggested session sequence

1. **Opening, about five minutes.** Explain the exploratory purpose, voluntary nature, recording/notes decision, ability to skip, and agreed handling of any data. Verify that the person understands the prototype is not enrolling them in an online study or assigning a definitive ideology.
2. **Unassisted first use.** Ask the reader to start without coaching. Observe whether the distinction between personal values and assigned responsibilities is clear. Record navigation or accessibility problems separately from item interpretation.
3. **Statement probing.** Select items from different domains and directions. Ask for a paraphrase before asking whether response categories express the reader's intended answer. Avoid suggesting the intended pole or praising a political choice.
4. **World-brief probing.** Ask what institutions matter for the forthcoming decisions and which details are fictional. Check that the reader does not need to identify the real country or infer a population's character.
5. **Role/scenario probing.** Ask who can act, what limits apply, and the main benefit and cost of each option. Record invented assumptions, unclear words, or infeasible interpretations. The participant may explain a personal reason voluntarily, but the facilitator should not demand a political justification.
6. **Housing comparison.** Ask which facts changed and which stayed the same. Do this after the answer, so the prompt does not coach the decision. Ask whether seeing the earlier case affected how they approached the second version.
7. **Debrief interpretation.** Ask what the markers and coverage counts mean, how missing answers and descriptive-only exercises are treated, and whether the result says what ideology someone truly holds. Check that the reader understands why a recorded public-records choice does not contribute a civil-rights score. Correct misunderstandings after recording them.
8. **Data controls and close.** Ask the reader to explain tab-only progress, optional device saving, response export, review packet, and erase controls. Follow the agreed data-handling procedure, including deleting test saves if requested. Ask for any remaining confusing or burdensome part.

Keep durations provisional and report observed burden rather than promising a fixed completion time. Think-aloud prompts can themselves affect choices, so interview answers should not be pooled with unassisted assessment responses as if the conditions were identical.

## Neutral probing language

Useful prompts:

- “What does this sentence mean in your own words?”
- “Who is allowed to make the final decision here?”
- “Which action is outside your assigned role?”
- “What would each option accomplish, and what would it give up?”
- “Was there a fact you needed but could not find?”
- “What did ‘uncertain’ mean to you here?”
- “What changed between these two versions?”
- “What do you think this result lets you conclude?”

Avoid prompts that announce the rubric or imply a preferred answer, such as “Would a more democratic person choose this?” or “Why did you contradict your values?” Do not treat a facilitator's preferred politics as the criterion for a correct interpretation.

## What to record

Use the review log for item-level issues. Record instrument version, reviewer/reader code, item and setting IDs, role, criterion, the observed misunderstanding, severity, and the proposed action. Keep notes focused on comprehension. Avoid unnecessary verbatim political opinions or identifying life stories.

A separate coverage sheet should record which setting, item, role, locality, and device/language were actually reviewed in each round. A participant's assigned setting is not their nationality. Maintain the private link between any contact details and participant codes separately, if such a link is needed at all.

For response exports:

- Downloading is optional and local; it does not submit data to the developer or a study.
- An export includes sensitive political responses and reasons. Explain this before asking for a download.
- Collect or transfer a file only under the specified consent and approved storage workflow. Do not ask readers to upload it to chat by default.
- The review-packet download contains authored content/metadata and no participant responses. It is suitable for inspecting the rubric but should not be confused with an answer export.
- Erasure clears this tab's answers and the saved device copy; other tabs and already downloaded files may retain copies.

## Decision gates and outputs

These are draft operational gates to finalize before the first pilot, not outcomes already achieved.

| Gate | Required evidence | Action if unmet |
| --- | --- | --- |
| Ready for a comprehension round | Study logistics and any required review/consent are settled; no unresolved critical content or technical issue affects the material used | Complete the prerequisite or withhold the affected item; do not recruit around the gap. |
| Ready to close an item issue | Revised content has been rechecked against the original observation; the reviewer can explain why it is resolved | Keep `revised-awaiting-check` or reopen it; a code change alone is insufficient. |
| Ready for a larger exploratory pilot | Review coverage is documented; no unresolved critical issue; recurring major misunderstandings have been revised and checked in a later round | Revise and run another targeted round. A fixed interview count is not an automatic pass. |
| Ready to freeze for validation | Target, languages, primary contrasts, outcomes, assignment, analysis, sample-size rationale, data handling, and version are specified | Continue instrument development and protocol work. |
| Ready for stronger public claims | Independent/held-out evidence supports the particular claim and relevant comparability assumptions | Keep feedback descriptive and report unsupported interpretations. |

Produce a round report listing who reviewed by code, the exact versions and items covered, issue counts by severity, changes, unresolved questions, and the next round's targets. Keep recruitment or validation claims proportional to work actually completed.
