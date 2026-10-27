# Publish Political Context

The recommended host for this repository is GitHub Pages. It can serve the complete assessment over HTTPS without an application server, database, paid hosting service, or additional secret.

The expected project-site address for `Chithanh123/truevalues.github.io` is:

**https://chithanh123.github.io/truevalues.github.io/**

This is the expected address, not a claim that the current local changes are already live. A custom domain or a different repository owner would change it.

## One-time GitHub setup

1. Open the repository's **Settings → Pages**. Under **Build and deployment**, choose **GitHub Actions** as the source. If this setting is unavailable, ask a repository administrator to enable it.
2. Review and merge the prepared feature branch into `master` through a pull request **inside `Chithanh123/truevalues.github.io`**. Verify that both the base repository and head repository show `Chithanh123/truevalues.github.io`; the base branch is `master`. The current branch is `research/ideological-foundations`, with application release `0.4.4` adding the isolated synthetic-results workspace and comprehension-pilot kit to the earlier interpretation-first report. The earlier bilingual and `0.4.1` reviewer-tooling work was integrated into this fork through pull request #3. Participant instrument `0.4.0`, its scores, and compatible saves remain unchanged by the report update. Use an explicit comparison within this fork rather than accepting GitHub's upstream-fork default. The merge starts the publishing workflow automatically.
3. To publish again manually, open **Actions → Deploy Political Context to GitHub Pages**, choose **Run workflow**, select `master`, and run it.
4. Wait for both the build and deploy jobs to succeed. The deployment's `github-pages` environment reports the actual published URL. Open that URL over HTTPS and complete a short assessment check.

If the first automatic deployment fails because Pages was not enabled yet, complete step 1 and rerun the workflow. Do not add a personal access token: the workflow uses GitHub's built-in deployment token and explicitly scoped permissions.

The workflow validates content, runs the Node tests, creates a clean `dist/` directory, and uploads only that static artifact. Pull requests run validation and packaging tests without publishing. Deployment is restricted to `master`.

The build does not require `npm install`, third-party build dependencies, or environment variables. The committed pilot kit is checked by the Node test suite for source freshness and a blank public observation template. After changing its source modules or authored pilot documents, run `npm run build:pilot` (Python 3 and Node 24) before testing and committing the refreshed generated files. Browser tests are exercised locally; the Pages workflow runs the dependency-free content, engine, and artifact tests.

Both jobs use `ubuntu-24.04` explicitly to avoid automatic operating-system changes from `ubuntu-latest`. The workflow uses Node 24 for project commands and action versions with Node 24 runtimes: checkout/setup-node `v6`, configure-pages `v6`, and deploy-pages `v5`. Upload-pages-artifact `v5` uses a Node 24 artifact uploader. An action's internal runtime is separate from the `node-version` used for the project.

## Build and inspect the exact artifact

From the repository root:

```sh
npm run validate:content
npm run validate:translations
npm run validate:evidence
npm test
npm run build
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

The deployment directory contains the current HTML entry points, CSS, authored JavaScript modules (including the debrief model, theme map, interpretation rules and meanings, and renderer), the SVG mark, the bilingual review workspace and local worksheet model, foundation framework and source proposals, draft translations, authored research/review documents, the license, and `.nojekyll`. Release `0.4.4` has 45 allowlisted files, including the synthetic example workspace and its authored pilot documents/download bundle. The observation template is header-only; real observations must stay outside this public checkout. It excludes Git metadata, tests, tools, unused legacy assets, the author research database, and browser-generated responses. Rebuilding replaces the generated artifact. `dist/` is ignored by Git.

All site assets and module imports use relative paths. The packaged site is tested under the repository subpath `/truevalues.github.io/`, not only at a server root. Legacy quiz URLs redirect back to the new assessment within that same subpath.

For another static host, upload the **contents** of `dist/` so that its `index.html` becomes the site's entry point. A ZIP of that directory is suitable for hosts with a drag-and-drop static deployment feature. Select HTTPS and avoid adding a rewrite that returns HTML for JavaScript requests.

## Check after publication

- The homepage loads its styling and method/privacy dialogs without exposing real-country correspondences.
- Begin an assessment, answer a statement, reload, and resume.
- Continue through value and foundation items, a setting briefing, and a contextual decision; verify its institutional note without an explicit real-country correspondence.
- Finish the remaining items and confirm that the debrief begins with interpretations supported by recorded answers, followed by seven theme headlines and explanations. Use an evidence link to open the full response record and focus the supporting answer. Selected-package meanings should preserve the actual tradeoffs and show only a selected reason as the participant's justification.
- Confirm that an all-skipped or neutral test route gets appropriate missing/neutral evidence wording rather than an invented political position. Knowledge and care/ecology should identify their missing scenario coverage. Role/preference comparisons should require both selected packages, and the housing comparison should retain its fixed-order limitation. The original four profiles should remain in a collapsed optional view.
- Confirm the final setting reveal, download the readable text report and original JSON response record, and inspect the print preview. Text and print should contain the interpretations and supporting answers. The print layout expands the theme records and omits duplicate detail views; closing the dialog restores the on-screen expansion state. Use the browser's PDF destination if available. These actions should not change the saved answers or original JSON scores.
- Open `results-pilot.html` through the author-review workspace, select a generic example and open it. Confirm its synthetic label, evidence navigation, separate facilitator key, downloadable text, and blank observation log. This page must leave existing quiz and reviewer saves untouched.
- Inspect the separate author-review workspace; its country-correspondence spoiler notice, bilingual foundation material, and explicitly unverified source proposals should be present.
- Record a reviewer observation, check that it survives a content-filter change, and export the notes separately from the paired authored packet. Test optional device saving and clearing without altering participant progress. A browser-only draft is not published with the site.
- Open one of the old `quiz.html` or `results.html` paths and confirm it redirects within the project site.
- Use **Erase my answers** to remove the test data from the current tab and saved device copy.

The site processes answers in the browser. GitHub Pages does not collect submitted assessment records because this application has no submission endpoint. Optional device saves and downloaded exports remain under the participant's control. Hosting can still maintain ordinary request logs. Public hosting does not make the instrument validated or ready for research recruitment; see `RESEARCH.md` and `PILOT-GUIDE.md`.

## Troubleshooting

- **Pages setting or workflow missing:** check repository administration access, the `master` source branch, and whether GitHub Actions is enabled for the repository.
- **No Pages deployment created:** select GitHub Actions as the Pages source, then run the workflow on `master`.
- **JavaScript 404 or MIME-type error:** deploy the entire generated artifact, preserve `js/`, and keep the project prefix in the URL.
- **The old site still appears:** inspect the latest workflow's commit and deployment URL, then reload after the deployment completes. Building locally does not update the public site.
- **Node 20 deprecation or `ubuntu-latest` migration annotations:** these annotations do not by themselves indicate a failed deployment. Merge the updated workflow and start a new run on `master`; rerunning an older workflow uses its older definitions, and historical annotations remain visible.
- **An older save is rejected:** assessment versions are deliberately checked. Use the previous-save download offered by the app before beginning a fresh assessment.

Cloud environment publication and website deployment are separate operations. Publishing a Codex environment preserves the development machine; GitHub Pages publishes the web artifact through the repository workflow.
