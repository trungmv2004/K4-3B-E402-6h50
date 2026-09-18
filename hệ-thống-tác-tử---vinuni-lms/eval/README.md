# eval/ — Golden set & kết quả kiểm thử

| File | Nội dung |
|---|---|
| `golden_set.json` | 20 ca kiểm thử, phân loại theo taxonomy 4 lớp chỗ khó (`spec.md` §5–§6): ① không có căn cứ · ② low-confidence · ③ ngoài phạm vi · ④ đặc thù domain. Mỗi ca có `endpoint`, `input` (đúng request body gửi tới server), và `expected` (tiêu chí tự động đối chiếu kết quả). |
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

## Cơ chế logging phục vụ xác minh kỹ thuật

Mọi lời gọi Gemini (không chỉ riêng lượt eval) đều được `server/gemini.ts` ghi lại qua `server/logging.ts` vào `logs/gemini-calls.jsonl` (không commit — chứa log vận hành đầy đủ), gồm: context (hàm nào gọi), model, số lần thử, độ trễ, **nguyên văn prompt gửi đi**, và **raw response hoặc lỗi trả về**. Mỗi request từ `run_golden_set.ts` được gắn thêm `caseId` để dễ đối chiếu chéo giữa `eval/run_log.jsonl` (góc nhìn HTTP) và `logs/gemini-calls.jsonl` (góc nhìn lời gọi model).
