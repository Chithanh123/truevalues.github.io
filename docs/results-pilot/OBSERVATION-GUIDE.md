# Recording result-comprehension observations

**Draft for interpretation rules 1.0.0. No participant observations or findings have been recorded in this template.** Record the actual application and packet versions used in each session. The Vietnamese guidance below is an author draft awaiting bilingual review.

Use the header-only [observation log](observation-log-template.csv) with the [session script](SESSION-SCRIPT.md) and [pilot protocol](PROTOCOL.md). It records whether a person understands the report's claim and its supporting evidence. It does not rate the person's political views, agreement with the interpretation, intelligence, or political consistency.

**Tiếng Việt:** Biểu mẫu chỉ ghi nhận cách người tham gia hiểu lời diễn giải kết quả và căn cứ của lời diễn giải đó. Không dùng biểu mẫu để chấm quan điểm chính trị, mức độ đồng ý, trí tuệ hoặc mức độ “nhất quán” về chính trị. Hướng dẫn tiếng Việt là bản dự thảo của tác giả, chưa qua rà soát song ngữ độc lập.

## Use the log

1. Freeze the material version and case/task IDs before a session. Record one row for each observed case/task, including an explicit `observed_no_issue` when the task revealed no issue. Leave untested tasks unclaimed, or mark them `not_observed` with the reason. A blank log is not a successful test.
2. Ask the script's open prompt and record the **first unaided paraphrase** before offering explanations. Summarize the relevant understanding in `observation`; note any later neutral probe or instruction separately in that same field. Never replace the first rating with an answer obtained after teaching.
3. Rate comprehension separately from navigation. A reader can understand the explanation while having difficulty finding a numbered evidence link, or open a link without understanding how it supports the finding.
4. Describe the concrete problem and its target. A participant may understand the intended reading accurately while reasonably questioning the authored reasoning. Preserve that critique as an issue; do not mark the person wrong for disagreeing. If the intended meaning is too ambiguous to assess an unaided paraphrase, use `not_observed` and explain the ambiguity rather than forcing a comprehension judgment.
5. Record a proposed revision without treating it as approved. After a wording or interface change, create a **new observation row** under the new material version, with `retest_reference` pointing to the original observation. Retain the original first response and rating. Close the issue only after a documented recheck of the same problem.

**Tiếng Việt:** Ghi lại cách diễn đạt lại ý nghĩa lần đầu, trước khi giải thích hoặc hướng dẫn. Phân biệt việc hiểu nội dung với việc tìm được câu trả lời làm căn cứ. Hiểu đúng nhưng không đồng ý vẫn có thể được ghi là `accurate`. Sau khi sửa nội dung, ghi lần kiểm tra lại ở dòng mới; không thay thế đánh giá ban đầu bằng câu trả lời sau khi đã được giải thích.

Use optional random session codes only if linking tasks is needed under the operator's agreed procedure. Do not put names, contact details, account handles, demographic profiles, political affiliations, full quiz responses, or identifiable personal stories in this log. Prefer short, non-identifying paraphrases. Verbatim quotations or recordings require the separately agreed consent and handling procedure; this template does not authorize them. Store actual logs outside the public repository and share only under the operator's procedure.

**Tiếng Việt:** Nếu cần nối các quan sát trong cùng một buổi, dùng mã phiên ngẫu nhiên theo quy trình đã thống nhất. Không ghi tên, thông tin liên hệ, tài khoản, hồ sơ nhân khẩu học, tổ chức chính trị, toàn bộ câu trả lời của bài trắc nghiệm hoặc câu chuyện có thể nhận diện cá nhân. Ưu tiên diễn đạt lại ngắn gọn, không nhận diện người tham gia. Không đưa nhật ký thực tế lên kho mã công khai.

## Fields

