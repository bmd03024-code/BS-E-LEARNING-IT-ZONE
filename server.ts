import express, { type Request, type Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
let firebaseConfig: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (err) {
  console.warn('[Server] Could not parse firebase-applet-config.json:', err);
}

const app = express();
// Default to 3000 for AI Studio environment and iframe preview, avoiding port 8080 collision with internal proxy
const port = (Number(process.env.PORT) === 8080 || !process.env.PORT) ? 3000 : Number(process.env.PORT);
const server = http.createServer(app);

// Initialize Socket.io Server attached to same HTTP server (No extra ports needed!)
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 15000,
  pingTimeout: 10000,
  maxHttpBufferSize: 6e7 // 60MB payload limit for high-res certificates and data
});

// High payload limits for rich institutional seals, signatures, and logos
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Ensure persistent data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'institute_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory Database Store
let database: Record<string, any> = {};
let dbVersion = 1;

// Load persisted data on startup from disk
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    database = JSON.parse(raw);
    console.log(`[Database] Loaded persistent data from ${DB_FILE}`);
  } catch (err) {
    console.error('[Database] Failed to read database file, starting fresh:', err);
    database = {};
  }
}

// Initialize Server-side Firebase Firestore instance safely
let firestoreDb: any = null;
if (firebaseConfig?.projectId && firebaseConfig?.firestoreDatabaseId) {
  try {
    const firebaseApp = initializeApp(firebaseConfig, 'serverApp');
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.warn('[Server] Could not initialize server Firebase instance:', err);
  }
}

// Server Firestore Quota tracking (persisted to disk to eliminate rejected retries)
const QUOTA_FILE = path.join(DATA_DIR, 'quota_state.json');
let serverFirestoreQuotaExhausted = false;
if (fs.existsSync(QUOTA_FILE)) {
  try {
    const qData = JSON.parse(fs.readFileSync(QUOTA_FILE, 'utf-8'));
    if (qData.exhausted && (Date.now() - qData.timestamp < 24 * 60 * 60 * 1000)) {
      serverFirestoreQuotaExhausted = true;
      console.log('[Server] Daily Firestore free write quota exhausted. Seamlessly routing all writes through persistent disk and Socket.io.');
    }
  } catch {}
}

function flagServerQuotaExhausted() {
  if (!serverFirestoreQuotaExhausted) {
    serverFirestoreQuotaExhausted = true;
    try {
      fs.writeFileSync(QUOTA_FILE, JSON.stringify({ exhausted: true, timestamp: Date.now(), reason: 'Daily write limit reached' }), 'utf-8');
    } catch {}
    console.warn('[Server] Firestore quota limit reached on write. Routing all future syncs through high-speed disk & Socket.io.');
  }
}

// Endpoint to inform clients about Firestore quota state
app.get('/api/quota-state', (_req: Request, res: Response) => {
  res.json({
    exhausted: serverFirestoreQuotaExhausted,
    firestoreQuotaExhausted: serverFirestoreQuotaExhausted,
    timestamp: Date.now()
  });
});

// Explicit route for institute_db.json with proper JSON headers to prevent HTML fallback
app.get(['/institute_db.json', '/data/institute_db.json', '/api/institute_db.json'], (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (database && Object.keys(database).length > 0) {
    return res.json(database);
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      database = parsed;
      return res.json(parsed);
    } catch {}
  }
  return res.json({});
});

// Hydrate server database from Firestore on startup only if disk is empty and quota allows
async function initServerFirestoreSync() {
  if (!firestoreDb || serverFirestoreQuotaExhausted) return;
  if (Object.keys(database).length > 0) {
    console.log(`[Server] Persistent disk database loaded with ${Object.keys(database).length} modules (Master Source of Truth). Skipping Firestore overwrite.`);
    return;
  }

  try {
    const colRef = collection(firestoreDb, 'institute_data');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const chunkMap: Record<string, { index: number; data: any[] }[]> = {};
      snap.forEach(d => {
        const docData = d.data();
        if (!docData) return;
        if (docData.isChunk && docData.parentKey) {
          if (!chunkMap[docData.parentKey]) chunkMap[docData.parentKey] = [];
          chunkMap[docData.parentKey].push({ index: docData.chunkIndex ?? 0, data: docData.data || [] });
        } else if (!docData.isChunked && docData.data !== undefined) {
          database[d.id] = docData.data;
        }
      });

      for (const [parentKey, chunks] of Object.entries(chunkMap)) {
        chunks.sort((a, b) => a.index - b.index);
        database[parentKey] = chunks.flatMap(c => c.data);
      }

      persistDatabase();
      console.log(`[Server] Hydrated ${snap.size} modules directly from Cloud Firestore!`);
    }
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('quota') || String(err).includes('Quota')) {
      flagServerQuotaExhausted();
    }
    console.warn('[Server] Firestore hydration catch (using disk cache):', err?.message || err);
  }
}
initServerFirestoreSync();

