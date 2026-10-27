/**
 * Synthetic examples for a results-comprehension exercise, never participant
 * observations. This module neither reads nor writes browser storage. The
 * English result wording comes from the same report modules as the assessment;
 * Vietnamese metadata is an author draft for facilitation, not a translated
 * participant instrument or a claim of independent language review.
 */
import { instrument } from './content.js';
import { createSession, makeSteps, validateSession } from './engine.js';
import { buildDebrief } from './debrief.js';
import { interpretDebrief } from './interpretation.js';

export const pilotFixtureVersion = '1.0.0';
const FIXTURE_SEED = 'results-comprehension-1.0.0';

function freeze(value) {
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') freeze(child);
  }
  return Object.freeze(value);
}

export const pilotCases = freeze([
  {
    id: 'RP01',
    title: { en: 'Connected priorities and a role/preference difference', vi: 'Các ưu tiên liên hệ với nhau và khác biệt giữa vai trò với lựa chọn cá nhân' },
    purpose: {
      en: 'Read linked beliefs, trace their supporting answers, and distinguish a role action from an optional personal preference.',
      vi: 'Đọc các niềm tin có liên hệ, tìm câu trả lời làm căn cứ và phân biệt hành động theo vai trò với lựa chọn cá nhân không bắt buộc.',
    },
    taskIds: ['T01', 'T02', 'T03', 'T07', 'T08'],
    facilitatorNotes: {
      en: 'The example endorses public support for essential needs alongside widely distributed private property, and accepts personal freedom with safeguards against uncontrolled power. The housing role action is cooperative while the personal preference is municipal; this is the only concrete role/preference pair. Missing preferences are not matches. Care and ecology have endorsed premises but no dedicated situations. Ask for an unaided explanation before showing these notes. These are expected readings of invented answers, not participant findings.',
      vi: 'Ví dụ tán thành hỗ trợ công cho nhu cầu thiết yếu đồng thời coi sở hữu tư nhân được phân bố rộng là một biện pháp bảo vệ sự độc lập, và tán thành tự do cá nhân đi cùng cơ chế kiểm soát quyền lực tùy tiện. Trong tình huống nhà ở, hành động theo vai trò là phương án hợp tác xã, còn lựa chọn cá nhân là nhà ở do chính quyền quản lý; đây là cặp hành động/lựa chọn cá nhân cụ thể duy nhất. Không ghi lựa chọn cá nhân không có nghĩa là hai lựa chọn giống nhau. Các tiền đề về chăm sóc và sinh thái được tán thành nhưng chưa có tình huống chuyên biệt. Hỏi cách hiểu ban đầu trước khi cho xem ghi chú này. Đây là cách đọc dự kiến của câu trả lời giả định, không phải kết quả từ người tham gia.',
    },
  },
  {
    id: 'RP02',
    title: { en: 'Ownership and delivery considered separately', vi: 'Xem xét riêng quyền sở hữu và cách cung ứng' },
    purpose: {
      en: 'Distinguish a mixed pattern from neutral responses or a centrist political identity.',
      vi: 'Phân biệt mẫu câu trả lời theo các hướng khác nhau với câu trả lời trung lập hoặc một bản sắc chính trị trung dung.',
    },
    taskIds: ['T04'],
    facilitatorNotes: {
      en: 'Agreement with retaining public assets and with competition between providers produces opposing keyed directions in the economic theme. The interpretation distinguishes ownership from operation. A cooperative housing choice and mixed service arrangement describe specific institutions; their zero provisional scores do not identify a centrist ideology. The other general statements are neutral, and the starting assumptions are skipped.',
      vi: 'Tán thành việc giữ tài sản công và tán thành cạnh tranh giữa các đơn vị cung ứng tạo ra hai hướng mã hóa đối nhau trong chủ đề kinh tế. Phần giải thích phân biệt sở hữu với vận hành. Phương án nhà ở hợp tác xã và phương án dịch vụ kết hợp mô tả các cách tổ chức cụ thể; điểm tạm thời bằng không không xác định một hệ tư tưởng trung dung. Các nhận định giá trị còn lại ở mức trung lập; các tiền đề nền tảng được bỏ qua.',
    },
  },
  {
    id: 'RP03',
    title: { en: 'Neither agree nor disagree', vi: 'Không tán thành cũng không phản đối' },
    purpose: {
      en: 'Check what neutral statement answers establish and what they leave open.',
      vi: 'Kiểm tra câu trả lời trung lập cho biết điều gì và còn để ngỏ điều gì.',
    },
    taskIds: ['T04'],
    facilitatorNotes: {
      en: 'All 24 value statements and 16 premises have an explicit neutral response; all nine situations are skipped. Neutral statements count as definite responses for coverage but support no directional political identity. This differs from uncertainty and from skipping. There are no selected actions or reasons to explain.',
      vi: 'Cả 24 nhận định giá trị và 16 tiền đề đều có câu trả lời trung lập rõ ràng; cả chín tình huống đều được bỏ qua. Câu trả lời trung lập được tính là câu trả lời xác định khi mô tả mức độ trả lời, nhưng không làm căn cứ cho một bản sắc chính trị theo hướng nào. Điều này khác với chưa chắc chắn và bỏ qua. Không có hành động hay lý do được chọn để giải thích.',
    },
  },
  {
    id: 'RP04',
    title: { en: 'Uncertain responses', vi: 'Các câu trả lời chưa chắc chắn' },
    purpose: {
      en: 'Distinguish explicit uncertainty from a neutral answer and from a missing political position inferred by the report.',
      vi: 'Phân biệt câu trả lời chưa chắc chắn với câu trả lời trung lập và với việc báo cáo tự suy ra một lập trường chưa được nêu.',
    },
    taskIds: ['T05'],
    facilitatorNotes: {
      en: 'All 49 records explicitly say uncertain. No option choice, agreement position, personal preference, or reason has been supplied. The report must leave interpretation open rather than turn uncertainty into moderation, indecision as a trait, or an implied preference.',
      vi: 'Cả 49 mục đều ghi rõ chưa chắc chắn. Không có phương án hành động, mức tán thành, lựa chọn cá nhân hay lý do nào được cung cấp. Báo cáo phải để ngỏ cách diễn giải thay vì biến sự chưa chắc chắn thành tính ôn hòa, một đặc điểm thiếu quyết đoán hoặc một lựa chọn ngầm định.',
    },
  },
  {
    id: 'RP05',
    title: { en: 'Limited evidence and an unrepresented choice', vi: 'Ít căn cứ và một lựa chọn chưa được thể hiện' },
    purpose: {
      en: 'Recognize that one directional answer is limited evidence and that none of the offered choices is distinct from skipping.',
      vi: 'Nhận ra rằng một câu trả lời theo hướng cụ thể chỉ cung cấp căn cứ hạn chế, và không phương án nào phù hợp khác với bỏ qua.',
    },
    taskIds: ['T05'],
    facilitatorNotes: {
      en: 'Only the public-ownership statement is agreed with. The records situation says none of the offered choices, and its optional personal preference also says none; all other responses are skipped. The economic reading must stay limited. The two unrepresented responses do not select an action and cannot form a concrete role/preference comparison.',
      vi: 'Chỉ nhận định về sở hữu công được tán thành. Trong tình huống hồ sơ công, câu trả lời là không phương án nào phù hợp, và lựa chọn cá nhân không bắt buộc cũng như vậy; mọi câu trả lời khác đều được bỏ qua. Cách đọc chủ đề kinh tế phải giữ ở mức hạn chế. Hai câu trả lời không có phương án phù hợp không chọn ra hành động và không tạo thành một cặp so sánh hành động/lựa chọn cá nhân cụ thể.',
    },
  },
  {
    id: 'RP06',
    title: { en: 'Different housing choices across two deadlines', vi: 'Lựa chọn nhà ở khác nhau giữa hai thời hạn' },
    purpose: {
      en: 'Describe an observed choice change without claiming that the deadline caused it.',
      vi: 'Mô tả sự thay đổi lựa chọn quan sát được mà không khẳng định thời hạn gây ra thay đổi đó.',
    },
    taskIds: ['T06'],
    facilitatorNotes: {
      en: 'The urgent case selects a sale with the reason “Meet immediate public needs”; the longer-deadline case selects municipal housing with “Keep long-term public control.” All other responses are skipped, with no personal preferences. The recorded choices and selected reasons differ. The fixed order and repeated dilemma do not establish that changing the deadline caused the difference or reveal a stable personality trait.',
      vi: 'Tình huống khẩn cấp chọn bán khu đất với lý do “Đáp ứng nhu cầu công trước mắt”; tình huống có thời hạn dài hơn chọn nhà ở do chính quyền quản lý với lý do “Giữ quyền kiểm soát công lâu dài.” Mọi câu trả lời khác đều được bỏ qua và không có lựa chọn cá nhân. Các phương án và lý do được ghi nhận khác nhau. Thứ tự cố định và tình huống lặp lại không chứng minh rằng thay đổi thời hạn gây ra sự khác biệt, cũng không cho biết một đặc điểm tính cách ổn định.',
    },
  },
]);

