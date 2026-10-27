"""Exercise the read-only question catalog on a served checkout or site artifact.

Run: POLITICAL_CONTEXT_TEST_URL=http://127.0.0.1:8000 python3 tests/browser_question_bank.py
All browser-storage sentinels are synthetic and stay in a disposable profile.
"""
import os
import re
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright

BASE = os.environ.get("POLITICAL_CONTEXT_TEST_URL", "http://127.0.0.1:8000").rstrip("/")
PAGE = BASE + "/question-bank.html"


def storage_guard():
    # Retain native handles only for test inspection, but prohibit application
    # access to either storage object or any Storage prototype method.
    return r"""(() => {
      const stores={tab:window.sessionStorage,device:window.localStorage};
      const native={};
      for(const m of ['getItem','setItem','removeItem','clear','key']) native[m]=Storage.prototype[m];
      for(const s of Object.values(stores)) {
        native.setItem.call(s,'political-context-session','synthetic-personal-save');
        native.setItem.call(s,'political-context-review-notes','synthetic-reviewer-note');
        native.setItem.call(s,'unrelated-key','synthetic-unrelated-value');
      }
      const calls=[];
      const inspect=()=>Object.fromEntries(Object.entries(stores).map(([scope,s])=>[
        scope,Object.fromEntries(Array.from({length:s.length},(_,i)=>{
          const key=native.key.call(s,i);return [key,native.getItem.call(s,key)];
        }))
      ]));
      Object.defineProperty(window,'__catalogStorageProbe',{value:{calls,inspect}});
      for(const m of ['getItem','setItem','removeItem','clear','key']) Storage.prototype[m]=function(){
        calls.push(m);throw new Error('Catalog must not access browser storage: '+m);
      };
      for(const n of ['sessionStorage','localStorage']) Object.defineProperty(window,n,{
        configurable:true,get(){calls.push(n);throw new Error('Catalog must not open '+n);}
      });
    })();"""


def assert_isolation(page, baseline):
    assert page.evaluate("window.__catalogStorageProbe.calls") == []
    assert page.evaluate("window.__catalogStorageProbe.inspect()") == baseline


def fit(page, description):
    size = page.evaluate("()=>({viewport:innerWidth,width:document.documentElement.scrollWidth})")
    assert size["width"] <= size["viewport"] + 1, (description, size)


def displayed_ids(page):
    return page.locator("#catalog-results article.catalog-card").evaluate_all(
        "cards=>cards.map(card=>card.dataset.itemId)"
    )


def collect_pages(page):
    result = []
    for _ in range(20):
        result.extend(displayed_ids(page))
        if page.locator("#catalog-next").is_disabled():
            break
        page.locator("#catalog-next").click()
    else:
        raise AssertionError("Catalog pagination did not end")
    return result


def open_only(page, item_id):
    expect(page.locator("#catalog-results article.catalog-card")).to_have_count(1)
    card = page.locator(f'article.catalog-card[data-item-id="{item_id}"]')
    expect(card).to_have_count(1)
    detail = card.locator("details.catalog-detail")
    if not detail.evaluate("element=>element.open"):
        detail.locator(":scope > summary").click()
    return card


