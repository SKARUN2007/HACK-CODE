import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Users,
  Camera,
  Cpu,
  UserCheck,
  ArrowRight,
  WifiOff,
  Lock,
  Compass,
  MapPin,
  Search,
  Building,
  Lightbulb,
  Droplet,
  Trash2,
  School,
  Sparkles,
  Award,
  Activity,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { TnEmblem } from '../components/TnEmblem';

export const LandingPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  return (
    <div>
      {/* Tamil Nadu Govt Live Audit Ticker Marquee */}
      <div style={{
        backgroundColor: '#02182b',
        color: '#cbd5e1',
        fontSize: '0.8rem',
        fontWeight: 700,
        padding: '0.4rem 1rem',
        borderBottom: '1px solid #0a3a60',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: '0.75rem', fontWeight: 800 }}>
            <TnEmblem size={18} /> {isTA ? 'தமிழ்நாடு அரசு' : 'GOVERNMENT OF TAMIL NADU'}
          </span>
        </div>

        <div className="running-ticker-container" style={{ margin: '0 0.5rem' }}>
          <span className="running-ticker-badge" style={{ backgroundColor: '#16a34a' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'inline-block' }}></span>
            {isTA ? 'நேரலைத் தணிக்கை' : 'LIVE AUDIT'}
          </span>
          <div className="running-ticker-wrapper">
            <div className="running-ticker-track" style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ marginRight: '3rem' }}>
                📍 <strong>{isTA ? 'மாவட்டங்கள்:' : 'COVERAGE:'}</strong> {isTA ? '38 மாவட்டங்களில் மக்கள் சான்று புவிசார் தணிக்கை சங்கிலி நேரலையில் உள்ளது.' : '38 Districts Live Audit Chain Active across Tamil Nadu.'}
              </span>
              <span style={{ marginRight: '3rem', color: '#93c5fd' }}>
                🔍 <strong>{isTA ? 'சான்றளிப்பு:' : 'VERIFICATION:'}</strong> {isTA ? 'பொதுப் பணித் திட்டங்களின் படங்கள் AI மற்றும் EXIF மூலம் சரிபார்க்கப்படுகின்றன.' : 'Public infrastructure project photos AI & EXIF verified in real-time.'}
              </span>
              <span style={{ marginRight: '3rem', color: '#fef08a' }}>
                🛡️ <strong>{isTA ? 'வெளிப்படைத்தன்மை:' : 'TRANSPARENCY:'}</strong> {isTA ? 'பொதுமக்கள் சான்றுகள் cryptographically SHA-256 முறையில் பாதுகாக்கப்பட்டுள்ளன.' : 'Citizen submissions cryptographically protected with SHA-256 integrity locks.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TAMIL NADU GOVT HERO BANNER WITH HD IMAGE */}
      <section className="hero-banner">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* Left Column: Hero Copy */}
            <div>
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.65rem', 
                  padding: '0.5rem 1.25rem', 
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.12) 100%)', 
                  border: '1.5px solid rgba(251, 191, 36, 0.5)', 
                  borderRadius: '9999px', 
                  color: '#fbbf24', 
                  fontSize: '0.88rem', 
                  fontWeight: 800, 
                  marginBottom: '1.5rem', 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  letterSpacing: '0.03em'
                }}
              >
                <TnEmblem size={26} />
                <span>{isTA ? 'தமிழ்நாடு அரசு • வாய்மையே வெல்லும்' : 'GOVERNMENT OF TAMIL NADU • TRUTH ALONE TRIUMPHS'}</span>
              </div>

              <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
                {isTA ? 'மக்கள் சான்று' : 'MAKKALSAANTRU'} <br />
                <span style={{ background: 'linear-gradient(90deg, #FBBF24 0%, #34D399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {isTA ? 'பொதுப்பணிகள் முன்னேற்றம் & களச் சான்றளிப்புத் தளம்' : 'Public Work Verification & Ground Proof Platform'}
                </span>
              </h1>

              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: 1.65, marginBottom: '2rem', maxWidth: '620px' }}>
                {isTA 
                  ? 'தமிழ்நாட்டில் நடைபெற்று வரும் பொது உள் கட்டமைப்புப் பணிகளை மைல்கல் கட்டங்களில் (25%, 50%, 75%) பொதுமக்கள் தங்களின் கள புகைப்படங்கள் மற்றும் ஒலிப் பதிவுகள் மூலம் சான்றளிக்கலாம். AI உதவி மற்றும் அரசு அலுவலர்கள் மனித சரிபார்ப்பு மூலம் நிதி விடுவிப்புக்கு முன் வெளிப்படைத்தன்மை உறுதி செய்யப்படுகிறது.'
                  : 'Empowering Tamil Nadu citizens to verify milestone completion (25%, 50%, 75%) of public infrastructure projects through geotagged ground proof. AI-assisted evidence synthesis coupled with official human verification before funds release.'}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {/* Action 1: VERIFY A PUBLIC WORK */}
                <Link 
                  to="/citizen" 
                  style={{ 
                    textDecoration: 'none',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid #10b981',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <ShieldCheck size={28} style={{ color: '#34d399' }} />
                      <ArrowRight size={20} style={{ color: '#34d399' }} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.4rem 0', color: '#ffffff' }}>
                      {isTA ? 'பொதுப் பணியைச் சரிபார்க்கவும்' : 'VERIFY A PUBLIC WORK'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                      {isTA ? 'நடைபெறும் அரசு பொதுப்பணியின் முன்னேற்றத்தைச் சரிபார்க்கவும்.' : 'Check the progress of an existing public project.'}
                    </p>
                  </div>
                  <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#34d399' }}>
                    {isTA ? 'சரிபார்க்க தொடர்க →' : 'VERIFY NOW →'}
                  </span>
                </Link>

                {/* Action 2: REPORT A CIVIC ISSUE */}
                <Link 
                  to="/citizen/report" 
                  style={{ 
                    textDecoration: 'none',
                    backgroundColor: 'rgba(251, 191, 36, 0.15)',
                    border: '2px solid #fbbf24',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 25px rgba(251, 191, 36, 0.2)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', color: '#fbbf24' }}>
                        <Camera size={26} />
                        <MapPin size={26} />
                      </div>
                      <ArrowRight size={20} style={{ color: '#fbbf24' }} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 0.4rem 0', color: '#ffffff' }}>
                      {isTA ? 'குடிமைப் பிரச்சினையைப் புகாரளிக்கவும்' : 'REPORT A CIVIC ISSUE'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                      {isTA ? 'பிரச்சினையைக் காண்கிறீர்களா? புகைப்படம் எடுங்கள், எங்கு புகாரளிக்க வேண்டும் என்பதை நாங்கள் வழிகாட்டுகிறோம்.' : 'See a problem? Take a photo and we\'ll help identify where it should be reported.'}
                    </p>
                  </div>
                  <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>
                    {isTA ? 'புகாரளிக்க தொடர்க →' : 'REPORT NOW →'}
                  </span>
                </Link>
              </div>


            </div>

            {/* Right Column: Hero Live Analytics Showcase Card */}
            <div>
              <div style={{
                backgroundColor: 'rgba(2, 24, 43, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} style={{ color: '#34d399' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                      {isTA ? 'தமிழ்நாடு நேரடித் திட்டம் நிலவரம்' : 'TAMIL NADU LIVE AUDIT STATS'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 800, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                    LIVE AUDIT
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fbbf24' }}>₹450 Cr+</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                      {isTA ? 'சான்றளிக்கப்பட்ட நிதி' : 'Verified Funds Approved'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#34d399' }}>98.4%</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                      {isTA ? 'AI துல்லிய மதிப்பீடு' : 'AI Ground Match Score'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#38bdf8' }}>1,280+</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                      {isTA ? 'கள ஆதாரங்கள்' : 'Geotagged Proof Uploads'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#a78bfa' }}>38 / 38</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                      {isTA ? 'மாவட்டங்கள் இணைக்கப்பட்டன' : 'Districts Monitored'}
                    </div>
                  </div>
                </div>



              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE SPOTLIGHT: AI & HUMAN INSPECTION PROCESS WITH GENERATED IMAGE */}
      <section className="section bg-light">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            
            {/* Generated Inspection Photo Showcase */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                border: '4px solid #ffffff',
              }}>
                <img
                  src="/inspection_hero.png"
                  alt="Tamil Nadu Official Ground Inspection with AI Tablet"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {/* Floating Badge overlay */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '12px',
                padding: '0.75rem 1.1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#002B49' }}>
                    {isTA ? 'TNGIS சான்றளிக்கப்பட்ட தரம்' : 'TNGIS Verified Standard'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {isTA ? 'அரசு பொறியாளர்கள் நேரடி கள ஆய்வு' : 'Official Engineer Field Auditing'}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Copy */}
            <div>
              <span className="badge badge-consistent" style={{ fontSize: '0.8rem', marginBottom: '0.75rem', backgroundColor: '#eff6ff', color: '#002B49', borderColor: '#bfdbfe' }}>
                {isTA ? 'களச் சான்றளிப்பு முறை' : 'GROUND PROOF METHODOLOGY'}
              </span>

              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002B49', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                {isTA ? 'AI பகுப்பாய்வு & மனித சரிபார்ப்பு இணைந்து இயங்கும் பாதுகாப்பு முறை' : 'AI Analysis & Official Human Inspection Synergy'}
              </h2>

              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {isTA
                  ? 'பொதுமக்கள் பதிவேற்றும் ஒவ்வொரு புகைப்படமும் SHA-256 பாதுகாப்பு குறியீட்டுடன் சேமிக்கப்படுகிறது. AI மாதிரிகள் சாலைத் தரம் மற்றும் முன்னேற்றக் கட்டங்களை ஆராய்ந்து முன்னுரிமை அளிக்கும். இறுதி நிதி விடுவிப்பு சான்றிழை அரசு உதவிப் பொறியாளர்கள் நேரில் கள ஆய்வு செய்து மட்டுமே வழங்குவார்கள்.'
                  : 'Every citizen upload undergoes cryptographic SHA-256 hashing to guarantee non-tampering. Our computer vision AI flags anomalies, while government PWD engineers conduct on-site physical audits before releasing funds.'}
              </p>

              {/* 3 Step List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#002B49', margin: 0 }}>{isTA ? 'GPS & SHA-256 சான்றளிப்பு' : 'Geotagged & Tamper-Proof SHA-256 Hashing'}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>{isTA ? 'நேரடி இடம் மற்றும் புகைப்பட பாதுகாப்பு உறுதி செய்யப்படுகிறது.' : 'Evidence metadata is immutable and verified at point of capture.'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0891b2', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#002B49', margin: 0 }}>{isTA ? 'AI முன்னுரிமை மற்றும் முரண்பாடு கண்டறிதல்' : 'AI Risk Scoring & Anomaly Detection'}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>{isTA ? 'மைல்கல் கட்டங்களை (25%, 50%, 75%) தானாக மதிப்பீடு செய்கிறது.' : 'Automated computer vision scores project stage alignment.'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0, marginTop: '2px' }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#002B49', margin: 0 }}>{isTA ? 'அரசுப் பொறியாளர் நேரில் கள ஆய்வு & நிதி விடுவிப்பு' : 'Official Human Review & Disbursement'}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>{isTA ? 'பொறியாளர்களின் இறுதி கையொப்பத்திற்கு பின் நிதி வழங்கப்படுகிறது.' : 'Human engineers make final call to issue fund milestone clearances.'}</p>
                  </div>
                </div>
              </div>

              <Link to="/citizen" className="btn btn-primary" style={{ backgroundColor: '#002B49', borderColor: '#002B49', padding: '0.75rem 1.4rem' }}>
                {isTA ? 'கள ஆய்வுகளைக் கண்டறிக' : 'Explore Verified Public Projects'} <ArrowRight size={18} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-consistent" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', backgroundColor: '#eff6ff', color: '#002B49', borderColor: '#bfdbfe' }}>
              {isTA ? 'பொதுப்பணித் துறைகள் (PUBLIC WORKS DEPARTMENTS)' : 'PUBLIC WORKS DEPARTMENTS'}
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#002B49' }}>
              {isTA ? '5 முக்கிய பொது உள்கட்டமைப்பு பிரிவுகள்' : '5 Major Public Infrastructure Categories'}
            </h2>
            <p style={{ color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              {isTA ? 'தமிழ்நாடு மாவட்டங்களில் நடைபெற்று வரும் பொதுப்பணிகளின் நேரடி நிலவரம்.' : 'Explore public works actively under monitoring.'}
            </p>
          </div>

          <div className="grid-3">
            <Link to="/citizen" className="card" style={{ borderLeft: '4px solid #0284c7', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <MapPin size={28} style={{ color: '#0284c7' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#002B49' }}>
                    {isTA ? 'சாலை வசதிகள்' : 'Road Infrastructure'}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    {isTA ? '1 நேரடித் திட்டம்' : '1 Active Project'}
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/citizen" className="card" style={{ borderLeft: '4px solid #0891b2', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Droplet size={28} style={{ color: '#0891b2' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#002B49' }}>
                    {isTA ? 'நீர் வழங்கல்' : 'Water Supply'}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    {isTA ? '1 நேரடித் திட்டம்' : '1 Active Project'}
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/citizen" className="card" style={{ borderLeft: '4px solid #f59e0b', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Lightbulb size={28} style={{ color: '#f59e0b' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#002B49' }}>
                    {isTA ? 'தெருவிளக்குகள்' : 'Streetlights'}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    {isTA ? '1 நேரடித் திட்டம்' : '1 Active Project'}
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/citizen" className="card" style={{ borderLeft: '4px solid #b91c1c', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Trash2 size={28} style={{ color: '#b91c1c' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#002B49' }}>
                    {isTA ? 'சுகாதார வளாகம்' : 'Sanitation'}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    {isTA ? '1 நேரடித் திட்டம்' : '1 Active Project'}
                  </span>
                </div>
              </div>
            </Link>

            <Link to="/citizen" className="card" style={{ borderLeft: '4px solid #9333ea', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <School size={28} style={{ color: '#9333ea' }} />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#002B49' }}>
                    {isTA ? 'பள்ளி கட்டடம்' : 'Public Buildings'}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    {isTA ? '1 நேரடித் திட்டம்' : '1 Active Project'}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PORTALS */}
      <section className="section bg-light">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#002B49' }}>
              {isTA ? 'அரசுச் சரிபார்ப்புத் தளங்கள் (Portals)' : 'Select Verification Portal'}
            </h2>
            <p style={{ color: '#64748b', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              {isTA ? 'பொதுமக்கள் மற்றும் அதிகாரிகளுக்கான பிரத்யேகத் தளங்கள்' : 'Role-based workspaces designed for ground proof and inspection intelligence'}
            </p>
          </div>

          <div className="grid-3">
            <div className="card" style={{ borderTop: '4px solid #16a34a' }}>
              <Users size={32} style={{ color: '#16a34a', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#002B49', marginBottom: '0.5rem' }}>
                {isTA ? '1. பொதுமக்கள் தளம்' : '1. Citizen Portal'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {isTA ? 'அருகிலுள்ள திட்டங்களைக் கண்டறிந்து புகைப்படம்/ஒலிப் பதிவு மூலம் சான்றளிக்கவும்.' : 'Discover near-me public works, scan project QR codes, record photo/voice proof, and submit evidence.'}
              </p>
              <Link 
                to="/citizen" 
                className="btn w-100" 
                style={{ 
                  justifyContent: 'center', 
                  backgroundColor: '#15803d', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  borderRadius: '8px', 
                  padding: '0.75rem 1.25rem',
                  boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isTA ? 'பொதுமக்கள் தளம் செல்க →' : 'Open Citizen Portal →'}
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
              <UserCheck size={32} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#002B49', marginBottom: '0.5rem' }}>
                {isTA ? '2. ஆய்வாளர்கள் தளம் (Inspector)' : '2. Authority Dashboard'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {isTA ? 'AI மதிப்பீடுகள், வரைபடம் மற்றும் நேரடி கள ஆய்வுக் குறிப்புகளைப் பதிவு செய்யவும்.' : 'Access priority verification queues, risk maps, AI explainability cards, and corrective actions.'}
              </p>
              <Link 
                to="/authority" 
                className="btn w-100" 
                style={{ 
                  justifyContent: 'center', 
                  backgroundColor: '#b45309', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  borderRadius: '8px', 
                  padding: '0.75rem 1.25rem',
                  boxShadow: '0 4px 10px rgba(180, 83, 9, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isTA ? 'அதிகாரிகள் தளம் செல்க →' : 'Open Authority Dashboard →'}
              </Link>
            </div>

            <div className="card" style={{ borderTop: '4px solid #002B49' }}>
              <ShieldCheck size={32} style={{ color: '#002B49', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#002B49', marginBottom: '0.5rem' }}>
                {isTA ? '3. பாதுகாப்பு & நிர்வாகம் (Admin)' : '3. Security & Admin Dashboard'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {isTA ? 'பாதுகாப்பு நிகழ்வுகள், SHA-256 தணிக்கைப் பதிவுகள் மற்றும் பயனாளிகள் மேலாண்மை.' : 'Inspect real-time security events, SHA-256 audit log chains, and security control status panel.'}
              </p>
              <Link 
                to="/admin" 
                className="btn w-100" 
                style={{ 
                  justifyContent: 'center', 
                  backgroundColor: '#002B49', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: '0.95rem',
                  borderRadius: '8px', 
                  padding: '0.75rem 1.25rem',
                  boxShadow: '0 4px 10px rgba(0, 43, 73, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isTA ? 'நிர்வாகத் தளம் செல்க →' : 'Open Security Dashboard →'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
