"""Check completed-report presentation without changing the instrument or response export.

Run against a served source or artifact directory, including a project-path prefix:
POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8000 python3 tests/browser_debrief.py
"""
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
KEY = "political-context-session"
SCREENSHOTS = Path(os.environ.get("POLITICAL_CONTEXT_SCREENSHOTS", "/workspace/scratch"))
errors, external_requests, failed_requests = [], [], []
COUNTRIES = re.compile(r"\b(?:United States|United Kingdom|Germany|Japan|Fiji|Viet ?Nam|Vietnam|India|Central African Republic)\b", re.I)


def action(page, name):
    page.locator(f'[data-action="{name}"]').click()


def stored(page):
    return page.evaluate("key => ({tab:sessionStorage.getItem(key),device:localStorage.getItem(key)})", KEY)


def seed(page, mode="mixed", complete=True):
    result = page.evaluate("""async ([key,mode,complete]) => {
        const {instrument}=await import('./js/content.js');
        const {createSession,setAnswer,makeSteps,validateSession,summarize}=await import('./js/engine.js');
        let session=createSession(instrument,'descriptive-browser-fixture');
        for (const [index,item] of instrument.statements.entries()) {
            const answer=mode==='skipped'?{kind:'skip'}:index===1?{kind:'uncertain'}:index===2?{kind:'skip'}:
                {kind:'value',value:index===0?0:[-2,-1,1,2][index%4]};
            session=setAnswer(session,`statement:${item.id}`,answer);
        }
        for (const [index,item] of instrument.foundations.items.entries()) {
            const answer=mode==='skipped'?{kind:'skip'}:index===1?{kind:'uncertain'}:index===2?{kind:'skip'}:
                {kind:'value',value:index===0?2:0};
            session=setAnswer(session,`foundation:${item.id}`,answer);
        }
        for (const [index,item] of instrument.scenarios.entries()) {
            let answer;
            if(mode==='skipped') answer={kind:'skip',reasonId:null};
            else if(index===1) answer={kind:'none',reasonId:null,preference:{kind:'choice',optionId:item.options[1].id}};
            else if(index===2) answer={kind:'uncertain',reasonId:null,preference:{kind:'none'}};
            else if(index===3) answer={kind:'skip',reasonId:null,preference:{kind:'uncertain'}};
            else answer={kind:'choice',optionId:item.options[item.comparisonOf?1:0].id,
                reasonId:index===0?item.reasons[0].id:null,preference:index===0?{kind:'choice',optionId:item.options[2].id}:null};
            session=setAnswer(session,`scenario:${item.id}`,answer);
        }
        session.stepIndex=makeSteps(instrument).length-(complete?1:2);
        session.completed=complete;
        const validity=validateSession(instrument,session);
        if(!validity.valid) throw new Error(JSON.stringify(validity));
        sessionStorage.setItem(key,JSON.stringify(session));
        return {instrument,session,summary:summarize(instrument,session)};
    }""", [KEY, mode, complete])
    page.reload(wait_until="networkidle")
    action(page, "resume")
    return result


