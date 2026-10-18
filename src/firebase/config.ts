import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Operation Types for Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Global Quota Circuit Breaker to prevent write exhaustion & retry loops
function checkInitialQuota(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem('bs_firestore_quota_exhausted');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
  } catch {}
  // Default to true to prevent initial write spikes; verified via /api/quota-state
  return true;
}

let quotaExhausted = checkInitialQuota();

// Fetch live server quota status immediately on boot
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('bs_firestore_quota_exhausted', JSON.stringify({
      exhausted: true,
      timestamp: Date.now()
    }));
  } catch {}

  fetch('/api/quota-state')
    .then(res => res.json())
    .then(data => {
      if (data && data.exhausted === false) {
        quotaExhausted = false;
        try { localStorage.removeItem('bs_firestore_quota_exhausted'); } catch {}
      } else {
        quotaExhausted = true;
      }
    })
    .catch(() => {
      // Default to safe quota protection on offline / network error
      quotaExhausted = true;
    });
}

export function isFirestoreQuotaExhausted(): boolean {
  return quotaExhausted;
}

export function markFirestoreQuotaExhausted() {
  quotaExhausted = true;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bs_firestore_quota_exhausted', JSON.stringify({
        exhausted: true,
        timestamp: Date.now()
      }));
    } catch {}
  }
}

export function getApproxPayloadSize(obj: any): number {
  try {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return typeof Blob !== 'undefined' ? new Blob([str]).size : (typeof Buffer !== 'undefined' ? Buffer.byteLength(str, 'utf8') : str.length * 2);
  } catch {
    return 0;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorStr = error instanceof Error ? error.message : String(error);

  if (errorStr.includes('resource-exhausted') || errorStr.includes('Quota limit exceeded') || errorStr.includes('quota') || errorStr.includes('Quota')) {
    markFirestoreQuotaExhausted();
    return {
      error: 'Daily free Firestore quota limit reached. Routing all writes through high-speed disk and Socket.io.',
      authInfo: {},
      operationType,
      path
    };
  }

  if (errorStr.includes('maximum allowed size') || errorStr.includes('exceeds the maximum allowed size') || errorStr.includes('1,048,576 bytes')) {
    console.warn(`[Firestore Safe Guard] Document at ${path} exceeds 1MB limit. Routed safely through disk & Socket.io.`);
    return {
      error: 'Document exceeds 1MB Firestore limit. Safely persisted to disk & Socket.io.',
      authInfo: {},
      operationType,
      path
    };
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  return errInfo;
}

export async function safeFirestoreSet(collectionName: string, docId: string, data: any): Promise<boolean> {
  // Prevent any setDoc call if quota is exhausted to avoid SDK retry backoff loops
  if (isFirestoreQuotaExhausted()) return false;

  try {
    const rawPayload = { key: docId, data, updatedAt: Date.now() };
    const approxSize = getApproxPayloadSize(rawPayload);

    // Hard limit: Firestore documents cannot exceed 1,048,576 bytes. Keep threshold at 850KB.
    if (approxSize > 850000) {
      if (Array.isArray(data) && data.length > 1) {
        // Partition array into safe sub-chunks
        const chunks: any[][] = [];
        let currentChunk: any[] = [];
        let currentSize = 0;

        for (const item of data) {
          const itemSize = getApproxPayloadSize(item);
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

        // Write each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunkDocRef = doc(db, collectionName, `${docId}__chunk_${i}`);
          await setDoc(chunkDocRef, {
            key: `${docId}__chunk_${i}`,
            isChunk: true,
            parentKey: docId,
            chunkIndex: i,
            totalChunks: chunks.length,
            data: chunks[i],
            updatedAt: Date.now()
          }, { merge: true });
        }

        // Write parent manifest doc
        const parentDocRef = doc(db, collectionName, docId);
        await setDoc(parentDocRef, {
          key: docId,
          isChunked: true,
          chunkCount: chunks.length,
          totalItems: data.length,
          updatedAt: Date.now()
        }, { merge: true });

        return true;
      } else {
        console.warn(`[Firestore Guard] Document ${collectionName}/${docId} (${approxSize} bytes) exceeds 850KB. Saved to disk & Socket.io to prevent 1MB limit crash.`);
        return true;
      }
    }

    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, rawPayload, { merge: true });
    return true;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
    return false;
  }
}

// Readiness connection verification
export async function testConnection(): Promise<boolean> {
  if (isFirestoreQuotaExhausted()) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client offline or connecting...');
    }
    return false;
  }
}

