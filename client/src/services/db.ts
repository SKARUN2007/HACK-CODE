export interface PendingEvidenceItem {
  localId: string;
  projectId: string;
  milestoneId?: string | null;
  photoBlob?: Blob | null;
  photoName?: string | null;
  voiceBlob?: Blob | null;
  voiceName?: string | null;
  visibleWork?: 'YES' | 'NO' | 'UNSURE' | null;
  milestoneMatch?: 'YES' | 'NO' | 'UNSURE' | null;
  usableMaintained?: 'YES' | 'NO' | 'UNSURE' | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationProvided: boolean;
  clientCapturedAt: string;
  syncStatus: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED';
  syncError?: string | null;
  serverEvidenceId?: string | null;
  serverEvidenceHash?: string | null;
}

export interface PendingCivicReportItem {
  localId: string;
  photoBlob?: Blob | null;
  photoName?: string | null;
  voiceBlob?: Blob | null;
  voiceName?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationText?: string | null;
  category?: string | null;
  issueType?: string | null;
  clientCapturedAt: string;
  syncStatus: 'CIVIC_REPORT_PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED';
  syncError?: string | null;
  serverReportId?: string | null;
  serverReportCode?: string | null;
}

const DB_NAME = 'makkalsaantru_offline_db';
const DB_VERSION = 2;
const STORE_PENDING = 'pending_evidence';
const STORE_PROJECTS = 'cached_projects';
const STORE_PENDING_CIVIC = 'pending_civic_reports';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PENDING)) {
        db.createObjectStore(STORE_PENDING, { keyPath: 'localId' });
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING_CIVIC)) {
        db.createObjectStore(STORE_PENDING_CIVIC, { keyPath: 'localId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save Pending Evidence to IndexedDB
export async function savePendingEvidence(item: PendingEvidenceItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, 'readwrite');
    const store = tx.objectStore(STORE_PENDING);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Get All Pending Evidence Items
export async function getAllPendingEvidence(): Promise<PendingEvidenceItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, 'readonly');
    const store = tx.objectStore(STORE_PENDING);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// Get Single Pending Item
export async function getPendingItem(localId: string): Promise<PendingEvidenceItem | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, 'readonly');
    const store = tx.objectStore(STORE_PENDING);
    const req = store.get(localId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Delete Local Pending Item
export async function deletePendingItem(localId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING, 'readwrite');
    const store = tx.objectStore(STORE_PENDING);
    const req = store.delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Cache Projects for Offline Discovery
export async function cacheProjectsLocally(projects: any[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = tx.objectStore(STORE_PROJECTS);
    projects.forEach((proj) => {
      store.put({ id: proj.id, projectData: proj, lastUpdated: new Date().toISOString() });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Get Cached Projects for Offline Browsing
export async function getCachedProjectsLocally(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readonly');
    const store = tx.objectStore(STORE_PROJECTS);
    const req = store.getAll();
    req.onsuccess = () => {
      const records = req.result || [];
      resolve(records.map((r) => r.projectData));
    };
    req.onerror = () => reject(req.error);
  });
}

// Save Pending Civic Report to IndexedDB
export async function savePendingCivicReport(item: PendingCivicReportItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_CIVIC, 'readwrite');
    const store = tx.objectStore(STORE_PENDING_CIVIC);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Get All Pending Civic Reports
export async function getAllPendingCivicReports(): Promise<PendingCivicReportItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_CIVIC, 'readonly');
    const store = tx.objectStore(STORE_PENDING_CIVIC);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// Delete Pending Civic Report
export async function deletePendingCivicReport(localId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_CIVIC, 'readwrite');
    const store = tx.objectStore(STORE_PENDING_CIVIC);
    const req = store.delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

