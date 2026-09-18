# AI SPEC — Kiểm tra hiểu bài tức thì qua quiz trích dẫn ngược từ Transcript · Nhóm 6h50 · Zone Bàn 8-C4

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

Hướng: [x] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [x] Tính năng mới

## §1. User & Job
* **Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):**

  * Job executor: **Học viên** đang xem video bài giảng trên VLearn, vừa hoàn thành một chương/phần nội dung và muốn kiểm tra nhanh xem mình đã thực sự hiểu đúng kiến thức hay chưa.
  * Workflow hiện tại: xem video → kết thúc một chương/phần → tự đánh giá mức độ hiểu hoặc làm bài tập nếu có → khi không chắc chắn phải tua lại video/dò slide để tìm lại kiến thức cần kiểm chứng.
  * Workflow đề xuất: xem video → hết một chương/phần → hệ thống hiển thị một câu hỏi ngắn gắn với nội dung vừa học → học viên trả lời nhanh và chọn/dẫn xuất đoạn transcript làm căn cứ → hệ thống đối soát với nguồn transcript → trả kết quả tức thì và cho mở đúng timestamp/đoạn cần ôn lại nếu chưa đủ căn cứ hoặc trả lời chưa đúng.
  * Giảng viên là bên hưởng lợi gián tiếp: có thêm tín hiệu về mức độ hoàn thành và hiểu bài của học viên, nhưng **không phải job executor của lát cắt CP1**.

* **Core JTBD (không tên sản phẩm/AI trong câu):**

  * **Khi vừa học xong một đoạn bài giảng phức tạp, tôi muốn tự kiểm tra xem mình đã hiểu đúng bản chất chưa, để biết ngay phần nào cần xem lại thay vì phải tự dò lại toàn bộ nội dung.**

* **Problem statement (KHÔNG chữ AI):**

  * Sau khi xem xong một đoạn bài giảng phức tạp, nhiều học viên không chắc mình đã hiểu đúng bản chất. Khi muốn tự kiểm tra, các bài tập trắc nghiệm có thể bị cảm nhận là quá dễ hoặc thiên về nhớ từ khóa, còn việc kiểm chứng lại kiến thức thường yêu cầu tua video hoặc dò slide để tìm đoạn làm bằng chứng, gây mất thời gian và làm chậm quá trình học.

