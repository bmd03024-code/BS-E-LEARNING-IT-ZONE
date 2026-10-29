import React, { useEffect, useMemo, useState } from 'react';
import { Course, Student } from '../../types';
import { storage } from '../../services/storage';
import { X, Search, Printer, AlertCircle, UserCheck, Layers } from 'lucide-react';

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialStudent?: Student | null;
}

type PrintMode = 'single' | 'bulk';

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({ isOpen, onClose, courses, initialStudent }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [roll, setRoll] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(initialStudent || null);
  const [errorMsg, setErrorMsg] = useState('');
  const [printMode, setPrintMode] = useState<PrintMode>('single');
  const settings = storage.getSettings();
  const englishOrFallback = (value: string | undefined, fallback: string) => value && value.trim() && !/[\u0980-\u09FF]/.test(value) ? value.trim() : fallback;
  const englishDigits = (value: string | number | undefined, fallback = 'Not Provided') => {
    if (value === undefined || value === null || String(value).trim() === '') return fallback;
    return String(value).replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
  };

  useEffect(() => {
    if (!courses.some(course => course.id === courseId) && courses[0]) setCourseId(courses[0].id);
  }, [courses, courseId]);

  useEffect(() => {
    if (initialStudent) {
      setFoundStudent(initialStudent);
      setAcademicYear(initialStudent.academicYear);
      setCourseId(initialStudent.courseId);
      setRoll(initialStudent.roll);
      setPrintMode('single');
    }
  }, [initialStudent]);

  const matchingStudents = useMemo(
    () => storage.getStudents()
      .filter(student => student.academicYear === academicYear && student.courseId === courseId)
      .sort((a, b) => String(a.roll).localeCompare(String(b.roll), undefined, { numeric: true })),
    [academicYear, courseId, isOpen]
  );

  if (!isOpen) return null;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    if (!roll.trim()) {
      setErrorMsg('Please enter the student roll number.');
      return;
    }
    const match = storage.getStudents().find(student =>
      student.academicYear === academicYear &&
      student.courseId === courseId &&
      student.roll.trim() === roll.trim()
    );
    if (match) {
      setFoundStudent(match);
      setPrintMode('single');
    } else {
      setFoundStudent(null);
      setErrorMsg(`No student was found for roll ${roll} in the ${academicYear} session. Check the roll number and course.`);
    }
  };

  const printSingle = () => {
    if (!foundStudent) return;
    setPrintMode('single');
    window.setTimeout(() => window.print(), 50);
  };

  const printBulk = () => {
    if (!matchingStudents.length) {
      setErrorMsg('No students found for the selected academic year and course.');
      return;
    }
    setErrorMsg('');
    setPrintMode('bulk');
    window.setTimeout(() => window.print(), 50);
  };

  const selectedCourseFor = (student: Student) => courses.find(course => course.id === student.courseId) || courses[0];
  const pages = Array.from({ length: Math.ceil(matchingStudents.length / 8) }, (_, index) => matchingStudents.slice(index * 8, index * 8 + 8));

  const renderCard = (student: Student) => {
    const course = selectedCourseFor(student);
    return (
      <article key={student.id} className="id-card relative overflow-hidden">
        <div className="id-card-top">
          {settings.logoUrl ? <img src={settings.logoUrl} alt="Institute Logo" className="id-card-logo" /> : <div className="id-card-logo id-card-logo-text">BS</div>}
          <div className="id-card-institute">
            <div className="id-card-institute-name">{englishOrFallback(settings.name, 'BS E-Learning & IT Zone')}</div>
            <div className="id-card-subtitle">{englishOrFallback(settings.subNameEnglish, 'A Digital Academy for Skills and Success')}</div>
            <div className="id-card-label">STUDENT IDENTITY CARD</div>
          </div>
        </div>
        <div className="id-card-content">
          <img
            src={student.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
            alt={student.englishName || 'Student Photo'}
            className="id-card-photo"
          />
          <div className="id-card-details">
            <div className="id-card-student-name">{englishOrFallback(student.englishName, 'Student Name')}</div>
            <div className="id-card-line"><b>Roll:</b> {englishDigits(student.roll)} <span className="id-card-divider">|</span> <b>Session:</b> {englishDigits(student.academicYear)}</div>
            <div className="id-card-line"><b>Registration No.:</b> {englishDigits(student.registrationNo, 'Not Assigned')}</div>
            <div className="id-card-line"><b>Course:</b> {englishOrFallback(course?.titleEnglish, englishOrFallback(student.courseId, 'Course'))}</div>
            <div className="id-card-line"><b>Father:</b> {englishOrFallback(student.fatherNameEnglish, 'Not Provided')}</div>
            <div className="id-card-line"><b>Mother:</b> {englishOrFallback(student.motherNameEnglish, 'Not Provided')}</div>
            <div className="id-card-line"><b>Phone:</b> {englishDigits(student.phone)}</div>
          </div>
        </div>
        <div className="id-card-footer">
          <div className="id-card-seal">
            {settings.institutionSealUrl && <img src={settings.institutionSealUrl} alt="Official Seal" />}
            <span>OFFICIAL SEAL</span>
          </div>
          <div className="id-card-signature">
            {settings.signatureUrl && <img src={settings.signatureUrl} alt="Head Teacher Signature" />}
            <div className="id-card-signature-name">{englishOrFallback(settings.founderNameEnglish, 'Head Teacher')}</div>
            <span>HEAD TEACHER</span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className={`student-id-modal ${printMode === 'bulk' ? 'print-mode-bulk' : 'print-mode-single'} fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 overflow-y-auto`}>
      <style>{`
        .student-id-modal { font-family: Arial, Helvetica, sans-serif; }
        .id-card { width:85.6mm; height:53.98mm; min-width:85.6mm; max-width:85.6mm; min-height:53.98mm; max-height:53.98mm; box-sizing:border-box; padding:2.2mm; color:#fff; background:linear-gradient(135deg,#0f172a,#172554 65%,#020617); border:0.65mm solid #d9a441; border-radius:1.5mm; display:flex; flex-direction:column; overflow:hidden; break-inside:avoid; page-break-inside:avoid; print-color-adjust:exact; -webkit-print-color-adjust:exact; }
        .id-card-top { height:11mm; flex:none; display:flex; align-items:center; gap:2mm; border-bottom:.25mm solid rgba(245,190,70,.6); padding-bottom:1mm; }
        .id-card-logo { width:8mm; height:8mm; object-fit:contain; flex:none; border-radius:50%; }
        .id-card-logo-text { display:flex; align-items:center; justify-content:center; background:#fbbf24; color:#0f172a; font-size:10pt; font-weight:900; }
        .id-card-institute { min-width:0; flex:1; text-align:center; }
        .id-card-institute-name { font-size:8pt; font-weight:900; line-height:1.05; text-transform:uppercase; letter-spacing:.2px; color:#fcd34d; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .id-card-subtitle { font-size:4.8pt; line-height:1.15; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .id-card-label { display:inline-block; margin-top:.5mm; padding:.35mm 1.5mm; border-radius:1mm; background:#fbbf24; color:#0f172a; font-size:4.8pt; line-height:1; font-weight:900; letter-spacing:.4px; }
        .id-card-content { flex:1; min-height:0; display:flex; gap:2mm; padding-top:1.4mm; }
        .id-card-photo { width:16mm; height:19mm; object-fit:cover; border:.45mm solid #fbbf24; border-radius:1mm; flex:none; }
        .id-card-details { flex:1; min-width:0; overflow:hidden; }
        .id-card-student-name { font-size:8pt; line-height:1.1; font-weight:900; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:1mm; }
        .id-card-line { font-size:5.4pt; line-height:1.35; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .id-card-line b { color:#fcd34d; font-weight:700; }
        .id-card-divider { color:#64748b; padding:0 .7mm; }
        .id-card-footer { height:7mm; flex:none; border-top:.2mm solid #475569; padding-top:.8mm; display:flex; justify-content:space-between; align-items:flex-end; }
        .id-card-seal,.id-card-signature { display:flex; flex-direction:column; align-items:center; justify-content:flex-end; min-width:15mm; max-width:28mm; }
        .id-card-seal img { width:5mm; height:5mm; object-fit:contain; }
        .id-card-seal span,.id-card-signature span { font-size:4pt; color:#fcd34d; line-height:1; white-space:nowrap; }
        .id-card-signature img { max-width:20mm; width:auto; height:3.5mm; object-fit:contain; filter:brightness(0) invert(1); }
        .id-card-signature-name { max-width:27mm; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-top:.2mm solid #94a3b8; margin-top:.3mm; padding-top:.3mm; font-size:5pt; font-weight:700; line-height:1; }
        .bulk-print-pages { display:none; }
        @media print {
          html, body { margin:0!important; padding:0!important; background:#fff!important; }
          body * { visibility:hidden!important; }
          .student-id-modal, .student-id-modal * { visibility:visible!important; }
          .student-id-modal { position:static!important; display:block!important; width:auto!important; height:auto!important; min-height:0!important; overflow:visible!important; padding:0!important; margin:0!important; background:#fff!important; }\n          .student-id-modal > div { width:auto!important; max-width:none!important; min-height:0!important; overflow:visible!important; margin:0!important; padding:0!important; border:0!important; border-radius:0!important; box-shadow:none!important; background:#fff!important; }
          .no-print { display:none!important; }
          .id-card { box-shadow:none!important; }
          .print-mode-single .id-card { position:fixed!important; left:0!important; top:0!important; margin:0!important; }
          .print-mode-single .bulk-print-pages { display:none!important; }
          .print-mode-bulk .single-preview { display:none!important; }
          .print-mode-bulk .bulk-print-pages { display:block!important; }
          .bulk-print-page { width:100%; display:grid; grid-template-columns:85.6mm 85.6mm; grid-auto-rows:53.98mm; gap:4mm; justify-content:center; align-content:start; break-after:page; page-break-after:always; }
          .bulk-print-page:last-child { break-after:auto; page-break-after:auto; }
          @page { size: ${printMode === 'bulk' ? 'A4 portrait' : '85.6mm 53.98mm'}; margin: ${printMode === 'bulk' ? '8mm' : '0'}; }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300"><UserCheck className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-base sm:text-lg">Student ID Card Download &amp; Print</h3><p className="text-xs text-slate-300">CR80 size: 85.6 × 53.98 mm</p></div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-white/10 text-slate-300"><X className="w-5 h-5" /></button>
        </div>

        <div className="no-print p-5 bg-slate-50 border-b border-slate-200 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setPrintMode('single'); setErrorMsg(''); }} className={`px-4 py-2 rounded-xl text-xs font-bold ${printMode === 'single' ? 'bg-blue-900 text-white' : 'bg-white border text-slate-700'}`}>Single Student Card</button>
            <button type="button" onClick={() => { setPrintMode('bulk'); setErrorMsg(''); }} className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 ${printMode === 'bulk' ? 'bg-blue-900 text-white' : 'bg-white border text-slate-700'}`}><Layers className="w-4 h-4" /> Bulk Print Cards</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-bold text-slate-700 mb-1">Academic Year</label><select value={academicYear} onChange={event => setAcademicYear(event.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white">{Array.from(new Set(['2026','2025','2024',...storage.getStudents().map(student => student.academicYear)])).sort((a,b) => b.localeCompare(a)).map(year => <option key={year} value={year}>{year} Session</option>)}</select></div>
            <div><label className="block text-[11px] font-bold text-slate-700 mb-1">Course</label><select value={courseId} onChange={event => setCourseId(event.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white">{courses.map(course => <option key={course.id} value={course.id}>{englishOrFallback(course.titleEnglish, 'Course')}</option>)}</select></div>
          </div>
          {printMode === 'single' ? (
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div><label className="block text-[11px] font-bold text-slate-700 mb-1">Student Roll</label><input type="text" required placeholder="Enter roll number" value={roll} onChange={event => setRoll(event.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white font-mono" /></div>
              <button type="submit" className="py-2.5 px-5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-center gap-2"><Search className="w-4 h-4" /> Search Student</button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 border border-blue-100 p-3"><p className="text-xs text-blue-950">Found <b>{matchingStudents.length}</b> student(s) for this academic year and course. Bulk sheets fit up to 8 exact-size cards per A4 page.</p><button onClick={printBulk} className="py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white inline-flex items-center gap-2"><Printer className="w-4 h-4" /> Print All Cards</button></div>
          )}
          {errorMsg && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span></div>}
        </div>

        <div className="single-preview p-6 flex flex-col items-center gap-3">
          {foundStudent ? <>{renderCard(foundStudent)}<div className="no-print flex justify-end gap-3 w-full max-w-xl"><button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Close</button><button onClick={printSingle} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white"><Printer className="w-4 h-4 text-amber-400" /> Print ID Card</button></div></> : <div className="text-center py-10 text-slate-500 text-xs"><UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" /><p>Choose an academic year, course, and roll number to generate a card.</p></div>}
        </div>
        <div className="bulk-print-pages">{pages.map((pageStudents, pageIndex) => <section className="bulk-print-page" key={pageIndex}>{pageStudents.map(renderCard)}</section>)}</div>
      </div>
    </div>
  );
};
