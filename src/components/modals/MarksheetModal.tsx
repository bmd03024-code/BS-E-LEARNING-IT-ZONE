import React, { useState, useMemo } from 'react';
import { Course, ResultRecord } from '../../types';
import { storage } from '../../services/storage';
import { X, BarChart3, Search, Printer, AlertCircle, Award, CheckCircle2, BookOpen, Clock, FileText } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface MarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export const MarksheetModal: React.FC<MarksheetModalProps> = ({ isOpen, onClose, courses }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [examType, setExamType] = useState('সেমিস্টার ফাইনাল পরীক্ষা');
  const [roll, setRoll] = useState('');
  
  const [foundResult, setFoundResult] = useState<ResultRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'unpublished' | 'not_found'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  // Dynamically extract available/published exams for the selected course and academic year
  const availableExamsForCourse = useMemo(() => {
    try {
      const allResults = storage.getResults();
      const filtered = allResults.filter(
        r => r.academicYear === academicYear && (courseId ? r.courseId === courseId : true)
      );
      const uniqueExams = Array.from(new Set(filtered.map(r => r.examType.trim()))).filter(Boolean);
      return uniqueExams;
    } catch {
      return [];
    }
  }, [academicYear, courseId]);

  // Standard recommended exam types
  const standardExamPresets = [
    'সেমিস্টার ফাইনাল পরীক্ষা',
    'মাসিক মূল্যায়ন পরীক্ষা',
    'মিড-টার্ম অ্যাসেসমেন্ট',
    'মডেল টেস্ট ২০২৬',
    'চূড়ান্ত মূল্যায়ন পরীক্ষা',
    'বার্ষিক মূল্যায়ন পরীক্ষা',
    'সাপ্তাহিক টেস্ট'
  ];

  // Normalization helper for flexible Bengali and English matching
  const normalize = (str: string) => {
    return (str || '').toLowerCase().replace(/\s+/g, '').trim();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const trimmedRoll = roll.trim();
    const trimmedExam = examType.trim();

    if (!trimmedRoll) {
      setSearchStatus('not_found');
      setStatusMessage('অনুগ্রহ করে শিক্ষার্থীর রোল নম্বর প্রদান করুন।');
      setFoundResult(null);
      return;
    }

    if (!trimmedExam) {
      setSearchStatus('not_found');
      setStatusMessage('অনুগ্রহ করে পরীক্ষার ধরণ নির্বাচন করুন বা লিখুন।');
      setFoundResult(null);
      return;
    }

    const allResults = storage.getResults();

    // Look for matching record matching Roll, Academic Year, Course, and Exam Type
    const normSearchExam = normalize(trimmedExam);
    const matchedRecord = allResults.find(r => {
      const isRollMatch = r.roll.trim() === trimmedRoll;
      const isYearMatch = r.academicYear === academicYear;
      const isCourseMatch = r.courseId === courseId;
      const normRecExam = normalize(r.examType);
      const isExamMatch = normRecExam === normSearchExam || normRecExam.includes(normSearchExam) || normSearchExam.includes(normRecExam);
      return isRollMatch && isYearMatch && isCourseMatch && isExamMatch;
    });

    if (matchedRecord) {
      // Check if published by Admin Panel
      if (matchedRecord.published) {
        setFoundResult(matchedRecord);
        setSearchStatus('found');
        setStatusMessage('');
      } else {
        // Result is prepared in admin database but NOT yet published
        setFoundResult(null);
        setSearchStatus('unpublished');
        setStatusMessage(
          `রোল ${toBengaliNum(trimmedRoll)}-এর "${matchedRecord.examType}" পরীক্ষার ফলাফল ডাটাবেজে সংরক্ষিত রয়েছে, কিন্তু এডমিন প্যানেল থেকে এখনও এটি অফিসিয়ালি পাবলিশ করা হয়নি। এডমিন প্যানেল থেকে অনুমোদন ও পাবলিশ সম্পন্ন হলে ফলাফল দেখা যাবে।`
        );
      }
    } else {
      // Check if student has results in another exam type to give helpful hints
      const otherResultsForStudent = allResults.filter(
        r => r.roll.trim() === trimmedRoll && r.academicYear === academicYear && r.courseId === courseId
      );

      setFoundResult(null);
      setSearchStatus('not_found');

      if (otherResultsForStudent.length > 0) {
        const publishedNames = otherResultsForStudent
          .filter(r => r.published)
          .map(r => r.examType);

        if (publishedNames.length > 0) {
          setStatusMessage(
            `রোল ${toBengaliNum(trimmedRoll)}-এর "${trimmedExam}" পরীক্ষার কোনো ফলাফল পাওয়া যায়নি। তবে এই কোর্সে এই শিক্ষার্থীর নিম্নলিখিত পরীক্ষার ফলাফল প্রকাশিত আছে: ${publishedNames.map(name => `"${name}"`).join(', ')}। অনুগ্রহ করে সঠিক পরীক্ষার ধরণ নির্বাচন করে "ফলাফল দেখুন" বাটনে চাপ দিন।`
          );
        } else {
          setStatusMessage(
            `রোল ${toBengaliNum(trimmedRoll)}-এর কোনো পরীক্ষার ফলাফল এখনও এডমিন প্যানেল থেকে পাবলিশ করা হয়নি।`
          );
        }
      } else {
        setStatusMessage(
          `প্রদত্ত শিক্ষাবর্ষ (${toBengaliNum(academicYear)}), কোর্স, পরীক্ষার ধরণ ("${trimmedExam}") ও রোল নম্বরের (${toBengaliNum(trimmedRoll)}) কোনো প্রকাশিত ফলাফল পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।`
        );
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Topbar */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 shrink-0 relative">
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
            শিক্ষাবর্ষ, কোর্স, পরীক্ষার ধরণ ও শিক্ষার্থীর রোল দিয়ে অফিসিয়ালি প্রকাশিত ফলাফল দেখুন ও মার্কশিট ডাউনলোড করুন
          </p>
        </div>

        {/* 4-Field Search Form: Academic Year, Course, Exam Type, and Student Roll */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* 1. Academic Year */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ১. শিক্ষাবর্ষ *
              </label>
              <select
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  setSearched(false);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                <option value="2026">২০২৬ সেশন</option>
                <option value="2025">২০২৫ সেশন</option>
                <option value="2024">২০২৪ সেশন</option>
                <option value="2023">২০২৩ সেশন</option>
              </select>
            </div>

            {/* 2. Course */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ২. কোর্স নির্বাচন *
              </label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setSearched(false);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white truncate focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Exam Type (Mandatory as per requirement) */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-blue-900 mb-1 flex items-center justify-between">
                <span>৩. পরীক্ষার ধরণ *</span>
                <span className="text-[10px] text-amber-600 font-semibold">বাধ্যতামূলক</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="exam-types-suggestions"
                  placeholder="পরীক্ষার ধরণ..."
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    setSearched(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl border-2 border-blue-600/70 text-xs font-bold bg-white text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <datalist id="exam-types-suggestions">
                  {availableExamsForCourse.map((ex, idx) => (
                    <option key={`avail-${idx}`} value={ex} />
                  ))}
                  {standardExamPresets.map((preset, idx) => (
                    <option key={`std-${idx}`} value={preset} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* 4. Student Roll */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ৪. শিক্ষার্থীর রোল *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: 101 বা 102"
                value={roll}
                onChange={(e) => {
                  setRoll(e.target.value);
                  setSearched(false);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Submit Action */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4 text-amber-400" />
                <span>ফলাফল দেখুন</span>
              </button>
            </div>
          </form>

          {/* Quick Exam Selection Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-700" />
              <span>জনপ্রিয় পরীক্ষার ধরণ:</span>
            </span>
            {[
              ...(availableExamsForCourse.length > 0 ? availableExamsForCourse : ['সেমিস্টার ফাইনাল পরীক্ষা', 'মিড-টার্ম অ্যাসেসমেন্ট', 'মডেল টেস্ট ২০২৬', 'মাসিক মূল্যায়ন পরীক্ষা'])
            ].slice(0, 4).map((presetExam, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setExamType(presetExam)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  examType === presetExam
                    ? 'bg-blue-900 text-amber-300 shadow-xs scale-102'
                    : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-300'
                }`}
              >
                {presetExam}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body & Marksheet Render Area */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-4">
          {foundResult ? (
            <div className="space-y-4">
              {/* Official Marksheet Document (Printable Area) */}
              <div className="printable-area relative bg-white border-4 border-blue-950 p-6 sm:p-8 rounded-2xl shadow-xl overflow-hidden space-y-4 text-slate-900">
                {/* Subtle Center Watermark with Institute Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none">
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
                    {/* PROMINENT EXAM TYPE DISPLAY (Crucial Requirement) */}
                    <div className="mt-1 flex items-center justify-center">
                      <div className="bg-amber-100 border border-amber-400/80 px-4 py-1.5 rounded-xl shadow-xs inline-flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-950 shrink-0" />
                        <span className="text-xs sm:text-sm font-black text-blue-950">
                          পরীক্ষার ধরণ: <span className="text-rose-900 underline underline-offset-2">{foundResult.examType}</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 ml-1">
                          (সেশন: {toBengaliNum(foundResult.academicYear)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Bio Grid with Required Parents' Names & Details */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs sm:text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-300">
                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">শিক্ষার্থীর নাম:</span>
                    <span className="font-extrabold text-slate-950">{foundResult.studentName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">রোল নম্বর:</span>
                    <span className="font-black text-blue-950 font-mono text-base">{foundResult.roll}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">পিতার নাম:</span>
                    <span className="font-bold text-slate-900">{foundResult.fatherName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-600 font-bold shrink-0">মাতার নাম:</span>
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

                  {foundResult.address && (
                    <div className="flex sm:col-span-2">
                      <span className="w-32 text-slate-600 font-bold shrink-0">ঠিকানা:</span>
                      <span className="font-medium text-slate-800">{foundResult.address}</span>
                    </div>
                  )}
                </div>

                {/* Subject Marks Table */}
                <div className="relative z-10">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-blue-950 text-white border border-blue-950">
                        <th className="py-2.5 px-3 border border-slate-700 font-bold">ক্রম</th>
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
                        চূড়ান্ত মূল্যায়ন ফলাফল: উত্তীর্ণ (Passed)
                      </span>
                      <span className="text-xs text-emerald-800 font-bold">
                        অর্জিত জিপিএ: {foundResult.gpa.toFixed(2)} | লেটার গ্রেড: {foundResult.grade} | পরীক্ষার ধরণ: {foundResult.examType}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-600 text-xs font-semibold block">
                      প্রকাশের তারিখ: {foundResult.date}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      ভেরিফায়েড অনলাইন রেকর্ড
                    </span>
                  </div>
                </div>

                {/* Scanned Official Seals & Signature */}
                <div className="relative z-10 mt-6 pt-4 border-t-2 border-slate-300 flex items-end justify-between">
                  {/* Institutional Seal */}
                  <div className="flex flex-col items-center">
                    <img
                      src={settings.institutionSealUrl}
                      alt="অফিশিয়াল সিল"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-600 mt-0.5">অফিশিয়াল সিল</span>
                  </div>

                  {/* Head Teacher Signature Seal */}
                  {settings.signatureSealUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.signatureSealUrl}
                        alt="প্রধান শিক্ষকের সিলমোহর"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                      />
                      <span className="text-[9px] font-bold text-rose-800 mt-0.5">প্রধান শিক্ষকের সিল</span>
                    </div>
                  )}

                  {/* Founder Signature */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <img
                        src={settings.signatureUrl}
                        alt="প্রধান শিক্ষকের স্বাক্ষর"
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    এই মার্কশিটটি প্রধান শিক্ষক কর্তৃক অনুমোদিত ও ভেরিফায়েড। প্রিন্ট করার সময় রঙিন বা সাদাকালো কপি গ্রহণযোগ্য।
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
              <div className="text-[11px] text-slate-500">
                পরামর্শ: সঠিক শিক্ষাবর্ষ, কোর্স, পরীক্ষার ধরণ ও রোল নম্বর মিলিয়ে দেখুন। (ডেমো ট্রাই করুন: রোল <b>101</b>, পরীক্ষা <b>সেমিস্টার ফাইনাল পরীক্ষা</b> বা <b>মিড-টার্ম অ্যাসেসমেন্ট</b>)
              </div>
            </div>
          ) : (
            /* Initial Helper Screen */
            <div className="text-center py-12 text-slate-400 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
              <BarChart3 className="w-14 h-14 mx-auto text-blue-900/30" />
              <h4 className="text-sm sm:text-base font-bold text-slate-700">
                শিক্ষাবর্ষ, কোর্স, পরীক্ষার ধরণ ও শিক্ষার্থীর রোল দিয়ে ফলাফল অনুসন্ধান করুন
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                এডমিন প্যানেল থেকে ফলাফল পাবলিশ করা থাকলে তাৎক্ষণিকভাবে বিষয়ভিত্তিক নম্বরপত্র, জিপিএ এবং অফিশিয়াল সিলযুক্ত মার্কশিট দেখতে ও ডাউনলোড করতে পারবেন।
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">দ্রুত পরীক্ষা করতে পারেন:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicYear('2026');
                    setCourseId('course-computer-office');
                    setExamType('সেমিস্টার ফাইনাল পরীক্ষা');
                    setRoll('101');
                  }}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-300 font-bold text-blue-900 hover:bg-blue-50"
                >
                  রোল 101 (সেমিস্টার ফাইনাল)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicYear('2026');
                    setCourseId('course-computer-office');
                    setExamType('মিড-টার্ম অ্যাসেসমেন্ট');
                    setRoll('101');
                  }}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-300 font-bold text-blue-900 hover:bg-blue-50"
                >
                  রোল 101 (মিড-টার্ম)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicYear('2026');
                    setCourseId('course-ssc-acc');
                    setExamType('মডেল টেস্ট ২০২৬');
                    setRoll('102');
                  }}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-300 font-bold text-blue-900 hover:bg-blue-50"
                >
                  রোল 102 (মডেল টেস্ট)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