* **Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):**

  * **Khảo sát 21 học viên**, mỗi câu có **19–20** câu trả lời hợp lệ tùy câu hỏi:

    * **15/20 (75%)** trả lời rằng sau khi xem xong một đoạn bài giảng phức tạp, họ thường thấy mơ hồ và không chắc mình đã thực sự hiểu đúng bản chất.
    * **14/20 (70%)** cho biết các bài tập trắc nghiệm có sẵn có thể quá dễ hoặc mang tính “học vẹt”, chỉ cần nhớ từ khóa.
    * **16/20 (80%)** cho biết trong một tuần học họ có thể tốn trên 30 phút để tua lại video/slide nhằm tìm đoạn kiến thức làm bằng chứng cho câu trả lời.
    * **18/19 (94,7%)** muốn hệ thống tự động nhảy tới đúng mốc thời gian video chứa đáp án chuẩn khi lựa chọn trích dẫn sai.
    * **19/20 (95%)** muốn có thêm 2–3 mốc thời gian liên quan để lựa chọn lại khi câu trả lời chưa đủ rõ ràng.
    * **13/19 (68,4%)** sẵn sàng dành 10–15 phút để trải nghiệm prototype trong 1–2 ngày tới.
    * **19/20 (95%)** cho biết nếu tính năng được triển khai, họ muốn sử dụng thường xuyên trong các bài học trên VLearn.
  * **Nguồn:** nhật ký khảo sát “Khảo sát hiểu qua video VLearn”, n = 21; bảng kết quả khảo sát được lưu trong repo nhóm. Dữ liệu survey hiện là kết quả tổng hợp, chưa có trường trả lời mở; vì vậy các cụm dưới đây không được coi là quote nguyên văn của respondent:

    * “thực sự hiểu đúng bản chất”
    * “quá dễ hoặc mang tính ‘học vẹt’”
    * “tua lại video/slide để tìm đoạn kiến thức làm bằng chứng”
    * “tự động nhảy đúng mốc thời gian video”
    * “gợi ý thêm 2-3 mốc thời gian liên quan”
  * **Lưu ý về quote:** năm cụm trên được lấy nguyên văn từ nội dung bảng câu hỏi/diễn đạt khảo sát để minh họa chủ đề, **không phải lời trả lời mở của người tham gia**. Khi có dữ liệu câu trả lời nguyên văn, thay các dòng này bằng tối thiểu 5 quote respondent + mã người trả lời/mã survey để đáp ứng chặt chuẩn quote của rubric.

  * **Bằng chứng bổ sung — log chat thật VLearn Tutor** (`data/vlearn-pack/tutor_turns.csv`, n = 13.494 lượt hỏi-đáp thật đã ẩn danh, mỗi lượt có mã `turn_id`):

    * **3.781/13.494 (28%)** câu trả lời của AI Tutor hiện tại **không có trích dẫn nguồn** (`has_citation=False`) — xác nhận đúng khoảng trống mà lát cắt này giải quyết: đối chiếu câu trả lời với đúng nguồn transcript/slide.
    * Trong **177 lượt được học viên đánh giá**, có **85 lượt "down"** (không hài lòng) — phần lớn rơi vào đúng mẫu: học viên hỏi về một mốc/slide cụ thể mà AI không định vị được, phải trả lời chung chung.
    * **Quote thật + mã lượt hỏi-đáp** (nguyên văn, rút gọn theo giới hạn bảo mật dữ liệu — không dán nguyên văn cả trả lời dài):

      | Mã (`turn_id`) | Quote học viên | Trích tình trạng trả lời của AI | Tín hiệu |
      |---|---|---|---|
      | T00079 | "tóm tắt slide này" | "...chưa tìm thấy nội dung cụ thể của **Trang 33**..." | `has_citation=False`, `rating=down` — đúng pain "không định vị được đúng nguồn" |
      | T00111 | "slide 9 là gì" | "...chưa tìm thấy nội dung cụ thể được đánh dấu là 'slide 9'..." | `has_citation=False`, `rating=down` |
      | T00213 | "Giải thích slide 4 cho tôi" | có trích dẫn [trang 70] nhưng vẫn bị đánh giá không hài lòng | `has_citation=True`, `rating=down` — cho thấy **có trích dẫn không đồng nghĩa với đủ căn cứ thuyết phục học viên**, phải grounding đúng chỗ chứ không chỉ có citation hình thức |
      | T04239 | "mình nên ăn gì" | "Câu hỏi này nằm ngoài phạm vi hỗ trợ của mình." | Ca thật xác nhận mẫu hành vi **từ chối lịch sự khi ngoài phạm vi** (③) là khả thi và đã có tiền lệ vận hành thật |
      | T00309 | "why can you not answer my question ?" | "...không thể hiển thị câu trả lời vừa rồi vì nó vi phạm quy tắc an toàn nội dung..." | Ca đặc thù domain (④): bộ lọc an toàn có thể chặn nhầm câu trả lời hợp lệ — rủi ro cần tính đến khi thiết kế AI Tutor |
      | T00092 | "đây là gì" (trỏ vào từ "Attention") | AI giải thích đúng thuật ngữ kèm trích dẫn | Mẫu câu hỏi cộc lốc chỉ trỏ vào 1 thuật ngữ chuyên ngành — dùng làm cơ sở thiết kế ca ④ trong golden set |

    * **Nguồn:** `data/vlearn-pack/tutor_turns.csv` do ban tổ chức cấp, đã ẩn danh học viên (`student` là mã, không phải tên thật). Chỉ trích dẫn ngắn theo đúng quy định bảo mật dữ liệu của khoá — không commit file gốc vào repo nộp bài.

## §2. Impact & quyết định chọn
* **Bảng impact ≥3 ứng viên (bao nhiêu người · tần suất · tốn gì mỗi lần · khả thi):**

| Ứng viên | Bằng chứng về số người | Tần suất / mức độ | Tốn gì mỗi lần | Khả thi trong hackathon |
|---|---:|---|---|---|
| **A. Quiz kiểm tra hiểu bài ngay sau mỗi chương** | 15/20 (75%) thường không chắc đã hiểu đúng sau đoạn bài giảng phức tạp | Có thể xảy ra sau mỗi chương/phần học; pain lặp lại theo từng buổi học | Tốn thời gian tự kiểm tra, hoặc tiếp tục học khi chưa biết mình hiểu đúng hay chưa | **Cao** — có thể sinh 1 câu hỏi + chấm theo transcript |
| **B. Trích dẫn ngược + nhảy đúng timestamp để kiểm chứng** | 16/20 (80%) cho biết tốn >30 phút/tuần để tua video/slide tìm bằng chứng; 18/19 (94,7%) muốn tự nhảy tới timestamp đúng | Lặp lại mỗi khi học viên cần xác minh câu trả lời/kiến thức | Mất thời gian tua video, dò slide và tìm lại đoạn nguồn | **Cao** — transcript đã có timestamp/mã đoạn, phù hợp làm core evidence |
| **C. Gợi ý timestamp khi câu trả lời chưa rõ** | 19/20 (95%) muốn có 2–3 mốc liên quan để chọn lại | Chủ yếu ở case mơ hồ/khó; không phải mọi lượt học | Giảm thời gian tìm lại nguồn và giảm việc phải đoán | **Trung bình–cao** — có thể triển khai như nhánh low-confidence/failure |
| **D. Tính điểm chuyên cần dựa trên xem video + trả lời quiz** | Chưa có số liệu khảo sát trực tiếp về nhu cầu tính điểm | Có thể áp dụng theo mỗi chương/buổi | Có thể giúp theo dõi mức hoàn thành nhưng làm tăng độ phức tạp của logic điểm danh | **Trung bình** — cần thêm event tracking, rule điểm và xử lý gian lận; không chọn làm core slice |