// Safe write to Firestore with 1MB document size limit guard and automatic chunking
async function safeServerFirestoreWrite(key: string, value: any) {
  if (!firestoreDb || serverFirestoreQuotaExhausted) return;

  try {
    const rawPayload = JSON.stringify({ key, data: value, updatedAt: new Date().toISOString() });
    const byteSize = Buffer.byteLength(rawPayload, 'utf8');

    // Firestore 1MB document limit guard (1,048,576 bytes). Threshold at 850KB.
    if (byteSize > 850000) {
      if (Array.isArray(value) && value.length > 1) {
        const chunks: any[][] = [];
        let currentChunk: any[] = [];
        let currentSize = 0;

        for (const item of value) {
          const itemSize = Buffer.byteLength(JSON.stringify(item), 'utf8');
          if (currentSize + itemSize > 600000 && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [item];
            currentSize = itemSize;
          } else {
            currentChunk.push(item);
            currentSize += itemSize;
          }
        }
        if (currentChunk.length > 0) chunks.push(currentChunk);

        for (let i = 0; i < chunks.length; i++) {
          const chunkRef = doc(firestoreDb, 'institute_data', `${key}__chunk_${i}`);
          await setDoc(chunkRef, {
            key: `${key}__chunk_${i}`,
            isChunk: true,
            parentKey: key,
            chunkIndex: i,
            totalChunks: chunks.length,
            data: chunks[i],
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }

        const parentRef = doc(firestoreDb, 'institute_data', key);
        await setDoc(parentRef, {
          key,
          isChunked: true,
          chunkCount: chunks.length,
          totalItems: value.length,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log(`[Server] Stored oversized array '${key}' (${byteSize} bytes) into ${chunks.length} safe Firestore chunks.`);
        return;
      } else {
        console.warn(`[Server] Document '${key}' size (${byteSize} bytes) exceeds 850KB. Persisted to disk & Socket.io to prevent 1MB limit crash.`);
        return;
      }
    }

    const docRef = doc(firestoreDb, 'institute_data', key);
    await setDoc(docRef, { key, data: value, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || String(err).includes('quota') || String(err).includes('Quota')) {
      flagServerQuotaExhausted();
    } else {
      console.warn(`[Server Firestore Write Notice] for ${key}:`, err?.message || err);
    }
  }
}

// Save database to disk and public static paths for 100% reliable Vercel/Express sync
function persistDatabase() {
  try {
    const jsonStr = JSON.stringify(database, null, 2);
    // 1. Save to persistent data directory
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');

    // 2. Save to public directory for static asset delivery on Vite / Vercel
    const publicPath = path.resolve(process.cwd(), 'public', 'institute_db.json');
    fs.writeFileSync(publicPath, jsonStr, 'utf-8');

    const publicDataDir = path.resolve(process.cwd(), 'public', 'data');
    if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });
    fs.writeFileSync(path.join(publicDataDir, 'institute_db.json'), jsonStr, 'utf-8');

    // 3. If dist exists, keep dist in sync as well
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      fs.writeFileSync(path.join(distPath, 'institute_db.json'), jsonStr, 'utf-8');
      const distDataDir = path.join(distPath, 'data');
      if (!fs.existsSync(distDataDir)) fs.mkdirSync(distDataDir, { recursive: true });
      fs.writeFileSync(path.join(distDataDir, 'institute_db.json'), jsonStr, 'utf-8');
    }
  } catch (err) {
    console.error('[Database] Error saving to disk & public:', err);
  }
}

// Real-Time Server-Sent Events (SSE) Client Connections
interface SSEClient {
  id: string;
  res: Response;
}
let sseClients: SSEClient[] = [];

// Broadcast changes to all connected client browsers worldwide in real-time
function broadcastUpdate(type: 'SYNC_UPDATE' | 'SYNC_ALL' | 'AI_UPDATE', key?: string, value?: any) {
  dbVersion++;
  const payloadObj = {
    type,
    key,
    value,
    version: dbVersion,
    timestamp: Date.now()
  };

  // 1. Instant zero-latency broadcast to all Socket.io clients
  if (type === 'SYNC_ALL') {
    io.emit('sync:all', { version: dbVersion, data: database, timestamp: Date.now() });
  } else {
    io.emit('sync:update', { key, value, version: dbVersion, timestamp: Date.now() });
  }

  // 2. Broadcast to SSE connections
  const payload = JSON.stringify(payloadObj);
  const deadClientIds: string[] = [];
  for (const client of sseClients) {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {
      deadClientIds.push(client.id);
    }
  }

  if (deadClientIds.length > 0) {
    sseClients = sseClients.filter(c => !deadClientIds.includes(c.id));
  }
}

// Active connected client tracking for Socket.io
let connectedSocketCount = 0;

// Socket.io Real-Time Event Handlers (Bidirectional, No rate limits, Lifetime persistence)
io.on('connection', (socket) => {
  connectedSocketCount++;
  console.log(`[Socket.io] Client connected: ${socket.id} (Online Browsers: ${connectedSocketCount})`);

  // Send real-time presence count to all connected browsers
  io.emit('presence:update', {
    onlineUsers: connectedSocketCount,
    timestamp: Date.now()
  });

  // Send initial data snapshot to the newly connected browser
  socket.emit('sync:init', {
    version: dbVersion,
    timestamp: Date.now(),
    data: database
  });

  // Client sent single key update
  socket.on('sync:push', (payload: { key: string; value: any; version?: number }) => {
    if (!payload?.key) return;

    dbVersion++;
    database[payload.key] = payload.value;
    persistDatabase();

    // Broadcast in zero-latency to all other connected sockets
    socket.broadcast.emit('sync:update', {
      key: payload.key,
      value: payload.value,
      version: dbVersion,
      timestamp: Date.now()
    });

    // Also push to SSE clients
    const ssePayload = JSON.stringify({
      type: 'SYNC_UPDATE',
      key: payload.key,
      value: payload.value,
      version: dbVersion,
      timestamp: Date.now()
    });
    for (const client of sseClients) {
      try { client.res.write(`data: ${ssePayload}\n\n`); } catch {}
    }

    // Optional background write to Cloud Firestore
    if (firestoreDb && !serverFirestoreQuotaExhausted) {
      safeServerFirestoreWrite(payload.key, payload.value);
    }
  });

  // Client sent bulk updates
  socket.on('sync:bulk_push', (payload: { all: Record<string, any> }) => {
    if (!payload?.all || typeof payload.all !== 'object') return;

    dbVersion++;
    database = { ...database, ...payload.all };
    persistDatabase();

    socket.broadcast.emit('sync:all', {
      version: dbVersion,
      data: database,
      timestamp: Date.now()
    });
  });

  // Client requests full snapshot
  socket.on('sync:request_all', () => {
    socket.emit('sync:init', {
      version: dbVersion,
      timestamp: Date.now(),
      data: database
    });
  });

  // Ping for measuring real-time latency
  socket.on('ping:client', (callback: any) => {
    if (typeof callback === 'function') {
      callback({ pong: true, time: Date.now(), version: dbVersion });
    }
  });

  // Real-time peer message broadcast across all connected browsers (Render-Ready)
  socket.on('broadcast:message', (payload: { sender: string; text: string; role?: string }) => {
    if (!payload?.text) return;
    io.emit('broadcast:message', {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender: payload.sender || 'সহপাঠী / ভিজিটর',
      text: payload.text,
      role: payload.role || 'লাইভ ব্যবহারকারী',
      timestamp: Date.now()
    });
  });

  // Real-time emoji reaction broadcast across all connected browsers
  socket.on('broadcast:reaction', (payload: { emoji: string }) => {
    if (!payload?.emoji) return;
    io.emit('broadcast:reaction', {
      emoji: payload.emoji,
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    connectedSocketCount = Math.max(0, connectedSocketCount - 1);
    console.log(`[Socket.io] Client disconnected: ${socket.id} (Online Browsers: ${connectedSocketCount})`);
    io.emit('presence:update', {
      onlineUsers: connectedSocketCount,
      timestamp: Date.now()
    });
  });
});

// Render Free Hosting Health Check Routes
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'BS E-Learning Real-Time Hub',
    uptime: process.uptime(),
    activeSockets: connectedSocketCount,
    dbVersion,
    timestamp: Date.now()
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    activeSockets: connectedSocketCount,
    dbVersion,
    timestamp: Date.now()
  });
});

