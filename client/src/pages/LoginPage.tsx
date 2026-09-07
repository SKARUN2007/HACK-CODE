import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Lock, ArrowRight, AlertCircle, Users, Mail, Eye, EyeOff, KeyRound, CheckCircle2, Sparkles } from 'lucide-react';
import { Logo } from '../components/Logo';
import { TnEmblem } from '../components/TnEmblem';
import { useLanguage } from '../context/LanguageContext';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { language } = useLanguage();
  const isTA = language === 'TA';
  const navigate = useNavigate();

  const [role, setRole] = useState<'CITIZEN' | 'INSPECTOR' | 'ADMIN'>('INSPECTOR');
  const [email, setEmail] = useState('inspector@makkalsaantru.gov.in');
  const [password, setPassword] = useState('inspector123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole: 'CITIZEN' | 'INSPECTOR' | 'ADMIN') => {
    setRole(selectedRole);
    setError(null);
    if (selectedRole === 'CITIZEN') {
      setEmail('citizen@makkalsaantru.gov.in');
      setPassword('citizen123');
    } else if (selectedRole === 'INSPECTOR') {
      setEmail('inspector@makkalsaantru.gov.in');
      setPassword('inspector123');
    } else {
      setEmail('admin@makkalsaantru.gov.in');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      onLoginSuccess(data.user, data.token);

      if (data.user.role === 'CITIZEN') {
        navigate('/citizen');
      } else if (data.user.role === 'INSPECTOR') {
        navigate('/authority');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    if (role === 'CITIZEN') return '#16a34a';
    if (role === 'INSPECTOR') return '#2563eb';
    return '#d97706';
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 120px)', padding: '3rem 1rem 4rem' }}>
      <div className="container" style={{ maxWidth: '1020px' }}>
        
        {/* TOP BRANDING & OFFICIAL EMBLEM */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <TnEmblem size={52} />
            <div style={{ height: '36px', width: '1px', backgroundColor: '#cbd5e1', display: 'inline-block' }} />
            <Logo size={52} showText={true} theme="light" />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '9999px', color: '#1e40af', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <Sparkles size={14} style={{ color: '#2563eb' }} />
            {isTA ? 'தமிழ்நாடு அரசு • மின் ஆளுமைத் துறை சான்றளிக்கப்பட்ட உள்நுழைவு' : 'GOVERNMENT OF TAMIL NADU • SECURE AUTHENTICATION GATEWAY'}
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#002B49', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
            {isTA ? 'மக்கள் சான்று அதிகாரப்பூர்வ உள்நுழைவுப் போர்ட்டல்' : 'MAKKALSAANTRU Official Portal Login'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto' }}>
            {isTA 
              ? 'பொதுமக்கள், PWD கள ஆய்வுப் பொறியாளர்கள் மற்றும் பாதுகாப்பு நிர்வாகிகளுக்கான பாதுகாப்பான தளம்.'
              : 'Multi-role authentication gateway for Citizens, Public Works Inspectors, and Security Administrators.'}
          </p>
        </div>

        {/* SECTION 1: ROLE PERSONA SELECTION CARDS */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ backgroundColor: '#002B49', color: '#ffffff', fontSize: '0.75rem', fontWeight: 900, width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isTA ? 'உங்கள் பயனாளர் பிரிவைத் தேர்ந்தெடுக்கவும் (SELECT USER PERSONA)' : 'SELECT YOUR PORTAL USER PERSONA'}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            
            {/* Persona 1: Citizen */}
            <div
              onClick={() => handleRoleSelect('CITIZEN')}
              style={{
                backgroundColor: role === 'CITIZEN' ? '#ffffff' : '#f8fafc',
                border: role === 'CITIZEN' ? '2.5px solid #16a34a' : '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.35rem',
                cursor: 'pointer',
                boxShadow: role === 'CITIZEN' ? '0 12px 28px -6px rgba(22, 163, 74, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '4px', backgroundColor: '#16a34a', position: 'absolute', top: 0, left: 0, right: 0 }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                {role === 'CITIZEN' ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#16a34a', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> {isTA ? 'தேர்வு செய்யப்பட்டது' : 'Selected'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    {isTA ? 'கிளிக் செய்க' : 'Click to Select'}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#002B49', marginBottom: '0.4rem' }}>
                {isTA ? '1. பொதுமக்கள் தளம்' : '1. Citizen / General Public'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {isTA ? 'அருகிலுள்ள கிராம/நகராட்சித் திட்டங்களைக் கண்டறிந்து புகைப்படம்/ஒலிப் பதிவு மூலம் சான்றளிக்கவும்.' : 'Discover near-me public works, scan project QR codes, upload geotagged photo proof, and submit evidence.'}
              </p>
            </div>

            {/* Persona 2: Inspector */}
            <div
              onClick={() => handleRoleSelect('INSPECTOR')}
              style={{
                backgroundColor: role === 'INSPECTOR' ? '#ffffff' : '#f8fafc',
                border: role === 'INSPECTOR' ? '2.5px solid #2563eb' : '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.35rem',
                cursor: 'pointer',
                boxShadow: role === 'INSPECTOR' ? '0 12px 28px -6px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '4px', backgroundColor: '#2563eb', position: 'absolute', top: 0, left: 0, right: 0 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={24} />
                </div>
                {role === 'INSPECTOR' ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#2563eb', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> {isTA ? 'தேர்வு செய்யப்பட்டது' : 'Selected'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    {isTA ? 'கிளிக் செய்க' : 'Click to Select'}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#002B49', marginBottom: '0.4rem' }}>
                {isTA ? '2. PWD கள ஆய்வாளர்' : '2. Public Works Inspector'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {isTA ? 'AI முன்னுரிமைப் பட்டியலை நேரில் ஆய்வு செய்து சான்றளிக்கவும், சீரமைப்பு உத்தரவுகளை வழங்கவும்.' : 'Review AI risk queues, inspect ground proof, record audit notes, issue corrective actions, and approve funds.'}
              </p>
            </div>

            {/* Persona 3: Admin */}
            <div
              onClick={() => handleRoleSelect('ADMIN')}
              style={{
                backgroundColor: role === 'ADMIN' ? '#ffffff' : '#f8fafc',
                border: role === 'ADMIN' ? '2.5px solid #d97706' : '1.5px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.35rem',
                cursor: 'pointer',
                boxShadow: role === 'ADMIN' ? '0 12px 28px -6px rgba(217, 119, 6, 0.2)' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ height: '4px', backgroundColor: '#d97706', position: 'absolute', top: 0, left: 0, right: 0 }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} />
                </div>
                {role === 'ADMIN' ? (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#d97706', color: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> {isTA ? 'தேர்வு செய்யப்பட்டது' : 'Selected'}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                    {isTA ? 'கிளிக் செய்க' : 'Click to Select'}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#002B49', marginBottom: '0.4rem' }}>
                {isTA ? '3. பாதுகாப்பு & நிர்வாகி (Admin)' : '3. Security & Audit Admin'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {isTA ? 'SHA-256 தணிக்கைப் பதிவுகள், சைபர் நிகழ்வுகள் மற்றும் பயனாளிகள் மேலாண்மை கட்டுப்பாட்டு மையம்.' : 'Audit SHA-256 evidence chains, monitor real-time cyber security events, and manage system access.'}
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 2: LOGIN FORM CONTAINER CARD */}
        <div 
          className="card" 
          style={{ 
            maxWidth: '540px', 
            margin: '0 auto', 
            padding: '2.25rem', 
            borderRadius: '16px', 
            border: `2px solid ${getRoleColor()}`,
            boxShadow: '0 16px 36px -8px rgba(0, 43, 73, 0.12)',
            backgroundColor: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Header Banner inside form */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ backgroundColor: `${getRoleColor()}15`, color: getRoleColor(), padding: '0.55rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${getRoleColor()}30` }}>
                <KeyRound size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#002B49', margin: 0 }}>
                  {isTA ? `${role} கணக்கில் உள்நுழைக` : `${role === 'CITIZEN' ? 'Citizen' : role === 'INSPECTOR' ? 'Public Works Inspector' : 'Security Admin'} Login`}
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  {isTA ? 'அதிகாரப்பூர்வ சான்றுகளை உள்ளிடவும்' : 'Official Workspace Credentials'}
                </span>
              </div>
            </div>

            <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: `${getRoleColor()}15`, color: getRoleColor(), border: `1px solid ${getRoleColor()}30`, padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
              ● {role} WORKSPACE
            </span>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.45rem' }}>
                {isTA ? 'அதிகாரப்பூர்வ மின்னஞ்சல் முகவரி' : 'Official Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}
                  placeholder="user@makkalsaantru.gov.in"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.45rem' }}>
                {isTA ? 'பாதுகாக்கப்பட்ட கடவுச்சொல்' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem 2.6rem 0.75rem 2.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 btn-lg"
              style={{
                backgroundColor: getRoleColor(),
                borderColor: getRoleColor(),
                fontWeight: 800,
                fontSize: '1rem',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '8px',
                boxShadow: `0 4px 14px ${getRoleColor()}40`,
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <span>{isTA ? 'சரிபார்க்கப்படுகிறது...' : 'Authenticating Credentials...'}</span>
              ) : (
                <>
                  <span>{isTA ? `${role} ஆக உள்நுழைக` : `Sign In to ${role} Workspace`}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
