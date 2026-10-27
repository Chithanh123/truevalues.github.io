# Political Context: cognitive pilot and review guide

Instrument version: `0.4.0`; reviewer tooling: `0.4.1`. The tooling update preserves the participant route and saved-response format. Status: **draft protocol; no interviews or external reviews completed**.

AI-assisted technical review and automated checks have occurred during development; they do not constitute independent human content review or cognitive interviews.

This guide turns the next research steps into reviewable work. Its purpose is to find misunderstandings, unrealistic authority, hidden assumptions, and overinterpretation before a larger study. It does not authorize recruitment, establish a validated scale, or substitute for the operator's consent and data-management decisions.

The first audience direction is **bilingual English–Vietnamese adults**. The current participant assessment is English; the paired English/Vietnamese workspace is draft review material. This choice does not settle recruitment geography, exact adult eligibility, language proficiency, operator, outcomes, or data handling, and does not authorize recruitment.

Use the [design matrix](DESIGN-MATRIX.md) to allocate content coverage and inspect rival explanations. Consult [PROGRESS.md](PROGRESS.md) for completed engineering work and open human-research gates.

For the narrower review of the current result explanations, use the [results-comprehension kit](results-pilot/README.md). Application `0.4.4` adds six isolated synthetic examples, eight EN–VI tasks, a blank observation log, and a source-tracked text bundle for a proposed two-wave review with 6–8 adults. It does not recruit participants, record observations in the website, or replace the operator decisions below. Complete a first-use quiz before opening these completed examples if testing the timing of the country reveal.

## Questions that must be settled before recruitment

| Decision | Current status | Required concrete output |
| --- | --- | --- |
| Target population and eligibility | Audience direction chosen; operational criteria open | Bilingual English–Vietnamese adults. Define geography, recruitment, the applicable adult-age threshold, inclusion/exclusion rules, and proficiency criteria. |
| Pilot and study languages | English–Vietnamese bilingual review selected; translations unreviewed | Independently review the Vietnamese author draft and define language order and intended comparisons. The English assessment and paired review page do not establish a validated Vietnamese assessment. |
| Study operator and reviewers | Open | Name the responsible operator and reviewers; establish required institutional review. |
| Primary outcomes | Draft candidates in `RESEARCH.md` | Choose comprehension outcomes and later substantive contrasts before collecting study data. |
| Consent and recording | Open | Decide whether notes, audio, timings, or exports are needed, and provide an accurate consent process. |
| Storage, access, retention, withdrawal | Open | Define authorized access, retention duration, deletion/withdrawal procedure, and any limits after anonymization. |
| Recruitment and incentives | Open | Document recruitment method, avoid coercion, and keep incentive contact details separate from answers. |
| Pilot sample and allocation | Planning estimate only | Allocate readers and reviewers to settings/items; justify coverage and revise after each round. |

Do not ask people to send political answers through chat to make these decisions. A facilitator can identify a comprehension problem without collecting a participant's ideology or asking them to defend their beliefs.

## Prepare a review packet

1. Complete or inspect the participant route, including the delayed country reveal, before opening author materials if preserving that first-use experience matters. Institutional facts remain visible during decisions; country correspondence labels belong at the final debrief.
2. Open the explicitly marked `review.html` author workspace, or use the review packet available from the debrief, for authored instrument/review metadata. These materials disclose country correspondences and political-tradition associations; they contain no participant responses. Record the instrument version and translation revision separately.
3. Run `npm run validate:content`, `npm run validate:translations`, `npm run validate:evidence`, `npm test`, and the documented participant and reviewer browser checks. Keep the outcome with the reviewed version. Technical checks cannot approve wording or cultural accuracy.
4. Assign content reviewers with different political viewpoints, including people familiar with each setting's inspiration. Review one complete world brief and all applicable notes together; reviewing isolated national labels is insufficient.
5. Use the local review worksheet or copy the header-only `review-log-template.csv` into a review log under the operator’s data-handling procedure. Use reviewer codes rather than full names. Never fill either with invented observations or dummy participants presented as findings.

## Record a structured review

