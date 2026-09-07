import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  HardHat,
  FileText,
  Clock,
} from 'lucide-react';
import { ProjectStage } from '../types';

export const ContractorProgressUploadPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState<string>('Public Work Project');
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [claim, setClaim] = useState<string>('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProjectAndStages = async () => {
      try {
        const projRes = await fetch(`/api/projects/${projectId}`);
        if (projRes.ok) {
          const data = await projRes.json();
          if (data.project) setProjectTitle(data.project.title);
        }

        const stageRes = await fetch(`/api/contractor/projects/${projectId}/stages`);
        if (stageRes.ok) {
          const data = await stageRes.json();
          setStages(data.stages || []);
          if (data.stages && data.stages.length > 0) {
            setSelectedStageId(data.stages[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching project stages:', err);
      }
    };

    fetchProjectAndStages();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setError('Failed to capture GPS location: ' + err.message);
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      setError('Please attach at least one clear progress evidence photo.');
      return;
    }
    if (!selectedStageId) {
      setError('Please select a project work stage.');
      return;
    }
    if (!title.trim() || !claim.trim()) {
      setError('Please enter a progress title and specific work claim.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('makkalsaantru_token') || localStorage.getItem('ms_auth_token');
      const formData = new FormData();
      formData.append('projectId', projectId || '');
      formData.append('projectStageId', selectedStageId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('claim', claim);
      if (latitude !== null) formData.append('latitude', latitude.toString());
      if (longitude !== null) formData.append('longitude', longitude.toString());
      formData.append('photo', photoFile);

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/contractor/submissions', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload contractor progress evidence.');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Error submitting contractor progress evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '3rem 1rem' }}>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0, 43, 73, 0.12)',
            padding: '2.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              border: '2px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
              margin: '0 auto',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Progress Evidence Submitted
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Your progress evidence has been registered on the server with a cryptographic SHA-256 integrity hash.
          </p>

          <div
            style={{
              backgroundColor: '#02182b',
              padding: '1rem',
              borderRadius: '10px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Status:</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>AWAITING_VERIFICATION</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>SHA-256 Fingerprint:</span>
              <span style={{ color: '#34d399', wordBreak: 'break-all' }}>{successData.submission?.fingerprint}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Submitted At:</span>
              <span style={{ color: '#e2e8f0' }}>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.825rem',
              color: '#1e3a8a',
              textAlign: 'left',
            }}
          >
            💡 <strong>Next Step:</strong> Nearby citizens and authorized field inspectors can now verify your submitted evidence on ground.
          </div>

          <Link
            to="/contractor"
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#f59e0b',
              color: '#02182b',
              fontWeight: 700,
              borderRadius: '10px',
              fontSize: '0.9rem',
              textDecoration: 'none',
              marginTop: '8px',
              display: 'inline-block',
            }}
          >
            Return to Contractor Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Back Link */}
        <Link
          to="/contractor"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            color: '#64748b',
            textDecoration: 'none',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Contractor Workspace
        </Link>

        {/* Header Box */}
        <div
          style={{
            backgroundColor: '#002B49',
            borderRadius: '16px',
            padding: '1.75rem',
            color: '#ffffff',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px rgba(0,43,73,0.15)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <HardHat size={16} /> Contractor Progress Upload Form
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '4px 0 6px', color: '#ffffff' }}>
            {projectTitle}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Submit photographic ground evidence for completed work stages. Evidence is evaluated by citizens, AI visual comparison, and field inspectors.
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0, 43, 73, 0.08)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Select Work Stage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              Select Work Stage *
            </label>
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
              }}
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  Stage {st.sequence}: {st.name} ({st.description})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              Progress Update Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Bituminous Asphalt Layer Laying - Km 2.4 to 3.8"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Specific Work Claim */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              Specific Work Claim *
            </label>
            <textarea
              rows={3}
              placeholder="Describe exact physical work completed on ground (e.g. Laid 50mm thick bituminous concrete layer over compacted crushed aggregate base)."
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Additional Remarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Additional Inspection Notes / Equipment Details (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Machinery utilized, batch mix plant delivery details, site engineer remarks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Photo Evidence Upload Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              Ground Progress Photo Evidence *
            </label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.75rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {photoPreview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid #cbd5e1', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                    ✓ Image Attached ({photoFile?.name}). Click to change.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Camera size={36} style={{ color: '#d97706' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    Click to select progress photo
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                    High resolution JPEG/PNG containing timestamp & clear site view.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* GPS Location Capture */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: '#002B49' }} /> Geo-Tagging Coordinates
              </div>
              <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '2px' }}>
                {latitude !== null && longitude !== null
                  ? `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`
                  : 'Capture device GPS location to verify ground distance.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCaptureLocation}
              disabled={locating}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: '#002B49',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {locating ? 'Capturing GPS...' : latitude !== null ? '✓ GPS Captured' : 'Tag GPS Location'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '10px',
              backgroundColor: '#f59e0b',
              color: '#02182b',
              fontWeight: 800,
              fontSize: '1rem',
              border: 'none',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              cursor: 'pointer',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Upload size={20} /> {submitting ? 'Cryptographically Signing & Uploading...' : 'SUBMIT STAGE PROGRESS EVIDENCE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContractorProgressUploadPage;
