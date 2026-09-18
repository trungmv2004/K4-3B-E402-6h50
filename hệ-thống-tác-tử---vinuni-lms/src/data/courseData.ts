import { QuizQuestion, TranscriptSnippet } from '../types';

export const COURSE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    questionNumber: 1,
    totalQuestions: 3,
    badgeText: 'Mức 1: Scripted',
    questionType: 'Trắc nghiệm đơn (Single Choice)',
    title: 'Đặc trưng cơ bản nhất của Chatbot Mức 1 (Trả lời theo kịch bản) là gì?',
    options: [
      { key: 'A', text: 'Tuân theo cây quyết định cứng & kịch bản viết sẵn (rule-based deterministic flow).' },
      { key: 'B', text: 'Có khả năng tự gọi các API thời tiết và tài chính phức tạp.' },
      { key: 'C', text: 'Tự động sửa lỗi và thích nghi khi gặp câu hỏi bất thường.' },
      { key: 'D', text: 'Ghi nhớ toàn bộ ngữ cảnh trao đổi qua nhiều tuần.' }
    ],
    correctAnswer: 'A',
    userAnswer: 'A',
    groundingTimestamp: '01:10 - 01:45',
    groundingMatchPercent: 99.1,
    groundingQuote: '"Mức 1 chỉ dựa trên rule-based, nói sao làm vậy, toàn bộ câu trả lời được lập trình viên định sẵn qua cây logic if/else."',
    audioSeconds: 70,
    explanation: 'Mức 1 hoạt động thuần túy dựa trên các quy tắc xác định sẵn, không có khả năng suy luận ngoài kịch bản.',
    aiDiagnosticRemark: 'Bạn đã trả lời chính xác và nắm vững bản chất sơ khởi của Chatbot truyền thống.'
  },
  {
    id: 2,
    questionNumber: 2,
    totalQuestions: 3,
    badgeText: 'Mức 1 vs Mức 3',
    questionType: 'Trắc nghiệm đơn (Single Choice)',
    title: 'Sự khác biệt cốt lõi giữa Mức 1 (Trả lời theo kịch bản) và Mức 3 (Phản ứng với yêu cầu) trong mô hình hệ thống AI Agent được giảng dạy là gì?',
    options: [
      { key: 'A', text: 'Mức 1 có khả năng học từ dữ liệu thời gian thực còn Mức 3 chỉ dùng mô hình đóng gói cố định.' },
      { key: 'B', text: 'Mức 1 tuân thủ các quy tắc định sẵn (deterministic flow), trong khi Mức 3 có năng lực gọi công cụ (tool-use) và phản hồi linh hoạt theo ngữ cảnh thực tế của người dùng.' },
      { key: 'C', text: 'Mức 3 hoàn toàn không cần đến sự giám sát của con người và tự tạo mục tiêu mới mà không cần câu lệnh khởi động.' },
      { key: 'D', text: 'Cả hai mức đều tương đương nhau về mặt công nghệ, chỉ khác biệt về tốc độ phản hồi máy chủ.' }
    ],
    correctAnswer: 'B',
    userAnswer: 'B',
    groundingTimestamp: '02:15 - 03:00',
    groundingMatchPercent: 98.4,
    groundingQuote: '"...Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học. Ở Mức 1 chỉ trả lời theo kịch bản cứng, còn Mức 3 có thể tự phản ứng với yêu cầu thực tế, dùng công cụ để xử lý tác vụ phát sinh..."',
    audioSeconds: 135,
    diagramTitle: 'Sơ đồ 4 Mức độ tự chủ (Trích xuất từ Slide)',
    diagramSubtitle: 'Phạm vi tự chủ · không phải bảng xếp hạng',
    diagramLevels: [
      { level: 'MỨC 1', name: 'Trả lời theo kịch bản' },
      { level: 'MỨC 2', name: 'Trợ lý hội thoại' },
      { level: 'MỨC 3', name: 'Phản ứng với yêu cầu', isTarget: true, badge: 'Trọng tâm' },
      { level: 'MỨC 4', name: 'Theo đuổi mục tiêu' }
    ],
    explanation: 'Mức 3 đưa vào khả năng phản ứng động qua việc chọn và gọi các Tool/API (tool-use) phù hợp với ngữ cảnh truy vấn của người dùng.',
    aiDiagnosticRemark: 'Bạn đã chọn đúng đáp án B, hiểu rõ việc tích hợp công cụ ngoại vi và xử lý ngữ cảnh.'
  },
  {
    id: 3,
    questionNumber: 3,
    totalQuestions: 3,
    badgeText: 'Mức 3 vs Mức 4',
    questionType: 'Trắc nghiệm đơn (Single Choice)',
    title: 'Sự khác nhau bản chất giữa Tác tử Mức 3 (Phản ứng với yêu cầu) và Mức 4 (Theo đuổi mục tiêu) là gì?',
    options: [
      { key: 'A', text: 'Mức 3 chỉ hoạt động trên thiết bị di động còn Mức 4 chạy trên siêu máy tính đám mây.' },
      { key: 'B', text: 'Mức 3 không gọi được Tool API bên ngoài, chỉ Mức 4 mới có khả năng tích hợp Tool.' },
      { key: 'C', text: 'Mức 4 chỉ cần câu hỏi ngắn còn Mức 3 cần tài liệu dài.' },
      { key: 'D', text: 'Mức 4 có khả năng tự hoạch định nhiều bước (Multi-step Planning) và tự sửa sai theo đuổi mục tiêu lớn mà không cần mớm lệnh liên tục.' }
    ],
    correctAnswer: 'D',
    userAnswer: 'B', // default simulated wrong in Step 3 review
    groundingTimestamp: '03:15 - 04:00',
    groundingMatchPercent: 99.4,
    groundingQuote: '"...Các bạn lưu ý thật kỹ điểm này: Mức 3 phản ứng với yêu cầu là khi bạn bảo nó kiểm tra thời tiết thì nó mới gọi API thời tiết. Còn khi bước sang Mức 4 theo đuổi mục tiêu, chúng ta giao một đề bài trừu tượng như \'Hãy tối ưu lịch trình bay và tự đặt vé\', Agent sẽ tự lập vòng lặp ReAct, tự thử lại khi gặp lỗi mà không cần con người mớm lệnh từng bước..."',
    audioSeconds: 195,
    diagramTitle: 'Sơ đồ 4 Mức độ tự chủ (Trích xuất từ Slide)',
    diagramSubtitle: 'Phạm vi tự chủ · không phải bảng xếp hạng',
    diagramLevels: [
      { level: 'MỨC 1', name: 'Trả lời theo kịch bản' },
      { level: 'MỨC 2', name: 'Trợ lý hội thoại' },
      { level: 'MỨC 3', name: 'Phản ứng với yêu cầu' },
      { level: 'MỨC 4', name: 'Theo đuổi mục tiêu', isTarget: true, badge: 'Tự chủ cao' }
    ],
    explanation: 'Mức 4 vượt trội ở khả năng tự phân rã mục tiêu (goal decomposition), lập kế hoạch nhiều bước (multi-step planning), và vòng lặp tự sửa sai ReAct.',
    aiDiagnosticRemark: 'Cần chú ý: Mức 3 ĐÃ gọi được Tool/API, nhưng chỉ phản xạ đơn lẻ sau mỗi lệnh của người dùng!'
  }
];

