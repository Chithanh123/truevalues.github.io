"""Exercise conflicting browser-storage copies without deleting user data.

POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8081 python3 tests/browser_storage_recovery.py
Every session and recovery value below is synthetic.
"""
import json
import os
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('POLITICAL_CONTEXT_TEST_URL', 'http://127.0.0.1:8081').rstrip('/')
COMBINED = 'political-context-combined-v1'
LEGACY = 'political-context-session'


def action(page, name):
    page.locator(f'[data-action="{name}"]:visible').first.click()


def seed(page, combined_tab=None, combined_device=None, legacy_tab=None, legacy_device=None):
    page.goto(BASE + '/', wait_until='networkidle')
    page.evaluate('''([combined,legacy,ct,cd,lt,ld]) => {
        for (const store of [sessionStorage,localStorage]) {store.removeItem(combined);store.removeItem(legacy);}
        if (ct !== null) sessionStorage.setItem(combined,ct);
        if (cd !== null) localStorage.setItem(combined,cd);
        if (lt !== null) sessionStorage.setItem(legacy,lt);
        if (ld !== null) localStorage.setItem(legacy,ld);
    }''', [COMBINED, LEGACY, combined_tab, combined_device, legacy_tab, legacy_device])
    page.reload(wait_until='networkidle')


def raw(page, scope, key):
    return page.evaluate('([scope,key])=>window[scope].getItem(key)', [scope, key])


def fixtures(page):
    page.goto(BASE + '/', wait_until='networkidle')
    return page.evaluate('''async () => {
      const {instrument}=await import('./js/content.js');
      const {createSession}=await import('./js/engine.js');
      const {createCombined}=await import('./js/combined-session.js');
      const {createExpandedFingerprint}=await import('./js/expanded-fingerprint.js');
      const catalog=await (await fetch('./data/question-catalog.json')).json();
      const f=await createExpandedFingerprint(catalog,instrument.worlds);
      const a=createSession(instrument,'synthetic-recovery-tab');a.saveOnDevice=true;
      const b=createSession(instrument,'synthetic-recovery-device');b.saveOnDevice=true;
      return {ca:JSON.stringify(createCombined(a,f)),cb:JSON.stringify(createCombined(b,f)),
              la:JSON.stringify(a),lb:JSON.stringify(b)};
    }''')


def erase_protected(page, kind):
    action(page, 'erase-' + kind + '-recovery')
    expect(page.locator('#info-dialog')).to_be_visible()
    action(page, 'confirm-erase-' + kind + '-recovery')


def choose_answer(page, legacy=False):
    action(page, 'resume')
    if legacy:
        expect(page.locator('[data-action="continue-legacy"]:visible')).to_have_count(1)
        action(page, 'continue-legacy')
    radio=page.locator('input[data-response="value"]:visible').first
    expect(radio).to_be_visible()
    radio.check()


def test_combined_cross_scope(page, valid_scope, invalid_scope, valid):
    bad='{invalid synthetic combined'
    args = {'combined_tab':valid if valid_scope=='sessionStorage' else bad,
            'combined_device':valid if valid_scope=='localStorage' else bad}
    seed(page, **args)
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    choose_answer(page)
    assert raw(page, invalid_scope, COMBINED)==bad, 'incompatible bytes were overwritten'
    active_after=raw(page, valid_scope, COMBINED)
    assert json.loads(active_after)['legacy']['answers'], 'active answer did not persist'
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    with page.expect_download() as download:
        action(page, 'recover-combined')
    with open(download.value.path(), encoding='utf-8') as file:
        assert json.load(file)['previousSave']==bad
    erase_protected(page, 'combined')
    assert raw(page, valid_scope, COMBINED)==active_after, 'active copy was erased or replaced'
    assert json.loads(raw(page, invalid_scope, COMBINED))['legacy']['answers'], 'active progress not restored after recovery'
    assert page.locator('[data-action="recover-combined"]:visible').count()==0