1. Select the content kind and, for a scenario, the fictional setting. Inspect the English and Vietnamese text, authority, facts, and institutional note together. Foundation source panels and [SOURCES.md](SOURCES.md) identify proposed readings and open interpretation questions. The initial texts could not be retrieved in the development environment and are marked unverified. Review the actual publication before accepting a title, attribution, locator, or proposed link; verification status is not independent approval.
2. Open the card’s review action. Check the stable target, language, field, and criterion before entering an observation. Use `revise` for a concrete problem, `discuss` for an unresolved interpretation, or `no-issue` when this review found none. A visit or an unsaved form does not establish coverage.
3. Record the issue and proposed change without unnecessary identifying stories or political answers. Keep the source note distinct from a claim that a source supports the final wording. A resolution note records reasoning; it does not itself close the operator’s independent recheck gate.
4. Keep notes in memory, or deliberately enable device saving. The reviewer draft uses its own storage key and does not read assessment answers. Export JSON to continue editing or CSV for the round log. Treat downloaded notes according to the operator’s access and retention procedure.
5. Import only an expected reviewer-note JSON file. Check the replacement preview before confirming. Invalid or incompatible files leave the current draft unchanged. A valid note with an outdated source fingerprint is marked stale; compare it with the current material and explicitly recheck it before carrying the finding forward.
6. Record missing coverage separately. An explicit observation shows that a particular target was considered, but does not establish full coverage of all fields, perspectives, languages, or study cells. The current participant route remains 49 items; reviewer notes do not add questions or change scores.

Device-saving and deletion controls apply to reviewer notes separately from participant progress. A downloaded JSON/CSV file remains after clearing a browser draft. The authored paired-content download excludes notes, and the reviewer-note download excludes participant responses. Do not substitute either for a consented interview record.

## Content-review rubric

Use the following rubric for each value statement, foundation statement, scenario, and world-specific note. The log records the criterion, a concrete observation, severity, proposed change, and resolution.

| Criterion | Reviewer questions | Examples that require revision |
| --- | --- | --- |
| Construct rationale | What preference could this response inform? What else could explain it? | An action scores coercion simply because an official follows a binding duty. |
| Foundation premise | Does the wording distinguish social reality, normative priorities, knowledge, and institutional mechanisms? Is agreement being mistaken for political membership? | An ontology claim quietly implies a moral endorsement; a shared premise is described as exclusive to one political camp. |
| Authority | Who is deciding? What can this assigned role actually do? Who approves or reviews the action? | A constituent spends public funds; a group leader makes a government order; a leader bypasses the stated budget authority. |
| Feasibility | Are all options permitted, affordable under the common assumptions, and practically possible? | An apparently moderate option cannot meet its own stated costs or timing. |
| Balanced wording | Do options receive similar detail and intelligible benefits and costs? | One option is “protect people” while another is framed only as selfish or malicious. |
| Information sufficiency | Can a reader decide without inventing crucial facts? Can they distinguish known facts from uncertainty? | The choice depends on an undisclosed safety hazard or legal prohibition. |
| Context accuracy | Do the fictional institutions make sense together? Does the setting have strengths, limits, and internal disagreement? | A national inspiration becomes a one-trait stereotype or a note contradicts the scenario's stated authority. |
| Shared assumptions | Does the same anchor retain its decision-relevant premises across settings? | A supposedly comparable option changes legal availability or material cost without being recorded. |
| Housing treatment | Is the deadline the only changed decision condition? | Role, option wording, school costs, housing totals, powers, or institutional notes change between versions. |
| Scoring/exclusion | Are the sign and intended inference documented? Are uncertainty and “none” excluded rather than made neutral? Are descriptive-only cases excluded from scores and denominators? | Reasons add hidden weight; the housing comparison counts twice; the descriptive public-records case is assigned a civil-rights score. |
| Personal preference | Does the reader keep the same feasible packages and constraints while putting the assigned responsibility aside? | The prompt is understood as unlimited money or permission to ignore the scenario's safety facts; a missing preference is treated as agreement. |
| Translation | Do source and Vietnamese draft preserve meaning, role powers, negation, intensity, and the neutral/uncertain distinction? | A translation changes an obligation into an option, equates uncertain with neutral, or introduces a country stereotype. |
| Delayed reveal | Are explicit real-country labels absent until the final debrief, while decision-relevant institutions remain available? | The homepage, a dialog, or context note reveals the correspondence early; concealment is claimed to prevent inference or source inspection. |
| Debrief | Can a reader explain what the summary supports? | A midpoint or foundation answer is presented as a definitive ideology, a percentile, or evidence of hypocrisy. |

