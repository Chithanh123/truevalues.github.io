"""Exercise the integrated 109-question quiz on a source or project-path site.

POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8071 python3 tests/browser_combined.py
All response and storage fixtures are synthetic and use a disposable profile.
"""
import json
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE = os.environ.get('POLITICAL_CONTEXT_TEST_URL', 'http://127.0.0.1:8071').rstrip('/')
COMBINED = 'political-context-combined-v1'
LEGACY = 'political-context-session'
COUNTRY = re.compile(r'\b(?:United States|United Kingdom|Germany|Japan|Fiji|Viet ?Nam|Vietnam|India|Central African Republic)\b', re.I)


def action(page, name):
    page.locator(f'[data-action="{name}"]:visible').first.click()


def no_reveal(page, stage):
    text = page.locator('body').inner_text()
    assert not COUNTRY.search(text), (stage, COUNTRY.findall(text))
    labels = page.locator('[aria-label], [title]').evaluate_all("els=>els.map(e=>[e.getAttribute('aria-label'),e.getAttribute('title')].filter(Boolean).join(' ')).join(' ')")
    assert not COUNTRY.search(labels), (stage, labels)
    assert page.locator('#country-reveal:visible').count() == 0


def store(page, key=COMBINED, scope='sessionStorage'):
    return page.evaluate('([scope,key])=>JSON.parse(window[scope].getItem(key))', [scope, key])


def fit(page, stage):
    sizes = page.evaluate('()=>({width:document.documentElement.scrollWidth,viewport:innerWidth})')
    assert sizes['width'] <= sizes['viewport'] + 1, (stage, sizes)


def legacy_fixture(complete):
    script = '''
import {instrument} from './js/content.js';
import {createSession,setAnswer,makeSteps,validateSession} from './js/engine.js';
let s=createSession(instrument,'synthetic-combined-migration');
const steps=makeSteps(instrument), complete=process.argv[1]==='complete';
const primary=steps.filter(x=>['statement','foundation','scenario'].includes(x.type));
for(const step of (complete?primary:primary.slice(0,4))) s=setAnswer(s,step.id,
  step.type==='scenario'?{kind:'skip',reasonId:null}:{kind:'skip'});
s.stepIndex=complete?steps.length-1:4;s.completed=complete;s.saveOnDevice=false;
if(!validateSession(instrument,s).valid)throw Error('invalid fixture');
console.log(JSON.stringify(s));
'''
    return subprocess.check_output(['node','--input-type=module','-e',script,'complete' if complete else 'incomplete'],cwd=ROOT,text=True).strip()


def select_original(page, index):
    values = page.locator('input[data-response="value"]:visible')
    choices = page.locator('input[data-response="choice"]:visible')
    if values.count():
        if index % 9 == 1 and page.locator('input[data-response="uncertain"]:visible').count():
            page.locator('input[data-response="uncertain"]:visible').first.check()
        else:
            values.nth(index % values.count()).check()
    elif choices.count():
        if index % 3 == 0 and page.locator('input[data-response="none"]:visible').count():
            page.locator('input[data-response="none"]:visible').first.check()
        else:
            choices.nth(index % choices.count()).check()
    else:
        return False
    return True


def check_dialog(page, stage):
    links = page.locator('[data-action="worlds"]:visible')
    if not links.count():
        return
    links.first.click()
    expect(page.locator('#info-dialog')).to_be_visible()
    page.locator('#dialog-content details').evaluate_all('els=>els.forEach(e=>e.open=true)')
    no_reveal(page, stage)
    action(page, 'close-dialog')


