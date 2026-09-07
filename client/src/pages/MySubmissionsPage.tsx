import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ShieldCheck, MapPin, Clock, ArrowLeft, Camera, Mic, Lock, AlertCircle } from 'lucide-react';
import { Evidence } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedProject } from '../utils/projectTranslations';

export const MySubmissionsPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [submissions, setSubmissions] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const fetchMySubmissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const response = await fetch('/api/evidence/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (isTA ? 'சமர்ப்பிப்புகளைப் பதிவேற்ற முடியவில்லை.' : 'Failed to load submissions.'));
      }

      setSubmissions(data.evidences || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Navigation */}
        <Link to="/citizen" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> {isTA ? 'திட்டப் பட்டியலுக்குத் திரும்புக' : 'Back to Projects List'}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-consistent">{isTA ? 'சுய ஆதார சமர்ப்பிப்புகள்' : 'PRIVATE SUBMISSION TRAIL'}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={14} /> {isTA ? 'அங்கீகரிக்கப்பட்ட அணுகல் மட்டுமே' : 'Server Authorized Access Only'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {isTA ? 'என் ஆதாரச் சமர்ப்பிப்புகள்' : 'My Evidence Submissions'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {isTA ? 'சமர்ப்பிக்கப்பட்ட களப் புகைப்படங்கள், குரல் பதிவுகள் மற்றும் SHA-256 பாதுகாப்பு குறியீடுகளைக் கண்காணிக்கவும்.' : 'Track submitted ground photos, audio observations, and cryptographic SHA-256 integrity references.'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            {isTA ? 'உங்கள் சமர்ப்பிப்புகள் பதிவேற்றப்படுகின்றன...' : 'Loading your submissions...'}
          </div>
        ) : submissions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FileCheck size={40} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              {isTA ? 'இன்னும் ஆதாரங்கள் சமர்ப்பிக்கப்படவில்லை' : 'No Evidence Submissions Yet'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {isTA ? 'நீங்கள் இன்னும் எந்த திட்டத்திற்கும் களச் சான்று சமர்ப்பிக்கவில்லை. தொடங்க ஒரு பொதுப்பணித் திட்டத்தைத் தேர்ந்தெடுக்கவும்.' : "You haven't submitted any project ground proof yet. Select a public work project to begin."}
            </p>
            <Link to="/citizen" className="btn-primary">{isTA ? 'அருகிலுள்ள திட்டங்களை உலாவு' : 'Browse Nearby Projects'}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {submissions.map((sub) => {
              const proj = sub.project ? getTranslatedProject(sub.project, language) : null;
              return (
                <div key={sub.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>
                        {isTA ? 'ஆதார எண்:' : 'EVIDENCE ID:'} {sub.id}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                        {proj ? proj.title : (isTA ? 'பொதுத் திட்டம்' : 'Public Project')}
                      </h3>
                    </div>

                    <span className="badge badge-consistent">{isTA ? 'நிலை:' : 'STATUS:'} {sub.status === 'SUBMITTED' ? (isTA ? 'சமர்ப்பிக்கப்பட்டது' : 'SUBMITTED') : sub.status}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={15} /> {isTA ? 'சமர்ப்பிக்கப்பட்ட தேதி:' : 'Submitted:'} {new Date(sub.capturedAt || sub.createdAt).toLocaleString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {sub.photoUrl ? (isTA ? '📷 புகைப்படம் உள்ளது ✓' : '📷 Photo Attached ✓') : (isTA ? 'புகைப்படம் இல்லை' : 'No Photo')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {sub.voiceUrl ? (isTA ? '🎤 குரல் பதிவு உள்ளது ✓' : '🎤 Voice Note Attached ✓') : (isTA ? 'ஒலிப்பதிவு இல்லை' : 'No Audio')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} /> {sub.locationProvided && sub.latitude ? (isTA ? `GPS இணைக்கப்பட்டது (${sub.latitude.toFixed(4)}, ${sub.longitude?.toFixed(4)})` : `GPS Attached (${sub.latitude.toFixed(4)}, ${sub.longitude?.toFixed(4)})`) : (isTA ? 'இடம் பெறப்படவில்லை' : 'LOCATION_NOT_PROVIDED')}
                    </span>
                  </div>

                  {/* Submissions Details Grid */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                    {sub.notes && (
                      <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.75rem' }}>
                        <strong>{isTA ? 'கருத்து:' : 'Comment:'}</strong> "{sub.notes}"
                      </p>
                    )}

                    <div style={{ fontSize: '0.78rem', color: '#15803d', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {isTA ? 'SHA-256 பாதுகாப்பு குறியீடு:' : 'SHA-256 Integrity Reference:'} {sub.evidenceHash}
                    </div>
                  </div>

                  {/* Media Previews if available */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {sub.photoUrl && (
                      <a href={sub.photoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Camera size={16} /> {isTA ? 'பதிவேற்றப்பட்ட புகைப்படத்தைப் பார்க்க' : 'View Uploaded Photo'}
                      </a>
                    )}
                    {sub.voiceUrl && (
                      <a href={sub.voiceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mic size={16} /> {isTA ? 'குரல் பதிவைக் கேட்க' : 'Play Audio Observation'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
