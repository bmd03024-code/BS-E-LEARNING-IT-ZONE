import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Activity,
  Globe,
  Radio,
  Zap,
  CheckCircle2,
  Copy,
  Send,
  Users,
  Server,
  Cloud,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
  Terminal,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { masterGateway, GatewayStatus, LiveBroadcastMessage } from '../../services/masterGateway';

interface RealtimeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealtimeSyncModal: React.FC<RealtimeSyncModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'playground' | 'render' | 'code'>('playground');
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>(() => masterGateway.getStatus());
  const [isPinging, setIsPinging] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Playground state
  const [messages, setMessages] = useState<LiveBroadcastMessage[]>([
    {
      id: 'init-1',
      sender: 'সিস্টেম অটো-বট',
      text: 'স্বাগতম! Socket.io রিয়েল-টাইম ইঞ্জিন সক্রিয় রয়েছে। অন্য যেকোনো ব্রাউজার ট্যাব বা ডিভাইসে এই সাইটটি ওপেন করে তাৎক্ষণিক লাইভ টেস্ট করুন।',
      role: 'সার্ভার হাব',
      timestamp: Date.now() - 30000
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [senderName, setSenderName] = useState('লাইভ শিক্ষার্থী');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubStatus = masterGateway.onStatusChange(setGatewayStatus);

    const unsubMsg = masterGateway.onBroadcastMessage((msg) => {
      setMessages((prev) => [...prev.slice(-30), msg]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    const unsubRx = masterGateway.onReaction((rx) => {
      // Trigger tiny confetti on emoji reaction
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}
    });

    return () => {
      unsubStatus();
      unsubMsg();
      unsubRx();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    masterGateway.sendBroadcastMessage(inputText.trim(), senderName.trim() || 'ভিজিটর', 'লাইভ ইউজার');
    setInputText('');
  };

  const handleSendReaction = (emoji: string) => {
    masterGateway.sendReaction(emoji);
    try {
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.85 }
      });
    } catch {}
  };

  const handleRunPingTest = async () => {
    setIsPinging(true);
    await masterGateway.ping();
    setTimeout(() => setIsPinging(false), 400);
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const standaloneServerCode = `// ==========================================
// Standalone Free Real-Time Socket.io Server (Render Ready)
// ==========================================
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 10000;
const server = http.createServer(app);

// Socket.io with High Payload Support & CORS
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 15000,
  pingTimeout: 10000,
  maxHttpBufferSize: 6e7 // 60MB payload
});

let onlineUsers = 0;
let inMemoryStore = {};

io.on('connection', (socket) => {
  onlineUsers++;
  io.emit('presence:update', { onlineUsers });
  socket.emit('sync:init', { data: inMemoryStore });

  // Unlimited real-time key-value mutations
  socket.on('sync:push', (payload) => {
    if (!payload?.key) return;
    inMemoryStore[payload.key] = payload.value;
    // Broadcast zero-latency update to all other browsers
    socket.broadcast.emit('sync:update', payload);
  });

  // Real-time peer message broadcast
  socket.on('broadcast:message', (msg) => {
    io.emit('broadcast:message', { ...msg, timestamp: Date.now() });
  });

  // Real-time reactions
  socket.on('broadcast:reaction', (rx) => {
    io.emit('broadcast:reaction', rx);
  });

  // Client Ping Latency test
  socket.on('ping:client', (callback) => {
    if (typeof callback === 'function') callback();
  });

  socket.on('disconnect', () => {
    onlineUsers = Math.max(0, onlineUsers - 1);
    io.emit('presence:update', { onlineUsers });
  });
});

// Render Free Tier Health Check (Prevents deploy failure)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', onlineUsers, uptime: process.uptime() });
});

// Auto-KeepAlive to prevent Render free-tier sleep
if (process.env.RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(\`\${process.env.RENDER_EXTERNAL_URL}/health\`).catch(() => {});
  }, 13 * 60 * 1000);
}

server.listen(port, '0.0.0.0', () => {
  console.log(\`Real-Time Server running on port \${port}\`);
});`;

  const standaloneClientCode = `// ==========================================
// Standalone Client Code (React or Vanilla JS)
// ==========================================
import { io } from 'socket.io-client';

// Connect to your Render backend URL (e.g. 'https://my-app.onrender.com' or window.location.origin)
const socket = io(window.location.origin, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000
});

// 1. Listen for connection
socket.on('connect', () => {
  console.log('Socket.io connected:', socket.id);
});

// 2. Listen for live peer updates from other browsers
socket.on('sync:update', ({ key, value }) => {
  console.log('Live Data Received:', key, value);
  localStorage.setItem(key, JSON.stringify(value));
});

// 3. Listen for online presence count
socket.on('presence:update', ({ onlineUsers }) => {
  console.log('Online Browsers:', onlineUsers);
});

// 4. Send update to all other browsers in <10ms
export function broadcastData(key, value) {
  socket.emit('sync:push', { key, value });
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl shadow-2xl p-5 sm:p-7 text-white relative animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radio className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">রিয়েল-টাইম লাইভ হাব</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Socket.io Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                আজীবন আনলিমিটেড লাইভ সিঙ্ক • Render-এ ১০০% ফ্রিতে হোস্ট উপযোগী
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">অনলাইনে:</span>
              <span className="font-mono font-bold text-emerald-400">{gatewayStatus.activeSocketsCount || 1} জন</span>
            </div>
            <button
              onClick={handleRunPingTest}
              disabled={isPinging}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-bold text-indigo-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-400 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{gatewayStatus.pingMs}ms পিং</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl mb-6 border border-slate-800">
          <button
            onClick={() => setActiveTab('playground')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'playground'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>লাইভ ব্রাউজার প্লেগ্রাউন্ড</span>
          </button>
          <button
            onClick={() => setActiveTab('render')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'render'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-400" />
            <span>Render ফ্রি হোস্টিং গাইড</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>ফুল-স্ট্যাক সোর্স কোড</span>
          </button>
        </div>

        {/* Tab 1: Live Playground */}
        {activeTab === 'playground' && (
          <div className="space-y-4">
            {/* Instruction banner */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-200">লাইভ মাল্টি-ব্রাউজার টেস্ট:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  এই ওয়েবসাইটটি আরও একটি ব্রাউজার ট্যাব বা আপনার স্মার্টফোনে ওপেন করুন। এখানে একটি বার্তা পাঠালে বা ইমোজি রিঅ্যাকশনে চাপ দিলে তাৎক্ষণিকভাবে অপর ব্রাউজারে মিলি-সেকেন্ডের মধ্যে লাইভ পরিবর্তন দেখতে পাবেন!
                </p>
              </div>
            </div>

            {/* Live Reaction Ticker */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium">লাইভ ইমোজি ব্রডকাস্ট:</span>
              <div className="flex items-center gap-2">
                {['❤️', '👏', '🎓', '🔥', '⚡', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-700/70 hover:bg-blue-600 hover:scale-125 active:scale-95 text-base sm:text-lg transition-all"
                    title={`Send ${emoji} to all browsers`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Message Feed */}
            <div className="h-64 overflow-y-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 font-sans text-xs">
              {messages.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {m.sender} <span className="text-slate-400 font-normal">({m.role})</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm pl-3">{m.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Send Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="আপনার নাম (ঐচ্ছিক)"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-32 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="সকল ব্রাউজারে লাইভ বার্তা ব্রডকাস্ট করুন..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="grow px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>পাঠান</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Render Free Hosting Guide */}
        {activeTab === 'render' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400">হোস্টিং প্ল্যাটফর্ম</span>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-sky-400" />
                  <span>Render.com (Free)</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">০ টাকা মাসিক খরচ (Lifetime Free)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400">WebSocket সামঞ্জস্য</span>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Socket.io Native</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">পূর্ণ WSS প্রোটোকল সাপোর্ট</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400">স্লিপ প্রতিরোধক (Keep-Alive)</span>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>অটো পিং সক্রিয়</span>
                </div>
                <p className="text-[11px] text-amber-300 mt-1">১৩ মিনিটে স্বয়ংক্রিয় স্বাস্থ্য পরীক্ষা</p>
              </div>
            </div>

            {/* Step-by-Step Render Deployment Table */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>Render-এ ৩ ধাপে ডেপ্লয়মেন্ট কনফিগারেশন:</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">১. Build Command</span>
                    <code className="text-amber-300 font-mono font-bold">npm install && npm run build</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npm install && npm run build', 'build_cmd')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedSection === 'build_cmd' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>কপি</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">২. Start Command</span>
                    <code className="text-amber-300 font-mono font-bold">npm run start</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard('npm run start', 'start_cmd')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedSection === 'start_cmd' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>কপি</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">৩. Health Check Path (Advanced Settings)</span>
                    <code className="text-emerald-400 font-mono font-bold">/health</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard('/health', 'health_path')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedSection === 'health_path' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>কপি</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400">
              💡 প্রজেক্টের রুটে <code className="text-amber-300 font-mono">render.yaml</code> প্রস্তুত রাখা হয়েছে। আপনার গিটহাব রিপোজিটরিটি Render-এ কানেক্ট করলেই এই সার্ভিসটি স্বয়ংক্রিয়ভাবে একটিভ হয়ে যাবে।
            </div>
          </div>
        )}

        {/* Tab 3: Full-Stack Code Snippets */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">
                সম্পূর্ণ স্ট্যান্ডঅ্যালোন ব্যাকএন্ড ফাইল (server.js / Node.js + Socket.io):
              </span>
              <button
                onClick={() => copyToClipboard(standaloneServerCode, 'server_code')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {copiedSection === 'server_code' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'server_code' ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-60 overflow-y-auto leading-relaxed">
              {standaloneServerCode}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-bold">
                ক্লায়েন্ট সাইড কোড (React / HTML Client):
              </span>
              <button
                onClick={() => copyToClipboard(standaloneClientCode, 'client_code')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedSection === 'client_code' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'client_code' ? 'কপি হয়েছে!' : 'ক্লায়েন্ট কোড কপি করুন'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300 max-h-40 overflow-y-auto leading-relaxed">
              {standaloneClientCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
