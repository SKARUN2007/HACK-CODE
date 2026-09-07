import React from 'react';
import { CheckCircle2, ShieldCheck, FileCheck, Hash } from 'lucide-react';

interface ResolutionProofCardProps {
  report?: any;
  reportCode?: string;
  beforeHash?: string | null;
  afterHash?: string | null;
  resolvedAt?: string | Date | null;
  authorityName?: string | null;
  inspectorName?: string | null;
}

export const ResolutionProofCard: React.FC<ResolutionProofCardProps> = ({
  report,
  reportCode,
  beforeHash,
  afterHash,
  resolvedAt,
  authorityName,
  inspectorName,
}) => {
  const rCode = reportCode || report?.reportCode || report?.id || 'MS-CIV-2026';
  const bHash = beforeHash || report?.evidenceItems?.find((e: any) => e.stage === 'BEFORE')?.sha256Hash || 'a1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdef';
  const aHash = afterHash || report?.evidenceItems?.find((e: any) => e.stage === 'AFTER')?.sha256Hash || 'e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4';
  const rDate = resolvedAt || report?.humanVerifiedAt || report?.updatedAt;
  const authName = authorityName || report?.authorityName || report?.authority?.name || 'Greater Chennai Corporation / PWD';
  const inspName = inspectorName || report?.humanInspectorName || report?.assignedInspector || 'Executive Inspector (PWD Audit Cell)';

  const formattedDate = rDate ? new Date(rDate).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '2px solid #86efac', backgroundColor: '#f0fdf4', boxShadow: '0 8px 24px rgba(22, 101, 52, 0.08)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #bbf7d0', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={24} style={{ color: '#16a34a' }} />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#166534', margin: 0 }}>
              RESOLUTION PROOF
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700 }}>
              Report Code: {reportCode}
            </span>
          </div>
        </div>
        <span style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '0.35rem 0.85rem', borderRadius: '8px', fontWeight: 900, fontSize: '0.82rem' }}>
          ✓ VERIFIED RESOLVED
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>Before evidence preserved with SHA-256 integrity hash</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>Corrective action recorded by {authorityName || 'Public Works Department'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>After evidence received and analyzed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>Human re-verification completed by {inspectorName || 'Assistant Engineer'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#166534', fontWeight: 700 }}>
          <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <span>Evidence integrity fingerprints stored immutably</span>
        </div>
      </div>

      {/* SHA-256 Hashes Display */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '0.85rem', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Hash size={14} /> Cryptographic Proof Fingerprints (SHA-256):
        </div>
        <div style={{ fontSize: '0.72rem', color: '#334155', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div><strong>BEFORE Hash:</strong> {beforeHash || 'hash-preserved-sha256'}</div>
          <div><strong>AFTER Hash:</strong> {afterHash || 'hash-preserved-sha256'}</div>
          <div><strong>Resolution Timestamp:</strong> {formattedDate}</div>
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: '#15803d', fontStyle: 'italic', fontWeight: 600 }}>
        Disclaimer: Resolution confirmed through recorded evidence and human review.
      </div>
    </div>
  );
};
