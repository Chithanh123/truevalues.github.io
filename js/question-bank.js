/** Public, read-only research catalog. No participant or reviewer data is opened. */
const controls = Object.fromEntries(['search', 'package', 'kind', 'topic', 'status', 'language'].map(name => [name, document.querySelector(`#catalog-${name}`)]));
const results = document.querySelector('#catalog-results');
const summary = document.querySelector('#catalog-summary');
const packageNote = document.querySelector('#catalog-package-note');
const pageNumber = document.querySelector('#catalog-page-number');
const previous = document.querySelector('#catalog-prev');
const next = document.querySelector('#catalog-next');
const reset = document.querySelector('#catalog-reset');
const PAGE_SIZE = 12;
let catalog;
let page = 0;
let filtered = [];

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const inline = value => escape(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
const plain = value => String(value ?? '').replace(/[*`#|]/g, '').replace(/\s+/g, ' ').trim();
const textFor = (item, language) => item.texts?.[language]?.text || '';
const lookupText = item => [item.id, item.title, item.cluster_id, item.category, item.role_id, textFor(item, 'en'), textFor(item, 'vi')].filter(Boolean).join(' ').toLocaleLowerCase();
const statusText = status => ({implemented_unvalidated:'Current assessment · Unvalidated / Bài hiện tại · Chưa xác nhận', author_draft:'Research draft / Bản nháp nghiên cứu', probe_only:'Comprehension probe only / Chỉ kiểm tra cách hiểu'}[status] || status);
const kindText = kind => ({value_statement:'Value statement / Nhận định giá trị', foundation_statement:'Underlying assumption / Tiền đề nền tảng', scenario:'Situation / Tình huống'}[kind] || kind);
const roleText = role => ({constituent:'Ordinary constituent', civil_society:'Civil society group leader', public_servant:'Non-elected public servant', local_leader:'Local leader', national_leader:'National leader'}[role] || role);

// Render authored Markdown as escaped text with a small, deliberately limited
// set of formatting features. No HTML or URLs from the data are interpreted.
function markdown(source) {
  const blocks = String(source).replace(/\r\n?/g, '\n').split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.split('\n');
    if (lines.every(line => /^\s*\|.*\|\s*$/.test(line)) && lines.length >= 2 && /^\s*\|[\s:|\-]+\|\s*$/.test(lines[1])) {
      const cells = line => line.trim().slice(1, -1).split('|').map(cell => cell.trim());
      const header = cells(lines[0]);
      const body = lines.slice(2).map(line => cells(line));
      return `<div class="catalog-table-scroll"><table><thead><tr>${header.map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (lines.every(line => /^\s*[-*] /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`;
    if (lines.length === 1 && /^#{1,4}\s/.test(lines[0])) return `<p><strong>${inline(lines[0].replace(/^#{1,4}\s+/, ''))}</strong></p>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

function languageColumn(item, language) {
  const content = item.texts?.[language];
  const title = language === 'en' ? 'English' : 'Tiếng Việt · Bản nháp';
  if (!content) return `<section class="catalog-text" lang="${language}"><h3>${title}</h3><p>${language === 'vi' ? 'Chưa có bản nháp tiếng Việt.' : 'English wording is unavailable.'}</p></section>`;
  const contentHtml = content.format === 'markdown' ? markdown(content.text) : `<p>${escape(content.text)}</p>`;
  return `<section class="catalog-text" lang="${language}"><h3>${title}</h3>${contentHtml}</section>`;
}

function outcomeSection(item) {
  if (!item.outcomes?.length) return '';
  return `<details class="catalog-outcomes"><summary>Intended outcomes and limits / Mục tiêu dự kiến và giới hạn (${item.outcomes.length})</summary>${item.outcomes.map(outcome => `<article class="catalog-outcome"><h4>${escape(outcome.title)}</h4><p><strong>Intended interpretation:</strong> ${escape(outcome.intended_interpretation)}</p><p><strong>Evidence needed:</strong> ${escape(outcome.evidence_required)}</p><p><strong>What cannot be inferred:</strong> ${escape(outcome.unsupported_inferences)}</p></article>`).join('')}</details>`;
}
function readingSection(item) {
  if (!item.readings?.length) return '';
  return `<details class="catalog-readings"><summary>Related readings and source status / Tài liệu liên quan và tình trạng nguồn (${item.readings.length})</summary><p>A source can inform a question without validating it. / Nguồn tham khảo không tự xác nhận câu hỏi.</p><ul>${item.readings.map(reading => {
    const label = reading.verification === 'passage_inspected' ? 'Selected passages inspected' : 'Unverified reading proposal';
    let href = '';
    try { const url = new URL(reading.url); if (url.protocol === 'https:' || url.protocol === 'http:') href = url.href; } catch { /* no valid link */ }
    const title = href ? `<a href="${escape(href)}" rel="noopener noreferrer">${escape(reading.bibliographic_proposal)}</a>` : escape(reading.bibliographic_proposal);
    const scope = reading.scope === 'cluster' ? 'Cluster reading suggestion' : 'Item reading suggestion';
    return `<li><strong>${escape(reading.id)}</strong> · ${title}<br>${scope} · ${label}</li>`;
  }).join('')}</ul></details>`;
}
function card(item) {
  const language = controls.language.value;
  const langs = language === 'both' ? ['en', 'vi'] : [language];
  const previewLanguage = language === 'vi' && textFor(item, 'vi') ? 'vi' : 'en';
  const preview = plain(textFor(item, previewLanguage));
  const short = preview.length > 220 ? `${preview.slice(0, 217)}…` : preview;
  const cluster = catalog.clusters.find(entry => entry.id === item.cluster_id);
  const meta = [kindText(item.kind), statusText(item.status), cluster?.title, item.role_id ? `${roleText(item.role_id)} · ${item.locality}` : ''].filter(Boolean);
  return `<article class="catalog-card" data-item-id="${escape(item.id)}"><header class="catalog-card-header"><div class="catalog-card-meta"><strong>${escape(item.id)}</strong>${meta.map(value => `<span>${escape(value)}</span>`).join('')}</div><h2>${escape(item.title)}</h2><p class="catalog-card-preview" lang="${previewLanguage}">${escape(short)}</p></header><details class="catalog-detail"><summary>Read question and research notes / Đọc câu hỏi và ghi chú nghiên cứu</summary><div class="catalog-languages${langs.length === 1 ? ' single' : ''}">${langs.map(lang => languageColumn(item, lang)).join('')}</div><div class="catalog-research"><p><strong>Interpretation limits:</strong> ${escape(item.interpretation_limits)}</p>${outcomeSection(item)}${readingSection(item)}</div></details></article>`;
}
function renderPackageNote() {
  const selected = catalog.packages.find(item => item.id === controls.package.value);
  if (!selected) { packageNote.hidden = true; packageNote.innerHTML = ''; return; }
  packageNote.hidden = false;
  packageNote.innerHTML = `<h2>${escape(selected.id)} · ${escape(selected.title)}</h2><p>${escape(selected.purpose)}</p><p>${escape(selected.language_note)}</p><p><strong>Limit:</strong> ${escape(selected.inference_limit)}</p>`;
}
function render() {
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(page, pages - 1);
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  summary.textContent = filtered.length ? `${filtered.length} ${filtered.length === 1 ? 'question' : 'questions'} · Showing ${start + 1}–${start + slice.length} / ${filtered.length} câu hỏi` : 'No questions match these filters. / Không có câu hỏi phù hợp với bộ lọc.';
  results.innerHTML = slice.length ? slice.map(card).join('') : '<p class="catalog-empty">Try different filters or clear them. / Hãy thử bộ lọc khác hoặc xóa bộ lọc.</p>';
  previous.disabled = page === 0;
  next.disabled = page >= pages - 1;
  pageNumber.textContent = filtered.length ? `Page ${page + 1} of ${pages} / Trang ${page + 1} trên ${pages}` : '';
  renderPackageNote();
}
function applyFilters() {
  const query = controls.search.value.trim().toLocaleLowerCase();
  const selectedPackage = catalog.packages.find(entry => entry.id === controls.package.value);
  const packageItems = selectedPackage ? new Set(selectedPackage.items) : null;
  filtered = catalog.items.filter(item => {
    if (query && !lookupText(item).includes(query)) return false;
    if (packageItems && !packageItems.has(item.id)) return false;
    if (controls.kind.value !== 'all' && item.kind !== controls.kind.value) return false;
    if (controls.topic.value === 'current' && item.bank !== 'current') return false;
    if (controls.topic.value !== 'all' && controls.topic.value !== 'current' && item.cluster_id !== controls.topic.value) return false;
    if (controls.status.value === 'current' && item.status !== 'implemented_unvalidated') return false;
    if (controls.status.value === 'draft' && item.status !== 'author_draft') return false;
    if (controls.status.value === 'probe' && item.status !== 'probe_only') return false;
    return true;
  });
  page = 0;
  render();
}
function init(data) {
  if (data.schemaVersion !== 1 || !Array.isArray(data.items) || !Array.isArray(data.packages) || !Array.isArray(data.clusters)) throw new Error('Unsupported catalog format');
  catalog = data;
  for (const item of catalog.packages) {
    const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.id} · ${item.title}`; controls.package.append(option);
  }
  const current = document.createElement('option'); current.value = 'current'; current.textContent = 'Current instrument / Bài hiện tại'; controls.topic.append(current);
  for (const item of catalog.clusters) {
    const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.id} · ${item.title}`; controls.topic.append(option);
  }
  for (const control of Object.values(controls)) control.addEventListener(control === controls.search ? 'input' : 'change', applyFilters);
  previous.addEventListener('click', () => { if (page > 0) { page--; render(); results.scrollIntoView({block:'start'}); } });
  next.addEventListener('click', () => { if ((page + 1) * PAGE_SIZE < filtered.length) { page++; render(); results.scrollIntoView({block:'start'}); } });
  reset.addEventListener('click', () => { controls.search.value = ''; for (const name of ['package', 'kind', 'topic', 'status']) controls[name].value = 'all'; controls.language.value = 'both'; applyFilters(); controls.search.focus(); });
  applyFilters();
}

try {
  const response = await fetch(new URL('../data/question-catalog.json', import.meta.url));
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
  init(await response.json());
} catch {
  summary.textContent = 'The question bank could not be loaded. Please reload this page or check the site deployment. / Không thể tải ngân hàng câu hỏi. Hãy tải lại trang hoặc kiểm tra việc triển khai trang.';
  results.innerHTML = '<p class="catalog-empty">The catalog data is unavailable. / Dữ liệu ngân hàng câu hỏi không khả dụng.</p>';
}
