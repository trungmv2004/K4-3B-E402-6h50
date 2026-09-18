<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d11ad89e-9ccd-4d1f-bae1-c3829b607f72

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env](.env) to your Gemini API key
3. Run the app (frontend + AI backend on the same port):
   `npm run dev`
4. Open http://localhost:3000

## Kiến trúc AI

Toàn bộ lời gọi Gemini chạy phía server (`server.ts`, Express) theo đúng khai báo
`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` trong `metadata.json` — API key không bao giờ lộ ra
trình duyệt. Frontend gọi 3 endpoint qua `src/services/api.ts`:

- `POST /api/quiz/generate` — đọc transcript, quyết định transcript có đủ căn cứ kiến thức để
  sinh quiz an toàn hay không (nhánh Graceful Fallback nếu không đủ), rồi sinh 3 câu hỏi tình
  huống có trích dẫn ngược (grounding quote + timestamp) từ đúng transcript.
- `POST /api/quiz/grade` — đối chiếu lựa chọn của học viên với transcript để quyết định đúng/sai
  kèm độ tin cậy; khi AI không đủ tự tin, trả về `needsReview` cùng các mốc thời gian liên quan
  thay vì kết luận chắc chắn.
- `POST /api/tutor/chat` — AI Tutor hội thoại, chỉ trả lời trong phạm vi transcript bài giảng.

Build production: `npm run build` (bundle frontend bằng Vite, bundle server bằng esbuild ra
`server.js`), sau đó chạy `npm run start`.

## Đăng nhập & vai trò

Ứng dụng có đăng nhập theo vai trò (session cookie + mật khẩu băm bcrypt, lưu trong
`data/users.json` — tự sinh tài khoản demo ở lần chạy đầu, không commit lên git):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Giáo viên | `giaovien@vinuni.edu.vn` | `giaovien123` |
| Học viên | `hocsinh1@vinuni.edu.vn` | `hocsinh123` |
| Học viên | `hocsinh2@vinuni.edu.vn` | `hocsinh123` |

- **Giáo viên**: vào trang "Bảng điều khiển Giáo viên" để tải video bài giảng lên, bấm "Trích
  transcript" (Gemini nghe trực tiếp audio trong video qua File API, không dùng dịch vụ
  speech-to-text riêng) rồi bấm "Sinh Quiz" (dùng lại đúng pipeline AI ở trên).
- **Học viên**: vào "Chọn bài giảng để học" — chọn bài giảng mẫu có sẵn (giọng đọc AI) hoặc một
  video giáo viên đã tải lên và sinh quiz xong, rồi học theo đúng luồng 4 màn hình (xem hết
  video → làm quiz → chấm & đối chiếu → fallback nếu cần).

Video tải lên lưu trong `uploads/` (gitignored, phục vụ qua `/uploads/videos/...`).