// Render free tier keep-alive ping loop (if RENDER_EXTERNAL_URL is configured)
if (process.env.RENDER_EXTERNAL_URL) {
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  console.log(`[Render] Auto Keep-Alive enabled for: ${renderUrl}`);
  setInterval(async () => {
    try {
      await fetch(`${renderUrl}/health`);
    } catch {
      // Ignore network ping errs
    }
  }, 13 * 60 * 1000); // Ping every 13 mins (free tier sleeps after 15 mins)
}

// SSE Real-Time Sync Endpoint
app.get('/api/live-sync', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Send immediate initial sync acknowledgment with current version
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', version: dbVersion, timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// Periodic heartbeat to prevent connection timeout through proxies
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(': keepalive\n\n');
    } catch {
      // Ignored, handled in next broadcast
    }
  }
}, 20000);

// Get current database version (for lightweight polling fallback)
app.get('/api/sync/version', (_req: Request, res: Response) => {
  res.json({ version: dbVersion, timestamp: Date.now(), activeClients: sseClients.length });
});

// Get all persisted institutional data
app.get('/api/sync/all', async (_req: Request, res: Response) => {
  if (Object.keys(database).length === 0) {
    await initServerFirestoreSync();
  }
  res.json({ success: true, version: dbVersion, data: database });
});

