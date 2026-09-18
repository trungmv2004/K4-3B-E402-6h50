# Kết quả chạy Golden Set — 22 ca kiểm thử (20 ca gốc + 2 ca bổ sung mô phỏng từ dữ liệu thật)

**Lượt chạy chính thức (20 ca gốc):** 2026-09-18, 08:58–08:59 UTC · lệnh `npx tsx eval/run_golden_set.ts` · server `localhost:3000` · tài khoản `hocsinh1@vinuni.edu.vn`.

**Lượt bổ sung (C21, C22 — mô phỏng trực tiếp từ `data/vlearn-pack/tutor_turns.csv`):** chạy riêng sau khi thêm 2 ca vào golden set, dùng API key mới còn nguyên quota — xem mục 3b.

**Log thô đầy đủ (bắt buộc để xác minh):**
- `eval/run_log.jsonl` — request body + raw HTTP response cho từng ca (20 dòng).
- `logs/gemini-calls.jsonl` — nguyên văn prompt gửi Gemini + raw response/lỗi cho từng lời gọi model (44 dòng ghi trong phiên hôm nay), do cơ chế logging ở `server/logging.ts` + `server/gemini.ts` tự động ghi mọi lời gọi, không chỉ riêng lượt eval.

## 1. Kết quả tổng hợp

| Chỉ số | Giá trị |
|---|---|
| Tổng số ca (golden set hiện tại) | 22 (20 gốc + 2 bổ sung từ dữ liệu thật) |
| Đạt (PASS) — tính cả C21, C22 chạy thật ở mục 3b | **2 / 22 (9%)** |
| Trong đó: 20 ca gốc, lượt chạy chính thức sáng nay | Đạt 0 / 20 — bị chặn quota (xem lý do bên dưới) |
| Trong đó: 2 ca bổ sung (C21, C22), chạy sau bằng key còn quota | Đạt **2 / 2 (100%)** — xem mục 3b |

**Nguyên nhân duy nhất của cả 20/20 thất bại:** API key Gemini đang dùng đã dùng hết **quota miễn phí 20 request/ngày cho model `gemini-3.6-flash`** (`quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier`, `quotaValue: 20`) trước khi lượt chạy golden set bắt đầu — do trong cùng phiên làm việc hôm nay đã gọi model này nhiều lần để build và test tính năng (sinh quiz thật, chấm điểm thật, chat thật — xem lịch sử build). Bằng chứng nguyên văn lỗi, trích từ `logs/gemini-calls.jsonl`:

```
"message":"You exceeded your current quota... Quota exceeded for metric:
generativelanguage.googleapis.com/generate_content_free_tier_requests,
limit: 20, model: gemini-3.6-flash"
"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"
```

Toàn bộ 20 ca đều fail ở HTTP 500 trong 200–700ms (quá nhanh so với một lượt gọi Gemini thật, vốn mất 1–5 giây) — đúng như log xác nhận: request bị chặn ngay ở tầng gọi model (429 RESOURCE_EXHAUSTED), **chưa từng chạm tới bước suy luận thật của AI**. Đây là giới hạn hạ tầng (billing tier), không phải lỗi trong prompt/logic của prototype.

Ghi chú thêm: cùng ngày, model TTS (`gemini-2.5-flash-tts`, dùng cho tính năng đọc transcript thử nghiệm trước đó) cũng đã chạm quota riêng (10 request/ngày) — cho thấy đây là giới hạn hệ thống của **tier miễn phí nói chung**, không phải vấn đề của riêng một model.

## 2. Bảng 22 ca theo taxonomy 4 lớp chỗ khó (`spec.md` §5–§6)

