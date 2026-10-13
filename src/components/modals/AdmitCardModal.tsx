import React, { useState } from 'react';
import { Course, AdmitCardRecord } from '../../types';
import { storage } from '../../services/storage';
import { X, Ticket, Search, Printer, Download, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface AdmitCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export const AdmitCardModal: React.FC<AdmitCardModalProps> = ({ isOpen, onClose, courses }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [roll, setRoll] = useState('');
  const [foundCard, setFoundCard] = useState<AdmitCardRecord | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const cards = storage.getAdmitCards();
    const match = cards.find(
      c => c.roll === roll.trim() && c.academicYear === academicYear && c.courseId === courseId
    );

    if (match) {
      setFoundCard(match);
    } else {
      const students = storage.getStudents();
      const std = students.find(s => s.roll === roll.trim() && s.academicYear === academicYear && s.courseId === courseId);
      if (std) {
        const isBlocked = std.admitCardBlocked || !std.hasPaidDues;
        const generatedCard: AdmitCardRecord = {
          id: `adm-gen-${Date.now()}`,
          academicYear,
          courseId,
          roll: std.roll,
          studentName: std.name,
          fatherName: std.fatherName || 'প্রযোজ্য নয়',
          motherName: std.motherName || 'প্রযোজ্য নয়',
          examType: 'সাপ্তাহিক ও মাসিক চূড়ান্ত মূল্যায়ন পরীক্ষা',
          examDate: '২৫ এপ্রিল ২০২৬, সকাল ১০:০০ টা',
          examCenter: 'BS E-Learning & IT Zone ডিজিটাল ক্যাম্পাস, ঢাকা',
          published: true,
          instructions: [
            'পরীক্ষা শুরুর ৩০ মিনিট পূর্বে পরীক্ষা কক্ষে প্রবেশ করতে হবে।',
            'এই এডমিট কার্ডের প্রিন্টেড কপি পরীক্ষা কক্ষে সাথে রাখা বাধ্যতামূলক।',
            'কোনো ধরনের অসদুপায় বা ডিজিটাল ডিভাইস পরীক্ষা কক্ষে নিষিদ্ধ।'
          ],
          feeCleared: !isBlocked,
          isBlocked: isBlocked,
          blockedReason: std.blockedReason || 'বকেয়া ফি পরিশোধ না করায় এডমিট কার্ড স্থগিত রয়েছে।'
        };
        setFoundCard(generatedCard);
      } else {
        setFoundCard(null);
      }
    }
  };

  const handlePrintOrDownload = () => {
    if (foundCard?.isBlocked || foundCard?.feeCleared === false) {
      alert('আপনার ফি বকেয়া থাকায় এডমিট কার্ড প্রিন্ট বা ডাউনলোড সম্ভব নয়। অনুগ্রহ করে অফিসে যোগাযোগ করুন।');
      return;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      alert('মোবাইল ডিভাইসে অফিসিয়াল এডমিট কার্ডটি প্রদর্শিত হয়েছে। আপনি স্ক্রিনশট বা পিডিএফ হিসেবে সেভ করতে পারবেন।');
      window.print();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Modal Topbar */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Ticket className="w-4 h-4" />
            <span>অফিশিয়াল এডমিট কার্ড ভিউয়ার ও ডাউনলোড</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            পরীক্ষার প্রবেশপত্র (Admit Card)
          </h2>
          <p className="text-xs text-slate-300">
            রোল নম্বর দিয়ে সার্চ করে পিতা-মাতার নাম ও অফিশিয়াল সিলযুক্ত এডমিট কার্ড প্রিন্ট করুন
          </p>
        </div>

        {/* Search bar inside modal */}
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>খুঁজুন</span>
              </button>
            </div>
          </form>
        </div>

        {/* Body / Printable Document */}
        <div className="p-4 sm:p-6 overflow-y-auto grow">
          {foundCard ? (
            <div className="space-y-4">
              {/* Fee Clearance Check Banner */}
              {(foundCard.isBlocked || foundCard.feeCleared === false) ? (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 space-y-2 text-center">
                  <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
                  <h4 className="font-extrabold text-base">এডমিট কার্ড স্থগিত (Blocked) রয়েছে</h4>
                  <p className="text-xs sm:text-sm font-medium">
                    {foundCard.blockedReason || 'আপনার মাসিক বা পরীক্ষার ফি বকেয়া থাকায় এডমিট কার্ড ডাউনলোড স্থগিত রাখা হয়েছে।'}
                  </p>
                  <p className="text-xs text-rose-700 font-bold">
                    দয়া করে বাংলা কিউআর দিয়ে আপনার বকেয়া ফি পরিশোধ করুন অথবা অফিসে যোগাযোগ করে এটি সচল করান।
                  </p>
                </div>
              ) : (
                /* Document Printable Container */
                <div className="printable-area relative bg-white border-2 border-slate-800 p-6 sm:p-8 rounded-xl shadow-md overflow-hidden">
                  {/* Background Subtle Watermark with Institute Logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Watermark" className="w-64 h-64 object-contain filter grayscale" />
                    ) : (
                      <div className="w-64 h-64 rounded-full border-8 border-dashed border-slate-900 flex flex-col items-center justify-center text-center p-4">
                        <span className="text-3xl font-black text-slate-950">BS ZONE</span>
                        <span className="text-xs font-bold text-slate-800 mt-1">E-LEARNING &amp; IT</span>
                      </div>
                    )}
                  </div>

                  {/* Institute Header */}
                  <div className="relative z-10 text-center pb-4 border-b-2 border-slate-800 space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-blue-950 tracking-wide">
                      {settings.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {settings.address} | হটলাইন: {settings.hotline}
                    </p>
                    <div className="inline-block mt-1 px-4 py-1 rounded-full bg-slate-900 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                      প্রবেশপত্র (ADMIT CARD)
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs sm:text-sm">
                    <div className="flex border-b border-slate-200 pb-1.5">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">শিক্ষার্থীর নাম:</span>
                      <span className="font-bold text-slate-950">{foundCard.studentName}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">রোল নম্বর:</span>
                      <span className="font-black text-blue-900 font-mono text-base">{foundCard.roll}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">পিতার নাম:</span>
                      <span className="font-bold text-slate-900">{foundCard.fatherName}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">মাতার নাম:</span>
                      <span className="font-bold text-slate-900">{foundCard.motherName}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">কোর্সের নাম:</span>
                      <span className="font-bold text-blue-900">{selectedCourse.title}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">শিক্ষাবর্ষ:</span>
                      <span className="font-semibold text-slate-800">{foundCard.academicYear} সেশন</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5 sm:col-span-2">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">পরীক্ষার ধরণ:</span>
                      <span className="font-bold text-slate-900">{foundCard.examType}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5 sm:col-span-2">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">তারিখ ও সময়:</span>
                      <span className="font-semibold text-slate-800">{foundCard.examDate}</span>
                    </div>

                    <div className="flex border-b border-slate-200 pb-1.5 sm:col-span-2">
                      <span className="w-32 text-slate-500 font-semibold shrink-0">পরীক্ষা কেন্দ্র:</span>
                      <span className="font-semibold text-slate-800">{foundCard.examCenter}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="relative z-10 mt-5 pt-3 border-t border-slate-200">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      পরীক্ষার্থীর সাধারণ নির্দেশাবলী:
                    </h5>
                    <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-0.5">
                      {foundCard.instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Bottom Scanned Signature and Seal in Exact Placement */}
                  <div className="relative z-10 mt-8 pt-4 border-t-2 border-slate-300 flex items-end justify-between">
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.institutionSealUrl}
                        alt="অফিশিয়াল সিল"
                        className="w-16 h-16 object-contain"
                      />
                      <span className="text-[10px] font-bold text-slate-600 mt-0.5">অফিশিয়াল সিল</span>
                    </div>

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
              )}

              {/* Action Buttons */}
              <div className="no-print flex justify-end gap-3 pt-2">
                <button
                  disabled={foundCard.isBlocked || foundCard.feeCleared === false}
                  onClick={handlePrintOrDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>এডমিট কার্ড প্রিন্ট / সেভ করুন</span>
                </button>
              </div>
            </div>
          ) : searched ? (
            <div className="text-center py-10 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                এই রোল নম্বরের কোনো এডমিট কার্ড পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অনুগ্রহ করে সঠিক শিক্ষাবর্ষ, কোর্স ও রোল নম্বর দিয়ে পুনরায় চেষ্টা করুন অথবা প্রশাসকের সাথে যোগাযোগ করুন।
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Ticket className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-xs sm:text-sm text-slate-500">
                উপরের ফিল্টার বক্সে রোল নম্বর লিখে <b>"খুঁজুন"</b> বাটনে চাপ দিন।
              </p>
              <p className="text-[11px] text-slate-400">
                ডেমো রোল ট্রাই করুন: <b>101</b> (ক্লিয়ার্ড), <b>104</b> (ফি বকেয়া পরীক্ষা)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