def run_full(page):
    page.goto(BASE+'/',wait_until='networkidle')
    no_reveal(page, 'home')
    action(page, 'begin')
    expect(page.locator('#info-dialog')).to_be_visible()
    saving=page.locator('#initial-save')
    expect(saving).to_be_visible()
    saving.check()
    action(page, 'start')
    expect(page.locator('input[data-response="value"]:visible')).to_have_count(5)
    page.set_viewport_size({'width':375,'height':812});fit(page,'original question')
    initial_world=store(page)['legacy']['worldId']
    check_dialog(page, 'original world directory')
    visited_original=0
    did_reload=False
    while not page.locator('.combined-question:visible').count():
        no_reveal(page, f'original step {visited_original}')
        assert page.locator('[data-action="export"]:visible, [data-action="report"]:visible').count()==0
        answered=select_original(page, visited_original)
        if answered:
            visited_original+=1
            assert visited_original<=49, 'original route exceeds 49 items'
        action(page,'next')
        if visited_original>=4 and not did_reload:
            did_reload=True
            before=store(page)
            page.reload(wait_until='networkidle')
            no_reveal(page,'original reload')
            action(page,'resume')
            assert store(page)['legacy']['worldId']==initial_world
            assert store(page)['legacy']['answers']==before['legacy']['answers']
            assert store(page,scope='localStorage')['legacy']['answers']==before['legacy']['answers']
            new_tab=page.context.new_page()
            new_tab.goto(BASE+'/',wait_until='networkidle')
            no_reveal(new_tab,'device restore in fresh tab')
            action(new_tab,'resume')
            assert store(new_tab,scope='localStorage')['legacy']['worldId']==initial_world
            assert store(new_tab,scope='localStorage')['legacy']['answers']==before['legacy']['answers']
            new_tab.close()
    assert visited_original==49, visited_original
    before=store(page)
    assert before['legacy']['worldId']==initial_world
    assert before['legacy']['completed'] is True
    assert len(before['legacy']['answers'])==49
    assert before['expanded']['index']==0
    no_reveal(page,'between original and extended')
    check_dialog(page,'world dialog after original section')
    assert page.locator('[data-action="export"]:visible, [data-action="report"]:visible').count()==0

    # Back across the boundary and re-enter without losing original choices.
    action(page,'combined-back')
    assert not page.locator('.combined-question:visible').count()
    no_reveal(page,'back to original')
    action(page,'next')
    expect(page.locator('.combined-question')).to_be_visible()
    assert store(page)['legacy']['answers']==before['legacy']['answers']

    did_reload=False
    seen=[]
    catalog=page.evaluate("async()=>await (await fetch('./data/question-catalog.json')).json()")
    item_map={item['id']:item for item in catalog['items']}
    while page.locator('.combined-question:visible').count():
        card=page.locator('.combined-question:visible')
        item_id=card.get_attribute('data-item-id')
        seen.append(item_id)
        assert len(seen)<=60
        no_reveal(page, f'new item {item_id}')
        assert store(page)['legacy']['worldId']==initial_world
        scenario=page.locator('input[name="combined-response"][value="A"]').count()>0
        if scenario: fit(page, f'mobile situation {item_id}')
        item=item_map[item_id]
        if scenario:
            expect(page.locator('#step-title')).to_have_text(item['title'])
            for option in item['options']:
                expect(page.locator(f'input[name="combined-response"][value="{option["id"]}"]').locator('..')).to_contain_text(option['texts']['en']['label'])
        else:
            expect(page.locator('#step-title')).to_have_text(item['texts']['en']['text'])
        value= (['A','B','C','uncertain','none','skip'][len(seen)%6] if scenario
                else ['strongly_agree','agree','neutral','disagree','strongly_disagree','uncertain','skip'][len(seen)%7])
        page.locator(f'input[name="combined-response"][value="{value}"]').check()
        if scenario:
            preference=page.locator('#combined-preference')
            expect(preference).to_be_visible()
            preference.select_option('A')
            if value in ('A','B','C'):
                reason=page.locator('#combined-reason')
                expect(reason).to_be_visible()
                options=reason.locator('option').evaluate_all('els=>els.map(e=>e.value).filter(Boolean)')
                if options: reason.select_option(options[0])
        action(page,'combined-next')
        if len(seen)==2 and not did_reload:
            did_reload=True
            saved_before=store(page)
            page.reload(wait_until='networkidle')
            no_reveal(page,'extended reload')
            action(page,'resume')
            assert store(page)['legacy']['worldId']==initial_world
            assert store(page)['expanded']['answers']==saved_before['expanded']['answers']
    assert len(seen)==60 and len(set(seen))==60, (len(seen),len(set(seen)))
    assert {f'CR-{i}{c}' for i in range(13,25) for c in 'ABCD'} <= set(seen)
    assert {f'CR-S{i:02}' for i in range(7,19)} <= set(seen)
    completed=store(page)
    assert completed['legacy']['worldId']==initial_world
    assert completed['expanded']['index']==60
    assert len(completed['expanded']['answers'])==60
    expect(page.locator('#country-reveal')).to_be_visible()
    assert COUNTRY.search(page.locator('#country-reveal').inner_text())
    expect(page.locator('.response-report')).to_be_visible()
    expect(page.locator('.expanded-results')).to_be_visible()
    fit(page,'combined results')
    assert page.locator('.expanded-result-theme').count()==12
    assert page.locator('[data-action="export"]:visible').count()==1
    with page.expect_download() as event:
        action(page,'export')
    data=json.loads(Path(event.value.path()).read_text())
    serialized=json.dumps(data,ensure_ascii=False)
    for item_id in seen: assert item_id in serialized, item_id
    assert COUNTRY.search(serialized)
    with page.expect_download() as event:
        action(page,'report')
    report=Path(event.value.path()).read_text()
    for item_id in seen: assert item_id in report, item_id
    assert COUNTRY.search(report)
    # Printing expands all combined report details and restores their prior state.
    details=page.locator('.expanded-result-theme, .expanded-result-theme details, .expanded-reading details')
    assert details.count() >= 24
    details.evaluate_all('els=>els.forEach((el,i)=>el.open=i%3===0)')
    before_print=details.evaluate_all('els=>els.map(el=>el.open)')
    page.evaluate("""()=>{window.print=()=>{
      window.dispatchEvent(new Event('beforeprint'));
      window.__combinedPrint=[...document.querySelectorAll('.expanded-result-theme,.expanded-result-theme details,.expanded-reading details')].map(e=>e.open);
    }}""")
    action(page,'print-report')
    assert all(page.evaluate('window.__combinedPrint'))
    page.evaluate("window.dispatchEvent(new Event('afterprint'))")
    assert details.evaluate_all('els=>els.map(el=>el.open)')==before_print
    # Browser-only downloads and printing do not mutate the full answer record.
    assert store(page)==completed



