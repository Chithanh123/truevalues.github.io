"""Exercise the experimental 60-question assessment against a served site.

POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8000 python3 tests/browser_expanded.py
The seeded legacy session is synthetic and confined to a disposable browser profile.
"""
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get('POLITICAL_CONTEXT_TEST_URL', 'http://127.0.0.1:8000').rstrip('/')
LEGACY = 'political-context-session'
EXPANDED = 'political-context-expanded-v1'
SCREENSHOTS = Path(os.environ.get('POLITICAL_CONTEXT_SCREENSHOTS', '/workspace/scratch'))
COUNTRY = re.compile(r'\b(?:United States|United Kingdom|Germany|Japan|Fiji|Viet ?Nam|Vietnam|India|Central African Republic)\b', re.I)


def old_session():
    return subprocess.check_output(['node', '--input-type=module', '-e', '''
      import {instrument} from './js/content.js';
      import {createSession, validateSession} from './js/engine.js';
      const s = createSession(instrument, 'synthetic-legacy-isolation');
      if (!validateSession(instrument,s).valid) throw Error('invalid legacy fixture');
      console.log(JSON.stringify(s));
    '''], cwd=ROOT, text=True).strip()


def storage_probe(legacy):
    return 'const legacyValue=' + json.dumps(legacy) + ';' + r'''
      (()=>{
        const original = Object.fromEntries(['getItem','setItem','removeItem','clear'].map(k=>[k,Storage.prototype[k]]));
        for(const store of [localStorage,sessionStorage]) original.setItem.call(store,'political-context-session',legacyValue);
        const calls=[];
        Object.defineProperty(window,'__legacyProbe',{value:{calls,inspect:()=>({
          device:original.getItem.call(localStorage,'political-context-session'),
          tab:original.getItem.call(sessionStorage,'political-context-session')
        })}});
        for(const name of ['getItem','setItem','removeItem']) Storage.prototype[name]=function(...args){
          if(args[0]==='political-context-session') calls.push(name);
          return original[name].apply(this,args);
        };
        Storage.prototype.clear=function(){calls.push('clear');return original.clear.call(this)};
      })();
    '''


def safe_storage(page, before):
    assert page.evaluate('window.__legacyProbe.calls') == []
    assert page.evaluate('window.__legacyProbe.inspect()') == before


def no_spoiler(page, label):
    text = page.locator('body').inner_text()
    assert not COUNTRY.search(text), (label, COUNTRY.findall(text))
    labels = page.locator('[aria-label], [title]').evaluate_all(
        "els => els.map(el => [el.getAttribute('aria-label'), el.getAttribute('title')].filter(Boolean).join(' ')).join(' ')"
    )
    assert not COUNTRY.search(labels), (label, labels)


def fit(page, label):
    sizes = page.evaluate('()=>({width:document.documentElement.scrollWidth,viewport:innerWidth})')
    assert sizes['width'] <= sizes['viewport'] + 1, (label, sizes)


