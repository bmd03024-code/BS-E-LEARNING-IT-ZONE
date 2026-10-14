import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const STORAGE_DIR = path.join(__dirname, '..', 'server-storage');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const stateFile = path.join(STORAGE_DIR, 'state.json');

function readState() {
  try {
    const raw = fs.readFileSync(stateFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeState(newState: any) {
  fs.writeFileSync(stateFile, JSON.stringify(newState, null, 2));
}

// Simple http server for upload and state
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/state') {
    const state = readState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/state') {
    let body = '';
    req.on('data', (c) => body += c);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const state = readState();
        // merge by key
        if (payload.key) {
          state[payload.key] = payload.value;
        } else if (typeof payload === 'object') {
          Object.assign(state, payload);
        }
        writeState(state);
        // broadcast to websockets
        wss.clients.forEach((c) => {
          if (c.readyState === 1) {
            c.send(JSON.stringify({ type: 'state_update', payload }));
          }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end('invalid json');
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/upload') {
    // Expect JSON: { filename, contentBase64 }
    let body = '';
    req.on('data', (c) => body += c);
    req.on('end', () => {
      try {
        const { filename, contentBase64 } = JSON.parse(body);
        const buf = Buffer.from(contentBase64.split(',').pop() || contentBase64, 'base64');
        const savePath = path.join(STORAGE_DIR, 'files');
        if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });
        const outPath = path.join(savePath, `${Date.now()}-${filename}`);
        fs.writeFileSync(outPath, buf);
        const publicUrl = `/files/${path.basename(outPath)}`;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ url: publicUrl }));
      } catch (e) {
        res.writeHead(500);
        res.end('upload error');
      }
    });
    return;
  }

  // serve files
  if (req.method === 'GET' && req.url && req.url.startsWith('/files/')) {
    const filePath = path.join(STORAGE_DIR, 'files', path.basename(req.url));
    if (fs.existsSync(filePath)) {
      const stream = fs.createReadStream(filePath);
      res.writeHead(200);
      stream.pipe(res);
      return;
    }
    res.writeHead(404);
    res.end('not found');
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'welcome', now: Date.now() }));
  ws.on('message', (m) => {
    try {
      const msg = JSON.parse(m.toString());
      if (msg.type === 'broadcast') {
        wss.clients.forEach((c) => { if (c.readyState === 1) c.send(JSON.stringify(msg)); });
      }
    } catch {}
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
