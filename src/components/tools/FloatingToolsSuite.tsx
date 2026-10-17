import React, { useState } from 'react';
import { Calculator, BookOpen, MessageCircle, Bot, Sparkles, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ScientificCalculatorModal } from './ScientificCalculatorModal';
import { OxfordDictionaryModal } from './OxfordDictionaryModal';
import { FloatingWhatsAppModal } from './FloatingWhatsAppModal';
import { storage } from '../../services/storage';

export const FloatingToolsSuite: React.FC = () => {
  const [calcOpen, setCalcOpen] = useState(false);
  const [dictOpen, setDictOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const settings = storage.getSettings();
  const rawPhone = settings.hotline || settings.phone || '01612118307';
  const cleanPhone = rawPhone.replace(/[^\d]/g, '');
  const waNumber = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  return (
    <>
      {/* Floating Action Buttons Stack (Positioned vertically on right edge / bottom right) */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-2.5 select-none no-print">
        
        {/* Toggle Collapse/Expand Button for mobile cleanliness */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-700/80 flex items-center justify-center shadow-md transition-all sm:hidden"
          title={isExpanded ? 'টুলবার ছোট করুন' : 'টুলবার বড় করুন'}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            
            {/* 1. WhatsApp Direct Contact Button */}
            <div className="group relative flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 whitespace-nowrap">
                WhatsApp যোগাযোগ
              </span>
              <button
                onClick={() => setWaOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-900/30 border-2 border-emerald-300/80 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 relative"
                aria-label="WhatsApp Contact"
              >
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
              </button>
            </div>

            {/* 2. Oxford Dictionary Button */}
            <div className="group relative flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 whitespace-nowrap">
                অক্সফোর্ড ডিকশনারি
              </span>
              <button
                onClick={() => setDictOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-xl shadow-amber-900/30 border-2 border-amber-300/80 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 relative"
                aria-label="Oxford Dictionary"
              >
                <BookOpen className="w-5 h-5 text-white" />
                <span className="absolute -bottom-1 -left-1 px-1 rounded-full bg-slate-950 text-[8px] font-black uppercase text-amber-300 border border-amber-400">
                  Dict
                </span>
              </button>
            </div>

            {/* 3. Scientific Calculator Button */}
            <div className="group relative flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700 whitespace-nowrap">
                সায়েন্টিফিক ক্যালকুলেটর
              </span>
              <button
                onClick={() => setCalcOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl shadow-purple-900/30 border-2 border-purple-300/80 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 relative"
                aria-label="Scientific Calculator"
              >
                <Calculator className="w-5 h-5 text-white" />
                <span className="absolute -bottom-1 -left-1 px-1 rounded-full bg-slate-950 text-[8px] font-black uppercase text-indigo-300 border border-indigo-400">
                  Calc
                </span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Modals for each Floating Tool */}
      <ScientificCalculatorModal
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
      />

      <OxfordDictionaryModal
        isOpen={dictOpen}
        onClose={() => setDictOpen(false)}
      />

      <FloatingWhatsAppModal
        isOpen={waOpen}
        onClose={() => setWaOpen(false)}
      />
    </>
  );
};
