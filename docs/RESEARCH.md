# Political Context: research specification draft

Instrument: `political-context-pilot`, version `0.2.0`.

This local prototype is an instrument under development. Its items, world briefs, and scoring rubric have not undergone an external expert review, cognitive interviews, a completed literature review, or psychometric validation. Technical coverage checks establish that the authored content can run; they do not establish the validity of its measures. No research participants have been recruited and no study data are collected by the application.

## Current content and intended interpretation

The instrument contains 24 candidate statements, six in each of four provisional domains; eight main scenarios, two authored for each content domain; and one repeated housing scenario in which the school-repair deadline changes. Seven main scenarios contribute provisional directional scores. The eighth, `public-records`, is descriptive-only and contributes no score or denominator to any domain. Every route includes the five requested roles: ordinary constituent, civil society leader, non-elected public servant/local official, local leader, and national leader. It includes urban and rural surroundings.

A route uses one randomly assigned fictional setting. The eight settings draw selected institutional features from the United States, United Kingdom, Germany, Japan, Fiji, Viet Nam, India, and the Central African Republic. The same anchor dilemmas appear across settings, with an authored note explaining the institutional context. These are fictional profile packages, not representative descriptions of real countries or their populations. The stated scenario powers and constraints govern the decision; recognizing the inspiration should not be necessary.

The current route and option order are fixed. It is not a balanced experimental design, a full factorial study, or a representative sample of the possible dilemmas in each society. The eight-world by five-role by two-locality space contains 80 context cells before adding dilemmas, but this version does not claim to cover every cell with an independently authored story.

Every item and setting remains an **author draft**. The [pilot guide](PILOT-GUIDE.md) and [empty review log](review-log-template.csv) support the next review stage. They contain no findings or invented participant records. AI-assisted technical and content checks are development work; the empty log does not represent completed independent human review.

## Research question and candidate outcomes

The proposed central question is: **How do explicitly stated political values relate to decisions made under specified responsibilities and constraints?**

| Proposed question | Candidate outcome | Limits to specify in a protocol |
| --- | --- | --- |
| Do value endorsements relate to decisions in the same content domain? | Association between a defined statement summary and a chosen action | Categories and rubrics require validation; association does not identify a cause. |
| How do people respond to a changed repair deadline? | Housing action in each version and whether the recorded actions differ | The current repeated, fixed-order presentation permits recognition, practice, and consistency effects. |
| Do participants understand the scope of their assigned powers? | Correct paraphrase of who decides, what is permitted, and what is constrained | This is a comprehension outcome; it does not measure political sophistication or ideology. |
| Which item wording or contextual assumptions generate uncertainty? | Item-level uncertainty, skips, unrepresented choices, and interview observations | Missing responses have different meanings; they should not be collapsed into ideological neutrality. |
| Can people understand the debrief without overinterpreting it? | Explanation of what a marker, coverage count, and comparison do and do not imply | A completed test or an attractive result screen does not demonstrate measurement validity. |

These are protocol candidates, not preregistered hypotheses. Before a study, choose a small set of primary outcomes and contrasts, define an analysis and exclusion plan, and justify the sample size for those choices. Preserve a separate exploratory analysis category.

## Candidate construct map

| Domain | Left endpoint | Right endpoint | Important limitation |
| --- | --- | --- | --- |
| Economic | Market allocation | Public provision | Redistribution, ownership, and service delivery may be distinct constructs. |
| Diplomatic | Domestic priority | Cross-border cooperation | Local obligations, internationalism, and practical benefits are not equivalent. |
| Civil | Public-order powers | Civil protections | Administrative capacity is not coercion; complying with a duty is not endorsement. |
| Societal | Cultural continuity | Cultural change | Continuity, pluralism, equal opportunity, and attitudes to particular customs may differ. |

Review political theory and existing measurement literature before adopting a final scale structure. Prepare a source-by-construct map, identify omissions and rival interpretations, and obtain independent rubric review across political viewpoints. More items alone do not establish reliability, dimensionality, or comparability between statement and scenario summaries.

## Provisional scoring contract

