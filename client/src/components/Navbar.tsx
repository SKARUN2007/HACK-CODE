import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  LogOut,
  Globe,
  Sun,
  Moon,
  Eye,
  Menu,
  X,
  PhoneCall,
  PlusCircle,
  Clock,
  Radio,
  FileText,
  Search,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { TnEmblem } from './TnEmblem';

interface NavbarProps {
  userRole?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout }) => {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme, simpleMode, toggleSimpleMode, increaseFontSize, decreaseFontSize } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isTA = language === 'TA';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0, 43, 73, 0.25)' }}>
      {/* =========================================================================
          TIER 1: OFFICIAL INDIAN GOVT & STATE ACCESSIBILITY TOP RIBBON
          ========================================================================= */}
      <div style={{ position: 'relative' }}>
        {/* National Tricolor Line */}
        <div style={{ height: '4px', width: '100%', display: 'flex' }}>
          <div style={{ flex: 1, backgroundColor: '#FF9933' }}></div>
          <div style={{ flex: 1, backgroundColor: '#FFFFFF' }}></div>
          <div style={{ flex: 1, backgroundColor: '#138808' }}></div>
        </div>

        {/* Top Dark Navy Utility Bar */}
        <div
          style={{
            backgroundColor: '#001a33',
            color: '#e2e8f0',
            padding: '0.35rem 0',
            fontSize: '0.78rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {/* Left: Official State Masthead */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <TnEmblem size={22} variant="seal" />
              <span style={{ color: '#fbbf24', fontWeight: 800, letterSpacing: '0.02em' }}>தமிழ்நாடு அரசு</span>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#f8fafc', fontWeight: 700 }}>GOVERNMENT OF TAMIL NADU</span>
              <span style={{ color: '#475569' }}>•</span>
              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.74rem' }}>
                {isTA ? 'வாய்மையே வெல்லும்' : 'Satyameva Jayate (Truth Alone Triumphs)'}
              </span>
            </div>

            {/* Right: Accessibility Controls & Language Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Skip to Content */}
              <a
                href="#main-content"
                style={{
                  color: '#94a3b8',
                  fontSize: '0.72rem',
                  textDecoration: 'none',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '3px',
                }}
                className="gov-skip-link"
              >
                {isTA ? 'முக்கிய பகுதிக்குச் செல்க' : 'Skip to Content'}
              </a>

              <span style={{ color: '#334155' }}>|</span>

              {/* Simple Mode Toggle */}
              <button
                type="button"
                onClick={toggleSimpleMode}
                title="Toggle Senior / High-Contrast Mode"
                style={{
                  backgroundColor: simpleMode ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)',
                  color: simpleMode ? '#001a33' : '#f8fafc',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                <Eye size={12} /> {simpleMode ? 'High-Contrast ON' : 'High Contrast'}
              </button>

              {/* Font Sizing Controls */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  padding: '0.1rem 0.35rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <button
                  type="button"
                  onClick={decreaseFontSize}
                  title="Decrease Text Size"
                  style={{ color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 800, padding: '0 0.25rem', cursor: 'pointer' }}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={increaseFontSize}
                  title="Increase Text Size"
                  style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 800, padding: '0 0.25rem', cursor: 'pointer' }}
                >
                  A+
                </button>
              </div>

              {/* Dark/Light Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: theme === 'dark' ? '#fbbf24' : '#38bdf8',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                }}
              >
                {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                style={{
                  backgroundColor: '#0a3a60',
                  color: '#ffffff',
                  border: '1px solid rgba(251, 191, 36, 0.6)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              >
                <Globe size={13} style={{ color: '#38bdf8' }} />
                <span>{isTA ? 'English' : 'தமிழ்'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: OFFICIAL WHITE STATE BRANDING HEADER WITH DUAL LOGOS & HELPLINE
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Main Brand with Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo
              size={54}
              theme="light"
              subtext={
                isTA
                  ? 'பொதுப்பணி & உள்கட்டமைப்பு வெளிப்படைத்தன்மை தளம் • தமிழ்நாடு அரசு'
                  : 'Public Works & Civic Infrastructure Oversight Portal • Govt of Tamil Nadu'
              }
            />
          </Link>

          {/* Right Header Widget: Clock + Toll-Free Helpline + Report Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Live Timestamp & Verification Status */}
            <div
              style={{
                display: 'none',
                flexDirection: 'column',
                alignItems: 'flex-end',
                fontSize: '0.75rem',
                color: '#64748b',
                lineHeight: 1.3,
              }}
              className="gov-desktop-clock"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a' }}>
                <Clock size={12} style={{ color: '#2563eb' }} />
                <span>
                  {currentTime.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  • {currentTime.toLocaleTimeString('en-IN')}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                ● {isTA ? 'TNeGA GIS நேரலையில் உள்ளது' : 'TNeGA GIS Engine Active'}
              </span>
            </div>

            {/* CM Helpline Toll Free */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.45rem 0.95rem',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#b91c1c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(185, 28, 28, 0.3)',
                  flexShrink: 0,
                }}
              >
                <PhoneCall size={17} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                  {isTA ? 'முதலமைச்சர் உதவி மையம்' : 'Citizen Toll-Free'}
                </span>
                <span style={{ fontSize: '0.98rem', color: '#0f172a', fontWeight: 900, letterSpacing: '0.02em' }}>
                  1100 / 1800-425-1000
                </span>
              </div>
            </div>

            {/* Quick Report Issue Button */}
            <Link
              to="/citizen/report"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <PlusCircle size={17} />
              <span>{isTA ? '+ களப் புகாரளிப்பு' : '+ Report Civic Issue'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 3: OFFICIAL DEEP ROYAL NAVY BLUE NAVIGATION BAR WITH SAFFRON ACCENT
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#002B49',
          borderBottom: '3px solid #f59e0b',
          boxShadow: '0 4px 15px rgba(0, 43, 73, 0.35)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '3.4rem',
          }}
        >
          {/* Mobile Menu Button */}
          <div className="mobile-nav-toggle" style={{ display: 'none' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#ffffff', padding: '0.4rem', cursor: 'pointer' }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className="nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/"
              className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
              style={{
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '0.5rem 0.95rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>🏛️</span>
              <span>{isTA ? 'முகப்பு' : 'Home'}</span>
            </Link>

            <Link
              to="/citizen"
              className={`nav-item ${location.pathname === '/citizen' ? 'active' : ''}`}
              style={{
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '0.5rem 0.95rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>👥</span>
              <span>{isTA ? 'பொதுமக்கள் தளம்' : 'Citizen Portal'}</span>
            </Link>

            <Link
              to="/citizen/report"
              className={`nav-item ${location.pathname === '/citizen/report' ? 'active' : ''}`}
              style={{
                color: '#fef08a',
                fontSize: '0.88rem',
                fontWeight: 800,
                padding: '0.5rem 0.95rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>📍</span>
              <span>{isTA ? 'களப் புகார்' : 'Report Issue'}</span>
            </Link>

            <Link
              to="/contractor"
              className={`nav-item ${location.pathname.startsWith('/contractor') ? 'active' : ''}`}
              style={{
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '0.5rem 0.95rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>👷</span>
              <span>{isTA ? 'ஒப்பந்ததாரர் தளம்' : 'Contractor Portal'}</span>
            </Link>

            <Link
              to="/authority/civic-map"
              className={`nav-item ${location.pathname === '/authority/civic-map' ? 'active' : ''}`}
              style={{
                color: '#38bdf8',
                fontSize: '0.88rem',
                fontWeight: 700,
                padding: '0.5rem 0.95rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>🗺️</span>
              <span>{isTA ? 'புவிசார் வரைபடம்' : 'Civic GIS Map'}</span>
            </Link>

            {(userRole === 'INSPECTOR' || userRole === 'ADMIN') && (
              <Link
                to="/authority"
                className={`nav-item ${location.pathname === '/authority' ? 'active' : ''}`}
                style={{
                  color: '#a7f3d0',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  padding: '0.5rem 0.95rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>🛡️</span>
                <span>{isTA ? 'அதிகாரிகள் தளம்' : 'Authority Suite'}</span>
              </Link>
            )}

            {userRole === 'ADMIN' && (
              <Link
                to="/admin"
                className={`nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                style={{
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  padding: '0.5rem 0.95rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>⚙️</span>
                <span>{isTA ? 'நிர்வாகம்' : 'Admin'}</span>
              </Link>
            )}
          </nav>

          {/* Right: Official Authentication / Role Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {userRole ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  {userRole}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  style={{
                    color: '#e2e8f0',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <LogOut size={14} /> {isTA ? 'வெளியேறு' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                style={{
                  textDecoration: 'none',
                  backgroundColor: '#f59e0b',
                  color: '#002B49',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                }}
              >
                <UserCheck size={16} />
                <span>{isTA ? 'அரசு உள்நுழைவு' : 'Official Login'}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#001a33',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.4rem', fontWeight: 700 }}>
              🏛️ {isTA ? 'முகப்பு' : 'Home'}
            </Link>
            <Link to="/citizen" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.4rem', fontWeight: 700 }}>
              👥 {isTA ? 'பொதுமக்கள் தளம்' : 'Citizen Portal'}
            </Link>
            <Link to="/citizen/report" onClick={() => setMobileMenuOpen(false)} style={{ color: '#fbbf24', padding: '0.4rem', fontWeight: 800 }}>
              📍 {isTA ? 'களப் புகார்' : 'Report Civic Issue'}
            </Link>
            <Link to="/contractor" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', padding: '0.4rem', fontWeight: 700 }}>
              👷 {isTA ? 'ஒப்பந்ததாரர் தளம்' : 'Contractor Portal'}
            </Link>
            <Link to="/authority/civic-map" onClick={() => setMobileMenuOpen(false)} style={{ color: '#38bdf8', padding: '0.4rem', fontWeight: 700 }}>
              🗺️ {isTA ? 'புவிசார் வரைபடம்' : 'Civic GIS Map'}
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: '#f59e0b', padding: '0.4rem', fontWeight: 800 }}>
              🔐 {isTA ? 'அரசு உள்நுழைவு' : 'Official Login'}
            </Link>
          </div>
        )}
      </div>

      {/* =========================================================================
          TIER 4: OFFICIAL BREAKING ANNOUNCEMENT TICKER (MARQUEE)
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          fontSize: '0.8rem',
          fontWeight: 700,
          borderBottom: '1px solid #fde68a',
          padding: '0.35rem 0',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
          <span
            style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {isTA ? 'நேரலை அறிவிப்பு' : 'OFFICIAL NOTICE'}
          </span>
          <div
            style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#78350f',
            }}
          >
            {isTA
              ? '🔔 தமிழ்நாடு முழுவதும் 38 மாவட்டங்களில் பொது உள்கட்டமைப்பு பணிகளுக்கான நேரடி கள சான்றளிப்பு முறை துவக்கம் • புகைப்பட ஆதாரங்கள் இல்லாமல் ஒப்பந்ததாரர் கட்டணங்கள் விடுவிக்கப்படாது • Citizen Ground Proof Mandatory Before Fund Disbursement.'
              : '🔔 Mandatory On-Site Ground Verification active across 38 Districts in Tamil Nadu • Contractor stage fund disbursement locked until citizen & PWD engineer verification is corroborated.'}
          </div>
        </div>
      </div>
    </header>
  );
};