// Update a single key (e.g. settings, mentors, courses, chatbot)
app.post('/api/sync/update', async (req: Request, res: Response) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }

  database[key] = value;
  persistDatabase();
  broadcastUpdate('SYNC_UPDATE', key, value);

  // Attempt to sync to Cloud Firestore in background if quota allows
  if (firestoreDb && !serverFirestoreQuotaExhausted) {
    safeServerFirestoreWrite(key, value);
  }

  return res.json({ success: true, version: dbVersion });
});

// Bulk update multiple modules at once (e.g. Admin "এক ক্লিকে সব সেভ")
app.post('/api/sync/bulk', async (req: Request, res: Response) => {
  const { all } = req.body;
  if (!all || typeof all !== 'object') {
    return res.status(400).json({ error: 'Valid object required' });
  }

  database = { ...database, ...all };
  persistDatabase();
  broadcastUpdate('SYNC_ALL');

  // Push keys to Firestore in background if quota allows
  if (firestoreDb && !serverFirestoreQuotaExhausted) {
    (async () => {
      for (const [k, v] of Object.entries(all)) {
        if (!firestoreDb || serverFirestoreQuotaExhausted) break;
        await safeServerFirestoreWrite(k, v);
      }
    })();
  }

  return res.json({ success: true, version: dbVersion });
});

// AI Knowledge & Q&A Sync Endpoint
app.post('/api/ai/sync', (req: Request, res: Response) => {
  const { type, data } = req.body;
  if (type === 'qa') {
    database['ai_qa_kb'] = data;
  } else if (type === 'chunks') {
    database['ai_training_chunks'] = data;
  }
  persistDatabase();
  broadcastUpdate('AI_UPDATE', type, data);
  res.json({ success: true, version: dbVersion });
});

// ============================================================================
// DYNAMIC MULTI-AI ENGINE (Gemini, Groq, OpenRouter)
// Automatic Provider Detection, Live Testing & Safe Fallback
// ============================================================================

interface ServerAISettings {
  activeProvider: 'gemini' | 'groq' | 'openrouter' | 'local_only';
  geminiApiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  fallbackToLocal: boolean;
}

const AI_SETTINGS_FILE = path.join(DATA_DIR, 'ai_settings.json');

// Default initial AI settings (reads env vars if present, but never hardcodes keys)
let serverAISettings: ServerAISettings = {
  activeProvider: (process.env.DEFAULT_AI_PROVIDER as any) || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterModel: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
  fallbackToLocal: true
};

