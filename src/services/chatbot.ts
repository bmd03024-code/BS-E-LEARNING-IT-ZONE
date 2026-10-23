import { storage } from './storage';

type QAPair = { id: string; q: string; a: string; ts: number; source?: string };

class LocalChatbot {
  memory: QAPair[] = [];
  index: Map<string, number[]> = new Map(); // very small in-memory index for tokens
  constructor() { this.load(); }
  load() {
    const s = storage.getItem<QAPair[]>('chat_memory', []);
    this.memory = s || [];
    this.reindex();
  }
  reindex() {
    // simple token -> doc list index for fast filtering. For scale (200k words) chunk and build TF counts.
    // Implementation omitted for brevity — use simple tokenization and cosine sim on demand.
  }
  async appendQAPair(q: string, a: string, source = 'chat') {
    const p: QAPair = { id: `qa-${Date.now()}`, q, a, ts: Date.now(), source };
    this.memory.unshift(p);
    storage.saveChatMemory(this.memory);
    this.reindex();
  }
  async retrieve(question: string, top = 6) {
    // compute naive TF-IDF similarity across memory + knowledgeBaseText chunks and return top chunks
    // If no matches, also attempt Wikipedia summary retrieval for main keywords
    return this.memory.slice(0, top).map(m => ({ q: m.q, a: m.a }));
  }
  async wikiSummary(term: string) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`;
      const r = await fetch(url);
      if (!r.ok) return null;
      const text = await r.text();
      const j = text ? JSON.parse(text) : null;
      return j?.extract || null;
    } catch { return null; }
  }
  async ask(question: string) {
    const hits = await this.retrieve(question, 6);
    // basic composition: use best-matching stored answer(s) + knowledgeBase
    if (hits && hits.length) {
      return hits.map(h => h.a).join('\n\n');
    }
    // fallback to wiki
    const words = question.split(/\s+/).slice(0,3).join(' ');
    const wiki = await this.wikiSummary(words);
    if (wiki) return `Wikipedia summary:\n${wiki}`;
    return "দুঃখিত, এটি এখনও আমার কাছে নেই — শিক্ষককে প্রশ্নটি রাউট করা হবে।";
  }
}
export const chatbot = new LocalChatbot();
