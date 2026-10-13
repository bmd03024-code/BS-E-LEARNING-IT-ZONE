import React, { useState } from 'react';
import { FreeNoteItem, DemoClassItem } from '../../types';
import { FileText, PlayCircle, Download, BookOpen, Clock, Video, Sparkles } from 'lucide-react';

interface FreeResourcesSectionProps {
  notes: FreeNoteItem[];
  demoClasses: DemoClassItem[];
}

export const FreeResourcesSection: React.FC<FreeResourcesSectionProps> = ({ notes, demoClasses }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'classes'>('notes');
  const [activeVideo, setActiveVideo] = useState<DemoClassItem | null>(demoClasses[0] || null);

  const handleDownloadNote = (note: FreeNoteItem) => {
    alert(`"${note.title}" ফাইলটি প্রস্তুত হচ্ছে। সরাসরি স্টাডি হ্যান্ডনোট ডাউনলোড হচ্ছে...`);
  };

  return (
    <section id="free-resources-section" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>ফ্রি স্টাডি মেটেরিয়াল হাব</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ফ্রি নোট, হ্যান্ডবুক ও ডেমো ভিডিও ক্লাস
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-600" />
              <span>ফ্রি হ্যান্ডনোট ({notes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'classes'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlayCircle className="w-4 h-4 text-red-600" />
              <span>ফ্রি ভিডিও ক্লাস ({demoClasses.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'notes' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-5 hover:border-teal-500 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                      {note.subject}
                    </span>
                    <span className="font-semibold">{note.classOrCourse}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                    {note.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {note.fileSize || 'PDF ফাইল'}
                  </span>
                  <button
                    onClick={() => handleDownloadNote(note)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>পিডিএফ ডাউনলোড</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Video Player */}
            <div className="lg:col-span-8 bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
              {activeVideo ? (
                <div>
                  <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                    {activeVideo.videoUrl.startsWith('data:video') || activeVideo.videoUrl.includes('.mp4') || activeVideo.videoUrl.startsWith('blob:') ? (
                      <video
                        src={activeVideo.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={activeVideo.videoUrl}
                        title={activeVideo.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="p-5 text-white bg-slate-900">
                    <div className="flex items-center gap-3 text-xs text-amber-400 font-semibold mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30">
                        ইন্সট্রাক্টর: {activeVideo.instructor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeVideo.duration}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold">{activeVideo.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">{activeVideo.description}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Video playlist */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                ডেমো ক্লাস লেকচার তালিকা:
              </h3>
              {demoClasses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveVideo(item)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    activeVideo?.id === item.id
                      ? 'bg-blue-50 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {item.instructor} • {item.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