// Load persisted settings from disk
if (fs.existsSync(AI_SETTINGS_FILE)) {
  try {
    const raw = fs.readFileSync(AI_SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    serverAISettings = { ...serverAISettings, ...parsed };
    if (!serverAISettings.geminiModel || serverAISettings.geminiModel.includes('2.5')) {
      serverAISettings.geminiModel = 'gemini-3.8-flash';
    }
    console.log(`[AI Engine] Loaded persisted AI settings (Active Provider: ${serverAISettings.activeProvider})`);
  } catch (err) {
    console.warn('[AI Engine] Failed to load ai_settings.json:', err);
  }
}

function persistAISettings() {
  try {
    fs.writeFileSync(AI_SETTINGS_FILE, JSON.stringify(serverAISettings, null, 2), 'utf-8');
    console.log(`[AI Engine] Settings saved to disk. Active provider: ${serverAISettings.activeProvider}`);
  } catch (err) {
    console.error('[AI Engine] Failed to write ai_settings.json:', err);
  }
}

const SYSTEM_AI_INSTRUCTION = `You are the polite, intelligent, and highly knowledgeable Bengali-speaking AI assistant for "BS E-Learning & IT Zone", founded and directed by Borhanuddin Mohim. 
Institution Details:
- Founder & Head Teacher: Borhanuddin Mohim (বোরহানউদ্দিন মহিম).
- Key Courses: Quran Education with Tajweed (সহীহ কুরআন শিক্ষা), Computer Office Application 6-month Govt Approved (কম্পিউটার অফিস অ্যাপ্লিকেশন), Spoken English, SSC & HSC Accounting (হিসাববিজ্ঞান), Academic Math & English.
- Payment System: Interoperable Bangla QR (বাংলা কিউআর) via bKash, Nagad, Rocket, Upay, or any banking app.
- Answer clearly, helpfully, encouragingly, and respectfully in Bengali (বাংলা). If a question is in English, reply in helpful English or bilingual Bengali-English. Keep answers crisp and educational.`;

// Call Google Gemini
async function runGeminiChat(prompt: string, apiKey: string, model: string): Promise<string> {
  const finalKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalKey) throw new Error('Gemini API Key is not configured');
  const finalModel = model || 'gemini-3.8-flash';
  const ai = new GoogleGenAI({ apiKey: finalKey });
  const response = await ai.models.generateContent({
    model: finalModel,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_AI_INSTRUCTION
    }
  });
  if (!response.text) throw new Error('Empty response from Gemini');
  return response.text;
}

// Call Groq (Ultra-fast LPU inference)
async function runGroqChat(prompt: string, apiKey: string, model: string): Promise<string> {
  const finalKey = apiKey || process.env.GROQ_API_KEY;
  if (!finalKey) throw new Error('Groq API Key is not configured');
  const finalModel = model || 'llama-3.3-70b-versatile';

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${finalKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: finalModel,
      messages: [
        { role: 'system', content: SYSTEM_AI_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1024
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) {
    const errData: any = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Groq API returned HTTP ${res.status}`);
  }

  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

// Call OpenRouter (Universal AI Gateway)
async function runOpenRouterChat(prompt: string, apiKey: string, model: string): Promise<string> {
  const finalKey = apiKey || process.env.OPENROUTER_API_KEY;
  if (!finalKey) throw new Error('OpenRouter API Key is not configured');
  const finalModel = model || 'meta-llama/llama-3.2-3b-instruct:free';

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${finalKey}`,
      'HTTP-Referer': 'https://bs-elearning.local',
      'X-Title': 'BS E-Learning IT Zone AI Assistant',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: finalModel,
      messages: [
        { role: 'system', content: SYSTEM_AI_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1024
    }),
    signal: AbortSignal.timeout(18000)
  });

  if (!res.ok) {
    const errData: any = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `OpenRouter API returned HTTP ${res.status}`);
  }

  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenRouter');
  return text;
}

// GET /api/ai/settings - Retrieve current configuration
app.get('/api/ai/settings', (_req: Request, res: Response) => {
  res.json({
    activeProvider: serverAISettings.activeProvider,
    geminiModel: serverAISettings.geminiModel,
    groqModel: serverAISettings.groqModel,
    openrouterModel: serverAISettings.openrouterModel,
    hasGeminiKey: Boolean(serverAISettings.geminiApiKey || process.env.GEMINI_API_KEY),
    hasGroqKey: Boolean(serverAISettings.groqApiKey || process.env.GROQ_API_KEY),
    hasOpenrouterKey: Boolean(serverAISettings.openrouterApiKey || process.env.OPENROUTER_API_KEY),
    // Masked keys for display in admin inputs
    geminiApiKeyMasked: serverAISettings.geminiApiKey ? `${serverAISettings.geminiApiKey.slice(0, 4)}...${serverAISettings.geminiApiKey.slice(-4)}` : '',
    groqApiKeyMasked: serverAISettings.groqApiKey ? `${serverAISettings.groqApiKey.slice(0, 4)}...${serverAISettings.groqApiKey.slice(-4)}` : '',
    openrouterApiKeyMasked: serverAISettings.openrouterApiKey ? `${serverAISettings.openrouterApiKey.slice(0, 4)}...${serverAISettings.openrouterApiKey.slice(-4)}` : '',
    fallbackToLocal: serverAISettings.fallbackToLocal
  });
});

