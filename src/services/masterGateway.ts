/**
 * ============================================================================
 * BS E-Learning & IT Zone - Master Gateway Real-Time Synchronization Engine
 * ============================================================================
 * 
 * Architecture:
 * 1. Single Source of Truth: GitHub Repository (`data/institute_db.json`)
 * 2. Vercel Auto-Deployment on Every Admin Commit
 * 3. Client Broadcast Layer (Web BroadcastChannel API) for Zero-Latency Multi-Tab Sync
 * 4. Resilient Local Cache (LocalStorage + Fast Memory Cache)
 * 5. Optional Socket.io & SSE Push Streams (when running with backend)
 */

import { io, Socket } from 'socket.io-client';
import { githubDataService } from './githubDataService';

export interface GatewayStatus {
  isOnline: boolean;
  githubConnected: boolean;
  socketConnected: boolean;
  sseConnected: boolean;
  broadcastChannelReady: boolean;
  lastSyncTime: number | null;
  lastCommitSha: string | null;
  totalPushes: number;
  totalReceives: number;
  activeChannel: 'github' | 'socket.io' | 'server' | 'local';
  pingMs: number;
  activeSocketsCount: number;
}

export interface LiveBroadcastMessage {
  id: string;
  sender: string;
  text: string;
  role: string;
  timestamp: number;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  timestamp: number;
}

export type GatewaySyncCallback = (key: string, value: any, source: 'github' | 'sse' | 'broadcast' | 'local' | 'socket') => void;

class MasterGatewayEngine {
  private static instance: MasterGatewayEngine;
  private socket: Socket | null = null;
  private channel: BroadcastChannel | null = null;
  private sse: EventSource | null = null;
  private listeners: Set<GatewaySyncCallback> = new Set();
  private statusListeners: Set<(status: GatewayStatus) => void> = new Set();
  private messageListeners: Set<(msg: LiveBroadcastMessage) => void> = new Set();
  private reactionListeners: Set<(rx: LiveReaction) => void> = new Set();

