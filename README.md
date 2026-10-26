# Political Context

A research-first political assessment prototype built from the 8values static-site fork. Participants answer value and foundational-assumption statements, take decisions within fictional political settings, and receive a debrief that separates stated values, assumptions, and choices under constraints.

Current instrument version: **0.4.0**; application release: **0.4.3**. The latest release explains what combinations of answers suggest, with links to the responses supporting each reading. Seven themes give a headline, an explanation, and the practical implications of chosen packages before the optional full answer records. It preserves the 49-item participant route, scores, saved-response format, and existing reviewer tools. The assessment is experimental. Its four domains and scoring rubric are candidate measures, not validated ideological scales. It does not assign a definitive ideology, population percentile, or a “hypocrisy” score. See [the research notes](docs/RESEARCH.md) for interpretation rules, scoring assumptions, confounds, and the work required before recruiting research participants.

## Run locally

See the [result-screen preview with synthetic answers](docs/previews/README.md) for the new desktop and mobile interpretation views.

The application uses static HTML, CSS, and JavaScript modules. There are no application dependencies to install and no build step. Use a current browser and Python 3 to serve the repository over HTTP:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Alternatively, with Node.js and npm available:

```sh
npm run serve
```

Run either command from the repository root, then open the local server on port 8000 in a browser. Serving over HTTP is required for JavaScript modules; opening an HTML file directly from the filesystem is not the supported workflow.

## Publish as a website

GitHub Pages deployment is prepared in `.github/workflows/pages.yml`. It checks the content, runs the tests, builds a clean `dist/` artifact, and publishes pushes to `master` after Pages is enabled for GitHub Actions. No application dependencies or hosting secrets are required.

The expected project URL is **https://chithanh123.github.io/truevalues.github.io/**. Local changes are not live until the repository workflow deploys them. Follow the [deployment guide](docs/DEPLOYMENT.md) for the one-time Pages setting, publishing steps, and artifact upload alternatives.

```sh
npm run build
```

The generated `dist/` folder can also be uploaded to another static HTTPS host. Local development and cloud-environment publication do not deploy the website.

## What this version contains

- Twenty-four value statements, six in each provisional domain: economic priorities, shared obligations, rights and public order, and continuity and change.
- Sixteen additional foundation statements distinguish assumptions about social reality, normative priorities, knowledge, and institutions. Responses remain descriptive and do not change the four domain summaries.
- An overlapping map of 13 political-tradition lenses supports author review and a future, more comprehensive statement bank. It does not assign participants to traditions from agreement with individual items.
- Eight fictional settings with randomly assigned institutional briefs and scenario notes. The participant route withholds explicit real-country correspondences until the final debrief while retaining decision-relevant institutional facts.
- Eight main scenarios covering urban and rural life: seven provisionally scored and one descriptive public-records exercise. Each route includes ordinary constituents, civil society leaders, non-elected public servants/local officials, local leaders, and national leaders.
- One matched housing scenario that changes the urgency of school repairs while retaining the other decision assumptions.
- Role descriptions, institutional limits, optional context, three feasible actions per scenario, and separate unscored reasons.
- A reflection report beginning with up to four readings supported by combinations of answers. Examples include public guarantees alongside private independence, social influence alongside personal agency, inclusion with gradual reform, and freedom with safeguards against uncontrolled power. Each reading links to its supporting responses; its appearance depends on the answers recorded.
- Seven theme summaries explaining value patterns, endorsed or rejected premises, and what selected action packages put into practice. Selected reasons remain explicit, and full answer records are collapsed beneath the interpretations.
- Separate comparisons of role actions with optional personal preferences and of the two housing choices, with explicit limits on what any difference means.
- The original four statement/scenario profiles in a collapsed optional detail view; no new scores or political identities are assigned by the seven themes.
- A readable `.txt` report, a print / save-as-PDF layout, and the existing JSON response export, all created locally after completion.
- Situation briefings, constraints, and assigned-setting notes retained in the readable/printed report and available within each on-screen decision record.

Uncertain, skipped, and unrepresented answers are excluded from numerical summaries rather than treated as centrist responses. The repeated housing scenario is excluded from the main scenario profile so it does not receive extra weight. The public-records exercise is also excluded from all domain scores and their denominators; its choices and reasons remain visible. It concerns transparency and staff capacity, which have not been established as a civil-rights measure.

The expanded content is an author draft. The shared anchor cases and world-specific notes support review; they do not create a formal balanced experiment or validate cross-setting comparisons. External review, cognitive interviews, a completed literature review, and empirical validation remain outstanding.

The report themes are ownership/provision/control; freedoms and contesting power; transparency/access to records; belonging/obligations/cooperation; continuity/inclusion; knowledge/judgment; and care/ecological dependence. They organize authored interpretations of recorded answers without creating seven measured dimensions. A value pattern needs at least two answers pointing in one direction and none in the other; opposing directions produce a mixed reading, and a lone directional answer produces a limited reading. Neutral, uncertain, and skipped answers remain separate rather than becoming a centrist identity. Knowledge, care, and ecological premises are interpreted independently, with no dedicated situations or exclusive scale in the current route. Transparency is displayed separately while retaining the original scoring rubric for compatibility. Generic reflection prompts add no stored answers or scores.

