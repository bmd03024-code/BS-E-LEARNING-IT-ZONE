import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Search, Volume2, Copy, Check, Sparkles, Tag, ArrowRight, Bookmark, Shuffle, Zap, Layers } from 'lucide-react';
import { offlineDictionaryService, OfflineDictionaryEntry } from '../../data/dictionaryDatabase';

interface OxfordDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OxfordDictionaryModal: React.FC<OxfordDictionaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<OfflineDictionaryEntry | null>(null);
  const [suggestions, setSuggestions] = useState<OfflineDictionaryEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copied, setCopied] = useState<boolean>(false);
  const [recentWords, setRecentWords] = useState<string[]>([
    'education',
    'computer',
    'accounting',
    'resilience',
    'algorithm'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with a default rich entry on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!selectedEntry) {
        const initial = offlineDictionaryService.lookup('education') || offlineDictionaryService.getRandomWord();
        setSelectedEntry(initial);
      }
    }
  }, [isOpen]);

  // Handle instant autocomplete suggestions as user types
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    const matches = offlineDictionaryService.search(searchTerm, 6);
    setSuggestions(matches);
  }, [searchTerm]);

  if (!isOpen) return null;

  // Instant local lookup (Zero latency, 100% offline)
  const handleLookup = (wordToSearch?: string) => {
    const raw = (wordToSearch || searchTerm).trim();
    if (!raw) return;

    const matched = offlineDictionaryService.lookup(raw);
    if (matched) {
      setSelectedEntry(matched);
      setSearchTerm(matched.word);
      setSuggestions([]);
      setRecentWords(prev => [matched.word, ...prev.filter(w => w.toLowerCase() !== matched.word.toLowerCase())].slice(0, 6));
    } else {
      // If exact match not found, check top search match
      const searchMatches = offlineDictionaryService.search(raw, 1);
      if (searchMatches.length > 0) {
        setSelectedEntry(searchMatches[0]);
        setSearchTerm(searchMatches[0].word);
        setSuggestions([]);
        setRecentWords(prev => [searchMatches[0].word, ...prev.filter(w => w.toLowerCase() !== searchMatches[0].word.toLowerCase())].slice(0, 6));
      }
    }
  };

  // Word of the day / Random word
  const handleRandomWord = () => {
    const random = offlineDictionaryService.getRandomWord();
    setSelectedEntry(random);
    setSearchTerm(random.word);
    setSuggestions([]);
    setRecentWords(prev => [random.word, ...prev.filter(w => w.toLowerCase() !== random.word.toLowerCase())].slice(0, 6));
  };

  // Native offline text-to-speech pronunciation
  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window && word) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // One-click copy
  const handleCopyDefinition = () => {
    if (!selectedEntry) return;
    const text = `${selectedEntry.word} (${selectedEntry.partOfSpeech}) ${selectedEntry.pronunciation || ''}\n` +
      `বাংলা অর্থ: ${selectedEntry.bengaliMeaning}\n` +
      `English Definition: ${selectedEntry.englishDefinition}\n` +
      `Example: "${selectedEntry.example}"` +
      (selectedEntry.exampleBengali ? `\nঅনুবাদ: "${selectedEntry.exampleBengali}"` : '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const categories = [
    'All',
    'Academic',
    'IT & Computer',
    'Business & Accounting',
    'Daily Conversation',
    'English Grammar',
    'Science',
    'Ethics & Motivation'
  ];

  const totalEntriesCount = offlineDictionaryService.getCount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs select-none no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                  ইনবিল্ড অফলাইন ডিকশনারি
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-400 text-slate-950 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> ১০০% অফলাইন
                </span>
              </div>
              <p className="text-xs text-amber-100/90">
                মুহূর্তের মধ্যে সঠিক বাংলা অর্থ, Part of Speech, উচ্চারণ ও বাস্তব উদাহরণ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomWord}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="নতুন কোনো শব্দ জানুন"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">নতুন শব্দ</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar & Instant Autocomplete */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                placeholder="যেকোনো ইংরেজি শব্দ লিখুন... (যেমন: Education, Computer, Accounting, Resilience)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white shadow-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>অর্থ খুঁজুন</span>
            </button>
          </form>

          {/* Instant Autocomplete Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-4 right-4 top-[64px] z-20 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-100">
              {suggestions.map((entry, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setSearchTerm(entry.word);
                    setSuggestions([]);
                    setRecentWords(prev => [entry.word, ...prev.filter(w => w.toLowerCase() !== entry.word.toLowerCase())].slice(0, 6));
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-amber-50/80 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 text-sm capitalize group-hover:text-amber-800">
                      {entry.word}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 group-hover:bg-amber-100">
                      {entry.partOfSpeech}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-xs">
                      {entry.bengaliMeaning}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Recent Chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pt-0.5">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3" /> দ্রুত সন্ধান:
            </span>
            {recentWords.map((word, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLookup(word)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-[11px] font-semibold transition-colors shrink-0 shadow-2xs"
              >
                {word}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  const list = offlineDictionaryService.getByCategory(cat);
                  if (list.length > 0) {
                    setSelectedEntry(list[0]);
                    setSearchTerm(list[0].word);
                  }
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-200/70 hover:bg-slate-300/80 text-slate-700'
                }`}
              >
                {cat === 'All' ? 'সব ক্যাটাগরি' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Display Area */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-5">
          {selectedEntry ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Word Header Card */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 capitalize tracking-tight font-sans">
                      {selectedEntry.word}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-900 font-black text-xs uppercase tracking-wider">
                      {selectedEntry.partOfSpeech}
                    </span>
                    <button
                      onClick={() => playPronunciation(selectedEntry.word)}
                      className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors shadow-xs group"
                      title="উচ্চারণ শুনুন (অফলাইন স্পিচ)"
                    >
                      <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    {selectedEntry.pronunciation && (
                      <p className="text-xs font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {selectedEntry.pronunciation}
                      </p>
                    )}
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" /> {selectedEntry.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyDefinition}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>

              {/* 1. Bengali Meaning (বাংলা অর্থ) - Bold, Distinct & Prominent */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/40 border border-amber-300/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-600" /> সঠিক বাংলা অর্থ:
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200 text-amber-950">
                    ইনস্ট্যান্ট লোকাল ডাটাবেজ
                  </span>
                </div>
                <p className="text-base sm:text-lg font-black text-slate-950 leading-relaxed">
                  {selectedEntry.bengaliMeaning}
                </p>
              </div>

              {/* 2. English Definition (ইংরেজি সংজ্ঞা) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  English Definition:
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed font-sans">
                  {selectedEntry.englishDefinition}
                </p>
              </div>

              {/* 3. Example Sentence with Bengali Translation (উদাহরণ ও বাংলা অনুবাদ) */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider">
                  ব্যবহারিক বাক্য ও বাস্তব উদাহরণ (Example Sentence):
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 italic font-serif pl-3 border-l-2 border-indigo-500">
                    "{selectedEntry.example}"
                  </p>
                  {selectedEntry.exampleBengali && (
                    <p className="text-xs font-semibold text-slate-600 pl-3">
                      অনুবাদ: "{selectedEntry.exampleBengali}"
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Synonyms & Antonyms (সমার্থক ও বিপরীতার্থক শব্দ) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {selectedEntry.synonyms && selectedEntry.synonyms.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                      সমার্থক শব্দ (Synonyms):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.synonyms.map((syn, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLookup(syn)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors shadow-2xs"
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.antonyms && selectedEntry.antonyms.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                    <span className="text-[11px] font-black uppercase text-rose-900 tracking-wider">
                      বিপরীতার্থক শব্দ (Antonyms):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.antonyms.map((ant, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLookup(ant)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-colors shadow-2xs"
                        >
                          {ant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-16 text-center space-y-3 text-slate-400">
              <BookOpen className="w-12 h-12 text-amber-500/50 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">
                অফলাইন ডিকশনারিতে শব্দ অনুসন্ধান করুন
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                উপরে যেকোনো ইংরেজি শব্দ লিখে মুহূর্তের মধ্যে তার নির্ভুল বাংলা অর্থ, Part of Speech এবং বাস্তব উদাহরণ দেখুন।
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-800">ইনবিল্ড লোকাল ডাটাবেজ সক্রিয় ({totalEntriesCount}টি মূল শব্দভাণ্ডার)</span>
          </div>
          <span className="font-semibold text-amber-800">কোনো থার্ড-পার্টি API বা নেটওয়ার্ক ছাড়াই পরিচালিত</span>
        </div>
      </div>
    </div>
  );
};
