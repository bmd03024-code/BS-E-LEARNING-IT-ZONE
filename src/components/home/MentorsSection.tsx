import React, { useState } from 'react';
import { Mentor } from '../../types';
import { Award, Briefcase, GraduationCap, X, Phone, Mail, CheckCircle, Users, MessageCircle } from 'lucide-react';

interface MentorsSectionProps {
  mentors: Mentor[];
}

export const MentorsSection: React.FC<MentorsSectionProps> = ({ mentors }) => {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  return (
    <section id="mentors-section" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 mb-2">
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>আমাদের শিক্ষক মণ্ডলী</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            দক্ষ ও অভিজ্ঞ মেন্টরবৃন্দ
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">
            শিক্ষকের প্রোফাইলে ক্লিক করে বিস্তারিত যোগ্যতা ও অভিজ্ঞতা দেখুন
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => setSelectedMentor(mentor)}
              className="group cursor-pointer bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
            >
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 ring-3 ring-blue-900/20 group-hover:ring-amber-500 transition-all mb-4 bg-white shadow-inner">
                <img
                  src={mentor.photoUrl}
                  alt={mentor.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                {mentor.name}
              </h3>
              <p className="text-xs font-semibold text-blue-800 mt-0.5">
                {mentor.designation}
              </p>

              <div className="mt-3 flex flex-wrap gap-1 justify-center">
                {mentor.specialist.slice(0, 2).map((sp, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-900 font-medium"
                  >
                    {sp}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/70 w-full flex flex-col gap-2">
                <a
                  href={`https://wa.me/88${(mentor.whatsappNumber || mentor.phone || '01612118307').replace(/[^0-9]/g, '').replace(/^88/, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${mentor.name} স্যার। আমি BS E-Learning & IT Zone ওয়েবসাইট থেকে যোগাযোগ করছি।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  title="শিক্ষকের সাথে সরাসরি হোয়াটসঅ্যাপে চ্যাট করুন"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপে চ্যাট</span>
                </a>

                <span className="text-[11px] font-bold text-blue-900 group-hover:text-blue-700 inline-flex items-center justify-center gap-1">
                  বিস্তারিত প্রোফাইল &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentor Biography Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedMentor(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={selectedMentor.photoUrl}
                  alt={selectedMentor.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-400 shadow-md"
                />
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    শিক্ষক পরিচিতি ও প্রোফাইল
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {selectedMentor.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {selectedMentor.designation}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Bio summary */}
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedMentor.bio}
              </p>

              {/* Direct WhatsApp Call to Action Button */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>শিক্ষকের সাথে সরাসরি হোয়াটসঅ্যাপ সংযোগ</span>
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    নম্বর: <b>{selectedMentor.whatsappNumber || selectedMentor.phone || '01612118307'}</b>
                  </p>
                </div>
                <a
                  href={`https://wa.me/88${(selectedMentor.whatsappNumber || selectedMentor.phone || '01612118307').replace(/[^0-9]/g, '').replace(/^88/, '')}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${selectedMentor.name} স্যার। আমি BS E-Learning & IT Zone ওয়েবসাইট থেকে যোগাযোগ করছি।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে কথা বলুন</span>
                </a>
              </div>

              {/* Qualifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4 text-blue-900" />
                  <span>শিক্ষাগত যোগ্যতা:</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedMentor.qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-4 h-4 text-blue-900" />
                  <span>অভিজ্ঞতা:</span>
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  {selectedMentor.experience}
                </p>
              </div>

              {/* Specialists */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <Award className="w-4 h-4 text-blue-900" />
                  <span>বিশেষ পারদর্শিতা ও বিষয়সমূহ:</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMentor.specialist.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-900"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact info if available */}
              {(selectedMentor.phone || selectedMentor.email) && (
                <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
                  {selectedMentor.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-800" />
                      <span>মোবাইল: {selectedMentor.phone}</span>
                    </div>
                  )}
                  {selectedMentor.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-800" />
                      <span>{selectedMentor.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
