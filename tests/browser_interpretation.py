"""Exercise personalized readings, evidence links, and sparse-response limits.

Supports source and packaged project paths through POLITICAL_CONTEXT_TEST_URL.
The fixture answers are synthetic and stay in a disposable browser context.
"""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
KEY = "political-context-session"
SCREENSHOTS = Path(os.environ.get("POLITICAL_CONTEXT_SCREENSHOTS", "/workspace/scratch"))


def seed(page, mode):
    result = page.evaluate("""async ([key,mode]) => {
        const {instrument}=await import('./js/content.js');
        const {createSession,setAnswer,makeSteps,validateSession}=await import('./js/engine.js');
        const {buildDebrief}=await import('./js/debrief.js');
        const {interpretDebrief}=await import('./js/interpretation.js');
        let session=createSession(instrument,'interpretation-browser-fixture');
        for (const item of instrument.statements) {
            let answer={kind:'skip'};
            if(mode==='agreement') answer={kind:'value',value:2};
            if(mode==='directional') answer={kind:'value',value:item.direction*2};
            if(mode==='negative') answer={kind:'value',value:item.direction*-2};
            if(mode==='neutral') answer={kind:'value',value:0};
            if(mode==='single' && item.id==='economic-ownership') answer={kind:'value',value:2};
            session=setAnswer(session,`statement:${item.id}`,answer);
        }
        for (const item of instrument.foundations.items) {
            const answer=mode==='agreement'?{kind:'value',value:2}:
                mode==='neutral'?{kind:'value',value:0}:{kind:'skip'};
            session=setAnswer(session,`foundation:${item.id}`,answer);
        }
        for (const [index,item] of instrument.scenarios.entries()) {
            let answer={kind:'skip',reasonId:null};
            if(mode==='agreement') {
                const optionId=item.id==='housing-urgent'?'cooperative':item.comparisonOf?'sell':item.options[0].id;
                answer={kind:'choice',optionId,reasonId:null,preference:index===0?
                    {kind:'choice',optionId:item.options.find(option=>option.id!==optionId).id}:
                    index===1?{kind:'none'}:index===2?{kind:'uncertain'}:null};
            }
            session=setAnswer(session,`scenario:${item.id}`,answer);
        }
        session.stepIndex=makeSteps(instrument).length-1;
        session.completed=true;
        if(!validateSession(instrument,session).valid) throw new Error('Invalid interpretation fixture');
        const report=buildDebrief(instrument,session);
        const interpretation=interpretDebrief(instrument,report);
        sessionStorage.setItem(key,JSON.stringify(session));
        return {instrument,session,report,interpretation};
    }""", [KEY, mode])
    page.reload(wait_until="networkidle")
    page.locator('[data-action="resume"]').click()
    page.locator('#info-dialog [data-action="continue-legacy"]').click()
    expect(page.locator(".interpretation-overview")).to_be_visible()
    return result


def saved(page):
    return page.evaluate("key=>({tab:sessionStorage.getItem(key),device:localStorage.getItem(key)})", KEY)


def assert_model_view(page, interpretation):
    overview = page.locator(".interpretation-overview")
    expect(overview).to_contain_text(interpretation["overview"]["title"])
    expect(overview).to_contain_text(interpretation["overview"]["summary"])
    cards = overview.locator(".insight-card")
    expect(cards).to_have_count(len(interpretation["insights"]))
    assert 1 <= len(interpretation["insights"]) <= 4
    for index, insight in enumerate(interpretation["insights"]):
        card = cards.nth(index)
        expect(card.locator("h3")).to_have_text(insight["title"])
        expect(card).to_contain_text(insight["text"])
        assert card.locator("[data-evidence-target]").evaluate_all(
            "els=>els.map(el=>el.dataset.evidenceTarget)"
        ) == insight["evidenceIds"]
    for reading in interpretation["themes"]:
        card = page.locator(f'.report-theme[data-theme-id="{reading["id"]}"]')
        expect(card.locator(".theme-takeaway")).to_have_text(reading["headline"])
        expect(card.locator(".theme-takeaway")).to_be_visible()
        expect(card.locator(".theme-meaning")).to_have_text(reading["meaning"])
        expect(card.locator(".theme-meaning")).to_be_visible()
        card.locator(":scope > summary").click()
        expect(card).to_contain_text(reading["evidenceNote"])
        for item in reading["premises"] + reading["decisions"]:
            expect(card).to_contain_text(item["meaning"])
        for connection in reading["connections"]:
            expect(card).to_contain_text(connection["title"])
            expect(card).to_contain_text(connection["text"])
        assert card.locator(".theme-evidence").evaluate("el=>el.open") is False
        card.locator(":scope > summary").click()