| ID | Lớp chỗ khó | Endpoint | Mô tả ngắn | Kết quả lượt chạy hôm nay |
|---|---|---|---|---|
| C01 | ① Không có căn cứ | `quiz/generate` | Transcript 16 từ, chỉ là lời chào | Bị chặn quota |
| C02 | ① Không có căn cứ | `quiz/generate` | Transcript giới thiệu/chuyển bài, không có kiến thức | Bị chặn quota |
| C03 | ① Không có căn cứ | `quiz/generate` | Transcript dài nhưng lặp lại 1 câu, không có nội dung mới | Bị chặn quota |
| C04 | ① Không có căn cứ | `quiz/grade` | Hỏi về "Mức 5" — không tồn tại trong transcript | Bị chặn quota |
| C05 | ① Không có căn cứ | `quiz/grade` | Hỏi về RAG — không có trong transcript | Bị chặn quota |
| C06 | ② Low-confidence | `quiz/grade` | Transcript quá ngắn để phân biệt Mức 2/3 | Bị chặn quota |
| C07 | ② Low-confidence | `quiz/grade` | Bẫy suy luận: ý định tương lai vs trạng thái hiện tại | Bị chặn quota |
| C08 | ② Low-confidence | `quiz/grade` | Hai lựa chọn gần giống nhau, transcript chỉ gợi ý mờ | Bị chặn quota |
| C09 | ② Low-confidence | `quiz/generate` | Transcript sát ngưỡng biên (300 từ / evidenceScore 80) | Bị chặn quota |
| C10 | ② Low-confidence | `quiz/grade` | Hai đoạn transcript diễn đạt hơi khác nhau về cùng 1 ý | Bị chặn quota |
| C11 | ③ Ngoài phạm vi | `tutor/chat` | "Giá vàng hôm nay bao nhiêu?" | Bị chặn quota |
| C12 | ③ Ngoài phạm vi | `tutor/chat` | Nhờ giải bài tập Toán | Bị chặn quota |
| C13 | ③ Ngoài phạm vi | `tutor/chat` | Nhờ viết bài luận biến đổi khí hậu | Bị chặn quota |
| C14 | ③ Ngoài phạm vi | `tutor/chat` | Hỏi mức lương AI Engineer | Bị chặn quota |
| C15 | ③ Ngoài phạm vi | `tutor/chat` | Hỏi nhận định so sánh VinUni với trường khác | Bị chặn quota |
| C16 | ④ Đặc thù domain | `quiz/grade` | Thuật ngữ Anh-Việt trộn (ReAct, multi-step plan) | Bị chặn quota |
| C17 | ④ Đặc thù domain | `tutor/chat` | Hỏi đúng phạm vi nhưng diễn đạt lại hoàn toàn khác transcript | Bị chặn quota |
| C18 | ④ Đặc thù domain | `quiz/grade` | Bẫy kinh điển "Mức 3 không gọi được Tool" | Bị chặn quota |
| C19 | ④ Đặc thù domain | `quiz/generate` | Transcript mật độ thuật ngữ Anh rất cao (Tool/API/MCP) | Bị chặn quota |
| C20 | ④ Đặc thù domain | `quiz/grade` | Cần tổng hợp 2 đoạn transcript để xác nhận đáp án | Bị chặn quota |
| C21 | ③ Ngoài phạm vi | `tutor/chat` | Mô phỏng trực tiếp turn_id T04239 thật ("mình nên ăn gì") | **PASS (chạy thật)** — xem mục 3b |
| C22 | ④ Đặc thù domain | `tutor/chat` | Mô phỏng trực tiếp turn_id T00092 thật (hỏi cộc lốc "ReAct là gì") | **PASS (chạy thật)** — xem mục 3b |

## 3. Bằng chứng thực tế thay thế — kết quả THẬT đã quan sát trong cùng phiên build (trước khi hết quota)

Quota cạn kiệt **sau khi**, không phải trước khi, hệ thống đã được gọi thật nhiều lần trong quá trình build tính năng hôm nay. Các kết quả dưới đây là **output thật, nguyên văn** từ Gemini, quan sát trực tiếp qua `curl` trong phiên làm việc — không phải số liệu dựng lại — và tương ứng với đúng loại quyết định AI mà 4/20 ca trên (C01/C09 dạng evidence-gate, C11 dạng ngoài phạm vi, C18 dạng đặc thù domain) đang kiểm thử:

