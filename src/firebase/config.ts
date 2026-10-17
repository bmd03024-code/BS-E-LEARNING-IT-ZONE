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
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { key: docId, data, updatedAt: Date.now() }, { merge: true });
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

