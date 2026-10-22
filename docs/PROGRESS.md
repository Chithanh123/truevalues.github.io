# Political Context: progress ledger

Review date: **22 October 2026**. Current development branch: `research/ideological-foundations`, based on the v0.3 `research/bilingual-pilot` commit `399e763`; the fork's recorded `master` is `26940bc`.

This ledger distinguishes working software, drafted research materials, completed human work, and publication evidence. It does not assign a completion percentage: the research gates cannot be inferred from the amount of code or content.

## Repository and publication evidence

- [Pull request #1](https://github.com/Chithanh123/truevalues.github.io/pull/1) was merged into **Chithanh123/truevalues.github.io**. The recorded merge commit is `26940bc45c1398f42d8f81d7d9430bdbd3f30508`.
- The merged work contains the v0.2 prototype, the static artifact builder, and the GitHub Pages workflow. A merge establishes source integration, not successful deployment.
- The public project address is expected to be `https://chithanh123.github.io/truevalues.github.io/`. Public-site verification from this environment was blocked by an HTTP 403 network response. Neither a successful Pages run nor the live site's current content is claimed here.
- The v0.3 work is implemented and technically checked on `research/bilingual-pilot`. It is distinct from the already merged v0.2 work until its own review and merge are recorded.
- The v0.4 development branch includes that v0.3 work and adds descriptive foundation statements and a delayed country-correspondence reveal. These branch changes are not a claim of integration into `master` or public deployment.

## Milestone audit

| Planned milestone | Status | Evidence and remaining work |
| --- | --- | --- |
| 1. Research protocol and construct map | Partial draft | Candidate constructs, rival explanations, a design matrix, and research questions are documented. The first pilot audience is now bilingual English–Vietnamese adults. Recruitment geography, operator, exact eligibility, primary outcomes, data handling, literature synthesis, and study analysis are still unresolved. |
| 2. Small playable instrument | Implemented | The original two-world prototype was expanded to 24 value statements, eight settings, five roles, eight main situations, and a housing comparison. The v0.4 branch adds 16 descriptive foundation statements. Local progress, exports, erasure, and the debrief work under automated checks. |
| 3. Cognitive pilot and independent review | Materials prepared; human work pending | The interview guide, author review packet, bilingual comparison workspace, and empty issue log support review. No independent human review, interview, or participant findings are recorded as completed. |
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

## Earlier v0.3 work and its interpretation

The new work addresses two omissions from the plan:

1. An optional personal-preference response uses the **same feasible packages and material constraints** as the role decision. Only the assigned responsibility is put aside. It is stored and displayed separately from action and reason, and it contributes no profile score or denominator. It does not establish the cause of an action/preference difference.
2. `review.html` presents English source text beside **draft Vietnamese translations** for statements, situations, world briefs, and context notes. This is a read-only author-review tool, not the Vietnamese assessment and not evidence of translation equivalence.

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

These results are development evidence. They do not establish independent human review, translated measurement equivalence, or secure country blinding. Reproduce the checks with:

```sh
npm run validate:content
npm run validate:translations
npm test
npm run build
python3 tests/browser_smoke.py
```

Run the browser suite with its documented local server. The browser suite includes the bilingual-workspace checks for this branch. Do not carry the previous test count forward as the result of a new version, and do not treat any technical check as completed human review.

## Next work in order

1. Obtain independent review of the foundation-item map across political viewpoints and independent bilingual review of the author translations. Reconcile revisions and record unresolved issues.
2. Settle the pilot operator, recruitment geography, adult eligibility, language-proficiency criteria, consent/recording choice, and data-handling procedure before recruiting.
3. Conduct iterative comprehension interviews under that procedure. Review the role/preference distinction and whether the same constraints are understood in both languages.
4. Complete a verified literature-to-construct map and independent rubric review, including the foundation categories and overlapping tradition associations. Expand the bank from identified omissions, preserve provenance and rival readings, and review transparency/capacity items before treating them as civil-rights indicators.
5. Revise and version the instrument from the observed issues. Choose primary study contrasts and candidate forms before implementing a formal allocation schedule or collection service.

The [pilot guide](PILOT-GUIDE.md) supplies prompts and decision gates. It contains a procedure, not findings or authorization to recruit.
