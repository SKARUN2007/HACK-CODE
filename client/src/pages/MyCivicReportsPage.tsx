import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  MapPin,
  Building2,
  Download,
  Copy,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAllPendingCivicReports, deletePendingCivicReport, PendingCivicReportItem } from '../services/db';
import { synchronizeCivicReportsQueue } from '../services/syncEngine';
import { downloadComplaintText, printOrDownloadComplaintPDF } from '../utils/pdfGenerator';

export const MyCivicReportsPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [reports, setReports] = useState<any[]>([]);
  const [offlinePending, setOfflinePending] = useState<PendingCivicReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingOffline, setSyncingOffline] = useState<boolean>(false);

  useEffect(() => {
    fetchMyReports();
    loadOfflinePending();
  }, []);

  const loadOfflinePending = async () => {
    try {
      const items = await getAllPendingCivicReports();
      setOfflinePending(items);
    } catch (err) {
      console.warn('Failed to load offline civic items:', err);
    }
  };

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const response = await fetch('/api/civic-reports/my-reports', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.warn('Failed to fetch online civic reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOffline = async () => {
    setSyncingOffline(true);
    try {
      await synchronizeCivicReportsQueue();
      await loadOfflinePending();
      await fetchMyReports();
    } catch (err) {
      console.error('Failed to sync offline civic reports:', err);
    } finally {
      setSyncingOffline(false);
    }
  };

  const handleDeleteOfflineItem = async (localId: string) => {
    if (confirm(isTA ? 'இந்த உள்ளூர் வரைவு புகாரை நீக்கவா?' : 'Delete this offline draft report from device storage?')) {
      await deletePendingCivicReport(localId);
      await loadOfflinePending();
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText style={{ color: '#2563eb' }} size={28} />
            {isTA ? 'என் குடிமைப் புகார்கள்' : 'My Civic Reports'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            {isTA ? 'நீங்கள் பதிவு செய்த குடிமைப் புகார்கள் மற்றும் துறை ஒதுக்கீடுகள்' : 'Track your submitted civic issues, generated complaints, and authority routing.'}
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="btn btn-primary"
          style={{ backgroundColor: '#2563eb', padding: '0.7rem 1.2rem', borderRadius: '10px', fontWeight: 800, gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> {isTA ? 'புதிய புகார் செய்க' : 'Report New Issue'}
        </Link>
      </div>

      {/* Offline Pending Items Section */}
      {offlinePending.length > 0 && (
        <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '1.25rem', borderRadius: '14px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontWeight: 800, color: '#b45309', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} /> {isTA ? 'இணையமில்லா நிலுவை புகார்கள்' : 'Offline Pending Reports'} ({offlinePending.length})
            </div>

            <button
              onClick={handleSyncOffline}
              disabled={syncingOffline || !navigator.onLine}
              className="btn btn-primary"
              style={{ backgroundColor: '#d97706', padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, borderRadius: '8px', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={syncingOffline ? 'animate-spin' : ''} />
              {syncingOffline ? (isTA ? 'ஒத்திசைக்கப்படுகிறது...' : 'Syncing...') : (isTA ? 'இப்போது ஒத்திசைக்க' : 'Sync All Now')}
            </button>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#78350f', marginBottom: '1rem' }}>
            {isTA ? 'இணைய இணைப்பு மீண்டும் கிடைத்ததும் இவை தானாக ஒத்திசைக்கப்படும்.' : 'These reports were created offline on this device and will sync automatically when network is restored.'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {offlinePending.map((item) => (
              <div
                key={item.localId}
                style={{
                  backgroundColor: '#ffffff',
                  border: item.syncStatus === 'SYNC_FAILED' ? '1px solid #fca5a5' : '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      LOCAL ID: {item.localId}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: '0.1rem 0' }}>
                      {item.category || 'CIVIC'} • {item.issueType || 'ISSUE REPORT'}
                    </h4>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      backgroundColor: item.syncStatus === 'SYNC_FAILED' ? '#fee2e2' : '#fef3c7',
                      color: item.syncStatus === 'SYNC_FAILED' ? '#991b1b' : '#92400e',
                    }}
                  >
                    {item.syncStatus === 'SYNC_FAILED' ? (isTA ? 'ஒத்திசைவு தோல்வி' : 'SYNC FAILED') : (isTA ? 'ஆஃப்லைன் வரைவு' : 'OFFLINE PENDING')}
                  </span>
                </div>

                {item.description && (
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0.25rem 0 0.5rem 0', lineClamp: 2 }}>
                    {item.description}
                  </p>
                )}

                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  {item.locationText && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} style={{ color: '#0284c7' }} /> {item.locationText}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> {new Date(item.clientCapturedAt).toLocaleString()}
                  </span>
                  <span>{item.photoBlob ? '📷 Photo' : ''}</span>
                  <span>{item.voiceBlob ? '🎤 Voice' : ''}</span>
                </div>

                {item.syncError && (
                  <div style={{ fontSize: '0.78rem', color: '#dc2626', backgroundColor: '#fef2f2', padding: '0.4rem 0.6rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    <AlertCircle size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                    {item.syncError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <button
                    onClick={() => handleDeleteOfflineItem(item.localId)}
                    style={{
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#64748b',
                      borderRadius: '6px',
                      padding: '0.3rem 0.7rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Trash2 size={13} /> {isTA ? 'நீக்குக' : 'Delete Local Draft'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          Loading civic reports...
        </div>
      ) : reports.length === 0 && offlinePending.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <FileText size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
            {isTA ? 'இன்னும் புகார்கள் எதுவும் இல்லை' : 'No Civic Reports Found'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {isTA ? 'சாலைக் குழி, குடிநீர் கசிவு அல்லது குப்பை போன்ற பிரச்சினையைக் காண்கிறீர்களா?' : 'Notice a pothole, water leak, or garbage accumulation in your locality?'}
          </p>
          <Link
            to="/citizen/report"
            className="btn btn-primary"
            style={{ backgroundColor: '#2563eb', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 800 }}
          >
            {isTA ? 'முதல் புகாரைப் பதிவுசெய்க' : 'File Your First Report'}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              className="card"
              style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                    REPORT ID: {report.reportCode}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0' }}>
                    {report.category} • {report.issueType || 'CIVIC ISSUE'}
                  </h3>
                </div>

                <span style={{
                  backgroundColor: report.status === 'READY_FOR_SUBMISSION' ? '#dcfce7' : '#e0f2fe',
                  color: report.status === 'READY_FOR_SUBMISSION' ? '#15803d' : '#0369a1',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                }}>
                  {report.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Priority & Status Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: report.actionPriorityScore >= 75 ? '#fee2e2' : report.actionPriorityScore >= 50 ? '#ffedd5' : '#dcfce7',
                  color: report.actionPriorityScore >= 75 ? '#991b1b' : report.actionPriorityScore >= 50 ? '#9a3412' : '#166534',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  border: `1px solid ${report.actionPriorityScore >= 75 ? '#fca5a5' : report.actionPriorityScore >= 50 ? '#fdba74' : '#86efac'}`,
                }}>
                  Priority Score: {report.actionPriorityScore || 50}/100 ({report.priorityLevel || 'MEDIUM'})
                </span>

                <span style={{
                  backgroundColor: report.status === 'RESOLVED' ? '#dcfce7' : report.status === 'REOPENED' ? '#fee2e2' : report.status === 'ACTION_IN_PROGRESS' ? '#fef3c7' : '#eff6ff',
                  color: report.status === 'RESOLVED' ? '#15803d' : report.status === 'REOPENED' ? '#991b1b' : report.status === 'ACTION_IN_PROGRESS' ? '#92400e' : '#1d4ed8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}>
                  Status: {report.status?.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: '#dc2626' }} />
                  <span>{report.locationText || 'Location Specified'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={16} style={{ color: '#059669' }} />
                  <span>{report.authority?.name || 'Local Civic Body'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} style={{ color: '#64748b' }} />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Citizen Re-verification Banner & Feedback Buttons */}
              {(report.status === 'AWAITING_REVERIFICATION' || report.status === 'RESOLVED') && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} /> {isTA ? 'அதிகாரி தீர்வு சான்று & மறுஆய்வு பின்னூட்டம்' : 'Authority Resolution Evidence & Citizen Feedback'}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#15803d', margin: '0 0 0.6rem 0' }}>
                    {isTA ? 'துறை மேற்கொண்ட சீரமைப்புப் பணியை சரிபார்த்து உங்களின் கருத்துக்களைத் தெரிவியுங்கள்:' : 'Authority has uploaded AFTER resolution evidence. Please verify on ground:'}
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        const token = localStorage.getItem('makkalsaantru_token');
                        await fetch(`/api/civic-reports/${report.id}/citizen-verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                          body: JSON.stringify({ feedback: 'APPEARS_RESOLVED', comment: 'Citizen confirmed resolution on site.' })
                        });
                        fetchMyReports();
                      }}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', backgroundColor: '#15803d', color: '#ffffff', border: 'none', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      ✓ {isTA ? 'பிரச்சினை தீர்க்கப்பட்டுவிட்டது' : 'Appears Resolved (Confirm)'}
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const token = localStorage.getItem('makkalsaantru_token');
                        await fetch(`/api/civic-reports/${report.id}/citizen-verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                          body: JSON.stringify({ feedback: 'STILL_PRESENT', comment: 'Citizen reported issue is still present on ground.' })
                        });
                        fetchMyReports();
                      }}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      ✕ {isTA ? 'பிரச்சினை இன்னும் உள்ளது (Reopen)' : 'Issue Still Present (Reopen Report)'}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => printOrDownloadComplaintPDF({
                    reportCode: report.reportCode,
                    category: report.category,
                    issueType: report.issueType || 'CIVIC_ISSUE',
                    locationText: report.locationText || '',
                    authorityName: report.authority?.name || 'Local Authority',
                    complaintText: report.complaintText || '',
                    createdAt: report.createdAt,
                    photoUrl: report.photoUrl,
                  })}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, gap: '0.3rem' }}
                >
                  <Download size={14} /> {isTA ? 'PDF பதிவிறக்கம்' : 'Download PDF'}
                </button>

                <button
                  type="button"
                  onClick={() => downloadComplaintText(report.reportCode, report.complaintText || '')}
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, gap: '0.3rem' }}
                >
                  <Copy size={14} /> {isTA ? 'உரையை நகலெடு' : 'Copy Text'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

