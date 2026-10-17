import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Search, Volume2, Copy, Check, Sparkles, ExternalLink, Globe, Tag } from 'lucide-react';

interface OxfordDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DefinitionItem {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface MeaningItem {
  partOfSpeech: string;
  definitions: DefinitionItem[];
  synonyms?: string[];
}

interface DictionaryResult {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: MeaningItem[];
  source?: 'oxford' | 'local' | 'wiki';
  bengaliMeaning?: string;
  bengaliCategory?: string;
  bengaliExample?: string;
  wikiExtract?: string;
  wikiUrl?: string;
}

// Built-in high-frequency academic & IT dictionary records for instant zero-latency Bengali lookup
const LOCAL_VOCABULARY: Record<string, { bnMeaning: string; category: string; bnExample?: string; synonyms?: string[] }> = {
  'education': {
    bnMeaning: 'শিক্ষা, জ্ঞানার্জন বা পাঠদান প্রক্রিয়া; ব্যক্তির সুপ্ত প্রতিভার বিকাশ সাধন।',
    category: 'সাধারণ শিক্ষা',
    bnExample: 'Education is the backbone of a nation.',
    synonyms: ['learning', 'instruction', 'schooling', 'training']
  },
  'computer': {
    bnMeaning: 'কম্পিউটার; ইলেকট্রনিক গণনাকারী যন্ত্র যা ডাটা গ্রহণ করে বিশ্লেষণ ও প্রক্রিয়াজাত করে নির্ভুল ফলাফল দেয়।',
    category: 'আইসিটি ও কম্পিউটার',
    bnExample: 'Modern computers can process billions of instructions per second.',
    synonyms: ['PC', 'processor', 'workstation']
  },
  'knowledge': {
    bnMeaning: 'জ্ঞান, পাণ্ডিত্য, প্রজ্ঞা; অভিজ্ঞতা বা অধ্যায়নের মাধ্যমে অর্জিত বাস্তব তথ্য ও দক্ষতা।',
    category: 'শিক্ষা ও দর্শন',
    bnExample: 'Knowledge is power.',
    synonyms: ['wisdom', 'learning', 'understanding', 'expertise']
  },
  'resilience': {
    bnMeaning: 'স্থিতিস্থাপকতা, দৃঢ়তা; কঠিন পরিস্থিতিতে ঘুরে দাঁড়ানোর ও টিকে থাকার মানসিক শক্তি।',
    category: 'মনোবিজ্ঞান ও জীবনদক্ষতা',
    bnExample: 'Resilience is key to overcoming life challenges.',
    synonyms: ['toughness', 'flexibility', 'durability', 'endurance']
  },
  'accounting': {
    bnMeaning: 'হিসাববিজ্ঞান; আর্থিক লেনদেন লিপিবদ্ধকরণ, শ্রেণীবদ্ধকরণ ও চূড়ান্ত আর্থিক বিবরণী প্রস্তুতের পদ্ধতি।',
    category: 'ব্যবসায় শিক্ষা',
    bnExample: 'Accounting is considered the language of business.',
    synonyms: ['bookkeeping', 'finance', 'auditing']
  },
  'algorithm': {
    bnMeaning: 'অ্যালগরিদম; কোনো নির্দিষ্ট সমস্যা সমাধানের ধাপে ধাপে সুনির্দিষ্ট নিয়মতান্ত্রিক কার্যপদ্ধতি।',
    category: 'কম্পিউটার বিজ্ঞান',
    bnExample: 'A search engine uses complex algorithms to rank web pages.',
    synonyms: ['procedure', 'formula', 'method', 'logic']
  },
  'internet': {
    bnMeaning: 'ইন্টারনেট; বিশ্বজুড়ে সংযুক্ত কম্পিউটার নেটওয়ার্কের এক বিশাল যোগাযোগ মাধ্যম।',
    category: 'টেলিকমিউনিকেশন',
    bnExample: 'The internet has revolutionized global communication.',
    synonyms: ['web', 'cyberspace', 'net']
  },
  'excellence': {
    bnMeaning: 'উৎকর্ষ, শ্রেষ্ঠত্ব, চরম গুণমান বা কৃতিত্ব।',
    category: 'নৈতিকতা ও প্রেরণা',
    bnExample: 'We strive for excellence in education.',
    synonyms: ['perfection', 'distinction', 'quality']
  },
  'student': {
    bnMeaning: 'শিক্ষার্থী, ছাত্র/ছাত্রী; যিনি কোনো শিক্ষা প্রতিষ্ঠানে অধ্যায়ন করেন।',
    category: 'শিক্ষা',
    bnExample: 'The students are preparing for their final examination.',
    synonyms: ['pupil', 'learner', 'scholar']
  },
  'teacher': {
    bnMeaning: 'শিক্ষক, মেন্টর; যিনি জ্ঞান ও প্রজ্ঞা দান করেন এবং সঠিক পথপ্রদর্শন করেন।',
    category: 'শিক্ষা',
    bnExample: 'A good teacher inspires hope and ignites the imagination.',
    synonyms: ['instructor', 'educator', 'mentor', 'tutor']
  },
  'integrity': {
    bnMeaning: 'সততা, সাধুতা, চারিত্রিক দৃঢ়তা ও নীতিপরায়ণতা।',
    category: 'নৈতিক শিক্ষা',
    bnExample: 'Integrity is doing the right thing, even when no one is watching.',
    synonyms: ['honesty', 'uprightness', 'morality', 'sincerity']
  },
  'certificate': {
    bnMeaning: 'সনদপত্র, প্রত্যয়নপত্র; কোর্স বা যোগ্যতা সফলভাবে অর্জনের অফিশিয়াল দালিলিক প্রমাণ।',
    category: 'একাডেমিক প্রশাসন',
    bnExample: 'She received a certificate of completion after the 6-month course.',
    synonyms: ['diploma', 'credential', 'testimonial', 'license']
  }
};

export const OxfordDictionaryModal: React.FC<OxfordDictionaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'education',
    'computer',
    'knowledge',
    'resilience'
  ]);
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (!result && searchTerm) {
        handleLookup(searchTerm);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLookup = async (queryToSearch?: string) => {
    const rawTerm = (queryToSearch || searchTerm).trim();
    if (!rawTerm) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Save to recents
    setRecentSearches(prev => [rawTerm.toLowerCase(), ...prev.filter(s => s.toLowerCase() !== rawTerm.toLowerCase())].slice(0, 8));

    const lower = rawTerm.toLowerCase();
    const localMatch = LOCAL_VOCABULARY[lower];

    try {
      // 1. Fetch from Free Oxford/Web Dictionary API
      const apiRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lower)}`);
      
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          
          // Find valid audio URL
          let audioUrl = '';
          if (entry.phonetics && Array.isArray(entry.phonetics)) {
            for (const p of entry.phonetics) {
              if (p.audio && p.audio.trim().length > 0) {
                audioUrl = p.audio.startsWith('http') ? p.audio : `https:${p.audio}`;
                break;
              }
            }
          }

          const parsedResult: DictionaryResult = {
            word: entry.word,
            phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
            audioUrl,
            meanings: entry.meanings || [],
            source: 'oxford',
            bengaliMeaning: localMatch?.bnMeaning,
            bengaliCategory: localMatch?.category,
            bengaliExample: localMatch?.bnExample
          };

          setResult(parsedResult);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback to local or wiki
    }

    // 2. If Oxford API doesn't find it, check Local Vocabulary DB
    if (localMatch) {
      setResult({
        word: rawTerm,
        phonetic: '',
        meanings: [
          {
            partOfSpeech: localMatch.category,
            definitions: [
              {
                definition: localMatch.bnMeaning,
                example: localMatch.bnExample,
                synonyms: localMatch.synonyms
              }
            ]
          }
        ],
        source: 'local',
        bengaliMeaning: localMatch.bnMeaning,
        bengaliCategory: localMatch.category,
        bengaliExample: localMatch.bnExample
      });
      setLoading(false);
      return;
    }

    // 3. Fallback to Wikipedia Summary REST API (Bengali & English)
    try {
      const wikiRes = await fetch(`/api/wiki?q=${encodeURIComponent(rawTerm)}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.success && wikiData.extract) {
          setResult({
            word: wikiData.title || rawTerm,
            phonetic: wikiData.lang === 'bn' ? 'বাংলা জ্ঞানভাণ্ডার' : 'English Wikipedia',
            meanings: [
              {
                partOfSpeech: wikiData.description || 'শব্দার্থ ও পরিচিতি',
                definitions: [
                  {
                    definition: wikiData.extract
                  }
                ]
              }
            ],
            source: 'wiki',
            wikiExtract: wikiData.extract,
            wikiUrl: wikiData.url
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      // Wiki search failed
    }

    // If nothing found
    setError(`"${rawTerm}" শব্দটির কোনো অর্থ বা ব্যাখ্যা পাওয়া যায়নি। অনুগ্রহ করে বানানটি সঠিক কি না দেখে পুনরায় চেষ্টা করুন।`);
    setLoading(false);
  };

  const playPronunciation = (audioUrl?: string) => {
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => playSpeechFallback());
      } catch {
        playSpeechFallback();
      }
    } else {
      playSpeechFallback();
    }
  };

  const playSpeechFallback = () => {
    if ('speechSynthesis' in window && result?.word) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyDefinition = () => {
    if (!result) return;
    let text = `${result.word} ${result.phonetic ? `(${result.phonetic})` : ''}\n`;
    if (result.bengaliMeaning) text += `বাংলা অর্থ: ${result.bengaliMeaning}\n\n`;
    result.meanings.forEach(m => {
      text += `[${m.partOfSpeech}]\n`;
      m.definitions.forEach((d, i) => {
        text += `${i + 1}. ${d.definition}\n`;
        if (d.example) text += `   উদাহরণ: "${d.example}"\n`;
      });
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs select-none no-print">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide text-white">
                  অক্সফোর্ড ডিকশনারি
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950">
                  Oxford &amp; Bangla
                </span>
              </div>
              <p className="text-xs text-amber-100">
                শব্দের অর্থ, সঠিক উচ্চারণ, ব্যাকরণ রূপ, উদাহরণ ও সমার্থক শব্দ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
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
                placeholder="যেকোনো ইংরেজি বা বাংলা শব্দ লিখুন... (যেমন: Education, Computer, Resilience)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              {loading ? (
                <Sparkles className="w-4 h-4 animate-spin text-amber-200" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>অর্থ খুঁজুন</span>
            </button>
          </form>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar pt-0.5">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3" /> দ্রুত সন্ধান:
            </span>
            {recentSearches.map((word, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchTerm(word);
                  handleLookup(word);
                }}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-900 text-[11px] font-medium transition-colors shrink-0"
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Content Display Area */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">অক্সফোর্ড ডাটাবেজ অনুসন্ধান করা হচ্ছে...</p>
              <p className="text-xs text-slate-400">শব্দার্থ, উচ্চারণ ও গ্রামাটিক্যাল নিয়মাবলী লোড হচ্ছে</p>
            </div>
          ) : error ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-amber-600 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-amber-950">{error}</h4>
              <p className="text-xs text-slate-600">
                টিপস: ইংরেজি শব্দের ক্ষেত্রে সঠিক spelling (যেমন: Education, Computer, Mathematics) লিখুন।
              </p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {/* Word Header & Audio Pronunciation */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 capitalize tracking-tight font-sans">
                      {result.word}
                    </h2>
                    <button
                      onClick={() => playPronunciation(result.audioUrl)}
                      className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors shadow-xs group"
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                  {result.phonetic && (
                    <p className="text-xs font-mono text-amber-700 font-semibold mt-0.5">
                      {result.phonetic}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCopyDefinition}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              {/* Instant Bengali Meaning Banner (if available) */}
              {result.bengaliMeaning && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider">
                      ★ সহজ বাংলা অর্থ ও তাৎপর্য:
                    </span>
                    {result.bengaliCategory && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/60 text-amber-900">
                        {result.bengaliCategory}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {result.bengaliMeaning}
                  </p>
                  {result.bengaliExample && (
                    <p className="text-xs text-slate-600 italic pt-0.5">
                      ব্যবহার: "{result.bengaliExample}"
                    </p>
                  )}
                </div>
              )}

              {/* Oxford English Meanings by Part of Speech */}
              <div className="space-y-4">
                {result.meanings.map((meaning, mIdx) => (
                  <div key={mIdx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-xs uppercase tracking-wider">
                        {meaning.partOfSpeech}
                      </span>
                      <div className="h-px bg-slate-200 grow" />
                    </div>

                    <ol className="list-decimal list-outside pl-5 space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {meaning.definitions.slice(0, 4).map((def, dIdx) => (
                        <li key={dIdx} className="space-y-1 pl-1">
                          <p className="font-medium text-slate-900">{def.definition}</p>
                          {def.example && (
                            <p className="text-xs text-slate-500 italic">
                              "{def.example}"
                            </p>
                          )}
                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center pt-0.5">
                              <span className="text-[10px] font-bold text-slate-400">সমার্থক শব্দ:</span>
                              {def.synonyms.slice(0, 5).map((syn, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    setSearchTerm(syn);
                                    handleLookup(syn);
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 text-[10px] text-slate-700 hover:text-amber-900 font-mono transition-colors"
                                >
                                  {syn}
                                </button>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>

              {/* Wikipedia External Reference */}
              {result.wikiUrl && (
                <div className="pt-2 border-t border-slate-200">
                  <a
                    href={result.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-950 underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>উইকিপিডিয়ায় পূর্ণাঙ্গ প্রবন্ধ পড়ুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3 text-slate-400">
              <BookOpen className="w-12 h-12 text-amber-500/50 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">
                অক্সফোর্ড ডিকশনারিতে অনুসন্ধান করুন
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                উপরে যেকোনো ইংরেজি বা বাংলা শব্দ লিখে "অর্থ খুঁজুন" চাপলে তাৎক্ষণিকভাবে সঠিক অর্থ, উচ্চারণ ও উদাহরণ পাওয়া যাবে।
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span>BS E-Learning &amp; IT Zone • স্টুডেন্ট লার্নিং টুলস</span>
          <span className="font-bold text-amber-800">English &amp; Bengali Dictionary</span>
        </div>
      </div>
    </div>
  );
};
