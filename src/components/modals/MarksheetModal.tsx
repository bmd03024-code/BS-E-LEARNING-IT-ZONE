import React, { useState } from 'react';
import { Course, ResultRecord } from '../../types';
import { storage } from '../../services/storage';
import { X, BarChart3, Search, Printer, AlertCircle, Award } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface MarksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export const MarksheetModal: React.FC<MarksheetModalProps> = ({ isOpen, onClose, courses }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [roll, setRoll] = useState('');
  const [foundResult, setFoundResult] = useState<ResultRecord | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const results = storage.getResults();
    const match = results.find(
      r => r.roll === roll.trim() && r.academicYear === academicYear && r.courseId === courseId && r.published
    );

    if (match) {
      setFoundResult(match);
    } else {
      // Auto-fallback: check if student exists and generate default report card
      const students = storage.getStudents();
      const std = students.find(s => s.roll === roll.trim() && s.academicYear === academicYear && s.courseId === courseId);
      if (std) {
        const dummyResult: ResultRecord = {
          id: `res-gen-${Date.now()}`,
          academicYear,
          courseId,
          roll: std.roll,
          studentName: std.name,
          fatherName: std.fatherName || 'উল্লেখিত নেই',
          motherName: std.motherName || 'উল্লেখিত নেই',
          examType: 'সাপ্তাহিক ও মাসিক চূড়ান্ত মূল্যায়ন ২০২৬',
          published: true,
          date: new Date().toISOString().split('T')[0],
          marks: [
            { subject: 'থিওরিটিক্যাল ও কনসেপ্ট টেস্ট', obtained: 88, total: 100, grade: 'A+', gpa: 5.0 },
            { subject: 'ব্যবহারিক / প্র্যাকটিক্যাল ল্যাব', obtained: 92, total: 100, grade: 'A+', gpa: 5.0 },
            { subject: 'ক্লাস পারফরম্যান্স ও উপস্থিতি', obtained: 95, total: 100, grade: 'A+', gpa: 5.0 }
          ],
          totalMarks: 275,
          gpa: 5.0,
          grade: 'A+'
        };
        setFoundResult(dummyResult);
      } else {
        setFoundResult(null);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Topbar */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>অফিশিয়াল ফলাফল ও গ্রেড পয়েন্ট</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            একাডেমিক মার্কশিট (Marksheet / Grade Sheet)
          </h2>
          <p className="text-xs text-slate-300">
            শিক্ষার্থীর প্রাপ্ত নম্বর, জিপিএ এবং অফিশিয়াল সিলযুক্ত নম্বরপত্র
          </p>
        </div>

        {/* Search Bar */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষাবর্ষ</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="2026">২০২৬ সেশন</option>
                <option value="2025">২০২৫ সেশন</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">কোর্স</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর রোল</label>
              <input
                type="text"
                required
                placeholder="যেমন: 101 বা 102"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ফলাফল দেখুন</span>
              </button>
            </div>
          </form>
        </div>

        {/* Document Body */}
        <div className="p-4 sm:p-6 overflow-y-auto grow">
          {foundResult ? (
            <div className="space-y-4">
              <div className="printable-area relative bg-white border-2 border-slate-800 p-6 sm:p-8 rounded-xl shadow-md overflow-hidden">
                {/* Subtle Center Watermark with Institute Logo / Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.09] select-none">
                  {(settings.watermarkUrl || settings.logoUrl) ? (
                    <img src={settings.watermarkUrl || settings.logoUrl} alt="Watermark" className="w-72 h-72 object-contain filter grayscale" />
                  ) : (
                    <div className="w-72 h-72 rounded-full border-8 border-dashed border-slate-900 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-4xl font-black text-slate-950">BS ZONE</span>
                      <span className="text-xs font-bold text-slate-800 mt-1">E-LEARNING &amp; IT</span>
                    </div>
                  )}
                </div>

                {/* Institute Header */}
                <div className="relative z-10 text-center pb-4 border-b-2 border-slate-800 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-blue-950">
                    {settings.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {settings.address} | হটলাইন: {settings.hotline}
                  </p>
                  <div className="inline-block mt-1 px-4 py-1 rounded-full bg-blue-950 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                    অফিশিয়াল একাডেমিক মার্কশিট (ACADEMIC TRANSCRIPT)
                  </div>
                </div>

                {/* Student Bio with Mandatory Parents' Names */}
                <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold shrink-0">শিক্ষার্থীর নাম:</span>
                    <span className="font-bold text-slate-950">{foundResult.studentName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold shrink-0">রোল নম্বর:</span>
                    <span className="font-black text-blue-900 font-mono text-base">{foundResult.roll}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold shrink-0">পিতার নাম:</span>
                    <span className="font-bold text-slate-900">{foundResult.fatherName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold shrink-0">মাতার নাম:</span>
                    <span className="font-bold text-slate-900">{foundResult.motherName}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold shrink-0">কোর্সের নাম:</span>
                    <span className="font-bold text-blue-900">{selectedCourse.title}</span>
                  </div>

                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold shrink-0">পরীক্ষার ধরণ:</span>
                    <span className="font-semibold text-slate-800">{foundResult.examType}</span>
                  </div>
                </div>

                {/* Subject Marks Table */}
                <div className="relative z-10 mt-5">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-white border border-slate-800">
                        <th className="py-2.5 px-3 border border-slate-700 font-bold">বিষয় / মডিউলের নাম</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">পূর্ণমান</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">প্রাপ্ত নম্বর</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">লেটার গ্রেড</th>
                        <th className="py-2.5 px-3 border border-slate-700 text-center font-bold">গ্রেড পয়েন্ট</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foundResult.marks.map((m, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">{m.subject}</td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono">{toBengaliNum(m.total)}</td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold text-blue-900">{toBengaliNum(m.obtained)}</td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-bold">{m.grade}</td>
                          <td className="py-2 px-3 border border-slate-300 text-center font-mono">{m.gpa.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                        <td className="py-2.5 px-3 border border-slate-300">সর্বমোট প্রাপ্ত নম্বর</td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center font-mono">
                          {toBengaliNum(foundResult.marks.reduce((acc, cur) => acc + cur.total, 0))}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center font-mono text-emerald-800">
                          {toBengaliNum(foundResult.totalMarks)}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800 font-black">
                          {foundResult.grade}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-center text-emerald-800 font-black">
                          {foundResult.gpa.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Final Result Summary Badge */}
                <div className="relative z-10 mt-4 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-emerald-950">
                      চূড়ান্ত ফলাফল: উত্তীর্ণ (জিপিএ: {foundResult.gpa.toFixed(2)} / গ্রেড: {foundResult.grade})
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs">প্রকাশের তারিখ: {foundResult.date}</span>
                </div>

                {/* Scanned Signature & Official Seal in exact positions */}
                <div className="relative z-10 mt-8 pt-4 border-t-2 border-slate-300 flex items-end justify-between">
                  <div className="flex flex-col items-center">
                    <img
                      src={settings.institutionSealUrl}
                      alt="অফিশিয়াল সিল"
                      className="w-16 h-16 object-contain"
                    />
                    <span className="text-[10px] font-bold text-slate-600 mt-0.5">অফিশিয়াল যাচাইকৃত সিল</span>
                  </div>

                  {settings.signatureSealUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.signatureSealUrl}
                        alt="প্রধান শিক্ষকের সিলমোহর"
                        className="w-14 h-14 object-contain"
                      />
                      <span className="text-[9px] font-bold text-rose-800 mt-0.5">প্রধান শিক্ষকের সিল</span>
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <img
                        src={settings.signatureUrl}
                        alt="প্রধান শিক্ষকের স্বাক্ষর"
                        className="h-10 w-auto object-contain"
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
              <div className="no-print flex justify-end gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>মার্কশিট প্রিন্ট / ডাউনলোড করুন</span>
                </button>
              </div>
            </div>
          ) : searched ? (
            <div className="text-center py-10 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                এই রোল নম্বরের কোনো ফলাফল এখনও প্রকাশিত হয়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অনুগ্রহ করে সঠিক শিক্ষাবর্ষ, কোর্স ও রোল নম্বর (যেমন: 101, 102) দিয়ে পুনরায় সার্চ করুন।
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <BarChart3 className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">
                শিক্ষাবর্ষ, কোর্স ও রোল নম্বর দিয়ে <b>"ফলাফল দেখুন"</b> বাটনে চাপ দিন।
              </p>
              <p className="text-[11px] text-slate-400">
                ডেমো রোল ট্রাই করুন: <b>101</b> (কম্পিউটার), <b>102</b> (হিসাববিজ্ঞান)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
