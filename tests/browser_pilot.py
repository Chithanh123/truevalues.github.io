"""Check synthetic result examples without opening or changing personal saves.

Run on the source server or a packaged project path:
POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8000 python3 tests/browser_pilot.py
All seeded answers and reviewer-note sentinels are synthetic test data.
"""
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
PAGE = BASE + "/results-pilot.html"
SCREENSHOTS = Path(os.environ.get("POLITICAL_CONTEXT_SCREENSHOTS", "/workspace/scratch"))
COUNTRIES = re.compile(r"\b(?:United States|United Kingdom|Germany|Japan|Fiji|Viet ?Nam|Vietnam|India|Central African Republic)\b", re.I)
DETAILS = ".report-theme, .theme-evidence, .decision-circumstances"


def synthetic_existing_save():
    return subprocess.check_output([
        "node", "--input-type=module", "-e", """
        import {instrument} from './js/content.js';
        import {createSession,makeSteps,validateSession} from './js/engine.js';
        const session=createSession(instrument,'existing-synthetic-pilot-browser-save');
        for(const item of instrument.statements) session.answers[`statement:${item.id}`]={kind:'value',value:0};
        for(const item of instrument.foundations.items) session.answers[`foundation:${item.id}`]={kind:'value',value:0};
        for(const item of instrument.scenarios) session.answers[`scenario:${item.id}`]={kind:'skip',reasonId:null};
        session.stepIndex=makeSteps(instrument).length-1;
        session.completed=true;session.saveOnDevice=true;
        if(!validateSession(instrument,session).valid) throw new Error('Invalid isolation fixture');
        console.log(JSON.stringify(session));
        """
    ], cwd=ROOT, text=True).strip()


def storage_guard(existing):
    # The test retains native handles solely to inspect the seeded values. Page
    # code cannot even obtain a Storage object, including through property access.
    values = {
        "political-context-session": existing,
        "political-context-review-notes": "synthetic-reviewer-note-must-stay-unchanged",
        "unrelated-synthetic-key": "unrelated-value-must-stay-unchanged",
    }
    return "const seededValues=" + json.dumps(values) + ";" + r"""
    (()=>{
      const stores={tab:window.sessionStorage,device:window.localStorage};
      const native={};
      for(const method of ['getItem','setItem','removeItem','clear','key']) native[method]=Storage.prototype[method];
      for(const store of Object.values(stores)) for(const [key,value] of Object.entries(seededValues)) native.setItem.call(store,key,value);
      const calls=[];
      const inspect=()=>Object.fromEntries(Object.entries(stores).map(([scope,store])=>[
        scope,Object.fromEntries(Array.from({length:store.length},(_,index)=>{
          const key=native.key.call(store,index);return [key,native.getItem.call(store,key)];
        }))
      ]));
      Object.defineProperty(window,'__pilotStorageProbe',{value:{calls,inspect}});
      for(const method of ['getItem','setItem','removeItem','clear','key']) Storage.prototype[method]=function(){
        calls.push(method);throw new Error('Pilot must not access browser storage: '+method);
      };
      for(const name of ['sessionStorage','localStorage']) Object.defineProperty(window,name,{
        configurable:true,get(){calls.push(name);throw new Error('Pilot must not open '+name);}
      });
    })();
    """


def isolated(page, baseline):
    assert page.evaluate("window.__pilotStorageProbe.calls") == []
    assert page.evaluate("window.__pilotStorageProbe.inspect()") == baseline


def no_overflow(page, label):
    sizes = page.evaluate("()=>({viewport:innerWidth,width:document.documentElement.scrollWidth})")
    assert sizes["width"] <= sizes["viewport"] + 1, (label, sizes)


