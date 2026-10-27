# Political Context: progress ledger

Review date: **27 October 2026**. Current development branch: `site/question-bank`, continuing the v0.4 commit `42a2737` and the earlier v0.3 work; the fork's `master` was verified at `de4743a` on 27 October.

This ledger distinguishes working software, drafted research materials, completed human work, and publication evidence. It does not assign a completion percentage: the research gates cannot be inferred from the amount of code or content.

## Content preparation following reviewer tooling

The [content-research pack, prepared 23 October and revised 25 October](content-research/README.md) adds a desk audit of all 24 value statements, 16 foundations, and nine scenario instances; 36 English–Vietnamese statement candidates in twelve conceptual disputes; six scenario-family drafts, including two complete bilingual examples; a reading-to-candidate dossier; and a concrete bilingual review protocol. Three proposed interview packets each contain twelve statements and two scenarios. They are review selections, not deployed forms or equivalent measures.

That content-preparation increment changed documentation only, preserving instrument `0.4.0` and reviewer release `0.4.1`. The later `0.4.2` and `0.4.3` report increments below also retain the 49-item route, country-reveal behavior, application data, scoring, and translations. The candidates await source checks, independent viewpoint review, translation reconciliation, and comprehension evidence before adoption. Fourteen initial external retrieval attempts and four retries failed with proxy HTTP 403; no new text-verified sources or empirical findings are claimed. Technical test results elsewhere in this ledger do not establish the conceptual validity of these drafts.

## Repository and publication evidence

The author-facing [quiz-package database](../research/quiz-database/README.md), expanded 27 October 2026, catalogs twelve package records: the implemented 49-item prototype, ten proposed content-interview packets, and an unassigned 24-task design budget. It includes 151 items, 55 intended outcomes, 147 Vietnamese item drafts, current and proposed variants, and a separate record of country correspondences for debrief. CR-S03 remains a comprehension probe; the future package has no selected items or outcomes. SQLite and CSV exports contain authored content only. This is research organization, not a participant database, deployment, new scoring model, or validation finding.

All twelve catalog checks passed on 25 October, including original-content fidelity, foreign-key integrity, exact package membership, language gaps, excluded scores, source fingerprints, CSV preservation, and the eight example queries. The author database is outside the static-site artifact allowlist; the participant application has no database integration.

