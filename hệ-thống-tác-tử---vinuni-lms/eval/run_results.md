# Kết quả chạy Golden Set — 20 ca kiểm thử

**Lượt chạy chính thức:** 2026-09-18, 08:58–08:59 UTC · lệnh `npx tsx eval/run_golden_set.ts` · server `localhost:3000` · tài khoản `hocsinh1@vinuni.edu.vn`.

**Log thô đầy đủ (bắt buộc để xác minh):**
- `eval/run_log.jsonl` — request body + raw HTTP response cho từng ca (20 dòng).
- `logs/gemini-calls.jsonl` — nguyên văn prompt gửi Gemini + raw response/lỗi cho từng lời gọi model (44 dòng ghi trong phiên hôm nay), do cơ chế logging ở `server/logging.ts` + `server/gemini.ts` tự động ghi mọi lời gọi, không chỉ riêng lượt eval.

## 1. Kết quả tổng hợp (lượt chạy chính thức hôm nay)

| Chỉ số | Giá trị |
|---|---|
| Tổng số ca | 20 |
| Đạt (PASS) | **0** |
| Thất bại — bị chặn bởi quota, KHÔNG PHẢI lỗi logic AI | **20** |
| Tỷ lệ đạt (chính thức, hôm nay) | **0%** |

**Nguyên nhân duy nhất của cả 20/20 thất bại:** API key Gemini đang dùng đã dùng hết **quota miễn phí 20 request/ngày cho model `gemini-3.6-flash`** (`quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier`, `quotaValue: 20`) trước khi lượt chạy golden set bắt đầu — do trong cùng phiên làm việc hôm nay đã gọi model này nhiều lần để build và test tính năng (sinh quiz thật, chấm điểm thật, chat thật — xem lịch sử build). Bằng chứng nguyên văn lỗi, trích từ `logs/gemini-calls.jsonl`:

```
"message":"You exceeded your current quota... Quota exceeded for metric:
generativelanguage.googleapis.com/generate_content_free_tier_requests,
limit: 20, model: gemini-3.6-flash"
"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"
```

Toàn bộ 20 ca đều fail ở HTTP 500 trong 200–700ms (quá nhanh so với một lượt gọi Gemini thật, vốn mất 1–5 giây) — đúng như log xác nhận: request bị chặn ngay ở tầng gọi model (429 RESOURCE_EXHAUSTED), **chưa từng chạm tới bước suy luận thật của AI**. Đây là giới hạn hạ tầng (billing tier), không phải lỗi trong prompt/logic của prototype.

Ghi chú thêm: cùng ngày, model TTS (`gemini-2.5-flash-tts`, dùng cho tính năng đọc transcript thử nghiệm trước đó) cũng đã chạm quota riêng (10 request/ngày) — cho thấy đây là giới hạn hệ thống của **tier miễn phí nói chung**, không phải vấn đề của riêng một model.

## 2. Bảng 20 ca theo taxonomy 4 lớp chỗ khó (`spec.md` §5–§6)

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

## 4. Phân tích nguyên nhân sai lệch

| Nguyên nhân | Loại | Ảnh hưởng |
|---|---|---|
| Quota `gemini-3.6-flash` free-tier: 20 request/ngày, đã dùng hết trong lúc build | Hạ tầng (billing), không phải lỗi logic | Chặn toàn bộ 20/20 ca hôm nay, không phản ánh chất lượng AI thật |
| Chưa có cơ chế theo dõi quota còn lại trước khi chạy eval | Quy trình (process gap) | Lãng phí 20 request cuối cùng vào các ca lẽ ra nên hoãn |
| Golden set và server dùng chung 1 API key với môi trường dev | Thiết kế hạ tầng | Không tách được ngân sách quota giữa "build/test tay" và "eval chính thức" |

**Không có trường hợp nào trong 20 ca thất bại vì bản thân prompt hoặc logic grounding sai** — log xác nhận request còn chưa tới được bước gọi model thành công.

## 5. Khuyến nghị

1. **Chạy lại toàn bộ golden set khi quota reset** (quota theo ngày của Google thường reset theo múi giờ Pacific Time ~14–15h giờ Việt Nam hôm sau), bằng đúng một lệnh: `npx tsx eval/run_golden_set.ts`. Script tự động: đăng nhập, gọi 20 ca, ghi log, in bảng PASS/FAIL/OBSERVE ra console.
2. **Trước khi chạy eval chính thức**, ngừng gọi thủ công qua curl/UI để dành đủ quota — nên chạy eval **đầu phiên làm việc**, không phải cuối.
3. **Cân nhắc nâng cấp gói trả phí** cho API key trước buổi demo CP6, để tránh rủi ro quota cạn giữa lúc trình bày trực tiếp.
4. Ưu tiên chạy lại nhóm **② Low-confidence (C06–C10)** trước tiên — đây là nhóm rủi ro cao nhất và chưa có bằng chứng thật nào ở mục 3.
5. Cơ chế logging (`server/logging.ts`) đã sẵn sàng và không cần sửa gì thêm — mọi lượt chạy lại trong tương lai sẽ tự động có đầy đủ prompt/response thô trong `logs/gemini-calls.jsonl` và `eval/run_log.jsonl` để đối chiếu.
