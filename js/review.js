import { instrument } from './content.js';
import { viItems } from './translations/vi-items.js';
import { viWorlds } from './translations/vi-worlds.js';
import { viFoundations } from './translations/vi-foundations.js';
import { foundationEvidence } from './foundation-evidence.js';
import { foundationEvidencePanel } from './review-evidence.js';
import {
  REVIEW_STORAGE_KEY, MAX_REVIEW_BYTES, CRITERIA, createReviewNotes,
  buildReviewTargets, validateReviewNotes, upsertReviewEntry, removeReviewEntry,
  reviewNotesCsv,
} from './review-notes.js';

// The reviewer notebook uses its own optional storage key. Assessment state is
// never opened; authored content and paired packets are never changed by notes.
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
const targets = buildReviewTargets(instrument, {items: viItems, worlds: viWorlds, foundations: viFoundations}, foundationEvidence);
const targetMap = new Map(targets.map(target => [target.key, target]));
const noteDialog = document.querySelector('#review-note-dialog');
const noteForm = document.querySelector('#review-note-form');
const confirmDialog = document.querySelector('#review-confirm-dialog');
const notesStatus = document.querySelector('#review-notes-status');
const reviewerCode = document.querySelector('#reviewer-code');
const deviceControl = document.querySelector('#review-save-device');
const noteField = name => document.querySelector(`#review-note-${name}`);
const criterionLabels = {
  clarity: 'Clarity / Độ rõ ràng', construct: 'Concept or category / Khái niệm hoặc nhóm',
  viewpoint: 'Viewpoint coverage / Phạm vi quan điểm', translation: 'Translation / Bản dịch',
  authority: 'Role authority / Quyền hạn của vai trò', feasibility: 'Feasibility / Tính khả thi',
  facts: 'Facts and quantities / Dữ kiện và số liệu', source: 'Sources and interpretation / Nguồn và diễn giải',
  other: 'Other / Khác',
};
const outcomeLabels = {revise: 'Revision proposed / Đề nghị sửa', discuss: 'Needs discussion / Cần thảo luận', 'no-issue': 'No issue observed / Chưa thấy vấn đề'};
let notes = createReviewNotes(instrument);
let editingEntry = null;
let editingTarget = null;
let pendingConfirmation = null;
let previousStoredNotes = null;
let notebookReady = false;

function pair(english, vietnamese) {
  return `<div class="review-pair" data-language="${languageControl.value}"><section class="review-column" lang="en" ${hidden('en')}><span class="review-language-label">ENGLISH · SOURCE</span>${english}</section><section class="review-column" lang="vi" ${hidden('vi')}><span class="review-language-label">TIẾNG VIỆT · BẢN NHÁP</span>${vietnamese}</section></div>`;
}

function card(id, label, body, targetKey = null) {
  const action = targetKey ? `<div class="review-card-actions"><button class="text-button" type="button" data-review-target="${escape(targetKey)}">Record review / Ghi nhận rà soát</button><span class="review-target-coverage" data-review-coverage="${escape(targetKey)}"></span></div>` : '';
  return `<article class="review-card"><header class="review-card-header"><code>${escape(id)}</code><span>${escape(label)}</span></header>${body}${action}</article>`;
}

function statementCard(item) {
  const translated = viItems.statements[item.id];
  const domain = dimension(item.dimension);
  const translatedDomain = viItems.dimensions[item.dimension];
  return card(item.id, `${domain.label} / ${translatedDomain.label}`, pair(
    `<h2>${escape(item.text)}</h2><p class="review-rubric">Provisional domain: ${escape(domain.label)}. Agreement is aligned toward ${escape(item.direction === 1 ? domain.right : domain.left)} under the author rubric.</p>`,
    `<h2>${escape(translated.text)}</h2><p class="review-rubric">Nhóm nội dung dự kiến: ${escape(translatedDomain.label)}. Theo quy tắc chấm điểm nháp, đồng ý với nhận định này tương ứng với phía ${escape(item.direction === 1 ? translatedDomain.right : translatedDomain.left)}.</p>`,
  ), `statement:${item.id}`);
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
  ) + foundationEvidencePanel(item.id), `foundation:${item.id}`);
}

