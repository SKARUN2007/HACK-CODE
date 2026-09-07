import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, RefreshCw, Trash2, ArrowLeft, CheckCircle2, AlertCircle, Camera, Mic, MapPin, Wifi } from 'lucide-react';
import { getAllPendingEvidence, deletePendingItem, PendingEvidenceItem } from '../services/db';
import { synchronizePendingQueue } from '../services/syncEngine';
import { useLanguage } from '../context/LanguageContext';

export const PendingReportsPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [items, setItems] = useState<PendingEvidenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    setLoading(true);
    try {
      const data = await getAllPendingEvidence();
      setItems(data.reverse());
    } catch (err) {
      console.error('Failed to load IndexedDB items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setMessage(isTA ? 'நிலுவையிலுள்ள ஆஃப்லைன் அறிக்கைகள் சேவையகத்துடன் ஒத்திசைக்கப்படுகின்றன...' : 'Synchronizing pending offline items with backend server...');
    try {
      const res = await synchronizePendingQueue();
      if (res.synced > 0) {
        setMessage(isTA ? `${res.synced} அறிக்கை(கள்) வெற்றிகரமாக ஒத்திசைக்கப்பட்டன.` : `Successfully synchronized ${res.synced} report(s). Real server Evidence IDs assigned.`);
      } else if (res.failed > 0) {
        setMessage(isTA ? `ஒத்திசைவு சிக்கல்: ${res.errors[0]}` : `Sync issue: ${res.errors[0]}`);
      }
      await loadPendingItems();
    } catch (err: any) {
      setMessage(isTA ? `ஒத்திசைவு பிழை: ${err.message}` : `Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (localId: string) => {
    if (confirm(isTA ? 'இந்தச் சாதனத்திலிருந்து உள்ளூர் வரைவை நீக்கவா?' : 'Delete local draft copy from this device?')) {
      await deletePendingItem(localId);
      await loadPendingItems();
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <Link to="/citizen" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> {isTA ? 'திட்டப் பட்டியலுக்குத் திரும்புக' : 'Back to Projects List'}
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-review">{isTA ? 'INDEXEDDB ஆஃப்லைன் வரிசை' : 'INDEXEDDB OFFLINE QUEUE'}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{isTA ? 'சாதன உள்ளூர் சேமிப்பு' : 'Device Local Storage'}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              {isTA ? 'நிலுவையில் உள்ள ஆஃப்லைன் அறிக்கைகள்' : 'Pending Offline Reports'}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              {isTA ? 'இணையமின்றி பதிவு செய்யப்பட்ட அறிக்கைகள் சேவையகத்துடன் ஒத்திசைக்கப்படும் வரை உள்ளூர் சேமிப்பில் பாதுகாப்பாக இருக்கும்.' : 'Reports captured offline reside safely in local storage until synchronized with the backend server.'}
            </p>
          </div>

          {items.some((i) => i.syncStatus !== 'SYNCED') && (
            <button
              onClick={handleSyncAll}
              disabled={syncing || !navigator.onLine}
              className="btn-primary"
              style={{ backgroundColor: '#16a34a', gap: '0.5rem' }}
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} /> {syncing ? (isTA ? 'ஒத்திசைக்கப்படுகிறது...' : 'Syncing Queue...') : (isTA ? 'அனைத்து அறிக்கைகளையும் ஒத்திசைக்க' : 'Sync All Pending Reports')}
            </button>
          )}
        </div>

        {message && (
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            {isTA ? 'நிலுவை வரிசை பதிவேற்றப்படுகிறது...' : 'Loading pending queue...'}
          </div>
        ) : items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Clock size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              {isTA ? 'நிலுவை ஆஃப்லைன் அறிக்கைகள் எதுவுமில்லை' : 'No Pending Offline Reports'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {isTA ? 'அனைத்துக் கள அறிக்கைகளும் சேவையகத்துடன் வெற்றிகரமாக ஒத்திசைக்கப்பட்டுள்ளன.' : 'All captured ground reports have been synchronized to the backend server.'}
            </p>
            <Link to="/citizen" className="btn-primary">{isTA ? 'பொதுத் திட்டங்களை உலாவுக' : 'Browse Public Projects'}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map((item) => (
              <div key={item.localId} className="card" style={{ borderLeft: item.syncStatus === 'SYNCED' ? '4px solid #16a34a' : item.syncStatus === 'SYNC_FAILED' ? '4px solid #dc2626' : '4px solid #d97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>
                      {isTA ? 'உள்ளூர் எண்:' : 'LOCAL ID:'} {item.localId}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                      {isTA ? 'திட்டம்:' : 'Project:'} {item.projectId}
                    </h3>
                  </div>

                  {item.syncStatus === 'SYNCED' && <span className="badge badge-consistent">{isTA ? 'ஒத்திசைக்கப்பட்டது ✓' : 'SYNCED ✓'}</span>}
                  {item.syncStatus === 'PENDING_SYNC' && <span className="badge badge-review">{isTA ? 'ஒத்திசைவு நிலுவையில்' : 'PENDING SYNC'}</span>}
                  {item.syncStatus === 'SYNC_FAILED' && <span className="badge badge-mismatch">{isTA ? 'ஒத்திசைவு தோல்வி' : 'SYNC FAILED'}</span>}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={15} /> {isTA ? 'பதிவு செய்யப்பட்டது:' : 'Captured:'} {new Date(item.clientCapturedAt).toLocaleString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {item.photoBlob ? (isTA ? '📷 புகைப்படம் உள்ளது ✓' : '📷 Photo Attached ✓') : (isTA ? 'புகைப்படம் இல்லை' : 'No Photo')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {item.voiceBlob ? (isTA ? '🎤 குரல் பதிவு உள்ளது ✓' : '🎤 Voice Note Attached ✓') : (isTA ? 'ஒலிப்பதிவு இல்லை' : 'No Audio')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={15} /> {item.locationProvided ? (isTA ? 'GPS இணைக்கப்பட்டது ✓' : 'GPS Attached ✓') : (isTA ? 'இடம் பெறப்படவில்லை' : 'LOCATION_NOT_PROVIDED')}
                  </span>
                </div>

                {item.syncStatus === 'SYNC_FAILED' && item.syncError && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={16} /> <strong>{isTA ? 'ஒத்திசைவு சிக்கல்:' : 'Sync Issue:'}</strong> {item.syncError}
                  </div>
                )}

                {item.syncStatus === 'SYNCED' && item.serverEvidenceId && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {isTA ? '✓ சேவையகத்தில் பதிவேற்றப்பட்டது • ஆதார எண்:' : '✓ Uploaded to Server • Server Evidence ID:'} <strong style={{ fontFamily: 'monospace' }}>{item.serverEvidenceId}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {item.syncStatus !== 'SYNCED' && (
                    <button
                      onClick={handleSyncAll}
                      disabled={syncing || !navigator.onLine}
                      className="btn-primary"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', backgroundColor: '#16a34a' }}
                    >
                      <RefreshCw size={14} /> {item.syncStatus === 'SYNC_FAILED' ? (isTA ? 'மீண்டும் முயற்சிக்குக' : 'Retry Sync') : (isTA ? 'இப்போது ஒத்திசைக்க' : 'Sync Now')}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.localId)}
                    className="btn-outline"
                    style={{ borderColor: '#fecaca', color: '#dc2626', padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                  >
                    <Trash2 size={14} /> {isTA ? 'உள்ளூர் வரைவை நீக்குக' : 'Delete Local Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
