import React from 'react';
import { InstituteSettings } from '../../types';
import { Logo } from './Logo';
import { Phone, Mail, MapPin, Globe, Sparkles } from 'lucide-react';

interface FooterProps {
  settings: InstituteSettings;
  onOpenAdminLogin: () => void;
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdminLogin, onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 py-4 px-4 sm:px-6 border-b border-slate-800 text-center text-xs sm:text-sm text-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold">{settings.welcomeText}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Col 1: Institute Brand & Speech Snippet */}
          <div className="lg:col-span-4 space-y-4">
            <div className="brightness-110">
              <Logo
                size="md"
                showText={true}
                customLogoUrl={settings.logoUrl}
                textSize={settings.headerTextSize}
                instituteName={settings.name}
                subName={settings.subName}
                founderName={settings.founderName}
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {settings.footerText || 'BS E-Learning & IT Zone — আধুনিক একাডেমিক শিক্ষা ও প্র্যাকটিক্যাল আইটি স্কিল অর্জনের বিশ্বস্ত প্রতিষ্ঠান। অভিজ্ঞ শিক্ষক মণ্ডলী এবং ডিজিটাল ল্যাব সাপোর্ট।'}
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div>
                প্রতিষ্ঠাতা ও প্রধান শিক্ষক: <b className="text-amber-400">{settings.founderName}</b>
              </div>
              <div>অফিশিয়াল হেল্পলাইন: <b className="text-white font-mono">{settings.hotline}</b></div>
              {settings.footerNotice && (
                <div className="text-[11px] text-amber-300/80 pt-1">
                  * {settings.footerNotice}
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-blue-600/30 hover:bg-blue-600 text-white flex items-center justify-center transition-colors text-xs font-bold"
                  title="Facebook"
                >
                  f
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-red-600/30 hover:bg-red-600 text-white flex items-center justify-center transition-colors text-xs font-bold"
                  title="YouTube"
                >
                  ▶
                </a>
              )}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors text-xs font-bold"
                  title="TikTok"
                >
                  ♫
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="hover:text-amber-400 transition-colors"
                >
                  সকল কোর্সসমূহ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('founder')}
                  className="hover:text-amber-400 transition-colors"
                >
                  প্রতিষ্ঠাতা ও ম্যানেজমেন্ট
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('routine')}
                  className="hover:text-amber-400 transition-colors"
                >
                  লাইভ ক্লাস রুটিন
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fee')}
                  className="hover:text-amber-400 transition-colors"
                >
                  মাসিক ফি পেমেন্ট
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admit')}
                  className="hover:text-amber-400 transition-colors"
                >
                  এডমিট কার্ড ডাউনলোড
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marksheet')}
                  className="hover:text-amber-400 transition-colors"
                >
                  ফলাফল ও মার্কশিট
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('certificate')}
                  className="hover:text-amber-400 transition-colors"
                >
                  সনদপত্র উত্তোলন
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              যোগাযোগ ও ঠিকানা
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-white">{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-mono text-slate-300 break-all">{settings.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>অনলাইন প্ল্যাটফর্ম: ২৪/৭ সক্রিয়</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Google Map Embed */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              আমাদের অবস্থান
            </h4>
            <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
              <iframe
                src={settings.mapEmbedUrl}
                title="Google Map"
                className="w-full h-full border-0 filter grayscale-20 contrast-120"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            {settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.name}. সর্বস্বত্ব সংরক্ষিত।`}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdminLogin}
              className="text-slate-400 hover:text-amber-400 font-semibold transition-colors"
            >
              🔒 অ্যাডমিন পোর্টাল লগইন
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
