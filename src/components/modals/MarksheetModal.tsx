import React, { useState, useMemo, useEffect } from 'react';
import { Course, ResultRecord } from '../../types';
import { storage } from '../../services/storage';
import {
  X,
  BarChart3,
  Search,
  Printer,
  AlertCircle,
  Award,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface MarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

// Convert Bengali numerals to English numerals for 100% resilient search
const toEnglishNum = (str: string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return (str || '').replace(/[০-৯]/g, d => String(banglaDigits.indexOf(d))).trim();
};

// String normalization helper (removes extra spaces, lowercase)
const normalize = (str: string): string => {
  return (str || '').toLowerCase().replace(/\s+/g, '').trim();
};

export const MarksheetModal: React.FC<MarksheetModalProps> = ({ isOpen, onClose, courses }) => {
  // 1. Academic Year
  const [academicYear, setAcademicYear] = useState('2026');

  // 2. Course
  const [courseId, setCourseId] = useState(courses[0]?.id || 'course-computer-office');

  // 3. Exam Type
  const [examType, setExamType] = useState('মিড-টার্ম অ্যাসেসমেন্ট');
  const [isCustomExam, setIsCustomExam] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');

  // 4. Student Roll
  const [roll, setRoll] = useState('101');
  const [isCustomRoll, setIsCustomRoll] = useState(false);
  const [customRollInput, setCustomRollInput] = useState('');

  // Search Results States
  const [foundResult, setFoundResult] = useState<ResultRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'unpublished' | 'not_found'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0] || {
    id: courseId,
    title: 'নির্বাচিত কোর্স',
    subjects: [],
    exams: []
  };

  // Get all results and students from storage
  const [allResults, setAllResults] = useState<ResultRecord[]>(() => storage.getResults());
  const [allStudents, setAllStudents] = useState(() => storage.getStudents());

  useEffect(() => {
    if (isOpen) {
      setAllResults(storage.getResults());
      setAllStudents(storage.getStudents());
    }
  }, [isOpen]);

  // Dynamically extract available exam types for the selected course and academic year
  const availableExamsForCourse = useMemo(() => {
    const listFromResults = allResults
      .filter(r => r.academicYear === academicYear && (courseId ? r.courseId === courseId : true))
      .map(r => r.examType.trim())
      .filter(Boolean);

    const listFromCourse = (selectedCourse.exams || []).map(e => e.trim()).filter(Boolean);

    const standardPresets = [
      'মিড-টার্ম অ্যাসেসমেন্ট',
      'সেমিস্টার ফাইনাল পরীক্ষা',
      'মাসিক মূল্যায়ন পরীক্ষা',
      'মডেল টেস্ট ২০২৬',
      'চূড়ান্ত মূল্যায়ন পরীক্ষা',
      'বার্ষিক মূল্যায়ন পরীক্ষা',
      'সাপ্তাহিক টেস্ট'
    ];

    // Merge unique options prioritizing published results first
    const unique = Array.from(new Set([...listFromResults, ...listFromCourse, ...standardPresets]));
    return unique;
  }, [allResults, academicYear, courseId, selectedCourse]);

  // Dynamically extract student rolls for the selected course and academic year
  const availableRollsForCourse = useMemo(() => {
    const map = new Map<string, string>();

    // 1. First add students who have results in this course & year
    allResults
      .filter(r => r.academicYear === academicYear && r.courseId === courseId)
      .forEach(r => {
        const engRoll = toEnglishNum(r.roll);
        if (engRoll && !map.has(engRoll)) {
          map.set(engRoll, r.studentName || `শিক্ষার্থী রোল ${toBengaliNum(engRoll)}`);
        }
      });

    // 2. Also add students registered in student roster for this course & year
    allStudents
      .filter(s => s.academicYear === academicYear && s.courseId === courseId)
      .forEach(s => {
        const engRoll = toEnglishNum(s.roll);
        if (engRoll && !map.has(engRoll)) {
          map.set(engRoll, s.name || `শিক্ষার্থী রোল ${toBengaliNum(engRoll)}`);
        }
      });

    const rollsArray = Array.from(map.entries()).map(([rNum, sName]) => ({
      roll: rNum,
      name: sName
    }));

    // Sort by numerical roll
    rollsArray.sort((a, b) => (parseInt(a.roll, 10) || 0) - (parseInt(b.roll, 10) || 0));
    return rollsArray;
  }, [allResults, allStudents, academicYear, courseId]);

  // When Course or Academic Year changes, auto-adjust Exam Type and Roll if needed
  useEffect(() => {
    if (availableRollsForCourse.length > 0) {
      // If current roll is not in the list, default to first available
      const hasCurrent = availableRollsForCourse.some(item => item.roll === roll);
      if (!hasCurrent && !isCustomRoll) {
        setRoll(availableRollsForCourse[0].roll);
      }
    }

    if (availableExamsForCourse.length > 0) {
      const hasCurrentExam = availableExamsForCourse.includes(examType);
      if (!hasCurrentExam && !isCustomExam) {
        setExamType(availableExamsForCourse[0]);
      }
    }
  }, [courseId, academicYear, availableRollsForCourse, availableExamsForCourse]);

  if (!isOpen) return null;

  // Search execution
  const executeSearch = (targetYear: string, targetCourse: string, targetExam: string, targetRoll: string) => {
    setSearched(true);

    const cleanRoll = toEnglishNum(targetRoll);
    const cleanExam = targetExam.trim();

    if (!cleanRoll) {
      setSearchStatus('not_found');
      setStatusMessage('অনুগ্রহ করে শিক্ষার্থীর রোল নম্বর নির্বাচন বা প্রদান করুন।');
      setFoundResult(null);
      return;
    }

    if (!cleanExam) {
      setSearchStatus('not_found');
      setStatusMessage('অনুগ্রহ করে পরীক্ষার ধরণ নির্বাচন করুন।');
      setFoundResult(null);
      return;
    }

    const normSearchExam = normalize(cleanExam);

    // Find in results
    const currentResults = storage.getResults();
    const matchedRecord = currentResults.find(r => {
      const isRollMatch = toEnglishNum(r.roll) === cleanRoll;
      const isYearMatch = r.academicYear === targetYear;
      const isCourseMatch = r.courseId === targetCourse;
      const normRecExam = normalize(r.examType);
      const isExamMatch =
        normRecExam === normSearchExam ||
        normRecExam.includes(normSearchExam) ||
        normSearchExam.includes(normRecExam);
      return isRollMatch && isYearMatch && isCourseMatch && isExamMatch;
    });

    if (matchedRecord) {
      if (matchedRecord.published) {
        setFoundResult(matchedRecord);
        setSearchStatus('found');
        setStatusMessage('');
      } else {
        setFoundResult(null);
        setSearchStatus('unpublished');
        setStatusMessage(
          `রোল ${toBengaliNum(cleanRoll)}-এর "${matchedRecord.examType}" পরীক্ষার ফলাফল ডাটাবেজে সংরক্ষিত রয়েছে, কিন্তু এডমিন প্যানেল থেকে এখনও এটি পাবলিশ করা হয়নি।`
        );
      }
    } else {
      // Check if student has results in this course for a different exam
      const otherExams = currentResults
        .filter(r => toEnglishNum(r.roll) === cleanRoll && r.academicYear === targetYear && r.courseId === targetCourse)
        .map(r => r.examType);

      setFoundResult(null);
      setSearchStatus('not_found');

      if (otherExams.length > 0) {
        setStatusMessage(
          `রোল ${toBengaliNum(cleanRoll)}-এর "${cleanExam}" পরীক্ষার ফলাফল পাওয়া যায়নি। তবে এই শিক্ষার্থীর "${otherExams.join(', ')}" পরীক্ষার ফলাফল প্রকাশিত আছে। পরীক্ষার ধরণ পরিবর্তন করে সার্চ করুন।`
        );
      } else {
        setStatusMessage(
          `প্রদত্ত শিক্ষাবর্ষ (${toBengaliNum(targetYear)}), কোর্স, পরীক্ষার ধরণ ("${cleanExam}") ও রোল নম্বরের (${toBengaliNum(cleanRoll)}) কোনো ফলাফল পাওয়া যায়নি।`
        );
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeExam = isCustomExam ? customExamInput.trim() : examType.trim();
    const activeRoll = isCustomRoll ? customRollInput.trim() : roll.trim();
    executeSearch(academicYear, courseId, activeExam, activeRoll);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeDisplayExam = isCustomExam ? customExamInput : examType;
  const activeDisplayRoll = isCustomRoll ? customRollInput : roll;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-4 sm:p-6 shrink-0 relative border-b border-amber-400/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>অফিশিয়াল ফলাফল ও একাডেমিক মার্কশিট পোর্টাল</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            একাডেমিক ফলাফল ও নম্বরপত্র (Marksheet / Grade Sheet)
          </h2>
          <p className="text-xs text-slate-300">
            শিক্ষাবর্ষ, কোর্স, পরীক্ষার ধরণ ও রোল সিলেক্ট করে সার্চ বাটনে চাপ দিন
          </p>
        </div>

        {/* 4 Required Select Fields Form: Academic Year, Course, Exam Type, Student Roll */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* 1. Academic Year Select */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] inline-flex items-center justify-center">১</span>
                <span>শিক্ষাবর্ষ সিলেক্ট করুন *</span>
              </label>
              <div className="relative">
                <select
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value);
                    setSearched(false);
                  }}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-slate-300 hover:border-blue-700 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                >
                  <option value="2026">২০২৬ শিক্ষাবর্ষ</option>
                  <option value="2025">২০২৫ শিক্ষাবর্ষ</option>
                  <option value="2024">২০২৪ শিক্ষাবর্ষ</option>
                  <option value="2023">২০২৩ শিক্ষাবর্ষ</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Course Select */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] inline-flex items-center justify-center">২</span>
                <span>কোর্স সিলেক্ট করুন *</span>
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setSearched(false);
                  }}
                  className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-slate-300 hover:border-blue-700 text-xs font-bold bg-white truncate focus:ring-2 focus:ring-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Exam Type Select */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] inline-flex items-center justify-center">৩</span>
                  <span>পরীক্ষার ধরণ সিলেক্ট করুন *</span>
                </span>
              </label>
              {!isCustomExam ? (
                <div className="relative">
                  <select
                    value={examType}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomExam(true);
                        setCustomExamInput('');
                      } else {
                        setExamType(e.target.value);
                      }
                      setSearched(false);
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-blue-600 text-xs font-bold bg-white text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    {availableExamsForCourse.map((ex, idx) => (
                      <option key={idx} value={ex}>
                        {ex}
                      </option>
                    ))}
                    <option value="__custom__">✏️ অন্য পরীক্ষার নাম লিখুন...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-blue-900 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    required
                    placeholder="পরীক্ষার নাম লিখুন..."
                    value={customExamInput}
                    onChange={(e) => {
                      setCustomExamInput(e.target.value);
                      setSearched(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-blue-600 text-xs font-bold bg-white text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomExam(false);
                      if (availableExamsForCourse[0]) setExamType(availableExamsForCourse[0]);
                    }}
                    className="px-2 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-[10px] font-bold text-slate-700"
                    title="তালিকা থেকে সিলেক্ট করুন"
                  >
                    তালিকা
                  </button>
                </div>
              )}
            </div>

            {/* 4. Student Roll Select */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-blue-950 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[10px] inline-flex items-center justify-center">৪</span>
                  <span>রোল সিলেক্ট করুন *</span>
                </span>
                {isCustomRoll && (
                  <button
                    type="button"
                    onClick={() => setIsCustomRoll(false)}
                    className="text-[10px] text-blue-800 underline font-semibold"
                  >
                    ড্রপডাউন
                  </button>
                )}
              </label>

              {!isCustomRoll ? (
                <div className="relative">
                  <select
                    value={roll}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomRoll(true);
                        setCustomRollInput('');
                      } else {
                        setRoll(e.target.value);
                      }
                      setSearched(false);
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border-2 border-blue-600 text-xs font-bold bg-white text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-hidden appearance-none cursor-pointer"
                  >
                    {availableRollsForCourse.length > 0 ? (
                      availableRollsForCourse.map((item) => (
                        <option key={item.roll} value={item.roll}>
                          রোল {toBengaliNum(item.roll)} - {item.name}
                        </option>
                      ))
                    ) : (
                      <option value="101">রোল ১০১ (ডেমো রেকর্ড)</option>
                    )}
                    <option value="__custom__">✏️ অন্য রোল নম্বর লিখুন...</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-blue-900 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    required
                    placeholder="রোল নম্বর (যেমন: 101)"
                    value={customRollInput}
                    onChange={(e) => {
                      setCustomRollInput(e.target.value);
                      setSearched(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-blue-600 text-xs font-bold bg-white text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomRoll(false)}
                    className="px-2 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-[10px] font-bold text-slate-700"
                    title="তালিকা থেকে সিলেক্ট করুন"
                  >
                    তালিকা
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Action Row: Search Button & Quick Select Badges */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                <span>জনপ্রিয় পরীক্ষার ধরণ:</span>
              </span>
              {availableExamsForCourse.slice(0, 3).map((presetExam, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsCustomExam(false);
                    setExamType(presetExam);
                    setSearched(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    !isCustomExam && examType === presetExam
                      ? 'bg-blue-900 text-amber-300 shadow-xs'
                      : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-300'
                  }`}
                >
                  {presetExam}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFormSubmit}
              className="py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 hover:from-blue-800 hover:to-indigo-800 text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-900/30 active:scale-95 cursor-pointer shrink-0 border border-amber-400/30"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>ফলাফল ও মার্কশিট দেখুন</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Marksheet Render Area */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-4 bg-slate-100/50">
          {foundResult ? (
            <div className="space-y-4">
              {/* Official Marksheet Document (Printable Area) */}
              <div className="printable-area relative bg-white border-4 border-blue-950 p-6 sm:p-8 rounded-2xl shadow-xl overflow-hidden space-y-4 text-slate-900">
                {/* Subtle Center Watermark with Institute Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none">
                  {(settings.watermarkUrl || settings.logoUrl) ? (
                    <img
                      src={settings.watermarkUrl || settings.logoUrl}
                      alt="Watermark"
                      className="w-80 h-80 object-contain filter grayscale"
                    />
                  ) : (
                    <div className="w-80 h-80 rounded-full border-8 border-dashed border-slate-900 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-5xl font-black text-slate-950">BS ZONE</span>
                      <span className="text-sm font-bold text-slate-800 mt-1">E-LEARNING &amp; IT</span>
                    </div>
                  )}
                </div>

                {/* Institution Header */}
                <div className="relative z-10 text-center pb-4 border-b-2 border-blue-950 space-y-1">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-950 p-0.5 bg-slate-900 shrink-0">
                      <img
                        src={settings.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="grow text-center">
                      <h3 className="text-xl sm:text-2xl font-black text-blue-950 tracking-wide uppercase">
                        {settings.name}
                      </h3>
                      <p className="text-xs text-slate-700 font-bold">
                        {settings.subName || 'দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি'}
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {settings.address} | হটলাইন: {settings.hotline} | ইমেইল: {settings.email}
                      </p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-950 text-amber-300 font-black text-[11px] uppercase tracking-wider">
                        ACADEMIC TRANSCRIPT
                      </span>
                    </div>
                  </div>

                  {/* Document Title & Prominent Exam Type Banner */}
                  <div className="pt-2 text-center space-y-1">
                    <div className="inline-block px-5 py-1 rounded-full bg-blue-950 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                      অফিশিয়াল একাডেমিক মার্কশিট (MARKSHEET / GRADE REPORT)
                    </div>

                    <div className="mt-1 flex items-center justify-center">
                      <div className="bg-amber-100 border border-amber-400/80 px-4 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-950 shrink-0" />
                        <span className="text-xs sm:text-sm font-black text-blue-950">
                          Exam Type: <span className="text-rose-900 underline underline-offset-2">{foundResult.examType}</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 ml-1">
                          (শিক্ষাবর্ষ: {toBengaliNum(foundResult.academicYear)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs sm:text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-300">
                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">Student Name:</span>
                    <span className="font-extrabold text-slate-950">{foundResult.studentName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">রোল নম্বর:</span>
                    <span className="font-black text-blue-950 font-mono text-base">{foundResult.roll}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">Father’s Name:</span>
                    <span className="font-bold text-slate-900">{foundResult.fatherName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">Mother’s Name:</span>
                    <span className="font-bold text-slate-900">{foundResult.motherName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">কোর্সের নাম:</span>
                    <span className="font-extrabold text-blue-900">
                      {courses.find(c => c.id === foundResult.courseId)?.title || selectedCourse.title}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-blue-900 font-bold shrink-0">পরীক্ষার ধরণ:</span>
                    <span className="font-extrabold text-blue-950 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {foundResult.examType}
                    </span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">শিক্ষাবর্ষ / সেশন:</span>
                    <span className="font-semibold text-slate-800">{toBengaliNum(foundResult.academicYear)} সেশন</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">অনুমোদন স্ট্যাটাস:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>এডমিন প্যানেল কর্তৃক অনুমোদিত ও প্রকাশিত</span>
                    </span>
                  </div>
                </div>

                {/* Subject Marks Table */}
                <div className="relative z-10 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-blue-950 text-white border border-blue-950">
                        <th className="py-2.5 px-3 border border-slate-700 font-bold text-center w-12">ক্রম</th>
                        <th className="py-2.5 px-3 border border-slate-700 font-bold">বিষয় / মডিউলের নাম</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">পূর্ণমান</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">প্রাপ্ত নম্বর</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">লেটার গ্রেড</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">গ্রেড পয়েন্ট (GPA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foundResult.marks.map((m, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-slate-500">
                            {toBengaliNum(idx + 1)}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                            {m.subject}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono">
                            {toBengaliNum(m.total)}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono font-black text-blue-950 text-sm">
                            {toBengaliNum(m.obtained)}
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-black">
                            <span className={m.grade === 'A+' ? 'text-emerald-700' : 'text-slate-900'}>
                              {m.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold">
                            {m.gpa.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-blue-950 text-xs sm:text-sm">
                        <td colSpan={2} className="py-2.5 px-3 border border-slate-300 font-extrabold text-blue-950">
                          সর্বমোট প্রাপ্ত নম্বর ও ফলাফল
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center font-mono font-bold">
                          {toBengaliNum(foundResult.marks.reduce((acc, cur) => acc + cur.total, 0))}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center font-mono font-black text-emerald-800 text-sm sm:text-base">
                          {toBengaliNum(foundResult.totalMarks)}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800 font-black text-sm">
                          {foundResult.grade}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800 font-black text-sm font-mono">
                          {foundResult.gpa.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Final Result Summary Badge */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-black text-emerald-950 block">
                        Final Assessment Result: PASSED
                      </span>
                      <span className="text-xs text-emerald-800 font-bold">
                        GPA: {foundResult.gpa.toFixed(2)} | Letter Grade: {foundResult.grade} | Exam: {foundResult.examType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 text-xs font-semibold block">
                      Issue Date: {foundResult.date}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      VERIFIED ONLINE RECORD
                    </span>
                  </div>
                </div>

                {/* Scanned Official Seals & Signature */}
                <div className="relative z-10 mt-6 pt-4 border-t-2 border-slate-300 flex items-end justify-between">
                  {/* Institutional Seal */}
                  <div className="flex flex-col items-center">
                    <img
                      src={settings.institutionSealUrl}
                      alt="Institutional Seal"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-600 mt-0.5">Institutional Seal</span>
                  </div>

                  {/* Head Teacher Signature Seal */}
                  {settings.signatureSealUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.signatureSealUrl}
                        alt="Principal's Seal"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                      />
                      <span className="text-[9px] font-bold text-rose-800 mt-0.5">Principal's Seal</span>
                    </div>
                  )}

                  {/* Founder Signature */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <img
                        src={settings.signatureUrl}
                        alt="Principal's Signature"
                        className="h-10 sm:h-12 w-auto object-contain"
                      />
                    </div>
                    <div className="w-36 border-t border-slate-800 mt-1 pt-0.5">
                      <p className="text-xs font-black text-slate-900">{settings.founderName}</p>
                      <p className="text-[10px] text-slate-600 font-semibold">{settings.founderTitle}</p>
                      <p className="text-[9px] text-blue-900 font-bold">{settings.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    This marksheet is approved and verified by the Head Teacher. You can print it or save it as a PDF.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-lg cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>মার্কশিট প্রিন্ট / ডাউনলোড করুন</span>
                </button>
              </div>
            </div>
          ) : searchStatus === 'unpublished' ? (
            /* Specific notice when result is entered in database but unpublished by admin */
            <div className="text-center py-10 px-4 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
              <h4 className="text-base font-extrabold text-amber-950">
                ফলাফল এখনও প্রকাশিত হয়নি (Result Unpublished)
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 max-w-lg mx-auto leading-relaxed">
                {statusMessage}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  অপেক্ষার অনুরোধ: এডমিন প্যানেল থেকে পাবলিশ করার পর সরাসরি এই পেজ থেকে মার্কশিট ডাউনলোড করা যাবে।
                </span>
              </div>
            </div>
          ) : searchStatus === 'not_found' ? (
            /* Not Found Alert */
            <div className="text-center py-10 px-4 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h4 className="text-base font-bold text-rose-950">
                কোনো প্রকাশিত ফলাফল পাওয়া যায়নি
              </h4>
              <p className="text-xs sm:text-sm text-rose-800 max-w-lg mx-auto leading-relaxed">
                {statusMessage}
              </p>
              <div className="text-[11px] text-slate-600 pt-1">
                পরামর্শ: উপরে শিক্ষাবর্ষ, কোর্স, পরীক্ষার ধরণ ও রোল নম্বর সঠিক আছে কিনা দেখে পুনরায় &quot;ফলাফল ও মার্কশিট দেখুন&quot; চাপুন।
              </div>
            </div>
          ) : (
            /* Initial Helper Screen */
            <div className="text-center py-10 text-slate-500 space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-6 shadow-xs">
              <BarChart3 className="w-14 h-14 mx-auto text-blue-900/40" />
              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                শিক্ষাবর্ষ, কোর্স, পরীক্ষার ধরণ ও রোল সিলেক্ট করে ফলাফল খুঁজুন
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                উপরে থাকা ৪টি ড্রপডাউন থেকে তথ্য সিলেক্ট করুন এবং &quot;ফলাফল ও মার্কশিট দেখুন&quot; বাটনে ক্লিক করলেই শিক্ষার্থীর সম্পূর্ণ ফলাফল ও অফিশিয়াল সিলযুক্ত মার্কশিট দেখা যাবে এবং প্রিন্ট করা যাবে।
              </p>

              {/* Quick try presets */}
              <div className="pt-3">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  দ্রুত টেস্ট করতে ক্লিক করতে পারেন:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAcademicYear('2026');
                      setCourseId('course-computer-office');
                      setIsCustomExam(false);
                      setExamType('মিড-টার্ম অ্যাসেসমেন্ট');
                      setIsCustomRoll(false);
                      setRoll('101');
                      executeSearch('2026', 'course-computer-office', 'মিড-টার্ম অ্যাসেসমেন্ট', '101');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    কম্পিউটার অফিস: রোল ১০১ (মিড-টার্ম)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAcademicYear('2026');
                      setCourseId('course-computer-office');
                      setIsCustomExam(false);
                      setExamType('সেমিস্টার ফাইনাল পরীক্ষা');
                      setIsCustomRoll(false);
                      setRoll('101');
                      executeSearch('2026', 'course-computer-office', 'সেমিস্টার ফাইনাল পরীক্ষা', '101');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    কম্পিউটার অফিস: রোল ১০১ (সেমিস্টার ফাইনাল)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAcademicYear('2026');
                      setCourseId('course-ssc-acc');
                      setIsCustomExam(false);
                      setExamType('মডেল টেস্ট ২০২৬');
                      setIsCustomRoll(false);
                      setRoll('102');
                      executeSearch('2026', 'course-ssc-acc', 'মডেল টেস্ট ২০২৬', '102');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    এসএসসি হিসাববিজ্ঞান: রোল ১০২ (মডেল টেস্ট)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
