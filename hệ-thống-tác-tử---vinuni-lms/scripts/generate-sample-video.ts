import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
// @ts-ignore - ffmpeg-static chỉ export default là đường dẫn tới binary, không có type định nghĩa.
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../sample-assets');
const SAMPLE_RATE = 24000;
const BYTES_PER_SAMPLE = 2;
const VOICE_NAME = 'Kore';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

const SAMPLE_TEXT = `Xin chào các bạn. Trong phần trước, chúng ta đã xem xét ranh giới giữa một chatbot đơn thuần và một tác tử, hay AI Agent, thực thụ. Hôm nay chúng ta sẽ đi sâu vào một khung phân loại gồm bốn mức độ tự chủ, giúp các bạn xác định chính xác một hệ thống có bao nhiêu quyền tự quyết trong hành động. Đây là một phổ, không phải bảng xếp hạng.

Khởi đầu là Mức 1: Trả lời theo kịch bản có sẵn. Toàn bộ câu trả lời được lập trình viên định sẵn qua cây logic if/else. Ví dụ, một tổng đài chăm sóc khách hàng tự động: bấm phím số 1, hệ thống phát đúng đoạn ghi âm đã thu sẵn cho lựa chọn đó. Không có suy luận ngôn ngữ tự nhiên nào diễn ra, và hệ thống không thể xử lý câu hỏi nằm ngoài kịch bản đã vạch sẵn.

Khi trang bị cho hệ thống một mô hình ngôn ngữ lớn để hiểu và phản hồi linh hoạt hơn, chúng ta bước sang Mức 2. Nhưng ranh giới đáng chú ý nhất nằm giữa Mức 2 và Mức 3, bởi ở Mức 3, tác tử bắt đầu phản ứng theo ngữ cảnh và có thể tự chọn gọi công cụ phù hợp với yêu cầu.

Trợ lý hội thoại. Tại đây LLM tiếp nhận câu hỏi bằng ngôn ngữ tự nhiên, giữ được ngữ cảnh đoạn hội thoại ngắn để phản hồi tự nhiên hơn. Tuy nhiên, giới hạn của Mức 2 là nó chỉ dừng ở việc trò chuyện: có thể tư vấn, giải thích, gợi ý, nhưng không tự đi thực hiện hành động nào ra bên ngoài, ví dụ không tự đặt vé, không tự truy vấn dữ liệu thời gian thực.

Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học. Mức 3 phản ứng với yêu cầu nghĩa là người dùng hỏi gì, bot tra cứu công cụ đó. Ví dụ, nếu bạn hỏi về thời tiết hôm nay, nó nhận diện đây là yêu cầu cần dữ liệu thời gian thực, tự động gọi một API thời tiết, rồi trả lời dựa trên kết quả nhận được. Nhưng lưu ý thật kỹ: nó không tự đặt ra lộ trình tiếp theo.

Ngược lại, ở Mức 4: Theo đuổi mục tiêu, hệ thống tự động sinh kế hoạch nhiều bước, hay multi-step plan, rồi tự thực thi vòng lặp quan sát, suy luận, hành động, viết tắt ReAct, cho đến khi đạt kết quả mong muốn. Ví dụ, nếu bạn giao một mục tiêu trừu tượng như "hãy tối ưu lịch trình bay và tự đặt vé cho tôi", nó sẽ tự phân rã thành nhiều bước nhỏ: tìm chuyến bay, so sánh giá, kiểm tra lịch, rồi tự đặt vé, và tự thử lại nếu gặp lỗi mà không cần con người mớm lệnh từng bước.

Ví dụ tổng hợp. Để dễ hình dung, hãy xét chung một tình huống: đặt vé máy bay. Ở Mức 1, hệ thống chỉ đưa bạn qua một menu bấm phím cố định. Ở Mức 2, bạn trò chuyện tự nhiên để hỏi thông tin, nhưng vẫn phải tự đặt vé. Ở Mức 3, nếu bạn yêu cầu cụ thể "hãy đặt giúp tôi chuyến bay lúc 8 giờ sáng", nó gọi công cụ đặt vé ngay lúc đó. Còn ở Mức 4, bạn chỉ cần giao mục tiêu tổng quát, hệ thống tự lên kế hoạch, tự đặt vé, tự sửa lỗi, không cần bạn hướng dẫn từng bước.

Kết luận. Bốn mức này giúp xem hệ thống được tự làm đến đâu trong khóa học, nói đã kiểm tra thì phải có bằng chứng đã làm thực tế. Ngay sau đây, các bạn sẽ làm một bài kiểm tra ngắn để tự đối chiếu xem mình đã nắm được ranh giới giữa các mức độ tự chủ này hay chưa.`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildWavHeader(pcmLength: number): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * BYTES_PER_SAMPLE, 28);
  header.writeUInt16LE(BYTES_PER_SAMPLE, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmLength, 40);
  return header;
}

async function synthesize(text: string): Promise<Buffer> {
  const res = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: text,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } } },
    },
  });
  const data = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) throw new Error('Không nhận được audio từ Gemini TTS.');
  return Buffer.from(data, 'base64');
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('[1/3] Sinh giọng đọc AI cho nội dung mẫu...');
  const pcm = await synthesize(SAMPLE_TEXT);
  const wav = Buffer.concat([buildWavHeader(pcm.length), pcm]);
  const wavPath = path.join(OUT_DIR, 'sample-audio.wav');
  fs.writeFileSync(wavPath, wav);
  const durationSeconds = pcm.length / (SAMPLE_RATE * BYTES_PER_SAMPLE);
  console.log(`      Đã tạo audio ${durationSeconds.toFixed(1)}s tại ${wavPath}`);

  console.log('[2/3] Ghép audio với nền màu tĩnh thành video MP4 (ffmpeg)...');
  const mp4Path = path.join(OUT_DIR, 'video-bai-giang-day03-du-can-cu.mp4');
  await execFileAsync(ffmpegPath as unknown as string, [
    '-y',
    '-f', 'lavfi',
    '-i', 'color=c=0x1e293b:s=1280x720:r=1',
    '-i', wavPath,
    '-c:v', 'libx264',
    '-tune', 'stillimage',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    mp4Path,
  ]);

  console.log('[3/3] Xong!');
  console.log(`\nVideo mẫu đã sẵn sàng tại:\n  ${mp4Path}`);
  console.log(`Thời lượng: ~${durationSeconds.toFixed(0)} giây`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
