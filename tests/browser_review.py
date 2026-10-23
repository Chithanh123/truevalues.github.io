"""Exercise the local reviewer worksheet against a served checkout or artifact.

Run: python3 tests/browser_review.py
Optional: POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8012/truevalues.github.io
"""
import copy
import csv
import io
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
ASSESSMENT_KEY = "political-context-session"
NOTES_KEY = "political-context-review-notes"
MARKER = "REVIEW-NOTE-ONLY-7319"
errors, external_requests, failed_requests = [], [], []


def observe(page):
    page.set_default_timeout(10000)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: failed_requests.append(request.url))
    page.on(
        "request",
        lambda request: external_requests.append(request.url)
        if urlsplit(request.url).scheme in {"http", "https"}
        and urlsplit(request.url).netloc != urlsplit(BASE).netloc else None,
    )
    return page


def stored(page, key=NOTES_KEY, store="localStorage"):
    return page.evaluate("([store,key]) => window[store].getItem(key)", [store, key])


def assessment_copies(page):
    return [stored(page, ASSESSMENT_KEY, store) for store in ("sessionStorage", "localStorage")]


def download(page, selector, as_json=True):
    with page.expect_download() as download_info:
        page.locator(selector).click()
    text = Path(download_info.value.path()).read_text(encoding="utf-8-sig")
    return json.loads(text) if as_json else text


def import_notes(page, payload, accept=None):
    raw = payload if isinstance(payload, bytes) else json.dumps(payload).encode()
    page.locator("#review-notes-file").set_input_files(
        {"name": "review-notes.json", "mimeType": "application/json", "buffer": raw}
    )
    if accept is not None:
        expect(page.locator("#review-confirm-dialog")).to_be_visible()
        if accept:
            page.locator("#review-confirm-accept").click()
        else:
            page.locator('[data-review-close="confirm"]').first.click()
        expect(page.locator("#review-confirm-dialog")).not_to_be_visible()


def note_dialog(page, target):
    page.locator(f'[data-review-target="{target}"]').click()
    expect(page.locator("#review-note-dialog")).to_be_visible()
    expect(page.locator("#review-note-target")).to_contain_text(target)


def mobile_fit(page, state):
    page.set_viewport_size({"width": 375, "height": 812})
    widths = page.evaluate(
        "() => ({document:document.documentElement.scrollWidth,viewport:innerWidth})"
    )
    assert widths["document"] <= widths["viewport"] + 1, (state, widths)
    page.set_viewport_size({"width": 1280, "height": 900})


def near_limit_notebook(source):
    """Build a valid compact JSON file just sixteen bytes below the import cap."""
    candidate = copy.deepcopy(source)
    candidate["reviewerCode"] = ""
    template = candidate["entries"][0]
    candidate["entries"] = []
    for number in range(80):
        entry = copy.deepcopy(template)
        entry["id"] = f"boundary-{number}"
        for field, limit in (("observation", 4000), ("proposedChange", 4000), ("resolution", 4000), ("sourceNote", 2000)):
            entry[field] = "x" * limit
        candidate["entries"].append(entry)
    encode = lambda value: json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode()
    budget = 1048576 - 16
    excess = len(encode(candidate)) - budget
    assert excess > 0
    for entry in candidate["entries"]:
        for field in ("resolution", "proposedChange", "sourceNote"):
            removed = min(len(entry[field]), excess)
            if removed:
                entry[field] = entry[field][:-removed]
                excess -= removed
            if not excess:
                break
        if not excess:
            break
    assert excess == 0
    raw = encode(candidate)
    assert len(raw) == budget
    return candidate, raw


