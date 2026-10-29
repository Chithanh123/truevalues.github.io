# Quiz packages and intended assessment outcomes

This is an **author-facing content catalog** for Political Context. It connects quiz packages, their items, and the interpretations each package is intended to explore. An intended outcome describes what a response might tell us; it is not a preferred political answer, an ideological diagnosis, or a validated result.

The catalog contains the original 49-item instrument, the [initial research pack](../../docs/content-research/README.md), and the [27 October expansion](../../docs/content-research/EXPANSION-2026-10-27.md). Application 0.5.0 combines those 49 items with 60 additional unscored draft questions in its 109-item route. The original scoring rubric and its answer record remain distinct. It stores authored content and research metadata, with no participant answers or personal records.

## Open the database

- **For mobile or web reading, start with [Packages and intended outcomes](generated/package-overview.md).** GitHub renders this overview as a normal page; no download or database application is needed.
- Read the [new bilingual questions and contextual situations](generated/expansion-candidates.md) and the [source evidence record](generated/source-evidence.md) in your browser.
- For an offline copy, use the [database and CSV download bundle](downloads/quiz-database-2026-10-27.zip?raw=1). SQLite is a database format, so use the readable overview if you only want to browse the contents. The bundle includes the generated guides and expansion JSON; some links to documents outside the extracted bundle need the repository.
- Open [generated/quiz-packages.sqlite3](generated/quiz-packages.sqlite3) in a database browser using SQLite 3.37 or later. The file is portable and needs no database server.
- Open the files in [generated/csv](generated/csv) in a spreadsheet for a table-by-table review.
- Start with `package_summary`, `package_content`, and `package_outcome_matrix`; these views connect the main records without requiring manual joins.
- The [example queries](queries.sql) show package contents, intended interpretations, translation gaps, held probes, unassigned plans, and context-review requirements.

The database is researcher material and includes country-inspiration spoilers. Fictional briefs are in `world_texts`; correspondences are separated into `world_reveals` and marked `after_completion`. This records the participant presentation rule. It is not access control: anyone inspecting this author database can read the correspondences.

## Packages included

| Package ID | Content allocation | Status and intended use |
| --- | --- | --- |
| `PILOT-0.4.0` | 40 statements: 24 values and 16 foundations; nine scenario instances; **49 primary tasks** | Original section of the combined route; implemented, unvalidated prototype. Describes stated commitments, individual premises, contextual actions, and the existing provisional profiles. The route has a fixed order. |
| `REVIEW-A` | CR-02, CR-03, CR-05, and CR-06 triads; CR-S01 and CR-S03; **14 primary tasks** | Draft comprehension packet on power, freedom, enterprise authority, and knowledge. CR-S03 is held as a comprehension probe pending redesign, not an ideological indicator. |
| `REVIEW-B` | CR-01, CR-04, CR-11, and CR-12 triads; CR-S02 and CR-S05; **14 primary tasks** | Draft comprehension packet on social formation, care, ecological standing, and the grounds of authority. |
| `REVIEW-C` | CR-07, CR-08, CR-09, and CR-10 triads; CR-S04 and CR-S06; **14 primary tasks** | Draft comprehension packet on continuity, membership, religion, inherited status, and repair. |
| `REVIEW-D`–`REVIEW-H` | Two new clusters and two scenarios each; **10 primary tasks** per packet | Author-draft comprehension packets covering disability, family, emergency power, digital governance, commons, work, political economy, institutions, ontology and epistemology. |
| `REVIEW-I` | One new cluster and one scenario; **5 primary tasks** | Author-draft methodology packet; additional probes and discussion add burden. |
| `REVIEW-J` | One international-relations cluster and one scenario; **5 primary tasks** | Author-draft review of security, cooperation, sovereignty and international institutions. |
| `FUTURE-24` | Budget of 18 statements and six scenarios; **zero items selected** | Unassigned design outline. Its target of 24 tasks is not a completed form, a recommended validated length, or a source of current assessment outcomes. |

The original REVIEW-A–C packets have twelve statements and two scenario families each. REVIEW-D–J allocate the 48 additional statements and twelve additional scenarios once; those 60 drafts also appear in the combined assessment in a fixed authored order. The packets are review allocations; formal study allocation has not been designed. They are not equivalent forms and do not give each reader a complete political profile. Briefings, reasons, interviews, language switching, and debriefing add burden beyond the primary-task count.

The later 24-task form must select from the combined existing and new bank after coverage review. It should not automatically select all six new families and lose existing dissent or international-obligation coverage.

## Content and language coverage

There are **151 distinct item records**: 49 original-section items, 84 author-draft statements, and 18 author-draft scenario families. Of the drafts, 48 statements and 12 scenarios are included in the combined assessment; the rest remain review material. Options, reasons, and variant instructions are related records rather than extra primary items. The original repeated housing case is one of the existing nine scenario instances.

English text is available for all 151 items. Vietnamese author drafts are available for **147**: all 49 original-section items, all 84 author-draft statements, and 14 of the 18 proposed scenarios. CR-S03 through CR-S06 have no Vietnamese participant draft. The review packets therefore contain 13, 13, and 12 Vietnamese drafts respectively. These counts establish availability, not translation equivalence. The current participant application remains English.

All eight fictional worlds are represented. The 72 original scenario–world notes are authored and unreviewed. The 144 proposed scenario–world combinations are an authorization and feasibility review queue; their participant context notes remain absent. A populated queue does not mean those 144 contexts have been written, independently reviewed, or checked against real-country law.

