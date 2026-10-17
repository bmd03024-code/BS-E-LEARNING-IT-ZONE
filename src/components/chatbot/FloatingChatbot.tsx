import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../../services/storage';
import { aiKnowledgeStore } from '../../services/aiKnowledgeStore';
import { MessageSquare, X, Send, Sparkles, Bot, User, Calculator, Globe, BookOpen, ExternalLink, Phone, MessageCircle, HelpCircle } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface WhatsAppButtonInfo {
  teacherName: string;
  designation: string;
  phone: string;
  whatsappUrl: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isMath?: boolean;
  isWiki?: boolean;
  isTeacherQA?: boolean;
  sourceBadge?: string;
  sourceUrl?: string;
  whatsappButtons?: WhatsAppButtonInfo[];
}

// Built-in arithmetic solver for BS Learning AI
const evaluateMathExpression = (expr: string): string | null => {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  let normalized = expr.replace(/[০-৯]/g, (match) => bnToEnMap[match] || match);

  normalized = normalized
    .replace(/যোগ/g, '+')
    .replace(/বিয়োগ|বিয়োগ/g, '-')
    .replace(/গুণ|গুন/g, '*')
    .replace(/ভাগ/g, '/')
    .replace(/বর্গমূল/g, 'sqrt')
    .replace(/এর/g, '*');

  const sqrtMatch = normalized.match(/(?:sqrt|রুট)\s*\(?(\d+(?:\.\d+)?)\)?/i);
  if (sqrtMatch) {
    const val = parseFloat(sqrtMatch[1]);
    const res = Math.sqrt(val);
    return `√${toBengaliNum(val)} এর বর্গমূল = ${toBengaliNum(res.toFixed(2).replace(/\.00$/, ''))}`;
  }

  const pctMatch = normalized.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|\*)\s*(\d+(?:\.\d+)?)/i) ||
                   normalized.match(/(\d+(?:\.\d+)?)\s*\*\s*(\d+(?:\.\d+)?)\s*%/i);
  if (pctMatch) {
    const p = parseFloat(pctMatch[1]);
    const total = parseFloat(pctMatch[2]);
    const ans = (p / 100) * total;
    return `${toBengaliNum(total)} এর ${toBengaliNum(p)}% = ${toBengaliNum(ans)}`;
  }

  const mathSanitized = normalized.replace(/[^0-9+\-*/().]/g, '');
  if (mathSanitized.length >= 3 && /[+\-*/]/.test(mathSanitized)) {
    try {
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

// Helper to format Bangladeshi phone numbers to international WhatsApp format
export const formatWhatsAppLink = (phone: string, text: string): string => {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  let fullNumber = digitsOnly;
  if (digitsOnly.startsWith('01')) {
    fullNumber = '88' + digitsOnly;
  } else if (!digitsOnly.startsWith('88') && digitsOnly.length === 11) {
    fullNumber = '88' + digitsOnly;
  }
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`;
};

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatbotSettings, setChatbotSettings] = useState(storage.getChatbot());
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      text: chatbotSettings.welcomeMessage || 'আসসালামু আলাইকুম! আমি "BS Learning & IT Zone"-এর নিজস্ব স্মার্ট এআই সহকারী।\n\nওয়েবসাইটের যেকোনো নোটিস, কোর্স ফি, পরীক্ষার রুটিন, ফলাফল অথবা যেকোনো শিক্ষকের সাথে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করতে আমাকে প্রশ্ন করুন। এছাড়া যেকোনো অংক ও উইকিপিডিয়া সাধারণ জ্ঞানও জানতে পারেন!',
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
        'প্রধান শিক্ষকের সাথে হোয়াটসঅ্যাপে কথা বলব',
        'কম্পিউটার কোর্সের ফি কত?',
        '২৫০ + ৩৫০ কত হয়?',
        'বাংলা কিউআর দিয়ে পেমেন্ট নিয়ম',
        'আইসিটি (ICT) কি?',
        'নতুন কোনো নোটিস আছে?'
      ];

  const handleSend = async (textToSend?: string) => {
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

    const lowerQuery = query.toLowerCase();

    // 1. Math calculation
    const mathResult = evaluateMathExpression(query);
    if (mathResult) {
      setTimeout(() => {
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
      }, 250);
      return;
    }

    // 2. Teacher-Specific WhatsApp Direct Connectivity Check
    const mentors = storage.getMentors();
    const isAskingForTeacher = 
      lowerQuery.includes('whatsapp') ||
      lowerQuery.includes('হোয়াটসঅ্যাপ') ||
      lowerQuery.includes('হোয়াটসঅ্যাপ') ||
      lowerQuery.includes('কথা বলতে চাই') ||
      lowerQuery.includes('যোগাযোগ') ||
      lowerQuery.includes('শিক্ষক') ||
      lowerQuery.includes('স্যার') ||
      lowerQuery.includes('টিচার');

    let matchedMentors = mentors.filter(m => {
      const nameParts = m.name.toLowerCase().split(/\s+/);
      return nameParts.some(part => part.length > 2 && lowerQuery.includes(part));
    });

    if (matchedMentors.length === 0 && isAskingForTeacher) {
      matchedMentors = mentors; // Show all teachers if user asked generally
    }

    if (matchedMentors.length > 0 && (isAskingForTeacher || lowerQuery.includes('নাম্বার') || lowerQuery.includes('ফোন'))) {
      const whatsappButtons: WhatsAppButtonInfo[] = matchedMentors.map(m => {
        const phone = m.whatsappNumber || m.phone || '01612118307';
        const msg = `আসসালামু আলাইকুম ${m.name} স্যার। আমি BS E-Learning & IT Zone ওয়েবসাইট থেকে যোগাযোগ করছি। আমি আপনার সাথে কথা বলতে চাই।`;
        return {
          teacherName: m.name,
          designation: m.designation,
          phone,
          whatsappUrl: formatWhatsAppLink(phone, msg)
        };
      });

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `📞 আমাদের শিক্ষক মণ্ডলীর সরাসরি হোয়াটসঅ্যাপ সংযোগ:\nনিচের যেকোনো শিক্ষকের নামের পাশে "হোয়াটসঅ্যাপে চ্যাট করুন" বাটনে ক্লিক করলে সরাসরি তাঁর ব্যক্তিগত হোয়াটসঅ্যাপ নাম্বারে চ্যাট শুরু হবে।`,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            whatsappButtons
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    // 3. Check Self-Learning Smart Knowledge Store (200,000+ words & Teacher-verified Q&As)
    const learnedResult = aiKnowledgeStore.searchLearnedAnswer(query);
    if (learnedResult) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: learnedResult.answer,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            isTeacherQA: true,
            sourceBadge: learnedResult.source
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    // 4. Paid Content Policy & Rule Filter (Strict Institutional Policy)
    const isAskingFreePaid = (
      (lowerQuery.includes('ফ্রি') || lowerQuery.includes('বিনামূল্যে') || lowerQuery.includes('free')) &&
      (lowerQuery.includes('কোর্স') || lowerQuery.includes('পেইড') || lowerQuery.includes('ম্যাটেরিয়াল') || lowerQuery.includes('সার্ভিস') || lowerQuery.includes('ক্লাস লিংক') || lowerQuery.includes('সাজেশন'))
    );
    const isAskingPaidDetails = lowerQuery.includes('পেইড') || lowerQuery.includes('প্রিমিয়াম') || lowerQuery.includes('paid');

    if (isAskingFreePaid || isAskingPaidDetails) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: `⚠️ পেইড কন্টেন্ট পলিসি (Paid Content Policy):\nএটি একটি "পেইড (Paid)" বিষয়। প্রতিষ্ঠানের কঠোর নীতিমালা অনুযায়ী কোনো পেইড কোর্স, প্রিমিয়াম স্টাডি ম্যাটেরিয়াল বা পেইড সার্ভিস ফ্রিতে প্রদান করা যাবে না।\n\n📌 যুক্ত হওয়ার নিয়মাবলী:\n১. হোম পেজে নির্দিষ্ট কোর্সটি নির্বাচন করুন।\n২. আমাদের ইন্টারঅপারেবল "বাংলা কিউআর (Bangla QR)" স্ক্যান করে ভর্তি ফি ও নিয়মিত মাসিক ফি পরিশোধ করুন।\n৩. পেমেন্টের ট্রানজেকশন আইডি (TrxID) দিয়ে আবেদন সাবমিট করলেই অ্যাডমিন যাচাই করে পেইড ক্লাসের পারমিশন ও স্টুডেন্ট আইডি প্রদান করবেন।`,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            sourceBadge: 'পেইড কন্টেন্ট পলিসি'
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    // 5. Institutional Database Check (Courses, Notices, Notes, Settings, Routines, Payment)
    const courses = storage.getCourses();
    const notices = storage.getNotices();
    const notes = storage.getNotes();
    const settings = storage.getSettings();
    const chatbotData = storage.getChatbot();

    let matchedAnswer: string | null = null;
    let sourceBadge: string | undefined;

    // A. Check Notices
    if (lowerQuery.includes('নোটিস') || lowerQuery.includes('বিজ্ঞপ্তি') || lowerQuery.includes('notice')) {
      const topNotices = notices.slice(0, 3).map((n, i) => `${i + 1}. ${n.title} (${n.date})`).join('\n');
      matchedAnswer = `📢 বর্তমান সক্রিয় নোটিসসমূহ:\n${topNotices}\n\nবিস্তারিত দেখতে হোম পেজের নোটিস বোর্ডে ক্লিক করুন।`;
      sourceBadge = 'অফিশিয়াল নোটিস বোর্ড';
    }
    // B. Check Free Notes
    else if (lowerQuery.includes('নোট') || lowerQuery.includes('সাজেশন') || lowerQuery.includes('note') || lowerQuery.includes('pdf')) {
      const topNotes = notes.slice(0, 3).map((n, i) => `${i + 1}. ${n.title} (${n.subject})`).join('\n');
      matchedAnswer = `📚 আমাদের ফ্রি নোট ও সাজেশনসমূহ:\n${topNotes}\n\nহোম পেজের "ফ্রি নোট ও সাজেশন" অপশন থেকে যেকোনো সময় ডাউনলোড করতে পারবেন।`;
      sourceBadge = 'ফ্রি রিসোর্স ও হ্যান্ডনোট';
    }
    // C. Check QR & Payment
    else if (lowerQuery.includes('কিউআর') || lowerQuery.includes('qr') || lowerQuery.includes('পেমেন্ট') || lowerQuery.includes('বিকাশ') || lowerQuery.includes('নগদ')) {
      matchedAnswer = `💳 পেমেন্ট নিয়মাবলী:\nআমাদের প্রতিষ্ঠানে "বাংলা কিউআর (Bangla QR)" ব্যবহৃত হয়। কোনো নির্দিষ্ট ফোন নম্বরে ক্যাশআউট না করে আপনার বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপ দিয়ে বাংলা কিউআর স্ক্যান করে সহজে পেমেন্ট করতে পারবেন। এরপর TrxID টি ফর্মে সাবমিট করলেই আবেদন স্বয়ংক্রিয়ভাবে প্রসেস হবে।`;
      sourceBadge = 'বাংলা কিউআর সিস্টেম';
    }
    // D. Check Specific Courses
    else {
      const matchedCourse = courses.find(c => lowerQuery.includes(c.title.toLowerCase()) || c.title.toLowerCase().includes(lowerQuery));
      if (matchedCourse) {
        matchedAnswer = `🎓 ${matchedCourse.title}:\n• মেয়াদ: ${matchedCourse.duration}\n• অফার ভর্তি ফি: ${toBengaliNum(matchedCourse.admissionFee)} টাকা\n• নিয়মিত মাসিক ফি: ${toBengaliNum(matchedCourse.monthlyFee)} টাকা\n• কোর্স বিবরণ: ${matchedCourse.description}`;
        sourceBadge = 'কোর্স ক্যাটালগ';
      }
    }

    // E. Check Admin Custom Info Blocks & 50,000 words text
    if (!matchedAnswer && chatbotData.infoBlocks && chatbotData.infoBlocks.length > 0) {
      for (const block of chatbotData.infoBlocks) {
        if (!block.isActive) continue;
        const blockTitle = block.title.toLowerCase();
        const matchesKeyword = block.keywords?.some(k => k.trim() && lowerQuery.includes(k.trim().toLowerCase()));
        if (matchesKeyword || lowerQuery.includes(blockTitle)) {
          matchedAnswer = `📌 [${block.title}]\n\n${block.content}`;
          sourceBadge = 'অ্যাডমিন তথ্য বক্স';
          break;
        }
      }
    }

    if (matchedAnswer) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: matchedAnswer!,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
            sourceBadge
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    // 5. Autonomous Wikipedia Integration (100% Free Knowledge Retrieval)
    try {
      const wikiRes = await fetch(`/api/wiki?q=${encodeURIComponent(query)}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.success && wikiData.extract) {
          setMessages((prev) => [
            ...prev,
            {
              id: `b-${Date.now()}`,
              sender: 'bot',
              text: `🌐 [উইকিপিডিয়া সাধারণ জ্ঞান: ${wikiData.title}]\n\n${wikiData.extract}`,
              timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
              isWiki: true,
              sourceBadge: 'উইকিপিডিয়া সাধারণ জ্ঞান',
              sourceUrl: wikiData.url
            }
          ]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Wiki offline or error, proceed to fallback
    }

    // 6. Intelligent Fallback with Teacher Direct Routing Option
    const borhanMentor = mentors.find(m => m.id === 'mentor-borhan') || mentors[0];
    const defaultWhatsApp = borhanMentor?.whatsappNumber || '01612118307';
    const fallbackWhatsAppUrl = formatWhatsAppLink(
      defaultWhatsApp,
      `আসসালামু আলাইকুম প্রধান শিক্ষক স্যার। আমার প্রশ্ন: "${query}"। অনুগ্রহ করে একটু বুঝিয়ে বলবেন কি?`
    );

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `ধন্যবাদ আপনার প্রশ্নের জন্য! এই নির্দিষ্ট বিষয়ে আরও বিস্তারিত জানতে বা শিক্ষকের সাথে সরাসরি পরামর্শ করতে নিচের বাটনে চাপ দিন। আপনার প্রশ্নটি শিক্ষকের সাথে সংযুক্ত করার পর সিস্টেম স্বয়ংক্রিয়ভাবে ভবিষ্যতে এই উত্তরটি মনে রাখবে।`,
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          whatsappButtons: [
            {
              teacherName: borhanMentor?.name || 'বোরহানউদ্দিন মহিম',
              designation: 'প্রতিষ্ঠাতা ও প্রধান শিক্ষক',
              phone: defaultWhatsApp,
              whatsappUrl: fallbackWhatsAppUrl
            }
          ]
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
            <span className="block text-[10px] text-amber-300 font-semibold leading-none mt-1">স্বয়ংক্রিয় শিখন ও হোয়াটসঅ্যাপ</span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="relative w-[340px] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
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
                <p className="text-[10px] text-amber-300 font-medium">স্বয়ংক্রিয় শিখন • শিক্ষক হোয়াটসঅ্যাপ • উইকিপিডিয়া</p>
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
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-900 text-white rounded-br-xs'
                      : msg.isMath
                      ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-bl-xs font-semibold'
                      : msg.isWiki
                      ? 'bg-sky-50 text-sky-950 border border-sky-300 rounded-bl-xs'
                      : msg.isTeacherQA
                      ? 'bg-amber-50/70 text-slate-900 border border-amber-300 rounded-bl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {msg.sourceBadge && (
                    <div className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold mb-1.5">
                      {msg.sourceBadge}
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Wikipedia External Link if present */}
                  {msg.sourceUrl && (
                    <a
                      href={msg.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 mt-2 underline"
                    >
                      <Globe className="w-3 h-3" />
                      <span>উইকিপিডিয়ায় বিস্তারিত পড়ুন</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {/* Teacher WhatsApp Direct Buttons */}
                  {msg.whatsappButtons && msg.whatsappButtons.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200">
                      {msg.whatsappButtons.map((btn, idx) => (
                        <a
                          key={idx}
                          href={btn.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                              <span className="block text-xs leading-none">{btn.teacherName}</span>
                              <span className="block text-[9px] text-emerald-100 leading-none mt-0.5">{btn.designation}</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] tracking-wide">
                            চ্যাট করুন &rarr;
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

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
                <span>এআই নলেজবেস ও উইকিপিডিয়া বিশ্লেষণ হচ্ছে...</span>
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
                placeholder="প্রশ্ন করুন বা শিক্ষকের সাথে কথা বলুন..."
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
