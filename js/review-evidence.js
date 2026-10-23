import { foundationEvidence } from './foundation-evidence.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const statusLabels = {
  unverified: 'Unverified source proposal / Nguồn đề xuất chưa xác minh',
  'metadata-checked': 'Bibliographic details checked / Đã kiểm tra thông tin thư mục',
  'text-checked': 'Source text checked for this draft / Đã đối chiếu văn bản cho bản nháp',
};

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

/** Author-review material only; never imported by the participant assessment. */
export function foundationEvidencePanel(itemId, evidence = foundationEvidence) {
  const item = evidence.items.find(row => row.itemId === itemId);
  if (!item) return '';
  const sources = new Map(evidence.sources.map(source => [source.id, source]));
  const links = item.links.map(link => {
    const source = sources.get(link.sourceId);
    if (!source) return '';
    const url = safeUrl(source.url);
    const title = url ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a>` : escape(source.title);
    return `<li><h4>${title}</h4><p class="review-source-status">${escape(statusLabels[source.verification] || statusLabels.unverified)}</p><p>${escape(source.authors.length ? source.authors.join('; ') : 'Authorship awaits verification / Chưa xác minh tác giả')}</p><p><strong>${link.relation === 'contrast' ? 'Contrast / Quan điểm đối chiếu' : 'Background / Bối cảnh lý luận'}:</strong> ${escape(link.note)}</p><p><strong>Locator / Vị trí:</strong> ${escape(link.locator)}</p><p>${escape(source.note)}</p></li>`;
  }).join('');
  return `<section class="review-evidence" data-evidence-item="${escape(itemId)}"><details><summary>Source proposals and open questions / Nguồn đề xuất và câu hỏi mở</summary><div><p>These author notes identify possible background and contrasting arguments. A link does not establish that a source endorses the statement or validate a political-tradition association. / Các ghi chú này đề xuất cơ sở lý luận và lập luận đối chiếu; đường dẫn không chứng minh nguồn tán thành nhận định.</p><p class="review-context-label">Bibliographic titles and research notes are in their source language. / Tên tài liệu và ghi chú nghiên cứu giữ ngôn ngữ nguồn.</p><ol>${links}</ol><p><strong>Open question / Câu hỏi mở:</strong> ${escape(item.openQuestion)}</p><p><a href="docs/SOURCES.md">Source-checking scope and next steps / Phạm vi kiểm tra và bước tiếp theo</a></p></div></details></section>`;
}
