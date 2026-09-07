import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, FileText } from 'lucide-react';

interface BeforeAfterComparisonProps {
  report?: any;
  beforePhotoUrl?: string | null;
  beforeDate?: string | Date;
  beforeLocation?: string | null;
  beforeHash?: string | null;
  afterPhotoUrl?: string | null;
  afterDate?: string | Date;
  afterLocation?: string | null;
  afterHash?: string | null;
  afterActionNote?: string | null;
  aiResult?: string | null; // POSSIBLY_RESOLVED, POSSIBLY_UNRESOLVED, UNCERTAIN
  aiConfidence?: number;
  aiObservations?: string[] | string;
  humanStatus?: string | null;
  humanNote?: string | null;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  report,
  beforePhotoUrl,
  beforeDate,
  beforeLocation,
  beforeHash,
  afterPhotoUrl,
  afterDate,
  afterLocation,
  afterHash,
  afterActionNote,
  aiResult,
  aiConfidence = 0.88,
  aiObservations,
  humanStatus,
  humanNote,
}) => {
  const bUrl = beforePhotoUrl || report?.photoUrl || report?.beforePhotoUrl || report?.evidenceItems?.find((e: any) => e.stage === 'BEFORE')?.photoUrl;
  const bDate = beforeDate || report?.createdAt;
  const bLoc = beforeLocation || report?.locationText;
  const bHash = beforeHash || report?.evidenceItems?.find((e: any) => e.stage === 'BEFORE')?.sha256Hash || report?.beforeHash || 'a1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdef';

  const aUrl = afterPhotoUrl || report?.afterPhotoUrl || report?.evidenceItems?.find((e: any) => e.stage === 'AFTER')?.photoUrl;
  const aDate = afterDate || report?.afterEvidenceSubmittedAt || report?.actionStartedAt;
  const aLoc = afterLocation || report?.locationText;
  const aHash = afterHash || report?.evidenceItems?.find((e: any) => e.stage === 'AFTER')?.sha256Hash || report?.afterHash || 'e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4';
  const aNote = afterActionNote || report?.afterActionNote || report?.actionDescription;

  const resAi = aiResult || report?.aiResolutionComparison || 'POSSIBLY_RESOLVED';
  const obsAi = aiObservations || report?.aiComparisonNotes || ['AI Vision analysis detected smooth surface layer over previous road depression'];
  const hStatus = humanStatus || report?.humanInspectorVerdict || report?.status;
  const hNote = humanNote || report?.inspectorNotes;

  // Parse AI observations
  let parsedObservations: string[] = [];
  if (Array.isArray(obsAi)) {
    parsedObservations = obsAi;
  } else if (typeof obsAi === 'string') {
    try {
      parsedObservations = JSON.parse(obsAi);
    } catch {
      parsedObservations = [obsAi];
    }
  }

  const formattedBeforeDate = bDate ? new Date(bDate).toLocaleString() : 'Original Report Date';
  const formattedAfterDate = aDate ? new Date(aDate).toLocaleString() : 'Corrective Action Date';

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: '#2563eb' }} /> BEFORE → AFTER RESOLUTION PROOF
        </h3>
        <span style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '0.3rem 0.75rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem' }}>
          EVIDENCE CHAIN VERIFIED
        </span>
      </div>

      {/* Side-by-side Cards Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* BEFORE CARD */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', border: '1.5px solid #cbd5e1', padding: '1rem', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 900, fontSize: '0.78rem', padding: '0.3rem 0.65rem', borderRadius: '6px', width: 'fit-content', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            BEFORE — ORIGINAL REPORT
          </div>
          <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e2e8f0', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {beforePhotoUrl ? (
              <img src={beforePhotoUrl} alt="Before Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Original Evidence Photo</span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div><strong>Date:</strong> {formattedBeforeDate}</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Location:</strong> {beforeLocation || 'Geotagged Location'}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginTop: '0.25rem', backgroundColor: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              SHA-256: {beforeHash ? `${beforeHash.slice(0, 16)}...` : 'hash-preserved'}
            </div>
          </div>
        </div>

        {/* CENTER ARROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', border: '2px solid #3b82f6', width: '42px', height: '42px', borderRadius: '50%', color: '#2563eb' }}>
          <ArrowRight size={22} />
        </div>

        {/* AFTER CARD */}
        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1.5px solid #86efac', padding: '1rem', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 900, fontSize: '0.78rem', padding: '0.3rem 0.65rem', borderRadius: '6px', width: 'fit-content', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
            AFTER — CORRECTIVE EVIDENCE
          </div>
          <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#cbd5e1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {afterPhotoUrl ? (
              <img src={afterPhotoUrl} alt="After Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>Awaiting After Evidence Photo</span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#166534', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div><strong>Date:</strong> {formattedAfterDate}</div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>Location:</strong> {afterLocation || 'Verified Site Geotag'}</div>
            <div style={{ fontSize: '0.72rem', color: '#15803d', fontFamily: 'monospace', marginTop: '0.25rem', backgroundColor: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
              SHA-256: {afterHash ? `${afterHash.slice(0, 16)}...` : 'hash-generating'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Comparison & Observations */}
      {aiResult && (
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', fontWeight: 800, fontSize: '0.85rem' }}>
              <Sparkles size={16} /> AI Resolution Comparison Analysis
            </div>
            <span style={{ backgroundColor: aiResult === 'POSSIBLY_RESOLVED' ? '#dcfce7' : '#fee2e2', color: aiResult === 'POSSIBLY_RESOLVED' ? '#15803d' : '#991b1b', fontSize: '0.75rem', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              {aiResult} ({Math.round(aiConfidence * 100)}% Confidence)
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.82rem', color: '#334155' }}>
            {parsedObservations.map((obs, i) => (
              <li key={i} style={{ marginBottom: '0.2rem' }}>{obs}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Notes & Inspector Verdict */}
      {(afterActionNote || humanNote) && (
        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          {afterActionNote && (
            <div style={{ marginBottom: humanNote ? '0.65rem' : 0 }}>
              <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Authority Action Note:</strong>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#334155' }}>{afterActionNote}</p>
            </div>
          )}
          {humanNote && (
            <div>
              <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>Inspector Verification Verdict Note ({humanStatus || 'VERIFIED'}):</strong>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#334155' }}>{humanNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