Agreement responses run from -2 to +2 and are multiplied by the statement's recorded `direction`. A reverse-keyed item aligns endorsement of the left endpoint with the same display direction. The instrument has six candidate statements per domain.

Each of the seven directionally scored main scenarios has one provisional domain and three authored option scores: -2, 0, and +2. A zero score describes the author's intermediate package in that situation. It does not establish that the participant is politically centrist. Each scored scenario has equal maximum influence within its domain. Statements and scenarios are summarized separately.

The `public-records` scenario has `scoring: "descriptive"` and null option scores. Transparency, information usability, and staff capacity have not been established as indicators on the civil-rights/public-order axis. Its actual choices and reasons remain in the evidence and export, but it is excluded from every domain aggregate and denominator. Economic, diplomatic, and societal profiles therefore each have two scored main scenarios; the civil profile has one. Coverage counts must disclose this asymmetry.

Uncertain, skipped, and unrepresented responses are excluded from means, while their original response types remain available. A genuine neutral statement response or midpoint action remains included. Reasons are explanatory labels and do not change scores. The repeated housing variant is excluded from the main scenario profile to avoid double-weighting that dilemma.

| Main scenario ID | Provisional scoring direction | Important rival explanations |
| --- | --- | --- |
| `housing-urgent` | Sale toward market allocation; municipal construction toward public provision; cooperative lease at the authored midpoint | Immediate revenue, delivery time, school urgency, and ownership may motivate different choices. A cooperative is not inherently a midpoint in every economic theory. |
| `public-assembly` | Relocation toward public-order restrictions; existing freedoms toward civil protections; time/sound conditions at the midpoint | A preference for predictable enforcement is different from endorsement of coercion in general. All options use the same fictional lawful premise. |
| `water-partnership` | Local-only allocation toward domestic priority; larger partnership allocation toward cross-border cooperation; shared allocation at the midpoint | Practical learning, local mandate, distribution, and moral obligations can produce the same action. |
| `community-festival` | Protected established program toward continuity; open program toward change; split program at the midpoint | The dilemma concerns festival funding, rather than anyone's legal rights. Equal-opportunity preferences can overlap with cultural-change preferences. |
| `service-contract` | Contracted provision toward market allocation; direct public operation toward public provision; mixed provision at the midpoint | Reliability, contract oversight, skills, and implementation capacity may matter independently of ownership preferences. |
| `community-history` | Established emphasis toward continuity; revising the exhibition toward change; a combined approach at the midpoint | Representing members, stewardship of a collection, and public appeal are not interchangeable with attitudes toward social change generally. |
| `public-records` | Descriptive-only: all option scores are null; excluded from domain aggregates and denominators | All plans meet the same legal floor. The responses concern transparency, usability, and staff capacity. Retain choices and reasons for review without treating them as civil-rights or public-order scores. |
| `regional-cooperation` | Domestic-first allocation toward domestic priority; larger shared regional commitment toward cooperation; a split package at the midpoint | Expected benefits, national responsibilities, implementation risk, and cross-border obligations can influence the allocation. |

Exact option IDs and scores are published in `js/content.js`. Display actual selections, unscored reasons, and evidence counts alongside summaries. The domains have only one or two scored main situations, which still provide limited coverage. Do not publish population percentiles, confidence percentages, authoritative ideology labels, or a numeric hypocrisy or belief/action-gap score.

## Controlled housing contrast

The urgent and planned-repair cases retain the world, role, powers, housing need, borrowing limit, construction quantities, delivery periods, option wording, scores, and reasons. Their institutional notes are identical within a world. Only the engineering deadline and consequences of delaying school repairs change.

The urgent version says repairs must begin this year to avoid classroom closures. The comparison says repairs can safely wait until the next budget cycle. The shared option data and common facts make changes inspectable; the content validator also checks preserved fields.

The repeated case always appears later in this version. Recognition, order, practice, consistency pressure, or a changed interpretation can affect the answer. Report the observed pair descriptively. A formal urgency-effect study needs a justified design, such as counterbalanced or between-participant variants, and an analysis that respects the assignment.

## Assignment, coverage, and confounding

