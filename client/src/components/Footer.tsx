import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, ExternalLink, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { TnEmblem } from './TnEmblem';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  return (
    <footer className="footer">
      <div className="container">
        {/* Top Tamil Nadu Government Emblem Banner */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '2rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <TnEmblem size={38} />
            <div>
              <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                {isTA ? 'தமிழ்நாடு அரசு • வாய்மையே வெல்லும்' : 'GOVERNMENT OF TAMIL NADU • TRUTH ALONE TRIUMPHS'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                {isTA ? 'தகவல் தொழில்நுட்பம் மற்றும் மின் ஆளுமைத் துறை' : 'Department of Information Technology & Digital Services'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Col 1: Platform Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Logo size={40} showText={false} theme="dark" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.1 }}>
                  <span style={{ color: '#ffffff' }}>MAKKAL</span>
                  <span style={{ color: '#00E676' }}>SAANTRU</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginTop: '2px' }}>
                  {isTA ? 'மக்கள் சான்று • களச் சான்றளிப்பு' : 'PUBLIC WORKS PROOF PORTAL'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              {isTA ? (
                <>
                  <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>மக்களின் பணம். மக்களின் பணி. மக்களின் சான்று.</strong>
                  பொதுப்பணித் திட்டங்களில் வெளிப்படைத்தன்மையை உறுதிசெய்யும் அரசு சார்ந்த நேரடி களச் சான்றளிப்பு தளம்.
                </>
              ) : (
                <>
                  <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.25rem' }}>Public Money. Public Work. Public Proof.</strong>
                  Citizen-powered, AI-assisted public infrastructure verification platform built for Tamil Nadu e-Governance.
                </>
              )}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4>{isTA ? 'விரைவு வழிகாட்டி' : 'Quick Navigation'}</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/" style={{ gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'முகப்புத் தளம்' : 'Home Portal'}
                </Link>
              </li>
              <li>
                <Link to="/citizen" style={{ gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'பொதுமக்கள் சான்றளிப்பு தளம்' : 'Citizen Verification Workspace'}
                </Link>
              </li>
              <li>
                <Link to="/authority" style={{ gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'அதிகாரிகள் கள ஆய்வுக் கூடம்' : 'Authority Inspection Dashboard'}
                </Link>
              </li>
              <li>
                <Link to="/admin/security" style={{ gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'பாதுகாப்பு & தணிக்கை மையம்' : 'Security & Audit Center'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div>
            <h4>{isTA ? 'பாதுகாப்பு & கணக்குத் தணிக்கை' : 'Cybersecurity & Audit'}</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/admin/security" style={{ gap: '0.4rem' }}>
                  <Lock size={14} style={{ color: '#38bdf8' }} /> {isTA ? 'SHA-256 சான்று குறியாக்கம்' : 'SHA-256 Evidence Hashing'}
                </Link>
              </li>
              <li>
                <Link to="/admin/security" style={{ gap: '0.4rem' }}>
                  <ShieldCheck size={14} style={{ color: '#10b981' }} /> {isTA ? 'மேஜிக்-பைட் இருமப் பாதுகாப்பு' : 'Magic-Byte Binary Defense'}
                </Link>
              </li>
              <li>
                <Link to="/admin/security" style={{ gap: '0.4rem' }}>
                  <FileText size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'மாற்ற முடியாத தணிக்கைப் பதிவேடு' : 'Chained Tamper-Evident Logs'}
                </Link>
              </li>
              <li>
                <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} style={{ color: '#10b981' }} /> {isTA ? 'API தரவு பாதுகாப்பு இயங்குகிறது' : 'API Rate Limiting Active ✓'}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: National Portal Links */}
          <div>
            <h4>{isTA ? 'அரசு இணையதளங்கள்' : 'Government Portals'}</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <a href="https://tn.gov.in" target="_blank" rel="noopener noreferrer" style={{ gap: '0.35rem' }}>
                  {isTA ? 'தமிழ்நாடு அரசு போர்ட்டல்' : 'TN Govt Official Portal'} <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
              <li>
                <a href="https://tnega.tn.gov.in" target="_blank" rel="noopener noreferrer" style={{ gap: '0.35rem' }}>
                  {isTA ? 'தமிழ்நாடு மின் ஆளுமை முகமை (TNeGA)' : 'TN e-Governance Agency'} <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" style={{ gap: '0.35rem' }}>
                  {isTA ? 'இந்திய தேசிய போர்ட்டல்' : 'National Portal of India'} <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
              <li>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" style={{ gap: '0.35rem' }}>
                  {isTA ? 'டிஜிட்டல் இந்தியா திட்டம்' : 'Digital India Portal'} <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.75rem', textAlign: 'center', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
          <div>
            {isTA 
              ? '© 2026 தமிழ்நாடு அரசு • மக்கள் சான்று பொதுப்பணிகள் களச் சான்றளிப்புத் தளம்' 
              : '© 2026 Government of Tamil Nadu • MAKKALSAANTRU Public Works Proof Portal'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
            {isTA 
              ? 'தமிழ்நாடு மின் ஆளுமை முகமை (TNeGA) மூலம் உருவாக்கப்பட்டது' 
              : 'Developed for Tamil Nadu e-Governance Agency (TNeGA)'}
          </div>
        </div>
      </div>
    </footer>
  );
};
