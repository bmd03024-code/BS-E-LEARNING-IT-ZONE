import React, { useState } from 'react';
import { Course, CertificateRecord } from '../../types';
import { storage } from '../../services/storage';
import { X, Award, Search, Printer, AlertCircle, ShieldCheck, CheckCircle2, CreditCard } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, courses }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [roll, setRoll] = useState('');
  const [foundCert, setFoundCert] = useState<CertificateRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [trxInput, setTrxInput] = useState('');

  if (!isOpen) return null;

  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    const certs = storage.getCertificates();
    const match = certs.find(
      c => c.roll === roll.trim() && c.academicYear === academicYear && c.courseId === courseId
    );

    if (match) {
      setFoundCert(match);
    } else {
      const students = storage.getStudents();
      const std = students.find(s => s.roll === roll.trim() && s.academicYear === academicYear && s.courseId === courseId);
      if (std) {
        const isFreeCourse = selectedCourse.certificateFee === 0 || courseId === 'course-quran';
        const newCert: CertificateRecord = {
          id: `cert-gen-${Date.now()}`,
          academicYear,
          courseId,
          roll: std.roll,
          studentName: std.name,
          fatherName: std.fatherName,
          motherName: std.motherName,
          address: std.address || 'ঢাকা, বাংলাদেশ',
          issueDate: new Date().toISOString().split('T')[0],
          certificateNo: `BS-ZONE-${std.academicYear}-${std.roll.padStart(4, '0')}`,
          grade: 'A+ (প্রথম শ্রেণি)',
          isFirstIssue: true,
          feePaid: isFreeCourse,
          isFree: isFreeCourse,
          feeAmount: isFreeCourse ? 0 : selectedCourse.certificateFee,
          hasEverPaid: isFreeCourse,
          hasGovtCert: !!selectedCourse.hasGovtCert
        };
        setFoundCert(newCert);
      } else {
        setFoundCert(null);
      }
    }
  };

  const handlePayFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxInput.trim() || !foundCert) return;

    // Mark certificate as paid for life!
    const updatedCert: CertificateRecord = {
      ...foundCert,
      feePaid: true,
      hasEverPaid: true
    };

    const allCerts = storage.getCertificates();
    const filtered = allCerts.filter(c => c.id !== foundCert.id && c.roll !== foundCert.roll);
    storage.saveCertificates([updatedCert, ...filtered]);

    setFoundCert(updatedCert);
    setTrxInput('');
    alert('সার্টিফিকেট ফি সফলভাবে পরিশোধিত হয়েছে! এখন থেকে আপনি যতবার খুশি বিনামূল্যে সার্টিফিকেট ডাউনলোড করতে পারবেন।');
  };

  const handlePrint = () => {
    window.print();
  };

  const isEligibleToDownload = foundCert && (foundCert.isFree || foundCert.hasEverPaid || foundCert.feePaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Topbar */}
        <div className="no-print bg-gradient-to-r from-amber-600 via-blue-950 to-slate-950 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>অফিশিয়াল সনদপত্র উত্তোলন ও ডাউনলোড</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            কোর্স সমাপ্তি সনদপত্র (Course Certificate)
          </h2>
          <p className="text-xs text-slate-300">
            রোল নম্বর দিয়ে সার্চ করে পিতা-মাতার নাম ও ঠিকানা সহ অফিশিয়াল সনদপত্র ডাউনলোড ও প্রিন্ট করুন
          </p>
        </div>

        {/* Search form */}
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
                placeholder="যেমন: 101 বা 103"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>সনদ খুঁজুন</span>
              </button>
            </div>
          </form>

          {foundCert && (
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {foundCert.isFree
                    ? 'এই কোর্সের সনদপত্র সম্পূর্ণ ফ্রি!'
                    : foundCert.hasEverPaid
                    ? 'ফি পূর্বে পরিশোধিত হয়েছে — পরবর্তীতে যেকোনো সময় আনলিমিটেড বার ফ্রিতে ডাউনলোড করতে পারবেন!'
                    : `এই সনদের জন্য নির্ধারিত ফি: ${toBengaliNum(foundCert.feeAmount)} টাকা। একবার পরিশোধ করলে আজীবন ফ্রি ডাউনলোড পাবেন।`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-6 overflow-y-auto grow">
          {foundCert ? (
            !isEligibleToDownload ? (
              /* Payment Required Screen */
              <div className="max-w-md mx-auto p-6 bg-slate-50 border-2 border-amber-300 rounded-3xl text-center space-y-4">
                <CreditCard className="w-12 h-12 text-amber-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">সনদপত্র ফি পরিশোধ আবশ্যক</h3>
                <p className="text-xs text-slate-600">
                  অ্যাডমিন কর্তৃক এই কোর্সের সনদের জন্য <b>{toBengaliNum(foundCert.feeAmount)} টাকা</b> ফি নির্ধারণ করা হয়েছে। বাংলা কিউআর দিয়ে ফি পরিশোধ করে নিচে TrxID দিন।
                </p>

                <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border shadow-inner">
                  <img src={settings.banglaQrUrl} alt="Bangla QR" className="w-full h-full object-contain" />
                </div>

                <form onSubmit={handlePayFee} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="বাংলা কিউআর পেমেন্ট TrxID"
                    value={trxInput}
                    onChange={(e) => setTrxInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase text-center font-bold"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
                  >
                    ফি জমা দিন ও আনলিমিটেড ফ্রি ডাউনলোড আনলক করুন
                  </button>
                </form>
              </div>
            ) : (
              /* Luxury Official Certificate */
              <div className="space-y-4">
                <div className="printable-area certificate-border relative bg-radial from-amber-50/40 via-white to-amber-50/30 p-8 sm:p-12 rounded-xl shadow-lg overflow-hidden text-center">
                  {/* Subtle Center Logo Watermark with Institute Logo / Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.09] select-none">
                    {(settings.watermarkUrl || settings.logoUrl) ? (
                      <img src={settings.watermarkUrl || settings.logoUrl} alt="Watermark" className="w-80 h-80 object-contain filter grayscale" />
                    ) : (
                      <div className="w-80 h-80 rounded-full border-12 border-dashed border-blue-950 flex flex-col items-center justify-center text-center p-6">
                        <span className="text-5xl font-black text-blue-950">BS ZONE</span>
                        <span className="text-sm font-bold text-slate-800 mt-2">E-LEARNING &amp; IT</span>
                      </div>
                    )}
                  </div>

                  {/* Certificate Number & Date Top Bar */}
                  <div className="relative z-10 flex justify-between items-center text-xs text-slate-600 pb-4 border-b border-amber-300/60 font-mono">
                    <span>সনদ নং: <b className="text-slate-900">{foundCert.certificateNo}</b></span>
                    <span>ইস্যুর তারিখ: <b className="text-slate-900">{foundCert.issueDate}</b></span>
                  </div>

                  {/* Institution Branding */}
                  <div className="relative z-10 mt-6 space-y-1">
                    <h3 className="text-2xl sm:text-4xl font-black text-blue-950 tracking-wider">
                      {settings.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {settings.subName} • {settings.address}
                    </p>
                    
                    <div className="pt-3">
                      <span className="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-amber-300 font-extrabold text-sm sm:text-base tracking-widest uppercase border border-amber-400 shadow-xs">
                        সনদপত্র • CERTIFICATE OF COMPLETION
                      </span>
                    </div>
                  </div>

                  {/* Body Text with Mandatory Parents' Names and Address */}
                  <div className="relative z-10 mt-8 space-y-4 text-slate-800 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                    <p className="text-slate-600 font-medium">
                      এই মর্মে অত্যন্ত আনন্দের সাথে প্রত্যায়ন করা যাচ্ছে যে,
                    </p>

                    <h4 className="text-2xl sm:text-3xl font-extrabold text-blue-950 underline decoration-amber-400 decoration-2 underline-offset-8">
                      {foundCert.studentName}
                    </h4>

                    {/* Parents' Names & Address */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs sm:text-sm text-slate-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                      <div>
                        পিতার নাম: <b className="text-slate-900 font-bold">{foundCert.fatherName || 'প্রযোজ্য নয়'}</b>
                      </div>
                      <span className="hidden sm:inline text-amber-500">•</span>
                      <div>
                        মাতার নাম: <b className="text-slate-900 font-bold">{foundCert.motherName || 'প্রযোজ্য নয়'}</b>
                      </div>
                      <span className="hidden sm:inline text-amber-500">•</span>
                      <div>
                        রোল: <b className="text-blue-900 font-bold font-mono">{foundCert.roll}</b>
                      </div>
                      {foundCert.address && (
                        <>
                          <span className="hidden sm:inline text-amber-500">•</span>
                          <div>
                            ঠিকানা: <b className="text-slate-800">{foundCert.address}</b>
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-slate-700 text-xs sm:text-sm">
                      সফলতার সাথে <b>{selectedCourse.title}</b> কোর্সটি ({selectedCourse.duration}) সফলভাবে সম্পন্ন করেছেন এবং মূল্যায়ন পরীক্ষায় কৃতিত্বের সাথে <b>"{foundCert.grade}"</b> অর্জন করেছেন।
                    </p>

                    {foundCert.hasGovtCert && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>অনলাইন সনদের পাশাপাশি সরকারি সার্টিফিকেট (Govt. Approved) তালিকাভুক্ত</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Signature & Seal */}
                  <div className="relative z-10 mt-12 pt-6 border-t border-amber-300/60 flex items-end justify-between px-2 sm:px-8">
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.institutionSealUrl}
                        alt="অফিশিয়াল সিল"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-xs"
                      />
                      <span className="text-[10px] font-bold text-slate-600 mt-1">প্রাতিষ্ঠানিক সিল</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <img
                        src={settings.signatureSealUrl}
                        alt="প্রধান শিক্ষকের সিলমোহর"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain filter drop-shadow-xs"
                      />
                      <span className="text-[9px] font-bold text-rose-800 mt-1">প্রধান শিক্ষকের সিলমোহর</span>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                        <img
                          src={settings.signatureUrl}
                          alt="প্রধান শিক্ষকের স্বাক্ষর"
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="w-40 border-t-2 border-slate-900 mt-1 pt-1">
                        <p className="text-sm font-black text-slate-950">{settings.founderName}</p>
                        <p className="text-[11px] text-slate-600 font-semibold">{settings.founderTitle}</p>
                        <p className="text-[10px] text-blue-900 font-bold">{settings.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="no-print flex justify-end gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition-all shadow-md active:scale-98"
                  >
                    <Printer className="w-4 h-4" />
                    <span>সনদপত্র প্রিন্ট / ডাউনলোড করুন</span>
                  </button>
                </div>
              </div>
            )
          ) : searched ? (
            <div className="text-center py-10 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                এই রোল নম্বরের কোনো সার্টিফিকেট পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অনুগ্রহ করে সঠিক শিক্ষাবর্ষ, কোর্স ও রোল নম্বর (যেমন: 101, 103) প্রদান করুন।
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Award className="w-12 h-12 mx-auto text-amber-400" />
              <p className="text-xs sm:text-sm text-slate-500">
                শিক্ষাবর্ষ, কোর্স ও রোল নম্বর দিয়ে <b>"সনদ খুঁজুন"</b> বাটনে চাপ দিন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