* **Ứng viên ĐÃ LOẠI + vì sao:**

  * **Tính điểm chuyên cần tự động** được loại khỏi lát cắt chính vì đây là một bài toán quản lý tiến độ/điểm danh riêng, không phải quyết định AI trung tâm của tính năng kiểm tra hiểu bài. Trong phạm vi 39 giờ, nhóm ưu tiên chứng minh một vòng lặp học tập hoàn chỉnh: **xem → kiểm tra → đối soát nguồn → biết phần cần ôn lại**.
  * **Chỉ hiển thị timestamp/nguồn mà không có quiz kiểm tra hiểu bài** không giải quyết đầy đủ pain “không chắc mình đã hiểu đúng bản chất”; nó chủ yếu tối ưu bước tìm lại nguồn.
  * **Quiz tổng hợp toàn bộ buổi học thay vì theo từng chương** bị loại khỏi lát cắt CP1 vì feedback khảo sát tập trung vào việc kiểm tra ngay sau một đoạn nội dung; xử lý theo chương giúp giảm context, giảm độ phức tạp và dễ đo lường hơn.

* **Ứng viên CHỌN + vì sao (bằng số):**

  * **Chọn: Quiz kiểm tra hiểu bài tức thì sau mỗi chương, kết hợp trích dẫn ngược về transcript/timestamp.**
  * Lý do bằng số:

    * **75% (15/20)** cho biết thường không chắc mình đã hiểu đúng sau một đoạn bài giảng phức tạp → nhu cầu kiểm tra hiểu bài là rõ nhất ở bước ngay sau khi học.
    * **70% (14/20)** cảm nhận bài tập hiện có có thể quá dễ/học vẹt → có khoảng trống cho câu hỏi yêu cầu hiểu bản chất thay vì chỉ nhớ từ khóa.
    * **80% (16/20)** mất trên 30 phút/tuần để tìm lại bằng chứng trong video/slide → cần gắn kết quả với nguồn để giảm chi phí kiểm chứng.
    * **94,7% (18/19)** muốn hệ thống nhảy tới đúng timestamp khi chọn sai nguồn và **95% (19/20)** muốn được gợi ý 2–3 timestamp khi câu trả lời chưa rõ → hỗ trợ mạnh cho thiết kế “answer + evidence + recovery”.
    * **68,4% (13/19)** sẵn sàng thử prototype và **95% (19/20)** cho biết muốn sử dụng thường xuyên nếu tính năng được triển khai → có tín hiệu đủ để tiếp tục validation với willing users.
  * **Quyết định scope:** core prototype chỉ tập trung vào **1 học viên · 1 chương video · 1 câu hỏi kiểm tra hiểu bài · 1 quyết định đối soát với transcript · 1 kết quả có căn cứ/timestamp**. Điểm chuyên cần chỉ xem là hướng mở rộng sau prototype.

## §3. Giải pháp tương tự đã nghiên cứu

- **Khan Academy Khanmigo (AI tutor tích hợp trong bài giảng):**
  - **Flow:** Học viên trò chuyện với AI tutor ngay trong lúc học; AI dùng phương pháp Socratic — gợi mở câu hỏi thay vì đưa đáp án trực tiếp.
  - **Đáng học:** Cách hướng dẫn học viên tự suy luận thay vì đưa đáp án ngay, giảm rủi ro "học vẹt" — đúng pain 70% khảo sát nhóm ghi nhận.
  - **Đáng né:** Không có cơ chế bắt buộc trích dẫn ngược về đúng khung hình/mốc thời gian của video nguồn khi trả lời — học viên vẫn phải tự tin vào lời AI mà không tự kiểm chứng lại được.
  - **Mình khác gì:** Lát cắt của nhóm bắt buộc mọi kết luận đúng/sai phải kèm `groundingQuote` + timestamp trỏ đúng về transcript — học viên luôn tự xem lại được nguồn, không phải "tin chay" vào AI.

