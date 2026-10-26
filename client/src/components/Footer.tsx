import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileText,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  PhoneCall,
  Award,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { TnEmblem } from './TnEmblem';

export const Footer: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  return (
    <footer
      style={{
        backgroundColor: '#001a33',
        color: '#e2e8f0',
        borderTop: '4px solid #f59e0b',
        position: 'relative',
        fontSize: '0.88rem',
      }}
    >
      {/* Tricolor Accent Line */}
      <div style={{ height: '3px', width: '100%', display: 'flex' }}>
        <div style={{ flex: 1, backgroundColor: '#FF9933' }}></div>
        <div style={{ flex: 1, backgroundColor: '#FFFFFF' }}></div>
        <div style={{ flex: 1, backgroundColor: '#138808' }}></div>
      </div>

      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem' }}>
        {/* Top Header Banner in Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Official Emblem & State Dept Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TnEmblem size={52} variant="seal" />
            <div>
              <div style={{ color: '#fbbf24', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.02em' }}>
                {isTA ? 'தமிழ்நாடு அரசு • வாய்மையே வெல்லும்' : 'GOVERNMENT OF TAMIL NADU • TRUTH ALONE TRIUMPHS'}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                {isTA
                  ? 'ஊரக வளர்ச்சி, ஊராட்சி மற்றும் பொதுப்பணித் துறை'
                  : 'Department of Rural Development, Panchayat Raj & Public Works'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.76rem', marginTop: '2px' }}>
                {isTA
                  ? 'தமிழ்நாடு மின் ஆளுமை முகமை (TNeGA) ஒருங்கிணைப்பு'
                  : 'Integrated with Tamil Nadu e-Governance Agency (TNeGA)'}
              </div>
            </div>
          </div>

          {/* Official Helpline Direct Contacts */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PhoneCall size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                {isTA ? 'அரசு உதவி மையங்கள்' : 'State Toll-Free Helplines'}
              </div>
              <div style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: 900 }}>
                CM Helpline: 1100 • PWD: 1800-425-1000
              </div>
            </div>
          </div>
        </div>

        {/* 4 Columns Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: Platform Overview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Logo size={36} showText={false} theme="dark" />
              <div>
                <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#ffffff' }}>
                  MAKKAL<span style={{ color: '#10b981' }}>SAANTRU</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                  மக்கள்சான்று தளம்
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1rem' }}>
              {isTA
                ? 'தமிழ்நாட்டில் பொது உள்கட்டமைப்பு திட்டங்களில் நிதி வீணாவதைத் தடுத்து, பொதுமக்கள் மற்றும் பொறியாளர்கள் கள சான்றுகளுடன் வெளிப்படைத்தன்மையை உறுதிசெய்யும் அரசு தளம்.'
                : 'State-wide citizen infrastructure oversight portal ensuring zero fund disbursement without verifiable ground photography, GPS telemetry, and official engineer sign-offs.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
              <CheckCircle2 size={15} />
              <span>{isTA ? '100% பாதுகாப்பான தணிக்கை' : '100% Cryptographically Audited'}</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isTA ? 'பொதுமக்கள் சேவைகள்' : 'Citizen Portals'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'முகப்புத் தளம்' : 'Home Portal'}
                </Link>
              </li>
              <li>
                <Link to="/citizen" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'பொதுமக்கள் சான்றளிப்பு' : 'Public Works Verification'}
                </Link>
              </li>
              <li>
                <Link to="/citizen/report" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'களப் புகாரளிப்பு (GPS புகைப்படம்)' : 'Report Civic Grievance'}
                </Link>
              </li>
              <li>
                <Link to="/authority/civic-map" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ChevronRight size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'நேரடி புவிசார் வரைபடம்' : 'Live Civic GIS Map'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Compliance & RTI */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isTA ? 'அரசு விதிமுறைகள் & தகவல் அறியும் உரிமை' : 'Governance & Compliance'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} style={{ color: '#38bdf8' }} /> {isTA ? 'தகவல் அறியும் உரிமைச் சட்டம் 2005' : 'Right to Information (RTI Act 2005)'}
                </span>
              </li>
              <li>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Lock size={14} style={{ color: '#10b981' }} /> {isTA ? 'SHA-256 கிரிப்டோ பாதுகாப்பு' : 'SHA-256 Tamper-Proof Cryptography'}
                </span>
              </li>
              <li>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={14} style={{ color: '#fbbf24' }} /> {isTA ? 'CERT-In பாதுகாப்பு தணிக்கை பெற்றது' : 'CERT-In Empanelled Security Cleared'}
                </span>
              </li>
              <li>
                <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={14} style={{ color: '#f59e0b' }} /> {isTA ? 'தேசிய e-Gov தரநிலைகள் (GIGW 3.0)' : 'GIGW 3.0 & e-Governance Standards'}
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Official State & National Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isTA ? 'அரசு அதிகாரப்பூர்வ தளங்கள்' : 'Official Government Portals'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <a href="https://tn.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{isTA ? 'தமிழ்நாடு அரசு தளம்' : 'Tamil Nadu Government Portal'}</span>
                  <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
              <li>
                <a href="https://tnega.tn.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{isTA ? 'தமிழ்நாடு மின் ஆளுமை முகமை (TNeGA)' : 'TN e-Governance Agency'}</span>
                  <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{isTA ? 'இந்திய தேசிய இணையதளம்' : 'National Portal of India'}</span>
                  <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
              <li>
                <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{isTA ? 'டிஜிட்டல் இந்தியா இயக்கம்' : 'Digital India Initiative'}</span>
                  <ExternalLink size={12} style={{ color: '#94a3b8' }} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & National Informatics Centre Attribution Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '2rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <div style={{ color: '#e2e8f0', fontWeight: 600 }}>
            {isTA
              ? '© 2026 தமிழ்நாடு அரசு • மக்கள்சான்று பொதுப்பணிகள் களச் சான்றளிப்பு மற்றும் உள்கட்டமைப்பு வெளிப்படைத்தன்மை தளம்.'
              : '© 2026 Government of Tamil Nadu • MAKKALSAANTRU Public Works Proof & Infrastructure Transparency Portal.'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.76rem', maxWidth: '820px' }}>
            {isTA
              ? 'இத்தளம் தமிழ்நாடு மின் ஆளுமை முகமை (TNeGA) மற்றும் தேசிய தகவலியல் மையம் (NIC) வழிகாட்டுதலின் கீழ் பொதுமக்களின் வரிப்பணத்தை பாதுகாக்கும் நோக்கத்துடன் வடிவமைக்கப்பட்டது. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
              : 'Designed, Developed and Hosted for Tamil Nadu e-Governance Agency (TNeGA), Government of Tamil Nadu. Adheres to Guidelines for Indian Government Websites (GIGW 3.0) and CERT-In security protocols.'}
          </div>
        </div>
      </div>
    </footer>
  );
};
