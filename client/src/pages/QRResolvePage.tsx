import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrCode, Search, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { Project } from '../types';

export const QRResolvePage: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [resolvedProject, setResolvedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleResolveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResolvedProject(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a project verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/resolve-code/${trimmed}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Project verification code not recognized.');
      }

      setResolvedProject(data.project);
    } catch (err: any) {
      setError(err.message || 'Project verification code not recognized.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProject = () => {
    if (resolvedProject) {
      navigate(`/citizen/projects/${resolvedProject.id}/verify`);
    }
  };

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '580px' }}>
        <Link to="/citizen" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Projects List
        </Link>

        <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '50%', marginBottom: '1rem' }}>
              <QrCode size={36} style={{ color: '#2563eb' }} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              QR Project Identification
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Scan or enter the official public project verification code displayed on-site.
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {!resolvedProject ? (
            <form onSubmit={handleResolveCode}>
              {/* Quick Code Demo Buttons */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Quick Project Code Shortcuts (Click to Auto-fill)
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['MS-ROAD-001', 'MS-WATER-002', 'MS-STREET-003', 'MS-SAN-004', 'MS-SCHOOL-005'].map((demoCode) => (
                    <button
                      key={demoCode}
                      type="button"
                      onClick={() => setCode(demoCode)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                      }}
                    >
                      {demoCode}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Verification Code / Scanned Route
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MS-ROAD-001"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                  }}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                {loading ? 'Validating Server Code...' : 'Resolve Project Code'}
              </button>
            </form>
          ) : (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                  Project Code Validated Server-Side ({resolvedProject.verificationCode})
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                {resolvedProject.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                {resolvedProject.location} • Category: <strong>{resolvedProject.category}</strong>
              </p>

              <button
                onClick={handleConfirmProject}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#16a34a', padding: '0.75rem' }}
              >
                "This is the project I want to verify" <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
