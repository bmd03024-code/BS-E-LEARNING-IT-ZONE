import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
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
// Dynamic port support for Render / Railway / Heroku / Cloud Run / AI Studio (defaults to 3000)
const port = Number(process.env.PORT) || 3000;
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
    if (Date.now() - qData.timestamp < 12 * 60 * 60 * 1000) {
      serverFirestoreQuotaExhausted = true;
      console.log('[Server] Daily Firestore free write quota exhausted. Seamlessly routing all writes through persistent disk and Socket.io.');
    }
  } catch {}
}

function flagServerQuotaExhausted() {
  if (!serverFirestoreQuotaExhausted) {
    serverFirestoreQuotaExhausted = true;
    try {
      fs.writeFileSync(QUOTA_FILE, JSON.stringify({ exhausted: true, timestamp: Date.now() }), 'utf-8');
    } catch {}
    console.warn('[Server] Firestore quota limit reached on write. Routing all future syncs through high-speed disk & Socket.io.');
  }
}

// Hydrate server database from Firestore on startup only if disk is empty
async function initServerFirestoreSync() {
  if (!firestoreDb) return;
  if (Object.keys(database).length > 0) {
    console.log(`[Server] Persistent disk database loaded with ${Object.keys(database).length} modules (Master Source of Truth). Skipping Firestore overwrite.`);
    return;
  }

  try {
    const colRef = collection(firestoreDb, 'institute_data');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      snap.forEach(d => {
        const docData = d.data();
        if (docData && docData.data !== undefined) {
          database[d.id] = docData.data;
        }
      });
      persistDatabase();
      console.log(`[Server] Hydrated ${snap.size} modules directly from Cloud Firestore!`);
    }
  } catch (err) {
    console.warn('[Server] Firestore hydration catch (using disk cache):', err);
  }
}
initServerFirestoreSync();

// Save database to disk asynchronously
function persistDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Error saving to disk:', err);
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
      try {
        const docRef = doc(firestoreDb, 'institute_data', payload.key);
        setDoc(docRef, { key: payload.key, data: payload.value, updatedAt: new Date().toISOString() }, { merge: true }).catch((err: any) => {
          if (err?.code === 'resource-exhausted' || String(err).includes('quota') || String(err).includes('Quota')) {
            flagServerQuotaExhausted();
          }
        });
      } catch {}
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
    try {
      const docRef = doc(firestoreDb, 'institute_data', key);
      await setDoc(docRef, { key, data: value, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e: any) {
      if (e?.code === 'resource-exhausted' || String(e).includes('quota') || String(e).includes('Quota')) {
        flagServerQuotaExhausted();
      } else {
        console.warn(`[Server] Firestore write notice for ${key}:`, e?.message || e);
      }
    }
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
        try {
          const docRef = doc(firestoreDb, 'institute_data', k);
          await setDoc(docRef, { key: k, data: v, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (e: any) {
          if (e?.code === 'resource-exhausted' || String(e).includes('quota') || String(e).includes('Quota')) {
            flagServerQuotaExhausted();
            break;
          }
        }
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
