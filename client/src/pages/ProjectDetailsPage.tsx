import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryLabel, getReportedStatusLabel, getTranslatedProject } from '../utils/projectTranslations';

export const ProjectDetailsPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';
  const { id } = useParams<{ id: string }>();
  const [rawProject, setRawProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchProjectDetails(id);
    }
  }, [id]);

  const fetchProjectDetails = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (response.ok && data.project) {
        setRawProject(data.project);
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: '#64748b' }}>
        {isTA ? 'திட்ட விவரங்கள் பதிவேற்றப்படுகிறது...' : 'Loading project details...'}
      </div>
    );
  }

  if (!rawProject) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={32} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
          <h2>{isTA ? 'திட்டம் கிடைக்கவில்லை' : 'Project Not Found'}</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{isTA ? 'கோரப்பட்ட அரசு பொதுப்பணி திட்டம் கிடைக்கவில்லை.' : 'The requested public work project does not exist.'}</p>
          <Link to="/citizen" className="btn-primary">{isTA ? 'திட்டப் பட்டியலுக்குத் திரும்புக' : 'Return to Projects'}</Link>
        </div>
      </div>
    );
  }

  const project = getTranslatedProject(rawProject, language);
  const milestonesList = [25, 50, 75, 100];
  const currentMilestone = project.reportedProgress <= 25 ? 25 : project.reportedProgress <= 50 ? 50 : project.reportedProgress <= 75 ? 75 : 100;

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Back Link */}
        <Link to="/citizen" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> {isTA ? 'திட்டப் பட்டியலுக்குத் திரும்புக' : 'Back to Projects List'}
        </Link>

        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-consistent">{getCategoryLabel(project.category, language)}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{isTA ? 'திட்டக் குறியீடு:' : 'Project Code:'} <code>{project.verificationCode || 'MS-ROAD-001'}</code></span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {project.title}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={16} style={{ color: '#2563eb' }} /> {project.location}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{isTA ? 'ஒதுக்கீடு செய்யப்பட்ட அரசு நிதி' : 'Allocated Public Budget'}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                ₹ {(project.budget / 100000).toFixed(2)} {isTA ? 'இலட்சம்' : 'Lakhs'}
              </div>
            </div>
          </div>

          <p style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {project.description}
          </p>

          {/* Milestone Progression Visualization */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              {isTA ? 'அதிகாரப்பூர்வ வேலை இலக்குகள் காலவரிசை' : 'Official Milestone Progress Timeline'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {milestonesList.map((pct) => {
                const isReached = project.reportedProgress >= pct;
                const isCurrent = currentMilestone === pct;

                return (
                  <div
                    key={pct}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: isCurrent ? '2px solid #2563eb' : isReached ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      backgroundColor: isCurrent ? '#eff6ff' : isReached ? '#f0fdf4' : '#ffffff',
                      position: 'relative',
                    }}
                  >
                    {isCurrent && (
                      <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', textTransform: 'uppercase' }}>
                        {isTA ? 'தற்போதைய இலக்கு' : 'ACTIVE TARGET'}
                      </span>
                    )}

                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isCurrent ? '#2563eb' : isReached ? '#16a34a' : '#64748b' }}>
                      {pct}%
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isCurrent ? '#1e40af' : isReached ? '#15803d' : '#94a3b8', marginTop: '0.2rem' }}>
                      {isReached ? (pct === currentMilestone ? (isTA ? 'அறிவிக்கப்பட்டது' : 'REACHED / REPORTED') : (isTA ? 'சரிபார்க்கப்பட்டது' : 'VERIFIED MILESTONE')) : (isTA ? 'அடுத்து வரவிருப்பது' : 'UPCOMING')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Box */}
          <div style={{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {isTA ? 'நீங்கள் இந்த திட்டத்தின் அருகில் உள்ளீர்களா?' : 'Are you near this project location?'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                {isTA 
                  ? `களப் புகைப்படங்கள், குரல் பதிவுகள் மற்றும் GPS இருப்பிடத்தை சமர்ப்பித்து ${currentMilestone}% இலக்கைச் சரிபார்க்கவும்.`
                  : `Submit ground photos, audio notes, and geotagged observations to corroborate the ${currentMilestone}% milestone.`}
              </p>
            </div>

            <Link
              to={`/citizen/projects/${project.id}/verify`}
              className="btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#2563eb' }}
            >
              {isTA ? 'திட்டத்தைச் சரிபார்க்கவும்' : 'Verify This Project'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