  private status: GatewayStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    githubConnected: false,
    socketConnected: false,
    sseConnected: false,
    broadcastChannelReady: false,
    lastSyncTime: Date.now(),
    lastCommitSha: null,
    totalPushes: 0,
    totalReceives: 0,
    activeChannel: 'github',
    pingMs: 12,
    activeSocketsCount: 1
  };

  private constructor() {
    this.setupNetworkMonitor();
    this.setupBroadcastChannel();
    this.setupSocketIO();
    this.setupSSE();
    this.checkGitHubStatus();
  }

  public static getInstance(): MasterGatewayEngine {
    if (!MasterGatewayEngine.instance) {
      MasterGatewayEngine.instance = new MasterGatewayEngine();
    }
    return MasterGatewayEngine.instance;
  }

  private setupNetworkMonitor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.notifyStatus();
      this.checkGitHubStatus();
      this.setupSSE();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.status.socketConnected = false;
      this.status.sseConnected = false;
      this.notifyStatus();
    });

    // Listen to universal bs_sync events
    window.addEventListener('bs_sync', (e: any) => {
      this.status.totalReceives++;
      this.status.lastSyncTime = Date.now();
      const sha = localStorage.getItem('bs_github_last_sha');
      if (sha) this.status.lastCommitSha = sha;
      this.notifyStatus();

      const detail = e.detail || {};
      this.dispatchChange(detail.key || 'all', detail.value, detail.fromGitHub ? 'github' : 'local');
    });
  }

  /**
   * Check connection to GitHub repository
   */
  public async checkGitHubStatus(): Promise<boolean> {
    try {
      const cfg = githubDataService.getConfig();
      if (!cfg.repo) {
        this.status.githubConnected = false;
        this.notifyStatus();
        return false;
      }

      const res = await githubDataService.testConnection();
      this.status.githubConnected = res.connected;
      const sha = localStorage.getItem('bs_github_last_sha');
      if (sha) this.status.lastCommitSha = sha;
      this.notifyStatus();
      return res.connected;
    } catch {
      this.status.githubConnected = false;
      this.notifyStatus();
      return false;
    }
  }

  /**
   * BroadcastChannel for zero-latency multi-tab sync
   */
  private setupBroadcastChannel() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    try {
      this.channel = new BroadcastChannel('bs_master_gateway');
      this.status.broadcastChannelReady = true;

      this.channel.onmessage = (event) => {
        const { key, value } = event.data || {};
        if (key) {
          this.status.totalReceives++;
          this.status.lastSyncTime = Date.now();
          this.notifyStatus();

          // Sync into localStorage
          try {
            localStorage.setItem(`bs_${key}`, JSON.stringify(value));
          } catch {}

          this.dispatchChange(key, value, 'broadcast');
        }
      };
    } catch (e) {
      console.warn('[MasterGateway] BroadcastChannel unavailable:', e);
      this.status.broadcastChannelReady = false;
    }
  }

  /**
   * Setup optional Socket.io (active when running with Node/Render backend)
   */
  private setupSocketIO() {
    if (typeof window === 'undefined') return;

    try {
      this.socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        this.status.socketConnected = true;
        this.status.activeChannel = 'socket.io';
        this.notifyStatus();
      });

      this.socket.on('disconnect', () => {
        this.status.socketConnected = false;
        this.status.activeChannel = 'github';
        this.notifyStatus();
      });

      this.socket.on('sync:update', (payload: { key: string; value: any }) => {
        if (!payload?.key) return;
        this.status.totalReceives++;
        this.status.lastSyncTime = Date.now();
        this.notifyStatus();

        try {
          localStorage.setItem(`bs_${payload.key}`, JSON.stringify(payload.value));
        } catch {}

        this.dispatchChange(payload.key, payload.value, 'socket');
      });

      this.socket.on('sync:all', (payload: { data: Record<string, any> }) => {
        if (!payload?.data) return;
        this.status.totalReceives++;
        this.status.lastSyncTime = Date.now();
        this.notifyStatus();

        for (const [k, v] of Object.entries(payload.data)) {
          try {
            localStorage.setItem(`bs_${k}`, JSON.stringify(v));
          } catch {}
        }
        this.dispatchChange('all', payload.data, 'socket');
      });

      this.socket.on('presence:update', (payload: { onlineUsers?: number }) => {
        if (payload?.onlineUsers !== undefined) {
          this.status.activeSocketsCount = Math.max(1, payload.onlineUsers);
          this.notifyStatus();
        }
      });

      this.socket.on('broadcast:message', (msg: LiveBroadcastMessage) => {
        this.messageListeners.forEach((fn) => {
          try { fn(msg); } catch {}
        });
      });

      this.socket.on('broadcast:reaction', (rx: LiveReaction) => {
        this.reactionListeners.forEach((fn) => {
          try { fn(rx); } catch {}
        });
      });
    } catch {
      // Safe fallback in static Vercel environment where Socket.io is not running
      this.status.socketConnected = false;
    }
  }

  /**
   * Setup optional Server-Sent Events (SSE)
   */
  private setupSSE() {
    if (typeof window === 'undefined') return;

    try {
      this.sse = new EventSource('/api/live-sync');

      this.sse.onopen = () => {
        this.status.sseConnected = true;
        this.notifyStatus();
      };

      this.sse.onerror = () => {
        this.status.sseConnected = false;
        this.notifyStatus();
      };

      this.sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'SYNC_UPDATE' && payload.key) {
            this.status.totalReceives++;
            this.status.lastSyncTime = Date.now();
            this.notifyStatus();

            try {
              localStorage.setItem(`bs_${payload.key}`, JSON.stringify(payload.value));
            } catch {}

            this.dispatchChange(payload.key, payload.value, 'sse');
          }
        } catch {}
      };
    } catch {
      this.status.sseConnected = false;
    }
  }

  /**
   * Publish change globally from Admin Panel
   */
  public async publish(key: string, value: any): Promise<void> {
    this.status.totalPushes++;
    this.status.lastSyncTime = Date.now();
    this.notifyStatus();

    // 1. Update local storage timestamp
    try {
      localStorage.setItem(`bs_${key}`, JSON.stringify(value));
      localStorage.setItem(`bs_${key}_time`, Date.now().toString());
    } catch {}

    // 2. BroadcastChannel notification (0ms cross-tab)
    if (this.channel) {
      try {
        this.channel.postMessage({ key, value, timestamp: Date.now() });
      } catch {}
    }

    // 3. Dispatch custom event locally
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key, value, fromGateway: true } }));
    }

    // 4. Socket.io emit if connected
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit('sync:push', { key, value, timestamp: Date.now() });
      } catch {}
    }

    // 5. REST endpoint if available
    try {
      await fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch {}
  }

  /**
   * Bulk publish all data to server and trigger GitHub push
   */
  public async publishAll(fullState: Record<string, any>): Promise<boolean> {
    this.status.totalPushes++;
    this.status.lastSyncTime = Date.now();
    this.notifyStatus();

    try {
      // 1. Save all keys in localStorage
      for (const [k, v] of Object.entries(fullState)) {
        try {
          localStorage.setItem(`bs_${k}`, JSON.stringify(v));
          localStorage.setItem(`bs_${k}_time`, Date.now().toString());
        } catch {}
      }

      // 2. Broadcast to tabs
      if (this.channel) {
        this.channel.postMessage({ key: 'all', timestamp: Date.now() });
      }

      // 3. Dispatch local event
      window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: 'all' } }));

      // 4. Push to server if running
      try {
        await fetch('/api/sync/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ all: fullState })
        });
      } catch {}

      // 5. Commit & Push to GitHub Single Source of Truth
      const ghPush = await githubDataService.commitAndPush(fullState, `Admin Full Sync: ${new Date().toISOString()}`);
      if (ghPush.success) {
        this.status.githubConnected = true;
        if (ghPush.commitSha) this.status.lastCommitSha = ghPush.commitSha;
        this.notifyStatus();
        return true;
      }

      return true;
    } catch (e) {
      console.warn('[MasterGateway] publishAll error:', e);
      return false;
    }
  }

  public async forceSyncAll(fullState: Record<string, any>): Promise<boolean> {
    return this.publishAll(fullState);
  }

  public subscribe(callback: GatewaySyncCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public onStatusChange(callback: (status: GatewayStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  public getStatus(): GatewayStatus {
    return { ...this.status };
  }

  private dispatchChange(key: string, value: any, source: 'github' | 'sse' | 'broadcast' | 'local' | 'socket') {
    this.listeners.forEach((fn) => {
      try {
        fn(key, value, source);
      } catch (err) {
        console.warn('[MasterGateway] Listener dispatch error:', err);
      }
    });
  }

  private notifyStatus() {
    const copy = this.getStatus();
    this.statusListeners.forEach((fn) => {
      try { fn(copy); } catch {}
    });
  }

  public sendBroadcastMessage(text: string, sender: string = 'সহপাঠী / ভিজিটর', role: string = 'লাইভ শিক্ষার্থী'): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('broadcast:message', { text, sender, role });
    }
  }

  public sendReaction(emoji: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('broadcast:reaction', { emoji });
    }
  }

  public onBroadcastMessage(callback: (msg: LiveBroadcastMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  public onReaction(callback: (rx: LiveReaction) => void): () => void {
    this.reactionListeners.add(callback);
    return () => this.reactionListeners.delete(callback);
  }

  public async ping(): Promise<number> {
    if (!this.socket || !this.socket.connected) return 0;
    const start = Date.now();
    return new Promise((resolve) => {
      this.socket?.emit('ping:client', () => {
        const ms = Math.max(1, Date.now() - start);
        this.status.pingMs = ms;
        this.notifyStatus();
        resolve(ms);
      });
      setTimeout(() => resolve(this.status.pingMs), 2000);
    });
  }
}

export const masterGateway = MasterGatewayEngine.getInstance();

if (typeof window !== 'undefined') {
  (window as any).BS_MasterGateway = masterGateway;
}
