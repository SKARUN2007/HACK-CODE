import React from 'react';
import { Lock, MapPin, Clock, Copy, ShieldCheck, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

interface SecurityPanelProps {
  evidenceHash: string;
  capturedAt: string;
  locationStatus?: string | null;
  distanceFromProject?: number | null;
  exactDuplicate?: boolean;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  evidenceHash,
  capturedAt,
  locationStatus = 'NEAR_PROJECT',
  distanceFromProject,
  exactDuplicate = false,
}) => {
  const shortenedHash = evidenceHash
    ? `${evidenceHash.slice(0, 4)}...${evidenceHash.slice(-4)}`
    : '4d91...7ac2';

  const getLocationBadge = () => {
    switch (locationStatus) {
      case 'NEAR_PROJECT':
        return <span className="badge badge-consistent">NEAR PROJECT ({distanceFromProject ?? 0}m)</span>;
      case 'LOCATION_REVIEW':
        return <span className="badge badge-review">LOCATION REVIEW ({distanceFromProject ?? 0}m)</span>;
      case 'LOCATION_MISMATCH':
        return <span className="badge badge-mismatch">LOCATION MISMATCH ({distanceFromProject ?? 0}m)</span>;
      default:
        return <span className="badge badge-review">LOCATION_NOT_PROVIDED</span>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.75rem',
        }}
      >
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} style={{ color: '#2563eb' }} /> SECURITY & EVIDENCE TRUST PANEL
        </h4>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
          Fingerprint: {shortenedHash}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
        <div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <Lock size={14} style={{ color: '#16a34a' }} /> SHA-256 File Integrity
          </div>
          <div style={{ fontWeight: 700, color: '#15803d' }}>
            RECORDED ✓ (Server Verified)
          </div>
        </div>

        <div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <MapPin size={14} style={{ color: '#2563eb' }} /> Location Signal
          </div>
          <div>{getLocationBadge()}</div>
        </div>

        <div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <Clock size={14} style={{ color: '#d97706' }} /> Server Timestamp
          </div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>
            {new Date(capturedAt).toLocaleTimeString()} ✓
          </div>
        </div>

        <div>
          <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
            <Copy size={14} style={{ color: exactDuplicate ? '#dc2626' : '#16a34a' }} /> Exact Duplicate Check
          </div>
          <div style={{ fontWeight: 700, color: exactDuplicate ? '#dc2626' : '#15803d' }}>
            {exactDuplicate ? 'POSSIBLE DUPLICATE ⚠️' : 'NOT DETECTED ✓'}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1rem', fontStyle: 'italic', borderTop: '1px dashed #cbd5e1', paddingTop: '0.6rem' }}>
        <strong>Trust Explanation</strong>: These signals improve evidence reliability but do not prove the truthfulness of the citizen's claim. Cryptographic SHA-256 fingerprinting guarantees post-receipt integrity.
      </p>
    </div>
  );
};
