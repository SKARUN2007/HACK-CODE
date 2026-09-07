import {
  getAllPendingEvidence,
  savePendingEvidence,
  PendingEvidenceItem,
  getAllPendingCivicReports,
  savePendingCivicReport,
  deletePendingCivicReport,
  PendingCivicReportItem,
} from './db';

export interface SyncEngineResult {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Synchronization Engine for Offline Evidence Queue (Public Work Verification).
 */
export async function synchronizePendingQueue(): Promise<SyncEngineResult> {
  const allItems = await getAllPendingEvidence();
  const pendingItems = allItems.filter(
    (item) => item.syncStatus === 'PENDING_SYNC' || item.syncStatus === 'SYNC_FAILED'
  );

  const result: SyncEngineResult = {
    total: pendingItems.length,
    synced: 0,
    failed: 0,
    errors: [],
  };

  if (pendingItems.length === 0) {
    return result;
  }

  const token = localStorage.getItem('makkalsaantru_token');
  if (!token) {
    for (const item of pendingItems) {
      item.syncStatus = 'SYNC_FAILED';
      item.syncError = 'Please sign in again to securely submit your saved evidence.';
      await savePendingEvidence(item);
    }
    result.failed = pendingItems.length;
    result.errors.push('Authentication expired. Please sign in to sync.');
    return result;
  }

  for (const item of pendingItems) {
    try {
      item.syncStatus = 'SYNCING';
      await savePendingEvidence(item);

      const formData = new FormData();
      if (item.photoBlob) {
        formData.append('photo', item.photoBlob, item.photoName || 'offline-photo.jpg');
      }
      if (item.voiceBlob) {
        formData.append('voice', item.voiceBlob, item.voiceName || 'offline-voice.webm');
      }
      if (item.latitude !== undefined && item.latitude !== null) {
        formData.append('latitude', String(item.latitude));
      }
      if (item.longitude !== undefined && item.longitude !== null) {
        formData.append('longitude', String(item.longitude));
      }
      formData.append('locationProvided', String(item.locationProvided));
      if (item.visibleWork) formData.append('visibleWork', item.visibleWork);
      if (item.milestoneMatch) formData.append('milestoneMatch', item.milestoneMatch);
      if (item.usableMaintained) formData.append('usableMaintained', item.usableMaintained);
      if (item.notes) formData.append('notes', item.notes);

      const response = await fetch(`/api/projects/${item.projectId}/evidence`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in again to securely submit your saved evidence.');
        }
        throw new Error(data.error || 'Server validation failed during sync.');
      }

      // Sync Success! Update IndexedDB record to SYNCED
      item.syncStatus = 'SYNCED';
      item.serverEvidenceId = data.evidence?.id;
      item.serverEvidenceHash = data.evidence?.evidenceHash;
      item.syncError = null;
      await savePendingEvidence(item);

      result.synced += 1;
    } catch (err: any) {
      item.syncStatus = 'SYNC_FAILED';
      item.syncError = err.message || 'Synchronization failed.';
      await savePendingEvidence(item);

      result.failed += 1;
      result.errors.push(`Item ${item.localId}: ${err.message}`);
    }
  }

  return result;
}

/**
 * Synchronization Engine for Offline Civic Reports Queue.
 */
export async function synchronizeCivicReportsQueue(): Promise<SyncEngineResult> {
  const allItems = await getAllPendingCivicReports();
  const pendingItems = allItems.filter(
    (item) => item.syncStatus === 'CIVIC_REPORT_PENDING_SYNC' || item.syncStatus === 'SYNC_FAILED'
  );

  const result: SyncEngineResult = {
    total: pendingItems.length,
    synced: 0,
    failed: 0,
    errors: [],
  };

  if (pendingItems.length === 0) {
    return result;
  }

  const token = localStorage.getItem('makkalsaantru_token');

  for (const item of pendingItems) {
    try {
      const formData = new FormData();
      if (item.photoBlob) {
        formData.append('photo', item.photoBlob, item.photoName || 'offline-civic-photo.jpg');
      }
      if (item.voiceBlob) {
        formData.append('voice', item.voiceBlob, item.voiceName || 'offline-voice.webm');
      }
      if (item.description) formData.append('description', item.description);
      if (item.latitude !== undefined && item.latitude !== null) {
        formData.append('latitude', String(item.latitude));
      }
      if (item.longitude !== undefined && item.longitude !== null) {
        formData.append('longitude', String(item.longitude));
      }
      if (item.locationText) formData.append('locationText', item.locationText);
      if (item.category) formData.append('category', item.category);
      if (item.issueType) formData.append('issueType', item.issueType);

      const response = await fetch('/api/civic-reports', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server validation failed during civic report sync.');
      }

      // Delete from IndexedDB on successful server creation
      await deletePendingCivicReport(item.localId);
      result.synced += 1;
    } catch (err: any) {
      item.syncStatus = 'SYNC_FAILED';
      item.syncError = err.message || 'Civic report synchronization failed.';
      await savePendingCivicReport(item);

      result.failed += 1;
      result.errors.push(`Civic Report ${item.localId}: ${err.message}`);
    }
  }

  return result;
}

/**
 * Combined sync function for all offline queues.
 */
export async function synchronizeAllOfflineItems(): Promise<SyncEngineResult> {
  const evRes = await synchronizePendingQueue();
  const civicRes = await synchronizeCivicReportsQueue();

  return {
    total: evRes.total + civicRes.total,
    synced: evRes.synced + civicRes.synced,
    failed: evRes.failed + civicRes.failed,
    errors: [...evRes.errors, ...civicRes.errors],
  };
}

