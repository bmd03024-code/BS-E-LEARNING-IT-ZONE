import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { Clock, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, BookOpen, Layers } from 'lucide-react';

interface CoursesSectionProps {
  courses: Course[];
  onEnrollCourse: (course: Course) => void;
}

// Convert English numbers to Bengali numerals
export const toBengaliNum = (num: number | string): string => {
  const bnNums: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return String(num).replace(/[0-9]/g, (match) => bnNums[match] || match);
};

export const CoursesSection: React.FC<CoursesSectionProps> = ({ courses, onEnrollCourse }) => {
  // Live countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 14,
    minutes: 36,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="courses-section" className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>নির্ধারিত কোর্স ফি ও বিশেষ অফার প্যাকেজ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            আমাদের অফিশিয়াল কোর্সসমূহ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            দক্ষ শিক্ষক মণ্ডলী, মানসম্মত সিলেবাস ও নিয়মিত পরীক্ষার মাধ্যমে শতভাগ সাফল্যের নিশ্চয়তা
          </p>
        </div>

        {/* Global Offer Countdown Banner */}
        <div className="mb-10 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-400/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 hidden sm:block">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                সীমিত সময়ের বিশেষ ভর্তি অফার চলছে!
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-0.5">
                কাটা মূল্যে স্পেশাল ছাড়ে এখনই এনরোল করুন
              </h3>
            </div>
          </div>

          {/* Real-time countdown clock */}
          <div className="flex items-center gap-2 sm:gap-3 text-center">
            <div className="bg-black/40 border border-white/20 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[54px]">
              <span className="block text-lg sm:text-2xl font-black text-amber-400">
                {toBengaliNum(timeLeft.days)}
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">দিন</span>
            </div>
            <span className="text-amber-400 font-bold">:</span>
            <div className="bg-black/40 border border-white/20 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[54px]">
              <span className="block text-lg sm:text-2xl font-black text-amber-400">
                {toBengaliNum(timeLeft.hours)}
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">ঘণ্টা</span>
            </div>
            <span className="text-amber-400 font-bold">:</span>
            <div className="bg-black/40 border border-white/20 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[54px]">
              <span className="block text-lg sm:text-2xl font-black text-amber-400">
                {toBengaliNum(timeLeft.minutes)}
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">মিনিট</span>
            </div>
            <span className="text-amber-400 font-bold">:</span>
            <div className="bg-black/40 border border-white/20 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 min-w-[54px]">
              <span className="block text-lg sm:text-2xl font-black text-amber-400">
                {toBengaliNum(timeLeft.seconds)}
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">সেকেন্ড</span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const hasDiscount = !!(course.originalAdmissionFee && course.originalAdmissionFee > course.admissionFee);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Course Header & Badges */}
                <div className="p-5 sm:p-6 pb-4">
                  {/* Course Thumbnail / Logo */}
                  {course.logoUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-200 relative">
                      <img
                        src={course.logoUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-900/90 text-white backdrop-blur-xs">
                        {course.category}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    {!course.logoUrl && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                        {course.category}
                      </span>
                    )}
                    {course.hasGovtCert && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        সরকারি সনদ
                      </span>
                    )}
                    {course.certificateFee === 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        সনদ ফ্রি
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>মেয়াদ: {course.duration}</span>
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Pricing Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-slate-600">ভর্তি ফি:</span>
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-xs sm:text-sm line-through text-slate-400 font-medium">
                            {toBengaliNum(course.originalAdmissionFee!)}৳
                          </span>
                        )}
                        <span className="text-base sm:text-lg font-extrabold text-blue-900">
                          {toBengaliNum(course.admissionFee)} টাকা
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-200 text-xs">
                      <span className="text-slate-600 font-medium">মাসিক ফি:</span>
                      <span className="font-bold text-emerald-700">
                        {course.monthlyFee > 0 ? `${toBengaliNum(course.monthlyFee)} টাকা / মাস` : 'মাসিক ফি নেই'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-slate-200 text-[11px]">
                      <span className="text-slate-500">সনদ ফি:</span>
                      <span className="font-semibold text-slate-700">
                        {course.certificateFee === 0 ? 'সম্পূর্ণ ফ্রি' : `${toBengaliNum(course.certificateFee)} টাকা`}
                      </span>
                    </div>
                  </div>

                  {/* Subjects pill if available */}
                  {course.subjects && course.subjects.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                        <Layers className="w-3 h-3 text-blue-800" />
                        <span>পাঠ্য বিষয়সমূহ:</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {course.subjects.slice(0, 3).map((sub, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-medium border border-blue-100">
                            {sub}
                          </span>
                        ))}
                        {course.subjects.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-bold">
                            +{course.subjects.length - 3}টি
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Highlights Bullet List */}
                  <div className="mt-4 space-y-1.5">
                    {course.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 sm:p-5 pt-0 mt-2">
                  <button
                    onClick={() => onEnrollCourse(course)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-sm hover:shadow-md transition-all group-hover:bg-gradient-to-r group-hover:from-blue-900 group-hover:to-indigo-900"
                  >
                    <span>এনরোল করুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
