'use client';
import { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, ArrowRight, RotateCcw,
  GraduationCap, Wallet, FileText, ExternalLink, Heart
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FEATURE_TOPICS = [
  {
    icon: GraduationCap,
    title: 'Lịch nhập học các khoa',
    query: 'Lịch nhập học ngày nào, ở đâu?'
  },
  {
    icon: FileText,
    title: 'Hồ sơ giấy tờ cần chuẩn bị',
    query: 'Hồ sơ nhập học trực tiếp gồm những giấy tờ gì?'
  },
  {
    icon: Wallet,
    title: 'Mức học phí & Thời hạn nộp',
    query: 'Học phí mỗi học kỳ là bao nhiêu và nộp như thế nào?'
  }
];

const NORMAL_JOKES = [
  'Đội Tình Nguyện đang tra cứu cẩm nang cho bạn',
  'Đang tổng hợp thông tin chính xác nhất',
  'Tình nguyện viên đang kiểm tra lại dữ liệu phòng Đào tạo',
  'Chờ xíu nhé, câu trả lời đang được gửi đến ngay'
];

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Xin chào bạn! Mình là **AI Đội Thanh niên tình nguyện QNU** – trợ lý giải đáp thông tin tự động dành cho Tân sinh viên **Khóa 49** Trường Đại học Quy Nhơn.\n\nBạn có thể chọn nhanh các chủ đề phổ biến bên dưới hoặc nhập câu hỏi trực tiếp để chúng mình hướng dẫn chi tiết nhé!'
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Đổi câu loading nhanh hơn (mỗi 1.2s)
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setJokeIndex((prev) => (prev + 1) % NORMAL_JOKES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    
    // Chọn ngẫu nhiên 1 câu ngay khi gửi
    setJokeIndex(Math.floor(Math.random() * NORMAL_JOKES.length));
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
          { role: 'assistant', content: 'Hệ thống đang bận. Vui lòng gửi lại câu hỏi sau giây lát.' }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lỗi kết nối máy chủ. Vui lòng thử lại.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="flex justify-center h-screen bg-slate-100 text-slate-900 antialiased font-sans overflow-hidden">
      <main className="flex flex-col h-full w-full max-w-4xl bg-white border-x border-slate-200 shadow-sm relative">
        
        {/* Header */}
        <header className="h-16 px-4 md:px-6 border-b border-slate-200 bg-white flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-50 border border-blue-100 rounded-lg p-0.5 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo Đội TNTN QNU" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-[15px]">AI Đội Thanh Niên Tình Nguyện QNU</h1>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>Trợ lý hỗ trợ nhập học:</span>
                <span className="font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                  Tân Sinh Viên K49
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              title="Làm mới đoạn hội thoại"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Làm mới</span>
            </button>
          </div>
        </header>

        {/* Khung Nội Dung Chat */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth bg-slate-50/50">
          
          {/* Banner Giới Thiệu */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-white p-1 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Logo Đội TNTN" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Đội Thanh niên tình nguyện — Trường Đại học Quy Nhơn
                </h2>
                <p className="text-xs text-slate-200 font-normal mt-0.5">
                  Đồng hành và hỗ trợ tân sinh viên Khóa 49 trong suốt quá trình nhập học.
                </p>
              </div>
            </div>
            <a
              href="https://beacons.ai/doithanhnientinhnguyenqnu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium bg-white text-blue-900 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition flex-shrink-0 shadow-xs"
            >
              <span>Thông tin liên hệ Đội</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-md bg-blue-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`p-4 rounded-xl max-w-[85%] text-[14px] leading-relaxed relative ${
                  m.role === 'user'
                    ? 'bg-blue-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                }`}
              >
                {m.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2 [&>ul>li]:mb-1 [&>strong]:text-blue-950 [&>strong]:font-semibold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-line">{m.content}</span>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {/* 3 Thẻ Trọng Tâm */}
          {messages.length === 1 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Chủ đề tra cứu phổ biến:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {FEATURE_TOPICS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => sendMessage(item.query)}
                      disabled={loading}
                      className="p-3.5 rounded-lg bg-white border border-slate-200 hover:border-blue-900/40 hover:bg-slate-50 text-left transition flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-900 flex items-center justify-center flex-shrink-0">
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-medium text-slate-800 group-hover:text-blue-900 transition">
                          {item.title}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Khung Loading */}
          {loading && (
            <div className="flex items-center gap-3 bg-white w-fit max-w-[92%] py-2.5 px-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-6 h-6 flex-shrink-0 animate-spin">
                <img 
                  src="/logo.png" 
                  alt="Loading Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-1 font-medium text-xs text-slate-700">
                <span>{NORMAL_JOKES[jokeIndex]}</span>
                <span className="inline-flex items-center gap-0.5 ml-1 text-blue-900 font-bold">
                  <span className="inline-block animate-bounce [animation-delay:-0.3s]">.</span>
                  <span className="inline-block animate-bounce [animation-delay:-0.15s]">.</span>
                  <span className="inline-block animate-bounce">.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Khung Nhập Liệu & Chân Trang */}
        <div className="p-4 md:p-5 bg-white border-t border-slate-200">
          <form onSubmit={handleFormSubmit} className="relative flex items-center">
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:bg-white transition"
              placeholder="Nhập câu hỏi cần giải đáp (lịch nhập học, hồ sơ, học phí...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-blue-900 hover:bg-blue-800 text-white rounded-md active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition cursor-pointer"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Dòng Chân Trang */}
          <div className="mt-3 text-center">
            <p className="text-[12px] text-slate-500 font-normal flex items-center justify-center gap-1.5 flex-wrap">
              <span>Được xây dựng bởi</span>
              <span className="font-semibold text-slate-700">obi.pu08</span>
              <Heart size={11} className="text-rose-500 fill-rose-500 inline" />
              <span>và hỗ trợ bởi</span>
              <a 
                href="https://beacons.ai/doithanhnientinhnguyenqnu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-900 hover:text-blue-700 underline underline-offset-4 transition"
              >
                Đội Thanh niên tình nguyện Trường Đại học Quy Nhơn
              </a>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}