- **Google NotebookLM (hỏi-đáp có trích dẫn trên tài liệu/audio do người dùng tải lên):**
  - **Flow:** Người dùng tải tài liệu/audio, đặt câu hỏi tự do, AI trả lời kèm trích dẫn ngược về đúng đoạn nguồn trong tài liệu.
  - **Đáng học:** Cơ chế trích dẫn ngược (grounded citation) đáng tin cậy, đúng hướng mà nhóm áp dụng cho toàn bộ 3 quyết định AI trung tâm.
  - **Đáng né:** Đây là công cụ hỏi-đáp bị động (chờ người dùng hỏi), không chủ động sinh ra bài kiểm tra hiểu bài theo từng chương/mốc học, và không có ngưỡng an toàn khi tài liệu quá ngắn/thiếu nội dung (không có nhánh Graceful Fallback).
  - **Mình khác gì:** Nhóm kết hợp **chủ động sinh quiz tình huống** (không chỉ hỏi-đáp bị động) + **ngưỡng an toàn hai lớp** (evidence-gate khi sinh quiz, confidence-gate khi chấm điểm) — cả hai công cụ trên đều chưa làm đồng thời cả hai việc này trong một luồng duy nhất.

## §4. Thiết kế

- **Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):**

  > Học viên vừa hoàn thành một chương video · muốn tự kiểm tra mức độ hiểu bài · AI đọc transcript của chương, tạo một câu hỏi tình huống và quyết định câu trả lời của học viên có đúng bản chất và có căn cứ từ đúng đoạn transcript hay không · trả về kết quả tức thì kèm timestamp/đoạn transcript cần xem lại.

- **Non-goals (KHÔNG build):**
  1. **Không tính điểm chuyên cần/điểm danh tự động** — loại khỏi lát cắt từ §2, chỉ xem là hướng mở rộng sau prototype.
  2. **Không tổng hợp quiz cho nhiều chương/cả khoá học cùng lúc** — mỗi lượt AI chỉ sinh quiz cho đúng 1 video/1 chương đang xem, giữ đúng phạm vi lát cắt.
  3. **Không tích hợp vào hệ thống LMS thật của VinUni** — đây là prototype độc lập (login riêng, DB file JSON riêng), không ghi điểm vào hệ thống điểm chính thức của trường.
  4. **Không hỗ trợ đa ngôn ngữ ngoài tiếng Việt** — toàn bộ prompt, giao diện và giọng đọc AI chỉ phục vụ tiếng Việt.
  5. **Không có hệ thống quản lý lớp học đầy đủ** — chỉ 2 vai trò đơn giản (giáo viên/học viên), không có báo cáo tiến độ theo lớp, không phân quyền chi tiết theo môn/khoá.

- **Mức prototype nhắm tới: [x] Working** — không phải Sketch/Mock:
  - **Thật:** đăng nhập có session + mật khẩu băm; giáo viên upload video thật; Gemini nghe video thật để trích transcript (File API); cả 3 quyết định AI trung tâm (đánh giá đủ căn cứ, sinh quiz, chấm điểm, AI Tutor) đều gọi Gemini thật, có log `logs/gemini-calls.jsonl`.
  - **Mock có ghi rõ:** 3 tài khoản demo được seed sẵn (không có luồng đăng ký công khai); bài giảng mẫu "Day03" dùng giọng đọc trình duyệt (Web Speech API) thay vì video quay thật, vì mục đích là chứng minh AI đọc đúng transcript chứ không phải chất lượng dựng phim; dữ liệu lưu ở file JSON (`data/*.json`) thay vì database thật — đủ cho quy mô demo, không phải giới hạn kỹ thuật của thiết kế.

- **Automation: [x] Conditional** — lý do theo cost-of-error:
  Hệ thống tự động kết luận (đủ/không đủ căn cứ, đúng/sai) khi đủ tự tin, nhưng **dừng lại và không tự quyết** khi confidence thấp hoặc thiếu bằng chứng — chuyển sang nhánh yêu cầu học viên tự kiểm chứng (`needsReview` + gợi ý timestamp) hoặc nhánh an toàn (Graceful Fallback) thay vì đoán liều. Lý do: nếu AI kết luận sai mà không báo hiệu độ không chắc chắn, học viên có thể **tin rằng mình đã hiểu đúng trong khi chưa**, hoặc **ôn sai nội dung** — cost-of-error ở đây cao hơn nhiều so với chi phí phải tự xem lại nguồn một lần nữa.

