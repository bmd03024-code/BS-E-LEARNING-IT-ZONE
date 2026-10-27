import React, { useState, useEffect } from 'react';
import { HeroSlide } from '../../types';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';

interface HeroSliderProps {
  slides: HeroSlide[];
  onCtaClick: (action: string) => void;
  language?: 'bn' | 'en';
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onCtaClick, language = 'bn' }) => {
  const en = language === 'en';
  const translateText = (value?: string) => {
    if (!value || !en) return value;
    const phrases: Record<string, string> = {
      'স্বাগতম': 'Welcome',
      'BS E-Learning & IT Zone এ স্বাগতম': 'Welcome to BS E-Learning & IT Zone',
      'অভিজ্ঞ শিক্ষক মণ্ডলীর তত্ত্বাবধানে বেসিক টু অ্যাডভান্সড একাডেমিক ও স্কিল ডেভেলপমেন্ট কোর্স। গড়ে তুলুন আপনার সফল ভবিষ্যৎ।': 'Academic and skill-development courses from basic to advanced levels, guided by experienced instructors. Build a successful future.',
      'কোর্সসমূহ দেখুন': 'Explore Courses',
      'কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্স (৬ মাস)': 'Computer Office Applications Course (6 Months)',
      'প্র্যাকটিক্যাল ল্যাব ও অনলাইন সাপোর্টে সরকারি সার্টিফিকেট অর্জনের অনন্য সুযোগ! সীমিত আসনে স্পেশাল অফার মূল্যে ভর্তি চলছে।': 'Gain practical lab experience and online support. Enrollment is open for a limited-time offer.',
      'এখনই এনরোল করুন': 'Enroll Now',
      'সহীহ কুরআন ও স্পোকেন ইংলিশ স্পেশাল ব্যাচ': 'Quran Recitation & Spoken English Special Batch',
      'সহজ ও প্রাঞ্জল পদ্ধতিতে তাজবীদ সহ কুরআন তিলাওয়াত এবং ফ্লুয়েন্ট স্পোকেন ইংলিশ দক্ষতা অর্জন করুন ঘরে বসেই।': 'Learn Quran recitation with Tajweed and develop spoken English skills from home.',
      'মাসিক ফি ও রুটিন': 'Monthly Fees & Routine',
      'আধুনিক ডিজিটাল শিক্ষাসেবা': 'Modern Digital Education Services',
      'শুরু করুন': 'Get Started',
      'ক্লাস রুটিন দেখুন': 'View Class Routine',
      'আমাদের কোর্সসমূহ': 'Our Courses',
      'ভর্তি চলছে': 'Admissions Open'
    };
    return phrases[value.trim()] || value;
  };
  const activeSlides = slides.filter(s => s.active);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (currentIdx >= activeSlides.length) {
      setCurrentIdx(0);
    }
  }, [activeSlides.length, currentIdx]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  if (activeSlides.length === 0) return null;

  const current = activeSlides[currentIdx] || activeSlides[0];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 text-white select-none">
      {/* Background Image with layered gradient overlays */}
      <div className="relative min-h-[360px] sm:min-h-[460px] md:min-h-[520px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform scale-105"
          style={{ backgroundImage: `url(${current.image})` }}
        >
          {/* Multi-tier gradient overlay for readability and brand tone */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-blue-950/85 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/50 to-slate-950/90" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 w-full z-10">
          <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>BS E-Learning &amp; IT Zone • {en ? 'Modern Digital Education Services' : 'আধুনিক ডিজিটাল শিক্ষাসেবা'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
              {translateText(current.title)}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
              {translateText(current.subText)}
            </p>

            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => onCtaClick(current.ctaAction || 'courses')}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{translateText(current.ctaText) || (en ? 'Get Started' : 'শুরু করুন')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onCtaClick('routine')}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all"
              >
                <span>{en ? 'View Class Routine' : 'ক্লাস রুটিন দেখুন'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Previous / Next Navigation Arrows */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-xs border border-white/10 transition-all z-20"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-xs border border-white/10 transition-all z-20"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIdx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
