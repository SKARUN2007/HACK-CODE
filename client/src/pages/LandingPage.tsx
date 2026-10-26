import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Camera,
  UserCheck,
  ArrowRight,
  MapPin,
  Droplet,
  Trash2,
  School,
  Lightbulb,
  Award,
  Activity,
  HardHat,
  Sparkles,
  Lock,
  PhoneCall,
  Search,
  FileCheck,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TnEmblem } from '../components/TnEmblem';

export const LandingPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', minHeight: '100vh' }} id="main-content">
      {/* =========================================================================
          HERO SECTION: OFFICIAL TAMIL NADU INFRASTRUCTURE TRANSPARENCY
          ========================================================================= */}
      <section
        style={{
          background: 'linear-gradient(180deg, #001a33 0%, #002B49 45%, #053b64 100%)',
          color: '#ffffff',
          padding: '3.5rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '4px solid #f59e0b',
        }}
      >
        {/* Subtle Geometric Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 40%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '3.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Hero Text, Official Mandate & Primary CTAs */}
            <div>
              {/* Official State Initiative Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.45rem 1.15rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1.5px solid #f59e0b',
                  borderRadius: '9999px',
                  color: '#fbbf24',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  marginBottom: '1.5rem',
                  backdropFilter: 'blur(12px)',
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <TnEmblem size={24} variant="seal" />
                <span>
                  {isTA
                    ? 'தமிழ்நாடு அரசு • உள்கட்டமைப்பு வெளிப்படைத்தன்மை தளம்'
                    : 'GOVERNMENT OF TAMIL NADU • CIVIC INFRASTRUCTURE TRANSPARENCY'}
                </span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.12,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.03em',
                  fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
                }}
              >
                {isTA ? 'பொது நிதி. பொதுப்பணி.' : 'Public Money. Public Work.'} <br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #fbbf24 0%, #34d399 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  {isTA ? 'மக்கள் சான்று.' : 'Public Proof.'}
                </span>
              </h1>

              {/* Subtitle / Official Mandate */}
              <p
                style={{
                  color: '#cbd5e1',
                  fontSize: '1.12rem',
                  lineHeight: 1.65,
                  marginBottom: '2.25rem',
                  maxWidth: '620px',
                }}
              >
                {isTA
                  ? 'தமிழ்நாட்டில் நடைபெறும் ஒவ்வொரு பொதுப்பணிக்கும் (சாலைகள், குடிநீர், தெருவிளக்குகள், பள்ளிகள்) பொதுமக்கள் வழங்கும் களப் புகைப்படச் சான்றுகள் கட்டாயமாக்கப்பட்டுள்ளன. AI சரிபார்ப்பு மற்றும் அரசுப் பொறியாளர்களின் நேரடி கள ஆய்விற்குப் பின்னரே ஒப்பந்ததாரர் நிதி விடுவிக்கப்படும்.'
                  : 'Every single rupee of public money spent on roads, drinking water, streetlights, sanitation, and school infrastructure is held accountable to citizens before disbursement. Capture geotagged ground photos, verify contractor milestone claims, and ensure 100% tamper-proof public governance.'}
              </p>

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link
                  to="/citizen"
                  style={{
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#002B49',
                    padding: '0.85rem 1.85rem',
                    borderRadius: '10px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.45)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ShieldCheck size={22} />
                  <span>{isTA ? 'பொதுப்பணியைச் சரிபார்க்கவும்' : 'Verify a Public Work'}</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/citizen/report"
                  style={{
                    textDecoration: 'none',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(251, 191, 36, 0.5)',
                    color: '#fef08a',
                    padding: '0.85rem 1.65rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Camera size={20} style={{ color: '#fbbf24' }} />
                  <span>{isTA ? 'களப் புகாரளிப்பு' : 'Report Civic Issue'}</span>
                </Link>

                <Link
                  to="/contractor"
                  style={{
                    textDecoration: 'none',
                    background: 'rgba(16, 185, 129, 0.12)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(16, 185, 129, 0.5)',
                    color: '#6ee7b7',
                    padding: '0.85rem 1.5rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <HardHat size={20} style={{ color: '#34d399' }} />
                  <span>{isTA ? 'ஒப்பந்ததாரர் தளம்' : 'Contractor Portal'}</span>
                </Link>
              </div>

              {/* Official Trust Chips */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  <span>{isTA ? 'SHA-256 கிரிப்டோ பாதுகாப்பு' : 'SHA-256 Tamper-Proof'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} style={{ color: '#38bdf8' }} />
                  <span>{isTA ? 'EXIF & GPS புவிசார் சரிபார்ப்பு' : 'Geofenced GPS Verification'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}>
                  <CheckCircle2 size={16} style={{ color: '#fbbf24' }} />
                  <span>{isTA ? 'அரசுப் பொறியாளர் கையொப்பம்' : 'PWD Engineer Physical Sign-off'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero High-Definition Tablet Visual with Live GIS Radar */}
            <div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  padding: '12px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 100%)',
                  boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 43, 73, 0.5)',
                  border: '1.5px solid rgba(251, 191, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Live Radar Header Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 1rem',
                    backgroundColor: '#001a33',
                    borderRadius: '16px 16px 0 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        boxShadow: '0 0 10px #10b981',
                      }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
                      {isTA ? 'TNGIS செயற்கைக்கோள் வரைபடம்: நேரலை' : 'TNGIS SATELLITE RADAR: CONNECTED'}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      color: '#fbbf24',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      fontWeight: 800,
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    38 DISTRICTS
                  </span>
                </div>

                {/* Main Hero Visual Image */}
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden',
                    maxHeight: '360px',
                    backgroundColor: '#02182b',
                  }}
                >
                  <img
                    src="/gov_hero_banner.jpg"
                    alt="Tamil Nadu Infrastructure Transparency Portal - On-Site Tablet & Highway Verification"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.indexOf('hero_bg.png') === -1) {
                        target.src = '/hero_bg.png';
                      }
                    }}
                  />

                  {/* Embossed Tamil Nadu Civic Seal Watermark */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      background: 'rgba(0, 26, 51, 0.9)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px',
                      padding: '0.6rem 0.9rem',
                      border: '1px solid rgba(251, 191, 36, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}
                  >
                    <TnEmblem size={36} variant="seal" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                        {isTA ? 'அரசு தணிக்கை முத்திரை' : 'Verified State Infrastructure'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>
                        ✓ {isTA ? 'கள ஆய்வு ஒப்புதல் பெற்றது' : 'Geotagged On-Ground Audit'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          NATIONAL LIVE AUDIT METRICS RIBBON (INDIAN E-GOV DASHBOARD STRIP)
          ========================================================================= */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '2rem 0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Metric 1: Budget Monitored */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                borderLeft: '5px solid #d97706',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isTA ? 'கண்காணிக்கப்படும் நிதி' : 'Taxpayer Budget Monitored'}
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                ₹450 Cr+
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                ✓ {isTA ? 'களச் சான்றளிக்கப்பட்ட திட்டங்கள்' : 'Under Direct Citizen Oversight'}
              </div>
            </div>

            {/* Metric 2: Active Projects */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                borderLeft: '5px solid #2563eb',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isTA ? 'நேரடி உள்கட்டமைப்பு பணிகள்' : 'Active Public Works'}
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                1,280+
              </div>
              <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                • {isTA ? '38 மாவட்டங்களில் நேரலை' : 'Across 38 Tamil Nadu Districts'}
              </div>
            </div>

            {/* Metric 3: Citizen Verifications */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                borderLeft: '5px solid #16a34a',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isTA ? 'பொதுமக்கள் களச் சான்றுகள்' : 'Citizen Ground Verifications'}
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                48,920+
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                ✓ {isTA ? 'புகைப்படம் & GPS பதிவு செய்யப்பட்டது' : 'Geotagged & EXIF Validated'}
              </div>
            </div>

            {/* Metric 4: Cryptographic SHA-256 Trail */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                borderLeft: '5px solid #7c3aed',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isTA ? 'கிரிப்டோ தணிக்கைப் பாதுகாப்பு' : 'Tamper-Proof Audit Trail'}
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                100%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 700 }}>
                🔒 {isTA ? 'மாற்ற முடியாத SHA-256 லெட்ஜர்' : 'Immutable SHA-256 Records'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUR PILLARS OF CIVIC PROOF METHODOLOGY
          ========================================================================= */}
      <section style={{ padding: '5rem 0', backgroundColor: '#f1f5f9' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: '#b91c1c',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                backgroundColor: '#fee2e2',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid #fecaca',
              }}
            >
              {isTA ? 'சான்றளிக்கும் நெறிமுறை' : 'ZERO-LEAKAGE VERIFICATION PROTOCOL'}
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                color: '#0f172a',
                marginTop: '0.75rem',
                letterSpacing: '-0.02em',
              }}
            >
              {isTA
                ? 'பொதுப்பணிகள் சரிபார்ப்பு: 4-கட்ட பாதுகாப்பு முறை'
                : 'The 4 Pillars of Citizen-Driven Public Works Proof'}
            </h2>
            <p style={{ color: '#64748b', maxWidth: '680px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
              {isTA
                ? 'ஒப்பந்ததாரரின் கட்டண கோரிக்கை பொதுமக்கள் கள சான்றுகள் மற்றும் பொறியாளர் ஒப்புதலுக்கு பின்னரே இறுதி செய்யப்படும்.'
                : 'Contractor progress billing requires multi-source corroboration before public Treasury release.'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Pillar 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  border: '1px solid #bfdbfe',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {isTA ? 'களப் புகைப்பட சான்று' : 'Ground Truth Photo'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {isTA
                  ? 'பணியிடத்தில் நேரில் சென்று ஸ்மார்ட்போன் மூலம் எடுக்கப்படும் புகைப்படம். EXIF ஜிபிஎஸ் மற்றும் நேர முத்திரை நேரடியாக சரிபார்க்கப்படுகிறது.'
                  : 'Citizens and site inspectors capture real-time photos with tamper-resistant EXIF GPS coordinates and microsecond timestamps.'}
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  border: '1px solid #bbf7d0',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {isTA ? 'கிரிப்டோ முத்திரை (SHA-256)' : 'Cryptographic Hashing'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {isTA
                  ? 'பதிவேற்றப்படும் புகைப்படம் உடனடியாக மாற்ற முடியாத SHA-256 கிரிப்டோ குறியீடாக மாற்றப்பட்டு சேமிக்கப்படுகிறது.'
                  : 'Every upload is cryptographically fingerprinted with SHA-256 hashing. Once sealed, no authority or contractor can alter ground reality.'}
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  border: '1px solid #fde68a',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {isTA ? 'AI முரண்பாடு கண்டறிதல்' : 'AI Evidence Synthesis'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {isTA
                  ? 'கணினி பார்வை (Computer Vision) மூலம் ஒப்பந்ததாரர் கோரிக்கை மற்றும் கள நிலவரம் ஒப்பிடப்பட்டு முரண்பாடுகள் உடனுக்குடன் எச்சரிக்கப்படுகின்றன.'
                  : 'Vision AI automatically matches physical completion (e.g. bituminous concrete layering) against contractor claims to detect fraud.'}
              </p>
            </div>

            {/* Pillar 4 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  border: '1px solid #ddd6fe',
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {isTA ? 'அரசுப் பொறியாளர் கையொப்பம்' : 'Official Engineer Sign-off'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {isTA
                  ? 'அரசு உதவிப் பொறியாளர் நேரில் கள ஆய்வு செய்து சான்றளித்த பின்னரே கருவூலத்திலிருந்து நிதி விடுவிக்கப்படும்.'
                  : 'Official PWD / Municipal engineering authorities inspect on ground and provide digital cryptographic sign-off for fund release.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STATE DEPARTMENTS DIRECTORY (TAMIL NADU CIVIC INFRASTRUCTURE)
          ========================================================================= */}
      <section style={{ padding: '5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: '#2563eb',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {isTA ? 'தமிழ்நாடு அரசுத் துறைகள்' : 'STATE DEPARTMENTS UNDER MONITORING'}
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                color: '#0f172a',
                marginTop: '0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              {isTA ? '5 முக்கிய பொது உள்கட்டமைப்பு துறைகள்' : '5 Core Public Infrastructure Sectors'}
            </h2>
            <p style={{ color: '#64748b', maxWidth: '640px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
              {isTA
                ? 'உங்கள் பகுதியில் நடைபெற்று வரும் பணிகளைத் தேர்வு செய்து புகைப்படங்கள் மூலம் சரிபார்க்கவும்.'
                : 'Select an infrastructure department to inspect ongoing works and submit citizen ground proof.'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Department 1: Roads */}
            <Link
              to="/citizen"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.75rem 1.5rem',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isTA ? 'நெடுஞ்சாலை & சாலைகள்' : 'Roads & Highways'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                {isTA ? 'நெடுஞ்சாலைகள் மற்றும் கிராமச் சாலைகள்' : 'State Highways & Rural Roads'}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, marginTop: 'auto' }}>
                ● 1 {isTA ? 'நேரடித் திட்டம்' : 'Active Demo Project'} →
              </span>
            </Link>

            {/* Department 2: Water Works */}
            <Link
              to="/citizen"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.75rem 1.5rem',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#ecfeff',
                  color: '#0891b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Droplet size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isTA ? 'குடிநீர் & வடிகால்' : 'Drinking Water Supply'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                {isTA ? 'குழாய் பதித்தல் & மேல்நிலை தொட்டிகள்' : 'Pipelines, OHTs & Water Supply'}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, marginTop: 'auto' }}>
                ● 1 {isTA ? 'நேரடித் திட்டம்' : 'Active Demo Project'} →
              </span>
            </Link>

            {/* Department 3: Street Lighting */}
            <Link
              to="/citizen"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.75rem 1.5rem',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#fffbeb',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lightbulb size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isTA ? 'தெருவிளக்குகள் & மின்சாரம்' : 'Solar Street Lighting'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                {isTA ? 'சூரிய மின் விளக்குகள் & எல்இடி கம்பங்கள்' : 'Smart LED & Solar Highway Poles'}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, marginTop: 'auto' }}>
                ● 1 {isTA ? 'நேரடித் திட்டம்' : 'Active Demo Project'} →
              </span>
            </Link>

            {/* Department 4: Sanitation */}
            <Link
              to="/citizen"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.75rem 1.5rem',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isTA ? 'பொது சுகாதாரம்' : 'Sanitation Facilities'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                {isTA ? 'ஒருங்கிணைந்த சுகாதார வளாகங்கள்' : 'Community Toilets & Waste Plants'}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, marginTop: 'auto' }}>
                ● 1 {isTA ? 'நேரடித் திட்டம்' : 'Active Demo Project'} →
              </span>
            </Link>

            {/* Department 5: Schools & Buildings */}
            <Link
              to="/citizen"
              style={{
                textDecoration: 'none',
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '1.75rem 1.5rem',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <School size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isTA ? 'பள்ளிக் கல்வி உள்கட்டமைப்பு' : 'School Infrastructure'}
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                {isTA ? 'புதிய வகுப்பறைக் கட்டடங்கள்' : 'Smart Classrooms & School Blocks'}
              </p>
              <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, marginTop: 'auto' }}>
                ● 1 {isTA ? 'நேரடித் திட்டம்' : 'Active Demo Project'} →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ROLE-BASED WORKSPACES DIRECTORY (CITIZEN, CONTRACTOR, AUTHORITY)
          ========================================================================= */}
      <section style={{ padding: '5rem 0', backgroundColor: '#001a33', color: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: '#34d399',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {isTA ? 'பயனர் தளங்கள்' : 'ROLE-BASED GOVERNMENT WORKSPACES'}
            </span>
            <h2
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                color: '#ffffff',
                marginTop: '0.75rem',
                letterSpacing: '-0.02em',
              }}
            >
              {isTA ? 'அரசுப் பணி சரிபார்ப்பு தளங்கள்' : 'Official Oversight Workspaces'}
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '640px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
              {isTA
                ? 'பொதுமக்கள், ஒப்பந்ததாரர்கள் மற்றும் தணிக்கை அதிகாரிகளுக்கான பிரத்யேகத் தளங்கள்.'
                : 'Dedicated portals for citizens, registered contractors, and field inspection officers.'}
            </p>
          </div>

          <div className="grid-3" style={{ gap: '2rem' }}>
            {/* Citizen Portal */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '20px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <Users size={30} style={{ color: '#34d399' }} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
                {isTA ? '1. பொதுமக்கள் தளம்' : 'Citizen Verification Workspace'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                {isTA
                  ? 'உங்கள் பகுதியில் நடக்கும் அரசுப் பணிகளைக் கண்டறியுங்கள். மைல்கல் பணிகளை புகைப்படங்கள் மூலம் சரிபார்த்து ஊழலைத் தடுங்கள்.'
                  : 'Discover public works in your ward, view project milestones, upload ground photos, and directly verify or dispute progress claims.'}
              </p>
              <Link
                to="/citizen"
                style={{
                  marginTop: 'auto',
                  textDecoration: 'none',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
              >
                <span>{isTA ? 'பொதுமக்கள் தளம் செல்க' : 'Enter Citizen Portal'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Contractor Portal */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '20px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <HardHat size={30} style={{ color: '#fbbf24' }} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
                {isTA ? '2. ஒப்பந்ததாரர் தளம்' : 'Contractor Execution Portal'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                {isTA
                  ? 'ஒதுக்கப்பட்ட பணிகளுக்கான மைல்கல் புகைப்படங்கள், அளவீடுகள் மற்றும் முன்னேற்றக் கோரிக்கைகளை சமர்ப்பிக்கவும்.'
                  : 'Submit on-site photographic evidence, specify physical work claims, and track citizen verification status for milestone billing.'}
              </p>
              <Link
                to="/contractor"
                style={{
                  marginTop: 'auto',
                  textDecoration: 'none',
                  backgroundColor: '#f59e0b',
                  color: '#002B49',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                }}
              >
                <span>{isTA ? 'ஒப்பந்ததாரர் தளம் செல்க' : 'Enter Contractor Workspace'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Authority Command Suite */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '20px',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                }}
              >
                <UserCheck size={30} style={{ color: '#38bdf8' }} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>
                {isTA ? '3. அரசு அதிகாரிகள் தளம்' : 'Authority & Engineer Suite'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                {isTA
                  ? 'AI ஒப்பீடு, புவிசார் வரைபடம் மற்றும் 3-ஆதார சான்றுகளை ஆய்வு செய்து நிதி விடுவிப்பு ஒப்புதல் அளிக்கவும்.'
                  : 'Review AI vision anomaly detection, optimize inspector routing, cross-reference ground reports, and provide digital sign-off.'}
              </p>
              <Link
                to="/authority"
                style={{
                  marginTop: 'auto',
                  textDecoration: 'none',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                }}
              >
                <span>{isTA ? 'அதிகாரிகள் தளம் செல்க' : 'Enter Authority Dashboard'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
