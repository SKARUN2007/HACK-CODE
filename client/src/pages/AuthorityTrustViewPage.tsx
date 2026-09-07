import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Clock, Camera, Mic, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Lock } from 'lucide-react';
import { Evidence } from '../types';
import { handleImageError } from '../utils/imageUtils';
import { AIVerificationPanel, VerificationData } from '../components/AIVerificationPanel';
import { SecurityPanel } from '../components/SecurityPanel';

export const AuthorityTrustViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reverifying, setReverifying] = useState<boolean>(false);
  const [reverifyResult, setReverifyResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvidenceDetails(id);
    }
  }, [id]);

  const fetchEvidenceDetails = async (evidenceId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const response = await fetch(`/api/evidence/${evidenceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch evidence record.');
      }

      setEvidence(data.evidence);

      if (data.evidence?.projectId) {
        fetchProjectVerification(data.evidence.projectId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectVerification = async (projectId: string) => {
    try {
      const response = await fetch(`/api/verifications/project/${projectId}`);
      const data = await response.json();
      if (response.ok && data.verification) {
        setVerification(data.verification);
      }
    } catch {
      // ignore
    }
  };

  const handleReverifyIntegrity = async () => {
    if (!id) return;
    setReverifying(true);
    setReverifyResult(null);

    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const response = await fetch(`/api/evidence/${id}/reverify-integrity`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Re-verification failed.');
      }

      setReverifyResult(data);
    } catch (err: any) {
      alert(`Integrity check error: ${err.message}`);
    } finally {
      setReverifying(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: '#64748b' }}>
        Loading evidence trust record...
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertTriangle size={32} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
          <h2>Evidence Record Not Found</h2>
          <Link to="/authority" className="btn-primary">Return to Authority Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <Link to="/authority" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Authority Dashboard
        </Link>

        {/* EMBEDDED AI VERIFICATION PANEL */}
        {evidence.projectId && (
          <AIVerificationPanel
            projectId={evidence.projectId}
            verification={verification}
            onAnalysisUpdated={(updated) => setVerification(updated)}
          />
        )}

        {/* EVIDENCE DETAILS CARD */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>
                EVIDENCE RECORD ID: {evidence.id}
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {evidence.project?.title || 'Public Work Evidence'}
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                <MapPin size={16} style={{ color: '#2563eb' }} /> {evidence.project?.location || 'Tamil Nadu'}
              </p>
            </div>

            <span className="badge badge-consistent">STATUS: {evidence.status}</span>
          </div>

          {/* Media Viewers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {evidence.photoUrl ? (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Camera size={16} /> Submitted Ground Photo
                </h4>
                <img src={evidence.photoUrl} alt="Ground Evidence" onError={handleImageError} style={{ width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', maxHeight: '260px', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No Photo Uploaded
              </div>
            )}

            {evidence.voiceUrl && (
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mic size={16} /> Submitted Voice Note
                </h4>
                <audio src={evidence.voiceUrl} controls style={{ width: '100%', marginTop: '0.5rem' }} />
              </div>
            )}
          </div>

          {/* Citizen Q&A Answers */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Citizen Field Observations (Non-Accusatory Metrics)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', color: '#475569' }}>
              <div>Visible Work: <strong>{evidence.visibleWork || 'N/A'}</strong></div>
              <div>Milestone Match: <strong>{evidence.milestoneMatch || 'N/A'}</strong></div>
              <div>Usable / Maintained: <strong>{evidence.usableMaintained || 'N/A'}</strong></div>
            </div>
            {evidence.notes && (
              <p style={{ marginTop: '0.5rem', color: '#334155', fontStyle: 'italic' }}>
                "{evidence.notes}"
              </p>
            )}
          </div>

          {/* SECURITY & TRUST PANEL */}
          <SecurityPanel
            evidenceHash={evidence.evidenceHash}
            capturedAt={evidence.capturedAt}
            locationStatus={evidence.locationStatus}
            distanceFromProject={evidence.distanceFromProject}
            exactDuplicate={evidence.exactDuplicate}
          />

          {/* INTEGRITY RE-VERIFICATION ACTION */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Server Cryptographic File Integrity Check
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Recompute stored file SHA-256 digest directly on the backend server to verify zero file tampering.
              </p>
            </div>

            <button
              onClick={handleReverifyIntegrity}
              disabled={reverifying}
              className="btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', backgroundColor: '#0f172a' }}
            >
              <RefreshCw size={16} className={reverifying ? 'animate-spin' : ''} /> {reverifying ? 'Re-calculating SHA-256...' : 'Run Server Integrity Re-check'}
            </button>
          </div>

          {reverifyResult && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                border: reverifyResult.integrityResult === 'VALID' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                backgroundColor: reverifyResult.integrityResult === 'VALID' ? '#f0fdf4' : '#fef2f2',
                color: reverifyResult.integrityResult === 'VALID' ? '#15803d' : '#dc2626',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} /> Server Integrity Result: {reverifyResult.integrityResult}
              </div>
              <p>{reverifyResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
