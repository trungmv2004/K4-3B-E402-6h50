# User Testing Log

## 1. Mục tiêu Validation

Mục tiêu của buổi validation là kiểm tra khả năng sử dụng và mức độ hiểu của người dùng đối với prototype VLearn AI Tutor, tập trung vào các giả định chính:

* Người học hiểu lý do phải xem hết video trước khi làm bài kiểm tra.
* Người học biết cách xem lại video/transcript khi trả lời sai.
* Evidence từ bài giảng giúp tăng độ tin cậy đối với kết quả AI.
* Người học hiểu các cảnh báo liên quan đến độ tự tin của AI.
* Người học hiểu cách AI Tutor xử lý câu hỏi ngoài phạm vi bài giảng.
* Người học có thể hoàn thành workflow mà không bị mất phương hướng.
* Người học hiểu được giá trị chính của sản phẩm sau một lần sử dụng.

---

## 2. Đối tượng tham gia Validation

Quá trình validation được thực hiện theo hai hình thức:

* **User Testing trực tiếp:** 02 người dùng thuộc danh sách willing users đã đăng ký từ mốc CP1.
* **Khảo sát sau trải nghiệm:** 03 người dùng đã hoàn thành bộ câu hỏi khảo sát sau khi sử dụng prototype.

Hai người tham gia User Testing trực tiếp được quan sát trong quá trình thực hiện các nhiệm vụ để ghi nhận điểm tắc nghẽn, hành vi và phản hồi nguyên văn.

Ngoài ra, nhóm thu thập thêm phản hồi định lượng từ 03 người dùng thông qua bảng khảo sát Yes/No nhằm kiểm chứng mức độ dễ hiểu, mức độ tin tưởng và nhu cầu sử dụng tính năng.

---

## 3. User Testing Log

| Người thử | Nhiệm vụ giao | Điểm tắc nghẽn           | Quyết định xử lý của nhóm     |

| Nguyễn Thành Nam -02694   | Xem video → hoàn thành video → mở Quiz → trả lời câu hỏi → xem feedback AI → xem lại nội dung liên quan | Người dùng có thời điểm chưa biết cần bấm nút nào tiếp theo sau khi nhận feedback từ AI                                                         | Làm nổi bật CTA chính sau mỗi trạng thái, ví dụ “Xem lại đoạn liên quan” hoặc “Thử lại câu hỏi”               |


| Nguyễn Minh Quân-02490  | Sử dụng AI Tutor → hỏi câu trong bài → hỏi câu ngoài phạm vi bài giảng → quan sát AI Confidence         | Người dùng chưa hiểu rõ ý nghĩa thông báo “AI CHƯA ĐỦ TỰ TIN — CẦN TỰ KIỂM CHỨNG” và chưa hoàn toàn hiểu lý do AI từ chối câu hỏi ngoài phạm vi | Viết lại cảnh báo AI Confidence và giải thích rõ lý do AI Tutor giới hạn câu trả lời trong nội dung bài giảng |

---

## 4. Kết quả khảo sát sau trải nghiệm

Tổng số người tham gia khảo sát: **03 người**.

| STT | Câu hỏi khảo sát                                                                                      | Số lượt Yes | Tỉ lệ Yes (%) | Số lượt No | Tỉ lệ No (%) |
| --: | ----------------------------------------------------------------------------------------------------- | ----------: | ------------: | ---------: | -----------: |
|   1 | Bạn có hiểu ngay tại sao phải xem hết video mới được làm bài kiểm tra không?                          |           3 |          100% |          0 |           0% |
|   2 | Khi AI báo bạn trả lời sai bạn có tự bấm xem lại đoạn video/transcript liên quan không?               |           3 |          100% |          0 |           0% |
|   3 | Đoạn “Chứng minh từ bài giảng” đi kèm kết quả chấm có khiến bạn tin kết luận của AI hơn không?        |           3 |          100% |          0 |           0% |
|   4 | Bạn có hiểu ngay ý nghĩa dòng “AI CHƯA ĐỦ TỰ TIN — CẦN TỰ KIỂM CHỨNG” không?                          |           1 |         33.3% |          2 |        66.7% |
|   5 | Khi hỏi AI Tutor một câu ngoài phạm vi bài giảng bạn thấy câu trả lời từ chối của nó có hợp lý không? |           2 |         66.7% |          1 |        33.3% |
|   6 | Trong lúc dùng thử bạn có bị khựng lại, không biết bấm gì tiếp ở bước nào không?                      |           3 |          100% |          0 |           0% |
|   7 | Bạn có thể giải thích cho người khác “web này làm gì” chỉ sau 1 lần dùng thử không?                   |           2 |         66.7% |          1 |        33.3% |
|   8 | Nếu tính năng này có thật trên VLearn bạn có dùng thường xuyên không?                                 |           3 |          100% |          0 |           0% |
|   9 | Bạn có sẵn sàng giới thiệu tính năng này cho bạn học cùng lớp không?                                  |           3 |          100% |          0 |           0% |
|  10 | Có tính năng nào bạn mong đợi nhưng không thấy xuất hiện không?                                       |           3 |          100% |          0 |           0% |

