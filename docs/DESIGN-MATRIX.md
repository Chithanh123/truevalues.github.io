# Political Context: authored design matrix

Instrument: `political-context-pilot`, development version **0.3.0**. Status: **author draft; independent human review pending**.

This matrix records what each authored item is intended to explore and what else might explain a response. It is a content-review artifact, not a validated scale model, preregistration, or finding about a population. The English source in `js/content.js` and the world notes in `js/worlds.js` remain authoritative for the current wording.

The first comprehension-pilot audience is **bilingual English–Vietnamese adults**. Geography, recruitment method, exact eligibility and proficiency criteria, responsible operator, primary outcomes, and data handling still need decisions before recruitment. Bilingual review cannot establish generalization to monolingual English or Vietnamese populations.

## Candidate domains and interpretation

| Content domain | Current displayed endpoints | What must be reviewed |
| --- | --- | --- |
| Economic | Market allocation ↔ public provision | Ownership, redistribution, access, provider choice, and implementation capacity may require distinct constructs. |
| Diplomatic | Domestic priority ↔ cross-border cooperation | Moral obligations, jurisdictional mandates, sovereignty, and expected practical gains can lead to the same choice. |
| Civil | Public-order powers ↔ civil protections | Restrictions, procedural safeguards, transparency, and administrative capacity are not interchangeable. |
| Societal | Cultural continuity ↔ cultural change | Continuity, representation, equal opportunity, and preferences about a specific custom may differ. |

Agreement responses use the recorded `direction`: `+1` aligns agreement with the right endpoint, and `-1` reverses that encoding. This is an author rubric, not evidence that the response scale is interval-valued or that these domains are unidimensional. Every row below is **unreviewed** unless a later human-review record explicitly says otherwise.

## Statement matrix: 24 candidate items

| Stable item ID | Domain | Direction | Intended rationale | Important rival construct or wording question |
| --- | --- | --- | --- | --- |
| `economic-ownership` | Economic | +1 | Retaining community assets under public ownership | Immediate fiscal need, control, and aversion to irreversible sale may matter independently of allocation ideology. |
| `civil-dissent` | Civil | +1 | Protection of peaceful expression despite inconvenience | The severity and meaning of inconvenience may be inferred differently. |
| `societal-tradition` | Societal | -1 | Special civic standing for established traditions | Heritage, majority representation, and institutional identity may be distinct motives. |
| `diplomatic-obligation` | Diplomatic | +1 | Obligations beyond national borders despite remaining local need | Moral universalism and beliefs about the seriousness of unmet needs may differ. |
| `economic-market` | Economic | -1 | Preference for provider competition over direct public delivery | Assumptions about quality, corruption, competence, and feasibility may drive endorsement. |
| `civil-discretion` | Civil | -1 | Official discretion to limit peaceful activities to prevent disruption | Readers may imagine threats or emergencies the statement does not specify. |
| `societal-revision` | Societal | +1 | Revising public traditions as communities change | Representation and responsiveness may differ from a general preference for change. |
| `diplomatic-domestic` | Diplomatic | -1 | Domestic spending priority before support abroad | Sequencing, local mandate, and beliefs about resource scarcity can explain the answer. |
| `economic-services` | Economic | +1 | Shared public responsibility for essential needs despite taxes | Tax tolerance and the meaning of essential need may differ from ownership preferences. |
| `civil-review` | Civil | +1 | Independent review of restrictions despite slower decisions | Institutional trust, due process, and aversion to delay may be separate. |
| `societal-continuity` | Societal | -1 | Preservation of shared customs despite interest in alternatives | Loss aversion and attachment to particular customs may be inferred. |
| `diplomatic-coordination` | Diplomatic | +1 | Accepting limits on national discretion to solve shared problems | Expected effectiveness and instrumental cooperation may differ from obligations abroad. |
| `economic-user-charges` | Economic | -1 | User-funded amenities rather than general taxation | Perceived fairness, exclusion, and whether amenities are essential may change the meaning. |
| `civil-management` | Civil | -1 | Temporary limits on peaceful activity for shared-space management | Proportionality and the duration or enforcement of a temporary measure are unspecified. |
| `societal-emerging` | Societal | +1 | Allowing emerging practices to replace established ones | Procedural opportunity and tolerance differ from wanting replacement. |
| `diplomatic-discretion` | Diplomatic | -1 | Retaining national control over resources despite easier cooperation | Sovereignty, accountability, and skepticism about joint rules may be separate. |
| `economic-access` | Economic | +1 | Public support reducing the effect of ability to pay on essential access | Redistribution, service access, and financing are related but not identical. |
| `civil-records` | Civil | +1 | Access to non-sensitive decision records despite administrative work | **Priority review:** transparency, usability, and capacity are not established indicators of civil freedoms. The current statement rubric requires review. |
| `societal-inherited` | Societal | -1 | Reserving a publicly supported core of inherited customs | Preservation funding and cultural-change attitudes may differ. |
| `diplomatic-shared-rules` | Diplomatic | +1 | Joint rules for cross-border problems | Practical coordination benefits and willingness to accept external constraints may differ. |
| `economic-choice` | Economic | -1 | Multiple competing providers rather than one public provider | Consumer agency, service variety, and beliefs about monopoly may drive the choice. |
| `civil-withholding` | Civil | -1 | Official discretion to withhold non-sensitive details for capacity reasons | **Priority review:** lawful transparency and staff capacity should not automatically imply support for public-order restrictions. |
| `societal-new-voices` | Societal | +1 | Changing public culture to include previously absent groups | Inclusion and equal representation may not lie on the same axis as cultural continuity. |
| `diplomatic-responsibility` | Diplomatic | -1 | Prioritizing national residents over comparable needs abroad | Role obligation and partiality can differ from opposition to cooperation. |

