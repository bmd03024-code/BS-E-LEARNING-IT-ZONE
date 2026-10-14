import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../../services/storage';
import { MessageSquare, X, Send, Sparkles, Bot, User, Calculator, Globe, BookOpen } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isMath?: boolean;
}

// Built-in arithmetic solver for BS Learning AI
const evaluateMathExpression = (expr: string): string | null => {
  // Convert Bengali numerals to English numerals for calculation
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  let normalized = expr.replace(/[০-৯]/g, (match) => bnToEnMap[match] || match);

  // Replace Bangla operators with standard math symbols
  normalized = normalized
    .replace(/যোগ/g, '+')
    .replace(/বিয়োগ|বিয়োগ/g, '-')
    .replace(/গুণ|গুন/g, '*')
    .replace(/ভাগ/g, '/')
    .replace(/বর্গমূল/g, 'sqrt')
    .replace(/এর/g, '*');

  // Check for square root: sqrt(X) or root X
  const sqrtMatch = normalized.match(/(?:sqrt|রুট)\s*\(?(\d+(?:\.\d+)?)\)?/i);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    const res = Math.sqrt(val);
    return `√${toBengaliNum(val)} এর বর্গমূল = ${toBengaliNum(res.toFixed(2).replace(/\.00$/, ''))}`;
  }

  // Check for percentage: X% of Y or X এর Y%
  const pctMatch = normalized.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|\*)\s*(\d+(?:\.\d+)?)/i) ||
                   normalized.match(/(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)\s*%/i);
  if (pctMatch) {
    const p = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const ans = (p / 100) * total;
    return `${toBengaliNum(total)} এর ${toBengaliNum(p)}% = ${toBengaliNum(ans)}`;
  }

  // Check for basic arithmetic e.g. 50 + 20, 100 * 5, (20 + 30) / 2
  const mathSanitized = normalized.replace(/[^0-9+\-*/().]/g, '');
  if (mathSanitized.length >= 3 && /[+\-*/]/.test(mathSanitized)) {
    try {
      // Safe evaluation using Function with strict bounds
      const sanitized = mathSanitized.replace(/[^0-9+\-*/().\s]/g, '');
      const result = new Function(`return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return `গণিত সমাধান:\n${toBengaliNum(mathSanitized)} = ${toBengaliNum(Number(result.toFixed(4)).toString())}`;
      }
    } catch {
      return null;
    }
  }

  return null;
};

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatbotSettings, setChatbotSettings] = useState(storage.getChatbot());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync with storage updates when admin edits chatbot
  useEffect(() => {
    const handleSync = () => {
      setChatbotSettings(storage.getChatbot());
    };
    window.addEventListener('bs_sync', handleSync);
    return () => window.removeEventListener('bs_sync', handleSync);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: chatbotSettings.welcomeMessage || 'আসসালামু আলাইকুম! আমি "BS Learning & IT Zone"-এর নিজস্ব স্মার্ট এআই সহকারী।\n\nওয়েবসাইটের যেকোনো নোটিস, হ্যান্ডনোট, পরীক্ষার রুটিন, কোর্স ফি জানতে আমাকে প্রশ্ন করতে পারেন। এছাড়া আমার কাছে যেকোনো গণিত বা অংক (যোগ, বিয়োগ, গুণ, ভাগ, রুট) সমাধান করিয়ে নিতে পারেন!',
      timestamp: 'এখন'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickChips = chatbotSettings.quickChips && chatbotSettings.quickChips.length > 0
    ? chatbotSettings.quickChips
    : [
        'কম্পিউটার কোর্সের ফি কত?',
        '২৫০ + ৩৫০ কত হয়?',
        'বাংলা কিউআর দিয়ে পেমেন্ট নিয়ম',
        'সহীহ কুরআন শিক্ষার ক্লাস সময়',
        '√৬২৫ এর বর্গমূল কত?',
        'নতুন কোনো নোটিস আছে?'
      ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      // 1. Check if user is asking for Math Calculation
      const mathResult = evaluateMathExpression(query);
      if (mathResult) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `🧮 ${mathResult}`,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            isMath: true
          }
        ]);
        setLoading(false);
        return;
      }

      // 2. Read live website data (Courses, Notices, Notes, Routines, Settings, KnowledgeBase)
      const courses = storage.getCourses();
      const notices = storage.getNotices();
      const notes = storage.getNotes();
      const routines = storage.getRoutines();
      const settings = storage.getSettings();
      const chatbotData = storage.getChatbot();

      const lowerQuery = query.toLowerCase();
      let matchedAnswer: string | null = null;

      // 3. Search Admin's Custom Info Blocks (Module 15)
      if (chatbotData.infoBlocks && chatbotData.infoBlocks.length > 0) {
        for (const block of chatbotData.infoBlocks) {
          if (!block.isActive) continue;
          const blockTitle = block.title.toLowerCase();
          const matchesKeyword = block.keywords?.some(k => k.trim() && lowerQuery.includes(k.trim().toLowerCase()));
          const titleWords = blockTitle.split(/[\s,–-]+/).filter(w => w.length > 2);
          const matchesTitle = titleWords.some(w => lowerQuery.includes(w));
          const queryIncludesTitle = lowerQuery.includes(blockTitle);

          if (matchesKeyword || queryIncludesTitle || matchesTitle) {
            matchedAnswer = `📌 [${block.title}]\n\n${block.content}`;
            break;
          }
        }
      }

      // 4. Search Admin's Large 50,000-Word Knowledge Base Text
      if (!matchedAnswer && chatbotData.knowledgeBaseText) {
        const sections = chatbotData.knowledgeBaseText.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
        const queryTerms = lowerQuery.split(/[\s,?!;।]+/).filter(w => w.length > 1);

        let bestSection = '';
        let highestMatches = 0;

        for (const sec of sections) {
          const lowerSec = sec.toLowerCase();
          let matchCount = 0;
          for (const term of queryTerms) {
            if (lowerSec.includes(term)) {
              matchCount++;
            }
          }
          if (matchCount > highestMatches) {
            highestMatches = matchCount;
            bestSection = sec;
          }
        }

        // If at least 2 words match or section strongly relevant
        if (highestMatches >= 2 && bestSection) {
          matchedAnswer = bestSection;
        } else if (highestMatches === 1 && bestSection && queryTerms.length <= 3) {
          matchedAnswer = bestSection;
        }
      }

      // 5. Check notices
      if (!matchedAnswer && (lowerQuery.includes('নোটিস') || lowerQuery.includes('বিজ্ঞপ্তি') || lowerQuery.includes('notice'))) {
        const topNotices = notices.slice(0, 3).map((n, i) => `${i + 1}. ${n.title} (${n.date})`).join('\n');
        matchedAnswer = `📢 বর্তমান সক্রিয় নোটিসসমূহ:\n${topNotices}\n\nবিস্তারিত দেখতে হোম পেজের নোটিস বোর্ডে ক্লিক করুন।`;
      }
      // 6. Check free notes
      else if (!matchedAnswer && (lowerQuery.includes('নোট') || lowerQuery.includes('সাজেশন') || lowerQuery.includes('note') || lowerQuery.includes('pdf'))) {
        const topNotes = notes.slice(0, 3).map((n, i) => `${i + 1}. ${n.title} (${n.subject})`).join('\n');
        matchedAnswer = `📚 আমাদের ফ্রি নোট ও সাজেশনসমূহ:\n${topNotes}\n\nহোম পেজের "ফ্রি নোট ও সাজেশন" অপশন থেকে যেকোনো সময় পিডিএফ ডাউনলোড করতে পারবেন।`;
      }
      // 7. Check QR / Payment
      else if (!matchedAnswer && (lowerQuery.includes('কিউআর') || lowerQuery.includes('qr') || lowerQuery.includes('পেমেন্ট') || lowerQuery.includes('বিকাশ') || lowerQuery.includes('নগদ'))) {
        matchedAnswer = `💳 পেমেন্ট তথ্য:\nআমাদের প্রতিষ্ঠানে "বাংলা কিউআর (Bangla QR)"-এর মাধ্যমে পেমেন্ট গ্রহণ করা হয়। কোনো নির্দিষ্ট ফোন নম্বর ছাড়াই যেকোনো ব্যাংক অ্যাপ বা বিকাশ/নগদ দিয়ে কিউআর স্ক্যান করে পেমেন্ট করতে পারবেন। এরপর TrxID সাবমিট করলেই আবেদন প্রসেস হবে।`;
      }
      // 8. Check specific courses dynamically
      else if (!matchedAnswer) {
        const matchedCourse = courses.find(c => lowerQuery.includes(c.title.toLowerCase()) || c.title.toLowerCase().includes(lowerQuery));
        if (matchedCourse) {
          matchedAnswer = `🎓 ${matchedCourse.title}:\n• কোর্স মেয়াদ: ${matchedCourse.duration}\n• অফার ভর্তি ফি: ${toBengaliNum(matchedCourse.admissionFee)} টাকা\n• নিয়মিত মাসিক ফি: ${toBengaliNum(matchedCourse.monthlyFee)} টাকা\n• কোর্স বিবরণ: ${matchedCourse.description}`;
        }
      }

      // 9. Match custom FAQs in storage
      if (!matchedAnswer) {
        for (const faq of chatbotData.faqs || []) {
          if (faq.question.toLowerCase().includes(lowerQuery) || lowerQuery.includes(faq.question.toLowerCase())) {
            matchedAnswer = faq.answer;
            break;
          }
          if (faq.keywords && faq.keywords.some(k => lowerQuery.includes(k.toLowerCase()))) {
            matchedAnswer = faq.answer;
            break;
          }
        }
      }

      // Fallback: General Education knowledge or Founder guidance
      if (!matchedAnswer) {
        if (lowerQuery.includes('প্রধান শিক্ষক') || lowerQuery.includes('বোরহানউদ্দিন') || lowerQuery.includes('মহিম') || lowerQuery.includes('প্রতিষ্ঠাতা')) {
          matchedAnswer = `${settings.name}-এর প্রতিষ্ঠাতা ও প্রধান শিক্ষক হলেন জনাব ${settings.founderName}। তিনি দীর্ঘ ১০+ বছর ধরে সফলভাবে হাজারো শিক্ষার্থীকে জিপিএ-৫ ও দক্ষ জনশক্তিতে রূপান্তর করেছেন।`;
        } else {
          matchedAnswer = `ধন্যবাদ আপনার বার্তার জন্য! ${chatbotData.botName || 'BS Learning AI'}-এর কাছে আপনি যেকোনো কোর্স, ভর্তি ফি, নোটিস, রুটিন বা গাণিতিক সমস্যার জন্য প্রশ্ন করতে পারেন।`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: matchedAnswer,
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
    }, 350);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 select-none no-print">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl hover:shadow-blue-900/40 border-2 border-amber-400 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open Dedicated Chatbot"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold leading-none text-white">{chatbotSettings.botName || 'BS নিজস্ব স্মার্ট AI'}</span>
            <span className="block text-[10px] text-amber-300 font-semibold leading-none mt-1">অংক সমাধান ও তথ্য</span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="relative w-[340px] sm:w-[410px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{chatbotSettings.botName || 'BS Learning নিজস্ব এআই'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h4>
                <p className="text-[10px] text-amber-300 font-medium">লাইভ ডাটা রিডার • বিল্ট-ইন ক্যালকুলেটর</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="grow overflow-y-auto p-4 space-y-3.5 bg-slate-50 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-900 text-white rounded-br-xs'
                      : msg.isMath
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-bl-xs font-semibold'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-900" />
                <span>উত্তর বিশ্লেষণ হচ্ছে...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips bar */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 text-[11px] font-semibold transition-colors shrink-0 border border-slate-200"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="প্রশ্ন করুন বা অংক লিখুন (যেমন: ২৫ * ৪০)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="grow px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white transition-colors shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4 text-amber-400" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
