import React, { useState } from 'react';
import { Course, Student } from '../../types';
import { storage } from '../../services/storage';
import { X, Search, Printer, AlertCircle, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialStudent?: Student | null;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialStudent
}) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [roll, setRoll] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(initialStudent || null);
  const [errorMsg, setErrorMsg] = useState('');

  const settings = storage.getSettings();

  React.useEffect(() => {
    if (initialStudent) {
      setFoundStudent(initialStudent);
      setAcademicYear(initialStudent.academicYear);
      setCourseId(initialStudent.courseId);
      setRoll(initialStudent.roll);
    }
  }, [initialStudent]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!roll.trim()) {
      setErrorMsg("Please enter the student's roll number.");
      return;
    }

    const students = storage.getStudents();
    const match = students.find(
      s => s.academicYear === academicYear &&
           s.courseId === courseId &&
           s.roll.trim() === roll.trim()
    );

    if (match) {
      setFoundStudent(match);
    } else {
      setFoundStudent(null);
      setErrorMsg(`No student was found for roll ${roll} in the ${academicYear} session. Check the roll number and course.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedCourse = courses.find(c => c.id === (foundStudent?.courseId || courseId)) || courses[0];

  return (
    <>
      <style>{`
        @page { size: 85.6mm 53.98mm; margin: 0; }
        @media print {
          html, body { width: 85.6mm !important; height: 53.98mm !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #fff !important; }
          body * { visibility: hidden !important; }
          .printable-area, .printable-area * { visibility: visible !important; }
          .no-print { display: none !important; }
          .printable-area {
            position: fixed !important; left: 0 !important; top: 0 !important;
            width: 85.6mm !important; height: 53.98mm !important;
            min-width: 85.6mm !important; max-width: 85.6mm !important;
            min-height: 53.98mm !important; max-height: 53.98mm !important;
            margin: 0 !important; padding: 2.5mm !important; box-sizing: border-box !important;
            overflow: hidden !important; border-radius: 2mm !important; box-shadow: none !important;
            break-inside: avoid !important; page-break-inside: avoid !important;
            print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important;
          }
          .printable-area .absolute.inset-0 { display: none !important; }
          .printable-area h3 { font-size: 8pt !important; line-height: 1.1 !important; }
          .printable-area h4 { font-size: 9pt !important; line-height: 1.1 !important; margin-top: 1mm !important; }
          .printable-area p, .printable-area span { line-height: 1.1 !important; }
          .printable-area .w-24.h-24 { width: 15mm !important; height: 15mm !important; border-radius: 2mm !important; }
          .printable-area .mt-4 { margin-top: 1.5mm !important; }
          .printable-area .pb-3 { padding-bottom: 1mm !important; }
          .printable-area .p-3\\.5 { padding: 1.5mm !important; }
          .printable-area .space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 1mm !important; }
          .printable-area .w-11.h-11 { width: 7mm !important; height: 7mm !important; }
          .printable-area .w-10.h-10 { width: 6mm !important; height: 6mm !important; }
          .printable-area .h-7 { height: 4mm !important; }
          .printable-area .mt-4.pt-3 { margin-top: 1mm !important; padding-top: 1mm !important; }
          .printable-area .text-xs { font-size: 5.5pt !important; }
          .printable-area .text-\\[10px\\] { font-size: 5pt !important; }
          .printable-area .text-\\[8px\\] { font-size: 4pt !important; }
        }
      `}</style>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Top Header */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Student ID Card Download & Print</h3>
              <p className="text-xs text-slate-300">Digital student identity card with parent details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filter Form */}
        <div className="no-print p-6 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                <option value="2026">2026 Session</option>
                <option value="2025">2025 Session</option>
                <option value="2024">2024 Session</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">কোর্স</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white truncate"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Roll</label>
              <input
                type="text"
                required
                placeholder="e.g. 101 or 102"
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
                <span>Search</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Printable Student ID Card Area */}
        <div className="p-6 flex flex-col items-center">
          {foundStudent ? (
            <div className="w-full max-w-md space-y-4">
              <div className="printable-area relative bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400 overflow-hidden">
                {/* Background Subtle Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                  {(settings.watermarkUrl || settings.logoUrl) ? (
                    <img src={settings.watermarkUrl || settings.logoUrl} alt="Watermark" className="w-56 h-56 object-contain" />
                  ) : (
                    <div className="w-56 h-56 rounded-full border-8 border-dashed border-amber-400 flex flex-col items-center justify-center text-center p-4">
                      <span className="text-2xl font-black text-amber-300">BS ZONE</span>
                      <span className="text-xs font-bold text-slate-300 mt-1">E-LEARNING &amp; IT</span>
                    </div>
                  )}
                </div>

                {/* Institute Header */}
                <div className="relative z-10 text-center pb-3 border-b border-amber-400/40">
                  <div className="inline-flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      BS
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-amber-300 tracking-wider">
                      {settings.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {settings.subNameEnglish || 'A Digital Academy for Skills and Success'}
                  </p>
                  <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-xs">
                    STUDENT IDENTITY CARD
                  </div>
                </div>

                {/* Student Photo & Roll Badge */}
                <div className="relative z-10 mt-4 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-800">
                    <img
                      src={foundStudent.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                      alt={foundStudent.englishName || 'Student Photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h4 className="text-lg font-extrabold text-white mt-2">
                    {foundStudent.englishName || 'Student Name Not Provided'}
                  </h4>
                  <div className="inline-flex items-center gap-2 mt-0.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-900/90 text-amber-300 font-mono font-black text-xs border border-amber-400/30">
                      Roll: {foundStudent.roll}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                      Session: {foundStudent.academicYear}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-300 font-mono">Registration No.: {foundStudent.registrationNo || 'Not Assigned'}</p>
                </div>

                {/* Mandatory Personal & Parents Details (পিতার নাম ও মাতার নাম স্পষ্টভাবে) */}
                <div className="relative z-10 mt-4 bg-slate-900/80 rounded-2xl p-3.5 border border-slate-700/60 text-xs space-y-1.5 backdrop-blur-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-amber-300/90 font-bold shrink-0">Course:</span>
                    <span className="font-bold text-white text-right truncate pl-2">{selectedCourse.titleEnglish || 'Course information unavailable'}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-amber-300/90 font-bold shrink-0">Father's Name:</span>
                    <span className="font-extrabold text-white text-right pl-2">
                      {foundStudent.fatherNameEnglish || 'Not Provided'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-amber-300/90 font-bold shrink-0">Mother's Name:</span>
                    <span className="font-extrabold text-white text-right pl-2">
                      {foundStudent.motherNameEnglish || 'Not Provided'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400 font-semibold shrink-0">Phone:</span>
                    <span className="font-mono text-slate-200 text-right">{foundStudent.phone}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold shrink-0">Address:</span>
                    <span className="text-slate-200 text-right truncate pl-2">
                      {foundStudent.addressEnglish || 'Bangladesh'}
                    </span>
                  </div>
                </div>

                {/* Bottom Signature & Seal in Exact Placement */}
                <div className="relative z-10 mt-4 pt-3 border-t border-slate-700/80 flex items-end justify-between px-1">
                  <div className="flex flex-col items-center">
                    <img
                      src={settings.institutionSealUrl}
                      alt="Institution Seal"
                      className="w-11 h-11 object-contain filter drop-shadow"
                    />
                    <span className="text-[8px] text-amber-300 font-semibold mt-0.5">Official Seal</span>
                  </div>

                  {settings.signatureSealUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={settings.signatureSealUrl}
                        alt="Head Teacher Seal"
                        className="w-10 h-10 object-contain filter drop-shadow"
                      />
                      <span className="text-[8px] text-rose-300 font-semibold mt-0.5">Head Teacher Seal</span>
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <img
                      src={settings.signatureUrl}
                      alt="Signature"
                      className="h-7 w-auto object-contain filter invert brightness-200"
                    />
                    <div className="w-24 border-t border-slate-600 mt-0.5 pt-0.5">
                      <p className="text-[10px] font-bold text-white">{settings.founderNameEnglish || 'Head Teacher'}</p>
                      <p className="text-[8px] text-amber-300 font-medium">Head Teacher</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="no-print flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print ID Card</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p>Search by academic year, course, and roll number to generate the student ID card.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