The `civil-records` and `civil-withholding` statements remain in the current candidate bank with their author directions. Their inclusion does not settle the construct concern. The analogous `public-records` scenario is explicitly descriptive-only. Independent review must decide whether these statements should be rewritten, separated, or excluded before stronger measurement claims.

## Situation matrix: eight main cases and one comparison

| Stable scenario ID | Content domain | Assigned role | Locality | Profile contribution | Main interpretation limits |
| --- | --- | --- | --- | --- | --- |
| `housing-urgent` | Economic | Local leader | Urban | Directional; main | Sale, municipal provision, and cooperative lease bundle ownership, revenue, delivery, and urgency. |
| `public-assembly` | Civil | Ordinary constituent | Urban | Directional; main | The participant recommends a lawful rule package; they do not issue restrictions. Noise, enforcement, and proportionality are rival considerations. |
| `water-partnership` | Diplomatic | Local leader | Rural | Directional; main | Allocations combine local mandate, obligations abroad, learning, and practical gains within one authorized grant. |
| `community-festival` | Societal | Ordinary constituent | Rural | Directional; main | Public festival funding and equal opportunity should not be treated as a judgment about legal rights. |
| `service-contract` | Economic | Non-elected public servant/local official | Rural | Directional; main | Provider preference also reflects expertise, reliability, coordination, and oversight. Delegation and common service standards are fixed. |
| `community-history` | Societal | Civil society group leader | Urban | Directional; main | A member-approved exhibition within a voluntary association differs from government cultural policy. |
| `public-records` | Civil grouping only | Non-elected public servant/local official | Urban | **Descriptive-only; null scores** | All choices preserve the same disclosure law and safeguards. Transparency and staff capacity do not supply a civil-rights score. |
| `regional-cooperation` | Diplomatic | National leader | Rural communities affected by a national decision | Directional; main | The leader proposes an authorized allocation subject to the setting's institutions; they cannot bypass approvals or other budgets. |
| `housing-planned` | Economic | Local leader | Urban | **Comparison-only; excluded from aggregate** | Deadline is changed from the urgent case. Repetition and fixed later placement prevent an individual causal conclusion. |