def open_case(page, case_id):
    previous = page.locator("#pilot-case").input_value()
    page.locator("#pilot-case").select_option(case_id)
    if previous != case_id:
        expect(page.locator("#pilot-example .response-report")).to_have_count(0)
        expect(page.locator("#pilot-download")).to_be_disabled()
        expect(page.locator("#pilot-print")).to_be_disabled()
    page.locator("#pilot-open").click()
    expect(page.locator("#pilot-example .response-report")).to_be_visible()
    expect(page.locator("#pilot-country-reveal")).to_be_visible()
    expect(page.locator("#pilot-download")).to_be_enabled()
    expect(page.locator("#pilot-print")).to_be_enabled()


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/chromium", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    context.add_init_script(script=storage_guard(synthetic_existing_save()))
    page = context.new_page()
    page.set_default_timeout(10000)
    errors, external, failed, requests = [], [], [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: failed.append(request.url))
    page.on("request", lambda request: requests.append(request.url))
    page.on("request", lambda request: external.append(request.url)
            if urlsplit(request.url).scheme in {"http", "https"}
            and urlsplit(request.url).netloc != urlsplit(BASE).netloc else None)
    page.goto(PAGE, wait_until="networkidle")
    baseline = page.evaluate("window.__pilotStorageProbe.inspect()")
    assert json.loads(baseline["tab"]["political-context-session"])["completed"] is True
    expect(page.locator(".response-report")).to_have_count(0)
    expect(page.locator("#pilot-download")).to_be_disabled()
    expect(page.locator("#pilot-print")).to_be_disabled()
    assert not COUNTRIES.search(page.locator("body").inner_text())
    assert page.locator("textarea").count() == 0
    isolated(page, baseline)

    fixtures = page.evaluate("""async ()=>{
      const {pilotCases,createPilotFixture,pilotFixtureVersion}=await import('./js/pilot-fixtures.js');
      const {instrument}=await import('./js/content.js');
      const {createTextReport}=await import('./js/debrief.js');
      return {version:pilotFixtureVersion,cases:pilotCases.map(item=>{
        const fixture=createPilotFixture(item.id);
        return {...fixture,text:createTextReport(instrument,fixture.session)};
      })};
    }""")
    ids = [fixture["case"]["id"] for fixture in fixtures["cases"]]
    assert ids == [f"RP0{i}" for i in range(1, 7)]
    options = page.locator("#pilot-case option").evaluate_all("els=>els.map(el=>({value:el.value,text:el.textContent}))")
    assert [option["value"] for option in options if option["value"]] == ids
    assert not re.search(r"mixed|neutral|uncertain|limited|housing|connected", " ".join(option["text"] for option in options), re.I)
    assert len({fixture["session"]["worldId"] for fixture in fixtures["cases"]}) == 1

    for fixture in fixtures["cases"]:
        case_id = fixture["case"]["id"]
        open_case(page, case_id)
        report, interpretation = fixture["report"], fixture["interpretation"]
        assert len(fixture["session"]["answers"]) == 49 and fixture["session"]["completed"] is True
        expect(page.locator("#pilot-example .report-theme")).to_have_count(7)
        raw = page.locator(".theme-evidence [data-item-id], .theme-evidence [data-scenario-id]")
        expect(raw).to_have_count(49)
        assert len(set(raw.evaluate_all("els=>els.map(el=>el.id)"))) == 49
        for reading in interpretation["themes"]:
            theme = page.locator(f'.report-theme[data-theme-id="{reading["id"]}"]')
            expect(theme.locator(".theme-takeaway")).to_have_text(reading["headline"])
            expect(theme.locator(".theme-meaning")).to_have_text(reading["meaning"])
        for insight in interpretation["insights"]:
            card = page.locator(f'.insight-card[data-insight-id="{insight["id"]}"]')
            expect(card).to_contain_text(insight["title"])
            expect(card).to_contain_text(insight["text"])
        expect(page.locator("#pilot-country-reveal")).to_contain_text(report["world"]["inspiration"])
        key = page.locator(".pilot-facilitator-key")
        assert key.evaluate("el=>el.open") is False
        key.locator(":scope > summary").click()
        expect(key).to_contain_text(fixture["case"]["purpose"]["en"])
        expect(key).to_contain_text(fixture["case"]["facilitatorNotes"]["vi"])
        # Switching examples resets the key so a facilitator cannot accidentally
        # carry explanatory hints into the next unaided task.
        with page.expect_download() as download_info:
            page.locator("#pilot-download").click()
        download = download_info.value
        text = Path(download.path()).read_text()
        assert "SYNTHETIC" in download.suggested_filename.upper() and case_id in download.suggested_filename
        assert "SYNTHETIC" in text.splitlines()[0].upper()
        assert case_id in text[:1000] and fixtures["version"] in text[:1000]
        assert text.endswith(fixture["text"])
        isolated(page, baseline)

    # Restore the connected example; navigating its findings opens exact evidence.
    open_case(page, "RP01")
    expect(page.locator(".pilot-synthetic-banner")).to_be_visible()
    expect(page.locator(".pilot-synthetic-banner")).to_contain_text("RP01")
    expect(page.locator(".pilot-synthetic-banner")).to_contain_text(re.compile("synthetic", re.I))
    original_url = page.url
    for link in page.locator(".interpretation-overview [data-evidence-target]").all():
        page.locator(DETAILS).evaluate_all("els=>els.forEach(el=>el.open=false)")
        target_id = link.get_attribute("data-evidence-target")
        link.click()
        target = page.locator(f"#evidence-{target_id}")
        expect(target).to_be_visible()
        expect(target).to_be_focused()
        assert page.url == original_url
        isolated(page, baseline)

    # Print a mixture of opened/closed sections; all 23 must open then restore.
    details = page.locator(DETAILS)
    expect(details).to_have_count(23)
    details.evaluate_all("els=>els.forEach((el,index)=>el.open=index%3===0)")
    before_print = details.evaluate_all("els=>els.map(el=>el.open)")
    page.locator(".pilot-facilitator-key > summary").click()
    assert page.locator(".pilot-facilitator-key").evaluate("el=>el.open") is True
    page.evaluate("""()=>{window.print=()=>{
      window.dispatchEvent(new Event('beforeprint'));
      window.__pilotPrint={open:[...document.querySelectorAll('.report-theme,.theme-evidence,.decision-circumstances')].map(el=>el.open),
        printing:document.body.classList.contains('printing-debrief')};
    };}""")
    page.locator("#pilot-print").click()
    assert page.evaluate("window.__pilotPrint") == {"open": [True] * 23, "printing": True}
    page.emulate_media(media="print")
    expect(page.locator(".pilot-synthetic-banner")).to_be_visible()
    expect(page.locator("#pilot-example .response-report")).to_be_visible()
    expect(page.locator("#pilot-print")).to_be_hidden()
    expect(page.locator(".pilot-facilitator-key")).to_be_hidden()
    page.emulate_media(media="screen")
    page.evaluate("window.dispatchEvent(new Event('afterprint'))")
    assert details.evaluate_all("els=>els.map(el=>el.open)") == before_print
    assert page.evaluate("document.body.classList.contains('printing-debrief')") is False
    assert page.locator(".pilot-facilitator-key").evaluate("el=>el.open") is True
    isolated(page, baseline)

    # Inspect the default and expanded result layout on desktop and a small phone.
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    details.evaluate_all("els=>els.forEach(el=>el.open=false)")
    page.locator(".pilot-synthetic-banner").evaluate("el=>el.scrollIntoView({block:'start'})")
    no_overflow(page, "desktop pilot report")
    page.screenshot(path=str(SCREENSHOTS / "pilot-0.4.4-desktop.png"))
    page.set_viewport_size({"width": 375, "height": 812})
    no_overflow(page, "mobile pilot report")
    page.screenshot(path=str(SCREENSHOTS / "pilot-0.4.4-mobile.png"))
    details.evaluate_all("els=>els.forEach(el=>el.open=true)")
    for theme in page.locator(".report-theme").all():
        theme.scroll_into_view_if_needed()
        no_overflow(page, "mobile expanded theme")
    page.locator('.report-theme[data-theme-id="ownership-provision-control"]').evaluate("el=>el.scrollIntoView({block:'start'})")
    page.screenshot(path=str(SCREENSHOTS / "pilot-0.4.4-mobile-expanded.png"))
    isolated(page, baseline)

    # URL data neither opens a case automatically nor enters the rendered DOM.
    page.goto(PAGE + '?case=%3Cimg%20src=x%20onerror=window.__injected=true%3E#RP01', wait_until="networkidle")
    expect(page.locator(".response-report")).to_have_count(0)
    assert not COUNTRIES.search(page.locator("body").inner_text())
    assert page.evaluate("window.__injected===true") is False
    assert page.locator('img[src="x"]').count() == 0
    isolated(page, baseline)

    assert not any(urlsplit(url).path.endswith("/js/app.js") for url in requests)
    assert not errors, errors
    assert not external, external
    assert not failed, failed

    # Author guides and blank log must ship with the public lab under a subpath.
    links = page.locator('a[href*="docs/results-pilot/"]').evaluate_all("els=>els.map(el=>el.href)")
    assert links
    for href in set(links):
        response = context.request.get(href)
        assert response.status == 200, (href, response.status)
        if href.endswith("observation-log-template.csv"):
            assert len([line for line in response.text().splitlines() if line.strip()]) == 1

    browser.close()

print("PASS: six synthetic cases, exact result evidence, no storage access, labeled downloads, print restoration, neutral entry, guides, and mobile layout.")
