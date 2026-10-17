import React, { useState, useEffect } from 'react';
import { Course, Student, ResultRecord, SubjectMark, InstituteSettings } from '../../types';
import { storage } from '../../services/storage';
import { masterGateway } from '../../services/masterGateway';
import { toBengaliNum } from '../home/CoursesSection';
import {
  BarChart3,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  Edit,
  Award,
  Search,
  RefreshCw,
  X,
  FileCheck2,
  Layers,
  GraduationCap
} from 'lucide-react';

interface ResultGeneratorModuleProps {
  courses: Course[];
  students: Student[];
  results: ResultRecord[];
  settings: InstituteSettings;
  onUpdateResults: (newResults: ResultRecord[]) => void;
  triggerNotification: (msg: string) => void;
}

// Bangladesh Standard GPA & Letter Grade Calculation Formula
export const calculateGradeAndGPA = (obtained: number, total: number = 100): { grade: string; gpa: number } => {
  if (total <= 0) return { grade: 'F', gpa: 0.0 };
  const percentage = (obtained / total) * 100;

  if (percentage >= 80) return { grade: 'A+', gpa: 5.0 };
  if (percentage >= 70) return { grade: 'A', gpa: 4.0 };
  if (percentage >= 60) return { grade: 'A-', gpa: 3.5 };
  if (percentage >= 50) return { grade: 'B', gpa: 3.0 };
  if (percentage >= 40) return { grade: 'C', gpa: 2.0 };
  if (percentage >= 33) return { grade: 'D', gpa: 1.0 };
  return { grade: 'F', gpa: 0.0 };
};

export const calculateOverallGPA = (marks: SubjectMark[]): { gpa: number; grade: string; totalObtained: number; totalMax: number } => {
  if (!marks || marks.length === 0) {
    return { gpa: 0.0, grade: 'F', totalObtained: 0, totalMax: 0 };
  }

  let totalObtained = 0;
  let totalMax = 0;
  let totalGPA = 0;
  let hasFailed = false;

  marks.forEach(m => {
    totalObtained += Number(m.obtained) || 0;
    totalMax += Number(m.total) || 100;
    const itemCalc = calculateGradeAndGPA(Number(m.obtained) || 0, Number(m.total) || 100);
    totalGPA += itemCalc.gpa;
    if (itemCalc.grade === 'F') {
      hasFailed = true;
    }
  });

  if (hasFailed) {
    return { gpa: 0.0, grade: 'F', totalObtained, totalMax };
  }

  const rawGPA = totalGPA / marks.length;
  const roundedGPA = Number(rawGPA.toFixed(2));

  let overallGrade = 'F';
  if (roundedGPA >= 5.0) overallGrade = 'A+';
  else if (roundedGPA >= 4.0) overallGrade = 'A';
  else if (roundedGPA >= 3.5) overallGrade = 'A-';
  else if (roundedGPA >= 3.0) overallGrade = 'B';
  else if (roundedGPA >= 2.0) overallGrade = 'C';
  else if (roundedGPA >= 1.0) overallGrade = 'D';

  return { gpa: roundedGPA, grade: overallGrade, totalObtained, totalMax };
};

