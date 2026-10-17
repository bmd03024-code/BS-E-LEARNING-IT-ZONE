import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = express();
const port = 3000;

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

// Initialize Server-side Firebase Firestore instance
const firebaseApp = initializeApp(firebaseConfig, 'serverApp');
const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Server Firestore Quota tracking
let serverFirestoreQuotaExhausted = false;

// Hydrate server database from Firestore on startup only if disk is empty
async function initServerFirestoreSync() {
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
  const payload = JSON.stringify({
    type,
    key,
    value,
    version: dbVersion,
    timestamp: Date.now()
  });

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
  if (!serverFirestoreQuotaExhausted) {
    try {
      const docRef = doc(firestoreDb, 'institute_data', key);
      await setDoc(docRef, { key, data: value, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e: any) {
      if (e?.code === 'resource-exhausted' || String(e).includes('quota') || String(e).includes('Quota')) {
        serverFirestoreQuotaExhausted = true;
        console.warn('[Server] Firestore quota limit reached on write. Routing all future syncs through high-speed disk & SSE.');
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
  if (!serverFirestoreQuotaExhausted) {
    (async () => {
      for (const [k, v] of Object.entries(all)) {
        if (serverFirestoreQuotaExhausted) break;
        try {
          const docRef = doc(firestoreDb, 'institute_data', k);
          await setDoc(docRef, { key: k, data: v, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (e: any) {
          if (e?.code === 'resource-exhausted' || String(e).includes('quota') || String(e).includes('Quota')) {
            serverFirestoreQuotaExhausted = true;
            console.warn('[Server] Firestore quota limit reached during bulk write.');
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

  app.listen(port, '0.0.0.0', () => {
    console.log(`[BS Server] Full-Stack Server running at http://0.0.0.0:${port}`);
    console.log(`[BS Server] Real-Time Live Sync & Autonomous Wiki API ready`);
  });
}

startServer();
