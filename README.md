# Political Context

A research-first political assessment prototype built from the 8values static-site fork. Participants answer value statements, take decisions within fictional political settings, and receive a debrief that separates stated values from choices under constraints.

Current instrument version: **0.2.0**. The assessment is experimental. Its four domains and scoring rubric are candidate measures, not validated ideological scales. It does not assign a definitive ideology, population percentile, or a “hypocrisy” score. See [the research notes](docs/RESEARCH.md) for construct definitions, scoring assumptions, confounds, and the work required before recruiting research participants.

## Run locally

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
- Eight fictional settings inspired by the United States, United Kingdom, Germany, Japan, Fiji, Viet Nam, India, and Central African Republic. Each route uses one randomly assigned setting with its own institutional brief and scenario notes.
- Eight main scenarios covering urban and rural life: seven provisionally scored and one descriptive public-records exercise. Each route includes ordinary constituents, civil society leaders, non-elected public servants/local officials, local leaders, and national leaders.
- One matched housing scenario that changes the urgency of school repairs while retaining the other decision assumptions.
- Role descriptions, institutional limits, optional context, three feasible actions per scenario, and separate unscored reasons.
- Separate statement and scenario summaries, response evidence, coverage, and a descriptive comparison of the two housing choices.

Uncertain, skipped, and unrepresented answers are excluded from numerical summaries rather than treated as centrist responses. The repeated housing scenario is excluded from the main scenario profile so it does not receive extra weight. The public-records exercise is also excluded from all domain scores and their denominators; its choices and reasons remain visible. It concerns transparency and staff capacity, which have not been established as a civil-rights measure.

The expanded content is an author draft. The shared anchor cases and world-specific notes support review; they do not create a formal balanced experiment or validate cross-setting comparisons. External review, cognitive interviews, a completed literature review, and empirical validation remain outstanding.

Use **Explore the settings** to inspect the authored worlds and **Download review packet** for instrument/review metadata without participant responses. The [cognitive pilot guide](docs/PILOT-GUIDE.md) provides neutral interview prompts, reviewer criteria, decision gates, and an [empty review-log template](docs/review-log-template.csv). No independent human content reviews, interviews, or participant findings are claimed. AI-assisted technical review and automated checks are development work, rather than evidence of human review.

## Progress, privacy, and exports

Answers are processed in the browser. The application has no analytics, advertising, research submission endpoint, or automatic transmission of responses.

Progress is kept for the current browser session. Persistent on-device saving is optional and uses local storage; it is not an account or cloud backup. A shared browser profile can expose a saved session to other users. The application provides controls to erase this tab's answers and the saved device copy. Other open tabs may retain separate copies.

An exported response record is a voluntary local download containing sensitive political responses, reasons, assigned setting, and the instrument version. The participant controls whether to share that file. The review-packet download contains authored content and metadata instead of responses. Erasing browser data cannot erase copies already downloaded or shared.

Static hosting can maintain ordinary access logs independently of this application. Formal research collection would require a separate consented workflow and a review of hosting, access controls, retention, and deletion practices. There is no research data collection service in this prototype.

## Check the implementation

Use a current Node.js release with the built-in test runner:

```sh
npm run validate:content
npm test
```

The coverage command reports authored settings, roles, localities, and domain/item counts. The tests check content structure, session validation, assignment, response replacement, scoring direction, missing evidence, and the exclusion of comparison and descriptive-only scenarios from aggregate scores. These technical checks do not establish measurement validity. No npm dependency installation is needed.

Browser smoke tests additionally require Python, the Python Playwright package, and Chromium. These are already available in the prepared development environment; they are optional development tools and are not required to use the application.

With the local server running in a separate terminal:

```sh
python3 tests/browser_smoke.py
```

The browser checks exercise the participant journey, results, saved progress, and responsive presentation. Consult the test script for its server and browser configuration when running on another machine.

## Code layout

| Location | Purpose |
| --- | --- |
| HTML entry points and `style.css` | Participant interface, assessment navigation, and responsive presentation |
| `js/content.js` | Versioned statement bank, scenarios, options, and candidate rubrics |
| `js/worlds.js` | Eight fictional setting briefs and scenario-specific institutional notes |
| `js/engine.js` | Assignment, assessment steps, immutable response updates, validation, and separate summaries |
| `scripts/validate-content.js` | Authored-content structure and coverage report |
| `tests/engine.test.js` | Node tests for content and assessment logic |
| `tests/browser_smoke.py` | Browser checks using Python Playwright and Chromium |
| `docs/RESEARCH.md` | Research questions, candidate outcomes, rubric, confounds, privacy, and version history |
| `docs/PILOT-GUIDE.md` | Cognitive interview plan, content-review rubric, prerequisites, and decision gates |
| `docs/review-log-template.csv` | Header-only issue log; no invented observations or participant records |
| `LICENSE` | MIT license and original 8values attribution |

Use stable content IDs and update the instrument version when changing wording, assumptions, or scoring. Saves from `0.1.0` are deliberately rejected by `0.2.0`; there is no silent migration. Starting a new assessment can replace the older browser save, while existing exported files retain their original version for interpretation. New scenarios should document the player's actual authority, viable alternatives, relevant facts, and which conclusions the choice cannot support.

## Attribution

This project builds on [8values](https://github.com/8values/8values.github.io). The original MIT copyright and permission notice are retained in [LICENSE](LICENSE).