- **§4b. Nguyên tắc đã áp dụng (HAX/PAIR):**

  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|
  | **HAX G1 — Make clear what the system can do** | Badge "Sinh bởi AI Tutor" + banner "CĂN CỨ TỪ BÀI GIẢNG VIDEO [timestamp]" trong `ScreenQuizTaking.tsx` — học viên biết ngay câu hỏi do AI sinh, có đối chiếu nguồn, không phải câu hỏi tĩnh có sẵn. |
  | **HAX G2 — Make clear how well the system can do it** | Hiển thị "Trùng khớp {evidenceScore}%" khi làm bài, và badge màu hổ phách "AI CHƯA ĐỦ TỰ TIN — CẦN TỰ KIỂM CHỨNG" ở `ScreenRemediation.tsx` khi `needsReview=true` (confidence < 60) — mức độ tin cậy hiển thị bằng số thật trả về từ Gemini, không phải con số cố định trang trí. |
  | **HAX G13 — Support graceful fallback** | Khi transcript không đủ căn cứ (`sufficientEvidence=false`), học viên được chuyển sang `ScreenSafeFallback.tsx` với lý do cụ thể (evidenceScore, wordCount, reasoning) và **vẫn được mở khoá bài tiếp theo** — không bị kẹt lại vì lỗi hệ thống/nội dung ngoài tầm kiểm soát của học viên. |
  | **PAIR — Explainability & trust** | Mọi phán quyết đúng/sai đều kèm `groundingQuote` + `groundingSnippetId` trỏ đúng vào transcript thật (bấm để tua tới đúng đoạn) và `suggestedSnippetIds` khi cần xem thêm — học viên tự xác minh được kết luận của AI, không phải "hộp đen" chỉ đưa ra đúng/sai suông. |

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

| Lớp | Kịch bản | Hành vi mong muốn của AI | Ca kiểm thử |
|---|---|---|---|
| **① Failure / không có căn cứ** | Transcript quá ngắn (lời chào mở đầu, ~16 từ), chưa có nội dung kiến thức nào | Từ chối sinh quiz (`sufficientEvidence=false`), không tự bịa câu hỏi từ nội dung không tồn tại | `eval/golden_set.json` → C01 |
| **① Failure / không có căn cứ** | Học viên hỏi/được hỏi về một khái niệm KHÔNG có trong transcript đang dùng (vd "Mức 5", "RAG") | Không tự xác nhận đúng/sai chắc chắn — hạ `confidence`, trả `needsReview=true` thay vì suy diễn | C04, C05 |
| **② Low-confidence** | Transcript chỉ có 1 câu ngắn, chưa đủ chi tiết để phân biệt rạch ròi giữa 2 lựa chọn gần giống nhau | Tự nhận biết không đủ rõ ràng, hạ confidence xuống dưới ngưỡng 60 thay vì khẳng định chắc chắn | C06 |
| **② Low-confidence** | Đáp án đúng nhưng đòi hỏi suy luận qua nhiều bước / hai cách diễn đạt hơi khác nhau về cùng một ý trong transcript | Chấm đúng nội dung nhưng tự đánh giá đúng mức độ tin cậy phù hợp, không quá tự tin khi phải suy luận | C08, C10 |
| **③ Ngoài phạm vi** | Học viên hỏi AI Tutor câu hoàn toàn không liên quan bài giảng (giá vàng, bài tập Toán, viết luận, mức lương, so sánh trường) | Từ chối lịch sự, nói rõ không có căn cứ trong bài giảng, đề nghị liên hệ trợ giảng — **không bịa thông tin** | C11–C15 |
| **③ Ngoài phạm vi** | Câu hỏi ngoài phạm vi có thật đã xảy ra trong vận hành (turn_id T04239: "mình nên ăn gì") | Tái lập đúng hành vi từ chối đã ghi nhận thật, không suy diễn thêm ngoài phạm vi | C21 |
| **④ Đặc thù domain** | Câu hỏi dùng thuật ngữ tiếng Anh chuyên ngành trộn Việt (ReAct, multi-step plan, Tool/API/MCP) hoặc transcript có mật độ thuật ngữ Anh rất cao | Hiểu đúng thuật ngữ ngoại lai, không bị nhiễu khi đánh giá đủ căn cứ hay khi chấm điểm | C16, C19 |
| **④ Đặc thù domain** | Ranh giới khó nhất của chính bài giảng (Mức 3 vs Mức 4) — học viên chọn đáp án sai kinh điển "Mức 3 không gọi được Tool" | Bắt đúng lỗi sai, trích đúng bằng chứng phản biện, không bị đánh lừa bởi lựa chọn nghe có vẻ hợp lý | C18 |
| **④ Đặc thù domain** | Câu hỏi cộc lốc chỉ nêu tên 1 thuật ngữ, không có ngữ cảnh câu hỏi đầy đủ (turn_id T00092 thật) | Vẫn nhận ra thuật ngữ nằm trong phạm vi transcript và trả lời đúng, không từ chối nhầm vì câu hỏi quá ngắn | C22 |

