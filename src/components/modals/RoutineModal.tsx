import React, { useState } from 'react';
import { Course, RoutineItem } from '../../types';
import { storage } from '../../services/storage';
import { X, Calendar, Printer, Clock, MapPin, UserCheck, BookOpen } from 'lucide-react';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}

export const RoutineModal: React.FC<RoutineModalProps> = ({ isOpen, onClose, courses }) => {
  const [academicYear, setAcademicYear] = useState('2026');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');

  if (!isOpen) return null;

  const routines = storage.getRoutines();
  const settings = storage.getSettings();
  const selectedCourse = courses.find(c => c.id === courseId) || courses[0];

  const filteredRoutines = routines.filter(
    r => r.academicYear === academicYear && (courseId === 'all' || r.courseId === courseId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="no-print bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>লাইভ ক্লাস রুটিন ভিউয়ার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ক্লাস রুটিন ও সময়সূচি
          </h2>
          <p className="text-xs text-slate-300">
            শিক্ষাবর্ষ ও কোর্স নির্বাচন করে সাপ্তাহিক লাইভ রুটিন দেখুন ও প্রিন্ট করুন
          </p>
        </div>

        {/* Filter controls */}
        <div className="no-print p-4 sm:p-5 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">শিক্ষাবর্ষ</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white"
              >
                <option value="2026">২০২৬ সেশন</option>
                <option value="2025">২০২৫ সেশন</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">কোর্স নির্বাচন করুন</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold bg-white"
              >
                <option value="all">সকল কোর্সের রুটিন একসাথে</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Routine Body */}
        <div className="p-4 sm:p-6 overflow-y-auto grow">
          <div className="printable-area relative bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <div className="text-center pb-4 border-b border-slate-300 space-y-1">
              <h3 className="text-xl font-black text-blue-950">{settings.name}</h3>
              <p className="text-xs text-slate-600">{settings.address} | হটলাইন: {settings.hotline}</p>
              <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold tracking-wider mt-1">
                অফিশিয়াল ক্লাস রুটিন ({academicYear} শিক্ষাবর্ষ)
              </div>
            </div>

            {filteredRoutines.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="py-2.5 px-3 border border-blue-900 font-bold">দিন / বার</th>
                      <th className="py-2.5 px-3 border border-blue-900 font-bold">সময়</th>
                      <th className="py-2.5 px-3 border border-blue-900 font-bold">বিষয় ও টপিক</th>
                      <th className="py-2.5 px-3 border border-blue-900 font-bold">শিক্ষক / মেন্টর</th>
                      <th className="py-2.5 px-3 border border-blue-900 font-bold">কক্ষ / ল্যাব</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoutines.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-2.5 px-3 border border-slate-200 font-bold text-blue-950">{item.day}</td>
                        <td className="py-2.5 px-3 border border-slate-200 font-semibold text-slate-700 flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5 text-blue-800" />
                          <span>{item.time}</span>
                        </td>
                        <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-900">{item.subject}</td>
                        <td className="py-2.5 px-3 border border-slate-200 font-medium text-slate-700">{item.teacherName}</td>
                        <td className="py-2.5 px-3 border border-slate-200 font-semibold text-emerald-800">{item.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs sm:text-sm">
                এই কোর্সের জন্য বর্তমানে কোনো রুটিন শিডিউল করা হয়নি। অ্যাডমিন প্যানেল থেকে রুটিন আপডেট করা হবে।
              </div>
            )}

            {/* Note & Seal */}
            <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
              <span>* ক্লাসের নির্ধারিত সময়ের কমপক্ষে ১০ মিনিট পূর্বে উপস্থিত হতে হবে।</span>
              <span className="font-bold text-slate-800">স্বাক্ষরিত: {settings.founderName}</span>
            </div>
          </div>

          <div className="no-print flex justify-end gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-900 hover:bg-blue-800 text-white transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>রুটিন প্রিন্ট করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