function statements(session, kind, value = 0, includePremises = true) {
  for (const item of instrument.statements) session.answers[`statement:${item.id}`] = kind === 'value' ? { kind, value } : { kind };
  if (includePremises) for (const item of instrument.foundations.items) session.answers[`foundation:${item.id}`] = kind === 'value' ? { kind, value } : { kind };
}

function agree(session, id) {
  const type = id.startsWith('premise-') ? 'foundation' : 'statement';
  session.answers[`${type}:${id}`] = { kind: 'value', value: 2 };
}

function choose(session, id, optionId, reasonId = null, preference) {
  session.answers[`scenario:${id}`] = { kind: 'choice', optionId, reasonId, ...(preference ? { preference: { ...preference } } : {}) };
}

/** Return a new, completed synthetic example; never load a personal save. */
export function createPilotFixture(caseId) {
  const metadata = pilotCases.find(item => item.id === caseId);
  if (!metadata) throw new Error('Unknown synthetic pilot case. Choose RP01–RP06.');
  if (instrument.version !== '0.4.0') throw new Error('Review the synthetic pilot cases before using a different instrument version.');
  const session = createSession(instrument, FIXTURE_SEED);
  statements(session, 'skip');
  for (const scene of instrument.scenarios) session.answers[`scenario:${scene.id}`] = { kind: 'skip', reasonId: null };

  if (caseId === 'RP01') {
    statements(session, 'value');
    for (const id of [
      'economic-services', 'economic-access', 'premise-property-independence',
      'premise-own-good', 'premise-nondomination', 'premise-contestable-power',
      'premise-personal-agency', 'premise-social-relations', 'societal-new-voices',
      'premise-gradual-reform', 'premise-care-obligations', 'premise-ecological-dependence',
    ]) agree(session, id);
    for (const [id, option] of Object.entries({
      'housing-urgent': 'cooperative', 'public-assembly': 'conditions',
      'water-partnership': 'local', 'community-festival': 'balanced',
      'service-contract': 'public', 'community-history': 'paired',
      'public-records': 'summaries', 'regional-cooperation': 'combined',
      'housing-planned': 'cooperative',
    })) choose(session, id, option);
    session.answers['scenario:housing-urgent'].preference = { kind: 'choice', optionId: 'municipal' };
  } else if (caseId === 'RP02') {
    statements(session, 'value', 0, false);
    agree(session, 'economic-ownership');
    agree(session, 'economic-market');
    choose(session, 'housing-urgent', 'cooperative');
    choose(session, 'service-contract', 'mixed');
  } else if (caseId === 'RP03') {
    statements(session, 'value');
  } else if (caseId === 'RP04') {
    statements(session, 'uncertain');
    for (const scene of instrument.scenarios) session.answers[`scenario:${scene.id}`] = { kind: 'uncertain', reasonId: null };
  } else if (caseId === 'RP05') {
    agree(session, 'economic-ownership');
    session.answers['scenario:public-records'] = { kind: 'none', reasonId: null, preference: { kind: 'none' } };
  } else if (caseId === 'RP06') {
    choose(session, 'housing-urgent', 'sell', 'immediate');
    choose(session, 'housing-planned', 'municipal', 'ownership');
  }

  session.stepIndex = makeSteps(instrument).length - 1;
  session.completed = true;
  const validation = validateSession(instrument, session);
  if (!validation.valid) throw new Error(`Invalid synthetic pilot case ${caseId}: ${validation.error}`);
  const report = buildDebrief(instrument, session);
  return { case: structuredClone(metadata), session, report, interpretation: interpretDebrief(instrument, report) };
}