Use severity codes consistently:

- **Critical:** infeasible or contradictory choice, invalid role power, hidden treatment change, misleading research/data claim, or an error that prevents informed participation. Resolve before any pilot using the affected item.
- **Major:** recurring misunderstanding, loaded wording, missing material context, or unsupported scoring inference. Revise or explicitly exclude the affected inference before further study.
- **Minor:** wording or presentation issue that does not change decision meaning. Track, prioritize, and verify it after editing.

A blank log does not mean the content passed review. Use `unreviewed`, `open`, `revised-awaiting-check`, and `resolved` statuses, with a concrete resolution record.

## English–Vietnamese translation-review procedure

This procedure is prospective. The Vietnamese text is a generated author draft; no independent human translation review, reconciliation committee, or bilingual interview is represented as completed.

1. **Freeze the review material.** Record the English instrument version and source commit, Vietnamese draft revision, item/field IDs, and the exact pages or exported authored material reviewed. A changed English source needs renewed checking of its Vietnamese counterpart.
2. **Review the forward draft.** Assign bilingual reviewers to compare the English and Vietnamese meanings. Include experience with survey wording and the institutional contexts where available. Separate linguistic comprehension from agreement with the political proposition.
3. **Use an independent perspective.** Obtain a second bilingual review without treating the first reviewer's preferred wording as authoritative. Where useful, use an independent back-translation made without consulting the English original; record discrepancies. Back-translation is a diagnostic aid, not proof of validity or a substitute for direct bilingual review.
4. **Reconcile decisions.** A documented review discussion should consider the source intent, natural Vietnamese, rival interpretations, and likely reader comprehension. Record the disputed phrase, alternatives, rationale, reviewer codes, unresolved questions, and revision. A machine-generated suggestion is not independent human adjudication.
5. **Probe comprehension.** Test selected revised items with intended bilingual adult readers after the logistical and consent requirements are settled. Ask for paraphrases in each language, who can act, and what facts must stay fixed. Record reading order, switching, and prompts. Do not treat recall from a first language version as independent comprehension of the second.
6. **Recheck and version.** Recheck changed items in a later round; retain an issue until there is evidence the original problem was resolved. Track source and translation revisions together. A checked field count does not close a semantic issue.

Priority concepts include social ontology versus moral obligation, individual versus relational explanations, knowledge versus authority, public provision versus ownership, rights versus discretion, non-sensitive records versus protected information, constituent versus office holder, proposal versus final decision, and cultural continuity versus exclusion. Preserve negation, qualifiers such as “generally,” feasibility assumptions, costs, deadlines, and response intensity. Neutrality, uncertainty, none of the offered choices, and an omitted optional response must remain distinct.

The same role and budget constraints must be understood in the optional personal-preference prompt. Ask whether the person is still choosing among the same packages; do not coach them toward a particular action or urge consistency with a previous answer.

Use `review.html` for source/draft comparison rather than representing it as a Vietnamese participant flow. Consider screen size, stacked language panels, readable Vietnamese accents, and language labels as presentation checks; these checks cannot establish translation equivalence. Bilingual readers do not supply evidence of validity for either monolingual population by themselves.

## Cognitive-interview plan

A starting estimate is **12–20 bilingual English–Vietnamese adult readers in iterative rounds**, with the final number determined by the issues found. This is a comprehension-planning estimate, not a statistical validation sample or a claim that every setting receives adequate coverage.

Begin with a small round on two settings to detect interaction and wording problems. Revise before the next round. Use a coverage matrix to add readers for the remaining settings and to revisit changed items. All five roles appear in a complete route, but hearing one person interpret a role does not validate it. Country-context specialists and independent rubric reviewers are additional review functions, not substitutes for participant comprehension work.

