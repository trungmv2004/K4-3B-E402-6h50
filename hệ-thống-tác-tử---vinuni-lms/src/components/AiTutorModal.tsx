import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { TranscriptSnippet } from '../types';
import { tutorChat } from '../services/api';

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcript: TranscriptSnippet[];
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({ isOpen, onClose, transcript }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Mình là AI Tutor đồng hành cùng bạn trong khóa học VinUni AI in Action. Bạn có thắc mắc gì về 4 mức độ tự chủ của AI Agent, vòng lặp ReAct, hoặc cách phân biệt Tool vs API không?',
      timestamp: 'Vừa xong'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Giải thích sự khác nhau giữa Mức 3 và Mức 4?',
    'Tool-use là gì trong mô hình ReAct?',
    'Tại sao hệ thống lại kích hoạt Fallback khi transcript ngắn?'
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputVal;
    if (!q.trim() || isTyping) return;

    const history = messages;
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      const { reply } = await tutorChat(transcript, history, q);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: err instanceof Error ? err.message : 'AI Tutor không phản hồi được lúc này. Vui lòng thử lại.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col h-[560px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">AI Tutor Đồng Hành (VinUni)</h3>
              <p className="text-[11px] text-purple-100">Hỗ trợ giải đáp ngữ cảnh bài giảng &amp; Quiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`block text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-500" />
              <span>AI Tutor đang đối chiếu transcript và soạn câu trả lời...</span>
            </div>
          )}
        </div>

        {/* Quick prompt recommendations */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex gap-1.5 shrink-0">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Đặt câu hỏi về bài giảng..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