Use the machine-readable values below in the CSV; write short notes in English or Vietnamese. Separate multiple tags or target IDs with `|`. Import CSV as UTF-8 and set free-text columns to Text. Before sharing a CSV, neutralize formula-leading free text in the spreadsheet export, such as by prefixing an apostrophe; the blank template contains no formulas or sample observations.

| Column | What to record / Nội dung cần ghi |
| --- | --- |
| `observation_id` | Unique local record code, with no identifying meaning. / Mã riêng của quan sát, không mang thông tin nhận diện. |
| `session_code` | Optional random code for the session; omit if linkage is unnecessary. / Mã phiên ngẫu nhiên, không bắt buộc. |
| `round` | Actual formative round number. / Số vòng thử nghiệm thực tế. |
| `material_version` | Application/rules/packet revision and source commit or frozen build reference. Do not assume a live URL identifies a version. / Phiên bản ứng dụng, quy tắc, tài liệu và bản dựng đã dùng. |
| `case_id` | Copy the synthetic case ID from the packet. For an optional own-quiz session, use `own-completed-quiz`; do not copy political answers into the log. / Mã tình huống giả lập trong bộ tài liệu; không sao chép câu trả lời chính trị. |
| `task_id` | `T01`–`T08`, from the session script. / Mã nhiệm vụ trong kịch bản. |
| `language` | `en`, `vi`, or `mixed`: language used for the observed task; note switching if it affects interpretation. / Ngôn ngữ dùng khi thực hiện nhiệm vụ. |
| `paraphrase_status` | First unaided understanding: `accurate`, `partial`, `misleading`, or `not_observed`. / Mức độ hiểu thể hiện ở lần diễn đạt lại đầu tiên, chưa được hướng dẫn. |
| `evidence_navigation` | `independent`, `neutral_prompt`, `directive_help`, or `not_observed`. / Mức hỗ trợ khi tìm câu trả lời làm căn cứ. |
| `misunderstanding_tags` | Zero or more tags from the table below; use `none` when none was observed. / Nhãn mô tả hiểu nhầm; dùng `none` nếu chưa ghi nhận hiểu nhầm. |
| `severity` | `none`, `minor`, `major`, or `critical`, based on the issue's effect. / Mức độ ảnh hưởng của vấn đề. |
| `observation` | Concise non-identifying paraphrase or interaction description. Distinguish first response, later probes, and facilitator interpretation. / Diễn đạt lại ngắn gọn; phân biệt câu trả lời đầu, câu hỏi gợi mở sau đó và nhận định của người điều phối. |
| `proposed_revision` | Specific wording or interaction change to consider; blank if none. / Đề xuất sửa cụ thể, nếu có. |
| `target_ids` | Relevant insight, theme, item, or control IDs from the packet/source. / Mã lời diễn giải, chủ đề, câu hỏi hoặc điều khiển liên quan. |
| `status` | `observed_no_issue`, `open`, `revised_awaiting_retest`, `resolved`, or `not_retested`. / Trạng thái xử lý vấn đề. |
| `resolution` | What changed, why, the revised version, and the evidence for closure or remaining limitation. / Nội dung đã sửa, lý do, phiên bản mới và căn cứ kết luận hoặc giới hạn còn lại. |
| `retest_result` | `not_run`, `resolved`, `persists`, `unclear`, or `not_applicable`. / Kết quả kiểm tra lại: chưa thực hiện, đã giải quyết, còn tồn tại, chưa rõ hoặc không áp dụng. |
| `retest_reference` | On a new retest row, the original `observation_id` being checked. / Ở dòng kiểm tra lại, ghi mã quan sát ban đầu. |

