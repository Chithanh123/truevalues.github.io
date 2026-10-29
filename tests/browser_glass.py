"""Exercise the optional glass enhancement on a source or project-path site.

POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8071 python3 tests/browser_glass.py
Uses disposable Chromium profiles; no real responses or data are collected.
"""
import os
import re

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get('POLITICAL_CONTEXT_TEST_URL', 'http://127.0.0.1:8071').rstrip('/')
FILTER = re.compile(r'^url\("?#(political-context-glass-\d+)"?\)$')


def filter_id(locator):
    value = locator.evaluate("element => element.style.getPropertyValue('--glass-refraction')")
    found = FILTER.match(value.strip())
    assert found, f'Expected SVG refraction; got {value!r}'
    return found.group(1)


def wait_for_filter(page, selector):
    page.wait_for_function(
        "selector => !!document.querySelector(selector)?.style.getPropertyValue('--glass-refraction')",
        arg=selector, timeout=20000,
    )


def enhanced(page):
    page.goto(BASE + '/', wait_until='networkidle')
    hero = page.locator('.hero-art')
    expect(hero).to_be_visible()
    wait_for_filter(page, '.hero-art')
    first_id = filter_id(hero)
    assert page.locator(f'filter#{first_id}').count() == 1
    assert 'url(' in hero.evaluate('element => getComputedStyle(element).backdropFilter')

    # A viewport change must rebuild the map because displacement uses viewport size.
    page.set_viewport_size({'width': 900, 'height': 700})
    page.wait_for_function("old => document.querySelector('.hero-art')?.style.getPropertyValue('--glass-refraction') !== old",
                           arg=f'url(#{first_id})', timeout=20000)
    assert filter_id(hero) != first_id
    expect(page.locator(f'filter#{first_id}')).to_have_count(0)

    # Dynamically added, identical surfaces share a filter and release it only
    # after the last surface goes away.
    page.evaluate("""() => {
      for (const name of ['glass-test-a', 'glass-test-b']) {
        const node = document.createElement('div');
        node.id = name; node.dataset.glassRefraction = '';
        node.style.cssText = 'width: 120px; height: 60px; border-radius: 12px';
        document.body.append(node);
      }
    }""")
    wait_for_filter(page, '#glass-test-a')
    wait_for_filter(page, '#glass-test-b')
    shared_id = filter_id(page.locator('#glass-test-a'))
    assert shared_id == filter_id(page.locator('#glass-test-b'))
    # If the shared SVG is detached, each live surface must be rebound to a
    # connected replacement, including surfaces sharing the same dimensions.
    page.locator(f'filter#{shared_id}').evaluate("element => element.closest('svg').remove()")
    page.wait_for_function("old => document.querySelector('#glass-test-a').style.getPropertyValue('--glass-refraction') !== old",
                           arg=f'url(#{shared_id})', timeout=20000)
    shared_id = filter_id(page.locator('#glass-test-a'))
    assert shared_id == filter_id(page.locator('#glass-test-b'))
    assert page.locator(f'filter#{shared_id}').count() == 1
    page.locator('#glass-test-a').evaluate('element => element.remove()')
    expect(page.locator(f'filter#{shared_id}')).to_have_count(1)
    page.locator('#glass-test-b').evaluate('element => element.remove()')
    expect(page.locator(f'filter#{shared_id}')).to_have_count(0)

    # The quiz changes the page without a navigation: detached home surfaces
    # must release their filters and keep the first question usable.
    page.locator('[data-action="begin"]').first.click()
    expect(page.locator('#info-dialog')).to_be_visible()
    page.locator('[data-action="start"]').click()
    expect(page.locator('input[data-response="value"]:visible')).to_have_count(5)
    expect(page.locator('.hero-art')).to_have_count(0)
    expect(page.locator('filter[id^="political-context-glass-"]')).to_have_count(0)
    page.locator('.wordmark').first.click()
    wait_for_filter(page, '.hero-art')
    print('Chromium refraction: resize, shared filters, dynamic quiz and cleanup passed')


def fallback(browser, script, label):
    context = browser.new_context(viewport={'width': 1100, 'height': 800})
    context.add_init_script(script)
    page = context.new_page()
    page.goto(BASE + '/', wait_until='networkidle')
    hero = page.locator('.hero-art')
    expect(hero).to_be_visible()
    # The enhancement is inert; the CSS blur remains visible and interactive.
    page.wait_for_timeout(300)
    assert hero.evaluate("e => e.style.getPropertyValue('--glass-refraction')") == ''
    assert page.locator('filter[id^="political-context-glass-"]').count() == 0
    computed = hero.evaluate('e => getComputedStyle(e).backdropFilter')
    assert computed != 'none' and 'url(' not in computed, computed
    page.locator('[data-action="begin"]').first.click()
    expect(page.locator('#info-dialog')).to_be_visible()
    context.close()
    print(f'{label}: CSS fallback and quiz action passed')


def reduced_transparency(browser):
    context = browser.new_context(viewport={'width': 1100, 'height': 800})
    page = context.new_page()
    cdp = context.new_cdp_session(page)

    def set_preference(value):
        cdp.send('Emulation.setEmulatedMedia', {'features': [
            {'name': 'prefers-reduced-transparency', 'value': value}
        ]})

    set_preference('reduce')
    page.goto(BASE + '/', wait_until='networkidle')
    hero = page.locator('.hero-art')
    expect(hero).to_be_visible()
    assert page.evaluate("matchMedia('(prefers-reduced-transparency: reduce)').matches")
    assert hero.evaluate("e => e.style.getPropertyValue('--glass-refraction')") == ''
    assert hero.evaluate('e => getComputedStyle(e).backdropFilter') == 'none'
    assert page.locator('filter[id^="political-context-glass-"]').count() == 0

    set_preference('no-preference')
    wait_for_filter(page, '.hero-art')
    set_preference('reduce')
    expect(page.locator('filter[id^="political-context-glass-"]')).to_have_count(0)
    assert hero.evaluate("e => e.style.getPropertyValue('--glass-refraction')") == ''
    assert hero.evaluate('e => getComputedStyle(e).backdropFilter') == 'none'
    context.close()
    print('Reduced transparency: initial preference and live changes passed')


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1100, 'height': 800})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        enhanced(page)
        assert not errors, errors
        context.close()
        fallback(browser, """Object.defineProperty(navigator, 'userAgentData', {
          value: {brands: [{brand: 'Safari', version: '17'}]}, configurable: true
        });""", 'Simulated non-Chromium')
        reduced_transparency(browser)
        browser.close()


if __name__ == '__main__':
    main()
