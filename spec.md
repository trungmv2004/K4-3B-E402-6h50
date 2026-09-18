# Template AI Spec *(spec.md — commit trước hạn chốt spec: 21:00 17/9, tại CP4 · quality bar chốt từ thời điểm nộp)*

> Cấu trúc phủ đúng "SPEC 8 phần" của chương trình: Bằng chứng (§1-§2) · Lát cắt (§4) · Canvas (đính kèm CP1) · Augment/Automate (§4) · 4 đường đi của trải nghiệm (§6) · Kiểu lỗi (§5) · Kiểm thử (§7) · Phân công (§8). Hướng dẫn viết từng mục: `02-guide.md`.

```markdown
# AI SPEC — [Tên lát cắt] · Nhóm [6h50] · Zone [Bàn 8 -C4]
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
- [Sản phẩm 1]: flow / đáng học / đáng né / mình khác gì
- [Sản phẩm 2]: ...

## §4. Thiết kế
- Lát cắt MỘT CÂU (1 user · 1 việc · 1 quyết định AI · 1 kết quả):
- Non-goals (≥3 thứ KHÔNG build):
- Mức prototype nhắm tới: [ ] Sketch [ ] Mock [ ] Working — phần nào mock, phần nào thật:
- Automation: [ ] augment [ ] conditional [ ] automate — lý do theo cost-of-error:
- §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR, xem guide):
  | Nguyên tắc | Áp cụ thể vào đâu trong prototype |
  |---|---|

## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản (≥8) [bảng theo guide §2.5]

## §6. Bốn đường đi của trải nghiệm
- Happy path: · Low-confidence (②): · Failure/không căn cứ (①): · Correction (user sửa):
- Khi bị đòi ngoài phạm vi (③): · Case đặc thù domain (④):

## §7. Kiểm thử
- **Chiều chất lượng + định nghĩa kiểm chứng được:**
  - *Tính toàn vẹn căn cứ (Grounding Integrity)*: AI chỉ chấm đúng/xác nhận khi có trích dẫn (`groundingQuote` và `groundingSnippetId`) khớp với transcript thực tế; không hallucinate căn cứ.
  - *Khả năng nhận diện giới hạn (Out-of-scope & Gate Rejection)*: 100% câu hỏi ngoài bài giảng phải được từ chối lịch sự và chuyển tiếp trợ giảng; transcript dưới ngưỡng chất lượng phải bị cổng chặn từ chối (`sufficientEvidence: false`).
  - *Hiệu chuẩn độ tin cậy (Confidence Calibration)*: Trong tình huống mơ hồ hoặc thông tin chưa đủ, AI phải hạ độ tin cậy hoặc gắn cờ `needsReview: true` thay vì khẳng định chắc chắn.
- **Golden set (≥20 case theo cơ cấu trong guide §2.6, file trong [`eval/golden_set.json`](file:///d:/DATA/IT/AIA/lab/K4-3B-E402-6h50/hệ-thống-tác-tử---vinuni-lms/eval/golden_set.json)):**
  - Đủ 20 ca phân bổ theo 4 lớp chỗ khó (5 ca/lớp): ① Không có căn cứ (C01–C05), ② Low-confidence (C06–C10), ③ Ngoài phạm vi (C11–C15), ④ Đặc thù domain AI Agent (C16–C20).
  - Có 10 ca phát triển từ chatlog và câu hỏi thực tế của sinh viên VinUni.
- **Quality bar:** "Đạt khi ≥ 70% qua bộ kiểm thử (PASS), 100% ca ngoài phạm vi được từ chối an toàn, và mọi ca thất bại đều có phân tích nguyên nhân cùng kế hoạch cải tiến."
- **Kết quả các lượt chạy (chi tiết xem tại [`eval/run_results.md`](file:///d:/DATA/IT/AIA/lab/K4-3B-E402-6h50/hệ-thống-tác-tử---vinuni-lms/eval/run_results.md)):**
  | Lượt chạy | Ngày thực hiện | Động cơ / Model | Tổng ca | PASS | FAIL | OBSERVE | Tỷ lệ PASS | Đạt Quality Bar? |
  |---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
  | **Lượt 1** | 2026-09-18 | Groq API (`openai/gpt-oss-20b`) | 20 | 15 | 4 | 1 | **75.0%** | **ĐẠT (≥70%)** |


## §8. Phân công & kế hoạch
- Phân công có tên: spec / evidence / prompt / code / demo
- Willing users (≥2 tên) + kế hoạch vòng validation *(bonus, nếu làm)*:
- Multi-prototype (nếu làm): trục khác biệt của ≥2 phương án + lý do chọn:

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |
```