// seconds/timestamp là ước lượng theo tốc độ đọc trung bình (~2,35 từ/giây); vị trí phát THẬT
// khi demo do trình duyệt tự báo qua sự kiện onstart của Web Speech API (xem useSpeechNarration).
export const TRANSCRIPT_TIMELINE: TranscriptSnippet[] = [
  {
    id: 't-1',
    timestamp: '00:00',
    seconds: 0,
    title: 'Giới thiệu 4 mức độ',
    speaker: 'VinUni Instructor',
    text: 'Trong phần trước, chúng ta đã xem xét ranh giới giữa một chatbot đơn thuần và một tác tử, hay AI Agent, thực thụ. Hôm nay chúng ta sẽ đi sâu vào một khung phân loại gồm bốn mức độ tự chủ, giúp các bạn xác định chính xác một hệ thống có bao nhiêu quyền tự quyết trong hành động. Đây là một phổ, không phải bảng xếp hạng.',
    tag: 'Giới thiệu'
  },
  {
    id: 't-2',
    timestamp: '00:30',
    seconds: 30,
    title: 'Mức 1: Scripted',
    speaker: 'VinUni Instructor',
    text: 'Khởi đầu là Mức 1: Trả lời theo kịch bản có sẵn. Toàn bộ câu trả lời được lập trình viên định sẵn qua cây logic if/else. Ví dụ, một tổng đài chăm sóc khách hàng tự động: bấm phím số 1, hệ thống phát đúng đoạn ghi âm đã thu sẵn cho lựa chọn đó. Không có suy luận ngôn ngữ tự nhiên nào diễn ra, và hệ thống không thể xử lý câu hỏi nằm ngoài kịch bản đã vạch sẵn.',
    tag: 'Mức 1',
    relatedQuestionId: 1
  },
  {
    id: 't-3',
    timestamp: '01:05',
    seconds: 65,
    title: 'Phân biệt Mức 2 và Mức 3',
    speaker: 'VinUni Instructor',
    text: 'Khi trang bị cho hệ thống một mô hình ngôn ngữ lớn để hiểu và phản hồi linh hoạt hơn, chúng ta bước sang Mức 2. Nhưng ranh giới đáng chú ý nhất nằm giữa Mức 2 và Mức 3, bởi ở Mức 3, tác tử bắt đầu phản ứng theo ngữ cảnh và có thể tự chọn gọi công cụ phù hợp với yêu cầu.',
    tag: 'Mức 2 & 3',
    relatedQuestionId: 2
  },
  {
    id: 't-4',
    timestamp: '01:33',
    seconds: 93,
    title: 'Mức 2: Conversational',
    speaker: 'VinUni Instructor',
    text: 'Đến Mức 2: Trợ lý hội thoại. Tại đây LLM tiếp nhận câu hỏi bằng ngôn ngữ tự nhiên, giữ được ngữ cảnh đoạn hội thoại ngắn để phản hồi tự nhiên hơn. Tuy nhiên, giới hạn của Mức 2 là nó chỉ dừng ở việc trò chuyện: có thể tư vấn, giải thích, gợi ý, nhưng không tự đi thực hiện hành động nào ra bên ngoài, ví dụ không tự đặt vé, không tự truy vấn dữ liệu thời gian thực.',
    tag: 'Mức 2'
  },
  {
    id: 't-5',
    timestamp: '02:09',
    seconds: 129,
    title: 'Trọng tâm Câu 3: Mức 3 vs Mức 4',
    speaker: 'VinUni Instructor',
    text: 'Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học. Mức 3 phản ứng với yêu cầu nghĩa là người dùng hỏi gì, bot tra cứu công cụ đó. Ví dụ, nếu bạn hỏi về thời tiết hôm nay, nó nhận diện đây là yêu cầu cần dữ liệu thời gian thực, tự động gọi một API thời tiết, rồi trả lời dựa trên kết quả nhận được. Nhưng lưu ý thật kỹ: nó không tự đặt ra lộ trình tiếp theo.',
    tag: 'Trọng tâm Câu 3',
    isImportant: true,
    relatedQuestionId: 3
  },
  {
    id: 't-6',
    timestamp: '02:46',
    seconds: 166,
    title: 'Mức 4: Autonomous',
    speaker: 'VinUni Instructor',
    text: 'Ngược lại, ở Mức 4: Theo đuổi mục tiêu, hệ thống tự động sinh kế hoạch nhiều bước, hay multi-step plan, rồi tự thực thi vòng lặp quan sát, suy luận, hành động, viết tắt ReAct, cho đến khi đạt kết quả mong muốn. Ví dụ, nếu bạn giao một mục tiêu trừu tượng như "hãy tối ưu lịch trình bay và tự đặt vé cho tôi", nó sẽ tự phân rã thành nhiều bước nhỏ: tìm chuyến bay, so sánh giá, kiểm tra lịch, rồi tự đặt vé, và tự thử lại nếu gặp lỗi mà không cần con người mớm lệnh từng bước.',
    tag: 'Mức 4',
    isImportant: true,
    relatedQuestionId: 3
  },
  {
    id: 't-7',
    timestamp: '03:30',
    seconds: 210,
    title: 'Ví dụ tổng hợp: Đặt vé máy bay qua 4 mức',
    speaker: 'VinUni Instructor',
    text: 'Để dễ hình dung, hãy xét chung một tình huống: đặt vé máy bay. Ở Mức 1, hệ thống chỉ đưa bạn qua một menu bấm phím cố định. Ở Mức 2, bạn trò chuyện tự nhiên để hỏi thông tin, nhưng vẫn phải tự đặt vé. Ở Mức 3, nếu bạn yêu cầu cụ thể "hãy đặt giúp tôi chuyến bay lúc 8 giờ sáng", nó gọi công cụ đặt vé ngay lúc đó. Còn ở Mức 4, bạn chỉ cần giao mục tiêu tổng quát, hệ thống tự lên kế hoạch, tự đặt vé, tự sửa lỗi, không cần bạn hướng dẫn từng bước.',
    tag: 'Ví dụ tổng hợp',
    isImportant: true
  },
  {
    id: 't-8',
    timestamp: '04:15',
    seconds: 255,
    title: 'Kết luận & Bằng chứng thực tế',
    speaker: 'VinUni Instructor',
    text: 'Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học, nói đã kiểm tra thì phải có bằng chứng đã làm thực tế. Ngay sau đây, các bạn sẽ làm một bài kiểm tra ngắn để tự đối chiếu xem mình đã nắm được ranh giới giữa các mức độ tự chủ này hay chưa.',
    tag: 'Kết luận',
    isImportant: true
  }
];

export const FALLBACK_AUDIT_DATA = {
  phase: 'Giai đoạn 3.4',
  stageName: 'Xác thực tính nguyên vẹn dữ liệu transcript',
  systemStatus: 'Hệ thống giám sát chất lượng LLM đang hoạt động',
  wordCount: 110,
  minWordThreshold: 300,
  evidenceScore: 38,
  evidenceRequired: 80,
  appliedMode: 'Bypass Pass (Miễn thi)',
  academicBenefit: 'Được cộng đủ điểm chuyên cần',
  transcriptSample: '"Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học. Chúng ta vừa đi qua khái niệm sơ khởi và góc nhìn chung về hệ sinh thái. Ở bài tiếp theo, chúng ta sẽ bắt đầu mổ xẻ trực tiếp sự khác nhau mang tính cốt lõi giữa Tool, API tiêu chuẩn và MCP Server trong ngữ cảnh thực tế của một ReAct Agent. Mời các bạn chuyển tiếp ngay sau đây."',
  aiReasoning: 'AI Reasoning: Đoạn văn trên hoàn toàn mang tính chất điều hướng giới thiệu, không xuất hiện công thức, định nghĩa kiểm chứng hoặc bài toán logic cụ thể.'
};
