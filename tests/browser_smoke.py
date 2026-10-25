"""Run against the locally served checkout: python3 tests/browser_smoke.py."""
import json
import math
import os
import re
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
KEY = "political-context-session"
errors, external_requests, failed_requests = [], [], []
COUNTRY_NAMES = re.compile(
    r"\b(?:United States|United Kingdom|Germany|Japan|Fiji|Viet ?Nam|Vietnam|India|Central African Republic)\b",
    re.IGNORECASE,
)


def no_country_correspondence(page, state):
    """Explicit real-world labels stay outside the visible participant experience."""
    text = page.locator("body").inner_text()
    assert not COUNTRY_NAMES.search(text), (state, COUNTRY_NAMES.findall(text))
    accessible_labels = page.locator('[aria-label], [title]').evaluate_all(
        "elements => elements.map(element => [element.getAttribute('aria-label'), element.getAttribute('title')].filter(Boolean).join(' ')).join(' ')"
    )
    assert not COUNTRY_NAMES.search(accessible_labels), (state, accessible_labels)



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
    elif name in {"worlds", "review", "method"}:
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
    assert payload["exportVersion"] == 2
    session = payload["session"]
    assert session["completed"] is True
    assert session["version"] == instrument["version"]
    assert session["worldId"] in {world["id"] for world in instrument["worlds"]}
    expected_ids = {f"statement:{item['id']}" for item in instrument["statements"]}
    expected_ids |= {f"foundation:{item['id']}" for item in instrument["foundations"]["items"]}
    expected_ids |= {f"scenario:{item['id']}" for item in instrument["scenarios"]}
    assert set(session["answers"]) == expected_ids
    assert len(expected_ids) == 49
    foundation_rows = payload["summary"]["foundations"]
    assert [row["itemId"] for row in foundation_rows] == [
        item["id"] for item in instrument["foundations"]["items"]
    ]
    for row in foundation_rows:
        answer = session["answers"][f"foundation:{row['itemId']}"]
        assert row == {
            "itemId": row["itemId"], "kind": answer["kind"],
            "value": answer["value"] if answer["kind"] == "value" else None,
        }
    assigned = next(world for world in instrument["worlds"] if world["id"] == session["worldId"])
    assert payload["assignmentReveal"] == {
        "worldId": assigned["id"], "name": assigned["name"], "inspiration": assigned["inspiration"],
    }
    for scene in instrument["scenarios"]:
        assert payload["presentedOptionOrder"][scene["id"]] == [
            option["id"] for option in scene["options"]
        ]
    preference_rows = {row["scenarioId"]: row for row in payload["summary"]["preferences"]}
    assert set(preference_rows) == {scene["id"] for scene in instrument["scenarios"]}
    for scene in instrument["scenarios"]:
        answer = session["answers"][f"scenario:{scene['id']}"]
        preference = answer.get("preference")
        action_id = answer.get("optionId") if answer["kind"] == "choice" else None
        preferred_id = preference.get("optionId") if preference and preference["kind"] == "choice" else None
        expected_status = preference["kind"] if preference else "not-provided"
        assert preference_rows[scene["id"]] == {
            "scenarioId": scene["id"], "actionOptionId": action_id,
            "preferredOptionId": preferred_id, "status": expected_status,
            "different": action_id != preferred_id if action_id and preferred_id else None,
        }
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
        assert result["statements"]["total"] == sum(
            item["dimension"] == result["id"] for item in instrument["statements"]
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
    if current_session and current_session["completed"]:
        for world in instrument["worlds"]:
            expect(page.locator("#dialog-content")).to_contain_text(world["inspiration"])
    else:
        page.locator('#dialog-content details').evaluate_all(
            "elements => elements.forEach(element => { element.open = true; })"
        )
        no_country_correspondence(page, "pre-debrief world directory")
    mobile_fit(page, "world directory dialog")
    action(page, "close-dialog")
    action(page, "review")
    expect(page.locator("#info-dialog")).to_be_visible()
    mobile_fit(page, "review dialog")
    if not current_session or not current_session["completed"]:
        expect(page.locator('#info-dialog [data-action="packet"]')).to_have_count(0)
        expect(page.locator('#info-dialog a[href="review.html"]')).to_have_count(0)
        no_country_correspondence(page, "pre-debrief review explanation")
        action(page, "close-dialog")
        assert saved(page) == before_session
        assert saved(page, "localStorage") == before_device
        return
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



def bilingual_review_workspace(page, instrument, current_session=None):
    """Bilingual author-review browsing cannot create or modify assessment answers."""
    before_session = saved(page)
    before_device = saved(page, "localStorage")
    page.goto(BASE + "/review.html", wait_until="networkidle")
    expect(page.locator("#review-kind")).to_be_visible()
    expect(page.locator("body")).to_contain_text(re.compile("draft", re.I))
    translations = page.evaluate("""async () => ({
        items: (await import('./js/translations/vi-items.js')).viItems,
        worlds: (await import('./js/translations/vi-worlds.js')).viWorlds,
        foundations: (await import('./js/translations/vi-foundations.js')).viFoundations,
    })""")
    page.locator("#review-kind").select_option("statements")
    page.locator("#review-language").select_option("parallel")
    cards = page.locator("#review-cards .review-card")
    expect(cards).to_have_count(len(instrument["statements"]))
    first = instrument["statements"][0]
    expect(cards.first.locator('[lang="en"]').first).to_contain_text(first["text"])
    expect(cards.first.locator('[lang="vi"]').first).to_contain_text(
        translations["items"]["statements"][first["id"]]["text"]
    )
    mobile_fit(page, "bilingual statement review")
    search = page.locator("#review-search")
    search.focus()
    search.fill(first["id"])
    expect(cards).to_have_count(1)
    search.fill("missing-review-item-000")
    expect(cards).to_have_count(0)
    search.fill("")
    expect(cards).to_have_count(len(instrument["statements"]))
    page.locator("#review-language").select_option("vi")
    expect(page.locator('#review-cards [lang="en"]:visible')).to_have_count(0)
    assert page.locator('#review-cards [lang="vi"]:visible').count() > 0
    page.locator("#review-language").select_option("en")
    expect(page.locator('#review-cards [lang="vi"]:visible')).to_have_count(0)
    assert page.locator('#review-cards [lang="en"]:visible').count() > 0
    page.locator("#review-language").select_option("parallel")
    page.locator("#review-kind").select_option("foundations")
    expect(cards).to_have_count(len(instrument["foundations"]["items"]))
    foundation = instrument["foundations"]["items"][0]
    expect(cards.first.locator('[lang="en"]').first).to_contain_text(foundation["text"])
    expect(cards.first.locator('[lang="vi"]').first).to_contain_text(
        translations["foundations"]["items"][foundation["id"]]["text"]
    )
    mobile_fit(page, "bilingual foundation review")
    page.locator("#review-kind").select_option("lenses")
    expect(cards).to_have_count(len(instrument["foundations"]["lenses"]) + 1)
    for lens in instrument["foundations"]["lenses"]:
        expect(page.locator("#review-cards")).to_contain_text(lens["label"])
        expect(page.locator("#review-cards")).to_contain_text(
            translations["foundations"]["lenses"][lens["id"]]["label"]
        )
    mobile_fit(page, "bilingual lens framework review")
    page.locator("#review-kind").select_option("scenarios")
    expect(cards).to_have_count(len(instrument["scenarios"]))
    for world in instrument["worlds"]:
        page.locator("#review-world").select_option(world["id"])
        for scene in instrument["scenarios"]:
            card = cards.filter(has_text=scene["title"])
            expect(card).to_have_count(1)
            expect(card).to_contain_text(world["scenarioNotes"][scene["id"]])
            expect(card).to_contain_text(
                translations["worlds"]["worlds"][world["id"]]["scenarioNotes"][scene["id"]]
            )
    mobile_fit(page, "bilingual situation review")
    page.locator("#review-kind").select_option("worlds")
    expect(cards).to_have_count(len(instrument["worlds"]))
    mobile_fit(page, "bilingual setting review")
    with page.expect_download() as export:
        page.locator("#review-export").click()
    payload = json.loads(Path(export.value.path()).read_text())
    assert payload["format"] == "political-context-bilingual-review"
    assert payload["packetVersion"] == 2
    assert payload["instrumentId"] == instrument["id"]
    assert payload["version"] == instrument["version"]
    assert payload["reviewStatus"] == "draft"
    assert payload["originalLanguage"] == "en"
    assert payload["translationLanguage"] == "vi"
    assert payload["english"] == instrument
    assert payload["vietnamese"] == translations
    assert not {"session", "answers", "responses"}.intersection(payload)
    if current_session:
        assert current_session["seed"] not in json.dumps(payload)
    assert saved(page) == before_session
    assert saved(page, "localStorage") == before_device
    page.goto(BASE + "/", wait_until="networkidle")
    if current_session:
        action(page, "resume")
        expect(page).to_have_title("Your debrief — Political Context")
    print("PASS: bilingual statements, foundations, lens framework, all world notes, language views, and response-free export.")


def seed_world_at_briefing(page, world_id):
    """Use a valid assignment and answered baseline, then exercise the real scenario UI."""
    result = page.evaluate(
        """async ([key, worldId]) => {
            const {instrument} = await import('./js/content.js');
            const {createSession,setAnswer,validateSession,makeSteps} = await import('./js/engine.js');
            let session;
            for (let index=0; index<10000; index++) {
                const candidate = createSession(instrument, `browser-world-${index}`);
                if (candidate.worldId === worldId) { session=candidate; break; }
            }
            if (!session) throw new Error(`No seed found for ${worldId}`);
            for (const item of instrument.statements) {
                session=setAnswer(session, `statement:${item.id}`, {kind:'value', value:0});
            }
            for (const item of instrument.foundations.items) {
                session=setAnswer(session, `foundation:${item.id}`, {kind:'value', value:0});
            }
            session.stepIndex=makeSteps(instrument).findIndex(step => step.type==='briefing');
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
    no_country_correspondence(page, "home")
    action(page, "method")
    no_country_correspondence(page, "pre-debrief method")
    expect(page.locator('#info-dialog a[href="docs/RESEARCH.md"]')).to_have_count(0)
    expect(page.locator('#info-dialog a[href="js/content.js"]')).to_have_count(0)
    action(page, "close-dialog")
    instrument = page.evaluate("async () => (await import('./js/content.js')).instrument")
    review_packet(page, instrument)
    bilingual_review_workspace(page, instrument)
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
    for number, item in enumerate(instrument["foundations"]["items"]):
        expect(page.locator("#step-title")).to_have_text(item["text"])
        no_country_correspondence(page, f"foundation {number + 1}")
        if number == 0:
            mobile_fit(page, "foundation")
            expect(page.locator('[data-action="next"]')).to_be_disabled()
            choose(page, "value", 2)
            action(page, "next")
            action(page, "back")
            expect(page.locator('input[data-response="value"][value="2"]')).to_be_checked()
            before_foundation_reload = saved(page)
            page.reload(wait_until="networkidle")
            action(page, "resume")
            assert saved(page) == before_foundation_reload
            expect(page.locator('input[data-response="value"][value="2"]')).to_be_checked()
        elif number == 1:
            choose(page, "uncertain")
        elif number == 2:
            action(page, "skip")
            continue
        else:
            choose(page, "value", [-2, -1, 0, 1, 2][number % 5])
        action(page, "next")
    expect(page.locator(".world-brief")).to_be_visible()
    no_country_correspondence(page, "world briefing")
    mobile_fit(page, "world briefing")
    action(page, "next")
    for number, scene in enumerate(instrument["scenarios"]):
        expect(page.locator("#step-title")).to_have_text(scene["title"])
        mobile_fit(page, f"scenario {number + 1}")
        no_country_correspondence(page, f"scenario {number + 1}")
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
        preference = page.locator("#personal-preference")
        expect(preference).to_be_enabled()
        if number == 0:
            preference.select_option("option:" + scene["options"][-1]["id"])
            recorded = saved(page)["answers"][f"scenario:{scene['id']}"]
            assert recorded["preference"] == {"kind": "choice", "optionId": scene["options"][-1]["id"]}
            choose(page, "choice", scene["options"][1]["id"])
            expect(preference).to_have_value("option:" + scene["options"][-1]["id"])
            choose(page, "choice", scene["options"][0]["id"])
            action(page, "next")
            action(page, "back")
            expect(page.locator("#personal-preference")).to_have_value("option:" + scene["options"][-1]["id"])
            page.reload(wait_until="networkidle")
            action(page, "resume")
            expect(page.locator("#personal-preference")).to_have_value("option:" + scene["options"][-1]["id"])
        elif number == 1:
            preference.select_option("option:" + scene["options"][1]["id"])
        elif number == 2:
            preference.select_option("none")
        elif number == 3:
            preference.select_option("uncertain")
        elif number == 4:
            preference.select_option("none")
            preference.select_option("")
            assert saved(page)["answers"][f"scenario:{scene['id']}"].get("preference") is None
        action(page, "next")
    expect(page).to_have_title("Your debrief — Political Context")
    assigned_world = next(world for world in instrument["worlds"] if world["id"] == saved(page)["worldId"])
    expect(page.locator("#country-reveal")).to_contain_text(assigned_world["inspiration"])
    page.locator("#raw-foundations > summary").click()
    expect(page.locator(".foundation-debrief")).to_be_visible()
    for item in instrument["foundations"]["items"]:
        expect(page.locator(".foundation-debrief")).to_contain_text(item["text"])
    expect(page.locator(".dimension-row")).to_have_count(len(instrument["dimensions"]))
    expect(page.locator(".comparison-card:not(#country-reveal)")).to_contain_text("You chose a different action")
    mobile_fit(page, "debrief")
    assert saved(page, "localStorage") is None
    with page.expect_download() as download_info:
        action(page, "export")
    download = download_info.value
    payload = json.loads(Path(download.path()).read_text())
    validate_export(payload, instrument)
    assert payload["summary"]["comparisons"][0]["changed"] is True
    assert payload["summary"]["foundations"][0]["value"] == 2
    assert payload["summary"]["foundations"][1] == {
        "itemId": instrument["foundations"]["items"][1]["id"], "kind": "uncertain", "value": None,
    }
    assert payload["summary"]["foundations"][2] == {
        "itemId": instrument["foundations"]["items"][2]["id"], "kind": "skip", "value": None,
    }
    foundation_steps = page.evaluate("async () => (await import('./js/engine.js')).makeSteps((await import('./js/content.js')).instrument).filter(step => step.type==='foundation')")
    assert len(foundation_steps) == 16
    altered = page.evaluate("""async session => {
        const {instrument}=await import('./js/content.js');
        const {summarize}=await import('./js/engine.js');
        for (const item of instrument.foundations.items) {
            session.answers[`foundation:${item.id}`]={kind:'value',value:-2};
        }
        return summarize(instrument,session);
    }""", payload["session"])
    assert altered["dimensions"] == payload["summary"]["dimensions"]
    assert altered["comparisons"] == payload["summary"]["comparisons"]
    assert altered["preferences"] == payload["summary"]["preferences"]
    missing_foundation = page.evaluate("""async session => {
        const {instrument}=await import('./js/content.js');
        const {summarize,validateSession}=await import('./js/engine.js');
        delete session.answers[`foundation:${instrument.foundations.items[0].id}`];
        return {summary:summarize(instrument,session),validation:validateSession(instrument,session)};
    }""", payload["session"])
    assert missing_foundation["summary"]["foundations"][0] == {
        "itemId": instrument["foundations"]["items"][0]["id"], "kind": "unanswered", "value": None,
    }
    assert missing_foundation["validation"]["valid"] is False
    assert payload["session"]["answers"]["scenario:public-assembly"]["kind"] == "none"
    assert payload["session"]["answers"]["scenario:water-partnership"]["kind"] == "uncertain"
    assert payload["session"]["answers"]["scenario:water-partnership"]["preference"] == {"kind": "none"}
    assert payload["session"]["answers"]["scenario:community-festival"]["preference"] == {"kind": "uncertain"}
    assert payload["summary"]["preferences"][0]["different"] is True
    first_scene = instrument["scenarios"][0]
    page.locator("#raw-decisions > summary").click()
    preference_evidence = page.locator(".evidence-section details").filter(has_text=first_scene["title"])
    preference_evidence.locator("summary").click()
    expect(preference_evidence.locator(".evidence-body")).to_contain_text(first_scene["options"][-1]["label"])
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
    action(page, "back")
    expect(page.locator("#step-title")).to_have_text(instrument["scenarios"][-1]["title"])
    no_country_correspondence(page, "back from debrief")
    action(page, "review")
    expect(page.locator('#info-dialog [data-action="packet"]')).to_have_count(0)
    action(page, "close-dialog")
    action(page, "next")
    expect(page.locator("#country-reveal")).to_contain_text(assigned_world["inspiration"])
    page.reload(wait_until="networkidle")
    action(page, "resume")
    expect(page).to_have_title("Your debrief — Political Context")
    before_packet = saved(page)
    review_packet(page, instrument, current_session=before_packet)
    bilingual_review_workspace(page, instrument, current_session=before_packet)
    assert saved(page) == before_packet
    print("PASS: complete 49-response assessment, foundation back/reload/uncertainty/skip, unscored premises, country reveal, keyboard controls, preferences, export.")

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
    stale["version"] = "0.2.0"
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
        no_country_correspondence(world_page, f"{world['id']} briefing")
        action(world_page, "method")
        no_country_correspondence(world_page, f"{world['id']} method")
        action(world_page, "close-dialog")
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
            no_country_correspondence(world_page, f"{world['id']} {scene['id']} expanded institutions")
            if scene["role"] in {"civil_society", "public_servant", "national_leader"}:
                mobile_fit(world_page, f"{world['id']} {scene['role']}")
            option = scene["options"][-1 if scene.get("comparisonOf") else number % len(scene["options"])]
            choose(world_page, "choice", option["id"])
            world_page.locator("#reason").select_option(scene["reasons"][number % len(scene["reasons"])]["id"])
            action(world_page, "next")
        assert seen_roles == {role["id"] for role in instrument["roles"]}
        expect(world_page).to_have_title("Your debrief — Political Context")
        expect(world_page.locator(".result-meta")).to_contain_text(world["name"])
        expect(world_page.locator("#country-reveal")).to_contain_text(world["inspiration"])
        completed = saved(world_page)
        assert completed["completed"] is True
        assert completed["worldId"] == world["id"]
        assert len(completed["answers"]) == 49
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
