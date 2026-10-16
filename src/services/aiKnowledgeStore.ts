// AI Knowledge Store & Self-Learning Engine for BS E-Learning & IT Zone
// Supports 200,000+ words capacity, structured training chunks (1,000 words each),
// and autonomous teacher Q&A pair learning.

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
// @ts-ignore
//import firebaseConfig from '../firebase-applet-config.json';
//
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  teacherId?: string;
  teacherName?: string;
  teacherVerified: boolean;
  timesUsed: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface TrainingChunk {
  id: string;
  title: string;
  category: string;
  content: string; // Up to 1,000 words per chunk
  wordCount: number;
  tags: string[];
  updatedAt: string;
}

// Initial pre-trained teacher verified Q&A database
const INITIAL_QA_ITEMS: QAItem[] = [
  {
    id: 'qa-1',
    question: 'সহীহ কুরআন শিক্ষার ক্লাস কখন হয় এবং ফি কত?',
    answer: 'সহীহ কুরআন শিক্ষার ক্লাস প্রতিদিন সকাল ০৬:৩০ থেকে ০৭:৩০ পর্যন্ত পরিচালিত হয় (শুক্রবার বাদে)। ভর্তি ফি মাত্র ৫০০ টাকা (প্রথম মাস সম্পূর্ণ ফ্রি ক্লাস অন্তর্ভুক্ত) এবং ২য় মাস থেকে মাসিক ফি ৫০০ টাকা। এই কোর্সের সার্টিফিকেট আজীবন সম্পূর্ণ ফ্রি!',
    keywords: ['কুরআন', 'কোরআন', 'ক্লাস', 'সময়', 'ফি', 'মাখরাজ', 'তাজবীদ'],
    teacherName: 'বোরহানউদ্দিন মহিম',
    teacherVerified: true,
    timesUsed: 14,
    createdAt: '2026-01-10'
  },
  {
    id: 'qa-2',
    question: 'কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্সে কী কী শেখানো হয়?',
    answer: '৬ মাস মেয়াদী কম্পিউটার অফিস অ্যাপ্লিকেশন কোর্সে MS Word (বাংলা ও ইংরেজি টাইপিং), MS Excel (ফাইন্যান্সিয়াল ফর্মুলা ও হিসাব), MS PowerPoint, MS Access, ইন্টারনেট ব্রাউজিং ও ইমেইল কমিউনিকেশন প্র্যাকটিক্যাল ল্যাবে শেখানো হয়। স্পেশাল অফার ভর্তি ফি ১,৫০০ টাকা এবং সরকারি সার্টিফিকেট (Govt. Approved) পাওয়ার বিশেষ সুবিধা রয়েছে।',
    keywords: ['কম্পিউটার', 'অফিস', 'ওয়ার্ড', 'এক্সেল', 'টাইপিং', 'সরকারি', 'সার্টিফিকেট'],
    teacherName: 'ইঞ্জিনিয়ার আরিফুল ইসলাম',
    teacherVerified: true,
    timesUsed: 29,
    createdAt: '2026-01-12'
  },
  {
    id: 'qa-3',
    question: 'এসএসসি হিসাববিজ্ঞানের জাবেদা ও রেওয়ামিল কীভাবে সহজে মনে রাখব?',
    answer: 'জাবেদার ক্ষেত্রে ডেবিট-ক্রেডিট নির্ণয়ের সোনালী সূত্র মনে রাখবেন: সম্পদ ও ব্যয় বৃদ্ধি পেলে ডেবিট, হ্রাস পেলে ক্রেডিট; দায়, মূলধন ও আয় বৃদ্ধি পেলে ক্রেডিট, হ্রাস পেলে ডেবিট। বোরহান স্যারের স্পেশাল শর্টকাট শিট ফলো করলে যেকোনো রেওয়ামিল ৫ মিনিটে নির্ভুলভাবে মেলানো সম্ভব।',
    keywords: ['হিসাববিজ্ঞান', 'জাবেদা', 'রেওয়ামিল', 'ডেবিট', 'ক্রেডিট', 'এসএসসি', 'অ্যাকাউন্টিং'],
    teacherName: 'বোরহানউদ্দিন মহিম',
    teacherVerified: true,
    timesUsed: 19,
    createdAt: '2026-01-15'
  },
  {
    id: 'qa-4',
    question: 'ইংরেজি গ্রামারে Right Form of Verbs এর নিয়ম কী?',
    answer: 'Subject-Verb Agreement মনে রাখবেন: Subject singular হলে verb singular (যেমন: He writes), subject plural হলে verb plural (যেমন: They write)। এছাড়া Modal auxiliary (can, could, may, might, must) এর পরে সবসময় verb-এর base form বসে। তাহসিন স্যারের গ্রামার ক্লাসে এর ২০টি জাদুকরী নিয়ম প্র্যাকটিস করানো হয়।',
    keywords: ['ইংরেজি', 'গ্রামার', 'verb', 'english', 'verbs', 'টেন্স', 'rules'],
    teacherName: 'মো: তাহসিন আহমেদ',
    teacherVerified: true,
    timesUsed: 11,
    createdAt: '2026-01-18'
  },
  {
    id: 'qa-5',
    question: 'বাংলা কিউআর দিয়ে কীভাবে পেমেন্ট করব?',
    answer: 'আমাদের ওয়েবসাইটে নির্দিষ্ট কোনো মোবাইল নম্বরে ক্যাশআউট করতে হয় না। আপনি আপনার বিকাশ, নগদ, রকেট, উপায় বা যেকোনো ব্যাংক অ্যাপ (Citytouch, Cellfin, NexusPay) দিয়ে বাংলা কিউআর (Bangla QR) স্ক্যান করে সরাসরি পেমেন্ট করবেন। পেমেন্ট শেষ হলে পাওয়া TrxID টি ফর্মে সাবমিট করলেই আবেদন তাৎক্ষণিক ভেরিফাই হবে।',
    keywords: ['বাংলা কিউআর', 'কিউআর', 'পেমেন্ট', 'বিকাশ', 'নগদ', 'টাকা', 'trxid'],
    teacherName: 'বোরহানউদ্দিন মহিম',
    teacherVerified: true,
    timesUsed: 42,
    createdAt: '2026-01-20'
  }
];