*(9 kịch bản, vượt mức tối thiểu 8, phủ đủ 4 lớp — chi tiết input/expected đầy đủ nằm trong `eval/golden_set.json`.)*

## §6. Bốn đường đi của trải nghiệm

- **Happy path:** Học viên xem/nghe hết video (`ScreenVideoComplete`, gate bằng `onEnded`/nghe hết giọng đọc AI) → bấm "Bắt đầu làm bài kiểm tra AI ngay" → AI sinh 3 câu hỏi tình huống có căn cứ (`sufficientEvidence=true`) → học viên trả lời → AI chấm đúng/sai có trích dẫn với confidence cao → đạt ≥70% → `ScreenRemediation` hiển thị "Đạt", mở khoá bài tiếp theo.

- **Low-confidence (②):** AI chấm một câu trả lời với `confidence < 60` → `needsReview=true` → `ScreenRemediation` hiển thị thẻ màu hổ phách **"AI CHƯA ĐỦ TỰ TIN — CẦN TỰ KIỂM CHỨNG"** kèm 2–3 `suggestedSnippetIds` (mốc thời gian liên quan) để học viên tự xem lại và tự kết luận, thay vì AI áp đặt đúng/sai chắc chắn.

- **Failure / không căn cứ (①):** `evaluateEvidence` trả `sufficientEvidence=false` (transcript quá ngắn hoặc thiếu nội dung thực chất) → chuyển thẳng sang `ScreenSafeFallback` — hiển thị `wordCount`, `evidenceScore`, `reasoning` thật từ AI, **không trừ điểm chuyên cần**, học viên vẫn được mở khoá bài tiếp theo (Bypass Pass).

- **Correction (user sửa):** Ở `ScreenRemediation`, học viên bấm nút "Xem ngay đoạn video [timestamp]" để nghe/xem lại đúng đoạn transcript làm bằng chứng cho câu sai, sau đó bấm "Làm lại bài kiểm tra" để quay về `ScreenQuizTaking` và làm lại từ đầu với hiểu biết đã được sửa.

- **Khi bị đòi ngoài phạm vi (③):** Ở `AiTutorModal`, học viên hỏi câu không liên quan bài giảng (vd hỏi giá vàng, nhờ giải bài tập môn khác) → AI Tutor từ chối lịch sự, nói rõ không có căn cứ trong bài giảng này, đề nghị liên hệ trợ giảng — không tự ý trả lời ngoài vai trò dù có khả năng làm được.

- **Case đặc thù domain (④):** Câu hỏi dùng thuật ngữ chuyên ngành Anh-Việt lẫn lộn hoặc rơi đúng vào ranh giới khó nhất của bài giảng (Mức 3 vs Mức 4) → AI vẫn phải chấm đúng và trích đúng bằng chứng phản biện, không bị nhiễu bởi thuật ngữ lạ hay bị đánh lừa bởi lựa chọn gây nhiễu nghe có vẻ hợp lý.

## §7. Kiểm thử

- **Chiều chất lượng + định nghĩa kiểm chứng được** (3 chiều, khớp đúng 3 quyết định AI trung tâm của lát cắt):

  1. **Grounding/evidence-gate đúng** — AI quyết định transcript đủ/không đủ căn cứ để sinh quiz (`/api/quiz/generate`). Kiểm chứng: so `sufficientEvidence` trả về với giá trị kỳ vọng trong `expected.equals` của từng ca — người ngoài nhóm đọc cùng input + cùng tiêu chí sẽ ra cùng PASS/FAIL, không cần đọc hiểu ý đồ của nhóm.
  2. **Chấm bài đúng + biết khi nào không chắc** — AI xác nhận đúng/sai câu trả lời và tự hạ `confidence` (→ `needsReview=true`) khi transcript không đủ rõ ràng, thay vì đoán liều (`/api/quiz/grade`). Kiểm chứng: so `isCorrect`/`needsReview` với `expected`.
  3. **Không bịa khi ngoài phạm vi** — AI Tutor từ chối đúng cách khi câu hỏi không có căn cứ trong transcript (`/api/tutor/chat`). Kiểm chứng: kiểm tra `reply` có dấu hiệu từ chối/redirect (heuristic từ khoá trong `eval/run_golden_set.ts`) — các ca biên cần đọc thủ công `reply` gốc trong `eval/run_log.jsonl` để xác nhận không có thông tin bịa, vì văn bản tự do không thể kiểm chứng 100% tự động.

  Toàn bộ tiêu chí nằm sẵn trong trường `expected` của từng ca ở `eval/golden_set.json` — không cần đọc hiểu ngầm định của nhóm để chấm lại.