- [Pull request #1](https://github.com/Chithanh123/truevalues.github.io/pull/1) was merged into **Chithanh123/truevalues.github.io**. The recorded merge commit is `26940bc45c1398f42d8f81d7d9430bdbd3f30508`.
- The merged work contains the v0.2 prototype, the static artifact builder, and the GitHub Pages workflow. A merge establishes source integration, not successful deployment.
- The public project address is expected to be `https://chithanh123.github.io/truevalues.github.io/`. Public-site verification from this environment was blocked by an HTTP 403 network response. Neither a successful Pages run nor the live site's current content is claimed here.
- [Pull request #3](https://github.com/Chithanh123/truevalues.github.io/pull/3) merged the v0.3, v0.4 and `0.4.1` reviewer-tooling work into the user's fork. Fetching `master` on 25 October verified merge commit `5d173d1215f6b6aba47dbd27b66abbbec0656e42` and the ancestry of `d0252e7`. This establishes source integration; the live deployment was not checked in this access-repair task.
- [Pull request #4](https://github.com/Chithanh123/truevalues.github.io/pull/4) merged the research catalog and `0.4.2` debrief into the user's fork. Fetching `master` on 26 October verified merge commit `de4743ae7e6853366f6ffaeb04ee3dffd6859f09`, containing `fdf5825`. The hosted deployment has not been verified here.
- The Node 24 / Ubuntu 24.04 workflow maintenance, `0.4.3` interpretations, `0.4.4` results-pilot workspace, the 27 October content expansion, and the `0.4.5` question-bank page continue on `site/question-bank`. Browser-readable package/outcome documentation and repository download bundles are provided so access does not depend on cloud-workspace links. Publishing this branch does not merge these newer changes into `master` or deploy them.

## Milestone audit

| Planned milestone | Status | Evidence and remaining work |
| --- | --- | --- |
| 1. Research protocol and construct map | Partial draft | Candidate constructs, rival explanations, a design matrix, and research questions are documented. The first pilot audience is now bilingual English–Vietnamese adults. Recruitment geography, operator, exact eligibility, primary outcomes, data handling, literature synthesis, and study analysis are still unresolved. |
| 2. Small playable instrument | Implemented | The original two-world prototype was expanded to 24 value statements, eight settings, five roles, eight main situations, and a housing comparison. The v0.4 branch adds 16 descriptive foundation statements. Local progress, exports, erasure, and the debrief work under automated checks. |
| 3. Cognitive pilot and independent review | Materials and local recording tools prepared; human work pending | The interview guide, author review packet, bilingual comparison workspace, structured local worksheet, and empty issue log support review. No independent human review, interview, or participant findings are recorded as completed. |
| 4. Study-ready engine and fuller bank | Engineering partially implemented | The full requested setting/role bank, validation, and versioned saves exist. v0.3 adds optional personal preference separately from role action; v0.4 broadens the premise bank and its author-review map. Formal forms, managed allocation, consented collection, and reviewed study cells are not implemented or approved. |
| 5. Exploratory study | Not started | No approved recruitment, collected study dataset, or empirical item analysis is claimed. |
| 6. Frozen instrument and validation study | Not started | Preregistration, justified sample size, independent/held-out data, and validity evidence remain future work. |
| 7. Public assessment release | Source integrated; public deployment unverified | The deployment workflow and artifact are prepared. Public claims must remain limited to an experimental prototype; source integration is not measurement validation. |
| 8. Later game and language expansion | Bilingual review tooling implemented | Vietnamese author drafts are available for comparison with English source text. The participant assessment remains English. A complete Vietnamese participant version, validated translation, branching campaigns, and ideology affinities are not claimed. |

## v0.4 work and broader aims

The current addition addresses the assumptions behind political positions. It distinguishes social ontology, normative premises, epistemology, and institutions, with 16 descriptive statement items and an overlapping map of 13 political-tradition lenses. The map supports research review and future expansion; it does not identify a participant as leftist, liberal, or any other tradition. Individual foundation answers contribute no score or denominator to the four existing policy domains. The [foundations framework](FOUNDATIONS.md) records the fuller-bank aims and candidate-item limitations.

The complete route now has 49 primary response items: 24 value statements, 16 foundation statements, and nine situations. The provisional 25–35 minute estimate requires observation; longer coverage is not evidence of improved measurement. Independent reviewers should examine internal disagreements within political traditions, rival explanations, omitted premises, and cross-language interpretation before proposing foundation scales or ideology affinities.

Explicit real-country correspondences are withheld in the participant flow until the final debrief. Fictional institutions and powers remain visible. The separate author-review workspace and public source files still disclose mappings, and contextual clues can permit inference. This presentation rule is not secure experimental blinding.

The v0.4 route and schema are versioned separately from v0.3, preserving the previous-save recovery path rather than silently reinterpreting older progress. Human review and participant findings remain pending.

## Website question-bank view 0.4.5

The website now provides a searchable view of the 151-item author catalog, including draft English–Vietnamese statements and situations, intended outcomes and source status. The web snapshot excludes the author database’s country correspondences, scores and participant records. The new content is research material and is not added to the existing 49-item assessment. The web export matches its authored database and source fingerprints; 97 Node tests, 18 catalog checks and the content, translation and evidence validators passed. Browser tests passed against the source and packaged project path, including all 151 items, bilingual text, search and filters, outcome/source notes, mobile layout, storage isolation, and no failed or external requests. The static artifact contains 49 files.

## Results-comprehension preparation 0.4.4

The separate `results-pilot.html` workspace applies the unchanged result renderer and interpretation rules to six authored completed cases. They cover connected beliefs and an explicit role/preference difference, mixed economic answers, neutral answers, uncertainty, limited/unrepresented evidence, and a changed housing choice. The selector uses neutral example labels, requires an explicit open action, and keeps the facilitator key collapsed. Synthetic labels remain in downloads and printouts. The page never reads or writes participant or reviewer storage, and collects no observations.

The [pilot kit](results-pilot/README.md) provides an EN–VI facilitator script for eight tasks, a proposed two-wave 6–8-adult protocol, a header-only observation log, a generated example key, source hashes, and six labeled text reports in a downloadable bundle. The kit generator refuses observation data in the public template. The new Node checks detect stale example sources; Python artifact tests check reproducibility and downloaded-file fidelity. These are synthetic materials and technical checks, with no human interviews or findings claimed.

Application `0.4.4` retains instrument `0.4.0`, interpretation rules `1.0.0`, reflection format `1.1.0`, scores, compatible saves, and JSON export format `2`. The site artifact expands to 45 files. Fetching `master` on 27 October still showed `de4743a` (the `0.4.2` merge); the public-site requests on 26 October returned proxy HTTP 403. Consequently the newer source remains review-branch work and live-site behavior is unverified. Final release checks are recorded below.

## Expanded question research, 27 October

The [new research pack](content-research/EXPANSION-2026-10-27.md) adds 48 English–Vietnamese statement drafts and twelve contextual decisions to the author catalog. These cover political economy, institutions and culture, social ontology, epistemology, methodology, international relations, disability, family, emergency authority, digital governance, common resources and insecure work. They are allocated to seven proposed review packets, with explicit intended outcomes, competing readings, scenario tradeoffs, and unscored response options. They are not included in the participant instrument. The 96 new scenario–world combinations (144 proposed combinations in total) await authorization and feasibility review, and the Vietnamese material awaits independent review.

Selected passages from six sources were inspected, including official W3C source snapshots and public-domain mirrors; twenty-one additional reading proposals remain unverified. The [source evidence record](../research/quiz-database/generated/source-evidence.md) identifies exact snapshots and limits. The current instrument, participant scores and fictional-country reveal remain unchanged. Eighteen catalog checks passed, including source fidelity, exact package membership, option-score exclusions, translation availability, review metadata and source-status safeguards. The existing 94 application tests, three structural validators and static build also passed; no participant interviews or independent human findings are claimed.

## Result-interpretation increment 0.4.3

The report now leads with what combinations of answers suggest. Up to four overview readings appear when their evidence conditions are met, with links that open and focus the supporting answers. Examples include public guarantees with private independence, social influence with personal agency, inclusion with gradual reform, and personal choice with safeguards against uncontrolled power. Each of the seven themes has a headline and explanation; opening it shows premise meanings, the consequences of selected packages, and the participant's selected justifications. Full answer records remain available in collapsed sections.

The rules separate directional, mixed, limited, neutral, and insufficient value evidence using explicit counts. Knowledge, care, and ecological premises remain independent rather than becoming an exclusive scale. Role/preference differences and the fixed-order housing comparison are described only where the required choices exist. The readings do not add a score, assign an ideology, infer an unselected motive, or diagnose hypocrisy. They remain author drafts awaiting independent review and comprehension evidence.

Application `0.4.3` uses interpretation rules `1.0.0` and reflection format `1.1.0`. Instrument `0.4.0`, all questions, original scores, compatible saves, and JSON response-export format `2` remain unchanged. The new interpretation modules bring the static-site allowlist to 33 files. Release-specific checks are recorded below; implementation does not establish public deployment or research validation.

## Participant-debrief increment 0.4.2

The completed assessment now presents seven descriptive themes connecting the existing value statements, starting assumptions, role actions, selected reasons, and optional personal preferences. All 49 primary items appear once in that theme report. Transparency has a separate reading section; knowledge, care, and ecology explicitly lack dedicated situations in the current route. Generic reflection prompts support inspection without collecting additional answers or inferring motives.

The original four provisional profiles remain in a collapsed optional view, using the unchanged scoring rubric. The two housing decisions remain a descriptive comparison, and the final debrief still reveals the fictional setting's country inspiration. Participants can download a readable `.txt` report or use a print / save-as-PDF layout, alongside the existing JSON export. These actions create local records and do not submit responses.

Application release `0.4.2` preserves participant instrument `0.4.0`, the question bank, scores, saved-session compatibility, and JSON response-export format `2`. The descriptive reflection format is `1.0.0`. This is a presentation improvement, not seven new measures, a political-identity classifier, adoption of the draft candidate bank, or evidence of completed human validation. Release-specific verification is recorded separately from the historical results below.

## Reviewer-tooling increment 0.4.1

The `0.4.1` increment turned the author workspace into a place to record findings against stable targets, languages, fields, and scenario settings. Outcomes are `revise`, `discuss`, or an explicit `no-issue` observation. Browsing does not count as review, and recorded coverage is not approval. Notes stay in memory by default, with a separate opt-in device save, validated JSON import with replacement preview, and JSON/CSV export. Source fingerprints identify changed content for rechecking; they are not security signatures.

The separate [source-proposal map](SOURCES.md) links foundation items to proposed readings and competing interpretations. Requests for the initial texts were blocked by the development environment, so the proposals are unverified and require checking against actual publications. This creates a verification queue; it is not a completed literature review or independent source endorsement.

Participant instrument `0.4.0`, its 49 responses, scoring, saved-session format, and delayed country reveal remain unchanged. The reviewer-note schema and tooling release are versioned separately. Reviewer notes neither enter participant response exports nor alter the authored paired packet.

## Earlier v0.3 work and its interpretation

The new work addresses two omissions from the plan:

1. An optional personal-preference response uses the **same feasible packages and material constraints** as the role decision. Only the assigned responsibility is put aside. It is stored and displayed separately from action and reason, and it contributes no profile score or denominator. It does not establish the cause of an action/preference difference.
2. `review.html` presents English source text beside **draft Vietnamese translations** for statements, situations, world briefs, and context notes. At that release it was a read-only author-review tool, not the Vietnamese assessment or evidence of translation equivalence. The later worksheet adds local notes without changing authored content.

The v0.3 instrument and response-export version change preserve the distinction from v0.2. Older saves are not silently reinterpreted. The application offers an explicit previous-save download before a new session replaces incompatible stored progress.

The assessment route remains fixed. The seed assigns a fictional world; it does not implement a balanced study form or a managed recruitment allocation protocol. Proposed future forms are recorded in [DESIGN-MATRIX.md](DESIGN-MATRIX.md), with implementation and protocol decisions still pending.

## Technical evidence

The v0.2 deployment preparation recorded **22 passing Node tests**, successful structural-content checks, and full browser journeys against the packaged `/truevalues.github.io/` path. The browser checks included all eight settings, the five roles, storage and recovery, exports and erasure, mobile layout, and legacy redirects.

Those results apply to the tested v0.2 source and artifact. The v0.3 checks completed on **22 October 2026**:

- **33 Node tests passed**, covering the assessment engine, deployment artifact, personal-preference isolation, and translation-draft invariants.
- Authored-content and Vietnamese-draft coverage checks passed for all 24 statements, nine situations, eight settings, and their institutional notes.
- The generated **21-file** deployment artifact passed the full browser suite at the project path `/truevalues.github.io/`.
- Browser checks covered both language views and paired review exports, all setting/context combinations, personal-preference persistence and score isolation, Back/reload/resume, browser-profile restart, old-save recovery, erasure, keyboard controls, and mobile overflow. No external requests, failed requests, or JavaScript errors were observed.

These outcomes are historical v0.3 development evidence. They do not establish a completed human review, a validated translated instrument, or a v0.4 test result.

The v0.4 checks completed on **22 October 2026**:

- **41 Node tests passed**, including the separate foundation schema, response validation, descriptive-summary isolation, and translation-draft invariants.
- Authored-content and Vietnamese-draft validation passed for 24 value statements, 16 foundation statements, 13 tradition lenses, nine situations, eight settings, and their institutional notes.
- The generated **24-file** deployment artifact passed the full browser suite at the project path `/truevalues.github.io/`; the source site passed the same suite.
- Browser checks covered all 49 primary responses, all eight settings and five roles, the absence of explicit country correspondences in participant pages and expanded institutional notes, their final-debrief reveal, foundation Back/reload persistence and score isolation, bilingual review and paired exports, saved-progress recovery, erasure, keyboard controls, and mobile layout. No JavaScript errors, external requests, or failed requests were observed.

The reviewer-tooling `0.4.1` checks completed on **23 October 2026**:

- **60 Node tests passed**, including reviewer-note targeting, strict imports, source-change detection, critical severity, exact UTF-8 size limits, safe CSV output, source-map structure, and evidence-panel rendering.
- Content, translation, and source-proposal validators passed. The map covers all 16 foundation items with 28 proposed links to 12 readings; all 12 readings remain unverified, with no claimed text or authorship checks.
- The reviewer browser suite passed against both the source site and the packaged `/truevalues.github.io/` path. It checked note creation/editing/deletion, explicit no-issue records, setting/language targeting, stale-content confirmation, optional device storage, incompatible-save recovery, rejected imports, replacement preview/cancellation, near-1-MiB export/import round trips, critical severity, chronological timestamps, mobile layout, and separation from assessment data.
- The full participant browser suite passed against the packaged project path, including all eight settings, all roles and institutional notes, the country reveal, exports, storage recovery, keyboard controls, and mobile layout.
- The deployment artifact contains **28 allowlisted files**. No JavaScript errors, failed requests, or external requests were observed in the browser suites.

These outcomes concern development and packaging. Source-proposal structure checks do not verify the linked publications.

The `0.4.2` checks completed on **25 October 2026**:

- **71 Node tests passed**, including completed-session gating, exact theme membership, response-status distinctions, unchanged scores and answers, context retention across all eight settings, and readable text output. An inconsistent save at the results step with `completed: false` is now rejected into the existing recovery flow without rewriting its answers.
- Content, translation, and source-proposal validators passed. The deployment artifact contains **31 allowlisted files**.
- Participant, reviewer, and new debrief browser suites passed against the packaged `/truevalues.github.io/` path. The participant and debrief suites also passed against the source site. Checks covered all 49 responses, eight settings, existing saves, final-only country disclosure, exact readable-download content, unchanged JSON export, optional profile markers, missing scenario coverage, all-skipped responses, malformed-save recovery, HTML escaping, and print expansion/restoration without response changes.
- Desktop and 375-pixel mobile views were inspected. A generated A4 PDF contained all 49 item texts/titles and restored the page's expansion state after printing. No JavaScript errors, failed requests, or external requests were observed in the browser suites.
- All **12 catalog tests passed** after refreshing the documentation and engine source hashes. The downloadable database bundle was refreshed and its 35 entries checked against the current catalog files.

The `0.4.3` checks completed on **26 October 2026**:

- **84 Node tests passed**, including opposite and mixed readings, sparse and neutral responses, evidence-triggered connections, the interpretation of all 27 action packages, explicit role/preference comparisons, context-comparison visibility, and preservation of answers and original scores across all eight settings.
- All three content, translation, and source-proposal validators passed. The deployment artifact contains **33 allowlisted files**.
- Participant, reviewer, debrief, and interpretation browser suites passed at the packaged `/truevalues.github.io/` path. The debrief and interpretation suites also passed on the source site. These checks cover personalized meaning, all 49 evidence records, opening and focusing supporting answers, unchanged JSON and browser saves, readable downloads, country-reveal timing, sparse responses, and escaping of injected display text. No JavaScript errors, failed requests, or external requests were observed.
- Desktop and 375-pixel mobile views were inspected. Actual PDF output contained all seven theme explanations, overview findings, and all 49 item texts/titles. Printing restored the 23 expandable sections and left stored answers unchanged.
- **12 catalog tests passed**. The catalog was rebuilt with the updated research-document fingerprint, and all 35 entries of the refreshed download bundle were checked against their source files.

The `0.4.4` technical checks completed on **27 October 2026**:

- **94 Node tests passed**, including the six completed 49-item fixtures, mixed/neutral/uncertain/limited evidence, explicit role/preference and housing comparisons, fresh independent sessions, source-hash freshness, and the header-only public observation template.
- **Three pilot-artifact tests passed**, checking reproducible generation, the 13-file ZIP against its source files and current report outputs, rejection of collected observation rows, and protection of authored files and output paths. The kit contains six labeled synthetic text reports and no human observations.
- Content, translation, and source-proposal validators passed. The deployment artifact contains **45 allowlisted files**.
- The pilot browser suite passed on the source site and at the packaged `/truevalues.github.io/` path; the reviewer suite passed against the packaged site. Pilot checks cover all six examples, 49 evidence records each, neutral entry labels, evidence focus, exact labeled downloads, linked materials, and expansion/restoration of all 23 printable report sections. Instrumented browser storage denied and recorded any access attempt; the pilot made none and left the seeded quiz and reviewer records unchanged. The participant application module was not loaded. No JavaScript errors, failed requests, or external requests were observed.
- Desktop and 375-pixel mobile layouts were inspected. Synthetic labels remain visible in print; facilitator keys stay closed on opening or switching examples and are excluded from printing even when opened on screen.

These checks prepare the results-comprehension pilot; no human sessions, participant findings, or independent bilingual review are recorded as completed.

These results are development evidence. They do not establish independent human review, translated measurement equivalence, or secure country blinding. Reproduce the checks with:

```sh
npm run validate:content
npm run validate:translations
npm run validate:evidence
npm test
npm run build
python3 tests/browser_smoke.py
python3 tests/browser_review.py
python3 tests/browser_debrief.py
python3 tests/browser_interpretation.py
python3 tests/browser_pilot.py
python3 -m unittest discover -s research/results-pilot -p 'test_*.py'
```

Run the browser suite with its documented local server. The browser suite includes the bilingual-workspace checks for this branch. Do not carry the previous test count forward as the result of a new version, and do not treat any technical check as completed human review.

## Next work in order

1. Verify proposed source identities, locators, relevance, and rival interpretations against actual publications. Obtain independent review of the foundation-item map across political viewpoints and independent bilingual review of the author translations. Record the reviewed targets explicitly, reconcile revisions, and retain unresolved issues.
2. Settle the pilot operator, recruitment geography, adult eligibility, language-proficiency criteria, consent/recording choice, and data-handling procedure before recruiting.
3. Conduct iterative comprehension interviews under that procedure. Review the role/preference distinction and whether the same constraints are understood in both languages.
4. Complete a verified literature-to-construct map and independent rubric review, including the foundation categories and overlapping tradition associations. Expand the bank from identified omissions, preserve provenance and rival readings, and review transparency/capacity items before treating them as civil-rights indicators.
5. Revise and version the instrument from the observed issues. Choose primary study contrasts and candidate forms before implementing a formal allocation schedule or collection service.

The [pilot guide](PILOT-GUIDE.md) supplies prompts and decision gates. It contains a procedure, not findings or authorization to recruit.