// Initial Training Chunks (1,000 words each category)
const INITIAL_TRAINING_CHUNKS: TrainingChunk[] = [
  {
    id: 'chunk-1',
    title: 'প্রতিষ্ঠান পরিচিতি, ভিশন ও প্রধান শিক্ষকের অঙ্গীকার',
    category: 'প্রতিষ্ঠান ও পরিচালনা',
    content: `BS E-Learning & IT Zone গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের শিক্ষা ও তথ্যপ্রযুক্তি রূপকল্পের সাথে সংগতি রেখে প্রতিষ্ঠিত একটি স্বনামধন্য আধুনিক শিক্ষা প্রতিষ্ঠান। এর প্রতিষ্ঠাতা ও প্রধান শিক্ষক জনাব বোরহানউদ্দিন মহিম। বিগত ১০ বছরেরও বেশি সময় ধরে তিনি নিরলসভাবে শিক্ষার্থীদের মানসম্মত পাঠদান দিয়ে আসছেন। প্রতিষ্ঠানটির প্রধান লক্ষ্য হলো শিক্ষার্থীদের গতানুগতিক মুখস্থ বিদ্যার বাইরে এনে বাস্তবমুখী কর্মদক্ষতা, সঠিক নৈতিক মূল্যবোধ এবং আধুনিক ডিজিটাল প্রযুক্তির গভীর জ্ঞানে সমৃদ্ধ করা। এখানে সহীহ কুরআন শিক্ষা থেকে শুরু করে মাধ্যমিক-উচ্চমাধ্যমিক অ্যাকাউন্টিং, গণিত, ইংরেজি এবং সরকারি মানসম্পন্ন কম্পিউটার কোর্স অত্যন্ত সুলভ মূল্যে ও স্কলারশিপ সুবিধায় পড়ানো হয়। প্রতিষ্ঠানটিতে সার্বক্ষণিক অনলাইন সাপোর্ট, ফ্রি হ্যান্ডনোট এবং আধুনিক কম্পিউটার ল্যাব সুবিধা রয়েছে।`,
    wordCount: 105,
    tags: ['প্রতিষ্ঠান', 'ভিশন', 'বোরহানউদ্দিন মহিম', 'প্রধান শিক্ষক', 'ইতিহাস'],
    updatedAt: '2026-01-15'
  },
  {
    id: 'chunk-2',
    title: 'ভর্তি পরীক্ষা ও ফি পরিশোধ সংক্রান্ত পূর্ণাঙ্গ নির্দেশিকা',
    category: 'ভর্তি ও ফি পলিসি',
    content: `আমাদের প্রতিষ্ঠানে যেকোনো কোর্সে ভর্তি অত্যন্ত সহজ ও স্বচ্ছ। প্রতিটি কোর্সের জন্য আলাদা কোর্স ফি ও মাসিক ফি নির্ধারিত রয়েছে। বিশেষ করে শিক্ষার্থীদের সুবিধার জন্য ইন্টারঅপারেবল বাংলা কিউআর (Bangla QR) ব্যবস্থা চালু রয়েছে। শিক্ষার্থী বা অভিভাবক ঘরে বসেই যেকোনো স্মার্টফোন ব্যাংকিং অ্যাপ অথবা এমএফএস ওয়ালেট (বিকাশ, নগদ, রকেট, উপায় ইত্যাদি) দিয়ে কিউআর কোড স্ক্যান করে মুহূর্তেই ফি পরিশোধ করতে পারেন। ফি পরিশোধের পর ট্রানজেকশন আইডি (TrxID) দিয়ে ওয়েবসাইট ফর্ম পূরণ করলেই আবেদন পেন্ডিং তালিকায় যুক্ত হয় এবং অ্যাডমিন দ্রুত যাচাই করে আইডি কার্ড ও এডমিট কার্ড প্রস্তুত করে দেন। দরিদ্র ও মেধাবী শিক্ষার্থীদের জন্য রয়েছে বিশেষ ছাড়।`,
    wordCount: 98,
    tags: ['ভর্তি', 'ফি', 'পেমেন্ট', 'বাংলা কিউআর', 'পলিসি'],
    updatedAt: '2026-01-18'
  },
  {
    id: 'chunk-3',
    title: 'পরীক্ষা পদ্ধতি, প্রবেশপত্র (এডমিট কার্ড) ও ফলাফল নীতি',
    category: 'পরীক্ষা ও ফলাফল',
    content: `প্রতিটি কোর্স শেষে শিক্ষার্থীদের সার্বিক যোগ্যতা যাচাইয়ের জন্য নিরপেক্ষ লিখিত ও ব্যবহারিক মূল্যায়ন পরীক্ষা অনুষ্ঠিত হয়। পরীক্ষার পূর্বশর্ত হিসেবে শিক্ষার্থীদের চলতি মাসের ফি পরিশোধ করে অনলাইন থেকে রঙিন প্রবেশপত্র (Admit Card) প্রিন্ট করতে হবে। প্রবেশপত্রে প্রধান শিক্ষকের ডিজিটাল সিল ও স্বাক্ষর সম্বলিত থাকে। পরীক্ষা সমাপ্তির পর ফলাফল ওয়েবসাইটে প্রকাশিত হয় এবং রোল নম্বর ও শিক্ষাবর্ষ দিয়ে সার্চ করে অফিশিয়াল গ্রেডশিট বা মার্কশিট ডাউনলোড করা যায়। পরীক্ষায় জিপিএ-৫ বা 'A+' প্রাপ্ত শিক্ষার্থীদের জন্য বিশেষ সনদ ও মেডেল প্রদান করা হয়।`,
    wordCount: 88,
    tags: ['পরীক্ষা', 'এডমিট কার্ড', 'ফলাফল', 'মার্কশিট', 'নিয়মাবলী'],
    updatedAt: '2026-01-20'
  }
];