def test_tab_only(page):
    page.goto(BASE+'/',wait_until='networkidle')
    action(page,'begin')
    expect(page.locator('#initial-save')).not_to_be_checked()
    action(page,'start')
    expect(page.locator('input[data-response="value"]:visible')).to_have_count(5)
    assert page.evaluate('key=>localStorage.getItem(key)', COMBINED) is None
    page.locator('input[data-response="value"][value="2"]:visible').check()
    before=store(page)
    assert before['legacy']['answers'], 'Current selection must be saved without requiring Continue'
    page.reload(wait_until='networkidle')
    no_reveal(page,'tab-only reload')
    action(page,'resume')
    expect(page.locator('input[data-response="value"][value="2"]:visible')).to_be_checked()
    assert store(page)['legacy']['answers']==before['legacy']['answers']
    assert page.evaluate('key=>localStorage.getItem(key)', COMBINED) is None

def test_legacy(page, complete):
    raw=legacy_fixture(complete)
    page.goto(BASE+'/',wait_until='networkidle')
    page.evaluate('([key,raw])=>sessionStorage.setItem(key,raw)', [LEGACY,raw])
    page.reload(wait_until='networkidle')
    if not complete: no_reveal(page,'legacy unfinished decision')
    action(page,'resume')
    expect(page.locator('[data-action="migrate-legacy"]:visible')).to_have_count(1)
    assert page.evaluate('key=>sessionStorage.getItem(key)', LEGACY)==raw
    action(page,'continue-legacy')
    assert page.evaluate('key=>sessionStorage.getItem(key)', COMBINED) is None
    if complete:
        expect(page.locator('#country-reveal')).to_be_visible()
    else:
        no_reveal(page,'legacy route still available')
    action(page,'home')
    action(page,'resume')
    action(page,'migrate-legacy')
    assert page.evaluate('key=>sessionStorage.getItem(key)', LEGACY)==raw
    candidate=store(page)
    prior=json.loads(raw)
    assert candidate['legacy']['worldId']==prior['worldId']
    assert candidate['legacy']['answers']==prior['answers']
    assert candidate['expanded']['index']==0
    if not complete: no_reveal(page,'migrated unfinished')


