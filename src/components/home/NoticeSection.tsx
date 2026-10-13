import React, { useState } from 'react';
import { NoticeItem } from '../../types';
import { Bell, Pin, Calendar, Video, Image as ImageIcon, ExternalLink, ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';

interface NoticeSectionProps {
  notices: NoticeItem[];
}

export const NoticeSection: React.FC<NoticeSectionProps> = ({ notices }) => {
  const [expandedId, setExpandedId] = useState<string | null>(notices[0]?.id || null);

  return (
    <section id="notice-section" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 mb-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-700" />
              <span>অফিশিয়াল নোটিস বোর্ড</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              জরুরি বিজ্ঞপ্তি ও হালনাগাদ তথ্য
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            পরীক্ষা, ক্লাস শিডিউল ও ছুটির নোটিস
          </p>
        </div>

        <div className="space-y-4">
          {notices.map((notice) => {
            const isExpanded = expandedId === notice.id;

            return (
              <div
                key={notice.id}
                className={`rounded-2xl border transition-all ${
                  notice.pinned
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                } overflow-hidden shadow-xs hover:shadow-md`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`p-2.5 rounded-xl text-white shrink-0 ${
                        notice.pinned ? 'bg-amber-600' : 'bg-blue-900'
                      }`}
                    >
                      {notice.pinned ? <Pin className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {notice.pinned && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            পিনযুক্ত
                          </span>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{notice.date}</span>
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {notice.title}
                      </h3>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-700 shrink-0 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-200/60 text-xs sm:text-sm text-slate-700 space-y-4">
                    <p className="whitespace-pre-line leading-relaxed">
                      {notice.content}
                    </p>

                    {/* Notice Image Attachments */}
                    {notice.images && notice.images.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-blue-800" />
                          <span>সংযুক্ত নোটিশ ইমেজ / সার্কুলার:</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {notice.images.map((img, idx) => (
                            <a
                              key={idx}
                              href={img}
                              target="_blank"
                              rel="noreferrer"
                              download={`notice-image-${idx + 1}`}
                              className="group block rounded-xl overflow-hidden border border-slate-300 relative aspect-video shadow-xs bg-slate-100"
                            >
                              <img
                                src={img}
                                alt={`Notice attach ${idx}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity gap-1.5">
                                <Download className="w-4 h-4 text-amber-400" />
                                <span>ছবিটি দেখুন / ডাউনলোড করুন</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notice PDF Attachment */}
                    {notice.pdfUrl && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-rose-700" />
                          <span>সংযুক্ত অফিশিয়াল পিডিএফ (PDF Document):</span>
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={notice.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            download="official-notice.pdf"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 hover:to-red-700 text-white transition-all text-xs font-bold shadow-sm hover:shadow-md"
                          >
                            <FileText className="w-4 h-4 text-amber-300" />
                            <span>পিডিএফ নোটিশ ডাউনলোড ও ভিউ করুন</span>
                            <Download className="w-3.5 h-3.5 text-amber-300 ml-1" />
                          </a>
                          <span className="text-[11px] text-slate-500 font-medium">
                            (অফিশিয়াল সিল ও প্রধান শিক্ষক অনুমোদিত কপি)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Notice Video Attachment / Embed */}
                    {notice.videoUrl && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-red-600" />
                          <span>ভিডিও বিজ্ঞপ্তি / নির্দেশনা:</span>
                        </span>
                        <a
                          href={notice.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors text-xs font-bold"
                        >
                          <Video className="w-4 h-4 text-red-600" />
                          <span>সংযুক্ত ভিডিওটি দেখুন (YouTube/Facebook)</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
