import React, { useState } from 'react';
import { Course, CertificateRecord, LedgerItem } from '../../types';
import { storage } from '../../services/storage';
import { masterGateway } from '../../services/masterGateway';
import {
  X,
  Award,
  Search,
  Printer,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Edit3,
  RotateCcw,
  Sparkles,
  FileText
} from 'lucide-react';
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
  const [searched, setSearched] = useState(false);
  const [foundCert, setFoundCert] = useState<CertificateRecord | null>(null);
  const [trxInput, setTrxInput] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View mode: 'edit' (default editable text fields) or 'print' (luxury printable certificate layout)
  const [viewMode, setViewMode] = useState<'edit' | 'print'>('edit');

  // Editable Form Fields State
  const [editTitle, setEditTitle] = useState('কোর্স সমাপ্তি সনদপত্র • CERTIFICATE OF COMPLETION');
  const [editStudentName, setEditStudentName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editMotherName, setEditMotherName] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editGrade, setEditGrade] = useState('A+ (প্রথম শ্রেণি)');
  const [editCertificateNo, setEditCertificateNo] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBodyText, setEditBodyText] = useState('');
  const [editFounderName, setEditFounderName] = useState('');
  const [editFounderTitle, setEditFounderTitle] = useState('');

  if (!isOpen) return null;

  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const populateEditFields = (cert: CertificateRecord) => {
    setEditTitle(cert.certificateTitle || 'কোর্স সমাপ্তি সনদপত্র • CERTIFICATE OF COMPLETION');
    setEditStudentName(cert.studentName || '');
    setEditFatherName(cert.fatherName || '');
    setEditMotherName(cert.motherName || '');
    setEditRoll(cert.roll || '');
    setEditCourseTitle(cert.courseTitle || selectedCourse?.title || '');
    setEditDuration(cert.duration || selectedCourse?.duration || '৬ মাস (২৪ সপ্তাহ)');
    setEditGrade(cert.grade || 'A+ (প্রথম শ্রেণি)');
    setEditCertificateNo(cert.certificateNo || `BS-ZONE-${cert.academicYear}-${cert.roll.padStart(4, '0')}`);
    setEditIssueDate(cert.issueDate || new Date().toISOString().split('T')[0]);
    setEditAddress(cert.address || 'ঢাকা, বাংলাদেশ');
    setEditBodyText(
      cert.bodyText ||
      `সফলতার সাথে আমাদের প্রতিষ্ঠানে ${cert.courseTitle || selectedCourse?.title} কোর্সটি (${cert.duration || selectedCourse?.duration || '৬ মাস'}) কৃতিত্বের সাথে সম্পন্ন করেছেন এবং চূড়ান্ত মূল্যায়ন পরীক্ষায় "${cert.grade || 'A+ (প্রথম শ্রেণি)'}" অর্জন করেছেন। আমরা তার ভবিষ্যৎ জীবনের সর্বাঙ্গীন সাফল্য ও উন্নতি কামনা করি।`
    );
    setEditFounderName(cert.founderName || settings.founderName || 'বোরহানউদ্দিন মহিম');
    setEditFounderTitle(cert.founderTitle || settings.founderTitle || 'প্রতিষ্ঠাতা ও প্রধান প্রশিক্ষক');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setPaymentSuccess(false);

    const trimmedRoll = roll.trim();
    if (!trimmedRoll) return;

    // 1. Search in saved/published certificates
    const allCerts = storage.getCertificates();
    const certMatch = allCerts.find(
      c => c.roll === trimmedRoll && c.academicYear === academicYear && c.courseId === courseId
    );

    if (certMatch) {
      setFoundCert(certMatch);
      populateEditFields(certMatch);
      setViewMode('edit');
      return;
    }

    // 2. Search in student database
    const students = storage.getStudents();
    const stdMatch = students.find(
      s => s.roll === trimmedRoll && s.academicYear === academicYear && s.courseId === courseId
    );

    if (stdMatch) {
      const isFreeCourse = selectedCourse.certificateFee === 0 || courseId === 'course-quran';
      const certFee = isFreeCourse ? 0 : (selectedCourse.certificateFee || 200);

      const newCert: CertificateRecord = {
        id: `cert-gen-${Date.now()}`,
        academicYear,
        courseId,
        roll: stdMatch.roll,
        studentName: stdMatch.name,
        fatherName: stdMatch.fatherName,
        motherName: stdMatch.motherName,
        address: stdMatch.address || 'ঢাকা, বাংলাদেশ',
        issueDate: new Date().toISOString().split('T')[0],
        certificateNo: `BS-ZONE-${stdMatch.academicYear}-${stdMatch.roll.padStart(4, '0')}`,
        grade: 'A+ (প্রথম শ্রেণি)',
        isFirstIssue: true,
        feePaid: isFreeCourse,
        isFree: isFreeCourse,
        feeAmount: certFee,
        hasEverPaid: isFreeCourse,
        hasGovtCert: !!selectedCourse.hasGovtCert,
        courseTitle: selectedCourse.title,
        duration: selectedCourse.duration,
        institutionName: settings.name,
        institutionSubName: settings.subName,
        founderName: settings.founderName,
        founderTitle: settings.founderTitle,
        published: true
      };
      setFoundCert(newCert);
      populateEditFields(newCert);
      setViewMode('edit');
    } else {
      setFoundCert(null);
    }
  };

  // Submit Bangla QR payment TrxID
  const handlePayFee = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTrx = trxInput.trim();
    if (!trimmedTrx || !foundCert) return;

    const updatedCert: CertificateRecord = {
      ...foundCert,
      feePaid: true,
      hasEverPaid: true
    };

    const allCerts = storage.getCertificates();
    const filtered = allCerts.filter(c => !(c.roll === foundCert.roll && c.courseId === foundCert.courseId));
    const newCertList = [updatedCert, ...filtered];

    storage.saveCertificates(newCertList);

    // Record in ledger
    const newLedgerItem: LedgerItem = {
      id: `ledger-cert-${Date.now()}`,
      type: 'income',
      category: 'সনদপত্র ফি',
      title: `সনদপত্র ফি - রোল ${foundCert.roll} (${foundCert.studentName})`,
      description: `বাংলা কিউআর পেমেন্ট TrxID: ${trimmedTrx}`,
      amount: foundCert.feeAmount,
      date: new Date().toISOString().split('T')[0],
      academicYear: foundCert.academicYear
    };
    storage.saveLedger([newLedgerItem, ...storage.getLedger()]);

    masterGateway.publish('certificates', newCertList);
    masterGateway.publish('ledger', [newLedgerItem, ...storage.getLedger()]);

    setFoundCert(updatedCert);
    populateEditFields(updatedCert);
    setTrxInput('');
    setPaymentSuccess(true);
    setViewMode('edit');
    triggerToast('সনদ ফি সফলভাবে পরিশোধিত হয়েছে! সনদপত্রটি আনলক করা হয়েছে।');
  };

  // Handle saving edits and switching to print layout
  const handleSaveAndSwitchToPrint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundCert) return;

    const updatedCert: CertificateRecord = {
      ...foundCert,
      certificateTitle: editTitle,
      studentName: editStudentName,
      fatherName: editFatherName,
      motherName: editMotherName,
      roll: editRoll,
      courseTitle: editCourseTitle,
      duration: editDuration,
      grade: editGrade,
      certificateNo: editCertificateNo,
      issueDate: editIssueDate,
      address: editAddress,
      bodyText: editBodyText,
      founderName: editFounderName,
      founderTitle: editFounderTitle
    };

    setFoundCert(updatedCert);

    // Update in storage as well
    const allCerts = storage.getCertificates();
    const filtered = allCerts.filter(c => !(c.roll === updatedCert.roll && c.courseId === updatedCert.courseId));
    const newCertList = [updatedCert, ...filtered];
    storage.saveCertificates(newCertList);
    masterGateway.publish('certificates', newCertList);

    setViewMode('print');
    triggerToast('সনদের লেখা সংরক্ষিত হয়েছে এবং প্রিন্ট লেআউট প্রস্তুত করা হয়েছে!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Check if free or already paid
  const isFreeOrPaid = foundCert && (foundCert.isFree || foundCert.feePaid || foundCert.hasEverPaid || foundCert.feeAmount === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-amber-600 via-blue-950 to-slate-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white">
                কোর্স সমাপ্তি সনদপত্র (Course Certificate)
              </h2>
              <p className="text-xs text-amber-200">
                শিক্ষাবর্ষ, কোর্স ও রোল নম্বর দিয়ে সনদ অনুসন্ধান, এডিট ও প্রিন্ট করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar: Academic Year, Course, and Roll */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0">
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
                <option value="2027">২০২৭ সেশন</option>
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
              <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর রোল *</label>
              <input
                type="text"
                required
                placeholder="যেমন: 101 বা 102"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-blue-900 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>সনদ খুঁজুন</span>
              </button>
            </div>
          </form>

          {foundCert && (
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isFreeOrPaid
                    ? `শিক্ষার্থী: ${foundCert.studentName} (রোল: ${foundCert.roll}) — সনদপত্রটি সফলভাবে প্রস্তুত আছে!`
                    : `শিক্ষার্থী: ${foundCert.studentName} (রোল: ${foundCert.roll}) — এই কোর্সের সনদের জন্য নির্ধারিত ফি: ${toBengaliNum(foundCert.feeAmount)} টাকা।`}
                </span>
              </div>

              {isFreeOrPaid && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      viewMode === 'edit'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>টেক্সট এডিট মোড</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('print')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      viewMode === 'print'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>প্রিন্ট লেআউট</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto grow">
          {foundCert ? (
            !isFreeOrPaid ? (
              /* ========================================================================= */
              /* CASE 1: PAID CERTIFICATE (বাংলা কিউআর কোড এবং TrxID সাবমিশন)             */
              /* ========================================================================= */
              <div className="max-w-md mx-auto p-6 bg-slate-50 border-2 border-amber-300 rounded-3xl text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                  <CreditCard className="w-7 h-7" />
                </div>
                
                <div>
                  <h3 className="text-lg font-black text-slate-900">সনদপত্র ফি পরিশোধ আবশ্যক</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    এই সনদের জন্য নির্ধারিত ফি: <b className="text-amber-800 text-sm">{toBengaliNum(foundCert.feeAmount)} টাকা</b>।
                    বাংলা কিউআর কোড স্ক্যান করে ফি পরিশোধ করে নিচে TrxID দিন।
                  </p>
                </div>

                {/* Bangla QR Code Image */}
                <div className="w-52 h-52 mx-auto bg-white p-2.5 rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center">
                  <img
                    src={settings.banglaQrUrl}
                    alt="Bangla QR"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 text-left space-y-1">
                  <p className="font-bold text-slate-700">পেমেন্ট করার নিয়ম:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>বিকাশ, নগদ, রকেট বা যেকোনো ব্যাংক অ্যাপ ওপেন করুন।</li>
                    <li>"বাংলা কিউআর (QR)" অপশনে গিয়ে উপরের কোডটি স্ক্যান করুন।</li>
                    <li>টাকার পরিমাণ <b>{toBengaliNum(foundCert.feeAmount)}৳</b> দিয়ে পেমেন্ট সম্পন্ন করুন।</li>
                    <li>পেমেন্ট শেষে পাওয়া <b>TrxID</b> নিচের বক্সে লিখে সাবমিট করুন।</li>
                  </ol>
                </div>

                <form onSubmit={handlePayFee} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="বাংলা কিউআর পেমেন্ট TrxID (যেমন: BL7A99X2)"
                      value={trxInput}
                      onChange={(e) => setTrxInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono uppercase text-center font-bold text-blue-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <span>ফি সাবমিট করুন ও সনদ আনলক করুন</span>
                    <ArrowRight className="w-4 h-4 text-emerald-200" />
                  </button>
                </form>
              </div>
            ) : viewMode === 'edit' ? (
              /* ========================================================================= */
              /* CASE 2: EDITABLE CERTIFICATE VIEW (ডিফল্টভাবে সব লেখা টেক্সট বক্সে আসবে)   */
              /* ========================================================================= */
              <div className="space-y-4">
                <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      সনদের সম্পূর্ণ লেখা নিচে ইনপুট ফিল্ড ও বক্সে সাজানো আছে। যেকোনো তথ্য এডিট করার পর <b>"সাবমিট ও প্রিন্ট লেআউট দেখুন"</b> বাটনে চাপ দিন।
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewMode('print')}
                    className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-900" />
                    <span>সরাসরি প্রিন্ট প্রিভিউ দেখুন</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAndSwitchToPrint} className="bg-slate-50/80 p-4 sm:p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      সনদের লেখা ও তথ্য সংশোধন ফরম
                    </span>
                    <span className="text-[11px] text-slate-500">সকল ফিল্ড এডিটেবল</span>
                  </div>

                  {/* Row 1: Certificate Title & Certificate No */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">সনদপত্রের শিরোনাম (Title)</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">সনদ নম্বর (Certificate No)</label>
                      <input
                        type="text"
                        value={editCertificateNo}
                        onChange={(e) => setEditCertificateNo(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-blue-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Row 2: Student Name & Roll */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম (Student Name)</label>
                      <input
                        type="text"
                        required
                        value={editStudentName}
                        onChange={(e) => setEditStudentName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">রোল নম্বর (Roll)</label>
                      <input
                        type="text"
                        required
                        value={editRoll}
                        onChange={(e) => setEditRoll(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white text-blue-950 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Row 3: Father's Name & Mother's Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">পিতার নাম (Father's Name)</label>
                      <input
                        type="text"
                        value={editFatherName}
                        onChange={(e) => setEditFatherName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">মাতার নাম (Mother's Name)</label>
                      <input
                        type="text"
                        value={editMotherName}
                        onChange={(e) => setEditMotherName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Row 4: Course Title, Duration & Grade */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">কোর্সের নাম (Course Title)</label>
                      <input
                        type="text"
                        value={editCourseTitle}
                        onChange={(e) => setEditCourseTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">মেয়াদকাল (Duration)</label>
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">গ্রেড / ফলাফল (Grade)</label>
                      <input
                        type="text"
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-emerald-800"
                      />
                    </div>
                  </div>

                  {/* Row 5: Issue Date & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ইস্যুর তারিখ (Issue Date)</label>
                      <input
                        type="text"
                        value={editIssueDate}
                        onChange={(e) => setEditIssueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ঠিকানা (Address)</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Row 6: Main Certificate Statement / Body Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সনদের মূল বক্তব্য (Certificate Body Text / Statement)
                    </label>
                    <textarea
                      rows={3}
                      value={editBodyText}
                      onChange={(e) => setEditBodyText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  {/* Row 7: Principal / Signatory Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">স্বাক্ষরকারী / প্রতিষ্ঠাতা</label>
                      <input
                        type="text"
                        value={editFounderName}
                        onChange={(e) => setEditFounderName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">পদবী</label>
                      <input
                        type="text"
                        value={editFounderTitle}
                        onChange={(e) => setEditFounderTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => populateEditFields(foundCert)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>রিসেট করুন</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <Printer className="w-4 h-4 text-emerald-200" />
                      <span>সাবমিট ও প্রিন্ট লেআউট দেখুন</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ========================================================================= */
              /* CASE 3: LUXURY PRINTABLE LAYOUT                                           */
              /* ========================================================================= */
              <div className="space-y-4">
                {/* Print Action Bar */}
                <div className="no-print flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>সনদপত্র প্রস্তুত! নিচের প্রিন্ট বাটনে ক্লিক করে সরাসরি প্রিন্ট বা PDF ডাউনলোড করুন।</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>তথ্য পুনরায় এডিট করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all active:scale-98"
                    >
                      <Printer className="w-4 h-4" />
                      <span>সনদপত্র প্রিন্ট / ডাউনলোড করুন</span>
                    </button>
                  </div>
                </div>

                {/* The Luxury Official Printable Certificate */}
                <div className="printable-area certificate-print-layout certificate-border relative bg-white p-8 sm:p-12 shadow-xl overflow-hidden text-center my-2">
                  
                  {/* Subtle Center Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none">
                    {(settings.watermarkUrl || settings.logoUrl) ? (
                      <img
                        src={settings.watermarkUrl || settings.logoUrl}
                        alt="Watermark"
                        className="w-80 h-80 object-contain filter grayscale"
                      />
                    ) : (
                      <div className="w-80 h-80 rounded-full border-12 border-dashed border-blue-950 flex flex-col items-center justify-center text-center p-6">
                        <span className="text-5xl font-black text-blue-950">BS ZONE</span>
                        <span className="text-sm font-bold text-slate-800 mt-2">E-LEARNING &amp; IT</span>
                      </div>
                    )}
                  </div>

                  {/* Top Number & Date Bar */}
                  <div className="relative z-10 flex justify-between items-center text-xs text-slate-600 pb-4 border-b border-amber-300/60 font-mono">
                    <span>সনদ নং: <b className="text-slate-900 font-bold">{foundCert.certificateNo}</b></span>
                    <span>ইস্যুর তারিখ: <b className="text-slate-900 font-bold">{foundCert.issueDate}</b></span>
                  </div>

                  {/* Institution Branding */}
                  <div className="relative z-10 mt-6 space-y-1">
                    <h3 className="text-2xl sm:text-4xl font-black text-blue-950 tracking-wider">
                      {foundCert.institutionName || settings.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {foundCert.institutionSubName || settings.subName} • {settings.address}
                    </p>
                    
                    <div className="pt-3">
                      <span className="inline-block px-6 py-1.5 rounded-full bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-amber-300 font-extrabold text-xs sm:text-base tracking-widest uppercase border border-amber-400 shadow-xs">
                        {foundCert.certificateTitle || 'সনদপত্র • CERTIFICATE OF COMPLETION'}
                      </span>
                    </div>
                  </div>

                  {/* Body Text & Student Details */}
                  <div className="relative z-10 mt-8 space-y-5 text-slate-800 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                    
                    <p className="text-slate-600 font-medium text-xs sm:text-sm">
                      এই মর্মে অত্যন্ত আনন্দের সাথে প্রত্যয়ন করা যাচ্ছে যে,
                    </p>

                    <h4 className="text-2xl sm:text-3xl font-extrabold text-blue-950 underline decoration-amber-400 decoration-2 underline-offset-8">
                      {foundCert.studentName}
                    </h4>

                    {/* Parents' Names & Address Box */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-xs sm:text-sm text-slate-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
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
                            ঠিকানা: <b className="text-slate-800 font-medium">{foundCert.address}</b>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Main Certification Statement */}
                    <div className="p-4 rounded-2xl bg-white/60 border border-amber-200/60 shadow-xs text-justify sm:text-center text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {foundCert.bodyText || (
                        <span>
                          সফলতার সাথে আমাদের প্রতিষ্ঠানে <b>{foundCert.courseTitle || selectedCourse.title}</b> কোর্সটি ({foundCert.duration || selectedCourse.duration}) কৃতিত্বের সাথে সম্পন্ন করেছেন এবং চূড়ান্ত মূল্যায়ন পরীক্ষায় <b>"{foundCert.grade}"</b> অর্জন করেছেন। আমরা তার ভবিষ্যৎ জীবনের সর্বাঙ্গীন সাফল্য ও উন্নতি কামনা করি।
                        </span>
                      )}
                    </div>

                    {foundCert.hasGovtCert && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>অনলাইন সনদের পাশাপাশি সরকারি সার্টিফিকেট (Govt. Approved) তালিকাভুক্ত</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Signature, Seal & QR Code */}
                  <div className="relative z-10 mt-12 pt-6 border-t border-amber-300/60 flex items-end justify-between px-2 sm:px-6">
                    
                    {/* Institutional Seal */}
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.institutionSealUrl}
                        alt="প্রাতিষ্ঠানিক সিল"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-xs"
                      />
                      <span className="text-[10px] font-bold text-slate-600 mt-1">প্রাতিষ্ঠানিক সিল</span>
                    </div>

                    {/* Verification QR / Signature Seal */}
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 bg-white rounded-xl border border-slate-300 shadow-xs">
                        <QrCode className="w-12 h-12 text-slate-900" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 mt-1">ডিজিটাল ভেরিফিকেশন</span>
                    </div>

                    {/* Principal Signature */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative min-h-[48px] flex items-end justify-center">
                        <img
                          src={settings.signatureUrl}
                          alt="স্বাক্ষর"
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="w-40 border-t-2 border-slate-900 mt-1 pt-1">
                        <p className="text-sm font-black text-slate-950">{foundCert.founderName || settings.founderName}</p>
                        <p className="text-[11px] text-slate-600 font-semibold">{foundCert.founderTitle || settings.founderTitle}</p>
                        <p className="text-[10px] text-blue-900 font-bold">{foundCert.institutionName || settings.name}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )
          ) : searched ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                এই রোল নম্বরের কোনো শিক্ষার্থী বা সনদপত্র পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অনুগ্রহ করে সঠিক শিক্ষাবর্ষ, কোর্স ও রোল নম্বর (যেমন: 101, 102) প্রদান করুন।
              </p>
            </div>
          ) : (
            <div className="text-center py-14 text-slate-400 space-y-2">
              <Award className="w-14 h-14 mx-auto text-amber-400/70" />
              <h4 className="text-sm font-bold text-slate-700">সনদপত্র অনুসন্ধান করুন</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                উপরে শিক্ষাবর্ষ, কোর্স ও আপনার রোল নম্বর ইনপুট দিয়ে <b>"সনদ খুঁজুন"</b> বাটনে চাপ দিন।
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
