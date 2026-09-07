import React, { useState, useEffect } from 'react';
import {
  Building2,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  MapPin,
  Tag,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AdminAuthoritiesPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('PUBLIC_WORKS_DEPT');
  const [jurisdiction, setJurisdiction] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [supportedCategories, setSupportedCategories] = useState<string>('ROAD,DRAINAGE');
  const [contactMethod, setContactMethod] = useState<string>('');
  const [submissionUrl, setSubmissionUrl] = useState<string>('');

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/authority-directory');
      if (response.ok) {
        const data = await response.json();
        setAuthorities(data.authorities || []);
      }
    } catch (err) {
      console.error('Failed to fetch authority directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const response = await fetch('/api/admin/authorities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name,
          type,
          jurisdiction,
          city,
          supportedCategories,
          contactMethod,
          submissionUrl,
          isDemo: true,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setName('');
        setJurisdiction('');
        fetchAuthorities();
      } else {
        alert('Failed to add authority directory entry.');
      }
    } catch (err) {
      console.error('Error creating authority mapping:', err);
    }
  };

  const handleDeleteAuthority = async (id: string) => {
    if (!window.confirm('Are you sure you want to disable this authority mapping?')) return;
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const response = await fetch(`/api/admin/authorities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (response.ok) {
        fetchAuthorities();
      }
    } catch (err) {
      console.error('Error deleting authority:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 style={{ color: '#2563eb' }} size={28} />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTA ? 'அதிகாரிகள் துறை வழிகாட்டி மேலாண்மை' : 'Authority Directory Management'}
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            {isTA ? 'குடிமைப் பிரச்சினைகள் எந்தத் துறைக்குச் செல்ல வேண்டும் என்ற வழிகாட்டுதலை நிர்வகிக்கவும்.' : 'Configure deterministic routing rules for civic issue categories and jurisdictions.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ backgroundColor: '#2563eb', padding: '0.7rem 1.2rem', borderRadius: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> {isTA ? 'புதிய துறை சேர்' : 'Add Authority Entry'}
        </button>
      </div>

      {/* Directory Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Loading authority mappings...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {authorities.map((auth) => (
            <div key={auth.id} className="card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {auth.type}
                </span>
                {auth.isDemo && (
                  <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    DEMO
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.3rem 0' }}>
                {auth.name}
              </h3>

              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                <div>📍 Jurisdiction: <strong>{auth.jurisdiction}</strong></div>
                <div>🏛️ City/State: {auth.city || 'General'}, {auth.state || 'Tamil Nadu'}</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Supported Categories:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(Array.isArray(auth.supportedCategories) ? auth.supportedCategories : String(auth.supportedCategories).split(',')).map((cat: string) => (
                    <span key={cat} style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleDeleteAuthority(auth.id)}
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', borderRadius: '16px', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Add Authority Directory Mapping
            </h2>

            <form onSubmit={handleCreateAuthority}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Trichy Corporation Roads Department (DEMO)"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="PUBLIC_WORKS_DEPT">Public Works Dept</option>
                    <option value="MUNICIPAL_CORPORATION">Municipal Corporation</option>
                    <option value="WATER_BOARD">Water Board</option>
                    <option value="ELECTRICITY_BOARD">Electricity Board</option>
                    <option value="PANCHAYAT">Panchayat</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g., Tiruchirappalli City Corporation"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Supported Categories (comma separated)</label>
                <input
                  type="text"
                  required
                  value={supportedCategories}
                  onChange={(e) => setSupportedCategories(e.target.value)}
                  placeholder="ROAD,DRAINAGE,SANITATION"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#2563eb', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 800 }}
                >
                  Create Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