Seven main cases are scored provisionally. Economic, diplomatic, and societal summaries each have two scored main cases; civil has one. Reasons and optional personal-preference responses are unscored. The housing comparison cannot add weight to the economic profile.

## Personal preference and role action

The v0.3 optional personal-preference question uses the same offered packages, resources, facts, and feasibility conditions. It asks which package the person prefers when putting the assigned responsibility aside. It does **not** mean unlimited funds, changed laws, a different emergency, or additional powers.

Record this preference separately from the role action and the selected reason. Unanswered, uncertain, and unrepresented preference responses must not be treated as agreement with the role action. Preferences never change profile scores, their coverage denominators, or the housing action comparison. The participant-facing evidence can describe both responses without labeling a difference as hypocrisy, a true ideology, or a causal effect of role.

The preference question follows the action in this prototype. It may create consistency pressure, reflection, or demand effects; its inclusion needs comprehension review and later methodological evaluation.

## World/context coverage

| Setting ID | Fictional setting | Inspiration | Authored scenario notes |
| --- | --- | --- | --- |
| `linden` | Linden Federation | Germany | 9 |
| `alder` | Union of Alder | United States | 9 |
| `mere` | Kingdom of Mere | United Kingdom | 9 |
| `hoshima` | Hoshima | Japan | 9 |
| `namoa` | Namoa Republic | Fiji | 9 |
| `anbinh` | An Binh Republic | Viet Nam | 9 |
| `suryan` | Suryan Federation | India | 9 |
| `mbala` | Republic of Mbala | Central African Republic | 9 |

These 72 notes state institutional context for shared dilemmas. All five roles occur in a route, and both urban and rural contexts occur. This does not provide a distinct story for every one of the 80 world × role × locality cells. Civil society leadership appears in an urban case and national leadership in a rural-affected national case; role and dilemma content remain confounded.

Within each world, the urgent and planned housing notes must be identical. The river case for Hoshima and Namoa stipulates an invented shared-island catchment; it is not a factual claim about Japan or Fiji. Fictional nationality is an assigned context and cannot be used to infer the participant's nationality.

## Implemented route and proposed forms

| Form concept | Implementation status | What it would support or require |
| --- | --- | --- |
| Current fixed route: statements, briefing, eight main cases, later housing comparison | Implemented | Descriptive inspection of this authored experience. Seeded world assignment is reproducible, but route/option order is fixed and no formal study allocation is provided. |
| Counterbalanced urgency order | Proposal only | Requires a versioned form definition, a valid presentation without an earlier-case assumption, order recording, and a planned analysis of repetition/carryover. |
| Between-participant urgent versus planned case | Proposal only | Requires controlled assignment, comparable forms, shared anchors, a specified outcome, and a sample-size rationale. |
| Balanced subset of dilemma families across roles/localities | Proposal only | Requires authored role-appropriate variants, a supported-cell matrix, allocation rules, and enough observations for the chosen contrasts. |

Do not describe these proposed forms as implemented, balanced, randomized trials. Decide primary contrasts and intended claims before selecting the forms and analysis. Statement-first presentation, fixed option order, recognition, self-selection, restarting, and optional export all remain potential influences.

## Evidence and review work still required

No completed literature synthesis is claimed. For each candidate construct, create a source-review record with the verified citation, population/language, definition, evidence type, relevant item rationale, limitations, and the specific design decision it informs. Distinguish theoretical justification from empirical measurement evidence. Do not add a citation merely to imply validation of this bank.

Independent human reviewers should assess every English source item, Vietnamese author draft, role rule, and applicable context note. Reconcile translation decisions and test comprehension before a research study. Use [PILOT-GUIDE.md](PILOT-GUIDE.md) and the empty review log to record actual issues and resolutions. The [progress ledger](PROGRESS.md) separates prepared tools from completed human work.
