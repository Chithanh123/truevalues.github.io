# Results-comprehension pilot kit

Kit `1.0.0` · application `0.4.4` · assessment `0.4.0` · interpretation rules `1.0.0`.

This kit prepares a small formative review of the result explanations with 6–8 bilingual English–Vietnamese adults. It contains synthetic examples, facilitator instructions, and a blank observation log. **No interviews, participant findings, or independent language review have been completed by generating these materials.**

## Start here

1. Read [PROTOCOL.md](PROTOCOL.md) and complete the operator's outstanding eligibility, consent, and data-handling decisions before recruiting.
2. Use [SESSION-SCRIPT.md](SESSION-SCRIPT.md) for paired English–Vietnamese task prompts. The Vietnamese facilitation wording is an author draft; the participant result screen remains English.
3. Open [the interactive synthetic examples](../../results-pilot.html) from a served checkout or deployed site. This link is relative to the application; on GitHub, the HTML source is shown instead of the running page. Locally, run `npm run serve` and visit `http://127.0.0.1:8000/results-pilot.html`. Publication requires merging the review branch and completing the Pages deployment.
4. Keep [EXAMPLES.md](EXAMPLES.md), the facilitator key, out of the reader's first unaided attempt. The example selector uses neutral labels; the key explains what each case exercises.
5. Copy the [blank CSV log](observation-log-template.csv) **outside the public repository**, and use [OBSERVATION-GUIDE.md](OBSERVATION-GUIDE.md) to record understanding separately from agreement with a political interpretation.

The example page uses only authored completed sessions. It neither reads nor changes saved assessment answers or reviewer notes, and has no form for collecting participant observations. Opening an example shows the end-of-assessment country reveal. For an unprimed first-use quiz, finish the ordinary assessment before viewing the example page or the facilitator materials.

## Download for text or paper sessions

[Download the complete kit](results-pilot-1.0.0.zip). It includes the five instruction/template files, the example key, a source manifest, and six clearly marked synthetic text reports. The bundle contains no participant responses and no executable application. Its text and CSV files can be used offline; the interactive page is served separately. In an extracted bundle, links to the interactive page and the supplemental broader cognitive pilot guide require the repository or served site.

Use `EXAMPLES.md` to select the relevant tasks. RP01 covers connected beliefs and a role/preference difference; RP02–RP05 separate mixed, neutral, uncertain, and limited evidence; RP06 compares the two housing deadlines. All six use the same fictional setting. These are demonstration cases, not sampled political profiles or predicted participant distributions.

## Rebuild and verify

Requires Node 24 and Python 3 with only their standard libraries:

```sh
npm run build:pilot
python3 -m unittest discover -s research/results-pilot -p 'test_*.py'
npm test
npm run build
```

The builder derives every example from the current assessment, result renderer's data model, and interpretation rules. It replaces only `EXAMPLES.md`, `manifest.json`, and `results-pilot-1.0.0.zip` in this folder. The manifest hashes the exact authored inputs; it does not certify comprehension or research readiness. The builder refuses to package an observation template containing data rows.

For the interactive checks, serve the site and run `python3 tests/browser_pilot.py`. Set `POLITICAL_CONTEXT_TEST_URL` to test a packaged project subpath. The checks use synthetic fixtures and disposable browser profiles; automated checks do not supply human pilot observations.
