import { useCallback, useEffect, useRef, useState } from 'react';

export interface NarrationItem {
  id: string;
  text: string;
}

// Đọc transcript thật bằng giọng nói của trình duyệt (Web Speech API) thay vì audio dựng sẵn:
// không tốn quota TTS server-side, và đảm bảo audio luôn khớp 100% với đúng text đang hiển thị
// vì trình duyệt phát trực tiếp từ chính chuỗi text đó tại thời điểm phát.
export function useSpeechNarration() {
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!isSupported) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current = voices.find(v => v.lang.toLowerCase().startsWith('vi')) ?? null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setActiveId(null);
  }, [isSupported]);

  // onFinish chỉ được gọi khi phát hết tự nhiên (không phải do stop() cắt ngang), để phân biệt
  // "đã nghe hết" với "bỏ dở giữa chừng" — dùng để mở khoá các bước tiếp theo trong luồng học.
  const speak = useCallback(
    (items: NarrationItem[], onFinish?: () => void) => {
      if (!isSupported || items.length === 0) return;
      cancelledRef.current = false;
      window.speechSynthesis.cancel();
      setIsPlaying(true);
      items.forEach((item, idx) => {
        const utterance = new SpeechSynthesisUtterance(item.text);
        utterance.lang = 'vi-VN';
        if (voiceRef.current) utterance.voice = voiceRef.current;
        utterance.onstart = () => setActiveId(item.id);
        if (idx === items.length - 1) {
          utterance.onend = () => {
            setIsPlaying(false);
            setActiveId(null);
            if (!cancelledRef.current) onFinish?.();
          };
        }
        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported]
  );

  return { isSupported, isPlaying, activeId, speak, stop };
}