// POST /api/ai/settings - Admin updates AI provider & keys
app.post('/api/ai/settings', (req: Request, res: Response) => {
  const {
    activeProvider,
    geminiApiKey,
    geminiModel,
    groqApiKey,
    groqModel,
    openrouterApiKey,
    openrouterModel,
    fallbackToLocal
  } = req.body;

  if (activeProvider && ['gemini', 'groq', 'openrouter', 'local_only'].includes(activeProvider)) {
    serverAISettings.activeProvider = activeProvider;
  }
  if (geminiApiKey !== undefined) serverAISettings.geminiApiKey = (geminiApiKey || '').trim();
  if (geminiModel) serverAISettings.geminiModel = geminiModel.trim();
  if (groqApiKey !== undefined) serverAISettings.groqApiKey = (groqApiKey || '').trim();
  if (groqModel) serverAISettings.groqModel = groqModel.trim();
  if (openrouterApiKey !== undefined) serverAISettings.openrouterApiKey = (openrouterApiKey || '').trim();
  if (openrouterModel) serverAISettings.openrouterModel = openrouterModel.trim();
  if (fallbackToLocal !== undefined) serverAISettings.fallbackToLocal = Boolean(fallbackToLocal);

  persistAISettings();
  res.json({
    success: true,
    message: 'AI Provider Settings saved successfully',
    activeProvider: serverAISettings.activeProvider
  });
});

// POST /api/ai/test - Test connection to selected AI Provider
app.post('/api/ai/test', async (req: Request, res: Response) => {
  const provider = req.body.provider || serverAISettings.activeProvider;
  const testKey = req.body.apiKey;
  const testModel = req.body.model;
  const startTime = Date.now();

  try {
    let resultText = '';
    const testPrompt = 'Say "Hello, BS E-Learning AI is connected successfully!" in 1 short sentence in Bengali.';

    if (provider === 'gemini') {
      const key = testKey || serverAISettings.geminiApiKey;
      const model = testModel || serverAISettings.geminiModel;
      resultText = await runGeminiChat(testPrompt, key, model);
    } else if (provider === 'groq') {
      const key = testKey || serverAISettings.groqApiKey;
      const model = testModel || serverAISettings.groqModel;
      resultText = await runGroqChat(testPrompt, key, model);
    } else if (provider === 'openrouter') {
      const key = testKey || serverAISettings.openrouterApiKey;
      const model = testModel || serverAISettings.openrouterModel;
      resultText = await runOpenRouterChat(testPrompt, key, model);
    } else if (provider === 'local_only') {
      return res.json({
        success: true,
        provider: 'local_only',
        latencyMs: 1,
        text: 'লোকাল নলেজবেস ও শিক্ষক ভেরিফায়েড ৫ লক্ষ শব্দ ডাটাবেজ সক্রিয় রয়েছে।'
      });
    } else {
      return res.status(400).json({ success: false, error: 'Unknown provider' });
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      provider,
      latencyMs,
      text: resultText.trim()
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.warn(`[AI Test Error - ${provider}]:`, error?.message || error);
    return res.status(400).json({
      success: false,
      provider,
      latencyMs,
      error: error?.message || `${provider} connection failed`
    });
  }
});

// POST /api/ai/chat - Dynamic Multi-AI Execution with Safe Fallback
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { prompt, requestedProvider } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Automatic provider detection: prioritize requested, then configured server provider
  const provider = requestedProvider || serverAISettings.activeProvider;

  if (provider === 'local_only') {
    return res.json({
      success: false,
      fallback: true,
      provider: 'local_only',
      message: 'Local knowledge base mode is active.'
    });
  }

  // Helper to attempt execution with a given provider
  async function executeProvider(p: 'gemini' | 'groq' | 'openrouter'): Promise<{ text: string; provider: string }> {
    if (p === 'gemini') {
      const t = await runGeminiChat(prompt, serverAISettings.geminiApiKey, serverAISettings.geminiModel);
      return { text: t, provider: 'Google Gemini' };
    } else if (p === 'groq') {
      const t = await runGroqChat(prompt, serverAISettings.groqApiKey, serverAISettings.groqModel);
      return { text: t, provider: `Groq (${serverAISettings.groqModel || 'LLaMA'})` };
    } else if (p === 'openrouter') {
      const t = await runOpenRouterChat(prompt, serverAISettings.openrouterApiKey, serverAISettings.openrouterModel);
      return { text: t, provider: `OpenRouter (${serverAISettings.openrouterModel || 'AI'})` };
    }
    throw new Error(`Unsupported provider: ${p}`);
  }

  try {
    // 1. Primary execution with active provider
    const result = await executeProvider(provider as any);
    return res.json({
      success: true,
      text: result.text,
      providerUsed: result.provider,
      isAiGenerated: true
    });
  } catch (primaryError: any) {
    console.warn(`[AI Engine] Primary provider (${provider}) failed:`, primaryError?.message || primaryError);

    // 2. Fallback logic: check if alternative providers have valid keys configured
    const alternatives: Array<'gemini' | 'groq' | 'openrouter'> = [];
    if (provider !== 'gemini' && (serverAISettings.geminiApiKey || process.env.GEMINI_API_KEY)) {
      alternatives.push('gemini');
    }
    if (provider !== 'groq' && (serverAISettings.groqApiKey || process.env.GROQ_API_KEY)) {
      alternatives.push('groq');
    }
    if (provider !== 'openrouter' && (serverAISettings.openrouterApiKey || process.env.OPENROUTER_API_KEY)) {
      alternatives.push('openrouter');
    }

    for (const alt of alternatives) {
      try {
        console.log(`[AI Engine] Attempting automatic fallback to ${alt}...`);
        const fallbackRes = await executeProvider(alt);
        return res.json({
          success: true,
          text: fallbackRes.text,
          providerUsed: fallbackRes.provider,
          fallback: true,
          isAiGenerated: true
        });
      } catch (altError: any) {
        console.warn(`[AI Engine] Fallback provider (${alt}) also failed:`, altError?.message || altError);
      }
    }

    // 3. Graceful degradation: inform client to safely route to local 500k words knowledge base without crashing
    return res.json({
      success: false,
      fallback: true,
      error: primaryError?.message || 'AI service temporarily unavailable',
      message: 'Auto-falling back to local institutional database and mentor routing.'
    });
  }
});

