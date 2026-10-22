import { instrument } from './content.js';
import { viItems } from './translations/vi-items.js';
import { viWorlds } from './translations/vi-worlds.js';
import { viFoundations } from './translations/vi-foundations.js';

// A separate entry point: no assessment engine or browser storage is accessed.
const cards = document.querySelector('#review-cards');
const kindControl = document.querySelector('#review-kind');
const worldControl = document.querySelector('#review-world');
const languageControl = document.querySelector('#review-language');
const searchControl = document.querySelector('#review-search');
const exportButton = document.querySelector('#review-export');
const status = document.querySelector('#review-status');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const normalize = value => String(value).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd');
const dimension = id => instrument.dimensions.find(item => item.id === id);
const hidden = language => languageControl.value !== 'parallel' && languageControl.value !== language ? 'hidden' : '';

function pair(english, vietnamese) {
  return `<div class="review-pair" data-language="${languageControl.value}"><section class="review-column" lang="en" ${hidden('en')}><span class="review-language-label">ENGLISH · SOURCE</span>${english}</section><section class="review-column" lang="vi" ${hidden('vi')}><span class="review-language-label">TIẾNG VIỆT · BẢN NHÁP</span>${vietnamese}</section></div>`;
}

function card(id, label, body) {
  return `<article class="review-card"><header class="review-card-header"><code>${escape(id)}</code><span>${escape(label)}</span></header>${body}</article>`;
}

function statementCard(item) {
  const translated = viItems.statements[item.id];
  const domain = dimension(item.dimension);
  const translatedDomain = viItems.dimensions[item.dimension];
  return card(item.id, `${domain.label} / ${translatedDomain.label}`, pair(
    `<h2>${escape(item.text)}</h2><p class="review-rubric">Provisional domain: ${escape(domain.label)}. Agreement is aligned toward ${escape(item.direction === 1 ? domain.right : domain.left)} under the author rubric.</p>`,
    `<h2>${escape(translated.text)}</h2><p class="review-rubric">Nhóm nội dung dự kiến: ${escape(translatedDomain.label)}. Theo quy tắc chấm điểm nháp, đồng ý với nhận định này tương ứng với phía ${escape(item.direction === 1 ? translatedDomain.right : translatedDomain.left)}.</p>`,
  ));
}

function foundationColumn(item, translated, vi = false) {
  const category = instrument.foundations.categories.find(entry => entry.id === item.category);
  const categoryText = vi ? viFoundations.categories[category.id] : category;
  const lensNames = item.lenses.map(id => vi ? viFoundations.lenses[id].label : instrument.foundations.lenses.find(lens => lens.id === id).label);
  return `<p class="review-context-label">${escape(categoryText.label)}</p><h2>${escape(translated.text)}</h2><p>${escape(categoryText.description)}</p><h3>${vi ? 'Mục đích của nhận định' : 'Item rationale'}</h3><p>${escape(translated.rationale)}</p><p class="review-rubric">${vi ? 'Các hướng tư tưởng có liên quan trong bản đồ nghiên cứu' : 'Related lenses in the research map'}: ${lensNames.map(escape).join('; ')}.</p><p class="review-rubric">${vi ? 'Chỉ ghi nhận câu trả lời để mô tả; không chấm điểm hay suy ra bản sắc tư tưởng. Một nhận định có thể được chia sẻ hoặc tranh luận trong nhiều truyền thống.' : 'Responses are descriptive and unscored; they do not identify an ideology. A premise may be shared or contested across traditions.'}</p>`;
}

function foundationCard(item) {
  const category = instrument.foundations.categories.find(entry => entry.id === item.category);
  return card(item.id, `${category.label} / ${viFoundations.categories[category.id].label}`, pair(
    foundationColumn(item, item),
    foundationColumn(item, viFoundations.items[item.id], true),
  ));
}