## Read the intended outcomes correctly

The outcome records separate five kinds of inference:

| Outcome kind | Intended use | Important limit |
| --- | --- | --- |
| `provisional_profile` | Document the current four authored domain summaries and the interpretation being explored. | The domains are unvalidated and combine constructs that the content audit recommends separating. |
| `descriptive_construct` | Record responses to a premise or conceptual distinction. | A collection of related items is not automatically a scale, an ideological identity, or opposing endpoints. |
| `scenario_judgment` | Describe the priority or mechanism explored by a situated decision. | Several motives can produce the same action; an assigned role is not a causal explanation by itself. |
| `comprehension` | Investigate interpretation of wording, facts, response categories, or a mandated task. | Understanding a prompt is not endorsement of the author's politics or an ideological score. |
| `response_record` | Keep actions, preferences, reasons, and descriptive comparisons identifiable. | A recorded difference is not a hypocrisy measure or a finding about a person's authentic beliefs. |

For each outcome, read `intended_interpretation`, `evidence_required`, and `unsupported_inferences` together. `item_outcomes` links a question to that purpose as `primary`, `context`, or `probe`. `package_outcomes` states why the package includes that outcome. These are content relationships, not numerical weights or scoring instructions.

Package outcomes distinguish `linked_items` from `whole_package` coverage. The general comprehension-review purpose applies to an entire packet without assigning it as an extra political construct to every item. The outcome matrix reports both direct item links and the number of applicable items; those are coverage counts, not effect sizes or outcome scores.

The original score metadata is retained for inspection. Current value statements have a direction; seven current main scenarios retain provisional option scores. The public-records scenario is descriptive, the housing comparison is excluded from aggregation, and foundation responses are descriptive. New candidates and CR-S03 have no option scores. A cooperative or combined arrangement is not established as politically moderate because an older authored rubric gives it zero. Any changes to the actual scoring contract require separate content decisions and application work.

The original source dossier records unverified proposals. In the October expansion, selected passages from six sources were inspected; twenty-one further proposed readings remain unverified. Read the [source evidence record](generated/source-evidence.md) for exact scope and access limitations. Source links establish a reading queue; they do not prove an item's validity or an author's endorsement of its wording. No completed independent human review or empirical validation is implied by a database row or a passing integrity check.

## Main tables and views

| Tables or views | Purpose |
| --- | --- |
| `packages`, `package_items`, `package_summary`, `package_content` | Package plans, membership, available language versions, task counts, and current order where it exists. |
| `outcomes`, `item_outcomes`, `package_outcomes`, `package_outcome_matrix` | Intended interpretations, evidence requirements, limits, and their links to content. |
| `items`, `item_texts`, `clusters` | Stable IDs, content status, claim type, bilingual wording, conceptual disputes, probes, and risks. |
| `options`, `option_texts`, `reason_notes`, `variants` | Offered actions, tradeoffs, explanatory notes, and controlled-variant proposals. A variant instruction is not a fully authored alternate form. |
| `roles`, `worlds`, `world_texts`, `world_reveals`, `scenario_contexts` | Role metadata, fictional briefs, separate debrief correspondences, and setting-specific feasibility status. |
| `readings`, `cluster_readings`, `item_readings`, `reading_evidence`, `reading_passages` | Reading proposals, conceptual links and the limited passage-inspection record. |
| `audit_findings`, `review_queue` | Existing-item issues, proposed dispositions, translation gaps, and items held for review. |
| `metadata`, `source_files` | Catalog provenance, version information, and source-file hashes identifying the imported snapshot. Hashes do not certify accuracy or review. |

The [schema](schema.sql) uses primary keys, foreign keys, checks, and typed tables to preserve these relationships. A missing translation is an absent record, not a fabricated placeholder. An unassigned package has no item memberships. Neither absence should be converted to a neutral political response.

## Rebuild and check

From the repository root, use the existing Python 3 and Node.js environment:

```sh
python3 research/quiz-database/build.py
python3 research/quiz-database/test_catalog.py
python3 research/quiz-database/build-bundle.py
```

The builder reads the current authored JavaScript content, the content-research Markdown, and the structured [outcome metadata](outcomes.json), [scenario drafts](draft-scenarios.json), and [expansion sources](expansion/). It generates the SQLite database and CSV exports locally. It requires no external database service and performs no participant-data collection.

Edit the source material and review the intended meanings before rebuilding. Generated database or CSV edits do not flow back into the authored sources and may be replaced by a rebuild. Keep manual review observations separately from generated output. When source wording changes, recheck related translations, mappings, variants, and outcome interpretations; a successful rebuild cannot perform that conceptual review.

The structured scenario extraction includes a `source_sha256` for its Markdown source. If that source changes, the builder stops until the extraction has been reviewed and its hash refreshed; do not update the hash without checking the text. A `source-manifest.json` records every imported source snapshot, including uncommitted drafts. CSVs use UTF-8 with a byte-order mark for Vietnamese text; a leading apostrophe guards formula-like text in spreadsheets. SQLite retains the original text. Rebuilds replace only a directory marked as belonging to this catalog builder.

Checks establish structural consistency, source coverage, and the preservation of explicit exclusions and draft statuses. They do not establish political representativeness, comprehension, psychometric quality, or cross-language comparability.

On 25 October 2026, all **12 catalog tests passed**, covering source fidelity, relational integrity, exact package allocation, translation gaps, outcome links, scoring exclusions, source hashes, exports, and the eight documented queries. The participant application files were unchanged.