def radio(page, value):
    item = page.locator(f'input[name="response"][value="{value}"]')
    assert item.count() == 1, (value, item.count())
    item.check()


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True)
    ctx = browser.new_context(viewport={'width':1280,'height':900}, accept_downloads=True)
    ctx.add_init_script(script=storage_probe(old_session()))
    page = ctx.new_page()
    page.set_default_timeout(10000)
    errors, external, failed = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('requestfailed', lambda request: failed.append(request.url))
    page.on('request', lambda request: external.append(request.url)
            if urlsplit(request.url).scheme in {'http','https'} and urlsplit(request.url).netloc != urlsplit(BASE).netloc else None)
    page.goto(BASE + '/expanded.html', wait_until='networkidle')
    before = page.evaluate('window.__legacyProbe.inspect()')
    no_spoiler(page, 'initial')
    assert page.evaluate('(key)=>localStorage.getItem(key)', EXPANDED) is None
    safe_storage(page, before)
    expect(page.locator('#expanded-start')).to_be_visible()
    expect(page.locator('#expanded-start')).to_be_enabled()
    page.locator('#expanded-start').click()
    expect(page.locator('input[name="response"]').first).to_be_visible()
    no_spoiler(page, 'first question')
    assert page.evaluate('(key)=>localStorage.getItem(key)', EXPANDED) is None

    # An unanswered response cannot advance; back/re-answer must be preserved.
    initial = page.locator('#expanded-content').inner_text()
    page.locator('#expanded-next').click()
    assert page.locator('#expanded-content').inner_text() == initial
    radio(page, 'strongly_agree')
    page.locator('#expanded-next').click()
    second = page.locator('#expanded-content').inner_text()
    assert second != initial
    page.locator('#expanded-back').click()
    assert page.locator('#expanded-content').inner_text() == initial
    expect(page.locator('input[name="response"][value="strongly_agree"]')).to_be_checked()
    radio(page, 'agree')
    page.locator('#expanded-next').click()
    assert page.locator('#expanded-content').inner_text() == second
    radio(page, 'uncertain')
    page.locator('#expanded-next').click()
    radio(page, 'skip')
    page.locator('#expanded-next').click()

    # Saving is opt-in. A reload retains world, position and authored answers.
    page.locator('#expanded-save').check()
    saved = page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))', EXPANDED)
    assert saved['index'] == 3 and len(saved['answers']) == 3
    world = saved['worldId']
    safe_storage(page, before)
    page.reload(wait_until='networkidle')
    no_spoiler(page, 'after reload')
    assert page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))', EXPANDED)['worldId'] == world
    expect(page.locator('#expanded-start')).to_be_enabled()
    page.locator('#expanded-start').click()
    expect(page.locator('input[name="response"]').first).to_be_visible()
    safe_storage(page, before)

    # Complete all remaining questions with mixed responses. Exercise every
    # alternate scenario status and optional reason and personal preference.
    statement_count, scenario_count = 3, 0
    reasons_seen = False
    pages_seen = 3
    while page.locator('input[name="response"]:visible').count():
        pages_seen += 1
        assert pages_seen <= 60, 'route presented more than 60 items'
        no_spoiler(page, f'question {pages_seen}')
        if page.locator('input[name="response"][value="A"]').count():
            scenario_count += 1
            values = ['A','B','C','uncertain','none','skip']
            selected = values[(scenario_count - 1) % len(values)]
            radio(page, selected)
            if selected in {'A','B','C'}:
                reason = page.locator('#expanded-reason')
                preference = page.locator('#expanded-preference')
                expect(reason).to_be_visible()
                expect(preference).to_be_visible()
                available = reason.locator('option').evaluate_all('els=>els.map(x=>x.value).filter(Boolean)')
                assert available
                reason.select_option(available[0])
                preference.select_option('C')
                reasons_seen = True
            elif selected == 'none':
                preference = page.locator('#expanded-preference')
                expect(preference).to_be_visible()
                preference.select_option('A')
            if scenario_count == 1:
                SCREENSHOTS.mkdir(parents=True, exist_ok=True)
                page.locator('#expanded-step').scroll_into_view_if_needed()
                page.screenshot(path=str(SCREENSHOTS / 'expanded-desktop.png'))
                page.set_viewport_size({'width':375,'height':812})
                fit(page, 'scenario mobile')
                page.locator('#expanded-step').scroll_into_view_if_needed()
                page.screenshot(path=str(SCREENSHOTS / 'expanded-mobile.png'))
                page.set_viewport_size({'width':1280,'height':900})
        else:
            statement_count += 1
            values = ['strongly_agree','agree','neutral','disagree','strongly_disagree','uncertain','skip']
            radio(page, values[(statement_count - 1) % len(values)])
        page.locator('#expanded-next').click()
    assert (statement_count, scenario_count, pages_seen) == (48, 12, 60)
    assert reasons_seen
    expect(page.locator('#expanded-download-json')).to_be_visible()
    expect(page.locator('#expanded-download-text')).to_be_visible()
    safe_storage(page, before)
    page.set_viewport_size({'width':375,'height':812})
    fit(page, 'results mobile')
    page.locator('#expanded-result').scroll_into_view_if_needed()
    page.screenshot(path=str(SCREENSHOTS / 'expanded-results-mobile.png'))
    with page.expect_download() as info:
        page.locator('#expanded-download-json').click()
    payload = json.loads(Path(info.value.path()).read_text())
    assert payload['schemaVersion'] == 1 and payload['worldId'] == world
    assert payload['index'] == 60 and len(payload['answers']) == 60
    assert len({key for key in payload['answers'] if re.fullmatch(r'CR-\d{2}[A-D]', key)}) == 48
    assert len({key for key in payload['answers'] if re.fullmatch(r'CR-S\d{2}', key)}) == 12
    decisions = [value for key, value in payload['answers'].items() if key.startswith('CR-S')]
    assert {value['choice'] for value in decisions} == {'A','B','C','uncertain','none','skip'}
    assert any(value['reason'] and value['preference'] == 'C' for value in decisions)
    assert any(value['choice'] == 'none' and value['reason'] is None and value['preference'] == 'A' for value in decisions)
    assert all('score' not in value for value in decisions)
    with page.expect_download() as info:
        page.locator('#expanded-download-text').click()
    report = Path(info.value.path()).read_text()
    assert COUNTRY.search(report), 'completed text report should reveal the assigned setting inspiration'
    safe_storage(page, before)
    # Editing after completion hides the inspiration again until the route is complete.
    page.locator('#expanded-edit').click()
    no_spoiler(page, 'editing after results')
    expect(page.locator('input[name="response"]:checked')).to_have_count(1)
    page.locator('#expanded-next').click()
    expect(page.locator('#expanded-reveal')).to_be_visible()
    safe_storage(page, before)

    # Explicit reset clears only this experimental session and its device copy.
    page.on('dialog', lambda dialog: dialog.accept())
    page.locator('#expanded-reset').click()
    assert page.evaluate('(key)=>localStorage.getItem(key)', EXPANDED) is None
    safe_storage(page, before)

    # A save from a different catalog is not silently reinterpreted or erased.
    saved['catalogFingerprint'] = '0' * 64
    stale_raw = json.dumps(saved, ensure_ascii=False)
    page.evaluate('([key, value])=>localStorage.setItem(key, value)', [EXPANDED, stale_raw])
    page.reload(wait_until='networkidle')
    expect(page.locator('#expanded-recover')).to_be_visible()
    expect(page.locator('#expanded-start')).to_be_disabled()
    assert page.evaluate('(key)=>localStorage.getItem(key)', EXPANDED) == stale_raw
    with page.expect_download() as info:
        page.locator('#expanded-recover').click()
    assert Path(info.value.path()).read_text() == stale_raw
    page.locator('#expanded-reset').click()
    assert page.evaluate('(key)=>localStorage.getItem(key)', EXPANDED) is None
    safe_storage(page, before)
    assert not errors, errors
    assert not external, external
    assert not failed, failed
    browser.close()

print('PASS: 60-item expanded route, response types, reload, country-reveal timing, legacy-save isolation, exports, reset, and mobile.')