function lensCard(lens) {
  const translated = viFoundations.lenses[lens.id];
  const column = (text, vi = false) => `<h2>${escape(text.label)}</h2><p>${escape(text.description)}</p><h3>${vi ? 'Giới hạn của cách diễn giải' : 'Interpretive caution'}</h3><p>${escape(text.cautions)}</p><p class="review-rubric">${vi ? 'Hướng tư tưởng dùng trong nghiên cứu; không phải nhãn kết quả của người tham gia.' : 'Research lens; never a participant result label.'}</p>`;
  return card(lens.id, 'Research lens / Hướng tư tưởng trong nghiên cứu', pair(column(lens), column(translated, true)), `lens:${lens.id}`);
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
  ), `scenario:${scene.id}:${world.id}`);
}

function worldColumn(world, vi = false) {
  return `<p class="review-context-label">${escape(world.inspiration)}</p><h2>${escape(world.name)}</h2><p>${escape(world.summary)}</p><dl class="review-facts">${world.institutions.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.text)}</dd></div>`).join('')}</dl><p class="review-rubric">${vi ? 'Bối cảnh hư cấu; đang chờ con người rà soát. Không phải mô tả đại diện cho một dân tộc hay dân số.' : 'Authored fictional setting, awaiting human review. This does not describe a representative national population.'}</p>`;
}

function worldCard(world) {
  return card(world.id, `${world.code} · Fictional setting / Bối cảnh hư cấu`, pair(
    worldColumn(world), worldColumn(viWorlds.worlds[world.id], true),
  ), `world:${world.id}`);
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
  if (notebookReady) renderNotebook();
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

function notebookMessage(message, warning = false) {
  notesStatus.textContent = message;
  notesStatus.classList.toggle('review-notes-warning', warning);
}

function downloadReviewFile(value, filename, type = 'application/json') {
  // Use the same compact encoding measured by the model's byte limit so every
  // accepted notebook can be exported and imported without growing over it.
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const url = URL.createObjectURL(new Blob([body], {type}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function persistNotebook(message) {
  if (deviceControl.checked) {
    try {
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      notebookMessage('Could not save review notes on this device. Current notes remain in this page and can be exported; an older saved copy may remain. / Không thể lưu ghi chú trên thiết bị. Ghi chú hiện tại vẫn có thể xuất; bản lưu cũ có thể còn tồn tại.', true);
      return false;
    }
  }
  notebookMessage(message || (deviceControl.checked
    ? 'Review notes saved on this device. / Ghi chú rà soát đã được lưu trên thiết bị.'
    : 'Review notes are held in this page only. Export before reloading. / Ghi chú chỉ có trong trang này. Hãy xuất trước khi tải lại.'));
  return true;
}

function renderNotebook() {
  const result = validateReviewNotes(instrument, targets, notes);
  const stale = new Set(result.staleEntryIds);
  const documentedTargets = new Set(notes.entries.filter(entry => !stale.has(entry.id)).map(entry => entry.targetKey));
  document.querySelector('#review-notes-summary').textContent = `${notes.entries.length} entries · ${documentedTargets.size} / ${targets.length} targets with current review records · ${stale.size} stale entries / ${notes.entries.length} ghi chú · ${documentedTargets.size} / ${targets.length} mục có bản rà soát hiện hành · ${stale.size} ghi chú cần đối chiếu lại. Records describe observations, not approval. / Bản ghi mô tả quan sát, không phải phê duyệt.`;
  document.querySelector('#review-notes-list').innerHTML = notes.entries.length ? [...notes.entries].reverse().map(entry => {
    const target = targetMap.get(entry.targetKey);
    return `<article class="review-notebook-entry" data-review-entry="${escape(entry.id)}"><div><p class="review-entry-title"><strong>${escape(target.label)}</strong></p><p class="review-entry-context"><code>${escape(entry.targetKey)}</code> · ${escape(entry.language)} · ${escape(entry.field)} · ${escape(criterionLabels[entry.criterion])}</p><p class="review-entry-outcome">${escape(outcomeLabels[entry.outcome])}${stale.has(entry.id) ? ' <span class="review-stale-badge">Content or source map changed — check again / Nội dung hoặc bản đồ nguồn đã đổi — cần đối chiếu lại</span>' : ''}</p>${entry.observation ? `<p class="review-entry-observation">${escape(entry.observation)}</p>` : ''}</div><div class="review-entry-actions"><button class="text-button" type="button" data-review-edit="${escape(entry.id)}">Edit / Sửa</button><button class="text-button" type="button" data-review-delete="${escape(entry.id)}">Delete / Xóa</button></div></article>`;
  }).join('') : '<p class="review-notebook-empty">No review entries yet. Use “Record review” on an item below. / Chưa có ghi chú rà soát. Chọn “Ghi nhận rà soát” ở mục nội dung bên dưới.</p>';
  for (const label of document.querySelectorAll('[data-review-coverage]')) {
    const entries = notes.entries.filter(entry => entry.targetKey === label.dataset.reviewCoverage);
    const current = entries.filter(entry => !stale.has(entry.id));
    label.textContent = entries.length ? `${current.length} current records · ${entries.length - current.length} need rechecking / ${current.length} bản hiện hành · ${entries.length - current.length} cần đối chiếu lại` : 'No review recorded / Chưa có bản rà soát';
  }
  document.querySelector('#review-notes-recover').hidden = previousStoredNotes === null;
  deviceControl.disabled = previousStoredNotes !== null;
}

function restoreNotebook() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (raw === null) return;
    let candidate;
    let result;
    try {
      if (new Blob([raw]).size > MAX_REVIEW_BYTES) throw new Error('The saved notebook exceeds the import limit.');
      candidate = JSON.parse(raw);
      result = validateReviewNotes(instrument, targets, candidate);
    } catch {
      result = {valid: false};
    }
    if (!result.valid) {
      previousStoredNotes = raw;
      notebookMessage('Saved review notes could not be restored. Download the previous notes or clear this notebook before enabling device saving. Your current notes stay in this page. / Không thể khôi phục ghi chú đã lưu. Hãy tải bản cũ hoặc xóa sổ trước khi bật lưu trên thiết bị. Ghi chú hiện tại vẫn ở trang này.', true);
      return;
    }
    notes = candidate;
    reviewerCode.value = notes.reviewerCode;
    deviceControl.checked = true;
    notebookMessage(result.staleEntryIds.length
      ? 'Saved review notes restored. Some entries refer to older content or source proposals and need explicit rechecking. / Đã khôi phục ghi chú. Một số mục dựa trên nội dung hoặc đề xuất nguồn cũ và cần được đối chiếu lại.'
      : 'Saved review notes restored on this device. / Đã khôi phục ghi chú rà soát trên thiết bị này.', Boolean(result.staleEntryIds.length));
  } catch {
    notebookMessage('Device storage could not be accessed. You can record and export notes in this page. / Không thể truy cập bộ nhớ thiết bị. Bạn vẫn có thể ghi và xuất ghi chú tại trang này.', true);
  }
}

function syncOutcome() {
  const noIssue = noteField('outcome').value === 'no-issue';
  if (noIssue) noteField('severity').value = 'none';
  else if (noteField('severity').value === 'none') noteField('severity').value = 'minor';
  noteField('severity').disabled = noIssue;
  noteField('observation').required = !noIssue;
}

function openReviewEntry(targetKey, entry = null) {
  const target = targetMap.get(targetKey);
  if (!target) return;
  editingEntry = entry;
  editingTarget = target;
  noteForm.reset();
  document.querySelector('#review-note-title').textContent = entry ? 'Edit review / Sửa mục rà soát' : 'Record review / Ghi nhận rà soát';
  noteField('target').textContent = `${target.label} · ${target.key}`;
  noteField('error').hidden = true;
  noteField('language').value = entry?.language || (languageControl.value === 'parallel' ? 'both' : languageControl.value);
  noteField('field').value = entry?.field || 'overall';
  noteField('criterion').value = entry?.criterion || 'clarity';
  noteField('severity').value = entry?.severity || 'minor';
  noteField('outcome').value = entry?.outcome || 'revise';
  for (const [field, key] of [['observation', 'observation'], ['proposed-change', 'proposedChange'], ['source-note', 'sourceNote'], ['resolution', 'resolution']]) noteField(field).value = entry?.[key] || '';
  const stale = entry && entry.sourceFingerprint !== target.fingerprint;
  noteField('reconfirm-wrap').hidden = !stale;
  noteField('reconfirm').checked = false;
  syncOutcome();
  noteDialog.showModal();
  noteDialog.scrollTop = 0;
}

function confirmNotebookAction(title, body, action, buttonLabel = 'Continue / Tiếp tục') {
  document.querySelector('#review-confirm-title').textContent = title;
  document.querySelector('#review-confirm-body').innerHTML = body;
  document.querySelector('#review-confirm-accept').textContent = buttonLabel;
  pendingConfirmation = action;
  confirmDialog.showModal();
}

async function importReviewNotes(file) {
  if (!file) return;
  try {
    if (file.size > MAX_REVIEW_BYTES) throw new Error('File exceeds 1 MiB. / Tệp vượt quá 1 MiB.');
    const candidate = JSON.parse(await file.text());
    const result = validateReviewNotes(instrument, targets, candidate);
    if (!result.valid) throw new Error(result.error);
    const count = candidate.entries.length;
    const staleCount = result.staleEntryIds.length;
    confirmNotebookAction('Replace the current review notebook? / Thay sổ rà soát hiện tại?', `<p>The imported notebook contains <strong>${count}</strong> entries, with <strong>${staleCount}</strong> referring to older content or source proposals. Reviewer code: <strong>${escape(candidate.reviewerCode || '(not provided)')}</strong>.</p><p lang="vi">Sổ nhập vào có <strong>${count}</strong> ghi chú; <strong>${staleCount}</strong> ghi chú dựa trên nội dung hoặc đề xuất nguồn cũ.</p><p>This replaces the ${notes.entries.length} entries currently in this page${deviceControl.checked ? ' and the saved device copy' : ''}. Export the current notebook first if you need to keep it. No assessment answers are affected. / Thao tác thay thế các ghi chú hiện tại; hãy xuất trước nếu cần giữ lại. Câu trả lời đánh giá không bị ảnh hưởng.</p>`, () => {
      notes = candidate;
      reviewerCode.value = notes.reviewerCode;
      persistNotebook(staleCount ? 'Notebook imported. Stale entries must be checked against current content and source proposals before they count as current review records. / Đã nhập sổ. Ghi chú cũ cần đối chiếu với nội dung và đề xuất nguồn hiện tại trước khi tính là bản rà soát hiện hành.' : 'Notebook imported. / Đã nhập sổ rà soát.');
      if (staleCount) notesStatus.classList.add('review-notes-warning');
      renderNotebook();
    }, 'Replace notebook / Thay sổ');
  } catch (error) {
    notebookMessage(`Could not import review notes; the current notebook is unchanged. / Không thể nhập; sổ hiện tại được giữ nguyên. ${error.message}`, true);
  }
}

function initializeNotebook() {
  noteField('criterion').innerHTML = CRITERIA.map(value => `<option value="${value}">${escape(criterionLabels[value])}</option>`).join('');
  restoreNotebook();
  notebookReady = true;
  renderNotebook();
  reviewerCode.addEventListener('input', () => {
    const candidate = {...notes, reviewerCode: reviewerCode.value};
    const result = validateReviewNotes(instrument, targets, candidate);
    if (!result.valid) {
      reviewerCode.value = notes.reviewerCode;
      notebookMessage(`Reviewer code was not changed. / Mã người rà soát chưa được thay đổi. ${result.error}`, true);
      return;
    }
    notes = candidate;
    persistNotebook();
  });
  deviceControl.addEventListener('change', () => {
    if (deviceControl.checked) persistNotebook();
    else {
      try {
        localStorage.removeItem(REVIEW_STORAGE_KEY);
        notebookMessage('Device saving is off. Export before reloading this page. / Đã tắt lưu trên thiết bị. Hãy xuất trước khi tải lại trang.');
      } catch {
        notebookMessage('Could not remove the saved review notebook from this device. Current notes remain in this page. / Không thể xóa sổ rà soát đã lưu trên thiết bị. Ghi chú hiện tại vẫn ở trang này.', true);
      }
    }
  });
  noteField('outcome').addEventListener('change', syncOutcome);
  noteForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!editingTarget) return;
    const fail = message => { noteField('error').textContent = message; noteField('error').hidden = false; };
    if (editingEntry && editingEntry.sourceFingerprint !== editingTarget.fingerprint && !noteField('reconfirm').checked) {
      fail('Check this note against the current content and source proposals, then tick the confirmation. / Hãy đối chiếu ghi chú với nội dung và đề xuất nguồn hiện tại rồi chọn ô xác nhận.');
      return;
    }
    const now = new Date(Math.max(
      Date.now(),
      editingEntry ? Date.parse(editingEntry.createdAt) : 0,
      editingEntry ? Date.parse(editingEntry.updatedAt) : 0,
    )).toISOString();
    const entry = {
      id: editingEntry?.id || crypto.randomUUID(), targetKey: editingTarget.key,
      sourceFingerprint: editingTarget.fingerprint, language: noteField('language').value,
      field: noteField('field').value.trim(), criterion: noteField('criterion').value,
      severity: noteField('severity').value, outcome: noteField('outcome').value,
      observation: noteField('observation').value, proposedChange: noteField('proposed-change').value,
      resolution: noteField('resolution').value, sourceNote: noteField('source-note').value,
      createdAt: editingEntry?.createdAt || now, updatedAt: now,
    };
    const candidate = upsertReviewEntry(notes, entry);
    const result = validateReviewNotes(instrument, targets, candidate);
    if (!result.valid) { fail(result.error); return; }
    notes = candidate;
    persistNotebook();
    renderNotebook();
    noteDialog.close();
  });
  document.querySelector('#review-notes-json').addEventListener('click', () => downloadReviewFile(notes, `political-context-review-notes-${instrument.version}.json`));
  document.querySelector('#review-notes-csv').addEventListener('click', () => downloadReviewFile(reviewNotesCsv(notes, targets), `political-context-review-log-${instrument.version}.csv`, 'text/csv;charset=utf-8'));
  document.querySelector('#review-notes-import').addEventListener('click', () => document.querySelector('#review-notes-file').click());
  document.querySelector('#review-notes-file').addEventListener('change', event => {
    const file = event.target.files[0];
    event.target.value = '';
    importReviewNotes(file);
  });
  document.querySelector('#review-notes-recover').addEventListener('click', () => {
    if (previousStoredNotes !== null) downloadReviewFile(previousStoredNotes, 'political-context-previous-review-notes.json');
  });
  document.querySelector('#review-notes-clear').addEventListener('click', () => {
    confirmNotebookAction('Clear review notes? / Xóa ghi chú rà soát?', '<p>This clears the current notebook and its saved device copy. Exported files and other open tabs are unchanged. No assessment answers are affected. / Thao tác xóa sổ hiện tại và bản lưu trên thiết bị. Tệp đã xuất và các thẻ khác không thay đổi. Câu trả lời đánh giá không bị ảnh hưởng.</p>', () => {
      notes = createReviewNotes(instrument);
      reviewerCode.value = '';
      deviceControl.checked = false;
      previousStoredNotes = null;
      try {
        localStorage.removeItem(REVIEW_STORAGE_KEY);
        notebookMessage('Review notes cleared from this page and the saved device copy. / Đã xóa ghi chú khỏi trang này và bản lưu trên thiết bị.');
      } catch {
        notebookMessage('Notes cleared from this page, but the saved device copy could not be removed. / Đã xóa ghi chú tại trang này nhưng không thể xóa bản lưu trên thiết bị.', true);
      }
      renderNotebook();
    }, 'Clear review notes / Xóa ghi chú');
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-review-target], [data-review-edit], [data-review-delete], [data-review-close]');
    if (!button) return;
    if (button.dataset.reviewTarget) openReviewEntry(button.dataset.reviewTarget);
    if (button.dataset.reviewEdit) {
      const entry = notes.entries.find(item => item.id === button.dataset.reviewEdit);
      if (entry) openReviewEntry(entry.targetKey, entry);
    }
    if (button.dataset.reviewDelete) {
      const id = button.dataset.reviewDelete;
      const entry = notes.entries.find(item => item.id === id);
      if (entry) confirmNotebookAction('Delete this review entry? / Xóa ghi chú này?', `<p>${escape(targetMap.get(entry.targetKey).label)}</p><p>The other entries stay in your notebook. / Các ghi chú khác vẫn được giữ lại.</p>`, () => {
        notes = removeReviewEntry(notes, id);
        persistNotebook();
        renderNotebook();
      }, 'Delete entry / Xóa ghi chú');
    }
    if (button.dataset.reviewClose === 'note') noteDialog.close();
    if (button.dataset.reviewClose === 'confirm') confirmDialog.close();
  });
  document.querySelector('#review-confirm-accept').addEventListener('click', () => {
    const action = pendingConfirmation;
    pendingConfirmation = null;
    confirmDialog.close();
    if (action) action();
  });
  confirmDialog.addEventListener('close', () => { pendingConfirmation = null; });
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
  initializeNotebook();
  render();
}