def no_overflow(page, label):
    size = page.evaluate("()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})")
    assert size["scroll"] <= size["width"] + 1, (label, size)


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/chromium", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    page = context.new_page()
    page.set_default_timeout(10000)
    errors, external_requests, failed_requests = [], [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: failed_requests.append(request.url))
    page.on("request", lambda request: external_requests.append(request.url)
            if urlsplit(request.url).scheme in {"http", "https"}
            and urlsplit(request.url).netloc != urlsplit(BASE).netloc else None)
    page.goto(BASE + "/", wait_until="networkidle")

    # Agreement with competing emphases produces connections, not a centrist label.
    fixture = seed(page, "agreement")
    interpretation = fixture["interpretation"]
    baseline = saved(page)
    assert json.loads(baseline["tab"]) == fixture["session"] and baseline["device"] is None
    assert interpretation["themes"][0]["pattern"]["kind"] == "mixed"
    assert all(len(insight["evidenceIds"]) >= (1 if insight["id"] == "role-and-personal-preference" else 2)
               for insight in interpretation["insights"])
    role_contrast = next(insight for insight in interpretation["insights"]
                         if insight["id"] == "role-and-personal-preference")
    assert role_contrast["evidenceIds"] == ["housing-urgent"]
    assert interpretation["roleContrast"] == {"compared": 1, "different": 1, "same": 0, "notComparable": 8}
    expect(page.locator('.interpretation-overview .insight-card[data-insight-id="role-and-personal-preference"]')).to_be_visible()
    assert_model_view(page, interpretation)
    raw = page.locator(".theme-evidence [data-item-id], .theme-evidence [data-scenario-id]")
    expect(raw).to_have_count(49)
    assert len(set(raw.evaluate_all("els=>els.map(el=>el.id)"))) == 49

    # Every highlighted connection can open and focus its exact recorded evidence.
    original_url = page.url
    for card in page.locator(".interpretation-overview .insight-card").all():
        for link in card.locator("[data-evidence-target]").all():
            page.locator(".report-theme, .theme-evidence").evaluate_all("els=>els.forEach(el=>el.open=false)")
            evidence_id = link.get_attribute("data-evidence-target")
            link.click()
            target = page.locator(f'#evidence-{evidence_id}')
            expect(target).to_be_visible()
            expect(target).to_be_focused()
            assert target.evaluate("el=>el.closest('.report-theme').open && el.closest('.theme-evidence').open")
            assert page.url == original_url and saved(page) == baseline
    page.locator(".report-theme, .theme-evidence").evaluate_all("els=>els.forEach(el=>el.open=false)")

    # The readable report includes interpretation and the unchanged exact record.
    with page.expect_download() as download_info:
        page.locator('[data-action="report"]').click()
    text = Path(download_info.value.path()).read_text()
    for insight in interpretation["insights"]:
        assert insight["title"] in text and insight["text"] in text
    for reading in interpretation["themes"]:
        assert reading["headline"] in text and reading["meaning"] in text
    assert saved(page) == baseline

    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    page.locator(".interpretation-overview").evaluate("el=>el.scrollIntoView({block:'start'})")
    no_overflow(page, "desktop interpretation")
    page.screenshot(path=str(SCREENSHOTS / "interpretation-0.4.3-desktop.png"))
    page.set_viewport_size({"width": 375, "height": 812})
    no_overflow(page, "mobile interpretation")
    page.locator(".interpretation-overview").evaluate("el=>el.scrollIntoView({block:'start'})")
    page.screenshot(path=str(SCREENSHOTS / "interpretation-0.4.3-mobile.png"))
    page.locator(".report-theme, .theme-evidence, .decision-circumstances").evaluate_all("els=>els.forEach(el=>el.open=true)")
    first_theme = page.locator(".report-theme").first
    first_theme.locator(":scope > summary").evaluate("el=>el.scrollIntoView({block:'start'})")
    page.screenshot(path=str(SCREENSHOTS / "interpretation-0.4.3-mobile-expanded.png"))
    for theme in page.locator(".report-theme").all():
        theme.scroll_into_view_if_needed()
        no_overflow(page, "mobile expanded interpretation and evidence")
    page.set_viewport_size({"width": 1280, "height": 900})

    # Forged model strings remain text in the view, including insight evidence IDs.
    escaped = page.evaluate("""async ({report,interpretation})=>{
        const {renderResponseReport}=await import('./js/debrief-view.js');
        interpretation.overview.title='<img src=x onerror="window.__injected=true">';
        interpretation.insights[0].title='<script>window.__injected=true</script>';
        interpretation.insights[0].text='<svg onload="window.__injected=true">';
        interpretation.insights[0].evidenceIds=['x" onclick="window.__injected=true'];
        interpretation.themes[0].headline='<img src=x onerror="window.__injected=true">';
        interpretation.themes[0].meaning='<script>window.__injected=true</script>';
        const holder=document.createElement('div');
        holder.innerHTML=renderResponseReport(report,interpretation);
        return {elements:holder.querySelectorAll('img,script,svg').length,
            handlers:holder.querySelectorAll('[onclick],[onerror],[onload]').length,
            literal:holder.textContent.includes('<script>'),injected:!!window.__injected};
    }""", {"report": fixture["report"], "interpretation": interpretation})
    assert escaped == {"elements": 0, "handlers": 0, "literal": True, "injected": False}

    # Reversing directional answers changes the reading without altering questions.
    directional = seed(page, "directional")["interpretation"]
    assert_model_view(page, directional)
    negative = seed(page, "negative")["interpretation"]
    assert_model_view(page, negative)
    for positive_theme, negative_theme in zip(directional["themes"], negative["themes"]):
        if positive_theme["pattern"]["total"]:
            assert positive_theme["pattern"]["kind"] == "positive"
            assert negative_theme["pattern"]["kind"] == "negative"
            assert positive_theme["headline"] != negative_theme["headline"]

    # Neutral and skipped answers stay distinct without supplying an identity.
    for mode in ["neutral", "skipped"]:
        sparse = seed(page, mode)["interpretation"]
        assert_model_view(page, sparse)
        assert sparse["overview"]["title"] == "What remains open"
        assert all(not item["evidenceIds"] for item in sparse["insights"])
        for theme in sparse["themes"]:
            assert not theme["premises"] and not theme["decisions"] and not theme["connections"]
            assert theme["pattern"]["positive"] == theme["pattern"]["negative"] == 0
            if theme["pattern"]["total"]:
                assert theme["pattern"]["kind"] == ("neutral" if mode == "neutral" else "missing")

    single = seed(page, "single")["interpretation"]
    assert_model_view(page, single)
    ownership = next(theme for theme in single["themes"] if theme["id"] == "ownership-provision-control")
    assert ownership["pattern"]["kind"] == "limited"
    assert "one" in ownership["headline"].lower()
    assert "not yet" in ownership["headline"].lower()
    assert all(not item["evidenceIds"] for item in single["insights"])
    assert not errors, errors
    assert not external_requests, external_requests
    assert not failed_requests, failed_requests
    context.close()
    browser.close()

print("PASS: personalized connections, evidence focus, directional changes, sparse-response limits, readable export, escaping, and mobile interpretation.")