def seed_completed_assessment(page):
    """Install a real, validated assessment save; reviews must never touch it."""
    return page.evaluate("""async key => {
        const {instrument} = await import('./js/content.js');
        const {createSession,makeSteps,setAnswer,validateSession} = await import('./js/engine.js');
        let session = createSession(instrument,'review-workbench-browser-assessment');
        const steps = makeSteps(instrument);
        for (const step of steps) {
            if (['statement','foundation'].includes(step.type)) {
                session = setAnswer(session,step.id,{kind:'value',value:1});
            } else if (step.type==='scenario') {
                const item=instrument.scenarios.find(item=>item.id===step.itemId);
                session=setAnswer(session,step.id,{kind:'choice',optionId:item.options[0].id,reasonId:null});
            }
        }
        session.stepIndex=steps.length-1;
        session.completed=true;
        session.saveOnDevice=true;
        if (!validateSession(instrument,session).valid) throw Error('Invalid test fixture');
        const raw=JSON.stringify(session);
        sessionStorage.setItem(key,raw);
        localStorage.setItem(key,raw);
        return instrument;
    }""", ASSESSMENT_KEY)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    page = observe(context.new_page())
    page.goto(BASE + "/review.html", wait_until="networkidle")
    instrument = seed_completed_assessment(page)
    before_assessment = assessment_copies(page)
    expect(page.locator("#review-notes-summary")).to_be_visible()
    expect(page.locator("#review-save-device")).not_to_be_checked()
    assert stored(page) is None
    page.locator("#reviewer-code").fill("reviewer-7319")

    # Browsing a page or changing a filter never documents a review by itself.
    for kind in ("foundations", "lenses", "worlds", "scenarios", "statements"):
        page.locator("#review-kind").select_option(kind)
    empty = download(page, "#review-notes-json")
    assert empty["entries"] == []
    expect(page.locator("#review-notes-summary")).to_contain_text("0 / 133 targets")
    assert assessment_copies(page) == before_assessment

    first = instrument["foundations"]["items"][0]
    target = "foundation:" + first["id"]
    page.locator("#review-kind").select_option("foundations")
    note_dialog(page, target)
    page.locator("#review-note-language").select_option("vi")
    page.locator("#review-note-field").fill("text")
    page.locator("#review-note-criterion").select_option("translation")
    page.locator("#review-note-outcome").select_option("revise")
    page.locator("#review-note-severity").select_option("critical")
    attack = '=1+1\n<img src=x onerror="window.reviewInjected=1"> ' + MARKER
    page.locator("#review-note-observation").fill(attack)
    page.locator("#review-note-proposed-change").fill("Đề nghị làm rõ ý nghĩa của năng lực chủ động.")
    page.locator("#review-note-source-note").fill("@source proposal: verify interpretation before revision")
    mobile_fit(page, "note dialog")
    page.locator("#review-note-save").click()
    expect(page.locator("#review-note-dialog")).not_to_be_visible()
    expect(page.locator("#review-notes-list")).to_contain_text(MARKER)
    assert page.locator("#review-notes-list img").count() == 0
    assert page.evaluate("typeof window.reviewInjected") == "undefined"
    assert stored(page) is None
    first_export = download(page, "#review-notes-json")
    assert first_export["format"] == "political-context-review-notes"
    assert first_export["notesVersion"] == 1
    assert first_export["instrumentVersion"] == instrument["version"]
    assert first_export["reviewerCode"] == "reviewer-7319"
    assert len(first_export["entries"]) == 1
    original_note = first_export["entries"][0]
    assert original_note["targetKey"] == target
    assert original_note["language"] == "vi"
    assert original_note["criterion"] == "translation"
    assert original_note["observation"] == attack
    assert original_note["outcome"] == "revise"
    assert original_note["severity"] == "critical"
    assert "answers" not in first_export and "session" not in first_export

    # Notes retain their own target when view language, filters, and worlds change.
    page.locator("#review-language").select_option("vi")
    page.locator("#review-kind").select_option("scenarios")
    page.locator("#review-world").select_option("namoa")
    scene = instrument["scenarios"][0]
    scenario_target = f"scenario:{scene['id']}:namoa"
    note_dialog(page, scenario_target)
    page.locator("#review-note-language").select_option("both")
    page.locator("#review-note-outcome").select_option("no-issue")
    expect(page.locator("#review-note-severity")).to_have_value("none")
    page.locator("#review-note-save").click()
    second_export = download(page, "#review-notes-json")
    assert len(second_export["entries"]) == 2
    no_issue = next(note for note in second_export["entries"] if note["targetKey"] == scenario_target)
    assert no_issue["outcome"] == "no-issue"
    assert no_issue["severity"] == "none"
    assert second_export["entries"][0] == original_note
    expect(page.locator("#review-notes-summary")).to_contain_text("2 / 133 targets")
    page.locator("#review-world").select_option("alder")
    assert download(page, "#review-notes-json") == second_export
    assert assessment_copies(page) == before_assessment
    mobile_fit(page, "review summary")

    # Editing replaces the matching record while a paired packet stays notes-free.
    page.locator(f'[data-review-edit="{original_note["id"]}"]').click()
    page.locator("#review-note-resolution").fill("Discuss this wording with a bilingual reviewer.")
    page.locator("#review-note-save").click()
    edited = download(page, "#review-notes-json")
    assert len(edited["entries"]) == 2
    changed = next(note for note in edited["entries"] if note["id"] == original_note["id"])
    assert changed["resolution"].startswith("Discuss")
    assert changed["createdAt"] == original_note["createdAt"]
    paired = download(page, "#review-export")
    assert paired["format"] == "political-context-bilingual-review"
    assert MARKER not in json.dumps(paired)
    assert "review-workbench-browser-assessment" not in json.dumps(paired)
    assert "entries" not in paired and "reviewerCode" not in paired
    csv_text = download(page, "#review-notes-csv", as_json=False)
    csv_rows = list(csv.DictReader(io.StringIO(csv_text)))
    assert len(csv_rows) == 2
    for column in ("review_id", "item_id", "language", "target_kind", "target_field", "source_fingerprint", "source_note", "updated_at"):
        assert column in csv_rows[0]
    csv_note = next(row for row in csv_rows if MARKER in row["observation"])
    assert not csv_note["observation"].lstrip().startswith(("=", "+", "-", "@"))
    assert not csv_note["source_note"].lstrip().startswith(("=", "+", "-", "@"))
    assert "Đề nghị" in csv_note["proposed_change"]
    print("PASS: explicit item/world reviews, bilingual fields, filters, editing, safe JSON/CSV and HTML isolation.")

    # Imports preview replacement and cancellation; malformed inputs preserve work.
    import_notes(page, second_export, accept=False)
    assert download(page, "#review-notes-json") == edited
    import_notes(page, second_export, accept=True)
    assert download(page, "#review-notes-json") == second_export
    for invalid in (b"", b"not json", b"{}", b"x" * (1048576 + 1)):
        import_notes(page, invalid)
        expect(page.locator("#review-confirm-dialog")).not_to_be_visible()
        assert download(page, "#review-notes-json") == second_export
    malformed = copy.deepcopy(second_export)
    malformed["entries"][0]["targetKey"] = "foundation:unknown-item"
    import_notes(page, malformed)
    assert download(page, "#review-notes-json") == second_export
    stale_version = copy.deepcopy(second_export)
    stale_version["instrumentVersion"] = "0.0.0"
    import_notes(page, stale_version)
    assert download(page, "#review-notes-json") == second_export

    future = copy.deepcopy(second_export)
    future["entries"][0]["updatedAt"] = "2099-01-01T00:00:00.000Z"
    import_notes(page, future, accept=True)
    page.locator(f'[data-review-edit="{original_note["id"]}"]').click()
    page.locator("#review-note-resolution").fill("Synthetic clock-order regression check.")
    page.locator("#review-note-save").click()
    future_saved = download(page, "#review-notes-json")
    assert future_saved["entries"][0]["updatedAt"] >= future["entries"][0]["updatedAt"]
    import_notes(page, second_export, accept=True)

    stale = copy.deepcopy(second_export)
    stale["entries"][0]["sourceFingerprint"] = "rv1-00000000"
    assert original_note["sourceFingerprint"] != "rv1-00000000"
    import_notes(page, stale, accept=True)
    expect(page.locator("#review-notes-summary")).to_contain_text("1 stale entries")
    expect(page.locator("#review-notes-summary")).to_contain_text("1 / 133 targets")
    page.locator(f'[data-review-edit="{original_note["id"]}"]').click()
    expect(page.locator("#review-note-reconfirm-wrap")).to_be_visible()
    page.locator("#review-note-save").click()
    expect(page.locator("#review-note-dialog")).to_be_visible()
    expect(page.locator("#review-note-error")).not_to_be_empty()
    page.locator("#review-note-reconfirm").check()
    page.locator("#review-note-save").click()
    refreshed = download(page, "#review-notes-json")
    refreshed_note = next(note for note in refreshed["entries"] if note["id"] == original_note["id"])
    assert refreshed_note["sourceFingerprint"] == original_note["sourceFingerprint"]
    expect(page.locator("#review-notes-summary")).to_contain_text("0 stale entries")
    print("PASS: import preview/cancel, malformed and oversized rejection, stale-content reconfirmation.")

    # In-memory notes disappear on reload unless device saving was chosen.
    page.reload(wait_until="networkidle")
    assert download(page, "#review-notes-json")["entries"] == []
    assert stored(page) is None
    import_notes(page, refreshed, accept=True)
    page.locator("#review-save-device").check()
    assert json.loads(stored(page))["entries"] == refreshed["entries"]
    page.reload(wait_until="networkidle")
    expect(page.locator("#review-save-device")).to_be_checked()
    assert download(page, "#review-notes-json") == refreshed
    assert assessment_copies(page) == before_assessment
    page.locator(f'[data-review-delete="{no_issue["id"]}"]').click()
    expect(page.locator("#review-confirm-dialog")).to_be_visible()
    page.locator("#review-confirm-accept").click()
    after_delete = download(page, "#review-notes-json")
    assert len(after_delete["entries"]) == 1
    assert all(note["id"] != no_issue["id"] for note in after_delete["entries"])
    assert json.loads(stored(page))["entries"] == after_delete["entries"]
    page.locator("#review-notes-clear").click()
    expect(page.locator("#review-confirm-dialog")).to_be_visible()
    page.locator("#review-confirm-accept").click()
    assert download(page, "#review-notes-json")["entries"] == []
    assert stored(page) is None
    assert assessment_copies(page) == before_assessment
    print("PASS: default memory scope, opt-in device persistence, deletion and isolated erasure.")

    # Source links remain ordinary deliberate links: browsing never fetches them.
    page.locator("#review-kind").select_option("foundations")
    source_links = page.locator('[data-evidence-item] a[href^="https://"]')
    assert source_links.count() > 0
    for link in source_links.all():
        assert link.get_attribute("target") == "_blank"
        rel = (link.get_attribute("rel") or "").split()
        assert "noopener" in rel and "noreferrer" in rel
    mobile_fit(page, "foundation evidence")

    # A participant response export includes only their assessment, never reviews.
    import_notes(page, refreshed, accept=True)
    page.locator("#review-save-device").check()
    page.goto(BASE + "/", wait_until="networkidle")
    page.locator('[data-action="resume"]').click()
    response = download(page, '[data-action="export"]')
    assert response["format"] == "political-context-response-export"
    assert MARKER not in json.dumps(response)
    assert "reviewerCode" not in response and "entries" not in response
    assert response["session"]["version"] == "0.4.0"
    assert len(response["session"]["answers"]) == 49
    assert assessment_copies(page) == before_assessment
    print("PASS: evidence links avoid implicit requests; participant storage and exports stay separate.")
    context.close()

    # Storage denial leaves a useful, exportable in-memory review rather than crashing.
    denied = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    denied.add_init_script("""(() => {
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key,value) {
            if (key==='political-context-review-notes') throw new DOMException('Denied','SecurityError');
            return original.call(this,key,value);
        };
    })();""")
    denied_page = observe(denied.new_page())
    denied_page.goto(BASE + "/review.html", wait_until="networkidle")
    import_notes(denied_page, first_export, accept=True)
    denied_page.locator("#review-save-device").check()
    expect(denied_page.locator("#review-notes-status")).to_contain_text(
        re.compile(r"storage|save|device|could not", re.I)
    )
    assert stored(denied_page) is None
    assert download(denied_page, "#review-notes-json")["entries"] == first_export["entries"]
    denied.close()

    # An incompatible saved notebook stays recoverable until an explicit clear.
    recovery_context = browser.new_context(accept_downloads=True)
    recovery_page = observe(recovery_context.new_page())
    recovery_page.goto(BASE + "/review.html", wait_until="networkidle")
    seed_completed_assessment(recovery_page)
    recovery_assessment = assessment_copies(recovery_page)
    older_notes = copy.deepcopy(first_export)
    older_notes["instrumentVersion"] = "0.0.0"
    older_raw = json.dumps(older_notes)
    recovery_page.evaluate("([key,raw]) => localStorage.setItem(key,raw)", [NOTES_KEY, older_raw])
    recovery_page.reload(wait_until="networkidle")
    expect(recovery_page.locator("#review-notes-recover")).to_be_visible()
    expect(recovery_page.locator("#review-save-device")).to_be_disabled()
    assert download(recovery_page, "#review-notes-recover") == older_notes
    assert download(recovery_page, "#review-notes-json")["entries"] == []
    import_notes(recovery_page, first_export, accept=True)
    assert stored(recovery_page) == older_raw
    assert download(recovery_page, "#review-notes-json")["entries"] == first_export["entries"]
    recovery_page.locator("#review-notes-clear").click()
    recovery_page.locator('[data-review-close="confirm"]').first.click()
    assert stored(recovery_page) == older_raw
    recovery_page.locator("#review-notes-clear").click()
    recovery_page.locator("#review-confirm-accept").click()
    assert stored(recovery_page) is None
    expect(recovery_page.locator("#review-save-device")).to_be_enabled()
    assert assessment_copies(recovery_page) == recovery_assessment
    recovery_context.close()
    print("PASS: incompatible saved notes stay recoverable and protected until explicit erasure.")

    # A near-limit file must export in a form that can actually be imported again.
    boundary_context = browser.new_context(accept_downloads=True)
    boundary_page = observe(boundary_context.new_page())
    boundary_page.goto(BASE + "/review.html", wait_until="networkidle")
    near_limit, near_raw = near_limit_notebook(first_export)
    import_notes(boundary_page, near_raw, accept=True)
    exported_raw = download(boundary_page, "#review-notes-json", as_json=False).encode()
    assert len(exported_raw) <= 1048576
    assert json.loads(exported_raw) == near_limit
    import_notes(boundary_page, exported_raw, accept=True)
    boundary_page.locator("#reviewer-code").fill("r" * 120)
    expect(boundary_page.locator("#reviewer-code")).to_have_value("")
    expect(boundary_page.locator("#review-notes-status")).to_contain_text("was not changed")
    assert download(boundary_page, "#review-notes-json") == near_limit
    boundary_context.close()
    print("PASS: critical severity, monotonic edit timestamps, near-1-MiB round trips and reviewer-code rollback.")
    browser.close()

assert not errors, errors
assert not external_requests, external_requests
assert not failed_requests, failed_requests
print("PASS: storage failure recovery, mobile layout, and no JavaScript errors or external/failed requests.")