def no_overflow(page, label):
    sizes = page.evaluate("() => ({width:innerWidth,scroll:document.documentElement.scrollWidth})")
    assert sizes["scroll"] <= sizes["width"] + 1, (label, sizes)


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/chromium", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(10000)
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: failed_requests.append(request.url))
    page.on("request", lambda request: external_requests.append(request.url)
            if urlsplit(request.url).scheme in {"http", "https"} and urlsplit(request.url).netloc != urlsplit(BASE).netloc else None)
    page.goto(BASE + "/", wait_until="networkidle")

    # A valid but unfinished saved response cannot reveal or download a debrief.
    incomplete = seed(page, complete=False)
    expect(page.locator('[data-action="report"], [data-action="print-report"], #country-reveal')).to_have_count(0)
    assert not COUNTRIES.search(page.locator("body").inner_text())
    rejected = page.evaluate("""async session => {
        const {instrument}=await import('./js/content.js');
        const {buildDebrief,createTextReport}=await import('./js/debrief.js');
        return [buildDebrief,createTextReport].map(fn=>{try{fn(instrument,session);return false}catch{return true}});
    }""", incomplete["session"])
    assert rejected == [True, True]

    fixture = seed(page)
    instrument, session = fixture["instrument"], fixture["session"]
    expect(page).to_have_title("Your debrief — Political Context")
    initial_store = stored(page)
    assert initial_store["device"] is None
    assert json.loads(initial_store["tab"]) == session  # A 0.4.0 save needs no migration.
    report = page.evaluate("""async session => (await import('./js/debrief.js')).buildDebrief(
        (await import('./js/content.js')).instrument,session)""", session)
    themes = page.locator(".response-report .report-theme")
    expect(themes).to_have_count(7)
    assert themes.evaluate_all("els=>els.every(el=>!el.open)")
    assert page.locator("#experimental-profiles").evaluate("el=>el.open") is False
    assert page.locator("#raw-foundations").evaluate("el=>el.open") is False
    assert page.locator("#raw-decisions").evaluate("el=>el.open") is False
    statements = page.locator(".response-report [data-item-id]")
    scenes = page.locator(".response-report [data-scenario-id]")
    assert set(statements.evaluate_all("els=>els.map(el=>el.dataset.itemId)")) == {
        item["id"] for item in instrument["statements"] + instrument["foundations"]["items"]
    }
    expect(statements).to_have_count(40)
    assert set(scenes.evaluate_all("els=>els.map(el=>el.dataset.scenarioId)")) == {item["id"] for item in instrument["scenarios"]}
    expect(scenes).to_have_count(9)
    expect(page.locator(".response-overview")).to_contain_text("22/24 definite responses")
    expect(page.locator(".response-overview")).to_contain_text("14/16 definite responses")
    expect(page.locator(".response-overview")).to_contain_text("6/9 actions selected")
    expect(page.locator(".response-overview")).to_contain_text("1 none of the offered choices")
    expect(page.locator(".report-coverage-note")).to_contain_text("4/9 recorded")
    neutral = page.locator(f'.response-report [data-item-id="{instrument["statements"][0]["id"]}"]')
    expect(neutral).to_contain_text("Neither agree nor disagree")
    expect(page.locator('.report-theme[data-theme-id="transparency-access"]')).to_contain_text("additional access")
    expect(page.locator('.report-theme[data-theme-id="freedoms-contestable-power"] [data-item-id="civil-records"]')).to_have_count(0)
    for theme_id in ["knowledge-judgment", "care-ecological-dependence"]:
        theme = page.locator(f'.report-theme[data-theme-id="{theme_id}"]')
        expect(theme.locator(".coverage-gap")).to_contain_text("No dedicated situation")
        expect(theme.locator("[data-scenario-id]")).to_have_count(0)
    for theme in report["themes"]:
        card = page.locator(f'.report-theme[data-theme-id="{theme["id"]}"]')
        for row in theme["statements"] + theme["foundations"]:
            expect(card.locator(f'[data-item-id="{row["id"]}"] .response-answer')).to_have_text(row["responseLabel"])
        for row in theme["scenarios"]:
            record = card.locator(f'[data-scenario-id="{row["id"]}"]')
            expect(record.locator("dd")).to_have_text([row["actionLabel"], row["preferenceLabel"], row["reasonLabel"]])
            circumstances = record.locator(".decision-circumstances")
            expect(circumstances).to_contain_text(row["briefing"])
            if row["institutionalContext"]:
                expect(circumstances).to_contain_text(row["institutionalContext"])
            for fact in row["facts"]:
                expect(circumstances).to_contain_text(fact["text"])
    expect(page.locator("#country-reveal")).to_contain_text(report["world"]["inspiration"])

    # The old markers retain the original values, while becoming an optional view.
    page.locator("#experimental-profiles > summary").click()
    for index, result in enumerate(fixture["summary"]["dimensions"]):
        row = page.locator(".dimension-row").nth(index)
        for group, selector in [("statements", ".marker:not(.context)"), ("scenarios", ".marker.context")]:
            mean = result[group]["mean"]
            marker = row.locator(selector)
            if mean is None:
                expect(marker).to_have_count(0)
            else:
                assert abs(float(marker.evaluate("el=>el.style.left").rstrip('%')) - (mean+2)/4*100) < 0.001
    page.locator("#experimental-profiles > summary").click()

    expected_text = page.evaluate("""async session => (await import('./js/debrief.js')).createTextReport(
        (await import('./js/content.js')).instrument,session)""", session)
    with page.expect_download() as download_info:
        action(page, "report")
    download = download_info.value
    assert download.suggested_filename == "political-context-reflection-0.4.0.txt"
    assert Path(download.path()).read_text() == expected_text
    assert report["world"]["inspiration"] in expected_text
    for item in instrument["statements"] + instrument["foundations"]["items"]:
        assert item["text"] in expected_text
    for theme in report["themes"]:
        for row in theme["scenarios"]:
            assert all(value in expected_text for value in [row["briefing"], row["actionLabel"], row["preferenceLabel"], row["reasonLabel"]])
            assert all(fact["text"] in expected_text for fact in row["facts"])
            if row["institutionalContext"]:
                assert row["institutionalContext"] in expected_text
    with page.expect_download() as download_info:
        action(page, "export")
    payload = json.loads(Path(download_info.value.path()).read_text())
    assert payload["exportVersion"] == 2 and payload["session"] == session
    assert payload["summary"] == fixture["summary"]
    assert stored(page) == initial_store

    # Check print expansion and restoration, including native beforeprint hooks.
    themes.nth(1).locator(":scope > summary").click()
    themes.nth(1).locator(".decision-circumstances > summary").click()
    print_details = page.locator(".report-theme, .decision-circumstances")
    expect(print_details).to_have_count(16)
    before_print = print_details.evaluate_all("els=>els.map(el=>el.open)")
    page.evaluate("""() => { window.print=()=>{
        window.dispatchEvent(new Event('beforeprint'));
        window.__printState={open:[...document.querySelectorAll('.report-theme,.decision-circumstances')].map(el=>el.open),
            printing:document.body.classList.contains('printing-debrief')};
    }; }""")
    action(page, "print-report")
    assert page.evaluate("window.__printState") == {"open": [True]*16, "printing": True}
    page.emulate_media(media="print")
    expect(page.locator(".results-actions")).to_be_hidden()
    expect(page.locator("#experimental-profiles")).to_be_hidden()
    expect(page.locator("#raw-foundations")).to_be_hidden()
    expect(page.locator(".response-report")).to_be_visible()
    page.emulate_media(media="screen")
    page.evaluate("window.dispatchEvent(new Event('afterprint'))")
    assert print_details.evaluate_all("els=>els.map(el=>el.open)") == before_print
    assert page.evaluate("document.body.classList.contains('printing-debrief')") is False
    assert stored(page) == initial_store

    # Desktop and mobile reading, including fully expanded cards and long decisions.
    print_details.evaluate_all("els=>els.forEach(el=>el.open=true)")
    no_overflow(page, "desktop expanded report")
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    page.locator("#response-report-title").evaluate("el=>el.scrollIntoView({block:'start'})")
    page.screenshot(path=str(SCREENSHOTS / "debrief-0.4.2-desktop.png"))
    page.set_viewport_size({"width": 375, "height": 812})
    no_overflow(page, "mobile expanded report")
    page.locator('.report-theme[data-theme-id="ownership-provision-control"] > summary').evaluate("el=>el.scrollIntoView({block:'start'})")
    page.screenshot(path=str(SCREENSHOTS / "debrief-0.4.2-mobile.png"))
    for card in themes.all():
        card.scroll_into_view_if_needed()
        no_overflow(page, "mobile theme")
    page.set_viewport_size({"width": 1280, "height": 900})

    # Escaping a complete synthetic model must not insert HTML or execute handlers.
    escaped = page.evaluate("""async report => {
        const {renderResponseReport}=await import('./js/debrief-view.js');
        report.themes[0].statements[0].text='<img src=x onerror="window.__injected=true">';
        report.themes[0].scenarios[0].reasonLabel='<script>window.__injected=true</script>';
        const holder=document.createElement('div');holder.innerHTML=renderResponseReport(report);
        return {images:holder.querySelectorAll('img').length,scripts:holder.querySelectorAll('script').length,
            text:holder.textContent.includes('<img src=x'),injected:!!window.__injected};
    }""", report)
    assert escaped == {"images": 0, "scripts": 0, "text": True, "injected": False}

    # A completed save remains compatible after reload; returning to the quiz hides the reveal.
    page.reload(wait_until="networkidle")
    action(page, "resume")
    expect(page.locator(".report-theme")).to_have_count(7)
    assert stored(page) == initial_store
    action(page, "back")
    expect(page.locator('[data-action="report"], [data-action="print-report"], #country-reveal')).to_have_count(0)
    assert not COUNTRIES.search(page.locator("body").inner_text())

    skipped = seed(page, mode="skipped")
    expect(page.locator(".response-overview")).to_contain_text("0/24 definite responses")
    expect(page.locator(".response-overview")).to_contain_text("0/16 definite responses")
    expect(page.locator(".response-overview")).to_contain_text("0/9 actions selected")
    expect(page.locator(".response-report .response-answer")).to_have_count(40)
    assert page.locator(".response-report .response-answer").all_text_contents() == ["Skipped"]*40
    expect(page.locator(".marker")).to_have_count(0)
    expect(page.locator(".report-coverage-note")).to_contain_text("0/9 recorded")
    assert all(mean is None for row in skipped["summary"]["dimensions"] for mean in (row["statements"]["mean"],row["scenarios"]["mean"]))

    # A contradictory completed flag must enter recovery without revealing results.
    malformed = dict(session, completed=False)
    previous_save = json.dumps(malformed, indent=2)
    page.evaluate("([key,raw])=>sessionStorage.setItem(key,raw)", [KEY, previous_save])
    page.reload(wait_until="networkidle")
    expect(page.locator("#storage-warning")).to_be_visible()
    expect(page.locator('[data-action="resume"], [data-action="report"], [data-action="print-report"], #country-reveal')).to_have_count(0)
    assert not COUNTRIES.search(page.locator("body").inner_text())
    with page.expect_download() as download_info:
        action(page, "recover-save")
    recovered = json.loads(Path(download_info.value.path()).read_text())
    assert recovered["format"] == "political-context-save-recovery"
    assert recovered["previousSave"] == previous_save
    assert stored(page)["tab"] == previous_save
    assert not errors, errors
    assert not external_requests, external_requests
    assert not failed_requests, failed_requests
    context.close()
    browser.close()

print("PASS: seven-theme debrief, source evidence, save compatibility, exclusions, readable/JSON exports, print restoration, mobile, and incomplete/all-skipped cases.")