class AIKnowledgeStoreService {
  private qaCache: QAItem[] = [];
  private chunksCache: TrainingChunk[] = [];
  private initialized = false;

  constructor() {
    this.init();
    this.initRealtimeSync();
  }

  private init() {
    if (this.initialized) return;
    try {
      const qaRaw = localStorage.getItem('bs_ai_qa_kb');
      this.qaCache = qaRaw ? JSON.parse(qaRaw) : INITIAL_QA_ITEMS;

      const chunksRaw = localStorage.getItem('bs_ai_training_chunks');
      this.chunksCache = chunksRaw ? JSON.parse(chunksRaw) : INITIAL_TRAINING_CHUNKS;

      this.initialized = true;
    } catch {
      this.qaCache = INITIAL_QA_ITEMS;
      this.chunksCache = INITIAL_TRAINING_CHUNKS;
      this.initialized = true;
    }
  }

  // Real-time Firestore synchronization listener
  private initRealtimeSync() {
    try {
      onSnapshot(doc(db, 'ai_kb', 'main_data'), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const remoteData = docSnapshot.data() as { qa?: QAItem[]; chunks?: TrainingChunk[] };
          if (remoteData.qa && Array.isArray(remoteData.qa)) {
            this.qaCache = remoteData.qa;
            localStorage.setItem('bs_ai_qa_kb', JSON.stringify(this.qaCache));
          }
          if (remoteData.chunks && Array.isArray(remoteData.chunks)) {
            this.chunksCache = remoteData.chunks;
            localStorage.setItem('bs_ai_training_chunks', JSON.stringify(this.chunksCache));
          }
          window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'ai_realtime_synced' } }));
        }
      });
    } catch (e) {
      console.warn('Realtime sync listener error:', e);
    }
  }

  // Save QA items to local storage and sync to Firestore
  private persistQA() {
    try {
      localStorage.setItem('bs_ai_qa_kb', JSON.stringify(this.qaCache));
      window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'ai_qa_kb' } }));
      this.syncToFirestore();
    } catch (e) {
      console.warn('Persist QA error:', e);
    }
  }

  // Save Training Chunks (up to 200,000+ words across chunks)
  private persistChunks() {
    try {
      localStorage.setItem('bs_ai_training_chunks', JSON.stringify(this.chunksCache));
      window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'ai_training_chunks' } }));
      this.syncToFirestore();
    } catch (e) {
      console.warn('Persist chunks error:', e);
    }
  }

  // Sync current state to Firestore
  private async syncToFirestore() {
    try {
      await setDoc(doc(db, 'ai_kb', 'main_data'), {
        qa: this.qaCache,
        chunks: this.chunksCache,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore sync error:', e);
    }
  }

  // Get all Q&A pairs
  getKnowledgeBase(): QAItem[] {
    this.init();
    return this.qaCache;
  }

  // Get all training chunks (supports 200,000+ words)
  getTrainingChunks(): TrainingChunk[] {
    this.init();
    return this.chunksCache;
  }

  // Total words across all knowledge chunks
  getTotalWordCount(): number {
    this.init();
    const chunkWords = this.chunksCache.reduce((acc, c) => acc + (c.content ? c.content.split(/\s+/).filter(Boolean).length : 0), 0);
    const qaWords = this.qaCache.reduce((acc, q) => acc + (q.answer ? q.answer.split(/\s+/).filter(Boolean).length : 0), 0);
    return chunkWords + qaWords;
  }

  // Add a verified Teacher-Student Q&A pair (Dynamic Self-Learning)
  addQAPair(
    question: string,
    answer: string,
    teacherName: string = 'বোরহানউদ্দিন মহিম',
    teacherVerified: boolean = true
  ): QAItem {
    this.init();
    const cleanQ = question.trim();
    const cleanA = answer.trim();

    // Extract relevant keywords
    const keywords = cleanQ
      .toLowerCase()
      .split(/[\s,?!;।+*()/-]+/)
      .filter(w => w.length > 2);

    // Check if question already exists
    const existingIndex = this.qaCache.findIndex(
      q => q.question.toLowerCase() === cleanQ.toLowerCase()
    );

    let savedItem: QAItem;
    if (existingIndex >= 0) {
      savedItem = {
        ...this.qaCache[existingIndex],
        answer: cleanA,
        teacherName: teacherName || this.qaCache[existingIndex].teacherName,
        teacherVerified: true,
        keywords: Array.from(new Set([...this.qaCache[existingIndex].keywords, ...keywords])),
        timesUsed: this.qaCache[existingIndex].timesUsed + 1,
        lastUsedAt: new Date().toISOString()
      };
      this.qaCache[existingIndex] = savedItem;
    } else {
      savedItem = {
        id: `qa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        question: cleanQ,
        answer: cleanA,
        keywords: Array.from(new Set(keywords)),
        teacherName,
        teacherVerified,
        timesUsed: 1,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsedAt: new Date().toISOString()
      };
      this.qaCache.unshift(savedItem);
    }

    this.persistQA();
    return savedItem;
  }

  // Save or update an Admin Training Chunk (up to 1,000 words per chunk)
  saveTrainingChunk(
    chunk: Omit<TrainingChunk, 'id' | 'wordCount' | 'updatedAt'> & { id?: string }
  ): TrainingChunk {
    this.init();
    const words = chunk.content.trim().split(/\s+/).filter(Boolean).length;
    const finalId = chunk.id || `chunk-${Date.now()}`;

    const existingIdx = this.chunksCache.findIndex(c => c.id === finalId);
    const newChunk: TrainingChunk = {
      ...chunk,
      id: finalId,
      wordCount: words,
      tags: chunk.tags || [],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (existingIdx >= 0) {
      this.chunksCache[existingIdx] = newChunk;
    } else {
      this.chunksCache.push(newChunk);
    }

    this.persistChunks();
    return newChunk;
  }

  // Delete a training chunk
  deleteTrainingChunk(id: string): void {
    this.init();
    this.chunksCache = this.chunksCache.filter(c => c.id !== id);
    this.persistChunks();
  }

  // Delete a Q&A pair
  deleteQAPair(id: string): void {
    this.init();
    this.qaCache = this.qaCache.filter(q => q.id !== id);
    this.persistQA();
  }

  // Keyword and semantic retrieval algorithm for AI Chatbot
  searchLearnedAnswer(query: string): {
    answer: string;
    confidence: number;
    source: string;
    teacherName?: string;
  } | null {
    this.init();
    if (!query || !query.trim()) return null;

    const lowerQuery = query.toLowerCase().trim();
    const queryTerms = lowerQuery.split(/[\s,?!;।+*()/-]+/).filter(w => w.length > 1);

    if (queryTerms.length === 0) return null;

    // 1. Search in teacher-verified QA Items
    let bestQA: QAItem | null = null;
    let highestQAScore = 0;

    for (const item of this.qaCache) {
      const lowerQ = item.question.toLowerCase();
      let score = 0;

      if (lowerQ === lowerQuery) {
        score += 100;
      } else if (lowerQ.includes(lowerQuery) || lowerQuery.includes(lowerQ)) {
        score += 50;
      }

      for (const term of queryTerms) {
        if (item.keywords.some(k => k.toLowerCase() === term)) {
          score += 15;
        } else if (lowerQ.includes(term)) {
          score += 10;
        }
      }

      if (score > highestQAScore) {
        highestQAScore = score;
        bestQA = item;
      }
    }

    if (bestQA && highestQAScore >= 20) {
      bestQA.timesUsed = (bestQA.timesUsed || 0) + 1;
      bestQA.lastUsedAt = new Date().toISOString();
      this.persistQA();

      return {
        answer: bestQA.answer,
        confidence: Math.min(100, highestQAScore),
        source: `শিক্ষক কর্তৃক যাচাইকৃত প্রশ্নোত্তর (${bestQA.teacherName || 'বোরহানউদ্দিন মহিম'})`,
        teacherName: bestQA.teacherName
      };
    }

    // 2. Search in 200,000+ words Training Chunks
    let bestChunk: TrainingChunk | null = null;
    let highestChunkScore = 0;
    let matchedSnippet = '';

    for (const chunk of this.chunksCache) {
      const lowerContent = chunk.content.toLowerCase();
      const lowerTitle = chunk.title.toLowerCase();
      let score = 0;

      for (const term of queryTerms) {
        if (lowerTitle.includes(term)) {
          score += 20;
        }
        if (chunk.tags.some(t => t.toLowerCase() === term)) {
          score += 15;
        }
        const count = (lowerContent.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(count * 5, 25);
      }

      if (score > highestChunkScore) {
        highestChunkScore = score;
        bestChunk = chunk;

        const sentences = chunk.content.split(/[।.\n]+/).map(s => s.trim()).filter(Boolean);
        let bestSentence = sentences[0] || chunk.content;
        let bestSentScore = 0;

        for (const sent of sentences) {
          const lowerS = sent.toLowerCase();
          const sentMatches = queryTerms.filter(t => lowerS.includes(t)).length;
          if (sentMatches > bestSentScore) {
            bestSentScore = sentMatches;
            bestSentence = sent;
          }
        }
        matchedSnippet = bestSentence;
      }
    }

    if (bestChunk && highestChunkScore >= 20) {
      return {
        answer: `📌 [${bestChunk.title}]\n\n${bestChunk.content}`,
        confidence: Math.min(95, highestChunkScore),
        source: `প্রতিষ্ঠানের ডাটাবেজ মডিউল (${bestChunk.category})`
      };
    }

    return null;
  }

  // Bulk update data from server
  hydrateFromServer(data: { qa?: QAItem[]; chunks?: TrainingChunk[] }) {
    if (data.qa && Array.isArray(data.qa)) {
      this.qaCache = data.qa;
      localStorage.setItem('bs_ai_qa_kb', JSON.stringify(this.qaCache));
    }
    if (data.chunks && Array.isArray(data.chunks)) {
      this.chunksCache = data.chunks;
      localStorage.setItem('bs_ai_training_chunks', JSON.stringify(this.chunksCache));
    }
    window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'ai_hydrated' } }));
  }
}

export const aiKnowledgeStore = new AIKnowledgeStoreService();
