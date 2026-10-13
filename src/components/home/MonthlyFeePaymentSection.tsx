import React, { useState } from 'react';
import { Course, EnrollmentApplication, InstituteSettings } from '../../types';
import { storage } from '../../services/storage';
import { CreditCard, CheckCircle2, QrCode, AlertCircle, ArrowRight, Printer } from 'lucide-react';
import { toBengaliNum } from './CoursesSection';

interface MonthlyFeePaymentSectionProps {
  courses: Course[];
  settings: InstituteSettings;
}

export const MonthlyFeePaymentSection: React.FC<MonthlyFeePaymentSectionProps> = ({ courses, settings }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [roll, setRoll] = useState('');
  const [studentName, setStudentName] = useState('');
  const [phone, setPhone] = useState('');
  const [month, setMonth] = useState('এপ্রিল ২০২৬');
  const [amount, setAmount] = useState('500');
  const [trxId, setTrxId] = useState('');
  const [receipt, setReceipt] = useState<EnrollmentApplication | null>(null);

  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const crs = courses.find(c => c.id === id);
    if (crs && crs.monthlyFee > 0) {
      setAmount(crs.monthlyFee.toString());
    }
  };

  const handleRollLookup = (val: string) => {
    setRoll(val);
    const students = storage.getStudents();
    const matched = students.find(s => s.roll === val.trim() && s.academicYear === academicYear);
    if (matched) {
      setStudentName(matched.name);
      setPhone(matched.phone);
      if (matched.courseId) {
        handleCourseChange(matched.courseId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roll.trim() || !studentName.trim() || !phone.trim() || !trxId.trim() || !amount) {
      alert('অনুগ্রহ করে রোল নম্বর, শিক্ষার্থীর নাম, মোবাইল নম্বর এবং ট্রানজেকশন আইডি (TrxID) দিন।');
      return;
    }

    const newApp: EnrollmentApplication = {
      id: `app-fee-${Date.now()}`,
      type: 'monthly',
      courseId,
      academicYear,
      roll: roll.trim(),
      studentName: studentName.trim(),
      phone: phone.trim(),
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      month,
      amount: Number(amount),
      trxId: trxId.trim().toUpperCase(),
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const apps = storage.getApplications();
    storage.saveApplications([newApp, ...apps]);

    setReceipt(newApp);
    setTrxId('');
  };

  return (
    <section id="fee-section" className="py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-blue-50/40 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span>বাংলা কিউআর পেমেন্ট গেটওয়ে</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            মাসিক ফি / টিউশন ফি জমা দিন
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            বিকাশ, নগদ বা যেকোনো ব্যাংকিং অ্যাপের মাধ্যমে বাংলা কিউআর স্ক্যান করে পেমেন্ট সম্পন্ন করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Bangla QR Code & Instructions */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center">
            {/* Dynamic Heading controlled from Admin */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-md">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1">
                জাতীয় বাংলা কিউআর (BANGLA QR)
              </span>
              <h3 className="text-xs sm:text-sm font-bold leading-relaxed text-slate-100">
                {settings.banglaQrHeading || 'বিকাশ, নগদ বা যেকোনো ব্যাংকিং অ্যাপের মাধ্যমে এই কিউআর কোড স্ক্যান করে পেমেন্ট করা যাবে।'}
              </h3>
            </div>

            {/* Bangla QR Code Image */}
            <div className="bg-slate-50 border-2 border-dashed border-blue-900/40 rounded-2xl p-4 flex flex-col items-center shadow-inner">
              <div className="w-56 h-64 sm:w-64 sm:h-72 bg-white rounded-xl shadow-md p-2 flex items-center justify-center overflow-hidden border border-slate-200">
                <img
                  src={settings.banglaQrUrl}
                  alt="Bangla QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold w-full">
                ✓ কোনো নির্দিষ্ট ফোন নম্বর লাগবে না—সরাসরি আপনার ব্যাংক/এমএফএস অ্যাপ দিয়ে স্ক্যান করুন
              </div>
            </div>

            {/* Steps list */}
            <div className="space-y-2 text-xs text-slate-700 text-left">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[11px]">১</span>
                <span>আপনার বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপ ওপেন করে 'Scan QR' অপশনে যান।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[11px]">২</span>
                <span>উপরের বাংলা কিউআর কোডটি স্ক্যান করে নির্ধারিত ফি পরিশোধ করুন।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[11px]">৩</span>
                <span>পেমেন্ট মেসেজ থেকে প্রাপ্ত Transaction ID (TrxID) পাশের ফর্মে সাবমিট করুন।</span>
              </div>
            </div>
          </div>

          {/* Right: Submission Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
            {receipt ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  মাসিক ফি পেমেন্ট আবেদন জমা হয়েছে!
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  আপনার পেমেন্ট আবেদনটি অ্যাডমিন প্যানেলের যাচাই তালিকায় জমা হয়েছে। অ্যাডমিন TrxID মিলিয়ে অ্যাপ্রুভ করলেই এটি ডাটাবেজে কনফার্ম হয়ে যাবে।
                </p>

                {/* Receipt Card */}
                <div className="max-w-md mx-auto bg-slate-50 border border-slate-300 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-2 shadow-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">শিক্ষার্থী:</span>
                    <span className="font-bold text-slate-900">{receipt.studentName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">রোল নম্বর:</span>
                    <span className="font-bold text-slate-900">{receipt.roll}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">শিক্ষাবর্ষ:</span>
                    <span className="font-bold text-slate-900">{receipt.academicYear}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">মাস:</span>
                    <span className="font-bold text-slate-900">{receipt.month}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">পরিশোধিত অর্থ:</span>
                    <span className="font-bold text-emerald-700">{toBengaliNum(receipt.amount)} টাকা</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">পেমেন্ট মেথড:</span>
                    <span className="font-bold text-blue-900">বাংলা কিউআর (Bangla QR)</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">TrxID:</span>
                    <span className="font-mono font-bold text-blue-900">{receipt.trxId}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">স্ট্যাটাস:</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">অ্যাডমিন রিভিউাধীন (Pending)</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>মানি রিসিট প্রিন্ট</span>
                  </button>
                  <button
                    onClick={() => setReceipt(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
                  >
                    আরেকটি পেমেন্ট করুন
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      শিক্ষাবর্ষ *
                    </label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="2026">২০২৬ সেশন</option>
                      <option value="2025">২০২৫ সেশন</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      কোর্স নির্বাচন করুন *
                    </label>
                    <select
                      value={courseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      শিক্ষার্থীর রোল নম্বর * (ইনপুট দিলে তথ্য অটো আসবে)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: 101 বা 102"
                      value={roll}
                      onChange={(e) => handleRollLookup(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      শিক্ষার্থীর নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="শিক্ষার্থীর পূর্ণ নাম"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      কোন মাসের ফি? *
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="জানুয়ারি ২০২৬">জানুয়ারি ২০২৬</option>
                      <option value="ফেব্রুয়ারি ২০২৬">ফেব্রুয়ারি ২০২৬</option>
                      <option value="মার্চ ২০২৬">মার্চ ২০২৬</option>
                      <option value="এপ্রিল ২০২৬">এপ্রিল ২০২৬</option>
                      <option value="মে ২০২৬">মে ২০২৬</option>
                      <option value="জুন ২০২৬">জুন ২০২৬</option>
                      <option value="জুলাই ২০২৬">জুলাই ২০২৬</option>
                      <option value="আগস্ট ২০২৬">আগস্ট ২০২৬</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      টাকার পরিমাণ (টাকা) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ট্রানজেকশন আইডি (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: QR987654321A"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    বাংলা কিউআর দিয়ে পেমেন্ট সফল হওয়ার পর প্রাপ্ত TrxID প্রদান করুন। সাবমিট করলে তা সরাসরি অ্যাডমিন প্যানেলের এনরোলমেন্ট ও পেমেন্ট তালিকায় জমা হবে।
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>মাসিক ফি সাবমিট করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
