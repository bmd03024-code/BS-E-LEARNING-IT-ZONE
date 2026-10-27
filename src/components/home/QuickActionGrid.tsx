import React from 'react';
import { ShortcutItem } from '../../types';
import {
  BookOpen,
  Bell,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Ticket,
  CreditCard,
  BarChart3,
  Award,
  FileText,
  PlayCircle,
  Users,
  PhoneCall,
  Sparkles,
  GraduationCap,
  Radio
} from 'lucide-react';

interface QuickActionGridProps {
  shortcuts: ShortcutItem[];
  onActionClick: (target: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-6 h-6" />,
  Bell: <Bell className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
  Image: <ImageIcon className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  Ticket: <Ticket className="w-6 h-6" />,
  CreditCard: <CreditCard className="w-6 h-6" />,
  BarChart3: <BarChart3 className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  FileText: <FileText className="w-6 h-6" />,
  PlayCircle: <PlayCircle className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  PhoneCall: <PhoneCall className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Radio: <Radio className="w-6 h-6" />,
};

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ shortcuts, onActionClick }) => {
  const enabledShortcuts = shortcuts.filter(s => s.enabled);

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ইন্টারঅ্যাক্টিভ শর্টকাট হাব</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">
              কুইক অ্যাকশন ও স্টুডেন্ট সার্ভিসেস
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              এক ক্লিকে সকল সেবা: ভর্তি, রুটিন, এডমিট কার্ড, মাসিক ফি, রেজাল্ট ও সনদপত্র
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 hidden sm:block">
            মোট ১৩টি সরাসরি অ্যাকশন মডিউল
          </div>
        </div>

        {/* 13 Item Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
          {enabledShortcuts.map((item) => (
            <button
              key={item.id}
              onClick={() => onActionClick(item.target)}
              className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-lg transition-all duration-200 text-center hover:-translate-y-1 active:translate-y-0"
            >
              {/* Optional badge */}
              {item.badge && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white shadow-xs">
                  {item.badge}
                </span>
              )}

              {/* Icon with gradient badge */}
              <div
                className={`quick-action-icon w-12 h-12 rounded-full flex items-center justify-center text-white mb-2.5 shadow-md bg-gradient-to-br ${
                  item.color || 'from-blue-600 to-indigo-700'
                } group-hover:scale-110 transition-transform`}
              >
                {iconMap[item.iconName] || <BookOpen className="w-6 h-6" />}
              </div>

              {/* Title */}
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-900 leading-tight">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