function lensCard(lens) {
  const translated = viFoundations.lenses[lens.id];
  const column = (text, vi = false) => `<h2>${escape(text.label)}</h2><p>${escape(text.description)}</p><h3>${vi ? 'Giới hạn của cách diễn giải' : 'Interpretive caution'}</h3><p>${escape(text.cautions)}</p><p class="review-rubric">${vi ? 'Hướng tư tưởng dùng trong nghiên cứu; không phải nhãn kết quả của người tham gia.' : 'Research lens; never a participant result label.'}</p>`;
  return card(lens.id, 'Research lens / Hướng tư tưởng trong nghiên cứu', pair(column(lens), column(translated, true)));
}

function aimsCard() {
  const column = (aims, vi = false) => `<h2>${vi ? 'Mục tiêu của hệ thống nhận định rộng hơn' : 'Aims for a broader statement system'}</h2><ul>${aims.map(aim => `<li>${escape(aim)}</li>`).join('')}</ul><p class="review-rubric">${vi ? 'Bản nháp của nhóm biên soạn; chưa phải một hệ phân loại đầy đủ hay một thang đo đã được kiểm định.' : 'Author draft; neither an exhaustive taxonomy nor a validated scale.'}</p>`;
  return card('foundation-aims', 'Framework aims / Mục tiêu của khung nghiên cứu', pair(column(instrument.foundations.aims), column(viFoundations.aims, true)));
}

function scenarioColumn(scene, text, world, translated, language) {
  const vi = language === 'vi';
  const note = vi ? translated.scenarioNotes[scene.id] : world.scenarioNotes[scene.id];
  const worldName = vi ? translated.name : world.name;
  const scoreLabel = scene.comparisonOf
    ? (vi ? 'Tình huống đối chiếu; không tính vào hồ sơ' : 'Comparison; excluded from profile')
    : scene.scoring === 'descriptive'
      ? (vi ? 'Chỉ mô tả; không chấm điểm' : 'Descriptive only; unscored')
      : (vi ? 'Quy tắc chấm điểm định hướng nháp' : 'Provisional directional rubric');
  return `<p class="review-context-label">${escape(text.roleLabel)} · ${escape(text.setting)}</p>
    <h2>${escape(text.title)}</h2><p>${escape(text.briefing)}</p>
    ${text.changedCondition ? `<p class="review-comparison">${escape(text.changedCondition)}</p>` : ''}
    <div class="review-authority"><h3>${vi ? 'Quyền hạn trong vai trò' : 'Room to act'}</h3><p>${escape(text.authority)}</p></div>
    <dl class="review-facts">${text.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.text)}</dd></div>`).join('')}</dl>
    <h3>${escape(text.prompt)}</h3>
    <ol class="review-options">${text.options.map(option => `<li><span class="review-option-id">${escape(option.id)}</span><h4>${escape(option.label)}</h4><p>${escape(option.description)}</p><p class="review-tradeoff">${escape(option.tradeoff)}</p></li>`).join('')}</ol>
    <details class="review-context" open><summary>${vi ? 'Ghi chú về thể chế' : 'Institutional context'} · ${escape(worldName)}</summary><p>${escape(note)}</p></details>
    <details class="review-reasons"><summary>${vi ? 'Các lý do có thể chọn — không chấm điểm' : 'Available reasons — unscored'}</summary><ul>${text.reasons.map(reason => `<li><code>${escape(reason.id)}</code> ${escape(reason.label)}</li>`).join('')}</ul></details>
    <p class="review-rubric">${scoreLabel}</p>`;
}

function scenarioCard(scene, world) {
  const translated = viItems.scenarios[scene.id];
  const translatedWorld = viWorlds.worlds[world.id];
  return card(scene.id, `${scene.roleLabel} / ${translated.roleLabel}`, pair(
    scenarioColumn(scene, scene, world, translatedWorld, 'en'),
    scenarioColumn(scene, translated, world, translatedWorld, 'vi'),
  ));
}

function worldColumn(world, vi = false) {
  return `<p class="review-context-label">${escape(world.inspiration)}</p><h2>${escape(world.name)}</h2><p>${escape(world.summary)}</p><dl class="review-facts">${world.institutions.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.text)}</dd></div>`).join('')}</dl><p class="review-rubric">${vi ? 'Bối cảnh hư cấu; đang chờ con người rà soát. Không phải mô tả đại diện cho một dân tộc hay dân số.' : 'Authored fictional setting, awaiting human review. This does not describe a representative national population.'}</p>`;
}

