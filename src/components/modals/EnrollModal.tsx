import React, { useState } from 'react';
import { Course, EnrollmentApplication, InstituteSettings } from '../../types';
import { storage, compressImage } from '../../services/storage';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, UserCheck, Phone, CreditCard, Sparkles, Printer, Upload, Image as ImageIcon } from 'lucide-react';
import { toBengaliNum } from '../home/CoursesSection';

interface EnrollModalProps {
  course: Course | null;
  courses: Course[];
  isOpen: boolean;
  onClose: () => void;
  settings: InstituteSettings;
  onSuccess: (app: EnrollmentApplication) => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({
  course,
  courses,
  isOpen,
  onClose,
  settings,
  onSuccess
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState(course?.id || courses[0]?.id || '');
  const [academicYear, setAcademicYear] = useState('2026');
  
  // Required fields
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Optional fields
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [address, setAddress] = useState('');
  
  const [trxId, setTrxId] = useState('');
  const [submittedApp, setSubmittedApp] = useState<EnrollmentApplication | null>(null);

  if (!isOpen) return null;

  const activeCourse = courses.find(c => c.id === selectedCourseId) || course || courses[0];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.75);
        setPhotoUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !englishName.trim() || !phone.trim() || !photoUrl || !trxId.trim()) {
      alert('অনুগ্রহ করে আবশ্যিক তথ্যগুলো পূরণ করুন (শিক্ষার্থীর ছবি, নাম, মোবাইল নম্বর এবং TrxID)।');
      return;
    }