def test_recovery_and_erasure(page):
    legacy_raw=legacy_fixture(False)
    stale=json.dumps({'schemaVersion':1,'legacy':json.loads(legacy_raw),
      'expanded':{'index':0,'answers':{}},'catalogFingerprint':'0'*64},separators=(',',':'))
    standalone='synthetic-unrelated-followup-save'
    page.goto(BASE+'/',wait_until='networkidle')
    page.evaluate('([legacy,raw,combined,bad,standalone])=>{sessionStorage.setItem(legacy,raw);sessionStorage.setItem(combined,bad);localStorage.setItem("political-context-expanded-v1",standalone)}',
        [LEGACY,legacy_raw,COMBINED,stale,standalone])
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED)==stale
    action(page,'resume')
    expect(page.locator('[data-action="migrate-legacy"]')).to_be_disabled()
    action(page,'close-dialog')
    with page.expect_download() as event:
        action(page,'recover-combined')
    recovered=json.loads(Path(event.value.path()).read_text())
    assert recovered['previousSave']==stale
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED)==stale
    action(page,'erase-combined-recovery')
    action(page,'close-dialog')
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED)==stale
    action(page,'erase-combined-recovery')
    action(page,'confirm-erase-combined-recovery')
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED) is None
    assert page.evaluate('key=>sessionStorage.getItem(key)',LEGACY)==legacy_raw
    assert page.evaluate('key=>localStorage.getItem(key)','political-context-expanded-v1')==standalone
    action(page,'resume')
    action(page,'migrate-legacy')
    assert store(page)['legacy']['answers']==json.loads(legacy_raw)['answers']
    action(page,'privacy')
    action(page,'erase')
    action(page,'confirm-erase')
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED) is None
    assert page.evaluate('key=>sessionStorage.getItem(key)',LEGACY)==legacy_raw
    assert page.evaluate('key=>localStorage.getItem(key)','political-context-expanded-v1')==standalone


def seed_coexisting_records(page):
    legacy_raw=legacy_fixture(False)
    stale=json.dumps({'schemaVersion':1,'legacy':json.loads(legacy_raw),
      'expanded':{'index':0,'answers':{}},'catalogFingerprint':'0'*64},separators=(',',':'))
    standalone='synthetic-separate-followup'
    page.goto(BASE+'/',wait_until='networkidle')
    page.evaluate('([legacy,raw,combined,bad,standalone])=>{sessionStorage.setItem(legacy,raw);sessionStorage.setItem(combined,bad);localStorage.setItem("political-context-expanded-v1",standalone)}',
        [LEGACY,legacy_raw,COMBINED,stale,standalone])
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    action(page,'resume')
    action(page,'continue-legacy')
    return legacy_raw,stale,standalone


def test_restart_with_incompatible_combined(page):
    legacy_raw,stale,standalone=seed_coexisting_records(page)
    action(page,'home')
    action(page,'restart')
    button=page.locator('[data-action="confirm-restart"]:visible')
    expect(button).to_have_count(1)
    if button.is_enabled(): button.click()
    assert page.evaluate('key=>sessionStorage.getItem(key)',LEGACY)==legacy_raw
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED)==stale
    assert page.evaluate('key=>localStorage.getItem(key)','political-context-expanded-v1')==standalone
    if page.locator('#info-dialog').is_visible(): action(page,'close-dialog')
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)


def test_erase_legacy_with_incompatible_combined(page):
    legacy_raw,stale,standalone=seed_coexisting_records(page)
    action(page,'privacy')
    action(page,'erase')
    action(page,'confirm-erase')
    assert page.evaluate('key=>sessionStorage.getItem(key)',LEGACY) is None
    assert page.evaluate('key=>sessionStorage.getItem(key)',COMBINED)==stale
    assert page.evaluate('key=>localStorage.getItem(key)','political-context-expanded-v1')==standalone
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    with page.expect_download() as event: action(page,'recover-combined')
    assert json.loads(Path(event.value.path()).read_text())['previousSave']==stale


with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
    errors=[];failed=[];external=[]
    def setup():
        context=browser.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
        page=context.new_page();page.set_default_timeout(10000)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('requestfailed',lambda r:failed.append(r.url))
        page.on('request',lambda r:external.append(r.url) if urlsplit(r.url).scheme in {'http','https'} and urlsplit(r.url).netloc != urlsplit(BASE).netloc else None)
        return context,page
    ctx,page=setup();run_full(page);ctx.close()
    ctx,page=setup();test_tab_only(page);ctx.close()
    ctx,page=setup();test_recovery_and_erasure(page);ctx.close()
    ctx,page=setup();test_restart_with_incompatible_combined(page);ctx.close()
    ctx,page=setup();test_erase_legacy_with_incompatible_combined(page);ctx.close()
    for complete in [False,True]:
        ctx,page=setup();test_legacy(page,complete);ctx.close()
    assert not errors,errors
    assert not failed,failed
    assert not external,external
    browser.close()
print('PASS: 109-question combined route, save/reload, legacy migration, setting secrecy, integrated results and exports, mobile, and no external requests.')