def test_two_bad_and_empty(page):
    seed(page, combined_tab='', combined_device='{other invalid')
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    expect(page.locator('[data-action="begin"]:visible')).to_have_count(1)
    action(page, 'begin')
    expect(page.locator('[data-action="start"]:visible')).to_be_disabled()
    action(page, 'close-dialog')
    with page.expect_download() as download:
        action(page, 'recover-combined')
    with open(download.value.path(), encoding='utf-8') as file:
        assert json.load(file)['previousSave']==''
    erase_protected(page, 'combined')
    assert raw(page,'sessionStorage',COMBINED) is None
    assert raw(page,'localStorage',COMBINED)=='{other invalid'
    expect(page.locator('[data-action="recover-combined"]:visible')).to_have_count(1)
    erase_protected(page, 'combined')
    assert raw(page,'localStorage',COMBINED) is None
    assert page.locator('[data-action="recover-combined"]:visible').count()==0


def test_two_bad_legacy_and_changed_copy(page, valid):
    seed(page, legacy_tab='', legacy_device='{other old')
    expect(page.locator('[data-action="recover-save"]:visible')).to_have_count(1)
    with page.expect_download() as download:
        action(page, 'recover-save')
    with open(download.value.path(), encoding='utf-8') as file:
        assert json.load(file)['previousSave']==''
    erase_protected(page, 'legacy')
    assert raw(page,'sessionStorage',LEGACY) is None
    assert raw(page,'localStorage',LEGACY)=='{other old'
    expect(page.locator('[data-action="recover-save"]:visible')).to_have_count(1)
    erase_protected(page, 'legacy')
    assert raw(page,'localStorage',LEGACY) is None
    assert page.locator('[data-action="recover-save"]:visible').count()==0

    seed(page, combined_tab=valid, combined_device='{first')
    page.evaluate('([key,value])=>localStorage.setItem(key,value)', [COMBINED,'{changed elsewhere'])
    action(page,'erase-combined-recovery')
    action(page,'confirm-erase-combined-recovery')
    assert raw(page,'localStorage',COMBINED)=='{changed elsewhere'
    assert raw(page,'sessionStorage',COMBINED)==valid
    expect(page.locator('#announcement')).to_contain_text('changed in another tab')


def test_legacy_cross_scope(page, valid_scope, invalid_scope, valid, bad):
    args={'legacy_tab': valid if valid_scope=='sessionStorage' else bad,
          'legacy_device':valid if valid_scope=='localStorage' else bad}
    seed(page, **args)
    expect(page.locator('[data-action="recover-save"]:visible')).to_have_count(1)
    choose_answer(page, legacy=True)
    assert raw(page,invalid_scope,LEGACY)==bad, (valid_scope, invalid_scope, bad[:50], str(raw(page,invalid_scope,LEGACY))[:80])
    active_after=raw(page,valid_scope,LEGACY)
    assert json.loads(active_after)['answers']
    expect(page.locator('[data-action="recover-save"]:visible')).to_have_count(1)
    with page.expect_download() as download:
        action(page,'recover-save')
    with open(download.value.path(),encoding='utf-8') as file:
        assert json.load(file)['previousSave']==bad
    erase_protected(page,'legacy')
    assert raw(page,valid_scope,LEGACY)==active_after, 'active old assessment was erased'
    assert json.loads(raw(page,invalid_scope,LEGACY))['answers']


with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True)
    def new_page():
        ctx=browser.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
        page=ctx.new_page();page.set_default_timeout(10000)
        return ctx,page
    ctx,page=new_page(); data=fixtures(page);ctx.close()
    for good,bad in [('sessionStorage','localStorage'),('localStorage','sessionStorage')]:
        ctx,page=new_page();test_combined_cross_scope(page,good,bad,data['ca']);ctx.close()
    ctx,page=new_page();test_two_bad_and_empty(page);ctx.close()
    ctx,page=new_page();test_two_bad_legacy_and_changed_copy(page,data['ca']);ctx.close()
    for good,bad in [('sessionStorage','localStorage'),('localStorage','sessionStorage')]:
        for bad_value in ['{invalid synthetic old',data['lb']]:
            if bad == 'sessionStorage' and bad_value == data['lb']:
                continue  # When both are valid, the tab copy is deliberately active.
            ctx,page=new_page();test_legacy_cross_scope(page,good,bad,data['la'],bad_value);ctx.close()
    browser.close()
print('PASS: incompatible, distinct and empty tab/device saves remain recoverable without deleting active data.')