    const newApplication: EnrollmentApplication = {
      id: `app-adm-${Date.now()}`,
      type: 'admission',
      courseId: activeCourse.id,
      academicYear,
      studentName: name.trim(),
      studentNameEnglish: englishName.trim(),
      phone: phone.trim(),
      photoUrl,
      fatherName: fatherName.trim() || undefined,
      motherName: motherName.trim() || undefined,
      address: address.trim() || undefined,
      amount: activeCourse.admissionFee,
      trxId: trxId.trim().toUpperCase(),
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const existingApps = storage.getApplications();
    storage.saveApplications([newApplication, ...existingApps]);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setSubmittedApp(newApplication);
    onSuccess(newApplication);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অনলাইন ভর্তি ও কোর্স রেজিস্ট্রেশন</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {submittedApp ? 'ভর্তি আবেদন সফলভাবে দাখিল হয়েছে' : activeCourse.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            নির্ধারিত ভর্তি ফি: <b className="text-amber-400 font-bold">{toBengaliNum(activeCourse.admissionFee)} টাকা</b>
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto grow">
          {submittedApp ? (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  ধন্যবাদ! আপনার ভর্তি আবেদন জমা হয়েছে
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  আপনার আবেদন ও পেমেন্ট TrxID অ্যাডমিন প্যানেলের "এনরোলমেন্ট লিস্ট"-এ জমা হয়েছে। অ্যাডমিন প্যানেল থেকে যাচাই করে এক্সেপ্ট (Accept) করা মাত্রই আপনার রোল নম্বর স্বয়ংক্রিয়ভাবে প্রদান করা হবে।
                </p>
              </div>

              {/* Printable Submission Receipt */}
              <div className="printable-area max-w-md mx-auto bg-slate-50 border-2 border-dashed border-blue-900/30 rounded-2xl p-5 text-left text-xs sm:text-sm relative overflow-hidden shadow-xs space-y-2.5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-300">
                  <img src={submittedApp.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-blue-900" />
                  <div>
                    <h4 className="font-extrabold text-blue-950 text-base">{submittedApp.studentName}</h4>
                    <p className="text-xs text-slate-600 font-mono">{submittedApp.phone}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      ভর্তি আবেদন পেন্ডিং (Pending Approval)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">কোর্স:</span>
                    <span className="font-bold text-blue-900">{activeCourse.title}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">শিক্ষাবর্ষ:</span>
                    <span className="font-semibold text-slate-800">{submittedApp.academicYear} সেশন</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">পেমেন্ট TrxID:</span>
                    <span className="font-mono font-bold text-emerald-800">{submittedApp.trxId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">টাকার পরিমাণ:</span>
                    <span className="font-bold text-emerald-800">{toBengaliNum(submittedApp.amount)} টাকা</span>
                  </div>
                  <div className="flex justify-between pt-1 text-[11px] text-slate-500">
                    <span>আবেদনের তারিখ:</span>
                    <span>{submittedApp.appliedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>রসিদ প্রিন্ট করুন</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  সমাপ্ত করুন
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Section: Bangla QR + bKash, Nagad, Rocket Numbers */}
              <div className="p-4 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-2xl text-white text-xs space-y-4 shadow-sm border border-blue-900/40">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* QR Box */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl p-1.5 shrink-0 overflow-hidden shadow-md flex items-center justify-center border-2 border-amber-400">
                    <img src={settings.banglaQrUrl} alt="Bangla QR" className="w-full h-full object-contain" />
                  </div>

                  {/* QR & Instruction */}
                  <div className="space-y-1.5 grow text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                        বাংলা কিউআর ও এমএফএস পেমেন্ট
                      </span>
                      <span className="text-[11px] font-bold text-amber-300">
                        ভর্তি ফি: {toBengaliNum(activeCourse.admissionFee)}৳
                      </span>
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-slate-100 leading-snug">
                      {settings.banglaQrHeading || 'বিকাশ, নগদ বা যেকোনো ব্যাংকিং অ্যাপ দিয়ে কিউআর স্ক্যান করুন অথবা নিচের নম্বরে পেমেন্ট করুন:'}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      টাকা পাঠানোর পর প্রাপ্ত TrxID নিচের ফর্মে লিখে আবেদনটি সাবমিট করুন।
                    </p>
                  </div>
                </div>

                {/* Direct bKash, Nagad, Rocket Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
                  {/* bKash */}
                  <div className="bg-pink-950/70 border border-pink-700/60 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[11px] text-pink-300">বিকাশ (bKash)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-pink-500/30 text-pink-200 font-bold">Personal / Merchant</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white tracking-wider">
                        {settings.bkashNumber?.split(' ')[0] || '01612118307'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.bkashNumber?.split(' ')[0] || '01612118307');
                          alert('বিকাশ নম্বর কপি করা হয়েছে!');
                        }}
                        className="text-[10px] font-bold text-pink-300 hover:text-white underline cursor-pointer"
                      >
                        কপি
                      </button>
                    </div>
                  </div>

                  {/* Nagad */}
                  <div className="bg-orange-950/70 border border-orange-700/60 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[11px] text-orange-300">নগদ (Nagad)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-orange-500/30 text-orange-200 font-bold">Personal</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white tracking-wider">
                        {settings.nagadNumber?.split(' ')[0] || '01612118307'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.nagadNumber?.split(' ')[0] || '01612118307');
                          alert('নগদ নম্বর কপি করা হয়েছে!');
                        }}
                        className="text-[10px] font-bold text-orange-300 hover:text-white underline cursor-pointer"
                      >
                        কপি
                      </button>
                    </div>
                  </div>

                  {/* Rocket */}
                  <div className="bg-purple-950/70 border border-purple-700/60 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[11px] text-purple-300">রকেট (Rocket)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-purple-500/30 text-purple-200 font-bold">Personal</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white tracking-wider">
                        {settings.rocketNumber?.split(' ')[0] || '01612118307-7'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.rocketNumber?.split(' ')[0] || '01612118307-7');
                          alert('রকেট নম্বর কপি করা হয়েছে!');
                        }}
                        className="text-[10px] font-bold text-purple-300 hover:text-white underline cursor-pointer"
                      >
                        কপি
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    শিক্ষাবর্ষ *
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white"
                  >
                    <option value="2026">২০২৬ সেশন</option>
                    <option value="2025">২০২৫ সেশন</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কোর্স নির্বাচন করুন:
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({toBengaliNum(c.admissionFee)}৳)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Required Student Photo Upload */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  শিক্ষার্থীর ছবি আপলোড * (আবশ্যিক)
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Student Preview" className="w-16 h-16 rounded-full object-cover border-2 border-blue-900 shadow-xs" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="grow">
                    <input
                      type="file"
                      accept="image/*"
                      required={!photoUrl}
                      onChange={handlePhotoUpload}
                      className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">আইডি কার্ড ও সনদে ব্যবহারের জন্য পাসপোর্ট সাইজের ছবি আপলোড করুন</p>
                  </div>
                </div>
              </div>

              {/* Required Fields: Bengali and English names + phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বাংলা নাম * (আবশ্যিক)</label>
                  <input type="text" required placeholder="বাংলায় পূর্ণ নাম লিখুন" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ইংরেজি নাম * (আবশ্যিক)</label>
                  <input type="text" required placeholder="ইংরেজিতে পূর্ণ নাম লিখুন" value={englishName} onChange={(e) => setEnglishName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white" lang="en" autoComplete="name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর * (আবশ্যিক)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white font-mono"
                  />
                </div>
              </div>

              {/* Optional Fields: Father, Mother, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    পিতার নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="পিতার নাম"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    মাতার নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="মাতার নাম"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ঠিকানা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="বর্তমান বা স্থায়ী ঠিকানা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
              </div>

              {/* TrxID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বাংলা কিউআর পেমেন্ট TrxID * (আবশ্যিক)
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

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>ভর্তি আবেদন দাখিল করুন</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
