import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { Image as ImageIcon, Video, Play, ExternalLink } from 'lucide-react';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery }) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

  const filteredItems = gallery.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <section id="gallery-section" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 mb-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-purple-700" />
              <span>ছবি ও ভিডিও মেমোরিজ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              আমাদের ল্যাব ও কার্যক্রমের গ্যালারি
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              সবকিছু ({gallery.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'image'
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ছবি
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'video'
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ভিডিও
            </button>
          </div>
        </div>

        {/* Gallery Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                {item.type === 'video' || item.type === 'embed' ? (
                  item.url.includes('embed') ? (
                    <iframe
                      src={item.url}
                      title={item.title}
                      className="w-full h-full object-cover"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : item.url.startsWith('data:video') || item.url.includes('.mp4') || item.url.startsWith('blob:') ? (
                    <video
                      src={item.url}
                      controls
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    </div>
                  )
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                )}

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {item.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                  {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