- **Golden set:** `eval/golden_set.json` — **22 case** (vượt mức tối thiểu 20), phân bố đều theo taxonomy 4 lớp chỗ khó (§5): ≥5 case/lớp (①=5, ②=5, ③=6, ④=6). **10/22 case** (C04–C11, C21, C22) có trường `realWorldReference` trỏ đúng `turn_id` trong log chat thật `data/vlearn-pack/tutor_turns.csv` — không phải case tự nghĩ ra chủ quan. Script chạy tự động toàn bộ: `eval/run_golden_set.ts` (`npx tsx eval/run_golden_set.ts`).

- **Quality bar** (chốt tại đây, giữ nguyên sau hạn chốt spec): **"Đạt khi ≥70% tổng số 22 case cho kết quả đúng kỳ vọng (PASS), VÀ 100% case thuộc lớp ① — Không có căn cứ (C01–C05) phải đúng."** Lý do tách riêng lớp ①: đây là lớp có cost-of-error cao nhất (AI tự tin bịa thông tin/kết luận sai khi không có bằng chứng) — không được đánh đổi bằng điểm trung bình cao ở các lớp ít rủi ro hơn, đúng nguyên tắc automation theo cost-of-error đã chọn ở §4.

- **Kết quả các lượt chạy** (bảng đầy đủ + phân tích: `eval/run_results.md`):

  | Lượt | Phạm vi | Đạt / Tổng | Ghi chú |
  |---|---|---|---|
  | 1 (chính thức, sáng 18/9) | 20 case gốc | 0/20 (0%) | Toàn bộ bị chặn bởi quota Gemini free-tier (429 RESOURCE_EXHAUSTED) — **không phải lỗi logic AI**, có log `logs/gemini-calls.jsonl` xác nhận request chưa chạm được bước suy luận. Bù lại bằng 3 ví dụ output thật quan sát được trong cùng phiên build (mục 3, `run_results.md`). |
  | 2 (bổ sung, cùng ngày) | 2 case mới C21, C22 (từ chatlog thật) | 2/2 (100%) | Chạy thật bằng key còn quota — cả 2 tái lập đúng hành vi thật đã ghi nhận trong `tutor_turns.csv`. |
  | **Hiện tại** | **22 case** | **2/22 xác nhận PASS thật (9%)**, còn lại chờ chạy lại | **Chưa đạt quality bar** ở thời điểm này — nguyên nhân đã xác định rõ (quota hạ tầng), kế hoạch chạy lại toàn bộ khi có key đủ quota đã ghi trong `run_results.md` §5. |

  Theo đúng nguyên tắc "số xấu vẫn được tính đủ điểm nếu ghi nhận trung thực": kết quả 2/22 hiện tại được báo cáo đầy đủ, không che giấu, kèm phân tích nguyên nhân và kế hoạch chạy lại cụ thể.

- **Tự khai — chức năng/ca kiểm thử CHƯA kịp xử lý trong đợt chạy hiện tại** (commit trung thực, không che giấu):

  1. **20/22 case chưa có kết quả PASS/FAIL thật xác nhận** — chỉ mới chạy được C21, C22 (2 case bổ sung) do quota Gemini free-tier cạn giữa chừng ở lượt chạy chính thức. Kế hoạch: chạy lại `npx tsx eval/run_golden_set.ts` bằng key đủ quota, cập nhật `eval/run_results.md` trước CP6.
  2. **Chưa kiểm thử tải đồng thời** (nhiều học viên làm quiz cùng lúc) — hệ thống dùng file JSON làm "database" (`data/*.json`), chưa xác minh hành vi khi ghi đồng thời từ nhiều request.
  3. **Chưa kiểm thử luồng giáo viên upload video lỗi/định dạng lạ** ngoài các case đã thử tay (video hợp lệ, file không phải video) — chưa có ca golden set riêng cho lỗi upload.
  4. **Nhóm ② Low-confidence mới có bằng chứng thật gián tiếp** (`realWorldReference` trỏ về pattern tương tự trong chatlog thật), chưa có case nào trong nhóm này được chạy PASS thật — ưu tiên chạy trước khi báo cáo lại.
  5. **Chưa đo latency/độ trễ phản hồi thật** của từng loại quyết định AI trên diện rộng (mới quan sát rời rạc qua log, chưa tổng hợp thành số liệu chính thức trong `eval/`).