| Task | Case IDs | Focus / Nội dung |
| --- | --- | --- |
| `T01` | `RP01` | Finding paraphrase / Diễn đạt lại lời diễn giải |
| `T02` | `RP01` | Evidence navigation and support / Tìm và giải thích căn cứ |
| `T03` | `RP01` | Role action versus personal preference / Quyết định theo vai trò và ưu tiên cá nhân |
| `T04` | `RP02`, `RP03` | Mixed directions versus neutral responses / Các hướng trả lời khác nhau và câu trả lời trung lập |
| `T05` | `RP04`, `RP05` | Uncertain, limited, unrepresented, and skipped evidence / Không chắc, ít dữ liệu, không có phương án phù hợp và bỏ qua |
| `T06` | `RP06` | Housing-condition comparison / So sánh hai điều kiện của tình huống nhà ở |
| `T07` | `RP01` | Interpretation limits and coverage gaps / Giới hạn của lời diễn giải và khoảng trống tình huống |
| `T08` | `RP01` | Final country reveal and download / Tiết lộ quốc gia tương ứng ở cuối và tải báo cáo |

The cases appear in the separate synthetic-results page, `results-pilot.html`, and the generated [examples booklet](EXAMPLES.md). For `T04` or `T05`, a single comparative observation may use `|` between the two case IDs. Otherwise record the case actually examined. An optional own-completed-quiz task uses `case_id=own-completed-quiz`. A control-only observation need not include a paraphrase rating: use `not_observed` and describe what was tested. Synthetic examples are authored fixtures, not participant responses or findings.

## Meaning of the ratings

| First unaided paraphrase | Operational meaning / Ý nghĩa khi ghi nhận |
| --- | --- |
| `accurate` | Preserves the finding's meaning and the limits relevant to the task, in the reader's own words. Agreement with the finding is unnecessary. / Diễn đạt đúng ý và giới hạn liên quan; không yêu cầu đồng ý với lời diễn giải. |
| `partial` | Captures part of the meaning but leaves an important condition or distinction unexplained, without stating a clear false inference. / Nắm được một phần nhưng chưa giải thích điều kiện hoặc phân biệt quan trọng. |
| `misleading` | Expresses an unsupported inference or reverses a key distinction. Record the specific claim, not a judgment about the person. / Nêu suy luận chưa có căn cứ hoặc hiểu ngược một phân biệt quan trọng; ghi rõ nội dung hiểu nhầm. |
| `not_observed` | No assessable unaided paraphrase: not asked, declined, interrupted, control-only task, or intended meaning too ambiguous to rate. Record which reason applies. / Chưa có cách diễn đạt lại đủ điều kiện đánh giá; ghi rõ lý do. |

For navigation, `independent` means the correct record was found after the normal task prompt without extra help. `neutral_prompt` means an additional open prompt was needed without naming the control or location. `directive_help` means the facilitator pointed to or described the required control/location. `not_observed` means navigation was not assessed or could not be observed. Record whether the reader connected the opened response to the claim; finding the element alone does not demonstrate comprehension.

**Tiếng Việt:** `independent` là tự tìm được sau yêu cầu nhiệm vụ thông thường; `neutral_prompt` là cần thêm câu hỏi gợi mở nhưng chưa được chỉ vị trí; `directive_help` là đã được chỉ nút, vị trí hoặc thao tác; `not_observed` là chưa quan sát được. Tìm được câu trả lời làm căn cứ chưa đồng nghĩa với hiểu được mối liên hệ giữa câu trả lời và lời diễn giải.

## Misunderstanding tags

