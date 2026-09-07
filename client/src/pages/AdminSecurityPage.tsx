import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Key,
  FileCheck,
  Users,
  Activity,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SecuritySummary {
  totalEvents: number;
  failedLoginCount: number;
  accessDeniedCount: number;
  rateLimitCount: number;
  invalidUploadCount: number;
  integrityWarningCount: number;
}

interface SecurityEventItem {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  endpoint: string;
  description: string;
  timestamp: string;
}

interface SecurityControlItem {
  name: string;
  status: string;
  detail: string;
}

export const AdminSecurityPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [controls, setControls] = useState<SecurityControlItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchSecurityData();
  }, [typeFilter, severityFilter, searchQuery]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';

      // 1. Fetch Controls Status
      const statusRes = await fetch('/api/admin/security/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      if (statusRes.ok && statusData.controls) {
        setControls(statusData.controls);
      }

      // 2. Fetch Security Events
      const queryParams = new URLSearchParams();
      if (typeFilter !== 'ALL') queryParams.append('type', typeFilter);
      if (severityFilter !== 'ALL') queryParams.append('severity', severityFilter);
      if (searchQuery.trim() !== '') queryParams.append('search', searchQuery.trim());

      const eventsRes = await fetch(`/api/admin/security/events?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventsData = await eventsRes.json();
      if (eventsRes.ok && eventsData.events) {
        setEvents(eventsData.events);
        setSummary(eventsData.summary);
      }
    } catch (err) {
      console.warn('Failed to fetch admin security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="badge badge-mismatch" style={{ backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #991b1b' }}>🔴 CRITICAL</span>;
      case 'HIGH':
        return <span className="badge badge-mismatch">🟠 HIGH</span>;
      case 'MEDIUM':
        return <span className="badge badge-review">🟡 MEDIUM</span>;
      case 'LOW':
        return <span className="badge badge-consistent">🔵 LOW</span>;
      default:
        return <span className="badge badge-consistent">{severity}</span>;
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Cyber Security Command Center Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, rgba(2, 24, 43, 0.94) 0%, rgba(0, 43, 73, 0.88) 50%, rgba(2, 24, 43, 0.96) 100%), url('/admin_hero.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '3rem 0 3.5rem',
        marginBottom: '2.5rem',
        borderBottom: '4px solid #D97706',
        boxShadow: 'inset 0 -30px 40px rgba(0,0,0,0.5)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', backgroundColor: 'rgba(217, 119, 6, 0.2)', border: '1px solid rgba(217, 119, 6, 0.4)', borderRadius: '9999px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                <ShieldCheck size={16} /> தமிழ்நாடு அரசு • சைபர் பாதுகாப்பு & தணிக்கை மையம் (CYBER COMMAND CENTER)
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                பாதுகாப்பு & நிர்வாகத் தளம் (Security & Audit Center)
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0, maxWidth: '650px' }}>
                Real-time security events, SHA-256 evidence chain verification, rate limiting status, and magic-byte defense controls.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={fetchSecurityData}
                className="btn"
                style={{ 
                  backgroundColor: '#fbbf24', 
                  color: '#002B49', 
                  borderColor: '#f59e0b', 
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  gap: '0.5rem', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <RefreshCw size={18} style={{ color: '#002B49' }} /> Refresh Audit Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-consistent" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                ROLE: SYSTEM ADMINISTRATOR
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={14} className="text-emerald-600" /> Real-Time Cybersecurity Command Center
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Cybersecurity & Threat Event Monitoring
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Real-time monitoring of authentication attempts, rate limits, upload signatures, and SHA-256 integrity alerts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchSecurityData} className="btn-outline" style={{ borderColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={16} /> Refresh Security Logs
            </button>
            <Link to="/admin/audit" className="btn-primary">
              Chained Audit Trail
            </Link>
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Failed Login Attempts
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
              {summary ? summary.failedLoginCount : 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Auth Failures Tracked</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
              Access Denied Events
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626', marginTop: '0.2rem' }}>
              {summary ? summary.accessDeniedCount : 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>RBAC Role Violations</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              Rate Limit Triggers
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
              {summary ? summary.rateLimitCount : 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Brute-Force Safeguards</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              Invalid Upload Rejections
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
              {summary ? summary.invalidUploadCount : 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>Magic Byte Signature Mismatch</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' }}>
              Integrity Warnings
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7e22ce', marginTop: '0.2rem' }}>
              {summary ? summary.integrityWarningCount : 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6b21a8' }}>SHA-256 Digest Alerts</span>
          </div>
        </div>

        {/* ACTIVE SECURITY CONTROLS PANEL */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} className="text-emerald-600" /> REAL ACTIVE SECURITY CONTROLS MATRIX
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {controls.map((ctrl, idx) => (
              <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{ctrl.name}</strong>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                    {ctrl.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ctrl.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GOVERNMENT ENTERPRISE SECURITY ARCHITECTURE DISPLAY PANEL */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)', 
          color: '#ffffff', 
          borderRadius: '12px', 
          padding: '1.75rem', 
          marginBottom: '2rem',
          borderTop: '3px solid #fbbf24',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <ShieldCheck size={22} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              {isTA ? 'அரசுப் பாதுகாப்பு சான்றளிப்புக் கட்டமைப்பு (Enterprise Security Architecture)' : 'GOVERNMENT ENTERPRISE SECURITY & DEFENSE-IN-DEPTH ARCHITECTURE'}
            </h3>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.25rem', maxWidth: '850px' }}>
            {isTA 
              ? 'மக்கள் சான்று தளம் பயனர் அங்கீகாரம், தரவு மேலாண்மை, வீதக் கட்டுப்பாடு மற்றும் AI தனிமைப்படுத்தலை GIGW 3.0 அரசுக் தரநிலைகளின்படி முழுமையாகப் பாதுகாக்கிறது.'
              : 'MakkalSaantru enforces end-to-end defense-in-depth across authentication, data integrity, rate limiting, and AI provider isolation under GIGW 3.0 cyber standards.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {[
              { icon: Lock, color: '#38bdf8', title: isTA ? 'பயனர் அங்கீகாரம் (JWT 24h)' : 'Authentication (JWT 24h)', subtitle: 'Stateless Encrypted Bearer Tokens' },
              { icon: Users, color: '#a7f3d0', title: isTA ? 'பங்கு அடிப்படையிலான அணுகல் (RBAC)' : 'Role-Based Access (RBAC)', subtitle: 'Citizen / Inspector / Admin Control' },
              { icon: FileCheck, color: '#fde047', title: isTA ? 'தணிக்கைப் பதிவேடு சங்கிலி' : 'Chained Tamper Audit Log', subtitle: 'Immutable Append-Only Audit Trail' },
              { icon: FileCheck, color: '#cbd5e1', title: isTA ? 'மேஜிக்-பைட் கோப்பு பாதுகாப்பு' : 'Magic-Byte File Signature', subtitle: 'Binary Header Content Validation' },
              { icon: ShieldCheck, color: '#34d399', title: isTA ? 'SHA-256 சான்று குறியாக்கம்' : 'Server SHA-256 Hashing', subtitle: 'Cryptographic Hash Verification' },
              { icon: Activity, color: '#f87171', title: isTA ? 'API வீதக் கட்டுப்பாடு' : 'Express API Rate Limiting', subtitle: 'DDoS & Brute-Force Rate Guard' },
              { icon: Key, color: '#fbbf24', title: isTA ? 'ரகசிய விசை பாதுகாப்பு' : 'Key Isolation (.env scan)', subtitle: 'Zero Secret Leakage Protection' },
              { icon: Cpu, color: '#60a5fa', title: isTA ? 'AI உள்ளீட்டு பாதுகாப்பு' : 'Prompt Injection Isolation', subtitle: 'Sanitized AI Context & Payloads' },
            ].map((ctrl, idx) => {
              const IconComp = ctrl.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#16213e',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: '0.45rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={18} style={{ color: ctrl.color }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>{ctrl.title}</div>
                      <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{ctrl.subtitle}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)', flexShrink: 0 }}>
                    ✓ ACTIVE
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span>
              {isTA 
                ? '"பாதுகாப்புக் கட்டுப்பாடுகள் தளத்தைப் பாதுகாக்குகின்றன; மனித ஆய்வாளர் மட்டுமே முடிவை உறுதி செய்கிறார்."'
                : '"Security controls protect the platform infrastructure; human verification confirms ground proof truthfulness."'}
            </span>
          </div>
        </div>

        {/* SECURITY EVENT LOGS BAR & TABLE */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              SECURITY THREAT EVENTS LOG ({events.length})
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Event Types</option>
                <option value="ACCESS_DENIED">ACCESS_DENIED</option>
                <option value="INVALID_UPLOAD">INVALID_UPLOAD</option>
                <option value="FAILED_LOGIN">FAILED_LOGIN</option>
                <option value="LOGIN_RATE_LIMITED">LOGIN_RATE_LIMITED</option>
                <option value="INTEGRITY_MISMATCH">INTEGRITY_MISMATCH</option>
                <option value="MALFORMED_INPUT">MALFORMED_INPUT</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MEDIUM">🟡 MEDIUM</option>
                <option value="LOW">🔵 LOW</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Loading security event logs...
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No security threat events recorded for selected criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Severity</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Event Type</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Endpoint</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Actor</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Security Description</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {new Date(evt.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>{getSeverityBadge(evt.severity)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {evt.type}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#2563eb', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {evt.endpoint}
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>
                        {evt.userName || 'Anonymous Client'} ({evt.userRole || 'N/A'})
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>
                        {evt.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