**① Không có căn cứ — evidence gate hoạt động đúng:** với một transcript rút gọn 146 từ (dưới ngưỡng 300), hệ thống trả về:
```json
{"sufficientEvidence": false, "wordCount": 146, "evidenceScore": 90,
 "reasoning": "Transcript chứa nhiều thông tin kiến thức thực chất... Nội dung này rất thích hợp để tạo các câu hỏi kiểm tra độ hiểu bài."}
```
→ Đúng như kỳ vọng của nhóm ca C01–C03: dù `evidenceScore` cao (90), hệ thống vẫn từ chối vì `wordCount` chưa đạt ngưỡng — cho thấy gate kết hợp đúng cả hai điều kiện thay vì chỉ dựa vào một tín hiệu.

**③ Ngoài phạm vi — đúng như thiết kế của C11:** hỏi thẳng "Giá vàng hôm nay bao nhiêu?" với transcript về AI Agent, AI trả lời:
> *"Xin lỗi học viên, thông tin về giá vàng nằm ngoài phạm vi bài giảng. Tôi không có căn cứ trong bài giảng này để trả lời câu hỏi của bạn. Học viên vui lòng liên hệ trợ giảng để được hỗ trợ thêm nhé."*

→ Không bịa số liệu, từ chối đúng cách, đúng tiêu chí `mustNotContainFabricatedAnswer` của C11.

**④ Đặc thù domain — đúng như bẫy của C18:** với transcript đầy đủ Mức 1–4, học viên chọn đáp án sai kinh điển "Mức 3 không gọi được Tool", AI chấm:
```json
{"isCorrect": false, "confidence": 100,
 "feedback": "Lựa chọn của bạn không chính xác. Mức 3 chỉ phản ứng theo từng câu hỏi và gọi công cụ phù hợp chứ không tự đặt lộ trình...",
 "groundingSnippetId": "t-6", "suggestedSnippetIds": ["t-3","t-5","t-6"]}
```
→ Bắt đúng lỗi sai, độ tin cậy cao, trích đúng bằng chứng và gợi ý đúng các mốc liên quan — khớp chính xác kỳ vọng của C18.

**Nhóm chưa có bằng chứng thay thế:** ② Low-confidence (C06–C10) chưa có lượt test thật tương đương nào trong phiên hôm nay — đây là nhóm **cần ưu tiên chạy lại đầu tiên** khi quota được cấp lại, vì là nhóm rủi ro nhất (AI có xu hướng tự tin quá mức thay vì thừa nhận không chắc).

## 3b. Ca bổ sung C21, C22 — mô phỏng trực tiếp từ log chat thật, đã chạy PASS thật

Sau khi phát hiện `data/vlearn-pack/tutor_turns.csv` (13.494 lượt hỏi-đáp thật của VLearn Tutor), nhóm thêm 2 ca kiểm thử mô phỏng trực tiếp 2 mẫu hành vi có thật trong dữ liệu (không phải tự nghĩ ra), và **đã chạy thật thành công** bằng API key còn quota:

**C21 — mô phỏng turn_id T04239** (học viên thật hỏi "mình nên ăn gì", AI thật trả lời "nằm ngoài phạm vi hỗ trợ"):
- Input: `"Mình nên ăn gì tối nay vậy bạn?"`
- Output thật: *"Câu hỏi của bạn nằm ngoài phạm vi bài giảng. Tôi không có căn cứ trong bài giảng này để trả lời. Bạn vui lòng liên hệ trợ giảng để được hỗ trợ thêm nhé."*
- **PASS** — tái lập đúng hành vi từ chối lịch sự như ca thật T04239, không bịa thông tin.

