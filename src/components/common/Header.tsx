import React from 'react';
import { Logo } from './Logo';
import { Shield, PhoneCall, Award, BookOpen, Calendar, HelpCircle, Users } from 'lucide-react';

interface HeaderProps {
  onOpenAdminLogin: () => void;
  onNavigate: (section: string) => void;
  hotline: string;
  logoUrl?: string;
  headerTextSize?: 'normal' | 'large' | 'extra-large';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdminLogin,
  onNavigate,
  hotline,
  logoUrl,
  headerTextSize
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-slate-100 text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ভর্তি চলছে
            </span>
            <span className="truncate max-w-[200px] sm:max-w-none text-slate-200">
              ২০২৬ শিক্ষাবর্ষে সকল কোর্সে স্পেশাল অফার ফি-তে ভর্তি চলছে!
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs ml-auto">
            <a
              href={`tel:${hotline}`}
              className="inline-flex items-center gap-1.5 font-medium text-amber-300 hover:text-amber-200 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>হটলাইন: {hotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="cursor-pointer shrink-0" onClick={() => onNavigate('home')}>
            <Logo
              size="md"
              showText={true}
              customLogoUrl={logoUrl}
              textSize={headerTextSize}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('courses')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-blue-800" />
              কোর্সসমূহ
            </button>
            <button
              onClick={() => onNavigate('founder')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5 text-blue-900 font-bold"
            >
              <Award className="w-4 h-4 text-amber-500" />
              প্রতিষ্ঠাতা ও ম্যানেজমেন্ট
            </button>
            <button
              onClick={() => onNavigate('routine')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-blue-800" />
              ক্লাস রুটিন
            </button>
            <button
              onClick={() => onNavigate('fee')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5 text-emerald-800 font-bold"
            >
              মাসিক ফি / পেমেন্ট
            </button>
            <button
              onClick={() => onNavigate('marksheet')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
            >
              ফলাফল
            </button>
            <button
              onClick={() => onNavigate('certificate')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5 text-amber-700 font-bold"
            >
              সনদপত্র
            </button>
            <button
              onClick={() => onNavigate('mentors')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-900 hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-slate-600" />
              শিক্ষকবৃন্দ
            </button>
          </nav>

          {/* Right Action: Admin Panel Protected Entry Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('chatbot')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              title="BS AI সহকারী"
            >
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <span>স্মার্ট AI</span>
            </button>

            <button
              onClick={onOpenAdminLogin}
              className="relative group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-200 border border-blue-800/40 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide">Admin Panel</span>
              <span className="hidden xl:inline text-[10px] py-0.5 px-1.5 bg-amber-400/20 text-amber-300 rounded font-normal">লগইন</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