---

## 5. Phân tích kết quả khảo sát

### 5.1. Cơ chế Video → Quiz được người dùng hiểu rõ

Có **3/3 người dùng (100%)** hiểu lý do phải xem hết video trước khi được làm bài kiểm tra.

Điều này cho thấy cơ chế:

`Watch Video → Complete Video → Unlock Quiz`

không tạo ra sự khó hiểu đáng kể đối với người dùng.

**Quyết định của nhóm:**
Giữ nguyên flow này trong MVP.

---

### 5.2. Evidence từ bài giảng giúp tăng độ tin cậy

Có **3/3 người dùng (100%)** cho biết phần “Chứng minh từ bài giảng” giúp họ tin tưởng hơn vào kết luận của AI.

Ngoài ra, **3/3 người dùng** cũng có xu hướng xem lại video hoặc transcript khi AI thông báo họ trả lời sai.

**Quyết định của nhóm:**
Giữ “Chứng minh từ bài giảng” là một tính năng quan trọng của MVP.

Ưu tiên hiển thị:

`Kết quả → Giải thích → Evidence → Xem lại nội dung`

---

### 5.3. AI Confidence Warning là vấn đề lớn

Chỉ có **1/3 người dùng (33.3%)** hiểu ngay ý nghĩa của thông báo:

> AI CHƯA ĐỦ TỰ TIN — CẦN TỰ KIỂM CHỨNG

Trong khi **2/3 người dùng (66.7%)** không hiểu ngay thông báo này.

Đây là một vấn đề usability đáng ưu tiên xử lý.

**Quyết định của nhóm:**
Thay thông báo bằng nội dung cụ thể hơn:

> ⚠️ AI chưa tìm thấy đủ thông tin trong bài giảng để đưa ra kết luận chắc chắn.

> Hãy kiểm tra lại nội dung bài giảng bên dưới trước khi sử dụng câu trả lời.

CTA:

`Xem nội dung liên quan`

---

### 5.4. Câu trả lời từ chối ngoài phạm vi chưa hoàn toàn thuyết phục

Có **2/3 người dùng (66.7%)** cho rằng câu trả lời từ chối của AI Tutor là hợp lý.

Tuy nhiên vẫn có **1/3 người dùng (33.3%)** chưa đồng ý hoặc chưa hiểu lý do.

**Quyết định của nhóm:**
Thay vì chỉ từ chối:

> Câu hỏi nằm ngoài phạm vi bài giảng.

AI Tutor sẽ giải thích:

> Hiện tại mình chỉ sử dụng thông tin trong bài giảng này để trả lời, nhằm tránh cung cấp nội dung không được giảng viên xác nhận.

Sau đó cung cấp:

`Gợi ý câu hỏi liên quan`

hoặc

`Quay lại nội dung bài học`

---

### 5.5. Người dùng vẫn bị khựng trong quá trình sử dụng

Có **3/3 người dùng (100%)** cho biết họ từng bị khựng hoặc không biết nên thao tác gì tiếp theo.

Đây là vấn đề usability có mức độ ưu tiên cao.

Nguyên nhân cần kiểm tra thêm:

