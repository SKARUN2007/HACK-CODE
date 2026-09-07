import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAllPendingEvidence, getAllPendingCivicReports, PendingEvidenceItem } from '../services/db';
import { synchronizeAllOfflineItems } from '../services/syncEngine';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    checkPendingQueue();

    const handleOnline = () => {
      setIsOnline(true);
      checkPendingQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingQueue = async () => {
    try {
      const items = await getAllPendingEvidence();
      const pendingEv = items.filter((i) => i.syncStatus === 'PENDING_SYNC' || i.syncStatus === 'SYNC_FAILED');
      
      const civicItems = await getAllPendingCivicReports();
      const pendingCivic = civicItems.filter((i) => i.syncStatus === 'CIVIC_REPORT_PENDING_SYNC' || i.syncStatus === 'SYNC_FAILED');

      setPendingCount(pendingEv.length + pendingCivic.length);
    } catch {
      // ignore
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage('Synchronizing saved offline queue with server...');
    try {
      const res = await synchronizeAllOfflineItems();
      if (res.synced > 0) {
        setSyncMessage(`Successfully synchronized ${res.synced} item(s) to server.`);
      } else if (res.failed > 0) {
        setSyncMessage(`Sync issue: ${res.errors[0] || 'Check authentication or network.'}`);
      } else {
        setSyncMessage('All offline items up to date.');
      }
      await checkPendingQueue();
    } catch (err: any) {
      setSyncMessage(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !syncMessage) {
    return null; // Silent when online and no pending items
  }

  return (
    <div
      style={{
        backgroundColor: !isOnline ? '#fef2f2' : pendingCount > 0 ? '#fffbeb' : '#f0fdf4',
        borderBottom: !isOnline ? '1px solid #fecaca' : pendingCount > 0 ? '1px solid #fde68a' : '1px solid #bbf7d0',
        color: !isOnline ? '#dc2626' : pendingCount > 0 ? '#b45309' : '#15803d',
        padding: '0.65rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'all 0.3s ease',
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isOnline ? (
            <>
              <WifiOff size={16} />
              <span>
                🔴 <strong>OFFLINE MODE:</strong> You are offline. Captures will be saved locally on this device and can be submitted when connection returns.
              </span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <Wifi size={16} />
              <span>
                🟠 <strong>CONNECTION RESTORED:</strong> {pendingCount} offline evidence report(s) waiting for server sync.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>{syncMessage}</span>
            </>
          )}
        </div>

        {isOnline && pendingCount > 0 && (
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              backgroundColor: '#b45309',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'SYNC NOW'}
          </button>
        )}
      </div>
    </div>
  );
};