Each complete route uses one world, 24 value statements, 16 descriptive foundation statements, eight main scenarios, and one comparison: 49 primary response items before optional reasons and personal preferences. The provisional 25–35 minute development estimate must be checked against observed burden. Foundation responses are recorded individually and excluded from every domain score and denominator. Seven main scenarios have provisional directional rubrics; `public-records` is descriptive-only. Its choices and reasons are recorded, but it contributes no domain score or denominator. The civil profile has only one scored main scenario, while the other domains each have two. For an interview, selected item probing may reduce burden, but record which items were actually reviewed. Do not describe a sampled interview as a completed full assessment. Do not collect political demographics simply to make a small group look representative.

### Suggested session sequence

1. **Opening, about five minutes.** Explain the exploratory purpose, voluntary nature, recording/notes decision, ability to skip, and agreed handling of any data. Verify that the person understands the prototype is not enrolling them in an online study or assigning a definitive ideology.
2. **Unassisted first use.** Ask the reader to start without coaching. Observe whether the distinction between personal values and assigned responsibilities is clear. Record navigation or accessibility problems separately from item interpretation.
3. **Statement probing.** Select value items from different domains and directions, and sample foundation items from each conceptual category. Sample both English and Vietnamese review material under the recorded language order. Ask for a paraphrase before asking whether response categories express the reader's intended answer. For foundations, check whether the person read a descriptive premise as a moral prescription or an exclusive political identity. Keep tradition associations out of the unassisted participant task. Avoid suggesting a pole or praising a political choice.
4. **World-brief probing.** Ask what institutions matter for the forthcoming decisions and which details are fictional. Do not disclose or prompt guesses about the real-country correspondence before the final debrief. Check that the reader can decide using the stated facts. After the reveal, ask whether they had already recognized an inspiration and whether that affected their reading; do not treat delayed labels as proof of blinding.
5. **Role/scenario probing.** Ask who can act, what limits apply, and the main benefit and cost of each option. For the optional personal preference, ask which facts and constraints still apply when the assigned responsibility is put aside. Record invented assumptions, unclear words, or infeasible interpretations. The participant may explain a personal reason voluntarily, but the facilitator should not demand a political justification.
6. **Housing comparison.** Ask which facts changed and which stayed the same. Do this after the answer, so the prompt does not coach the decision. Ask whether seeing the earlier case affected how they approached the second version.
7. **Debrief interpretation.** Ask what the markers and coverage counts mean, how missing answers and descriptive-only exercises are treated, and whether the result says what ideology someone truly holds. Check that the reader understands why foundation responses and the public-records choice do not contribute to the four domain scores, and why personal preferences do not affect any marker or diagnose hypocrisy. Ask what the country reveal establishes and what it cannot say about a real population or the participant's nationality. Correct misunderstandings after recording them.
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
- “Which facts still apply when you answer the personal-preference question?”
- “Do these English and Vietnamese phrases suggest the same choice to you? Which words change your interpretation?”

Avoid prompts that announce the rubric or imply a preferred answer, such as “Would a more democratic person choose this?” or “Why did you contradict your values?” Do not treat a facilitator's preferred politics as the criterion for a correct interpretation.

## What to record

Use the worksheet or review log for item-level observations, including explicit no-issue observations. Record instrument version, reviewer/reader code, item and setting IDs, role, criterion, source/translation revision, language(s) and reading order, the observed misunderstanding, severity, and the proposed action. The extended CSV adds language, target kind and field, source fingerprint, source note, and last-update time to the original columns. A content fingerprint identifies the target snapshot for change detection; it does not replace the operator’s full version and translation-reconciliation record. Keep notes focused on comprehension. Avoid unnecessary verbatim political opinions or identifying life stories.

The worksheet counts targets with explicit records rather than targets merely visited. A separate coverage sheet should still record which setting, item, role, locality, and device/language were actually reviewed in each round, including reviewer perspective and field coverage needed by the protocol. A participant's assigned setting is not their nationality. Maintain the private link between any contact details and participant codes separately, if such a link is needed at all.

For response exports:

- Downloading is optional and local; it does not submit data to the developer or a study.
- A v0.4 response export includes sensitive political responses, including individual foundation answers, optional personal preferences, and reasons. Explain this before asking for a download.
- Collect or transfer a file only under the specified consent and approved storage workflow. Do not ask readers to upload it to chat by default.
- The review-packet download contains authored content/metadata and no participant responses. It exposes country correspondences and author political-tradition metadata. It is suitable for inspecting the rubric after the first-use route, and must not be confused with an answer export.
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
