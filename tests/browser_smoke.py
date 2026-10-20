"""Run against the locally served checkout: python3 tests/browser_smoke.py."""
import json
import math
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
KEY = "political-context-session"
errors, external_requests, failed_requests = [], [], []


def observe(page):
    page.set_default_timeout(10000)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on(
        "request",
        lambda request: external_requests.append(request.url)
        if urlsplit(request.url).scheme in {"http", "https"}
        and urlsplit(request.url).netloc != urlsplit(BASE).netloc else None,
    )
    page.on("requestfailed", lambda request: failed_requests.append(request.url))
    return page


def saved(page, store="sessionStorage"):
    return page.evaluate(
        "([store, key]) => JSON.parse(window[store].getItem(key))", [store, KEY]
    )


def action(page, name):
    if name == "close-dialog":
        page.get_by_role("button", name="Close dialog", exact=True).click()
    elif name in {"worlds", "review"}:
        page.locator(f'[data-action="{name}"]:visible').first.click()
    elif name == "packet":
        page.locator('#info-dialog [data-action="packet"]').click()
    else:
        page.locator(f'[data-action="{name}"]').click()


def mobile_fit(page, state):
    page.set_viewport_size({"width": 375, "height": 812})
    dimensions = page.evaluate(
        "() => ({document: document.documentElement.scrollWidth, viewport: innerWidth})"
    )
    assert dimensions["document"] <= dimensions["viewport"] + 1, (state, dimensions)
    page.set_viewport_size({"width": 1280, "height": 900})


def begin(page):
    page.goto(BASE + "/", wait_until="networkidle")
    action(page, "begin")
    expect(page.locator("#info-dialog")).to_be_visible()
    action(page, "start")
    expect(page.locator('input[data-response="value"]')).to_have_count(5)


def choose(page, kind, value=None):
    selector = f'input[data-response="{kind}"]'
    if value is not None:
        selector += f'[value="{value}"]'
    page.locator(selector).check()


def validate_export(payload, instrument):
    assert payload["format"] == "political-context-response-export"
    assert payload["exportVersion"] == 1
    session = payload["session"]
    assert session["completed"] is True
    assert session["version"] == instrument["version"]
    assert session["worldId"] in {world["id"] for world in instrument["worlds"]}
    expected_ids = {f"statement:{item['id']}" for item in instrument["statements"]}
    expected_ids |= {f"scenario:{item['id']}" for item in instrument["scenarios"]}
    assert set(session["answers"]) == expected_ids
    assert len(expected_ids) == len(instrument["statements"]) + len(instrument["scenarios"])
    for scene in instrument["scenarios"]:
        assert payload["presentedOptionOrder"][scene["id"]] == [
            option["id"] for option in scene["options"]
        ]
    for result in payload["summary"]["dimensions"]:
        statement_values, scenario_values = [], []
        for item in instrument["statements"]:
            answer = session["answers"][f"statement:{item['id']}"]
            if item["dimension"] == result["id"] and answer["kind"] == "value":
                statement_values.append(answer["value"] * item["direction"])
        for item in instrument["scenarios"]:
            answer = session["answers"][f"scenario:{item['id']}"]
            if (item["dimension"] == result["id"] and not item.get("comparisonOf")
                    and item.get("scoring") != "descriptive"):
                if answer["kind"] == "choice":
                    scenario_values.append(next(
                        option["score"] for option in item["options"]
                        if option["id"] == answer["optionId"]
                    ))
        expected_main_total = sum(
            item["dimension"] == result["id"]
            and not item.get("comparisonOf")
            and item.get("scoring") != "descriptive"
            for item in instrument["scenarios"]
        )
        assert result["scenarios"]["total"] == expected_main_total
        if result["id"] == "civil":
            assert result["scenarios"]["total"] == 1
        for group, values in [("statements", statement_values), ("scenarios", scenario_values)]:
            assert result[group]["count"] == len(values)
            if values:
                assert math.isclose(result[group]["mean"], sum(values) / len(values))
            else:
                assert result[group]["mean"] is None