| Tag | Use when the observed reading involves / Dùng khi ghi nhận |
| --- | --- |
| `identitylabel` | Treating an exploratory reading as a definitive ideology, party affiliation, or true identity. / Xem lời diễn giải thăm dò là nhãn hệ tư tưởng hoặc bản chất chính trị chắc chắn. |
| `motiveclaim` | Attributing a motive that the person did not select or claiming why a choice was made. / Gán động cơ chưa được lựa chọn hoặc khẳng định nguyên nhân của lựa chọn. |
| `mixedneutral` | Conflating mixed directions, neutral, uncertain, skipped, unrepresented, or sparse responses. / Đồng nhất các hướng trả lời khác nhau với trung lập, không chắc, bỏ qua, thiếu phương án phù hợp hoặc thiếu dữ liệu. |
| `rolepreference` | Confusing the assigned-role action with personal preference, treating missing preference as agreement, or calling a difference hypocrisy. / Nhầm quyết định theo vai trò với ưu tiên cá nhân, hoặc coi khác biệt là giả tạo. |
| `causaldeadline` | Treating a changed housing answer as proof that the deadline caused the change, or treating an unchanged answer as proof that context never matters. / Xem khác biệt giữa hai lần trả lời là bằng chứng nhân quả về thời hạn. |
| `sourceevidence` | Misreading which answer supports a finding, interpreting a selected package as an unrecorded reason, or misunderstanding an evidence link. / Hiểu sai câu trả lời nào làm căn cứ hoặc cách dùng liên kết căn cứ. |
| `coveragegap` | Treating a premise without a dedicated scenario as observed behavior, or treating coverage counts as measurement confidence. / Xem giả định chưa được kiểm tra bằng tình huống là hành vi đã được quan sát. |
| `other` | A specific issue outside these tags. State it in `observation`, including country-reveal or data-control issues. / Vấn đề khác; mô tả cụ thể, kể cả việc tiết lộ quốc gia hoặc kiểm soát dữ liệu. |
| `none` | No misunderstanding observed in the tested task. Do not combine with another tag. / Chưa ghi nhận hiểu nhầm trong nhiệm vụ đã thực hiện. |

Tags can overlap; use only the tags supported by the observation. An unexpected but defensible interpretation can reveal an authored wording problem. Do not force it into a participant-error category.

## Severity and follow-up

| Severity | Action / Cách xử lý |
| --- | --- |
| `none` | No issue found in this observation. Does not approve the whole report. / Chưa thấy vấn đề ở quan sát này; không phải kết luận cho toàn bộ báo cáo. |
| `minor` | Wording, readability, or navigation friction that does not change the substantive reading. Track and recheck after editing. / Vướng mắc về câu chữ hoặc thao tác, chưa làm thay đổi ý chính. |
| `major` | A materially unsupported reading, misunderstood distinction, or evidence-access failure affects the task. Revise the affected target before the next wave; one clear instance can be sufficient. / Hiểu nhầm làm thay đổi ý nghĩa hoặc không kiểm tra được căn cứ; cần sửa mục liên quan trước vòng tiếp theo. |
| `critical` | A wrong response is attributed to the displayed person/case, private data are exposed unexpectedly, or controls materially misrepresent what is collected/deleted. Stop the affected task and resolve before reuse. / Gán nhầm câu trả lời, lộ dữ liệu ngoài dự kiến hoặc mô tả sai việc thu thập/xóa dữ liệu; dừng nhiệm vụ liên quan để xử lý. |

`observed_no_issue` pairs with `severity=none` and normally `retest_result=not_applicable`. A proposed change is `open`; an implemented change without new observation is `revised_awaiting_retest`. Use `not_retested` when a remaining issue is explicitly carried forward without a completed recheck. Use `resolved` only when a revision and relevant retest evidence are documented. A new automated test is engineering evidence, not a substitute for the comprehension observation that originally exposed the problem.

Summarize by concrete misunderstanding, affected case/task and language, revision, and retest outcome. Do not treat rows as independent people, add these categories into a political or comprehension score, report small-sample percentages as validation, or treat agreement with the facilitator as success. If extra rows are needed for distinct issues within one task, reference the original observation so they are not mistaken for additional participants.

**Tiếng Việt:** Tổng hợp theo vấn đề cụ thể, nhiệm vụ và ngôn ngữ, nội dung sửa và kết quả kiểm tra lại. Không cộng các mức ghi nhận thành điểm chính trị hoặc điểm năng lực; không xem từng dòng là một người độc lập. Kết quả của nhóm nhỏ giúp phát hiện và sửa vấn đề, không chứng minh độ giá trị của phép đo.
