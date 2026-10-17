import React, { useState } from 'react';
import { X, MessageCircle, Send, Phone, User, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { storage } from '../../services/storage';

interface FloatingWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingWhatsAppModal: React.FC<FloatingWhatsAppModalProps> = ({ isOpen, onClose }) => {
  const settings = storage.getSettings();
  const mentors = storage.getMentors();
  const borhanMentor = mentors.find(m => m.id === 'mentor-borhan') || mentors[0];
  
  // Format WhatsApp clean phone number (Bangladesh: 8801...)
  const rawPhone = borhanMentor?.whatsappNumber || settings.hotline || settings.phone || '01612118307';
  const cleanPhone = rawPhone.replace(/[^\d]/g, '');
  const waNumber = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  const [message, setMessage] = useState<string>('আসসালামু আলাইকুম। BS E-Learning & IT Zone সম্পর্কে তথ্য ও সহায়তার জন্য যোগাযোগ করছি।');

  if (!isOpen) return null;

  const quickMessages = [
    'আসসালামু আলাইকুম। নতুন ব্যাচে ভর্তির নিয়ম ও কোর্স ফি জানতে চাই।',
    'কম্পিউটার অফিস অ্যাপ্লিকেশন (৬ মাস) কোর্সের শিডিউল জানতে চাই।',
    'সহীহ কুরআন শিক্ষা কোর্সে কীভাবে এনরোল করব?',
    'এডমিট কার্ড বা সনদপত্র বিষয়ক জরুরি সহায়তা প্রয়োজন।'
  ];

  const handleOpenWhatsApp = (customText?: string) => {
    const textToSend = customText || message;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(textToSend)}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs select-none no-print">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-inner relative">
              <MessageCircle className="w-6 h-6 text-emerald-200" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                  WhatsApp সরাসরি যোগাযোগ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-emerald-950">
                  Online
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                প্রধান শিক্ষক ও মেন্টরদের সাথে সরাসরি চ্যাট ও তাৎক্ষণিক সমাধান
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Teacher Profile Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3.5">
            <img
              src={settings.founderPhotoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80"}
              alt={settings.founderName}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
            />
            <div className="grow">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black text-slate-900">{settings.founderName}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] font-semibold text-emerald-800">{settings.founderTitle}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-700" />
                  <b className="font-mono">{rawPhone}</b>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Clock className="w-3 h-3" /> সার্বক্ষণিক সক্রিয়
                </span>
              </div>
            </div>
          </div>

          {/* Quick Questions Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              দ্রুত বিষয় নির্বাচন করুন:
            </label>
            <div className="space-y-1.5">
              {quickMessages.map((msg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(msg)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs text-slate-700 transition-colors flex items-center justify-between group"
                >
                  <span className="line-clamp-1">{msg}</span>
                  <span className="text-[10px] text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    বাছাই করুন &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              আপনার বার্তা বা প্রশ্ন:
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="আপনার বার্তাটি লিখুন..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>WhatsApp এ সরাসরি চ্যাট শুরু করুন</span>
            </button>

            <a
              href={`tel:${rawPhone}`}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>সরাসরি কল করুন: {rawPhone}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span>BS E-Learning &amp; IT Zone</span>
          <span className="font-bold text-emerald-800">অফিশিয়াল হেল্পডেস্ক</span>
        </div>
      </div>
    </div>
  );
};
