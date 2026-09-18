# eval/ — Golden set & kết quả kiểm thử

| File | Nội dung |
|---|---|
<<<<<<< HEAD
| `golden_set.json` | 20 ca kiểm thử, phân loại theo taxonomy 4 lớp chỗ khó (`spec.md` §5–§6): ① không có căn cứ · ② low-confidence · ③ ngoài phạm vi · ④ đặc thù domain. Mỗi ca có `endpoint`, `input` (đúng request body gửi tới server), `expected` (tiêu chí tự động đối chiếu kết quả), **`grid`** (toạ độ 5 chiều trong User Input Grid), `frequency` (thường-gặp/hiếm), và `source` (truy xuất về chatlog thật hoặc pattern thật). |
=======
| `golden_set.json` | 22 ca kiểm thử (20 gốc + 2 bổ sung), phân loại theo taxonomy 4 lớp chỗ khó (`spec.md` §5–§6): ① không có căn cứ · ② low-confidence · ③ ngoài phạm vi · ④ đặc thù domain. Mỗi ca có `endpoint`, `input` (đúng request body gửi tới server), và `expected` (tiêu chí tự động đối chiếu kết quả). 5 ca (C04, C05, C11, C21, C22) có thêm `realWorldReference` trỏ về `turn_id` trong log chat thật `data/vlearn-pack/tutor_turns.csv` — xác nhận mẫu lỗi là có thật trong vận hành, không phải giả định (xem `realWorldEvidenceSource` ở đầu file và `spec.md` §1). |
>>>>>>> 667c4295e7f8caefce12febf49fc6750efea9319
| `run_golden_set.ts` | Script chạy toàn bộ 20 ca qua server đang chạy thật (không mock) — đăng nhập, gọi từng endpoint, đối chiếu `expected`, ghi log raw request/response vào `run_log.jsonl`, in bảng PASS/FAIL/OBSERVE. |
| `run_log.jsonl` | Log thô của lượt chạy gần nhất: request body + raw HTTP response cho từng ca — bằng chứng kỹ thuật để xác minh. |
| `run_results.md` | Báo cáo tổng hợp: bảng thống kê đạt/thất bại, tỷ lệ %, phân tích nguyên nhân sai lệch. |

## Chạy kiểm thử

1. Khởi động server (đã cấu hình `GEMINI_API_KEY` trong `.env`):
   ```
   npm run dev
   ```
2. Ở terminal khác, chạy toàn bộ golden set:
   ```
   npx tsx eval/run_golden_set.ts
   ```
3. Xem kết quả in ra console, log chi tiết ở `eval/run_log.jsonl`, và cập nhật `eval/run_results.md` theo lượt chạy mới.

Có thể trỏ script vào một server khác bằng biến môi trường `EVAL_BASE_URL` (mặc định `http://localhost:3000`).

## User Input Grid — 5 chiều biến đổi

Mỗi case được gán tọa độ theo **5 chiều**. Thay đổi giá trị bất kỳ chiều nào thì câu trả lời đúng của AI **phải thay đổi theo** — đây là nguyên tắc để kiểm chứng case thật sự có ý nghĩa kiểm thử.

| Chiều | Ký hiệu | Các giá trị |
|---|---|---|
| Endpoint | D1 | `quiz/generate` · `quiz/grade` · `tutor/chat` |
| Độ dài transcript | D2 | `sieu-ngan (<50t)` · `ngan (50–300t)` · `vua (300–500t)` · `dai (>500t)` |
| Loại câu hỏi | D3 | `dung-khai-niem` · `dung-mot-phan/dien-giai` · `sai-kinh-dien` · `ngoai-pham-vi` · `tong-hop-da-doan` |
| Đáp án học viên | D4 | `dung` · `sai-gan` · `sai-xa` · `khong-ap-dung` |
| Tần suất | D5 | `thuong-gap` · `hiem` |

## Coverage Matrix (D1 × D3)

> Chiều quan trọng nhất. Ô có danh sách = đã phủ. **Ô trống = gap cần bổ sung** khi mở rộng lên 30+ case với promptfoo.

| | `dung-khai-niem` | `dung-mot-phan/dien-giai` | `sai-kinh-dien` | `ngoai-pham-vi` | `tong-hop-da-doan` |
|---|---|---|---|---|---|
| **quiz/generate** | C19 | ⬜ **GAP** | ⬜ | ⬜ | C09 |
| **quiz/grade** | C10 · C16 · C20 | C07 · C08 | C04 · C05 · C18 | ⬜ **GAP** | C06 |
| **tutor/chat** | C17 | ⬜ **GAP** | ⬜ **GAP** | C11 · C12 · C13 · C14 · C15 | ⬜ **GAP** |

**Tỷ lệ phủ:** 9/15 ô (60%) — 6 ô trống là ưu tiên để mở rộng.

## Gap Analysis — Lỗ hổng coverage cần bổ sung

| Priority | D1 | D3 | Lý do |
|---|---|---|---|
| 🔴 High | `quiz/generate` | `dung-mot-phan/dien-giai` | Chưa kiểm tra AI có generate câu hỏi dù transcript mơ hồ không |
| 🔴 High | `quiz/grade` | `ngoai-pham-vi` | Học viên hỏi grading về khái niệm ngoài transcript — chưa có case |
| 🔴 High | `tutor/chat` | `dung-mot-phan/dien-giai` | Học viên hiểu đúng một phần, diễn đạt không rõ — chưa có case |
| 🟡 Medium | `quiz/generate` | `sai-kinh-dien` | Transcript chứa bẫy khái niệm — chưa kiểm tra |
| 🟡 Medium | `tutor/chat` | `sai-kinh-dien` | Học viên hỏi để xác nhận misconception — chưa có case |
| 🟡 Medium | `tutor/chat` | `tong-hop-da-doan` | Câu hỏi cần ghép ≥2 đoạn transcript để trả lời — chưa có case |

## Phân bố 20 case theo taxonomy

| Lớp | # Case | Tần suất (thường/hiếm) | Case IDs |
|---|---|---|---|
| ① Không có căn cứ | 5 | 4 thường / 1 hiếm | C01–C05 |
| ② Low-confidence | 5 | 3 thường / 2 hiếm | C06–C10 |
| ③ Ngoài phạm vi | 5 | 3 thường / 2 hiếm | C11–C15 |
| ④ Đặc thù domain | 5 | 3 thường / 2 hiếm | C16–C20 |
| **Tổng** | **20** | **13 thường / 7 hiếm** | — |

> **≥10 case từ chatlog thật:** C04, C05, C06, C07, C08, C09, C10, C11, C16, C17, C18, C19, C20 — tổng **13 case** có `source: "developed from chatlog"`, truy xuất về `gemini-calls.jsonl` (transcribe/evaluateEvidence/generateQuestions thật) và `data/videos.json`.

## Cơ chế logging phục vụ xác minh kỹ thuật

Mọi lời gọi Gemini (không chỉ riêng lượt eval) đều được `server/gemini.ts` ghi lại qua `server/logging.ts` vào `logs/gemini-calls.jsonl` (không commit — chứa log vận hành đầy đủ), gồm: context (hàm nào gọi), model, số lần thử, độ trễ, **nguyên văn prompt gửi đi**, và **raw response hoặc lỗi trả về**. Mỗi request từ `run_golden_set.ts` được gắn thêm `caseId` để dễ đối chiếu chéo giữa `eval/run_log.jsonl` (góc nhìn HTTP) và `logs/gemini-calls.jsonl` (góc nhìn lời gọi model).