// Autonomous Wikipedia Free Search & Summary Endpoint
app.get('/api/wiki', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    // 1. Try Bengali Wikipedia Summary REST API first
    const bnUrl = `https://bn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const bnResponse = await fetch(bnUrl, {
      headers: { 'User-Agent': 'BSELearningBot/1.0 (onlinetutionbyborhansir@gmail.com)' }
    });

    if (bnResponse.ok) {
      const bnData: any = await bnResponse.json();
      if (bnData && bnData.extract) {
        return res.json({
          success: true,
          lang: 'bn',
          title: bnData.title,
          extract: bnData.extract,
          description: bnData.description || 'উইকিপিডিয়া সাধারণ জ্ঞান',
          url: bnData.content_urls?.desktop?.page || `https://bn.wikipedia.org/wiki/${encodeURIComponent(query)}`
        });
      }
    }

    // 2. Try Bengali Wikipedia Search API to find matching title
    const searchUrl = `https://bn.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'BSELearningBot/1.0 (onlinetutionbyborhansir@gmail.com)' }
    });

    if (searchRes.ok) {
      const searchData: any = await searchRes.json();
      const matchedTitle = searchData[1]?.[0];
      const matchedSnippet = searchData[2]?.[0];
      const matchedPageUrl = searchData[3]?.[0];

      if (matchedTitle && matchedSnippet) {
        return res.json({
          success: true,
          lang: 'bn',
          title: matchedTitle,
          extract: matchedSnippet,
          description: 'উইকিপিডিয়া অনুসন্ধান ফলাফল',
          url: matchedPageUrl
        });
      }
    }

    // 3. Fallback to English Wikipedia Summary if Bengali page not found
    const enUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const enResponse = await fetch(enUrl, {
      headers: { 'User-Agent': 'BSELearningBot/1.0 (onlinetutionbyborhansir@gmail.com)' }
    });

    if (enResponse.ok) {
      const enData: any = await enResponse.json();
      if (enData && enData.extract) {
        return res.json({
          success: true,
          lang: 'en',
          title: enData.title,
          extract: enData.extract,
          description: enData.description || 'Wikipedia Knowledge',
          url: enData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'উইকিপিডিয়ায় এই বিষয়ে কোনো তথ্য পাওয়া যায়নি।'
    });
  } catch (error: any) {
    console.error('[Wiki API Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Wikipedia fetch failed'
    });
  }
});

// GitHub Auto-Push & Vercel Sync REST API Endpoints
app.get('/api/github/status', async (req: Request, res: Response) => {
  const token = (req.query.token as string) || process.env.GITHUB_TOKEN || '';
  const repo = (req.query.repo as string) || 'bmd03024-code/BS-E-LEARNING-IT-ZONE';

  try {
    const ghRes = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BS-ELearning-Admin'
      }
    });

    if (ghRes.ok) {
      const data: any = await ghRes.json();
      return res.json({
        success: true,
        connected: true,
        fullName: data.full_name,
        defaultBranch: data.default_branch,
        updatedAt: data.updated_at,
        htmlUrl: data.html_url
      });
    } else {
      const errData: any = await ghRes.json().catch(() => ({}));
      return res.json({
        success: false,
        connected: false,
        status: ghRes.status,
        error: errData.message || `GitHub HTTP Error ${ghRes.status}`
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      connected: false,
      error: error?.message || 'Network error connecting to GitHub'
    });
  }
});

app.post('/api/github/push', async (req: Request, res: Response) => {
  const token = req.body.token || process.env.GITHUB_TOKEN || '';
  const repo = req.body.repo || 'bmd03024-code/BS-E-LEARNING-IT-ZONE';
  const branch = req.body.branch || 'main';
  const filePath = req.body.path || 'data/institute_db.json';
  const commitMsg = req.body.message || `Admin Auto-Sync: Updates to institute data [${new Date().toISOString()}]`;

  try {
    let contentStr = '';
    if (req.body.content) {
      contentStr = typeof req.body.content === 'string' ? req.body.content : JSON.stringify(req.body.content, null, 2);
    } else if (fs.existsSync(DB_FILE)) {
      contentStr = fs.readFileSync(DB_FILE, 'utf-8');
    } else {
      contentStr = JSON.stringify(database, null, 2);
    }

    const contentBase64 = Buffer.from(contentStr, 'utf-8').toString('base64');

    // 1. Check if file already exists in repository to get its current SHA
    let existingSha: string | undefined;
    try {
      const getFileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BS-ELearning-Admin'
        }
      });

      if (getFileRes.ok) {
        const fileData: any = await getFileRes.json();
        existingSha = fileData.sha;
      }
    } catch (e) {
      console.warn('[GitHub Sync] Could not fetch existing file SHA:', e);
    }

    // 2. Put file to commit directly to GitHub repository
    const putPayload: any = {
      message: commitMsg,
      content: contentBase64,
      branch
    };
    if (existingSha) {
      putPayload.sha = existingSha;
    }

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'BS-ELearning-Admin'
      },
      body: JSON.stringify(putPayload)
    });

    const responseText = await putRes.text();
const putData = responseText ? JSON.parse(responseText) : {};

    if (putRes.ok) {
      console.log(`[GitHub Sync] Successfully committed and pushed ${filePath} to ${repo}@${branch}`);
      return res.json({
        success: true,
        commitSha: putData.commit?.sha,
        commitUrl: putData.commit?.html_url,
        message: 'সফলভাবে GitHub রিপোজিটরিতে ডাটা পুশ সম্পন্ন হয়েছে! Vercel স্বয়ংক্রিয়ভাবে লাইভ সাইট রি-ডিপ্লয় ও সিঙ্ক শুরু করেছে।'
      });
    } else {
      console.warn('[GitHub Sync Warning]:', putData);
      return res.status(putRes.status || 400).json({
        success: false,
        error: putData.message || 'GitHub commit failed',
        status: putRes.status,
        documentationUrl: putData.documentation_url
      });
    }
  } catch (error: any) {
    console.error('[GitHub Push Exception]:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to push to GitHub'
    });
  }
});

// Supabase Status Endpoint
app.get('/api/supabase/status', (_req: Request, res: Response) => {
  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supaKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  return res.json({
    configured: Boolean(supaUrl && supaKey),
    url: supaUrl ? `${supaUrl.substring(0, 18)}...` : null,
    hasKey: Boolean(supaKey)
  });
});

// Vite Middleware for Full-Stack App
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`[BS Server] Full-Stack Real-Time Server running at http://0.0.0.0:${port}`);
    console.log(`[BS Server] Socket.io WebSocket Engine & REST APIs active (Render Ready)`);
  });
}

startServer();