export const ResultGeneratorModule: React.FC<ResultGeneratorModuleProps> = ({
  courses,
  students,
  results,
  settings,
  onUpdateResults,
  triggerNotification
}) => {
  // Form States
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [examType, setExamType] = useState('সেমিস্টার ফাইনাল মূল্যায়ন পরীক্ষা ২০২৬');
  const [selectedRoll, setSelectedRoll] = useState('');
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  // Subject Marks State
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Filter States for Result List
  const [filterYear, setFilterYear] = useState('2026');
  const [filterCourse, setFilterCourse] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Print Preview Modal State
  const [previewResult, setPreviewResult] = useState<ResultRecord | null>(null);

  // Populate default subjects when course changes
  const loadDefaultSubjectsForCourse = (targetCourseId: string) => {
    const matchedCourse = courses.find(c => c.id === targetCourseId);
    if (matchedCourse && matchedCourse.subjects && matchedCourse.subjects.length > 0) {
      setSubjectMarks(
        matchedCourse.subjects.map(s => ({
          subject: s,
          obtained: 80,
          total: 100,
          grade: 'A+',
          gpa: 5.0
        }))
      );
    } else {
      setSubjectMarks([
        { subject: 'থিওরিটিক্যাল কনসেপ্ট টেস্ট', obtained: 85, total: 100, grade: 'A+', gpa: 5.0 },
        { subject: 'ব্যবহারিক ও প্র্যাকটিক্যাল ল্যাব', obtained: 90, total: 100, grade: 'A+', gpa: 5.0 },
        { subject: 'উপস্থিতি ও অ্যাসাইনমেন্ট', obtained: 95, total: 100, grade: 'A+', gpa: 5.0 }
      ]);
    }
  };

  useEffect(() => {
    if (!editingResultId) {
      loadDefaultSubjectsForCourse(courseId);
    }
  }, [courseId]);

  // Auto-fill student info when Roll is selected or typed
  useEffect(() => {
    if (!selectedRoll) {
      if (!editingResultId) {
        setStudentName('');
        setFatherName('');
        setMotherName('');
        setAddress('');
        setPhone('');
      }
      return;
    }

    const trimmedRoll = selectedRoll.trim();
    // 1. Try finding in current year and course first
    let matchedStudent = students.find(
      s => s.roll === trimmedRoll && s.academicYear === academicYear && s.courseId === courseId
    );
    // 2. Fallback to any student matching roll in current year
    if (!matchedStudent) {
      matchedStudent = students.find(s => s.roll === trimmedRoll && s.academicYear === academicYear);
    }
    // 3. Fallback to any student with this roll
    if (!matchedStudent) {
      matchedStudent = students.find(s => s.roll === trimmedRoll);
    }

    if (matchedStudent) {
      setStudentName(matchedStudent.name);
      setFatherName(matchedStudent.fatherName || '');
      setMotherName(matchedStudent.motherName || '');
      setAddress(matchedStudent.address || '');
      setPhone(matchedStudent.phone || '');
    }
  }, [selectedRoll, academicYear, courseId]);

  // Handle Mark Change for a Subject Row
  const handleMarkChange = (index: number, obtained: number, total: number = 100) => {
    const updated = [...subjectMarks];
    const calc = calculateGradeAndGPA(obtained, total);
    updated[index] = {
      ...updated[index],
      obtained,
      total,
      grade: calc.grade,
      gpa: calc.gpa
    };
    setSubjectMarks(updated);
  };

  // Add a new subject row
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSubjectName.trim();
    if (!clean) return;
    setSubjectMarks(prev => [
      ...prev,
      {
        subject: clean,
        obtained: 80,
        total: 100,
        grade: 'A+',
        gpa: 5.0
      }
    ]);
    setNewSubjectName('');
  };

  // Remove a subject row
  const handleRemoveSubject = (index: number) => {
    setSubjectMarks(prev => prev.filter((_, i) => i !== index));
  };

  // Live Overall GPA & Total Marks calculation
  const overallCalc = calculateOverallGPA(subjectMarks);

  // Filter students for the roll selector dropdown
  const filteredStudents = students.filter(
    s => s.academicYear === academicYear && (courseId ? s.courseId === courseId : true)
  );

  // Save or Publish Result
  const handleSaveResult = (publishDirectly: boolean) => {
    if (!selectedRoll.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর রোল নম্বর প্রদান করুন।');
      return;
    }
    if (!studentName.trim()) {
      alert('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    if (subjectMarks.length === 0) {
      alert('কমপক্ষে একটি বিষয় ও নম্বর যোগ করুন।');
      return;
    }

    const resultId = editingResultId || `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: ResultRecord = {
      id: resultId,
      academicYear,
      courseId,
      roll: selectedRoll.trim(),
      studentName: studentName.trim(),
      fatherName: fatherName.trim() || 'উল্লেখিত নেই',
      motherName: motherName.trim() || 'উল্লেখিত নেই',
      address: address.trim(),
      phone: phone.trim(),
      examType: examType.trim() || 'চূড়ান্ত মূল্যায়ন পরীক্ষা',
      published: publishDirectly,
      date: new Date().toISOString().split('T')[0],
      marks: subjectMarks,
      totalMarks: overallCalc.totalObtained,
      gpa: overallCalc.gpa,
      grade: overallCalc.grade
    };

    let updatedResults: ResultRecord[];
    if (editingResultId) {
      updatedResults = results.map(r => (r.id === editingResultId ? newRecord : r));
    } else {
      // Check if roll already has a result for this year, course, and examType
      const existingIdx = results.findIndex(
        r => r.roll === newRecord.roll && r.academicYear === newRecord.academicYear && r.courseId === newRecord.courseId && r.examType === newRecord.examType
      );
      if (existingIdx >= 0) {
        if (!confirm(`রোল ${newRecord.roll}-এর জন্য এই পরীক্ষার ফলাফল ইতিমধ্যে বিদ্যমান। আপনি কি এটি আপডেট করতে চান?`)) {
          return;
        }
        updatedResults = [...results];
        updatedResults[existingIdx] = newRecord;
      } else {
        updatedResults = [newRecord, ...results];
      }
    }

    onUpdateResults(updatedResults);
    storage.saveResults(updatedResults);
    masterGateway.publish('results', updatedResults);

    const actionText = publishDirectly ? 'সরাসরি পাবলিশ' : 'ড্রাফট হিসেবে সংরক্ষণ';
    triggerNotification(`ফলাফল সফলভাবে ${actionText} করা হয়েছে!`);
    alert(`✅ রোল ${newRecord.roll} (${newRecord.studentName})-এর ফলাফল সফলভাবে ${actionText} হয়েছে! ${publishDirectly ? 'শিক্ষার্থীরা এখন ওয়েবসাইট থেকে মার্কশিট দেখতে পারবে।' : 'প্রয়োজনে তালিকা থেকে পরবর্তীতে এক ক্লিকে পাবলিশ করতে পারবেন।'}`);

    // Reset Form
    handleResetForm();
  };

  const handleResetForm = () => {
    setEditingResultId(null);
    setSelectedRoll('');
    setStudentName('');
    setFatherName('');
    setMotherName('');
    setAddress('');
    setPhone('');
    loadDefaultSubjectsForCourse(courseId);
  };

  // Edit existing result
  const handleEditResult = (r: ResultRecord) => {
    setEditingResultId(r.id);
    setAcademicYear(r.academicYear);
    setCourseId(r.courseId);
    setExamType(r.examType);
    setSelectedRoll(r.roll);
    setStudentName(r.studentName);
    setFatherName(r.fatherName);
    setMotherName(r.motherName);
    setAddress(r.address || '');
    setPhone(r.phone || '');
    setSubjectMarks(r.marks || []);

    window.scrollTo({ top: 300, behavior: 'smooth' });
    triggerNotification(`রোল ${r.roll}-এর ফলাফল এডিট মোডে লোড করা হয়েছে`);
  };

  // Toggle Publish Status
  const handleTogglePublish = (r: ResultRecord) => {
    const updatedStatus = !r.published;
    const updated = results.map(item => (item.id === r.id ? { ...item, published: updatedStatus } : item));
    onUpdateResults(updated);
    storage.saveResults(updated);
    masterGateway.publish('results', updated);
    triggerNotification(`রোল ${r.roll}-এর ফলাফল ${updatedStatus ? 'পাবলিশ' : 'আনপাবলিশ'} করা হয়েছে`);
  };

  // Delete result
  const handleDeleteResult = (id: string, roll: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে রোল ${roll}-এর এই পরীক্ষার ফলাফল মুছে ফেলতে চান?`)) {
      return;
    }
    const updated = results.filter(r => r.id !== id);
    onUpdateResults(updated);
    storage.saveResults(updated);
    masterGateway.publish('results', updated);
    triggerNotification(`রোল ${roll}-এর ফলাফল মুছে ফেলা হয়েছে`);
  };

  // Filtered Results for the Table
  const displayedResults = results.filter(r => {
    const matchYear = filterYear === 'all' || r.academicYear === filterYear;
    const matchCourse = filterCourse === 'all' || r.courseId === filterCourse;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.roll.toLowerCase().includes(q) ||
      r.studentName.toLowerCase().includes(q) ||
      r.examType.toLowerCase().includes(q);
    return matchYear && matchCourse && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-blue-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>একাডেমিক গ্রেডিং ও মার্কশিট সিস্টেম</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ফলাফল ও মার্কশিট জেনারেটর (Result &amp; Marksheet Generator)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              শিক্ষাবর্ষ, কোর্স ও রোল সিলেক্ট করলে শিক্ষার্থীর তথ্য স্বয়ংক্রিয়ভাবে লোড হবে। প্রতিটি বিষয়ের নম্বর ইনপুট দেওয়ার সাথে সাথে মোট নম্বর ও জিপিএ তাৎক্ষণিক ক্যালকুলেট হবে এবং সরাসরি অথবা খসড়া হিসেবে পাবলিশ করা যাবে।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <span className="block text-[11px] text-slate-300 font-medium">মোট রেজাল্ট রেকর্ড</span>
              <span className="text-xl font-black text-amber-400">{toBengaliNum(results.length)}</span>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-400/30 text-center">
              <span className="block text-[11px] text-emerald-300 font-medium">পাবলিশড রেজাল্ট</span>
              <span className="text-xl font-black text-emerald-300">
                {toBengaliNum(results.filter(r => r.published).length)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Entry Form Card */}
      <div className="bg-white rounded-3xl border-2 border-blue-200/80 shadow-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-black shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingResultId ? 'ফলাফল সম্পাদন / আপডেট করুন' : 'নতুন ফলাফল এন্ট্রি ও জেনারেট ফর্ম'}
              </h3>
              <p className="text-xs text-slate-500">
                শিক্ষার্থী বাছাই করুন এবং বিষয়ভিত্তিক নম্বর পূরণ করে সেভ বা পাবলিশ করুন
              </p>
            </div>
          </div>

          {editingResultId && (
            <button
              onClick={handleResetForm}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>এডিট বাতিল</span>
            </button>
          )}
        </div>

        {/* Section 1: Selector Grid (Auto-Loading Trigger) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ১. শিক্ষাবর্ষ (Academic Year) *
            </label>
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="2026">২০২৬ সেশন</option>
              <option value="2025">২০২৫ সেশন</option>
              <option value="2024">২০২৪ সেশন</option>
              <option value="2023">২০২৩ সেশন</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ২. কোর্স নির্বাচন (Course) *
            </label>
            <select
              value={courseId}
              onChange={e => {
                setCourseId(e.target.value);
                setSelectedRoll('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ৩. পরীক্ষার ধরণ (Exam Type) *
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: সেমিস্টার ফাইনাল ২০২৬"
              value={examType}
              onChange={e => setExamType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>৪. রোল নম্বর (Roll) *</span>
              <span className="text-[10px] text-blue-700 font-semibold">অটো-লোড সক্ষম</span>
            </label>
            <div className="space-y-1.5">
              <select
                value={selectedRoll}
                onChange={e => setSelectedRoll(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-blue-950 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
              >
                <option value="">-- রোল ও শিক্ষার্থী সিলেক্ট করুন --</option>
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.roll}>
                    রোল: {s.roll} - {s.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="অথবা সরাসরি রোল টাইপ করুন..."
                value={selectedRoll}
                onChange={e => setSelectedRoll(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Auto-Loaded Student Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              <span>স্বয়ংক্রিয়ভাবে লোডকৃত শিক্ষার্থীর তথ্য (Auto-Loaded Student Info)</span>
            </span>
            {studentName && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ডাটাবেজ থেকে লোড হয়েছে ✅
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">শিক্ষার্থীর নাম *</label>
              <input
                type="text"
                required
                placeholder="শিক্ষার্থীর নাম"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">পিতার নাম</label>
              <input
                type="text"
                placeholder="পিতার নাম"
                value={fatherName}
                onChange={e => setFatherName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">মাতার নাম</label>
              <input
                type="text"
                placeholder="মাতার নাম"
                value={motherName}
                onChange={e => setMotherName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">ঠিকানা / শাখা</label>
              <input
                type="text"
                placeholder="ঠিকানা (গ্রাম/রোড, উপজেলা, জেলা)"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">মোবাইল নম্বর</label>
              <input
                type="text"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => loadDefaultSubjectsForCourse(courseId)}
                className="w-full px-3 py-2 rounded-xl text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>কোর্সের ডিফল্ট বিষয়সমূহ রিলোড করুন</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Subject-wise Marks Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-700" />
                <span>বিষয়ভিত্তিক প্রাপ্ত নম্বর এন্ট্রি (Subject-wise Marks Table)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                প্রাপ্ত নম্বর টাইপ করার সাথে সাথে প্রতিটি বিষয়ের গ্রেড ও সর্বমোট জিপিএ স্বয়ংক্রিয়ভাবে হিসাব হবে
              </p>
            </div>

            {/* Quick Add Subject Row Form */}
            <form onSubmit={handleAddSubject} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="নতুন বিষয়ের নাম..."
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium w-48 bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>বিষয় যোগ</span>
              </button>
            </form>
          </div>

          {/* Marks Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-black tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ক্রম</th>
                  <th className="py-3 px-4">বিষয়ের নাম (Subject Name)</th>
                  <th className="py-3 px-4 text-center">পূর্ণমান (Total)</th>
                  <th className="py-3 px-4 text-center">প্রাপ্ত নম্বর (Obtained) *</th>
                  <th className="py-3 px-4 text-center">লেটার গ্রেড</th>
                  <th className="py-3 px-4 text-center">গ্রেড পয়েন্ট (GPA)</th>
                  <th className="py-3 px-4 text-center">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {subjectMarks.map((m, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-500">{toBengaliNum(idx + 1)}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      <input
                        type="text"
                        value={m.subject}
                        onChange={e => {
                          const updated = [...subjectMarks];
                          updated[idx].subject = e.target.value;
                          setSubjectMarks(updated);
                        }}
                        className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={m.total}
                        onChange={e => handleMarkChange(idx, m.obtained, Number(e.target.value) || 100)}
                        className="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 font-mono font-bold bg-slate-50"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={m.total || 100}
                        value={m.obtained}
                        onChange={e => handleMarkChange(idx, Number(e.target.value) || 0, m.total || 100)}
                        className="w-20 px-2 py-1 text-center rounded-lg border-2 border-blue-600 font-mono font-black text-sm text-blue-950 bg-blue-50/50"
                      />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                          m.grade === 'A+'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.grade === 'F'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {m.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-black text-sm text-slate-900">
                      {m.gpa.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="এই বিষয় বাদ দিন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-Time Total & GPA Auto-Calculation Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-lg">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="block text-[11px] text-slate-300 font-medium">সর্বমোট নম্বর</span>
              <span className="text-lg sm:text-xl font-mono font-black text-amber-400">
                {toBengaliNum(overallCalc.totalObtained)} / {toBengaliNum(overallCalc.totalMax)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="block text-[11px] text-slate-300 font-medium">শতকরা হার (%)</span>
              <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                {overallCalc.totalMax > 0 ? toBengaliNum(((overallCalc.totalObtained / overallCalc.totalMax) * 100).toFixed(1)) : '০'}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="block text-[11px] text-slate-300 font-medium">গ্রেড পয়েন্ট এভারেজ (GPA)</span>
              <span className="text-xl sm:text-2xl font-mono font-black text-amber-300">
                {overallCalc.gpa.toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="block text-[11px] text-slate-300 font-medium">চূড়ান্ত লেটার গ্রেড</span>
              <span
                className={`text-xl sm:text-2xl font-black ${
                  overallCalc.grade === 'A+' ? 'text-emerald-400' : overallCalc.grade === 'F' ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {overallCalc.grade}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Save & Publish Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              সরাসরি পাবলিশ বাটনে ক্লিক করলে ফলাফল অনলাইনে সক্রিয় হবে এবং শিক্ষার্থীরা মার্কশিট ডাউনলোড করতে পারবে।
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSaveResult(false)}
              className="grow sm:grow-0 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>ড্রাফট হিসেবে সংরক্ষণ (Save Draft)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveResult(true)}
              className="grow sm:grow-0 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95 border border-emerald-400/30"
            >
              <FileCheck2 className="w-4 h-4 text-white" />
              <span>সংরক্ষণ ও সরাসরি পাবলিশ (Save &amp; Publish)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 5: Results List & Multi-Action Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-900" />
              <span>সংরক্ষিত ফলাফল তালিকা ({toBengaliNum(displayedResults.length)}টি ফলাফল)</span>
            </h3>
            <p className="text-xs text-slate-500">
              শিক্ষাবর্ষ ও কোর্সভিত্তিক ফলাফল তালিকা দেখুন, এক ক্লিকে পাবলিশ/আনপাবলিশ করুন বা মার্কশিট প্রিন্ট করুন
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
            >
              <option value="all">সকল শিক্ষাবর্ষ</option>
              <option value="2026">২০২৬ সেশন</option>
              <option value="2025">২০২৫ সেশন</option>
              <option value="2024">২০২৪ সেশন</option>
            </select>

            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 max-w-44 truncate"
            >
              <option value="all">সকল কোর্স</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="রোল বা নাম দিয়ে সার্চ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-40 sm:w-48 bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Results Data Table */}
        {displayedResults.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p>নির্বাচিত শিক্ষাবর্ষ বা কোর্সে কোনো ফলাফল পাওয়া যায়নি। উপরের ফর্ম থেকে নতুন ফলাফল এন্ট্রি করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">রোল</th>
                  <th className="py-3 px-3.5">শিক্ষার্থীর নাম</th>
                  <th className="py-3 px-3.5">কোর্স ও সেশন</th>
                  <th className="py-3 px-3.5">পরীক্ষার ধরণ</th>
                  <th className="py-3 px-3.5 text-center">মোট নম্বর</th>
                  <th className="py-3 px-3.5 text-center">GPA</th>
                  <th className="py-3 px-3.5 text-center">গ্রেড</th>
                  <th className="py-3 px-3.5 text-center">পাবলিশ স্ট্যাটাস</th>
                  <th className="py-3 px-3.5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedResults.map(r => {
                  const courseTitle = courses.find(c => c.id === r.courseId)?.title || r.courseId;
                  return (
                    <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-black text-blue-950 text-sm">
                        {r.roll}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        <div>{r.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          পিতা: {r.fatherName}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700">
                        <div className="truncate max-w-[160px] font-semibold">{courseTitle}</div>
                        <span className="text-[10px] text-slate-500 font-mono">{r.academicYear} সেশন</span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-800 font-semibold truncate max-w-[140px]">
                        {r.examType}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-900">
                        {toBengaliNum(r.totalMarks)}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono font-black text-sm text-blue-900">
                        {r.gpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                            r.grade === 'A+'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.grade === 'F'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(r)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide transition-all ${
                            r.published
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                          title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                        >
                          {r.published ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>পাবলিশড (Live)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>খসড়া (Draft)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewResult(r)}
                            className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                            title="মার্কশিট প্রিভিউ ও প্রিন্ট"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditResult(r)}
                            className="p-1.5 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteResult(r.id, r.roll)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Marksheet Preview Modal */}
      {previewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl my-8">
            <div className="no-print flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-900" />
                  <span>অফিশিয়াল একাডেমিক মার্কশিট প্রিভিউ ও প্রিন্ট</span>
                </h4>
                <p className="text-xs text-slate-500">
                  প্রিন্ট বাটনে ক্লিক করে সরাসরি প্রিন্ট করুন অথবা পিডিএফ হিসেবে সংরক্ষণ করুন
                </p>
              </div>
              <button
                onClick={() => setPreviewResult(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Fidelity Printable Marksheet Area */}
            <div className="printable-area border-4 border-blue-950 p-6 sm:p-8 rounded-2xl bg-white text-slate-900 space-y-4 relative overflow-hidden shadow-md">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="" className="w-64 h-64 object-contain" />
                ) : (
                  <span className="text-5xl font-black text-slate-900">BS ZONE</span>
                )}
              </div>

              {/* Institution Header */}
              <div className="relative z-10 text-center pb-3 border-b-2 border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-950 p-0.5 bg-slate-900 shrink-0">
                  <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="grow text-center">
                  <h2 className="text-lg sm:text-xl font-black text-blue-950 tracking-wide uppercase">
                    BS E-LEARNING &amp; IT ZONE
                  </h2>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">
                    {settings.subName || 'দক্ষতা ও সাফল্যের সেরা ডিজিটাল একাডেমি'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {settings.address || 'ঢাকা, বাংলাদেশ'} • হটলাইন: {settings.phone || '01612118307'}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-950 text-amber-300 font-black text-xs uppercase">
                    ACADEMIC TRANSCRIPT
                  </span>
                </div>
              </div>

              {/* Exam Title */}
              <div className="relative z-10 text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-blue-950 text-amber-300 font-black text-xs tracking-wider uppercase">
                  গ্রেডশিট / নম্বরপত্র • MARKSHEET
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {previewResult.examType}
                </p>
              </div>

              {/* Student Details Grid */}
              <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-2 text-xs border border-slate-300 rounded-xl p-3.5 bg-slate-50/60">
                <div>
                  <span className="font-bold text-slate-500">শিক্ষার্থীর নাম:</span>
                  <p className="font-extrabold text-sm text-slate-900">{previewResult.studentName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">রোল নম্বর:</span>
                  <p className="font-mono font-black text-sm text-blue-950">{previewResult.roll}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">পিতার নাম:</span>
                  <p className="font-semibold text-slate-800">{previewResult.fatherName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">মাতার নাম:</span>
                  <p className="font-semibold text-slate-800">{previewResult.motherName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">কোর্সের নাম:</span>
                  <p className="font-bold text-blue-900">
                    {courses.find(c => c.id === previewResult.courseId)?.title || previewResult.courseId}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-500">সেশন / শিক্ষাবর্ষ:</span>
                  <p className="font-semibold text-slate-800">{previewResult.academicYear} সেশন</p>
                </div>
              </div>

              {/* Subject Marks Table in Printable Card */}
              <div className="relative z-10 border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-blue-950 text-white font-bold">
                    <tr>
                      <th className="py-2 px-3">বিষয়</th>
                      <th className="py-2 px-3 text-center">পূর্ণমান</th>
                      <th className="py-2 px-3 text-center">প্রাপ্ত নম্বর</th>
                      <th className="py-2 px-3 text-center">লেটার গ্রেড</th>
                      <th className="py-2 px-3 text-center">গ্রেড পয়েন্ট (GPA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewResult.marks.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{m.subject}</td>
                        <td className="py-2 px-3 text-center font-mono">{toBengaliNum(m.total || 100)}</td>
                        <td className="py-2 px-3 text-center font-mono font-black text-blue-950">{toBengaliNum(m.obtained)}</td>
                        <td className="py-2 px-3 text-center font-black">{m.grade}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold">{m.gpa.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-blue-950">
                    <tr>
                      <td className="py-2 px-3 font-black text-slate-900">সর্বমোট প্রাপ্ত ফলাফল:</td>
                      <td className="py-2 px-3 text-center font-mono font-black">
                        {toBengaliNum(previewResult.marks.reduce((acc, m) => acc + (m.total || 100), 0))}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-black text-blue-950 text-sm">
                        {toBengaliNum(previewResult.totalMarks)}
                      </td>
                      <td className="py-2 px-3 text-center font-black text-sm text-blue-900">
                        গ্রেড: {previewResult.grade}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-black text-sm text-emerald-800">
                        GPA: {previewResult.gpa.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Seal & Signatures Footer */}
              <div className="relative z-10 pt-4 flex items-end justify-between">
                <div className="text-center">
                  <img src={settings.institutionSealUrl} alt="" className="h-12 w-auto mx-auto object-contain" />
                  <span className="text-[10px] font-bold text-slate-600 border-t border-slate-400 block mt-1 pt-0.5">
                    অফিশিয়াল সিল
                  </span>
                </div>

                <div className="text-center">
                  <div className="h-10 w-28 border-b border-dashed border-slate-400 mb-1 mx-auto flex items-end justify-center text-[9px] text-slate-400">
                    পরীক্ষার্থীর স্বাক্ষর
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 block">শিক্ষার্থীর স্বাক্ষর</span>
                </div>

                <div className="text-center">
                  <img src={settings.signatureUrl} alt="" className="h-10 w-auto mx-auto object-contain" />
                  <div className="border-t border-slate-600 pt-0.5 mt-0.5">
                    <p className="text-[10px] font-bold text-slate-900">{settings.founderName}</p>
                    <p className="text-[9px] text-slate-500 font-semibold">পরীক্ষা নিয়ন্ত্রক ও প্রধান শিক্ষক</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="no-print flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewResult(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>মার্কশিট প্রিন্ট / ডাউনলোড করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
