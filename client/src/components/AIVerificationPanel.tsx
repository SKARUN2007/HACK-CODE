import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RefreshCw,
  UserCheck,
  Ban,
  Lock,
  Info,
} from 'lucide-react';

export interface VerificationData {
  id: string;
  projectId: string;
  analysisVersion: string;
  provider: string;
  modelName?: string;
  analysisTimestamp: string;
  priorityScore: number;
  confidenceScore: number;
  result: 'CONSISTENT' | 'REVIEW' | 'POTENTIAL_MISMATCH';
  humanStatus: 'AI_PENDING' | 'AI_ANALYZED' | 'HUMAN_REVIEW_PENDING' | 'HUMAN_CONFIRMED' | 'HUMAN_REJECTED' | 'RESOLVED';
  signals: {
    locationSignal: string;
    integritySignal: string;
    duplicateSignal: string;
    citizenProgressSignal: string;
    corroborationSignal: string;
  };
  corroboration: {
    submissionCount: number;
    independentCitizenCount: number;
    similarAnswerCount: number;
    consistentAnswerCount: number;
    unsureAnswerCount: number;
    conflictingAnswerCount: number;
    exactDuplicateCount: number;
    locationVerifiedCount: number;
  };
  whyFlagged: string[];
  explanation?: string[];
  recommendation: string;
  aiVisionUsed: boolean;
  aiNotice?: string;
}

interface AIVerificationPanelProps {
  projectId: string;
  verification: VerificationData | null;
  onAnalysisUpdated?: (updated: VerificationData) => void;
}

