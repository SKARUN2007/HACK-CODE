import React, { useState } from 'react';
import { ShieldCheck, Users, Database, FileSpreadsheet, Lock, Activity, Plus, Search, CheckCircle2, Download, AlertTriangle, Key, Cpu, Camera, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';
  const [searchTerm, setSearchTerm] = useState('');

  const auditLogs = [
    { 
      id: 'LOG-TN-109', 
      action: 'SHA256_INTEGRITY_VERIFIED', 
      user: 'System Worker Node #4', 
      details: isTA ? 'சான்று EV-8812-க்கான SHA-256 தணிக்கைக் குறியீடு சரிபார்க்கப்பட்டது' : 'SHA-256 integrity match confirmed for Evidence EV-8812', 
      timestamp: '2026-09-07 10:15 AM', 
      status: isTA ? 'சரிபார்க்கப்பட்டது' : 'VERIFIED' 
    },
    { 
      id: 'LOG-TN-108', 
      action: 'USER_ROLE_AUTHENTICATED', 
      user: 'inspector@makkalsaantru.gov.in', 
      details: isTA ? 'மாநில PWD ஆய்வாளர் இரு காரணி JWT அமர்வு தொடங்கியது' : 'State PWD Inspector multi-factor JWT session initiated', 
      timestamp: '2026-09-07 09:42 AM', 
      status: isTA ? 'வெற்றி' : 'SUCCESS' 
    },
    { 
      id: 'LOG-TN-107', 
      action: 'PROJECT_REGISTERED', 
      user: 'admin@makkalsaantru.gov.in', 
      details: isTA ? 'புதிய பொதுப்பணித் திட்டம் சேர்க்கப்பட்டது: தாம்பரம் மேம்பாலப் புனரமைப்பு' : 'Added New Infrastructure Project: Tambaram Overbridge Rehabilitation', 
      timestamp: '2026-09-07 08:30 AM', 
      status: isTA ? 'உருவாக்கப்பட்டது' : 'CREATED' 
    },
    { 
      id: 'LOG-TN-106', 
      action: 'QR_DISCOVERY_TAG_GENERATED', 
      user: 'admin@makkalsaantru.gov.in', 
      details: isTA ? 'திட்டம் PROJ-TN-102-க்கான ரகசிய QR குறிச்சொல் உருவாக்கப்பட்டது' : 'Generated encrypted QR tag for Project PROJ-TN-102', 
      timestamp: '2026-09-07 07:15 AM', 
      status: isTA ? 'வெற்றி' : 'SUCCESS' 
    },
  ];

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* HD Cyber Command Center Hero Header */}
      <div 
        style={{
          position: 'relative',
          backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85)), url("/admin_hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          padding: '3rem 0',
          borderBottom: '4px solid #10b981',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          marginBottom: '2.5rem'
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '750px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge" style={{ backgroundColor: '#10b981', color: '#0f172a', fontWeight: 800 }}>
                  {isTA ? 'மாநில பாதுகாப்பு கட்டுப்பாட்டு மையம்' : 'SECURITY COMMAND PORTAL'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  {isTA ? 'மாநில தரவு மையம் • கணினி நிர்வாகப் பிரிவு' : 'State Data Center • Cyber Division'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                  {isTA ? 'GIGW 3.0 தரநிலை பூர்த்தி செய்யப்பட்டது' : 'GIGW AAA Compliant'}
                </span>
              </div>

              <h1 style={{ fontSize: '2.25rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {isTA ? 'மாநில கணினி மேற்பார்வை & RBAC கட்டுப்பாட்டு மையம்' : 'State System Oversight & RBAC Control'}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px' }}>
                {isTA 
                  ? 'தமிழ்நாடு பொதுப்பணித் திட்டங்களின் பதிவேடு, SHA-256 தணிக்கைப் பதிவுகள், அணுகல் மேலாண்மை மற்றும் பாதுகாப்பு தணிக்கை மையம்.' 
                  : 'Centralized administration for Tamil Nadu public work registry, cryptographic SHA-256 audit streams, role-based access management, and automated tamper verification.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-primary" style={{ backgroundColor: '#10b981', color: '#0f172a', fontWeight: 800, padding: '0.85rem 1.5rem', gap: '0.5rem', fontSize: '0.95rem' }}>
                <Plus size={18} /> {isTA ? 'புதிய திட்டத்தைப் பதிவு செய்' : 'Register Public Work'}
              </button>
              <Link to="/admin/security" className="btn-outline" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> {isTA ? 'பாதுகாப்பு & தணிக்கை இயந்திரம்' : 'Security Threat Engine'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* System Overview Cards */}
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          <div className="card" style={{ borderLeft: '4px solid #3b82f6', transition: 'transform 0.2s', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}>
                  <Database size={22} style={{ color: '#2563eb' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{isTA ? 'மாநிலத் தரவுத் தளம்' : 'State Evidence Vault'}</h3>
              </div>
              <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>GIGW ENTERPRISE</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>{isTA ? '6 முதன்மைத் தரவு தொகுதிகள்' : '6 Core Schema Models'}</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{isTA ? 'பயனர், திட்டம், மைல்கல், சான்றுகள், சரிபார்ப்பு, தணிக்கைப் பதிவேடு' : 'User, Project, Milestone, Evidence, Verification, AuditLog'}</p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #10b981', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ backgroundColor: '#f0fdf4', padding: '0.5rem', borderRadius: '8px' }}>
                  <Lock size={22} style={{ color: '#16a34a' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{isTA ? 'தணிக்கைப் பாதுகாப்பு' : 'Cryptographic Integrity'}</h3>
              </div>
              <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>ACTIVE SHA-256</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.2rem' }}>{isTA ? '100% மாற்ற முடியாதது' : '100% Tamper-Evident'}</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{isTA ? 'AES-256 தரவுக் குறியாக்கம் மற்றும் SHA-256 டிஜிட்டல் சான்று முத்திரை' : 'AES-256 Payload Encryption & SHA-256 Cryptographic Hash Seals'}</p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #d97706', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ backgroundColor: '#fffbeb', padding: '0.5rem', borderRadius: '8px' }}>
                  <Cpu size={22} style={{ color: '#d97706' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{isTA ? 'சேவையக நிலை' : 'Server Cluster Status'}</h3>
              </div>
              <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>99.98% UPTIME</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>{isTA ? 'சீராக இயங்குகிறது (200 OK)' : 'Healthy (200 OK)'}</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{isTA ? 'TNeGA அதிவேகப் பாதுகாக்கப்பட்ட மாநிலச் சேவையகம்' : 'TNeGA High-Availability Secure Server Cluster'}</p>
          </div>
        </div>

        {/* Statewide Citizen Evidence Submissions Vault */}
        <div className="card" style={{ marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)', border: '1px solid #cbd5e1', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Camera size={20} style={{ color: '#10b981' }} />
                {isTA ? 'மாநில சான்றுகள் பெட்டகம் & புகைப்பட பதிவுகள்' : 'STATEWIDE CITIZEN EVIDENCE VAULT & SUBMISSIONS'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
                {isTA ? 'பொதுமக்களால் பதிவேற்றப்பட்ட புகைப்படங்கள், GPS எல்லைக் கட்டுப்பாடு மற்றும் SHA-256 தணிக்கைக் குறியீடுகள்.' : 'Centralized repository of citizen-uploaded ground proofs, GPS geofencing, and SHA-256 digital cryptographic hash seals.'}
              </p>
            </div>

            <Link to="/admin/audit" className="btn-outline" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8', borderColor: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', gap: '0.35rem' }}>
              <ShieldCheck size={14} /> {isTA ? 'தணிக்கை பதிவு காண்க' : 'Full Audit Trail'}
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>{isTA ? 'சான்று எண் / நேரம்' : 'Evidence ID / Timestamp'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'சான்றளிப்பவர்' : 'Citizen Initiator'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'திட்டம் & மாவட்டம்' : 'Project & Location'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'SHA-256 தணிக்கைக் குறியீடு' : 'SHA-256 Hash Seal'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'AI / EXIF நிலை' : 'EXIF & AI Verdict'}</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>{isTA ? 'ஆய்வு' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 'EV-TN-8812',
                    citizen: isTA ? 'பொதுமக்கள் #C-104 (Aadhar Verified)' : 'Citizen #C-104 (Aadhar Verified)',
                    project: isTA ? 'சென்னை மெட்ரோ 2-ஆம் கட்ட பாதை' : 'Chennai Metro Phase 2 Elevated Corridor',
                    district: 'Chennai, TN',
                    hash: 'a1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdef',
                    exif: 'EXIF_GPS_PASS',
                    verdict: 'POTENTIAL_MISMATCH',
                    time: '2026-09-07 11:20 AM',
                    projId: 'proj-demo-1',
                  },
                  {
                    id: 'EV-TN-8813',
                    citizen: isTA ? 'பொதுமக்கள் #C-108 (Mobile Verified)' : 'Citizen #C-108 (Mobile Verified)',
                    project: isTA ? 'மதுரை ஸ்மார்ட் குடிநீர் திட்டம்' : 'Madurai Smart Water Supply Pipeline',
                    district: 'Madurai, TN',
                    hash: 'b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1',
                    exif: 'EXIF_GPS_PASS',
                    verdict: 'NEEDS_REVIEW',
                    time: '2026-09-07 10:45 AM',
                    projId: 'proj-demo-2',
                  },
                  {
                    id: 'EV-TN-8814',
                    citizen: isTA ? 'பொதுமக்கள் #C-212 (Aadhar Verified)' : 'Citizen #C-212 (Aadhar Verified)',
                    project: isTA ? 'கோவை சூரிய மின் நிலைய திட்டம்' : 'Coimbatore Solar Power Substation',
                    district: 'Coimbatore, TN',
                    hash: 'c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2',
                    exif: 'EXIF_GPS_PASS',
                    verdict: 'CONSISTENT',
                    time: '2026-09-07 09:15 AM',
                    projId: 'proj-demo-3',
                  },
                  {
                    id: 'EV-TN-8815',
                    citizen: isTA ? 'பொதுமக்கள் #C-305 (Mobile Verified)' : 'Citizen #C-305 (Mobile Verified)',
                    project: isTA ? 'சேலம் உயர்த்தப்பட்ட மேம்பாலம்' : 'Salem Four-Lane Elevated Flyover',
                    district: 'Salem, TN',
                    hash: 'd4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3',
                    exif: 'EXIF_GPS_PASS',
                    verdict: 'POTENTIAL_MISMATCH',
                    time: '2026-09-07 08:30 AM',
                    projId: 'proj-demo-5',
                  },
                ].map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                      <div>{row.id}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>{row.time}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>{row.citizen}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.project}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{row.district}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        {row.hash.substring(0, 12)}...
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {row.verdict === 'POTENTIAL_MISMATCH' && <span className="badge badge-mismatch">🔴 MISMATCH</span>}
                      {row.verdict === 'NEEDS_REVIEW' && <span className="badge badge-review">🟡 REVIEW</span>}
                      {row.verdict === 'CONSISTENT' && <span className="badge badge-consistent">🟢 CONSISTENT</span>}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <Link to={`/authority/projects/${row.projId}`} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', gap: '0.3rem', display: 'inline-flex', alignItems: 'center' }}>
                        <Eye size={13} /> {isTA ? 'பார்' : 'Inspect'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cryptographic Audit Logs Section */}
        <div className="card" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} style={{ color: '#2563eb' }} /> {isTA ? 'மாநில பாதுகாப்புத் தணிக்கைப் பதிவேடு' : 'State Cryptographic Audit Trail (Tamper-Evident Log)'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {isTA ? 'அனைத்து அமைப்பு நிகழ்வுகள் மற்றும் பயனர் அங்கீகாரங்களின் மாற்ற முடியாத தணிக்கைப் பதிவு.' : 'Immutable audit sequence capturing system events, authentication, and file digest verifications.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text"
                  placeholder={isTA ? "பதிவுகளைத் தேடுக..." : "Filter logs by action, user..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    paddingLeft: '2.25rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.45rem',
                    paddingBottom: '0.45rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    width: '240px'
                  }}
                />
              </div>

              <button className="btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', gap: '0.4rem', display: 'inline-flex', alignItems: 'center' }}>
                <Download size={14} /> {isTA ? 'பதிவிறக்கு CSV' : 'Export CSV'}
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'பதிவு எண் / நேரம்' : 'Log ID / Time'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'செயல்பாடு' : 'Action Event'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'பயனர்' : 'Initiator / User'}</th>
                  <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'விவரங்கள்' : 'Audit Details'}</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>{isTA ? 'நிலை' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.timestamp}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#1e40af', fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>{log.user}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{log.details}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span className="badge badge-consistent" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '0.2rem' }} /> {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