A seed reproducibly assigns one world and is recorded in the local session and voluntary export. This is adequate for inspecting local routes, but it is not a formal allocation protocol: people can restart, choose whether to complete, and keep or discard exports. There is no managed recruitment, allocation balance, duplicate-submission system, or response collection.

Shared anchor situations allow reviewers to compare the same authored dilemma across settings, but do not guarantee equivalent meaning or difficulty. For Namoa and Hoshima, the river-cooperation notes explicitly stipulate an invented shared-island basin for the fictional exercise; this is not a claim about the real inspirations' geography. Whole-world profiles bundle institutions and expectations. An observed profile effect would concern those fictional packages, not real nationality or the effect of one isolated institution. Assigned setting must not be used to infer a participant's nationality.

Role titles also bundle powers, obligations, and accountability. A public servant's authorized discretion differs from a national leader's proposal power. Unless those components are controlled, describe a contrast as an assigned-role package. The current route associates each dilemma with one role; it cannot isolate a pure role effect independently of dilemma content.

Statements appear first as part of the intended experience. Later choices can reflect explicit value reflection or consistency pressure. Record this interpretation and evaluate order effects separately if the research question requires unprimed decisions.

## Review and pilot sequence

1. Define the target population, languages, study operator, intended claims, and primary research questions.
2. Complete a literature-informed construct map and independent content/rubric review. Review every setting with people familiar with its inspiration.
3. Use the cognitive-interview guide to test comprehension, powers, feasibility, hidden assumptions, and debrief interpretation. Record issues rather than inventing validation findings.
4. Revise and version the content. Pilot burden, missingness, assignment fidelity, and candidate item behavior under an approved protocol.
5. Freeze the instrument and preregister a confirmatory design and analysis. Justify sample size using the planned contrasts and repeated-measures structure.
6. Use independent or held-out data for confirmation. Assess reliability where stability is intended, validity evidence, and relevant measurement comparability before group or language comparisons.
7. Publish the protocol, rubrics, analysis code, aggregate results, limitations, and unsupported as well as supported claims.

See [PILOT-GUIDE.md](PILOT-GUIDE.md) for the draft interview sequence and decision gates. Human reviews, interviews, recruitment, and empirical validation remain outstanding.

## Privacy and data handling

The application is local-only: no advertising, analytics, research submission endpoint, or automatic transmission of political responses. Default progress uses the current tab's session storage; optional device saving uses local storage. Erasure removes this tab's data and the saved device copy. Other open tabs may retain separate copies.

The response export is a voluntary download containing sensitive political answers, reasons, assigned world, instrument version, and summaries. Participants control whether to download or share it. Erasing browser storage cannot erase files already downloaded or shared. Do not place responses or identifiable study IDs in shareable URLs.

The review-packet download is different: it contains authored instrument and review metadata, without a participant's responses. It supports content review and should not be represented as a research response submission.

Formal collection requires a separate consented workflow with a named operator, justified fields, access controls, retention, transport security, and an accurate withdrawal/deletion policy. Review hosting logs as well as application behavior. Keep incentive contact details separate, collect no research telemetry before consent, and obtain institutional ethics review where applicable. Public participant-level data require separate consideration of consent and disclosure risk.

## Version history and saved responses

| Version | Content scope | Interpretation |
| --- | --- | --- |
| `0.1.0` | 12 statements; two worlds; four main scenarios and the housing comparison; two roles | Initial working prototype. |
| `0.2.0` | 24 statements; eight worlds; eight main scenarios (seven scored, one descriptive) and the excluded housing comparison; five roles | Expanded author draft for review and cognitive-pilot preparation. |

Statement, world, scenario, option, and reason IDs remain stable where meaning is retained. Version changes are intentional when wording, context, route coverage, or scoring meaning changes. A save from `0.1.0` is rejected by `0.2.0`; there is no silent migration or reinterpretation. Existing export files need their original instrument version for analysis. Preserve an old export if it is already available; starting a new assessment can replace old browser saves.

Run `npm run validate:content` to inspect authored coverage and structure, `npm test` for engine checks, and the documented browser suite for application behavior. Passing these checks is a technical readiness condition, not evidence that human review or measurement validation has occurred.