def review_packet(page, instrument, current_session=None):
    """Review exports contain instrument metadata and never the viewer's answers."""
    before_session = saved(page)
    before_device = saved(page, "localStorage")
    if not page.locator('[data-action="worlds"]:visible').count():
        action(page, "home")
    action(page, "worlds")
    expect(page.locator("#info-dialog")).to_be_visible()
    for world in instrument["worlds"]:
        expect(page.locator("#dialog-content")).to_contain_text(world["name"])
    mobile_fit(page, "world directory dialog")
    action(page, "close-dialog")
    action(page, "review")
    expect(page.locator("#info-dialog")).to_be_visible()
    mobile_fit(page, "review dialog")
    with page.expect_download() as download_info:
        action(page, "packet")
    payload = json.loads(Path(download_info.value.path()).read_text())
    assert payload["format"] == "political-context-review-packet"
    assert payload["packetVersion"] == 1
    assert payload["reviewStatus"] == "author-draft"
    assert payload["instrument"] == instrument
    assert "coverage" in payload
    assert not {"session", "answers", "responses"}.intersection(payload)
    if current_session:
        assert current_session["seed"] not in json.dumps(payload)
    action(page, "close-dialog")
    assert saved(page) == before_session
    assert saved(page, "localStorage") == before_device


def seed_world_at_briefing(page, world_id):
    """Use a valid assignment and answered baseline, then exercise the real scenario UI."""
    result = page.evaluate(
        """async ([key, worldId]) => {
            const {instrument} = await import('./js/content.js');
            const {createSession,setAnswer,validateSession} = await import('./js/engine.js');
            let session;
            for (let index=0; index<10000; index++) {
                const candidate = createSession(instrument, `browser-world-${index}`);
                if (candidate.worldId === worldId) { session=candidate; break; }
            }
            if (!session) throw new Error(`No seed found for ${worldId}`);
            for (const item of instrument.statements) {
                session=setAnswer(session, `statement:${item.id}`, {kind:'value', value:0});
            }
            session.stepIndex=instrument.statements.length;
            if (!validateSession(instrument,session).valid) throw new Error('Invalid seeded route');
            sessionStorage.setItem(key,JSON.stringify(session));
            return session;
        }""", [KEY, world_id]
    )
    page.reload(wait_until="networkidle")
    return result


