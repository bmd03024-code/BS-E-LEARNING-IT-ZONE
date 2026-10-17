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

import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { collection, doc, onSnapshot, setDoc, getDocs, Unsubscribe } from 'firebase/firestore';

export interface GatewayStatus {
  isOnline: boolean;
  firestoreConnected: boolean;
  sseConnected: boolean;
  broadcastChannelReady: boolean;
  lastSyncTime: number | null;
  totalPushes: number;
  totalReceives: number;
  activeChannel: 'cloud' | 'server' | 'hybrid' | 'local';
  pingMs: number;
}

export type GatewaySyncCallback = (key: string, value: any, source: 'firestore' | 'sse' | 'broadcast' | 'local') => void;

class MasterGatewayEngine {
  private static instance: MasterGatewayEngine;
  private channel: BroadcastChannel | null = null;
  private sse: EventSource | null = null;
  private firestoreUnsubscribe: Unsubscribe | null = null;
  private listeners: Set<GatewaySyncCallback> = new Set();
  private statusListeners: Set<(status: GatewayStatus) => void> = new Set();

  private status: GatewayStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    firestoreConnected: false,
    sseConnected: false,
    broadcastChannelReady: false,
    lastSyncTime: Date.now(),
    totalPushes: 0,
    totalReceives: 0,
    activeChannel: 'hybrid',
    pingMs: 12
  };

  private constructor() {
    this.setupNetworkMonitor();
    this.setupBroadcastChannel();
    this.setupSSE();
    this.setupFirestoreListener();
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
      this.status.sseConnected = false;
      this.status.firestoreConnected = false;
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
  private setupFirestoreListener() {
    if (typeof window === 'undefined') return;

    try {
      const colRef = collection(db, 'institute_data');
      this.firestoreUnsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          this.status.firestoreConnected = true;
          this.status.lastSyncTime = Date.now();
          this.notifyStatus();

          // Immediately hydrate all documents on initial snapshot or subsequent updates
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && data.data !== undefined) {
              try {
                localStorage.setItem(`bs_${docSnap.id}`, JSON.stringify(data.data));
              } catch {}
            }
          });

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
              const docData = change.doc.data();
              if (docData && docData.data !== undefined) {
                try {
                  localStorage.setItem(`bs_${change.doc.id}`, JSON.stringify(docData.data));
                } catch {}
                this.status.totalReceives++;
                this.dispatchChange(change.doc.id, docData.data, 'firestore');
              }
            }
          });

          // Dispatch universal sync event for React re-rendering
          window.dispatchEvent(new CustomEvent('bs_sync', { detail: { fromFirestore: true } }));
        },
        (error) => {
          console.warn('[MasterGateway] Firestore sync error:', error);
          this.status.firestoreConnected = false;
          this.notifyStatus();
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

    // 3. Push to Firebase Firestore (Global Cloud Real-Time)
    try {
      const docRef = doc(db, 'institute_data', key);
      await setDoc(
        docRef,
        {
          key,
          data: value,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `institute_data/${key}`);
    }

    // 4. Push to Central Server SSE Hub (/api/sync/update)
    try {
      await fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
    } catch {
      // In offline scenario, Firestore offline persistence handles it
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

      // Push all to Firestore
      for (const [k, v] of Object.entries(fullState)) {
        try {
          const docRef = doc(db, 'institute_data', k);
          await setDoc(docRef, { key: k, data: v, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (e) {
          console.warn(`[MasterGateway] Bulk item write catch for ${k}:`, e);
        }
      }

      // Push to server
      await fetch('/api/sync/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: fullState })
      });

      return true;
    } catch (e) {
      console.error('[MasterGateway] forceSyncAll caught:', e);
      return false;
    }
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

  private dispatchChange(key: string, value: any, source: 'firestore' | 'sse' | 'broadcast' | 'local') {
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
}

export const masterGateway = MasterGatewayEngine.getInstance();

// Attach to window for external scripts or browser devtools if available
if (typeof window !== 'undefined') {
  (window as any).BS_MasterGateway = masterGateway;
}
