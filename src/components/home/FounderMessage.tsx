import React from 'react';
import { InstituteSettings } from '../../types';
import { Award, Quote, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

interface FounderMessageProps {
  settings: InstituteSettings;
  onExploreCourses: () => void;
}

export const FounderMessage: React.FC<FounderMessageProps> = ({ settings, onExploreCourses }) => {
  return (
    <section id="founder-section" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>প্রতিষ্ঠাতা ও ম্যানেজমেন্ট পরিচিতি</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            প্রতিষ্ঠাতা ও পরিচালনা পরিষদ
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            BS E-Learning &amp; IT Zone-এর সুযোগ্য নেতৃত্ব ও দিকনির্দেশনা
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white shadow-xl overflow-hidden border border-blue-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            {/* Left Photo & Badges */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 opacity-75 blur-sm group-hover:opacity-100 transition duration-300" />
                
                <div className="relative w-56 sm:w-64 md:w-72 aspect-4/5 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl bg-slate-800">
                  <img
                    src={settings.founderPhotoUrl}
                    alt={settings.founderName}
                    className="w-full h-full object-cover object-top filter brightness-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 inset-x-3 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-bold tracking-wide">
                      প্রতিষ্ঠাতা ও প্রধান শিক্ষক
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-wide">
                  {settings.founderName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                  {settings.founderTitle}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-amber-400/90 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>BS E-Learning &amp; IT Zone ম্যানেজমেন্ট</span>
                </div>
              </div>
            </div>

            {/* Right Speech, Signature & Stamp */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                <Quote className="w-3.5 h-3.5 text-amber-400" />
                <span>প্রতিষ্ঠাতা ও প্রধান শিক্ষকের অফিসিয়াল বার্তা</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                "জ্ঞান ও প্রযুক্তির আলোয় গড়ে উঠুক প্রতিটি ভবিষ্যৎ"
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal text-justify">
                {settings.founderSpeech}
              </p>

              {/* Core Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ব্যক্তিগত তদারকি ও নিয়মিত পরীক্ষা</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>সরকারি মানসম্পন্ন আইটি সার্টিফিকেট</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>সহীহ কুরআন শিক্ষায় ফ্রি সনদপত্র</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>অনলাইন ও অফলাইন সহায়তার সুব্যবস্থা</span>
                </div>
              </div>

              {/* Scanned Official Signature and Seal Preview */}
              <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/90 p-1.5 rounded-lg border border-slate-300/40 shadow-xs">
                    <img
                      src={settings.signatureUrl}
                      alt="স্বাক্ষর"
                      className="h-10 sm:h-12 w-auto object-contain"
                    />
                    <div className="text-[9px] text-slate-800 text-center font-bold">স্বাক্ষরিত</div>
                  </div>

                  <div className="bg-white/90 p-1 rounded-full border border-emerald-400/50 shadow-xs">
                    <img
                      src={settings.institutionSealUrl}
                      alt="সিল"
                      className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                    />
                  </div>
                </div>

                <button
                  onClick={onExploreCourses}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md"
                >
                  চলমান কোর্সসমূহ দেখুন
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
