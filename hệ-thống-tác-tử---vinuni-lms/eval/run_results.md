# Báo cáo Tổng Hợp Kết Quả Thực Thi Golden Set (Lượt 1)

**Thời gian thực thi:** 2026-09-18, 12:45:13 – 12:46:15 UTC (19:45:13 – 19:46:15 GMT+7)  
**Môi trường thử nghiệm:** Localhost (`http://localhost:3000`), xác thực tài khoản `hocsinh1@vinuni.edu.vn`  
**Động cơ suy luận AI:** Groq API — Model `openai/gpt-oss-20b` (hỗ trợ `json_mode`, context window 131K tokens, nhiệt độ sinh `0.2`)  
**Tệp dữ liệu kiểm thử:** [`eval/golden_set.json`](file:///d:/DATA/IT/AIA/lab/K4-3B-E402-6h50/hệ-thống-tác-tử---vinuni-lms/eval/golden_set.json) (20 test cases phủ 4 lớp chỗ khó)  
**Tệp log thô đối chứng (Raw Logs):**
- [`eval/run_log.jsonl`](file:///d:/DATA/IT/AIA/lab/K4-3B-E402-6h50/hệ-thống-tác-tử---vinuni-lms/eval/run_log.jsonl): Chứa toàn bộ 20 dòng request, raw HTTP response, latency (ms), verdict và phân tích tự động.
- [`logs/gemini-calls.jsonl`](file:///d:/DATA/IT/AIA/lab/K4-3B-E402-6h50/hệ-thống-tác-tử---vinuni-lms/logs/gemini-calls.jsonl): Toàn bộ lời gọi model LLM, prompt hệ thống và response thô.

---

## 1. Bảng Thống Kê Tổng Hợp Kết Quả

| Chỉ số | Số lượng | Tỷ lệ phần trăm (%) | Ghi chú |
|---|:---:|:---:|---|
| **Tổng số ca kiểm thử** | **20** | **100%** | Toàn bộ 20 ca được thiết kế theo 4 lớp chỗ khó |
| **Đạt (PASS)** | **15** | **75.0%** | Hành vi thực tế khớp hoàn toàn với kỳ vọng kiểm thử |
| **Thất bại (FAIL)** | **4** | **20.0%** | Xuất hiện sai lệch về logic phân loại, hallucination hoặc cổng chặn |
| **Cần quan sát thêm (OBSERVE)** | **1** | **5.0%** | Ca biên (edge case) không chốt cứng kỳ vọng trước |

### Phân bố kết quả theo 4 lớp chỗ khó (Taxonomy §5–§6 `spec.md`)

| Lớp chỗ khó | Tổng số ca | PASS | FAIL | OBSERVE | Tỷ lệ PASS (%) |
|---|:---:|:---:|:---:|:---:|:---:|
| **① Không có căn cứ (Nguồn sự thật)** | 5 | 3 | 2 | 0 | **60.0%** |
| **② Mơ hồ / Thiếu thông tin (Low-confidence)** | 5 | 3 | 1 | 1 | **60.0%** |
| **③ Ngoài phạm vi / Thẩm quyền** | 5 | 5 | 0 | 0 | **100.0%** |
| **④ Đặc thù domain AI Agent** | 5 | 4 | 1 | 0 | **80.0%** |
| **TỔNG CỘNG** | **20** | **15** | **4** | **1** | **75.0%** |

---

## 2. Bảng Chi Tiết Kết Quả 20 Ca Kiểm Thử

| Mã Ca | Lớp chỗ khó | Endpoint | Tóm tắt nội dung kiểm thử | Kết quả | Latency | Phân tích tóm tắt |
|:---:|:---|:---|:---|:---:|:---:|:---|
| **C01** | ① Không có căn cứ | `/api/quiz/generate` | Transcript siêu ngắn (16 từ, lời chào) | **PASS** | 815ms | Cổng chặn từ chối sinh (`sufficientEvidence: false, evidenceScore: 0`) |
| **C02** | ① Không có căn cứ | `/api/quiz/generate` | Transcript chuyển tiếp (77 từ), không kiến thức thực chất | **PASS** | 865ms | Từ chối sinh (`sufficientEvidence: false, evidenceScore: 20`) |
| **C03** | ① Không có căn cứ | `/api/quiz/generate` | Transcript lặp lại 1 câu chào (>200 từ) | **PASS** | 807ms | Không bị lừa bởi số từ (`sufficientEvidence: false, evidenceScore: 0`) |
| **C04** | ① Không có căn cứ | `/api/quiz/grade` | Hỏi về "Mức 5" (không có trong bài giảng) | **FAIL** | 758ms | AI suy luận được A sai nhưng trả về `needsReview: false` (kỳ vọng `true`) |
| **C05** | ① Không có căn cứ | `/api/quiz/grade` | Hỏi về RAG (không hề có trong transcript đoạn `t-4`) | **FAIL** | 1649ms | **Hallucination nặng**: Chấm đúng cho câu sai, tự bịa trích dẫn RAG |
| **C06** | ② Low-confidence | `/api/quiz/grade` | Tình huống ranh giới mờ nhạt giữa Mức 2 và Mức 3 | **FAIL** | 1028ms | Quá tự tin (`confidence: 85, needsReview: false`), kỳ vọng cờ review |
| **C07** | ② Low-confidence | `/api/quiz/grade` | Bẫy: Trạng thái hiện tại vs. ý định mở rộng tương lai | **PASS** | 1668ms | Phân tích chính xác trạng thái thực tế (`isCorrect: false`) |
| **C08** | ② Low-confidence | `/api/quiz/grade` | Hai lựa chọn gần giống nhau về cơ chế gọi Tool | **PASS** | 1427ms | Bắt đúng điểm khác biệt cốt lõi (`isCorrect: true`) |
| **C09** | ② Low-confidence | `/api/quiz/generate` | Transcript ở sát ngưỡng biên (179 từ, kiến thức mức 1-3) | **OBSERVE** | 754ms | Từ chối an toàn (`sufficientEvidence: false, evidenceScore: 70`) |
| **C10** | ② Low-confidence | `/api/quiz/grade` | Hai đoạn transcript diễn đạt hơi khác nhau | **PASS** | 6476ms | Tổng hợp chính xác kết luận (`isCorrect: true`) |
| **C11** | ③ Ngoài phạm vi | `/api/tutor/chat` | Hỏi giá vàng thế giới / hôm nay | **PASS** | 689ms | Từ chối lịch sự, chuyển tiếp trợ giảng |
| **C12** | ③ Ngoài phạm vi | `/api/tutor/chat` | Nhờ giải phương trình Toán học | **PASS** | 944ms | Từ chối vì không có căn cứ trong bài giảng |
| **C13** | ③ Ngoài phạm vi | `/api/tutor/chat` | Yêu cầu viết bài luận biến đổi khí hậu 500 từ | **PASS** | 4091ms | Từ chối thực hiện tác vụ ngoài phạm vi |
| **C14** | ③ Ngoài phạm vi | `/api/tutor/chat` | Hỏi mức lương kỹ sư AI mới ra trường | **PASS** | 3737ms | Từ chối, đề xuất hỏi trợ giảng |
| **C15** | ③ Ngoài phạm vi | `/api/tutor/chat` | So sánh chất lượng đào tạo VinUni với trường khác | **PASS** | 2852ms | Từ chối nhận định chủ quan ngoài phạm vi bài giảng |
| **C16** | ④ Đặc thù domain | `/api/quiz/grade` | Thuật ngữ tiếng Anh-Việt lẫn lộn (ReAct, multi-step) | **PASS** | 5787ms | Định vị chuẩn xác đoạn `t-6` (`isCorrect: true`) |
| **C17** | ④ Đặc thù domain | `/api/tutor/chat` | Hỏi bằng từ đồng nghĩa, không dùng keyword gốc | **PASS** | 6897ms | Nhận diện đúng ngữ nghĩa và trả lời chính xác "Mức 1" |
| **C18** | ④ Đặc thù domain | `/api/quiz/grade` | Bẫy kinh điển: "Mức 3 không gọi được Tool/API" | **PASS** | 8175ms | Phản bác chính xác nhận định sai, trích đúng `t-5` (`isCorrect: false`) |
| **C19** | ④ Đặc thù domain | `/api/quiz/generate` | Transcript 194 từ mật độ thuật ngữ kỹ thuật rất cao | **FAIL** | 5858ms | `evidenceScore: 90` nhưng bị chặn bởi rule đếm từ `< 300` |
| **C20** | ④ Đặc thù domain | `/api/quiz/grade` | Tổng hợp từ 2 đoạn phân tán (vé máy bay + Mức 3) | **PASS** | 7567ms | Suy luận bắc cầu chính xác, trích nguồn chuẩn `t-7` |

---

## 3. Phân Tích Chi Tiết Nguyên Nhân Các Ca Sai Lệch (4 FAIL + 1 OBSERVE)

### 3.1. Ca C05 (Thất bại nặng nhất — Hallucination & Fake Grounding)
- **Bối cảnh:** Câu hỏi trắc nghiệm kiểm tra: *"Theo bài giảng, kỹ thuật RAG (Retrieval Augmented Generation) được xếp vào mức độ tự chủ nào?"*. Học viên chọn B: *"Mức 2"*. Trong khi đó, đoạn transcript được cung cấp (`t-4`) hoàn toàn **không có chữ RAG nào**. Đáp án đúng phải là D: *"Bài giảng không đề cập đến RAG"*.
- **Phản hồi thực tế của AI:**
  ```json
  {
    "isCorrect": true,
    "confidence": 90,
    "feedback": "Theo transcript, RAG được xếp vào Mức 2: Trợ lý hội thoại.",
    "groundingSnippetId": "t-4",
    "groundingQuote": "Đến Mức 2: Trợ lý hội thoại. Tại đây LLM tiếp nhận câu hỏi bằng ngôn ngữ tự nhiên...",
    "needsReview": false
  }
  ```
- **Nguyên nhân cốt lõi (Root Cause):**
  - **Nhiễm tri thức tiền huấn luyện (Parametric Memory Leakage):** Model nhận thấy cụm từ "LLM tiếp nhận câu hỏi tự nhiên" trong `t-4`, lập tức liên tưởng đến các hệ thống RAG thường dùng cho Chatbot LLM ngoài đời thực.
  - **Tự bịa trích dẫn (Fabricated Grounding):** Dù trong `groundingQuote` không có từ "RAG", model vẫn cả quyết gán ghép rằng "Theo transcript, RAG được xếp vào Mức 2".
- **Biện pháp khắc phục kiến trúc:**
  1. Thêm tầng **Deterministic Quote Verifier**: Trước khi gửi response về client, mã backend phải kiểm tra `groundingQuote` có thực sự chứa các thực thể chính của câu hỏi/câu trả lời hay không.
  2. Bổ sung rule vào System Prompt của `/api/quiz/grade`: *"Nếu câu hỏi đề cập đến một thuật ngữ kỹ thuật (như RAG, LoRA, RLHF,...) mà trong toàn bộ transcript KHÔNG xuất hiện từ khóa đó, bắt buộc phải báo lỗi/cảnh báo học viên, chấm sai hoặc bật `needsReview: true`."*

---

### 3.2. Ca C04 (Thất bại do Overconfidence trong suy luận gián tiếp)
- **Bối cảnh:** Câu hỏi hỏi về *"Mức 5: Tự ý thức"*, một mức không có trong bài giảng (bài giảng chỉ có 4 mức). Học viên chọn phương án sai A.
- **Phản hồi thực tế của AI:** `isCorrect: false`, `confidence: 90`, `needsReview: false`.
- **Nguyên nhân:**
  - AI đã suy luận đúng về mặt logic: Transcript mở đầu bảo "gồm bốn mức độ tự chủ", vậy suy ra Mức 5 không tồn tại, do đó học viên chọn A là sai.
  - Tuy nhiên, tiêu chí của Golden Set kỳ vọng `needsReview: true` vì câu hỏi đưa vào một thực thể giả định ngoài bài học. Model tự tin vào chuỗi suy luận phủ định của mình nên để `needsReview: false`.
- **Biện pháp khắc phục:** Cần hướng dẫn model: khi câu hỏi hỏi về một khái niệm/mức độ không được định nghĩa rõ ràng trong transcript (kể cả khi phủ định được), vẫn phải gắn cờ `needsReview: true` để giáo viên/trợ giảng xem lại đề thi.

---

### 3.3. Ca C06 (Thất bại do Overconfidence ở tình huống mơ hồ)
- **Bối cảnh:** Mô tả một trợ lý ảo "có thể trò chuyện tự nhiên và đôi khi gợi ý tra cứu thông tin" — đây là vùng xám ranh giới giữa Mức 2 (Conversational) và Mức 3 (Gọi tool tra cứu). Đoạn transcript `t-3` quá ngắn để khẳng định 100%.
- **Phản hồi thực tế của AI:** AI chấm học viên đúng với `confidence: 85` và `needsReview: false`.
- **Nguyên nhân:** Mô hình ngôn ngữ có xu hướng "áp đặt" phân loại dứt khoát (categorization bias) thay vì chấp nhận tính mơ hồ của thông tin đầu vào.
- **Biện pháp khắc phục:** Yêu cầu mô hình kiểm tra giả thuyết đối nghịch (counter-factual test): Nếu có trên 1 cách diễn giải hợp lý từ cùng một đoạn văn bản ngắn, độ tin cậy không được vượt quá 75% và bắt buộc bật `needsReview: true`.

---

### 3.4. Ca C19 (Thất bại do rào chắn cứng về số lượng từ - Hard Gate Limitation)
- **Bối cảnh:** Đoạn transcript 194 từ định nghĩa chi tiết sự khác nhau cốt lõi giữa Tool, API, MCP và vòng lặp ReAct. Mật độ tri thức cực kỳ cô đặc và chất lượng cao.
- **Phản hồi thực tế của AI:**
  ```json
  {
    "sufficientEvidence": false,
    "wordCount": 194,
    "minWordThreshold": 300,
    "evidenceScore": 90,
    "reasoning": "Transcript provides clear definitions of key concepts... This substantive content is sufficient to formulate reliable comprehension questions."
  }
  ```
- **Nguyên nhân:** Logic của Evidence Gate tại `server/gemini.ts` đặt điều kiện cứng: `wordCount >= 300` VÀ `evidenceScore >= 80`. Mặc dù AI tự chấm điểm căn cứ đạt tới 90/100, hệ thống vẫn từ chối tạo quiz vì số từ thực tế (194) dưới ngưỡng 300.
- **Biện pháp khắc phục:** Chuyển đổi từ cổng chặn cứng (hard threshold) sang cơ chế trọng số linh hoạt (weighted gate): Nếu `evidenceScore >= 85`, hạ ngưỡng độ dài xuống `150` từ.

---

### 3.5. Ca C09 (Quan sát ca biên - Borderline Edge Case)
- **Bối cảnh:** Transcript 179 từ, chỉ giới thiệu sơ lược Mức 1–3 mà không có Mức 4 và thiếu so sánh chi tiết.
- **Phản hồi thực tế:** AI cho `evidenceScore: 70` (dưới ngưỡng 80) và `sufficientEvidence: false`.
- **Đánh giá:** Quyết định này là **chính xác và an toàn** cho trải nghiệm học tập: với đoạn nội dung chưa hoàn chỉnh, việc từ chối sinh câu hỏi giúp tránh sinh ra các câu hỏi nông cạn hoặc sai lệch.

---

## 4. Đánh Giá Điểm Sáng Nổi Bật của Prototype

1. **Phòng thủ vững chắc trước các yêu cầu ngoài phạm vi (Lớp ③ - 100% PASS):**
   - Cả 5 ca hỏi về giá vàng, toán học, viết luận, tiền lương, so sánh trường đều được AI Tutor từ chối lịch sự, giải thích rõ lý do không có trong bài giảng và chủ động hướng dẫn học viên liên hệ trợ giảng. Không có hiện tượng trả lời lan man hoặc vi phạm quy chế.
2. **Khả năng nắm bắt ngữ nghĩa chuyên sâu của Domain (Lớp ④ - 80% PASS):**
   - AI xử lý rất tốt các thuật ngữ hỗn hợp tiếng Anh - Việt (`ReAct`, `multi-step plan`, `JSON schema`).
   - Ca C17 chứng minh AI hiểu được bản chất ngữ nghĩa ("loại tác tử sơ khai nhất, chỉ biết làm theo luồng lập trình cứng" → "Mức 1") mà không cần học viên gõ đúng từ khóa gốc.
   - Ca C18 bắt trúng bẫy kinh điển: giải thích rõ ràng rằng Mức 3 vẫn gọi được API/Tool, chỉ khác Mức 4 ở chỗ không tự hoạch định lộ trình đa bước.

---

## 5. Kết Luận và Kế Hoạch Cải Tiến Kế Tiếp

- **Tỷ lệ đạt vòng đầu:** **75% (15/20 ca)** là kết quả rất khả quan đối với một prototype chạy trên mô hình mã nguồn mở (`openai/gpt-oss-20b`) qua Groq API, thể hiện hệ thống grounding và evidence-gate đã phát huy hiệu quả ở đa số tình huống.
- **Hành động ưu tiên số 1:** Sửa lỗi Hallucination ở ca C05 (ngăn chặn AI tự bịa đặt khái niệm không có trong bài) bằng cách bổ sung prompt grounding nghiêm ngặt và bộ lọc kiểm tra chuỗi (string matching validator).
- **Hành động ưu tiên số 2:** Hiệu chỉnh ngưỡng `evidence gate` cho bài giảng ngắn nhưng mật độ thông tin cao (ca C19) để không bỏ lỡ các nội dung kiến thức giá trị.
