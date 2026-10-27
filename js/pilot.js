/**
 * Isolated synthetic-result viewer. It never opens participant/reviewer stores,
 * accepts personal response imports, or records observations.
 */
import { instrument } from './content.js';
import { createTextReport } from './debrief.js';
import { renderResponseReport } from './debrief-view.js';
import { pilotCases, pilotFixtureVersion, createPilotFixture } from './pilot-fixtures.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const caseSelect = document.querySelector('#pilot-case');
const openButton = document.querySelector('#pilot-open');
const example = document.querySelector('#pilot-example');
const status = document.querySelector('#pilot-status');
const downloadButton = document.querySelector('#pilot-download');
const printButton = document.querySelector('#pilot-print');
let fixture = null;
let printState = null;

function announce(message) {
  status.textContent = message;
}

function facilitatorKey(item) {
  return `<details class="pilot-facilitator-key"><summary>Facilitator key — open after unaided tasks / Gợi ý điều phối — mở sau phần tự diễn giải</summary><div class="pilot-language-pair"><section><h3>${escape(item.title.en)}</h3><p>${escape(item.purpose.en)}</p><p>${escape(item.facilitatorNotes.en)}</p></section><section lang="vi"><h3>${escape(item.title.vi)}</h3><p>${escape(item.purpose.vi)}</p><p>${escape(item.facilitatorNotes.vi)}</p></section></div><p class="pilot-version">Tasks / Nhiệm vụ: ${item.taskIds.map(escape).join(', ')} · Fixture format / Phiên bản ví dụ: ${escape(pilotFixtureVersion)}</p></details>`;
}

function openExample() {
  restorePrint();
  try {
    const next = createPilotFixture(caseSelect.value);
    fixture = next;
    const item = fixture.case;
    const world = fixture.report.world;
    example.innerHTML = `<header class="pilot-example-heading"><p class="pilot-synthetic-banner"><strong>SYNTHETIC EXAMPLE ${escape(item.id)} — NOT A PARTICIPANT RESPONSE</strong><span lang="vi">VÍ DỤ GIẢ LẬP ${escape(item.id)} — KHÔNG PHẢI CÂU TRẢ LỜI CỦA NGƯỜI THAM GIA</span></p><h2 id="pilot-example-title" tabindex="-1">Example ${escape(item.id)} / Ví dụ ${escape(item.id)}</h2><p>The wording below is the production result screen applied to an authored answer set. “You” refers to that synthetic example.</p><p lang="vi">Phần bên dưới dùng giao diện kết quả hiện tại với một bộ câu trả lời được soạn sẵn. Từ “bạn” chỉ người giả lập trong ví dụ.</p></header>${renderResponseReport(fixture.report, fixture.interpretation)}<section id="pilot-country-reveal" class="comparison-card"><span class="eyebrow orange">The completed example’s setting / Bối cảnh của ví dụ đã hoàn thành</span><h2>${escape(world.name)}</h2><p><strong>${escape(world.inspiration)}</strong></p><p>This completed synthetic example includes the end-of-assessment reveal. Its invented events and permissions do not describe a real country or its people.</p><p lang="vi">Ví dụ giả lập đã hoàn thành này có phần tiết lộ ở cuối bài đánh giá. Các sự kiện và thẩm quyền hư cấu không mô tả một quốc gia thực hay người dân của quốc gia đó.</p></section>${facilitatorKey(item)}`;
    downloadButton.disabled = false;
    printButton.disabled = false;
    document.title = `Synthetic example ${item.id} — Political Context`;
    announce(`${item.id} is open. All answers shown are synthetic. / Đã mở ${item.id}. Mọi câu trả lời hiển thị đều là giả lập.`);
    document.querySelector('#pilot-example-title').focus();
  } catch {
    fixture = null;
    example.innerHTML = '';
    downloadButton.disabled = true;
    printButton.disabled = true;
    announce('This example could not be opened. Reload the page to try again. / Không mở được ví dụ. Hãy tải lại trang để thử lại.');
  }
}

function clearExample() {
  restorePrint();
  fixture = null;
  example.innerHTML = '';
  downloadButton.disabled = true;
  printButton.disabled = true;
  document.title = 'Results pilot examples — Political Context';
  announce('Selection changed. Open the selected example when ready. / Đã đổi lựa chọn. Hãy mở ví dụ đã chọn khi sẵn sàng.');
}

function downloadExample() {
  if (!fixture) return;
  const prefix = [
    'SYNTHETIC PILOT EXAMPLE — NOT A PARTICIPANT RESPONSE',
    'VÍ DỤ THỬ NGHIỆM GIẢ LẬP — KHÔNG PHẢI CÂU TRẢ LỜI CỦA NGƯỜI THAM GIA',
    `Example / Ví dụ: ${fixture.case.id}. Fixture format / Phiên bản ví dụ: ${pilotFixtureVersion}.`,
    'The following answers were authored for comprehension testing. They are not research findings or anyone’s personal assessment.',
    '',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([prefix, '\n', createTextReport(instrument, fixture.session)], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `SYNTHETIC-${fixture.case.id}-political-context-${instrument.version}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce(`Synthetic example ${fixture.case.id} downloaded. No personal answers were opened or submitted. / Đã tải ví dụ giả lập ${fixture.case.id}. Không có câu trả lời cá nhân nào được mở hay gửi đi.`);
}

function preparePrint() {
  if (!fixture || printState) return;
  printState = [...example.querySelectorAll('.report-theme, .theme-evidence, .decision-circumstances')].map(details => [details, details.open]);
  printState.forEach(([details]) => { details.open = true; });
  document.body.classList.add('printing-debrief');
}

function restorePrint() {
  printState?.forEach(([details, open]) => { details.open = open; });
  printState = null;
  document.body.classList.remove('printing-debrief');
}

example.addEventListener('click', event => {
  const link = event.target.closest('[data-action="show-evidence"]');
  if (!link || !fixture) return;
  event.preventDefault();
  const target = document.getElementById(`evidence-${link.dataset.evidenceTarget}`);
  if (!target || !example.contains(target)) return;
  for (let details = target.parentElement.closest('details'); details; details = details.parentElement?.closest('details')) details.open = true;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'center' });
  announce('Supporting synthetic response expanded and focused. / Đã mở và chuyển đến câu trả lời giả lập làm căn cứ.');
});

openButton.addEventListener('click', openExample);
caseSelect.addEventListener('change', clearExample);
downloadButton.addEventListener('click', downloadExample);
printButton.addEventListener('click', () => {
  if (!fixture) return;
  preparePrint();
  try { window.print(); }
  catch {
    restorePrint();
    announce('Printing is unavailable. Download the synthetic text report instead. / Không thể in. Bạn có thể tải báo cáo giả lập dạng văn bản.');
  }
});
window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', restorePrint);

caseSelect.innerHTML = pilotCases.map((item, index) => `<option value="${escape(item.id)}">${escape(item.id)} · Example ${String.fromCharCode(65 + index)} / Ví dụ ${String.fromCharCode(65 + index)}</option>`).join('');
caseSelect.disabled = false;
openButton.disabled = false;
announce('Choose an example, then open it. No personal answers are used. / Chọn một ví dụ rồi mở. Không sử dụng câu trả lời cá nhân.');