The final debrief reveals the assigned setting's real-world inspiration and provides author-review access. The separate `review.html` workspace and authored review packets contain country correspondences and are marked as spoilers; inspect them after completing a participant route if preserving that experience matters. This is presentation concealment in a public static application, not secure experimental blinding. Source files and reviewer documents remain inspectable. The [cognitive pilot guide](docs/PILOT-GUIDE.md) provides neutral interview prompts, reviewer criteria, decision gates, and an [empty review-log template](docs/review-log-template.csv). No independent human content reviews, interviews, or participant findings are claimed. AI-assisted technical review and automated checks are development work, rather than evidence of human review.

## Broader foundations and research aims

The [content-research preparation pack](docs/content-research/README.md) audits the current bank and proposes 36 bilingual statements, six scenario families, and smaller comprehension-review packets. These are content drafts for review before implementation; they do not change the assessment or its scores. External source retrieval remains blocked, so the pack distinguishes editorial analysis from proposed readings that still need verification.

The [quiz-package database](research/quiz-database/README.md) organizes that material into five package records, 91 content items, and 31 intended assessment outcomes. A portable SQLite file and CSV exports link each package to its questions, interpretation limits, translation availability, and review status. It is an author research catalog, separate from the participant application.

The expanded aim is to compare the premises behind political judgments, including disagreements within leftist, liberal, conservative, and other traditions. Social ontology concerns what people understand society and its actors to be; it is distinct from what they value, what they accept as knowledge, or which institutions they favor. The draft map keeps these questions separate and allows traditions to overlap. A participant's answer is not treated as proof of a political identity.

The 16-item foundation section is a first reviewable addition, not comprehensive coverage of political thought. The [foundations framework](docs/FOUNDATIONS.md) sets out the candidate premises, internal disagreements, omissions, and next aims: an expanded literature-to-item map, independent review across viewpoints, a larger source-traceable bank, and cross-language comprehension research. The initial [source-proposal map](docs/SOURCES.md) records candidate readings, background or contrast links, verification status, and open interpretation questions. The development environment could not retrieve the proposed source texts; these links and locators remain unverified and require checking against the actual publications.

A complete route now includes **49 primary response items**: 24 value statements, 16 foundation statements, and nine situations, with optional reasons and personal preferences. Allow roughly **25–35 minutes** as a development estimate; actual burden has not been established through participant interviews.

## Bilingual pilot preparation

The first comprehension-pilot audience is bilingual English–Vietnamese adults. Open `review.html` for a workspace pairing the English source with draft Vietnamese wording for all 24 value statements, 16 foundation statements, nine situations, and eight setting briefs, including the author-only conceptual map. Filter by item type, search by ID or wording, select a setting for its institutional notes, or view either language alone. The paired download contains authored content and translation metadata; it excludes reviewer notes and personal assessment answers. Authored wording remains unchanged when a reviewer records a finding.

Use each card’s review action to record a finding against its stable item, language, field, and setting where applicable. Record `revise`, `discuss`, or an explicit `no-issue` observation; opening a card does not count as review. Notes can include proposed wording, source questions, and a resolution record. Recorded observations support review coverage, not approval or validation of the instrument.

Review notes stay in memory by default. Optional device saving uses a separate reviewer storage key. Export notes as JSON for continued editing or CSV for a review log; import validates the file and previews replacement before changing existing notes. A source fingerprint identifies content changes: imported notes against changed wording are marked stale and need explicit rechecking. The fingerprint is not a security signature. Use reviewer codes and keep unnecessary personal details out of notes.

These are author translation drafts, pending independent bilingual review, reconciliation, and cognitive interviews. The participant assessment remains in English. This workspace does not establish translation equivalence or a validated Vietnamese assessment.

Each assessment situation now offers an optional personal-preference question after the role response. It retains the same feasible packages and material constraints. Preferences, role actions, and reasons remain distinct in the debrief and response export. Preferences contribute no score or denominator, and any difference is descriptive rather than a finding about hypocrisy or causation.

See the [progress ledger](docs/PROGRESS.md), [item-level design matrix](docs/DESIGN-MATRIX.md), and [pilot guide](docs/PILOT-GUIDE.md) for the completed engineering, unresolved research decisions, and translation-review procedure.

## Progress, privacy, and exports

Answers are processed in the browser. The application has no analytics, advertising, research submission endpoint, or automatic transmission of responses.

Progress is kept for the current browser session. Persistent on-device saving is optional and uses local storage; it is not an account or cloud backup. A shared browser profile can expose a saved session to other users. The application provides controls to erase this tab's answers and the saved device copy. Other open tabs may retain separate copies.