with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path="/usr/bin/chromium", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    context.add_init_script(script=storage_guard())
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
    baseline = page.evaluate("window.__catalogStorageProbe.inspect()")
    assert_isolation(page, baseline)
    response = context.request.get(BASE + "/data/question-catalog.json")
    assert response.status == 200
    data = response.json()
    assert data["counts"] == {"items": 151, "packages": 12, "outcomes": 55}
    assert len(data["items"]) == 151 and len(data["packages"]) == 12
    assert len({item["id"] for item in data["items"]}) == 151
    assert "worlds" not in data and "world_reveals" not in data
    for item in data["items"]:
        assert "inspiration" not in item and "world_reveals" not in item
    # Explicit fictional setting names and the country inspirations belong to
    # the completed debrief, not the browsable question data or question text.
    for item in data["items"]:
        for value in item["texts"].values():
            assert not re.search(r"\b(?:Linden Federation|Union of Alder|Kingdom of Mere|Hoshima|Namoa Republic|An Binh Republic|Suryan Federation|Republic of Mbala)\b", value["text"], re.I)
    assert any(urlsplit(url).path.endswith("/data/question-catalog.json") for url in requests)
    assert not any(urlsplit(url).path.endswith("/js/app.js") for url in requests)
    fit(page, "desktop initial catalog")

    # Every catalog item is reachable through pagination, once and only once.
    shown = collect_pages(page)
    assert len(shown) == len(set(shown)) == 151
    assert set(shown) == {item["id"] for item in data["items"]}
    assert_isolation(page, baseline)

    # Topic and review-status filters preserve the different distinctions in
    # the catalog instead of treating a research probe as a scored question.
    page.locator("#catalog-topic").select_option("CR-24")
    expect(page.locator("#catalog-results article.catalog-card")).to_have_count(5)
    assert set(displayed_ids(page)) == {"CR-24A", "CR-24B", "CR-24C", "CR-24D", "CR-S18"}
    page.locator("#catalog-topic").select_option("all")
    page.locator("#catalog-status").select_option("probe")
    expect(page.locator("#catalog-results article.catalog-card")).to_have_count(1)
    assert displayed_ids(page) == ["CR-S03"]
    page.locator("#catalog-status").select_option("all")

    # An unassigned design budget must remain empty; a concrete review packet
    # must show exactly its five authored members, not all international items.
    page.locator("#catalog-package").select_option("FUTURE-24")
    expect(page.locator("#catalog-results article.catalog-card")).to_have_count(0)
    page.locator("#catalog-package").select_option("REVIEW-J")
    packet = next(p for p in data["packages"] if p["id"] == "REVIEW-J")
    assert len(packet["items"]) == 5
    expect(page.locator("#catalog-results article.catalog-card")).to_have_count(5)
    assert set(displayed_ids(page)) == set(packet["items"])
    page.locator("#catalog-kind").select_option("scenario")
    card = open_only(page, "CR-S18")
    expect(card).to_contain_text("120")
    expect(card).to_contain_text("joint committee")
    expect(card).to_contain_text("ủy ban chung")
    expect(card).to_contain_text(re.compile("author draft|draft", re.I))
    fit(page, "desktop expanded scenario")

    # Search by ID and show both available language drafts. The linked outcome
    # and source status are visible, and neither asserts an ideological label.
    page.locator("#catalog-package").select_option("all")
    page.locator("#catalog-kind").select_option("all")
    page.locator("#catalog-search").fill("CR-24A")
    card = open_only(page, "CR-24A")
    item = next(item for item in data["items"] if item["id"] == "CR-24A")
    expect(card.locator('.catalog-text[lang="en"]')).to_contain_text(item["texts"]["en"]["text"])
    expect(card.locator('.catalog-text[lang="vi"]')).to_contain_text(item["texts"]["vi"]["text"])
    card.locator("details.catalog-outcomes > summary").click()
    expect(card.locator(".catalog-outcome")).to_contain_text("International-system explanations")
    expect(card.locator(".catalog-outcome")).to_contain_text("cannot identify")
    card.locator("details.catalog-readings > summary").click()
    expect(card.locator("details.catalog-readings")).to_contain_text(re.compile("unverified", re.I))

    # Language choice never fabricates a missing translation, even for the
    # deliberately held comprehension probe in the older research packets.
    page.locator("#catalog-language").select_option("vi")
    page.locator("#catalog-search").fill("CR-S03")
    card = open_only(page, "CR-S03")
    expect(card).to_contain_text(re.compile("not available|not drafted|no vietnamese|chưa", re.I))
    expect(card.locator('.catalog-text[lang="vi"]')).to_contain_text("Chưa có bản nháp tiếng Việt")
    page.locator("#catalog-language").select_option("both")
    page.locator("#catalog-search").fill("CR-24A")
    card = open_only(page, "CR-24A")
    page.set_viewport_size({"width": 375, "height": 812})
    fit(page, "mobile expanded item")
    expect(card.locator('.catalog-text[lang="en"]')).to_be_visible()
    expect(card.locator('.catalog-text[lang="vi"]')).to_be_visible()

    # Search text remains inert even when it resembles markup.
    page.locator("#catalog-search").fill('<img src=x onerror="window.__catalogInjected=true">')
    expect(page.locator("#catalog-results article.catalog-card")).to_have_count(0)
    assert page.evaluate("window.__catalogInjected===true") is False
    assert page.locator('img[src="x"]').count() == 0
    assert_isolation(page, baseline)
    assert not errors, errors
    assert not external, external
    assert not failed, failed
    browser.close()

print("PASS: 151 items, package/filter/search coverage, bilingual scenarios, outcomes, sources, storage isolation, and mobile layout.")
