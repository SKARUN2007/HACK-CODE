import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HardHat,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Building,
  UserCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Project, ContractorProgressSubmission } from '../types';
import { handleImageError, getEvidenceImageUrl } from '../utils/imageUtils';

export const ContractorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const checkUserStatus = () => {
    const userStr = localStorage.getItem('makkalsaantru_user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  const handleDemoContractorLogin = async () => {
    setLoginLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'contractor@makkalsaantru.gov.in',
          password: 'contractor123',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed demo contractor login');

      localStorage.setItem('makkalsaantru_token', data.token);
      localStorage.setItem('makkalsaantru_user', JSON.stringify(data.user));
      localStorage.setItem('ms_auth_token', data.token);

      setCurrentUser(data.user);
      await fetchAssignedProjects();
    } catch (err: any) {
      setError(err.message || 'Demo contractor login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchAssignedProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || localStorage.getItem('ms_auth_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/contractor/assigned-projects', { headers });

      if (!res.ok) {
        throw new Error('Failed to fetch assigned projects. Please log in as an authorized contractor.');
      }

      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || 'Error loading contractor projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
    fetchAssignedProjects();
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
            }}
          >
            <CheckCircle2 size={14} /> VERIFIED BY HUMAN AUTHORITY
          </span>
        );
      case 'MORE_EVIDENCE_REQUIRED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
            }}
          >
            <AlertTriangle size={14} /> MORE EVIDENCE REQUESTED
          </span>
        );
      case 'FIELD_INSPECTION_REQUIRED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              border: '1px solid #bae6fd',
            }}
          >
            <Clock size={14} /> FIELD INSPECTION SCHEDULED
          </span>
        );
      case 'NOT_CONFIRMED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
          >
            <AlertTriangle size={14} /> PROGRESS NOT CONFIRMED
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
            }}
          >
            <Clock size={14} /> AWAITING PUBLIC / HUMAN REVIEW
          </span>
        );
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header Section */}
        <div
          style={{
            backgroundColor: '#002B49',
            borderRadius: '16px',
            padding: '2rem',
            color: '#ffffff',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0, 43, 73, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b',
                  flexShrink: 0,
                }}
              >
                <HardHat size={32} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      padding: '2px 10px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                    }}
                  >
                    TAMIL NADU e-GOVERNANCE • CONTRACTOR PORTAL
                  </span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 6px', color: '#ffffff' }}>
                  Contractor Execution Portal
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, maxWidth: '650px' }}>
                  Upload real-time ground evidence for assigned public works. Evidence is evaluated transparently by citizens, AI, and field inspectors.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDemoContractorLogin}
                disabled={loginLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#f59e0b',
                  color: '#02182b',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <HardHat size={18} /> {loginLoading ? 'Logging In...' : 'Demo Login as Contractor'}
              </button>

              <button
                onClick={fetchAssignedProjects}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {currentUser && (
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                color: '#cbd5e1',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} style={{ color: '#10b981' }} /> Active Session:{' '}
                <strong style={{ color: '#ffffff' }}>{currentUser.name}</strong> ({currentUser.email})
              </span>
              <span
                style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {currentUser.role}
              </span>
            </div>
          )}
        </div>

        {/* Security Rule Notice Banner */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <ShieldCheck size={22} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            <strong>Evidence Transparency Rule:</strong> Submitted contractor evidence cannot be overwritten or self-verified. If additional documentation is requested by an inspector, submit a new version to preserve full audit history.
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <RefreshCw size={36} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} className="animate-spin" />
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading assigned public work projects...</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{error}</span>
            <button
              onClick={handleDemoContractorLogin}
              disabled={loginLoading}
              style={{
                backgroundColor: '#f59e0b',
                color: '#02182b',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {loginLoading ? 'Logging In...' : '⚡ Quick Login as Demo Contractor'}
            </button>
          </div>
        )}

        {/* Projects Cards List */}
        {!loading && projects.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {projects.map((proj) => {
              const latestSubmission: ContractorProgressSubmission | undefined =
                proj.contractorSubmissions && proj.contractorSubmissions.length > 0
                  ? proj.contractorSubmissions[0]
                  : undefined;

              return (
                <div
                  key={proj.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0, 43, 73, 0.08)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {/* Top Bar Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      paddingBottom: '1.25rem',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span
                          style={{
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {proj.verificationCode || 'MS-PROJECT'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                          {proj.category}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                        {proj.title}
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} style={{ color: '#002B49' }} /> {proj.location}
                      </p>
                    </div>

                    <Link
                      to={`/contractor/projects/${proj.id}/progress/new`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        backgroundColor: '#f59e0b',
                        color: '#02182b',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                    >
                      <Upload size={18} /> UPLOAD PROGRESS EVIDENCE
                    </Link>
                  </div>

                  {/* Body Grid: Configured Stages vs Latest Evidence */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                      gap: '1.75rem',
                    }}
                  >
                    {/* Column 1: Configured Work Stages */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <FileText size={16} style={{ color: '#d97706' }} /> Configured Work Stages
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {proj.stages && proj.stages.length > 0 ? (
                          proj.stages.map((st) => (
                            <div
                              key={st.id}
                              style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: '#002B49',
                                  color: '#fbbf24',
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                {st.sequence}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{st.name}</div>
                                {st.description && (
                                  <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                                    {st.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '1rem 0' }}>
                            No stages configured.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Latest Submitted Evidence */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Clock size={16} style={{ color: '#0284c7' }} /> Latest Submitted Evidence
                      </h3>

                      {latestSubmission ? (
                        <div
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.775rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} /> Version {latestSubmission.version} • {new Date(latestSubmission.submittedAt).toLocaleDateString()}
                            </span>
                            {getStatusBadge(latestSubmission.status)}
                          </div>

                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {latestSubmission.title}
                          </div>

                          <div
                            style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              fontSize: '0.825rem',
                              color: '#334155',
                              fontStyle: 'italic',
                            }}
                          >
                            "{latestSubmission.claim}"
                          </div>

                          {latestSubmission.evidences && latestSubmission.evidences.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
                              <div
                                style={{
                                  width: '64px',
                                  height: '64px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#e2e8f0',
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={getEvidenceImageUrl(latestSubmission.evidences[0])}
                                  alt="Contractor Evidence"
                                  onError={handleImageError}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                <div style={{ fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>
                                  ✓ SHA-256 Hashed
                                </div>
                                <div style={{ fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all' }}>
                                  {latestSubmission.evidences[0].sha256Hash?.slice(0, 24)}...
                                </div>
                              </div>
                            </div>
                          )}

                          {latestSubmission.status === 'MORE_EVIDENCE_REQUIRED' && (
                            <div
                              style={{
                                marginTop: '6px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fde68a',
                                color: '#b45309',
                                fontSize: '0.8rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>Inspector requested re-verification.</span>
                              <Link
                                to={`/contractor/projects/${proj.id}/progress/new`}
                                style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#f59e0b',
                                  color: '#02182b',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  textDecoration: 'none',
                                }}
                              >
                                Upload Version {latestSubmission.version + 1}
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '12px',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Building size={32} style={{ color: '#94a3b8' }} />
                          <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                            No progress updates uploaded yet for this project.
                          </p>
                          <Link
                            to={`/contractor/projects/${proj.id}/progress/new`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.825rem',
                              fontWeight: 700,
                              color: '#d97706',
                              textDecoration: 'none',
                              marginTop: '4px',
                            }}
                          >
                            Submit First Progress Evidence <ChevronRight size={16} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;
