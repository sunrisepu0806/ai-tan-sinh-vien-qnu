'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Heart, Bot, User, ArrowRight, GraduationCap, Building2, Wallet, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FEATURE_CARDS = [
  {
    icon: GraduationCap,
    title: 'Lịch nhập học theo khoa',
    query: 'Khoa Công nghệ thông tin nhập học ngày nào, ở đâu?',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: FileText,
    title: 'Hồ sơ cần chuẩn bị',
    query: 'Hồ sơ nhập học trực tiếp gồm những giấy tờ gì?',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Wallet,
    title: 'Học phí & Học bổng',
    query: 'Học phí mỗi học kỳ là bao nhiêu?',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Building2,
    title: 'Ký túc xá & Chỗ ở',
    query: 'Hướng dẫn đăng ký Ký túc xá và giá phòng?',
    color: 'from-amber-500 to-orange-500'
  }
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào bạn tân sinh viên Khóa 49! 👋\n\nMình là Trợ lý AI hỗ trợ giải đáp thông tin trường. Bạn có thể chọn nhanh các chủ đề bên dưới hoặc nhập trực tiếp câu hỏi nhé!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Hệ thống đang bận. Bạn vui lòng thử lại sau giây lát!' }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lỗi kết nối máy chủ. Vui lòng thử lại!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex justify-center h-screen bg-[#0F172A] text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Khung trung tâm */}
      <main className="flex flex-col h-full w-full max-w-4xl bg-slate-900 border-x border-slate-800 shadow-2xl relative">
        
        {/* Header Tối Giản Cao Cấp */}
        <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-slate-100 text-[15px] tracking-wide">Trợ Lý Tân Sinh Viên QNU</h1>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">K49</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                <span>obi.pu</span>
                <Heart size={10} className="text-rose-500 fill-rose-500 inline" />
                <span className="text-slate-300 font-medium">Đội thanh niên tình nguyện QNU</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">Trực tuyến</span>
          </div>
        </header>

        {/* Nội Dung Chat */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-blue-600/20">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-[85%] text-[14px] leading-relaxed transition-all ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-md font-normal'
                    : 'bg-slate-800/90 text-slate-200 rounded-tl-xs border border-slate-700/60 shadow-sm'
                }`}
              >
                {m.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ul>li]:mb-1 [&>strong]:text-blue-400 [&>strong]:font-semibold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-line">{m.content}</span>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Hiển thị thẻ gợi ý nếu mới bắt đầu cuộc trò chuyện */}
          {messages.length === 1 && (
            <div className="pt-2">
              <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-400" />
                Chủ đề thường gặp:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FEATURE_CARDS.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => sendMessage(card.query)}
                      disabled={loading}
                      className="group p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 text-left transition-all flex items-center justify-between cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-sm`}>
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white transition">
                          {card.title}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2.5 text-slate-400 text-xs pl-2 bg-slate-800/40 w-fit py-2 px-3.5 rounded-full border border-slate-700/40">
              <Bot size={15} className="animate-spin text-blue-400" />
              <span>AI đang tra cứu tài liệu và tổng hợp câu trả lời...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Khung Nhập Liệu Phía Dưới */}
        <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800/80">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <input
              type="text"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3.5 pr-14 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
              placeholder="Đặt câu hỏi về lịch nhập học, hồ sơ, ký túc xá, học phí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition shadow-md cursor-pointer"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Footer Sub-credit */}
          <div className="mt-3 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <span>obi.pu</span>
              <span>love</span>
              <Heart size={10} className="text-rose-500 fill-rose-500 inline" />
              <span>Đội thanh niên tình nguyện QNU</span>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}