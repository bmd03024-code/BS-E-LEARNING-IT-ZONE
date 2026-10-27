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

// Certificates are English-only: never allow Bengali-script text into the printed record.
const containsBengali = (value: string) => /[\u0980-\u09FF]/.test(value || '');
const englishOnly = (value: string | undefined, fallback = '') => value && !containsBengali(value) ? value : fallback;

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
  const [editTitle, setEditTitle] = useState('SKILLS ACHIEVEMENT CERTIFICATE');
  const [editStudentName, setEditStudentName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editMotherName, setEditMotherName] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editGrade, setEditGrade] = useState('A+ (Excellent)');
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
    setEditTitle(cert.certificateTitle || 'SKILLS ACHIEVEMENT CERTIFICATE');
    setEditStudentName(englishOnly(cert.studentNameEnglish, englishOnly(cert.studentName)));
    setEditFatherName(englishOnly(cert.fatherName));
    setEditMotherName(englishOnly(cert.motherName));
    setEditRoll(cert.roll || '');
    setEditCourseTitle(englishOnly(cert.courseTitle, englishOnly(selectedCourse?.titleEnglish, '')));
    setEditDuration(cert.duration || selectedCourse?.duration || '6 Months (24 Weeks)');
    setEditGrade(cert.grade || 'A+ (Excellent)');
    setEditCertificateNo(cert.certificateNo || `BS-ZONE-${cert.academicYear}-${cert.roll.padStart(4, '0')}`);
    setEditIssueDate(cert.issueDate || new Date().toISOString().split('T')[0]);
    setEditAddress(englishOnly(cert.address, 'Dhaka, Bangladesh'));
    setEditBodyText(
      cert.bodyText ||
      `has successfully completed the ${cert.courseTitle || selectedCourse?.title} skills course (${cert.duration || selectedCourse?.duration || '6 months'}) and demonstrated the skills recorded in the final assessment. We wish the student continued success in future endeavors. This is an institutional skills-achievement certificate, not a government-issued academic certificate.`
    );
    setEditFounderName(englishOnly(cert.founderName, englishOnly(settings.founderName, 'Borhan Uddin Mahim')));
    setEditFounderTitle(englishOnly(cert.founderTitle, englishOnly(settings.founderTitle, 'Founder & Lead Instructor')));
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
        studentName: englishOnly(stdMatch.englishName, englishOnly(stdMatch.name)),
        studentNameEnglish: englishOnly(stdMatch.englishName, englishOnly(stdMatch.name)),
        fatherName: englishOnly(stdMatch.fatherNameEnglish, englishOnly(stdMatch.fatherName)),
        motherName: englishOnly(stdMatch.motherNameEnglish, englishOnly(stdMatch.motherName)),
        address: englishOnly(stdMatch.address, 'Dhaka, Bangladesh'),
        issueDate: new Date().toISOString().split('T')[0],
        certificateNo: `BS-ZONE-${stdMatch.academicYear}-${stdMatch.roll.padStart(4, '0')}`,
        grade: 'A+ (Excellent)',
        isFirstIssue: true,
        feePaid: isFreeCourse,
        isFree: isFreeCourse,
        feeAmount: certFee,
        hasEverPaid: isFreeCourse,
        hasGovtCert: !!selectedCourse.hasGovtCert,
        courseTitle: englishOnly(selectedCourse.titleEnglish),
        duration: selectedCourse.duration,
        institutionName: englishOnly(settings.name, 'BS E-LEARNING IT ZONE'),
        institutionSubName: englishOnly(settings.subName),
        founderName: englishOnly(settings.founderName, 'Borhan Uddin Mahim'),
        founderTitle: englishOnly(settings.founderTitle, 'Founder & Lead Instructor'),
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
      category: 'Certificate Fee',
      title: `Certificate Fee - Roll ${foundCert.roll} (${englishOnly(foundCert.studentName)})`,
      description: `QR payment transaction ID: ${trimmedTrx}`,
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
    triggerToast('Certificate fee paid successfully. The certificate is now unlocked.');
  };

  // Handle saving edits and switching to print layout
  const handleSaveAndSwitchToPrint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundCert) return;

    const requiredEnglishFields = [editTitle, editStudentName, editRoll, editCourseTitle, editDuration, editGrade, editCertificateNo, editIssueDate, editAddress, editFounderName, editFounderTitle];
    const optionalEnglishFields = [editFatherName, editMotherName, editBodyText];
    if (requiredEnglishFields.some(value => !value.trim() || containsBengali(value)) || optionalEnglishFields.some(containsBengali)) {
      triggerToast('Please enter English-only certificate details. Add the student English name and English course title before printing.');
      return;
    }

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
    triggerToast('Certificate details saved. Print layout is ready.');
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
                Course Completion Certificate
              </h2>
              <p className="text-xs text-amber-200">
                Search, edit, and print a certificate by academic year, course, and roll number
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
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="2026">2026 Session</option>
                <option value="2025">2025 Session</option>
                <option value="2027">2027 Session</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 mb-1" >Course</label>
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
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Student Roll *</label>
              <input
                type="text"
                required
                placeholder="e.g. 101 or 102"
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
                <span>Search Certificate</span>
              </button>
            </div>
          </form>

          {foundCert && (
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isFreeOrPaid
                    ? `Student: ${englishOnly(foundCert.studentName)} (Roll: ${foundCert.roll}) — Certificate is ready.`
                    : `Student: ${englishOnly(foundCert.studentName)} (Roll: ${foundCert.roll}) — Certificate fee: ${foundCert.feeAmount} BDT.`}
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
                    <span>Edit Text</span>
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
                    <span>Print Layout</span>
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
                  <h3 className="text-lg font-black text-slate-900">Certificate Fee Required</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Required certificate fee: <b className="text-amber-800 text-sm">{foundCert.feeAmount} BDT</b>।
                    Scan the payment QR code, pay the fee, and enter the transaction ID below.
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
                  <p className="font-bold text-slate-700">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Open bKash, Nagad, Rocket, or your banking app.</li>
                    <li>Select the QR payment option and scan the code above.</li>
                    <li>Pay <b>{foundCert.feeAmount} BDT</b> to complete the transaction.</li>
                    <li>Enter the <b>transaction ID</b> in the field below and submit.</li>
                  </ol>
                </div>

                <form onSubmit={handlePayFee} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Payment transaction ID (e.g., BL7A99X2)"
                      value={trxInput}
                      onChange={(e) => setTrxInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono uppercase text-center font-bold text-blue-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <span>Submit Fee and Unlock Certificate</span>
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
                      Certificate details are available in the fields below. Edit any information, then click <b>Save and Preview Certificate</b>.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewMode('print')}
                    className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-900" />
                    <span>Preview Certificate</span>
                  </button>
                </div>

                <form onSubmit={handleSaveAndSwitchToPrint} className="bg-slate-50/80 p-4 sm:p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      Edit Certificate Details
                    </span>
                    <span className="text-[11px] text-slate-500">All fields are editable</span>
                  </div>

                  {/* Row 1: Certificate Title & Certificate No */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Number</label>
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                      <input
                        type="text"
                        required
                        value={editStudentName}
                        onChange={(e) => setEditStudentName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name</label>
                      <input
                        type="text"
                        value={editFatherName}
                        onChange={(e) => setEditFatherName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Name</label>
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
                      <input
                        type="text"
                        value={editCourseTitle}
                        onChange={(e) => setEditCourseTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Result</label>
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date</label>
                      <input
                        type="text"
                        value={editIssueDate}
                        onChange={(e) => setEditIssueDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
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
                      Certificate Statement
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Signatory / Founder</label>
                      <input
                        type="text"
                        value={editFounderName}
                        onChange={(e) => setEditFounderName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
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
                      <span>Reset</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <Printer className="w-4 h-4 text-emerald-200" />
                      <span>Save and Preview Certificate</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ========================================================================= */
              /* CASE 3: BS ZONE FORMAL LANDSCAPE INSTITUTIONAL CERTIFICATE                 */
              /* ========================================================================= */
              <div className="space-y-4">
                {/* Print Action Bar */}
                <div className="no-print flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Certificate is ready. Click Print to print or save as PDF.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-md transition-all active:scale-98"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Download Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Branded printable certificate — landscape, layered ornamental-style border */}
                <div className="printable-area certificate-print-layout certificate-border relative bg-[#fffdf7] px-5 py-5 sm:px-10 sm:py-7 shadow-xl overflow-hidden text-center my-2 border-[10px] border-double border-[#716044] outline outline-1 outline-offset-[-17px] outline-[#c7ad70] font-serif min-h-[560px]" style={{ aspectRatio: '1.414 / 1', backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.96) 0%, rgba(255,253,247,0.98) 72%, rgba(243,235,214,0.95) 100%)' }}>
                  
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
                  <div className="relative z-10 flex justify-between items-center text-[9px] sm:text-[11px] text-[#343434] pb-2 border-b border-[#9b8964] font-serif tracking-wide">
                    <span>Certificate No.: <b className="text-slate-900 font-bold">{foundCert.certificateNo}</b></span>
                    <span>Issue Date: <b className="text-slate-900 font-bold">{foundCert.issueDate}</b></span>
                  </div>

                  {/* Institution Branding: existing site logo and institution details */}
                  <div className="relative z-10 mt-3 space-y-1">
                    {(settings.logoUrl || settings.watermarkUrl) && (
                      <div className="flex justify-center mb-3">
                        <img src={settings.logoUrl || settings.watermarkUrl} alt="Institution Logo" className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] object-contain" />
                      </div>
                    )}
                    <h3 className="text-lg sm:text-2xl font-bold text-[#171717] tracking-[0.06em] uppercase leading-tight">
                      {englishOnly(foundCert.institutionName, 'BS E-LEARNING IT ZONE')}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-700 font-medium">
                      {englishOnly(foundCert.institutionSubName, englishOnly(settings.subName))}{englishOnly(settings.address) ? ` • ${englishOnly(settings.address)}` : ''}
                    </p>
                    
                    <div className="pt-2">
                      <span className="inline-block px-4 py-1.5 text-[#242424] font-bold text-xs sm:text-base tracking-[0.1em] uppercase border-y-2 border-[#9b8964]">
                        {foundCert.certificateTitle || 'SKILLS ACHIEVEMENT CERTIFICATE'}
                      </span>
                    </div>
                  </div>

                  {/* Body Text & Student Details */}
                  <div className="relative z-10 mt-5 space-y-3 sm:space-y-4 text-[#292929] max-w-3xl mx-auto text-sm sm:text-base leading-relaxed">
                    
                    <p className="text-slate-600 font-medium text-xs sm:text-sm">
                      This is to certify that
                    </p>

                    <h4 className="text-xl sm:text-3xl font-bold italic text-[#171717] underline decoration-[#8c7a55] decoration-1 underline-offset-4 leading-snug">
                      {englishOnly(foundCert.studentName)}
                    </h4>

                    {/* Parents' Names & Address Box */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs text-[#303030] bg-transparent p-2.5 border-y border-[#b6a477] leading-relaxed">
                      <div>
                        Father’s Name: <b className="text-slate-900 font-bold">{englishOnly(foundCert.fatherName, 'N/A')}</b>
                      </div>
                      <span className="hidden sm:inline text-amber-500">•</span>
                      <div>
                        Mother’s Name: <b className="text-slate-900 font-bold">{englishOnly(foundCert.motherName, 'N/A')}</b>
                      </div>
                      <span className="hidden sm:inline text-amber-500">•</span>
                      <div>
                        Roll No.: <b className="text-blue-900 font-bold font-mono">{foundCert.roll}</b>
                      </div>
                      {foundCert.address && (
                        <>
                          <span className="hidden sm:inline text-amber-500">•</span>
                          <div>
                            Address: <b className="text-slate-800 font-medium">{foundCert.address}</b>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Main Certification Statement */}
                    <div className="p-2 sm:p-3 bg-transparent text-justify sm:text-center text-[11px] sm:text-xs text-slate-800 leading-relaxed font-medium">
                      {englishOnly(foundCert.bodyText) || (
                        <span>
                          has successfully completed the <b>{englishOnly(foundCert.courseTitle, englishOnly(selectedCourse.titleEnglish, ''))}</b> skills course ({foundCert.duration || selectedCourse.duration}) and demonstrated the skills recorded in the final assessment. We wish the student continued success in future endeavors. This is an institutional skills-achievement certificate, not a government-issued academic certificate.
                        </span>
                      )}
                    </div>

                    {foundCert.hasGovtCert && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>Government-approved certificate status is recorded for this student.</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Signature, Seal & QR Code */}
                  <div className="relative z-10 mt-5 sm:mt-7 pt-3 border-t border-[#b8aa8c] flex items-end justify-between gap-3 px-0 sm:px-5">
                    
                    {/* Institutional Seal */}
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.institutionSealUrl}
                        alt="Institutional Seal"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain filter drop-shadow-xs"
                      />
                      <span className="text-[9px] font-bold text-slate-600 mt-1">BS Zone Institutional Mark</span>
                    </div>

                    {/* Verification QR / Signature Seal */}
                    <div className="flex flex-col items-center">
                      <div className="p-1.5 bg-white rounded-xl border border-slate-300 shadow-xs">
                        <QrCode className="w-12 h-12 text-slate-900" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 mt-1">Certificate Reference</span>
                    </div>

                    {/* Principal Signature */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative min-h-[48px] flex items-end justify-center">
                        <img
                          src={settings.signatureUrl}
                          alt="Principal's Signature"
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                      <div className="w-40 border-t-2 border-slate-900 mt-1 pt-1">
                        <p className="text-sm font-black text-slate-950">{foundCert.founderName || settings.founderName}</p>
                        <p className="text-[11px] text-slate-600 font-semibold">{foundCert.founderTitle || settings.founderTitle}</p>
                        <p className="text-[10px] text-blue-900 font-bold">{englishOnly(foundCert.institutionName, 'BS E-LEARNING IT ZONE')}</p>
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
                No student or certificate was found for this roll number.
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please enter the correct academic year, course, and roll number (e.g., 101 or 102).
              </p>
            </div>
          ) : (
            <div className="text-center py-14 text-slate-400 space-y-2">
              <Award className="w-14 h-14 mx-auto text-amber-400/70" />
              <h4 className="text-sm font-bold text-slate-700">Search for a Certificate</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter the academic year, course, and roll number above, then click <b>Search Certificate</b>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