function worldCard(world) {
  return card(world.id, `${world.code} · Fictional setting / Bối cảnh hư cấu`, pair(
    worldColumn(world), worldColumn(viWorlds.worlds[world.id], true),
  ));
}

function render() {
  const kind = kindControl.value;
  const world = instrument.worlds.find(item => item.id === worldControl.value) || instrument.worlds[0];
  worldControl.disabled = kind !== 'scenarios';
  const search = normalize(searchControl.value.trim());
  const source = kind === 'statements' ? instrument.statements : kind === 'foundations' ? instrument.foundations.items : kind === 'lenses' ? instrument.foundations.lenses : kind === 'scenarios' ? instrument.scenarios : instrument.worlds;
  const rows = source.filter(item => {
    if (!search) return true;
    const translation = kind === 'statements' ? viItems.statements[item.id] : kind === 'foundations' ? viFoundations.items[item.id] : kind === 'lenses' ? viFoundations.lenses[item.id] : kind === 'scenarios' ? viItems.scenarios[item.id] : viWorlds.worlds[item.id];
    const contexts = kind === 'scenarios' ? [world.scenarioNotes[item.id], viWorlds.worlds[world.id].scenarioNotes[item.id]] : kind === 'foundations' ? [instrument.foundations.categories.find(category => category.id === item.category), viFoundations.categories[item.category], ...item.lenses.flatMap(id => [instrument.foundations.lenses.find(lens => lens.id === id), viFoundations.lenses[id]])] : [];
    return normalize(JSON.stringify([item, translation, contexts])).includes(search);
  });
  cards.innerHTML = rows.map(item => kind === 'statements' ? statementCard(item) : kind === 'foundations' ? foundationCard(item) : kind === 'lenses' ? lensCard(item) : kind === 'scenarios' ? scenarioCard(item, world) : worldCard(item)).join('');
  if (kind === 'lenses' && !search) cards.innerHTML = aimsCard() + cards.innerHTML;
  if (!rows.length) cards.innerHTML = '<p class="review-empty">No matching content / Không tìm thấy nội dung phù hợp.</p>';
  status.textContent = `${rows.length} / ${source.length} ${kind === 'lenses' ? 'research lenses · hướng tư tưởng' : 'items · mục nội dung'} · v${instrument.version} · draft / bản nháp`;
}

function exportPacket() {
  const payload = {
    format: 'political-context-bilingual-review',
    packetVersion: 2,
    instrumentId: instrument.id,
    version: instrument.version,
    reviewStatus: 'draft',
    originalLanguage: 'en',
    translationLanguage: 'vi',
    english: instrument,
    vietnamese: {items: viItems, worlds: viWorlds, foundations: viFoundations},
    limitations: ['Author translation drafts; independent bilingual review and cognitive interviews are pending.', 'Structural checks do not establish linguistic or measurement equivalence.', 'Foundation lens associations are research metadata, not ideological classification rules.', 'This researcher packet reveals country inspirations and contains authored content, not assessment responses.'],
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `political-context-bilingual-review-${instrument.version}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

if (viItems.version !== instrument.version || viWorlds.version !== instrument.version || viFoundations.version !== instrument.version
  || viItems.reviewStatus !== 'draft' || viWorlds.reviewStatus !== 'draft' || viFoundations.reviewStatus !== 'draft') {
  status.textContent = 'The review drafts do not match this instrument version. / Bản nháp không khớp phiên bản công cụ.';
} else {
  worldControl.innerHTML = instrument.worlds.map(world => `<option value="${escape(world.id)}">${escape(world.name)} / ${escape(viWorlds.worlds[world.id].name)}</option>`).join('');
  for (const control of [kindControl, worldControl, languageControl]) control.addEventListener('change', render);
  searchControl.addEventListener('input', render);
  exportButton.addEventListener('click', exportPacket);
  exportButton.disabled = false;
  render();
}