## §8. Phân công & kế hoạch

- **Phân công có tên** (khớp `canvas.md` dòng 7 và `README.md`):

  | Thành viên | Vai trò | Đầu việc phụ trách |
  |---|---|---|
  | **Mai Văn Trung** | Nhóm trưởng | AI Spec (`spec.md`) + Canvas (`canvas.md`) + thiết kế luồng sản phẩm (product flow) |
  | **Ngô Văn Giáp** | Thành viên | Evidence mining/khảo sát (§1) + phân tích pain point (§1-§2) |
  | **Trịnh Quốc Hoàng** | Thành viên | Lời gọi AI + thiết kế prompt + cơ chế grounding transcript (`server/gemini.ts`, `server/videos.ts`) |
  | **Vũ Minh Trí** | Thành viên | Golden set + kiểm thử (`eval/golden_set.json`, `eval/run_golden_set.ts`, `eval/run_results.md`) |
  | **Cả nhóm** | — | Prototype UI (`src/`), validation, chuẩn bị demo |

- **Kế hoạch kiểm thử thực tế:**
  1. Chạy `npx tsx eval/run_golden_set.ts` toàn bộ 22 case ngay khi có API key đủ quota (ưu tiên trước CP6) — cập nhật bảng % thật vào `eval/run_results.md` và §7.
  2. Ưu tiên xác nhận nhóm ② Low-confidence trước (hiện chưa có case nào trong nhóm này chạy PASS thật — xem tự khai ở §7).
  3. Trước khi trình bày CP6: chuẩn bị sẵn 1 case "lạ" chưa từng chạy để phản ứng với thẻ giám khảo bốc ngẫu nhiên (theo checklist CP6 trong `04-rubric.md`).

- **Willing users:** Ít nhất 3 người đã đồng ý dùng thử — **Quân, Đăng, Nam** (khai từ CP1, theo `canvas.md` dòng 6). Kế hoạch vòng validation *(bonus §R6, chưa làm)*: giao mỗi người 1 task cụ thể (xem hết 1 video mẫu → làm quiz → đọc kết quả chấm), ngồi quan sát trực tiếp, ghi quote nguyên văn lúc họ đang thao tác (không hỏi "thấy sản phẩm này thế nào") — thực hiện trước CP5 nếu còn thời gian.

- **Multi-prototype:** Không làm — lý do: trong 39 giờ hackathon, nhóm ưu tiên dồn nguồn lực hoàn thiện đầy đủ 1 lát cắt duy nhất (đăng nhập → upload/chọn bài giảng → xem hết video → AI sinh quiz → chấm điểm có căn cứ → fallback an toàn) thay vì làm nông nhiều phương án song song.

## §9. Changelog

| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
|---|---|---|
| 18/9, sau khi có `data/vlearn-pack/tutor_turns.csv` | Bổ sung bằng chứng thật (§1) + thêm `realWorldReference` cho 10/22 case golden set (C04–C11, C21, C22) | Rubric R4 yêu cầu ≥10 case từ chatlog thật; trước đó golden set chỉ tự nghĩ ra, chưa đối chiếu với dữ liệu vận hành thật |
| 18/9, sau lượt chạy golden set đầu tiên | Ghi nhận trung thực 0/20 PASS do quota Gemini cạn, kèm 3 bằng chứng thay thế từ log thật cùng phiên | Tuân thủ nguyên tắc "số xấu vẫn tính đủ điểm nếu trung thực" — không che giấu, có phân tích nguyên nhân cụ thể (429 RESOURCE_EXHAUSTED, không phải lỗi logic) |
| 18/9 | Hạ ngưỡng `MIN_WORD_THRESHOLD` từ 300 xuống 150 rồi khôi phục lại 300 sau khi mở rộng transcript demo lên 660 từ | Transcript demo ban đầu (~215 từ) luôn bị fallback nhầm; thay vì hạ chuẩn, nhóm chọn viết lại nội dung bài giảng mẫu cho đủ chất lượng thay vì nới lỏng ngưỡng an toàn |
| 18/9 | Phát hiện và chuyển `spec.md` từ nhầm vị trí `eval/spec.md` về đúng gốc repo | Cấu trúc repo bắt buộc của hackathon yêu cầu `spec.md` ở gốc — nếu để sai chỗ, toàn bộ điểm R1-R4 chấm trên file này sẽ không tìm thấy |