# Publish Political Context

The recommended host for this repository is GitHub Pages. It can serve the complete assessment over HTTPS without an application server, database, paid hosting service, or additional secret.

The expected project-site address for `Chithanh123/truevalues.github.io` is:

**https://chithanh123.github.io/truevalues.github.io/**

This is the expected address, not a claim that the current local changes are already live. A custom domain or a different repository owner would change it.

## One-time GitHub setup

1. Open the repository's **Settings → Pages**. Under **Build and deployment**, choose **GitHub Actions** as the source. If this setting is unavailable, ask a repository administrator to enable it.
2. Review and merge the prepared feature branch into `master` through a pull request **inside `Chithanh123/truevalues.github.io`**. Verify that both the base repository and head repository show `Chithanh123/truevalues.github.io`; the base branch is `master`. The current v0.4 branch is `research/ideological-foundations`, which includes the earlier `research/bilingual-pilot` work. Use an explicit comparison within this fork rather than accepting GitHub's upstream-fork default. The merge starts the publishing workflow automatically.
3. To publish again manually, open **Actions → Deploy Political Context to GitHub Pages**, choose **Run workflow**, select `master`, and run it.
4. Wait for both the build and deploy jobs to succeed. The deployment's `github-pages` environment reports the actual published URL. Open that URL over HTTPS and complete a short assessment check.

If the first automatic deployment fails because Pages was not enabled yet, complete step 1 and rerun the workflow. Do not add a personal access token: the workflow uses GitHub's built-in deployment token and explicitly scoped permissions.

The workflow validates content, runs the Node tests, creates a clean `dist/` directory, and uploads only that static artifact. Pull requests run validation and packaging tests without publishing. Deployment is restricted to `master`.

The build does not require `npm install`, third-party build dependencies, or environment variables. Browser tests are exercised locally; the Pages workflow runs the dependency-free content, engine, and artifact tests.

## Build and inspect the exact artifact

From the repository root:

```sh
npm run validate:content
npm run validate:translations
npm test
npm run build
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

The deployment directory contains the current HTML entry points, CSS, authored JavaScript modules, the SVG mark, the bilingual review workspace, foundation framework, draft translations, authored research/review documents, the license, and `.nojekyll`. It excludes Git metadata, tests, tools, unused legacy assets, and browser-generated responses. Rebuilding replaces the generated artifact. `dist/` is ignored by Git.

All site assets and module imports use relative paths. The packaged site is tested under the repository subpath `/truevalues.github.io/`, not only at a server root. Legacy quiz URLs redirect back to the new assessment within that same subpath.

For another static host, upload the **contents** of `dist/` so that its `index.html` becomes the site's entry point. A ZIP of that directory is suitable for hosts with a drag-and-drop static deployment feature. Select HTTPS and avoid adding a rewrite that returns HTML for JavaScript requests.

## Check after publication

- The homepage loads its styling and method/privacy dialogs without exposing real-country correspondences.
- Begin an assessment, answer a statement, reload, and resume.
- Continue through value and foundation items, a setting briefing, and a contextual decision; verify its institutional note without an explicit real-country correspondence.
- Finish or skip through the remaining items and confirm that the debrief reveals the assigned country inspiration, records foundation answers separately, and offers local export.
- Inspect the separate author-review workspace; its country-correspondence spoiler notice and bilingual foundation material should be present.
- Open one of the old `quiz.html` or `results.html` paths and confirm it redirects within the project site.
- Use **Erase my answers** to remove the test data from the current tab and saved device copy.

The site processes answers in the browser. GitHub Pages does not collect submitted assessment records because this application has no submission endpoint. Optional device saves and downloaded exports remain under the participant's control. Hosting can still maintain ordinary request logs. Public hosting does not make the instrument validated or ready for research recruitment; see `RESEARCH.md` and `PILOT-GUIDE.md`.

## Troubleshooting

- **Pages setting or workflow missing:** check repository administration access, the `master` source branch, and whether GitHub Actions is enabled for the repository.
- **No Pages deployment created:** select GitHub Actions as the Pages source, then run the workflow on `master`.
- **JavaScript 404 or MIME-type error:** deploy the entire generated artifact, preserve `js/`, and keep the project prefix in the URL.
- **The old site still appears:** inspect the latest workflow's commit and deployment URL, then reload after the deployment completes. Building locally does not update the public site.
- **An older save is rejected:** assessment versions are deliberately checked. Use the previous-save download offered by the app before beginning a fresh assessment.

Cloud environment publication and website deployment are separate operations. Publishing a Codex environment preserves the development machine; GitHub Pages publishes the web artifact through the repository workflow.