with urlopen(BASE + "/", timeout=10) as response:
    assert response.status == 200

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path="/usr/bin/chromium", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    page = observe(context.new_page())
    page.goto(BASE + "/", wait_until="networkidle")
    expect(page.locator("#hero-title")).to_contain_text("Your values.")
    mobile_fit(page, "home")
    instrument = page.evaluate("async () => (await import('./js/content.js')).instrument")
    review_packet(page, instrument)
    assert saved(page) is None
    assert saved(page, "localStorage") is None
    begin(page)
    mobile_fit(page, "statement")
    expect(page.locator('[data-action="next"]')).to_be_disabled()
    first_radio = page.locator('input[data-response="value"]').first
    first_radio.focus()
    first_radio.press("ArrowDown")
    expect(page.locator('input[data-response="value"][value="1"]')).to_be_checked()
    expect(page.locator('[data-action="next"]')).to_be_enabled()
    choose(page, "value", 2)
    action(page, "next")
    action(page, "back")
    expect(page.locator('input[data-response="value"][value="2"]')).to_be_checked()
    choose(page, "value", -2)
    action(page, "next")
    first_id = instrument["statements"][0]["id"]
    assert saved(page)["answers"][f"statement:{first_id}"] == {"kind": "value", "value": -2}
    assert saved(page, "localStorage") is None
    before_reload = saved(page)
    page.reload(wait_until="networkidle")
    action(page, "resume")
    assert saved(page) == before_reload
    for number, item in enumerate(instrument["statements"][1:], 1):
        expect(page.locator("#step-title")).to_have_text(item["text"])
        if number == 1:
            choose(page, "uncertain")
        elif number == 2:
            action(page, "skip")
            continue
        else:
            choose(page, "value", [-1, 0, 1][number % 3])
        action(page, "next")
    expect(page.locator(".world-brief")).to_be_visible()
    mobile_fit(page, "world briefing")
    action(page, "next")
    for number, scene in enumerate(instrument["scenarios"]):
        expect(page.locator("#step-title")).to_have_text(scene["title"])
        mobile_fit(page, f"scenario {number + 1}")
        if number == 1:
            choose(page, "none")
            expect(page.locator("#reason")).to_be_disabled()
        elif number == 2:
            choose(page, "uncertain")
            expect(page.locator("#reason")).to_be_disabled()
        else:
            option = scene["options"][0 if number == 0 else -1]
            choose(page, "choice", option["id"])
            page.locator("#reason").select_option(scene["reasons"][0]["id"])
        action(page, "next")
    expect(page).to_have_title("Your debrief — Political Context")
    expect(page.locator(".dimension-row")).to_have_count(len(instrument["dimensions"]))
    expect(page.locator(".comparison-card")).to_contain_text("You chose a different action")
    mobile_fit(page, "debrief")
    assert saved(page, "localStorage") is None
    with page.expect_download() as download_info:
        action(page, "export")
    download = download_info.value
    payload = json.loads(Path(download.path()).read_text())
    validate_export(payload, instrument)
    assert payload["summary"]["comparisons"][0]["changed"] is True
    assert payload["session"]["answers"]["scenario:public-assembly"]["kind"] == "none"
    assert payload["session"]["answers"]["scenario:water-partnership"]["kind"] == "uncertain"
    records = next(scene for scene in instrument["scenarios"] if scene["id"] == "public-records")
    assert records["scoring"] == "descriptive"
    assert all(option["score"] is None for option in records["options"])
    records_answer = payload["session"]["answers"]["scenario:public-records"]
    assert records_answer["kind"] == "choice"
    records_details = page.locator(".evidence-section details").filter(
        has=page.locator("summary", has_text=records["title"])
    )
    records_details.locator("summary").click()
    expect(records_details.locator(".evidence-body")).to_contain_text(next(
        option["label"] for option in records["options"]
        if option["id"] == records_answer["optionId"]
    ))
    page.reload(wait_until="networkidle")
    action(page, "resume")
    expect(page).to_have_title("Your debrief — Political Context")
    before_packet = saved(page)
    review_packet(page, instrument, current_session=before_packet)
    assert saved(page) == before_packet
    print("PASS: complete assessment, keyboard controls, Back replacement, uncertainty/skip/none, reasons, export, reload.")

    action(page, "privacy")
    mobile_fit(page, "data dialog")
    page.locator('#info-dialog input[data-setting="save"]').check()
    assert saved(page, "localStorage")["completed"] is True
    action(page, "close-dialog")
    second_tab = observe(context.new_page())
    second_tab.goto(BASE + "/", wait_until="networkidle")
    action(second_tab, "resume")
    expect(second_tab).to_have_title("Your debrief — Political Context")
    action(second_tab, "erase")
    action(second_tab, "confirm-erase")
    assert saved(second_tab) is None
    assert saved(second_tab, "localStorage") is None
    expect(second_tab.locator('[data-action="begin"]')).to_be_visible()
    second_tab.close()
    context.close()
    print("PASS: opt-in device storage, fresh-tab restore, erase removes both stores.")

    recovery = browser.new_context()
    recovery_page = observe(recovery.new_page())
    recovery_page.goto(BASE + "/", wait_until="networkidle")
    recovery_page.evaluate("key => sessionStorage.setItem(key, '{bad JSON')", KEY)
    recovery_page.reload(wait_until="networkidle")
    expect(recovery_page.locator("#storage-warning")).to_be_visible()
    expect(recovery_page.locator('[data-action="begin"]')).to_be_visible()
    action(recovery_page, "begin")
    action(recovery_page, "start")
    expect(recovery_page.locator("#step-title")).to_have_text(instrument["statements"][0]["text"])
    stale = saved(recovery_page)
    stale["version"] = "0.1.0"
    assert stale["version"] != instrument["version"]
    recovery_page.evaluate(
        "([key, data]) => sessionStorage.setItem(key, JSON.stringify(data))", [KEY, stale]
    )
    recovery_page.reload(wait_until="networkidle")
    expect(recovery_page.locator("#storage-warning")).to_contain_text("version changed")
    with recovery_page.expect_download() as recovery_download:
        action(recovery_page, "recover-save")
    recovered = json.loads(Path(recovery_download.value.path()).read_text())
    assert recovered["format"] == "political-context-save-recovery"
    assert json.loads(recovered["previousSave"]) == stale
    assert saved(recovery_page) == stale
    action(recovery_page, "privacy")
    action(recovery_page, "erase")
    action(recovery_page, "confirm-erase")
    assert saved(recovery_page) is None
    for legacy in ["instructions.html", "quiz.html", "results.html"]:
        recovery_page.goto(BASE + "/" + legacy)
        recovery_page.wait_for_url(BASE + "/")
        expect(recovery_page.locator("#hero-title")).to_be_visible()
    recovery.close()
    print("PASS: malformed/stale saves recover safely; previous-version save downloads intact; legacy pages redirect.")
    for world in instrument["worlds"]:
        world_context = browser.new_context(viewport={"width": 1280, "height": 900})
        world_page = observe(world_context.new_page())
        world_page.goto(BASE + "/", wait_until="networkidle")
        assigned = seed_world_at_briefing(world_page, world["id"])
        assert assigned["worldId"] == world["id"]
        action(world_page, "resume")
        expect(world_page.locator(".world-brief")).to_contain_text(world["name"])
        expect(world_page.locator(".institution-grid > div")).to_have_count(len(world["institutions"]))
        mobile_fit(world_page, f"{world['id']} briefing")
        action(world_page, "next")
        seen_roles = set()
        for number, scene in enumerate(instrument["scenarios"]):
            expect(world_page.locator("#step-title")).to_have_text(scene["title"])
            seen_roles.add(scene["role"])
            if scene.get("scoring") == "descriptive":
                expect(world_page.locator(".step-tag")).to_have_text("Exploratory decision")
            note = world["scenarioNotes"][scene["id"]]
            details = world_page.locator(".context-details")
            expect(details).to_have_count(1)
            details.locator("summary").click()
            expect(details.locator("p")).to_be_visible()
            expect(details.locator("p")).to_have_text(note)
            if scene["role"] in {"civil_society", "public_servant", "national_leader"}:
                mobile_fit(world_page, f"{world['id']} {scene['role']}")
            option = scene["options"][-1 if scene.get("comparisonOf") else number % len(scene["options"])]
            choose(world_page, "choice", option["id"])
            world_page.locator("#reason").select_option(scene["reasons"][number % len(scene["reasons"])]["id"])
            action(world_page, "next")
        assert seen_roles == {role["id"] for role in instrument["roles"]}
        expect(world_page).to_have_title("Your debrief — Political Context")
        expect(world_page.locator(".result-meta")).to_contain_text(world["name"])
        completed = saved(world_page)
        assert completed["completed"] is True
        assert completed["worldId"] == world["id"]
        assert len(completed["answers"]) == len(instrument["statements"]) + len(instrument["scenarios"])
        world_context.close()
    print(f"PASS: all {len(instrument['worlds'])} worlds complete their routes, all roles, and institutional notes.")
    browser.close()

    # A real browser-profile restart verifies localStorage outlives the browser process.
    with TemporaryDirectory(prefix="political-context-browser-") as profile:
        persistent = playwright.chromium.launch_persistent_context(
            profile, executable_path="/usr/bin/chromium", headless=True
        )
        stored_page = observe(persistent.pages[0])
        begin(stored_page)
        choose(stored_page, "value", 1)
        action(stored_page, "privacy")
        stored_page.locator('#info-dialog input[data-setting="save"]').check()
        original_save = saved(stored_page, "localStorage")
        persistent.close()
        reopened = playwright.chromium.launch_persistent_context(
            profile, executable_path="/usr/bin/chromium", headless=True
        )
        restored_page = observe(reopened.pages[0])
        restored_page.goto(BASE + "/", wait_until="networkidle")
        action(restored_page, "resume")
        expect(restored_page.locator('input[data-response="value"][value="1"]')).to_be_checked()
        assert saved(restored_page, "localStorage") == original_save
        reopened.close()
    print("PASS: opt-in progress survives a real browser-profile restart.")

assert not errors, errors
assert not external_requests, external_requests
assert not failed_requests, failed_requests
print("PASS: mobile overflow checks; no JavaScript errors, failed requests, or external requests.")
