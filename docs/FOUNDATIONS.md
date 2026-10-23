# Political premises: expanded research aims

Development instrument **0.4.0**. English source and Vietnamese translation are **author drafts**. An initial unverified source-proposal map is available; no systematic literature synthesis, independent tradition-specific review, translation adjudication, or measurement validation has been completed for this module.

The aim is to build a more comprehensive system of value statements by asking what different political approaches assume about people and society before asking which policies they prefer. “Left,” “liberal,” and other families contain conflicting accounts of human agency, power, freedom, knowledge, and institutions. Neither a single compass coordinate nor one definition of a tradition can represent those disagreements adequately.

The implemented first step adds sixteen premise statements, separate from the existing policy-value summaries. Responses remain descriptive: there are no premise totals, ideology distances, membership predictions, or correct answers. Multiple premises may be accepted together, and disagreement with one premise is not evidence for its supposed opposite. Traditions and conceptual labels are review metadata; participants answer the premise wording without being told which identity a response might suggest.

## Distinguish the kinds of claim

| Category | Question | Initial candidates |
| --- | --- | --- |
| Social ontology | What are people and social relations like? What explains political life? | Personal agency, relational interests, economic power, ecological dependence. |
| Normative commitments | What should count as a reason or obligation? | Freedom to choose a good life, non-domination, care, unchosen community obligations. |
| Political epistemology | How can we know, and whose knowledge matters? | Dispersed knowledge, tacit inherited knowledge, situated experience, revisable explanations. |
| Institutional reasoning | What arrangements could realize a principle? | Distributed property, workplace control, contestable power, gradual reform. |

These distinctions are analytic tools, not settled boundaries. An institutional claim can depend on an empirical expectation, an ontological account, and a moral judgment at once. Interview probes should identify which reading the participant used. Ontology is not a synonym for a policy preference, and a moral claim cannot be validated merely by showing that it is common.

## Overlapping interpretive lenses

The initial author map includes classical liberal, social liberal, social democratic, democratic socialist, Marxist, conservative, libertarian, republican, communitarian, feminist, ecological, decolonial/anti-colonial, and anarchist approaches. These are deliberately overlapping debate families, not a universal taxonomy or a comprehensive inventory of world political thought. “Republican” here names a tradition about freedom and public power, not a political party. Libertarian approaches include substantial disagreements between left and right variants. Decolonial and anti-colonial approaches are related but distinct; neither stands in for all Indigenous or formerly colonized peoples.

Each item’s `lenses` identify traditions with relevant interpretive debates. The mapping does **not** mean every adherent agrees, that only those traditions discuss the idea, or that agreement identifies a respondent with those traditions. Read the per-lens cautions and per-item rationale in `js/foundations.js`; the parallel Vietnamese draft is `js/translations/vi-foundations.js`.

The initial set does not attempt a separate item for every subtradition. Religious political thought, nationalist and authoritarian variants, anti-caste thought, Black political thought, distinct Indigenous political traditions, and political approaches developed outside the familiar European labels need dedicated scholarly and community review before any claims of coverage. Their omission is a research gap, not a claim of lesser relevance. The real-world settings must not be treated as proxies for any of these traditions or for their populations.

Future conceptual questions should include accounts of human motivation (self-interest, reciprocity, and solidarity), the justification of hierarchy, religious sources of authority, membership in a nation or political community, and the formation of caste and racial power. Develop several rival accounts of each question with informed critics. A more comprehensive bank needs meaningful disagreement and within-tradition alternatives, rather than a larger collection of agreeable slogans.

## Item review and rival interpretations

| Stable item ID | Main distinction | Rival reading to probe |
| --- | --- | --- |
| `premise-personal-agency` | Agency relative to group membership | Possibility of dissent versus complete independence from social formation. |
| `premise-social-relations` | Interests formed through relationships | Social influence, identity, and economic dependence may differ. |
| `premise-economic-power` | Explanatory weight of productive control | A specific case of lobbying or corruption rather than a general theory. |
| `premise-ecological-dependence` | Ecological embeddedness | Basic factual assent or disaster concern rather than ecological politics. |
| `premise-own-good` | Equal freedom across conceptions of a good life | Different understandings of harm, respect, and conditions of choice. |
| `premise-nondomination` | Freedom from uncontrolled power | Actual interference versus the continuing capacity to interfere at will. |
| `premise-care-obligations` | Care as a ground of political obligation | Family duty, public provision, or recognizing unpaid work. |
| `premise-inherited-obligations` | Obligations without individual consent | Mutual aid, historic repair, custom, or legal compliance. |
| `premise-dispersed-knowledge` | Limits to centralized knowledge | Skepticism toward any coordination versus support for a particular alternative. |
| `premise-inherited-knowledge` | Tacit knowledge in existing practice | Practical knowledge versus moral approval of inherited authority. |
| `premise-situated-knowledge` | Contribution of direct experience | Additional insight versus a claim of infallibility or group unanimity. |
| `premise-testable-explanations` | Fallibility of explanatory claims | Social desirability, access to evidence, or confusion with moral commitments. |
| `premise-property-independence` | Property as protection from state dependence | Distribution, kinds of property, and private dependence. |
| `premise-workplace-control` | Economic democracy | Consultation, co-determination, cooperative ownership, or full worker control. |
| `premise-contestable-power` | Effective contest of institutional power | Judicial appeal, deliberation, direct participation, or collective organization. |
| `premise-gradual-reform` | Continuity while changing institutions | Risk tolerance, state capacity, and perceived severity of current injustice. |

