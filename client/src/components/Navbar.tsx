import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, LogOut, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';

import { TnEmblem } from './TnEmblem';

interface NavbarProps {
  userRole?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout }) => {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  return (
    <>
      {/* TOP OFFICIAL TAMIL NADU GOVT UTILITY BAR */}
      <div className="gov-top-bar">
        <div className="container gov-top-container">
          <div className="gov-emblem-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', flexShrink: 0 }}>
            <TnEmblem size={24} />
            <span style={{ color: '#fbbf24', fontWeight: 800 }}>தமிழ்நாடு அரசு</span>
            <span style={{ color: '#475569' }}>|</span>
            <span style={{ color: '#f8fafc', fontWeight: 700, letterSpacing: '0.03em' }}>GOVERNMENT OF TAMIL NADU</span>
          </div>

          {/* RUNNING LIVE TICKER MARQUEE */}
          <div className="running-ticker-container">
            <span className="running-ticker-badge" style={{ backgroundColor: '#dc2626' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'inline-block' }}></span>
              {language === 'TA' ? 'நேரலை அறிவிப்புகள்' : 'LIVE TICKER'}
            </span>
            <div className="running-ticker-wrapper">
              <div className="running-ticker-track" style={{ color: '#93c5fd', fontSize: '0.78rem', fontWeight: 600 }}>
                <span style={{ marginRight: '3rem' }}>
                  📢 <strong>{language === 'TA' ? 'அறிவிப்பு:' : 'ANNOUNCEMENT:'}</strong> {language === 'TA' ? 'தமிழ்நாட்டின் 38 மாவட்டங்களில் பொதுப் பணித் திட்டங்களின் கள ஆய்வு நேரலையில் உள்ளது.' : '38 Districts Live GIS & Cryptographic Infrastructure Audit active across Tamil Nadu.'}
                </span>
                <span style={{ marginRight: '3rem', color: '#fef08a' }}>
                  ⚡ <strong>{language === 'TA' ? 'சமீபத்திய சான்று:' : 'LATEST PROOF:'}</strong> {language === 'TA' ? 'சென்னை மெட்ரோ 2-ஆம் கட்ட பணி சான்றுகள் SHA-256 முறையில் பிளாக்செயினில் பதிவேற்றப்பட்டன.' : 'Chennai Metro Phase 2 evidence cryptographically verified via SHA-256 trust chain.'}
                </span>
                <span style={{ marginRight: '3rem', color: '#86efac' }}>
                  🛡️ <strong>{language === 'TA' ? 'பாதுகாப்பு பூட்டு:' : 'GEOFENCE GUARD:'}</strong> {language === 'TA' ? 'அனைத்து புகைப்பட ஆதாரங்களும் EXIF மற்றும் GPS எல்லைக் கட்டுப்பாட்டுடன் சரிபார்க்கப்படுகின்றன.' : '100% geotagged GPS & anti-tamper verification active for citizen submissions.'}
                </span>
              </div>
            </div>
          </div>

          <div className="gov-utility-links">
            <button
              type="button"
              onClick={toggleLanguage}
              className="gov-util-item"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                color: '#fbbf24',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Globe size={13} style={{ color: '#38bdf8' }} /> {language === 'TA' ? 'English' : 'தமிழ்'} ({language})
            </button>
          </div>
        </div>
      </div>

      {/* TAMIL NADU GOVT OFFICIAL HEADER */}
      <header className="header-nav">
        <div className="container nav-container">
          {/* Logo Cluster with Official Emblem */}
          <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Logo size={42} showText={false} theme="dark" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  <span style={{ color: '#ffffff' }}>MAKKAL</span>
                  <span style={{ color: '#00E676' }}>SAANTRU</span>
                </div>
                <span className="brand-subtitle" style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>
                  {language === 'TA' ? 'மக்கள் சான்று • பொதுப்பணிகள் களச் சான்றளிப்பு' : 'PUBLIC WORKS PROOF PORTAL'}
                </span>
              </div>
            </div>
          </Link>

          <nav className="nav-links">
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              {language === 'TA' ? 'முகப்பு' : 'Home'}
            </Link>
            <Link to="/citizen" className={`nav-item ${location.pathname === '/citizen' ? 'active' : ''}`}>
              {language === 'TA' ? 'பொதுமக்கள் தளம்' : 'Citizen Workspace'}
            </Link>
            <Link to="/contractor" className={`nav-item ${location.pathname.startsWith('/contractor') ? 'active' : ''}`} style={{ color: '#f97316', fontWeight: 800 }}>
              {language === 'TA' ? 'ஒப்பந்ததாரர் தளம்' : 'Contractor'}
            </Link>
            <Link to="/citizen/report" className={`nav-item ${location.pathname === '/citizen/report' ? 'active' : ''}`} style={{ color: '#fbbf24', fontWeight: 800 }}>
              {language === 'TA' ? 'புகாரளிக்கவும்' : 'Report Civic Issue'}
            </Link>
            <Link to="/citizen/reports" className={`nav-item ${location.pathname === '/citizen/reports' ? 'active' : ''}`}>
              {language === 'TA' ? 'என் புகார்கள்' : 'My Reports'}
            </Link>
            <Link to="/authority" className={`nav-item ${location.pathname === '/authority' ? 'active' : ''}`}>
              {language === 'TA' ? 'அதிகாரிகள் தளம்' : 'Authority'}
            </Link>
            <Link to="/authority/civic-map" className={`nav-item ${location.pathname === '/authority/civic-map' ? 'active' : ''}`} style={{ color: '#38bdf8', fontWeight: 800 }}>
              {language === 'TA' ? 'அமைவிட வரைபடம்' : 'Civic Map'}
            </Link>
            <Link to="/authority/inspection-routes" className={`nav-item ${location.pathname.startsWith('/authority/inspection-routes') || location.pathname === '/authority/my-routes' ? 'active' : ''}`} style={{ color: '#a7f3d0', fontWeight: 800 }}>
              {language === 'TA' ? 'ஆய்வுப் பாதைகள்' : 'Inspection Routes'}
            </Link>
            <Link to="/admin" className={`nav-item ${location.pathname.startsWith('/admin') && !location.pathname.includes('security') ? 'active' : ''}`}>
              {language === 'TA' ? 'நிர்வாகம்' : 'Admin'}
            </Link>

            {userRole ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <span className="badge badge-verified" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {userRole}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.3rem', borderColor: '#cbd5e1' }}
                >
                  <LogOut size={14} /> {language === 'TA' ? 'வெளியேறு' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem', height: '2.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: '#0a3a60', borderColor: 'rgba(251, 191, 36, 0.4)', padding: '0 1.1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                <UserCheck size={15} style={{ color: '#fbbf24' }} /> {language === 'TA' ? 'உள்நுழைக' : 'Sign In'}
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};
