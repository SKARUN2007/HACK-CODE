import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  HardHat,
  Camera,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Project, ContractorProgressSubmission, ProjectStage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryLabel, getTranslatedProject } from '../utils/projectTranslations';
import { handleImageError, getEvidenceImageUrl } from '../utils/imageUtils';

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
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {isTA ? 'கோரப்பட்ட அரசு பொதுப்பணி திட்டம் கிடைக்கவில்லை.' : 'The requested public work project does not exist.'}
          </p>
          <Link to="/citizen" className="btn-primary">
            {isTA ? 'திட்டப் பட்டியலுக்குத் திரும்புக' : 'Return to Projects'}
          </Link>
        </div>
      </div>
    );
  }

  const project = getTranslatedProject(rawProject, language);
  const submissions: ContractorProgressSubmission[] = rawProject.contractorSubmissions || [];
  const latestSubmission = submissions.length > 0 ? submissions[0] : null;
  const stages: ProjectStage[] = rawProject.stages || [];

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Back Link */}
        <Link
          to="/citizen"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#2563eb',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} /> {isTA ? 'திட்டப் பட்டியலுக்குத் திரும்புக' : 'Back to Projects List'}
        </Link>

        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #2563eb' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-consistent">{getCategoryLabel(project.category, language)}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {isTA ? 'திட்டக் குறியீடு:' : 'Project Code:'} <code>{project.verificationCode || 'MS-ROAD-001'}</code>
                </span>
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

          <p
            style={{
              color: '#334155',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            {project.description}
          </p>

          {/* PROJECT PROGRESS STAGES TIMELINE */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: '#2563eb' }} />
              {isTA ? 'திட்டப் பணி நிலைகள் காலவரிசை' : 'Project Progress & Work Stages Timeline'}
            </h3>

            {stages.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {stages.map((st) => {
                  const isVerified = latestSubmission && latestSubmission.projectStageId === st.id && latestSubmission.status === 'VERIFIED';
                  const isPending = latestSubmission && latestSubmission.projectStageId === st.id && latestSubmission.status !== 'VERIFIED';

                  return (
                    <div
                      key={st.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        border: isVerified ? '2px solid #16a34a' : isPending ? '2px solid #eab308' : '1px solid #e2e8f0',
                        backgroundColor: isVerified ? '#f0fdf4' : isPending ? '#fefce8' : '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>STAGE {st.sequence}</span>
                        {isVerified ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle2 size={14} /> {isTA ? 'சரிபார்க்கப்பட்டது' : 'VERIFIED ✓'}
                          </span>
                        ) : isPending ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a16207', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Clock size={14} /> {isTA ? 'சரிபார்ப்பு காத்திருக்கிறது' : 'AWAITING REVIEW ●'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>
                            {isTA ? 'சமர்ப்பிக்கப்படவில்லை' : 'NOT SUBMITTED ○'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{st.name}</div>
                      {st.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{st.description}</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                {isTA ? 'நிலைகள் அமைவடிவாக்கம் செய்யப்படுகின்றன...' : 'Standard project stages initialized.'}
              </div>
            )}
          </div>

          {/* LATEST CONTRACTOR PROGRESS EVIDENCE CARD */}
          {latestSubmission && (
            <div
              style={{
                marginBottom: '2.5rem',
                padding: '1.5rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardHat size={20} style={{ color: '#d97706' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                    {isTA ? 'ஒப்பந்ததாரர் பணி முன்னேற்ற சான்று' : 'LATEST CONTRACTOR EVIDENCE SUBMISSION'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {new Date(latestSubmission.submittedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                {latestSubmission.title}
              </h3>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1rem',
                  fontStyle: 'italic',
                  color: '#334155',
                  fontSize: '0.95rem',
                }}
              >
                "{latestSubmission.claim}"
              </div>

              {latestSubmission.evidences && latestSubmission.evidences.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={getEvidenceImageUrl(latestSubmission.evidences[0])}
                    alt="Contractor Evidence"
                    onError={handleImageError}
                    style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.2rem' }}>
                      <ShieldCheck size={14} style={{ display: 'inline', marginRight: '0.2rem' }} />
                      SHA-256 Server Fingerprint:
                    </div>
                    <code style={{ fontSize: '0.75rem', color: '#334155' }}>
                      {latestSubmission.evidences[0].sha256Hash?.slice(0, 24)}...
                    </code>
                  </div>
                </div>
              )}

              {/* ACTION BUTTON FOR CITIZEN VERIFICATION */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    {isTA ? 'இந்த பணியை நீங்கள் நேரில் பார்த்தீர்களா?' : 'Can you corroborate this contractor claim on site?'}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    {isTA
                      ? 'களக் கருத்துகள் மற்றும் தற்போதைய புகைப்படங்களை சமர்ப்பித்து சான்றளிக்கவும்.'
                      : 'Submit observable ground facts and optional current photos to corroborate this progress update.'}
                  </p>
                </div>

                <Link
                  to={`/citizen/projects/${project.id}/verify`}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.95rem',
                    backgroundColor: '#d97706',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                  }}
                >
                  {isTA ? 'இந்தப் பணியை சரிபார்க்கவும்' : 'VERIFY THIS WORK'} <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

          {!latestSubmission && (
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {isTA ? 'நீங்கள் இந்த திட்டத்தின் அருகில் உள்ளீர்களா?' : 'Are you near this project location?'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  {isTA
                    ? 'களப் புகைப்படங்கள் மற்றும் இருப்பிடத்தைச் சமர்ப்பித்து திட்டத்தைச் சரிபார்க்கவும்.'
                    : 'Submit ground observations and geotagged evidence to verify this public work project.'}
                </p>
              </div>

              <Link
                to={`/citizen/projects/${project.id}/verify`}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', backgroundColor: '#2563eb' }}
              >
                {isTA ? 'திட்டத்தைச் சரிபார்க்கவும்' : 'Verify This Project'} <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