The candidates intentionally do not form opposing pairs. For example, a person may regard agency as real while believing that interests are socially formed. The knowledge items concern different sources and tests of knowledge, not a single expertise-versus-experience axis. Several statements may draw widespread agreement; their usefulness must be investigated, rather than inferred from their conceptual appeal. Equal item counts across categories provide authored coverage, not equal measurement precision.

## Source traceability and review records

The separate [source-proposal map](SOURCES.md) links the sixteen candidate premises to proposed readings, interpretive notes, and open questions. Requests for the initial candidate texts were blocked by the development environment, so all initial proposals are explicitly unverified; authorship and section locators remain pending wherever they could not be checked. A background link identifies a debate; a contrast link points toward a rival account. Neither means that an author endorses this particular statement or that the linked tradition has one agreed position. Access and verification status are recorded separately from independent human review. No initial proposal is marked text-checked or metadata-checked. Adding citations does not validate a scale or complete a systematic literature review.

The bilingual author workspace provides a structured worksheet for each item and setting-specific scenario. Reviewers can record a language, field, criterion, observation, proposed change, source note, and outcome. An explicit `no-issue` record distinguishes an inspected item from one that was merely opened. These records are local reviewer observations; they do not amend the authored instrument or certify a tradition’s representation.

Each note retains a fingerprint of the content reviewed. A changed fingerprint marks an imported or restored observation as stale so that the reviewer can check it against the current wording and context. Fingerprints are change identifiers, not cryptographic proof of identity or integrity. Keep source questions and competing interpretations visible through reconciliation, including cases where wording has not changed but the reviewer’s reading has.

## Build toward a stronger bank

1. Verify the proposed references and locators against actual source texts, then expand the source map into a documented literature review and invite critics and informed representatives of multiple approaches to identify omissions, caricatures, and alternative readings. Record the source and intended meaning of each proposed premise.
2. Expand each conceptual question into several clear candidate statements, including genuine rival accounts and within-tradition disagreements. Separate compound meanings discovered in interviews; avoid merely reversing words to manufacture opposites.
3. Review English and Vietnamese independently, reconcile terminology such as agency, non-domination, community, coercion, and productive resources, and test paraphrases with bilingual adults. Do not equate a translation’s mechanical completeness with conceptual equivalence.
4. Pilot comprehension and burden before recruitment for a larger measurement study. Preserve uncertainty and skipping; probe concrete examples, the source of a belief, confidence, and whether an answer changes when a premise is clarified. Sixteen additional statements make the assessment longer, so record actual completion time and fatigue.
5. Design linked situations that can distinguish rival explanations for the same policy choice. Hold material facts and available actions constant when comparing roles or conditions. Do not claim that existing cases already identify the premise responsible for a decision.
6. Preregister an appropriate sampling and analysis plan after qualitative revision. Investigate reliability where relevant, response processes, multidimensional structure, alternative models, and cross-language comparability. A reflective latent scale, a formative inventory, and a qualitative typology require different evidence; do not assume a single model in advance.
7. Establish an explicit version policy, record reviewed and rejected items, and assess uncertainty and fairness before any personalized ideological interpretation.

## Country correspondences and debrief

Participants need the fictional setting’s institutional constraints to make an informed role decision. Explicit real-country correspondences should be withheld in the participant flow until the final debrief, where the author’s inspiration can be disclosed with its limitations. This reduces direct label priming; it cannot prevent inference from institutions or prior knowledge. A static, publicly inspectable app cannot promise secure concealment from someone who deliberately examines its source or the separate author-review workspace.

The setting is a fictional combination of selected institutional features. Revealing its inspiration is not evidence about the beliefs of a real country’s residents, and it is not a premise or ideology score. Research materials should record any prior exposure to the author mapping and discuss whether the participant inferred the inspiration before the debrief.
