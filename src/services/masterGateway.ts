/**
 * ============================================================================
 * BS E-Learning & IT Zone - Master Gateway Real-Time Synchronization Engine
 * ============================================================================
 * 
 * Architecture:
 * 1. Cloud Layer (Firebase Firestore Real-Time onSnapshot):
 *    Instant global sync across any device anywhere in the world.
 * 2. Push Stream Layer (Server-Sent Events / SSE):
 *    Direct server socket stream (/api/live-sync) with low latency.
 * 3. Client Broadcast Layer (Web BroadcastChannel API):
 *    Zero-latency instant multi-tab sync within the same browser instance.
 * 4. Resilient Local Cache (LocalStorage + In-Memory Fast Cache):
 *    Ensures 100% availability even on network drops or offline transitions.
 */

import { db, handleFirestoreError, OperationType, isFirestoreQuotaExhausted, safeFirestoreSet } from '../firebase/config';
import { collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { io, Socket } from 'socket.io-client';
import { supabaseService } from './supabaseClient';

export interface GatewayStatus {
  isOnline: boolean;
  socketConnected: boolean;
  firestoreConnected: boolean;
  supabaseConnected: boolean;
  sseConnected: boolean;
  broadcastChannelReady: boolean;
  lastSyncTime: number | null;
  totalPushes: number;
  totalReceives: number;
  activeChannel: 'socket.io' | 'cloud' | 'server' | 'hybrid' | 'local';
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

export type GatewaySyncCallback = (key: string, value: any, source: 'firestore' | 'sse' | 'broadcast' | 'local' | 'supabase') => void;

class MasterGatewayEngine {
  private static instance: MasterGatewayEngine;
  private socket: Socket | null = null;
  private channel: BroadcastChannel | null = null;
  private sse: EventSource | null = null;
  private firestoreUnsubscribe: Unsubscribe | null = null;
  private supabaseUnsubscribe: (() => void) | null = null;
  private listeners: Set<GatewaySyncCallback> = new Set();
  private statusListeners: Set<(status: GatewayStatus) => void> = new Set();
  private messageListeners: Set<(msg: LiveBroadcastMessage) => void> = new Set();
  private reactionListeners: Set<(rx: LiveReaction) => void> = new Set();

  private status: GatewayStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    socketConnected: false,
    firestoreConnected: false,
    supabaseConnected: false,
    sseConnected: false,
    broadcastChannelReady: false,
    lastSyncTime: Date.now(),
    totalPushes: 0,
    totalReceives: 0,
    activeChannel: 'socket.io',
    pingMs: 12,
    activeSocketsCount: 1
  };

  private constructor() {
    this.setupNetworkMonitor();
    this.setupSocketIO();
    this.setupBroadcastChannel();
    this.setupSSE();
    this.setupFirestoreListener();
    this.setupSupabaseRealtime();
  }

  public static getInstance(): MasterGatewayEngine {
    if (!MasterGatewayEngine.instance) {
      MasterGatewayEngine.instance = new MasterGatewayEngine();
    }
    return MasterGatewayEngine.instance;
  }

  /**
   * Monitor online/offline events
   */
  private setupNetworkMonitor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.notifyStatus();
      this.setupSSE();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.status.socketConnected = false;
      this.status.sseConnected = false;
      this.status.firestoreConnected = false;
      this.notifyStatus();
    });
  }

  /**
   * Socket.io WebSockets for unlimited lifetime bi-directional real-time sync (Render Ready)
   */
  private setupSocketIO() {
    if (typeof window === 'undefined') return;

    try {
      this.socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        this.status.socketConnected = true;
        this.status.activeChannel = 'socket.io';
        this.measureSocketPing();
        this.notifyStatus();
      });

      this.socket.on('disconnect', () => {
        this.status.socketConnected = false;
        this.status.activeChannel = this.status.sseConnected ? 'hybrid' : 'local';
        this.notifyStatus();
      });

      // Presence awareness: number of live connected devices worldwide
      this.socket.on('presence:update', (data: { onlineUsers: number }) => {
        if (data && typeof data.onlineUsers === 'number') {
          this.status.activeSocketsCount = data.onlineUsers;
          this.notifyStatus();
        }
      });

      // Real-time delta updates from other browsers or server
      this.socket.on('sync:update', (payload: { key: string; value: any; version?: number }) => {
        if (payload?.key) {
          try {
            localStorage.setItem(`bs_${payload.key}`, JSON.stringify(payload.value));
          } catch {}
          this.status.totalReceives++;
          this.status.lastSyncTime = Date.now();
          this.notifyStatus();
          this.dispatchChange(payload.key, payload.value, 'sse');
          window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key: payload.key, value: payload.value, fromSocket: true } }));
        }
      });

      // Full bulk synchronization from other browsers or server
      this.socket.on('sync:all', (payload: { data: Record<string, any>; version?: number }) => {
        if (payload?.data && typeof payload.data === 'object') {
          for (const [k, v] of Object.entries(payload.data)) {
            try {
              localStorage.setItem(`bs_${k}`, JSON.stringify(v));
            } catch {}
          }
          this.status.totalReceives++;
          this.status.lastSyncTime = Date.now();
          this.notifyStatus();
          window.dispatchEvent(new CustomEvent('bs_sync', { detail: { fromSocketAll: true } }));
        }
      });

      // Initial state sync upon connection (reconciliation)
      this.socket.on('sync:init', (payload: { data: Record<string, any>; version?: number }) => {
        if (payload?.data && typeof payload.data === 'object') {
          let updated = false;
          for (const [k, v] of Object.entries(payload.data)) {
            const localTime = parseInt(localStorage.getItem(`bs_${k}_time`) || '0', 10);
            if (Date.now() - localTime > 15000) {
              try {
                localStorage.setItem(`bs_${k}`, JSON.stringify(v));
                updated = true;
              } catch {}
            }
          }
          if (updated) {
            window.dispatchEvent(new CustomEvent('bs_sync', { detail: { fromSocketInit: true } }));
          }
        }
      });
      // Real-time live peer messages across all connected browsers
      this.socket.on('broadcast:message', (msg: LiveBroadcastMessage) => {
        if (msg) {
          this.messageListeners.forEach((fn) => {
            try { fn(msg); } catch {}
          });
        }
      });

      // Real-time floating reactions across all connected browsers
      this.socket.on('broadcast:reaction', (rx: LiveReaction) => {
        if (rx) {
          this.reactionListeners.forEach((fn) => {
            try { fn(rx); } catch {}
          });
        }
      });
    } catch (e) {
      console.warn('[MasterGateway] Socket.io client setup error:', e);
    }
  }

  private measureSocketPing() {
    if (!this.socket || !this.socket.connected) return;
    const start = Date.now();
    this.socket.emit('ping:client', () => {
      this.status.pingMs = Math.max(1, Date.now() - start);
      this.notifyStatus();
    });
  }

  /**
   * BroadcastChannel for zero-latency multi-tab sync
   */
  private setupBroadcastChannel() {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;

    try {
      this.channel = new BroadcastChannel('bs_master_gateway');
      this.channel.onmessage = (event) => {
        const { key, value } = event.data || {};
        if (key) {
          try {
            localStorage.setItem(`bs_${key}`, JSON.stringify(value));
          } catch {}
          this.status.totalReceives++;
          this.status.lastSyncTime = Date.now();
          this.notifyStatus();
          this.dispatchChange(key, value, 'broadcast');
        }
      };
      this.status.broadcastChannelReady = true;
      this.notifyStatus();
    } catch (e) {
      console.warn('[MasterGateway] BroadcastChannel not supported:', e);
    }
  }

  /**
   * Server-Sent Events (SSE) for server-authoritative live pushes
   */
  private setupSSE() {
    if (typeof window === 'undefined') return;
    if (this.sse) {
      try { this.sse.close(); } catch {}
    }

    try {
      this.sse = new EventSource('/api/live-sync');

      this.sse.onopen = () => {
        this.status.sseConnected = true;
        this.status.activeChannel = 'hybrid';
        this.notifyStatus();
      };

      this.sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'SYNC_UPDATE' && payload.key) {
            try {
              localStorage.setItem(`bs_${payload.key}`, JSON.stringify(payload.value));
            } catch {}
            this.status.totalReceives++;
            this.status.lastSyncTime = Date.now();
            this.notifyStatus();
            this.dispatchChange(payload.key, payload.value, 'sse');
          } else if (payload.type === 'CONNECTED') {
            this.status.sseConnected = true;
            this.notifyStatus();
          }
        } catch (e) {
          // Non-JSON ping
        }
      };

      this.sse.onerror = () => {
        this.status.sseConnected = false;
        this.notifyStatus();
      };
    } catch (e) {
      console.warn('[MasterGateway] SSE setup notice:', e);
    }
  }

  /**
   * Firebase Firestore real-time onSnapshot listener
   */
  /**
   * Firebase Firestore real-time onSnapshot listener
   */
  private setupFirestoreListener() {
    if (typeof window === 'undefined') return;
    if (isFirestoreQuotaExhausted()) {
      this.status.firestoreConnected = false;
      this.notifyStatus();
      return;
    }

    try {
      const colRef = collection(db, 'institute_data');
      this.firestoreUnsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          this.status.firestoreConnected = true;
          this.status.lastSyncTime = Date.now();
          this.notifyStatus();

          let changed = false;

          // Process and reassemble chunks if any
          const chunkMap: Record<string, { index: number; data: any[] }[]> = {};
          const aggregatedDocs: Record<string, { data: any; updatedAt: any }> = {};

          snapshot.docs.forEach((docSnap) => {
            const d = docSnap.data();
            if (!d) return;
            if (d.isChunk && d.parentKey) {
              if (!chunkMap[d.parentKey]) chunkMap[d.parentKey] = [];
              chunkMap[d.parentKey].push({ index: d.chunkIndex ?? 0, data: d.data || [] });
            } else if (!d.isChunked && d.data !== undefined) {
              aggregatedDocs[docSnap.id] = { data: d.data, updatedAt: d.updatedAt };
            }
          });

          for (const [parentKey, chunks] of Object.entries(chunkMap)) {
            chunks.sort((a, b) => a.index - b.index);
            aggregatedDocs[parentKey] = {
              data: chunks.flatMap(c => c.data),
              updatedAt: Date.now()
            };
          }

          // Hydrate documents on snapshot only if newer than local admin modifications
          for (const [docId, item] of Object.entries(aggregatedDocs)) {
            const localTime = parseInt(localStorage.getItem(`bs_${docId}_time`) || '0', 10);
            const cloudTime = typeof item.updatedAt === 'number'
              ? item.updatedAt
              : (item.updatedAt ? new Date(item.updatedAt).getTime() : 0);

            const isRecentLocalEdit = (Date.now() - localTime) < 15000;
            if (!isRecentLocalEdit && (!localTime || cloudTime > localTime)) {
              try {
                localStorage.setItem(`bs_${docId}`, JSON.stringify(item.data));
                changed = true;
              } catch {}
            }
          }

          // Dispatch universal sync event for React re-rendering if data changed
          if (changed) {
            window.dispatchEvent(new CustomEvent('bs_sync', { detail: { fromFirestore: true } }));
          }
        },
        (error) => {
          this.status.firestoreConnected = false;
          this.notifyStatus();
          // Unsubscribe immediately to prevent Firebase SDK backoff retry loop
          if (this.firestoreUnsubscribe) {
            try { this.firestoreUnsubscribe(); } catch {}
            this.firestoreUnsubscribe = null;
          }
          handleFirestoreError(error, OperationType.GET, 'institute_data');
        }
      );
    } catch (e) {
      console.warn('[MasterGateway] Firestore listener notice:', e);
    }
  }

  /**
   * Publish change globally from Admin Panel
   */
  public async publish(key: string, value: any): Promise<void> {
    this.status.totalPushes++;
    this.status.lastSyncTime = Date.now();
    this.notifyStatus();

    // 0. Update local storage timestamp so admin edit is always authoritative
    try {
      localStorage.setItem(`bs_${key}`, JSON.stringify(value));
      localStorage.setItem(`bs_${key}_time`, Date.now().toString());
    } catch {}

    // 1. Instant local BroadcastChannel notification (0ms)
    if (this.channel) {
      try {
        this.channel.postMessage({ key, value, timestamp: Date.now() });
      } catch (e) {
        // Fallback
      }
    }

    // 2. Dispatch custom event locally
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bs_sync', { detail: { key, value, fromGateway: true } }));
    }

    // 3. Instant zero-latency push via Socket.io WebSocket to all connected devices worldwide
    if (this.socket && this.socket.connected) {
      try {
        this.socket.emit('sync:push', { key, value, timestamp: Date.now() });
      } catch (err) {
        console.warn('[MasterGateway] Socket emit fallback to REST:', err);
      }
    }

    // 4. Push to Central Server SSE Hub & Disk (/api/sync/update) - Master Persistence
    try {
      await fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch {
      // In offline scenario, local storage and service worker cache handles it
    }

    // 5. Push to Firebase Firestore in background if quota allows
    if (!isFirestoreQuotaExhausted()) {
      try {
        await safeFirestoreSet('institute_data', key, value);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `institute_data/${key}`);
      }
    }

    // 6. Push to Supabase PostgreSQL in real-time if configured
    if (supabaseService.isConfigured()) {
      try {
        supabaseService.pushData(key, value).then((res) => {
          if (res.success) {
            this.status.supabaseConnected = true;
          }
        }).catch(err => {
          console.warn('[MasterGateway] Supabase async push notice:', err);
        });
      } catch (err) {
        console.warn('[MasterGateway] Supabase push error:', err);
      }
    }
  }

  /**
   * Force sync all institutional modules to cloud & server
   */
  public async forceSyncAll(fullState: Record<string, any>): Promise<boolean> {
    try {
      this.status.totalPushes++;
      this.status.lastSyncTime = Date.now();
      this.notifyStatus();

      // Timestamp local records
      for (const k of Object.keys(fullState)) {
        try {
          localStorage.setItem(`bs_${k}_time`, Date.now().toString());
        } catch {}
      }

      // Emit bulk push via Socket.io
      if (this.socket && this.socket.connected) {
        try {
          this.socket.emit('sync:bulk_push', { all: fullState });
        } catch (err) {
          console.warn('[MasterGateway] Socket bulk emit error:', err);
        }
      }

      // Push to server disk & SSE hub
      await fetch('/api/sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: fullState })
      });

      // Push to Supabase if configured
      if (supabaseService.isConfigured()) {
        try {
          const supaRes = await supabaseService.syncAllToSupabase(fullState);
          if (supaRes.success) {
            this.status.supabaseConnected = true;
            this.notifyStatus();
          }
        } catch (supaErr) {
          console.warn('[MasterGateway] Supabase bulk push error:', supaErr);
        }
      }

      // Push to Firestore if quota allows
      if (!isFirestoreQuotaExhausted()) {
        for (const [k, v] of Object.entries(fullState)) {
          if (isFirestoreQuotaExhausted()) break;
          await safeFirestoreSet('institute_data', k, v);
        }
      }

      return true;
    } catch (e) {
      console.error('[MasterGateway] forceSyncAll caught:', e);
      return false;
    }
  }

  /**
   * Supabase Real-Time Listener
   */
  public setupSupabaseRealtime() {
    if (typeof window === 'undefined') return;

    if (this.supabaseUnsubscribe) {
      try { this.supabaseUnsubscribe(); } catch {}
      this.supabaseUnsubscribe = null;
    }

    if (!supabaseService.isConfigured()) {
      this.status.supabaseConnected = false;
      this.notifyStatus();
      return;
    }

    try {
      this.supabaseUnsubscribe = supabaseService.subscribeToRealtime((key: string, data: any) => {
        this.status.supabaseConnected = true;
        this.status.totalReceives++;
        this.status.lastSyncTime = Date.now();
        this.notifyStatus();

        // Update local storage
        try {
          localStorage.setItem(`bs_${key}`, JSON.stringify(data));
          localStorage.setItem(`bs_${key}_time`, Date.now().toString());
        } catch {}

        this.dispatchChange(key, data, 'supabase');
      });

      // Test connection to verify status
      supabaseService.testConnection().then((test) => {
        this.status.supabaseConnected = test.connected;
        this.notifyStatus();
      }).catch(() => {
        this.status.supabaseConnected = false;
        this.notifyStatus();
      });
    } catch (err) {
      console.warn('[MasterGateway] Supabase realtime setup error:', err);
    }
  }

  public reconnectSupabase() {
    this.setupSupabaseRealtime();
  }

  /**
   * Subscribe to gateway changes
   */
  public subscribe(callback: GatewaySyncCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to status changes
   */
  public onStatusChange(callback: (status: GatewayStatus) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  public getStatus(): GatewayStatus {
    return { ...this.status };
  }

  private dispatchChange(key: string, value: any, source: 'firestore' | 'sse' | 'broadcast' | 'local' | 'supabase') {
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

// Attach to window for external scripts or browser devtools if available
if (typeof window !== 'undefined') {
  (window as any).BS_MasterGateway = masterGateway;
}