An exported response record is a voluntary local download containing sensitive political responses, reasons, assigned setting, and the instrument version. The readable text report and printed/PDF report also contain recorded responses and the revealed setting. Printing uses the browser's print dialog; PDF saving depends on the browser and device. The participant controls whether to share these files. The review-packet download contains authored content and metadata instead of responses or reviewer notes. Reviewer-note downloads are separate files and contain the observations a reviewer entered. Clear reviewer notes in the review workspace; the assessment’s erase control does not remove that separate draft. Erasing browser data cannot erase copies already downloaded or shared.

Static hosting can maintain ordinary access logs independently of this application. Formal research collection would require a separate consented workflow and a review of hosting, access controls, retention, and deletion practices. There is no research data collection service in this prototype.

## Check the implementation

Use a current Node.js release with the built-in test runner:

```sh
npm run validate:content
npm run validate:translations
npm run validate:evidence
npm test
```

The coverage command reports authored settings, roles, localities, and domain/item counts, including the separate foundation bank. The tests check content structure, session validation, assignment, response replacement, scoring direction, missing evidence, and the exclusion of foundation responses, comparison scenarios, and descriptive-only scenarios from aggregate scores. These technical checks do not establish measurement validity. No npm dependency installation is needed.

Browser smoke tests additionally require Python, the Python Playwright package, and Chromium. These are already available in the prepared development environment; they are optional development tools and are not required to use the application.

With the local server running in a separate terminal:

```sh
python3 tests/browser_smoke.py
python3 tests/browser_review.py
python3 tests/browser_debrief.py
python3 tests/browser_interpretation.py
```

The browser checks exercise the participant journey, saved progress, theme coverage, interpretation and evidence links, readable download and print behavior, responsive presentation, and reviewer-note import/export, storage isolation, and stale-content handling. Consult the test scripts for their server and browser configuration when running on another machine.

## Code layout

| Location | Purpose |
| --- | --- |
| HTML entry points and `style.css` | Participant interface, assessment navigation, and responsive presentation |
| `js/content.js` | Versioned value bank, scenarios, options, and candidate rubrics |
| `js/foundations.js` | Descriptive foundation items, conceptual categories, and overlapping author-review lenses |
| `review.html` and `js/review.js` | English–Vietnamese paired review, filters, local worksheets, and separate exports |
| `js/review-notes.js` | Reviewer-note schema, content fingerprints, validation, and formula-safe CSV output |
| `js/foundation-evidence.js` and `docs/SOURCES.md` | Unverified source-to-premise proposals, access status, locator fields, and interpretation limits |
| `js/translations/` | Draft Vietnamese item and setting wording, with stable source IDs |
| `scripts/validate-translations.js` | Mechanical coverage, number, and paired-case checks; not translation approval |
| `scripts/validate-evidence.js` | Source-map structure and reference checks; not independent scholarly review |
| `js/worlds.js` | Eight fictional setting briefs and scenario-specific institutional notes |
| `js/engine.js` | Assignment, assessment steps, immutable response updates, validation, and separate summaries |
| `js/debrief-content.js`, `js/debrief.js`, and `js/debrief-view.js` | Author-chosen theme links, completed-response records, readable text export, and descriptive report rendering |
| `js/interpretation-content.js` and `js/interpretation.js` | Authored meanings, explicit pattern rules, and links between interpretations and supporting answers |
| `scripts/validate-content.js` | Authored-content structure and coverage report |
| `tests/engine.test.js` | Node tests for content and assessment logic |
| `tests/browser_smoke.py`, `tests/browser_review.py`, `tests/browser_debrief.py`, and `tests/browser_interpretation.py` | Participant, reviewer, reflection-report, and interpretation browser checks using Python Playwright and Chromium |
| `docs/RESEARCH.md` | Research questions, candidate outcomes, rubric, confounds, privacy, and version history |
| `docs/FOUNDATIONS.md` | Broader ideological-premise aims, draft lens map, and foundation-item limitations |
| `docs/PILOT-GUIDE.md` | Cognitive interview plan, content-review rubric, prerequisites, and decision gates |
| `docs/review-log-template.csv` | Header-only issue log; no invented observations or participant records |
| `LICENSE` | MIT license and original 8values attribution |

Application, reviewer-note, reflection-report, and interpretation-rule formats are versioned separately from participant content. Releases `0.4.1` through `0.4.3` preserve instrument `0.4.0` and compatible participant saves; the JSON response export remains format version `2`. The current reflection format is `1.1.0`, and the interpretation rules are `1.0.0`. Use stable content IDs and update the instrument version when changing wording, assumptions, or scoring. Saves from earlier instrument versions are deliberately rejected by `0.4.0`; there is no silent migration. Starting a new assessment can replace the older browser save, while existing exported files retain their original version for interpretation. New scenarios should document the player's actual authority, viable alternatives, relevant facts, and which conclusions the choice cannot support.

## Attribution

This project builds on [8values](https://github.com/8values/8values.github.io). The original MIT copyright and permission notice are retained in [LICENSE](LICENSE).