export const AIVerificationPanel: React.FC<AIVerificationPanelProps> = ({
  projectId,
  verification: initialVerification,
  onAnalysisUpdated,
}) => {
  const [verification, setVerification] = useState<VerificationData | null>(initialVerification);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [updatingHumanStatus, setUpdatingHumanStatus] = useState<boolean>(false);
  const [inspectorNotes, setInspectorNotes] = useState<string>('');

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const response = await fetch(`/api/verifications/project/${projectId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run AI verification analysis.');
      }

      setVerification(data.verification);
      if (onAnalysisUpdated) onAnalysisUpdated(data.verification);
    } catch (err: any) {
      alert(`Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleHumanReviewAction = async (newStatus: 'HUMAN_CONFIRMED' | 'HUMAN_REJECTED') => {
    if (!verification) return;
    setUpdatingHumanStatus(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const response = await fetch(`/api/verifications/${verification.id}/human-review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          humanStatus: newStatus,
          inspectorNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update human review status.');
      }

      setVerification(data.verification);
      if (onAnalysisUpdated) onAnalysisUpdated(data.verification);
      setInspectorNotes('');
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    } finally {
      setUpdatingHumanStatus(false);
    }
  };

  const getResultBadge = (result?: string) => {
    switch (result) {
      case 'CONSISTENT':
        return <span className="badge badge-consistent" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>🟢 CONSISTENT</span>;
      case 'REVIEW':
        return <span className="badge badge-review" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>🟡 REVIEW</span>;
      case 'POTENTIAL_MISMATCH':
        return <span className="badge badge-mismatch" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>🔴 POTENTIAL MISMATCH</span>;
      default:
        return <span className="badge badge-review">AI PENDING</span>;
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* LARGE HEADER BANNER */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px 12px 0 0',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Sparkles size={18} className="text-amber-400" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24' }}>
              AI-ASSISTED VERIFICATION ENGINE
            </span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            AI FLAGS — HUMANS DECIDE
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Evidence pattern risk analysis strictly prioritizes projects for human inspection.
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="btn-primary"
          style={{ backgroundColor: '#2563eb', padding: '0.65rem 1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={analyzing ? 'animate-spin' : ''} />
          {analyzing ? 'Running Analysis...' : 'RUN AI-ASSISTED ANALYSIS'}
        </button>
      </div>

      {!verification ? (
        <div className="card" style={{ borderRadius: '0 0 12px 12px', textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
          <p>No verification analysis run recorded yet for this project.</p>
          <button onClick={handleRunAnalysis} disabled={analyzing} className="btn-primary" style={{ marginTop: '1rem' }}>
            Run AI Verification Analysis
          </button>
        </div>
      ) : (
        <div className="card" style={{ borderRadius: '0 0 12px 12px', borderTop: 'none' }}>
          {/* NOTICE / FALLBACK BANNER */}
          {verification.aiNotice && (
            <div
              style={{
                backgroundColor: verification.aiVisionUsed ? '#f0fdf4' : '#fffbeb',
                border: verification.aiVisionUsed ? '1px solid #bbf7d0' : '1px solid #fde68a',
                color: verification.aiVisionUsed ? '#166534' : '#92400e',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Info size={16} /> {verification.aiNotice}
            </div>
          )}

          {/* DUAL SCORES & STATUS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Verification Priority Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: verification.priorityScore >= 60 ? '#dc2626' : verification.priorityScore >= 30 ? '#d97706' : '#16a34a' }}>
                  {verification.priorityScore}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                Priority for official human inspection.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Evidence Confidence Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb' }}>
                  {verification.confidenceScore}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ 100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                Based on unique citizens, location & integrity.
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Pattern Analysis Result
              </span>
              <div>{getResultBadge(verification.result)}</div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
                Human Status: <strong>{verification.humanStatus}</strong>
              </span>
            </div>
          </div>

          {/* CORROBORATION METRICS SUMMARY GRID */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Multi-Citizen Corroboration Breakdown
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{verification?.corroboration?.submissionCount ?? 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Total Submissions</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>{verification?.corroboration?.independentCitizenCount ?? 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Independent Citizens</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{verification?.corroboration?.locationVerifiedCount ?? 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Near Project GPS</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{verification?.corroboration?.similarAnswerCount ?? 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Progress Mismatches</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#64748b' }}>{verification?.corroboration?.exactDuplicateCount ?? 0}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Duplicates Discounted</div>
              </div>
            </div>
          </div>

          {/* OBSERVATIONS VISUAL BAR CHART */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Citizen Field Observations Distribution
            </h4>
            <div style={{ height: '24px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', display: 'flex', marginBottom: '0.5rem' }}>
              {(verification?.corroboration?.submissionCount ?? 0) > 0 && (
                <>
                  <div
                    style={{
                      width: `${((verification?.corroboration?.similarAnswerCount ?? 0) / (verification?.corroboration?.submissionCount || 1)) * 100}%`,
                      backgroundColor: '#ef4444',
                    }}
                    title={`Mismatch: ${verification?.corroboration?.similarAnswerCount ?? 0}`}
                  />
                  <div
                    style={{
                      width: `${((verification?.corroboration?.consistentAnswerCount ?? 0) / (verification?.corroboration?.submissionCount || 1)) * 100}%`,
                      backgroundColor: '#22c55e',
                    }}
                    title={`Consistent: ${verification?.corroboration?.consistentAnswerCount ?? 0}`}
                  />
                  <div
                    style={{
                      width: `${((verification?.corroboration?.unsureAnswerCount ?? 0) / (verification?.corroboration?.submissionCount || 1)) * 100}%`,
                      backgroundColor: '#f59e0b',
                    }}
                    title={`Unsure: ${verification?.corroboration?.unsureAnswerCount ?? 0}`}
                  />
                  <div
                    style={{
                      width: `${((verification?.corroboration?.exactDuplicateCount ?? 0) / (verification?.corroboration?.submissionCount || 1)) * 100}%`,
                      backgroundColor: '#94a3b8',
                    }}
                    title={`Duplicates: ${verification?.corroboration?.exactDuplicateCount ?? 0}`}
                  />
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#475569', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, backgroundColor: '#ef4444', borderRadius: '2px' }} /> Mismatch ({verification?.corroboration?.similarAnswerCount ?? 0})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, backgroundColor: '#22c55e', borderRadius: '2px' }} /> Consistent ({verification?.corroboration?.consistentAnswerCount ?? 0})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, backgroundColor: '#f59e0b', borderRadius: '2px' }} /> Unsure ({verification?.corroboration?.unsureAnswerCount ?? 0})</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 10, height: 10, backgroundColor: '#94a3b8', borderRadius: '2px' }} /> Duplicates Discounted ({verification?.corroboration?.exactDuplicateCount ?? 0})</span>
            </div>
          </div>

          {/* EXPLAINABILITY RATIONALE */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
              WHY WAS THIS FLAGGED? (Plain-Language Explainability Rationale)
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {(verification?.whyFlagged || verification?.explanation || ['Geotagged image evidence analyzed vs reported milestone target.']).map((bullet: string, idx: number) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>

            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #cbd5e1', fontSize: '0.88rem' }}>
              <strong style={{ color: '#0f172a' }}>Recommendation:</strong>{' '}
              <span style={{ color: '#1e293b' }}>{verification?.recommendation || 'Priority high-risk site visit recommended for PWD inspection team.'}</span>
            </div>
          </div>

          {/* HUMAN INSPECTOR ACTION CONTROLS */}
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={18} /> Human Inspector Decision Panel
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#1e3a8a', marginBottom: '0.75rem' }}>
              As an authorized inspection official, confirm ground status after site audit.
            </p>

            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                placeholder="Optional inspector site audit notes or reference ticket number..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleHumanReviewAction('HUMAN_CONFIRMED')}
                disabled={updatingHumanStatus}
                className="btn-primary"
                style={{ backgroundColor: '#dc2626', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Confirm Mismatch (Prioritize Physical Inspection)
              </button>

              <button
                onClick={() => handleHumanReviewAction('HUMAN_REJECTED')}
                disabled={updatingHumanStatus}
                className="btn-outline"
                style={{ borderColor: '#16a34a', color: '#16a34a', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Mark Consistent (Close Alert)
              </button>
            </div>
          </div>

          {/* SAFE AI DESIGN INFO PANEL */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontSize: '0.82rem', color: '#475569' }}>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} className="text-blue-600" /> SAFE AI & ETHICS GUARANTEES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <div>✓ AI does not decide corruption</div>
              <div>✓ Multi-citizen corroboration required</div>
              <div>✓ Duplicate evidence discounted</div>
              <div>✓ No facial recognition / profiling</div>
              <div>✓ Final decision with human engineer</div>
              <div>✓ Immutable chained audit logging</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