* CTA chưa đủ nổi bật.
* Nhiều nút có độ ưu tiên tương đương.
* Sau khi nhận kết quả từ AI, người dùng chưa biết bước tiếp theo.
* Navigation giữa Video, Quiz và AI Tutor chưa rõ.

**Quyết định của nhóm:**
Thiết kế mỗi trạng thái chỉ có một CTA chính.

Ví dụ:

`Trả lời sai → Xem lại nội dung`

`Xem lại xong → Thử lại câu hỏi`

`Hoàn thành Quiz → Tiếp tục bài học`

---

### 5.6. Giá trị sản phẩm chưa được tất cả người dùng hiểu ngay

Có **2/3 người dùng (66.7%)** có thể giải thích ngay web làm gì sau một lần sử dụng.

Còn **1/3 người dùng (33.3%)** chưa thể giải thích rõ.

**Quyết định của nhóm:**
Cải thiện onboarding và value proposition.

Ví dụ thêm dòng mô tả đầu trang:

> VLearn AI Tutor giúp bạn học từ video, kiểm tra kiến thức và xem lại chính xác phần bài giảng liên quan khi trả lời sai.

---

### 5.7. Ý định sử dụng sản phẩm tích cực

Có:

* **3/3 người dùng (100%)** cho biết sẽ sử dụng thường xuyên nếu tính năng có trên VLearn.
* **3/3 người dùng (100%)** sẵn sàng giới thiệu tính năng cho bạn học.

Đây là tín hiệu tích cực về mức độ quan tâm đối với concept.

---

### 5.8. Người dùng mong muốn thêm tính năng

Có **3/3 người dùng (100%)** cho biết họ mong đợi một số tính năng chưa xuất hiện.

Tuy nhiên câu hỏi Yes/No chưa cho biết cụ thể người dùng muốn tính năng nào.

**Quyết định của nhóm:**
Bổ sung câu hỏi mở:

> “Bạn mong muốn tính năng nào được bổ sung?”

Các feature request sẽ được tổng hợp và phân loại thành:

* Must-have
* Nice-to-have
* Future iteration

---

## 6. Các vấn đề ưu tiên sau Validation

| Priority | Vấn đề phát hiện                            | Evidence                            | Quyết định                              |
| -------- | ------------------------------------------- | ----------------------------------- | --------------------------------------- |
| P0       | Người dùng bị khựng trong workflow          | 3/3 người dùng                      | Cải thiện CTA và navigation             |
| P0       | AI Confidence Warning khó hiểu              | 2/3 người dùng không hiểu           | Viết lại warning và thêm CTA kiểm chứng |
| P1       | Out-of-scope response chưa hoàn toàn hợp lý | 1/3 người dùng chưa đồng ý          | Giải thích rõ lý do AI giới hạn phạm vi |
| P1       | Giá trị sản phẩm chưa được hiểu ngay        | 1/3 người dùng chưa giải thích được | Cải thiện onboarding                    |
| P2       | Người dùng mong muốn thêm tính năng         | 3/3 người dùng                      | Thu thập feature request chi tiết       |

---

## 7. Kết luận Validation

Validation được thực hiện với **02 willing users từ CP1 thông qua User Testing trực tiếp**, đồng thời thu thập thêm phản hồi khảo sát từ tổng cộng **03 người dùng**.

Kết quả cho thấy các giả định chính về:

* cơ chế Video → Quiz,
* xem lại nội dung khi trả lời sai,
* và Evidence từ bài giảng

đều nhận được phản hồi tích cực.

Tuy nhiên, quá trình thử nghiệm cũng phát hiện ba vấn đề cần ưu tiên xử lý:

1. Người dùng vẫn bị khựng trong workflow.
2. Thông báo AI Confidence chưa dễ hiểu.
3. Cách AI xử lý câu hỏi ngoài phạm vi cần giải thích rõ hơn.

<<<<<<< HEAD
Những kết quả này sẽ được sử dụng để cải tiến prototype trước vòng validation tiếp theo.
=======
Những kết quả này sẽ được sử dụng để cải tiến prototype trước vòng validation tiếp theo.
>>>>>>> cd97fb36ace676da8b8c4d8e18d69805b7a4f9e5