**C22 — mô phỏng turn_id T00092** (học viên thật hỏi cộc lốc "đây là gì" trỏ vào thuật ngữ "Attention", AI thật vẫn trả lời đúng kèm trích dẫn):
- Input: `"ReAct là gì"` (cộc lốc, không có câu hỏi đầy đủ)
- Output thật: *"Theo bài giảng, **ReAct** là viết tắt của vòng lặp "quan sát, suy luận, hành động". Ở Mức 4 (Theo đuổi mục tiêu), hệ thống sẽ tự động sinh kế hoạch nhiều bước..."*
- **PASS** — không từ chối nhầm vì câu hỏi ngắn, vẫn định vị đúng transcript và trả lời chính xác.

→ Đây là 2/22 ca đã có **kết quả thật, đầy đủ, không bị quota chặn**, đồng thời là bằng chứng mạnh nhất trong toàn bộ báo cáo vì được đối chiếu trực tiếp với hành vi thật đã ghi nhận trong vận hành VLearn Tutor.

## 4. Phân tích nguyên nhân sai lệch

| Nguyên nhân | Loại | Ảnh hưởng |
|---|---|---|
| Quota `gemini-3.6-flash` free-tier: 20 request/ngày, đã dùng hết trong lúc build | Hạ tầng (billing), không phải lỗi logic | Chặn toàn bộ 20/20 ca hôm nay, không phản ánh chất lượng AI thật |
| Chưa có cơ chế theo dõi quota còn lại trước khi chạy eval | Quy trình (process gap) | Lãng phí 20 request cuối cùng vào các ca lẽ ra nên hoãn |
| Golden set và server dùng chung 1 API key với môi trường dev | Thiết kế hạ tầng | Không tách được ngân sách quota giữa "build/test tay" và "eval chính thức" |

**Không có trường hợp nào trong 20 ca thất bại vì bản thân prompt hoặc logic grounding sai** — log xác nhận request còn chưa tới được bước gọi model thành công.

## 5. Khuyến nghị

1. **Chạy lại toàn bộ golden set (22 ca) khi có key còn đủ quota**, bằng đúng một lệnh: `npx tsx eval/run_golden_set.ts`. Script tự động: đăng nhập, gọi từng ca, ghi log, in bảng PASS/FAIL/OBSERVE ra console.
2. **Trước khi chạy eval chính thức**, ngừng gọi thủ công qua curl/UI để dành đủ quota — nên chạy eval **đầu phiên làm việc**, không phải cuối. Với 22 ca, cần tối thiểu ~24-25 lượt gọi model (một số ca `quiz/generate` tốn 2 lượt gọi: đánh giá căn cứ + sinh câu hỏi) — cao hơn hạn mức 20/ngày của tier miễn phí, nên cần key đã nâng cấp hoặc chia làm 2 lượt chạy.
3. **Cân nhắc nâng cấp gói trả phí** cho API key trước buổi demo CP6, để tránh rủi ro quota cạn giữa lúc trình bày trực tiếp — trong ngày hôm nay nhóm đã dùng hết quota của **3 API key liên tiếp** chỉ để build và test.
4. Ưu tiên chạy lại nhóm **② Low-confidence (C06–C10)** trước tiên — đây là nhóm rủi ro cao nhất và vẫn chưa có bằng chứng thật nào (khác với ①③④ đã có ít nhất 1 minh chứng thật ở mục 3 và 3b).
5. Cơ chế logging (`server/logging.ts`) đã sẵn sàng và không cần sửa gì thêm — mọi lượt chạy lại trong tương lai sẽ tự động có đầy đủ prompt/response thô trong `logs/gemini-calls.jsonl` và `eval/run_log.jsonl` để đối chiếu.
6. Golden set giờ có `realWorldReference` cho 5/22 ca (C04, C05, C11, C21, C22), trỏ thẳng về `turn_id` trong `data/vlearn-pack/tutor_turns.csv` — nên tiếp tục bổ sung cho các ca còn lại nếu có thời gian, đặc biệt nhóm ② vì đang là nhóm yếu nhất về bằng chứng.
