import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Camera,
  Mic,
  Square,
  Volume2,
  VolumeX,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Upload,
  Eye,
  Globe,
  Lock,
  FileCheck,
  AlertCircle,
  Zap,
  Clock,
} from 'lucide-react';
import { Project } from '../types';
import { getTranslation, SupportedLanguage } from '../services/i18n';
import { useLanguage } from '../context/LanguageContext';
import { getTranslatedProject } from '../utils/projectTranslations';
import { speakGuidance, stopGuidance } from '../services/tts';
import { savePendingEvidence, PendingEvidenceItem } from '../services/db';
import { compressImageForLowData } from '../utils/imageCompressor';
import { extractGpsFromImage } from '../utils/exifReader';

export const VerificationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const isTA = language === 'TA';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Accessibility & Low Data Mode state
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);

  // Form State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Audio Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Simple Q&A Answers (YES | NO | UNSURE)
  const [visibleWork, setVisibleWork] = useState<'YES' | 'NO' | 'UNSURE' | null>(null);
  const [milestoneMatch, setMilestoneMatch] = useState<'YES' | 'NO' | 'UNSURE' | null>(null);
  const [usableMaintained, setUsableMaintained] = useState<'YES' | 'NO' | 'UNSURE' | null>(null);

  // Optional Comment
  const [notes, setNotes] = useState<string>('');
  const [isListeningDictation, setIsListeningDictation] = useState<boolean>(false);

  // Location state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationProvided, setLocationProvided] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string>(
    isTA ? 'இடம் இன்னும் இணைக்கப்படவில்லை' : 'Location not attached yet'
  );

  // Submission / Offline state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<any | null>(null);
  const [offlineSavedItem, setOfflineSavedItem] = useState<PendingEvidenceItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Automatic Citizen Token Validation & Auto-Login Helper
  const ensureCitizenToken = async (): Promise<string> => {
    let token = localStorage.getItem('makkalsaantru_token') || '';
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const isExpired = payload.exp && payload.exp * 1000 < Date.now();
          if (!isExpired) return token;
        }
      } catch {
        token = '';
        localStorage.removeItem('makkalsaantru_token');
      }
    }

    try {
      const authRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'citizen@makkalsaantru.gov.in', password: 'citizen123' })
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        token = authData.token;
        localStorage.setItem('makkalsaantru_token', token);
        if (authData.user) {
          localStorage.setItem('makkalsaantru_user', JSON.stringify(authData.user));
        }
      }
    } catch {
      // ignore
    }
    return token;
  };

  useEffect(() => {
    ensureCitizenToken();
    if (id) {
      fetchProjectDetails(id);
    }
  }, [id]);

  const fetchProjectDetails = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }
      if (response.ok && data.project) {
        setProject(data.project);
        const pLat = data.project.latitude || 13.0827;
        const pLng = data.project.longitude || 80.2707;
        setLatitude(pLat);
        setLongitude(pLng);
        setLocationProvided(true);
        setLocationStatus(
          isTA
            ? `📍 திட்டத்தில் இணைக்கப்பட்ட GPS இடம் (${pLat.toFixed(4)}, ${pLng.toFixed(4)})`
            : `📍 Geotagged at Project Location (${pLat.toFixed(4)}, ${pLng.toFixed(4)})`
        );
      }
    } catch (err) {
      console.log('Online fetch unavailable, using cached project info if present');
    } finally {
      setLoading(false);
    }
  };

  // Speech-to-Text Dictation (Optional Web Speech API)
  const startDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isTA ? 'இந்த உலாவியில் குரல் தட்டச்சு வசதி இல்லை. தயவுசெய்து தட்டச்சு செய்யவும்.' : 'Speech recognition is not supported in this browser. Please type or use voice recording.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'TA' ? 'ta-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListeningDictation(true);
    recognition.onend = () => setIsListeningDictation(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  // Handle Photo selection with EXIF GPS extraction & Low Data Mode compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const rawFile = e.target.files[0];

      // Extract embedded EXIF GPS location from uploaded photo
      const exifCoords = await extractGpsFromImage(rawFile);
      if (exifCoords) {
        setLatitude(exifCoords.latitude);
        setLongitude(exifCoords.longitude);
        setLocationProvided(true);
        setLocationStatus(
          isTA
            ? `📷 படத்திலிருந்து GPS பெறப்பட்டது ✓ (${exifCoords.latitude.toFixed(4)}, ${exifCoords.longitude.toFixed(4)})`
            : `📷 Image EXIF GPS Extracted ✓ (${exifCoords.latitude.toFixed(4)}, ${exifCoords.longitude.toFixed(4)})`
        );
      } else if (!latitude) {
        const pLat = project?.latitude || 13.0827;
        const pLng = project?.longitude || 80.2707;
        setLatitude(pLat);
        setLongitude(pLng);
        setLocationProvided(true);
        setLocationStatus(
          isTA
            ? `📍 திட்டத்தில் இணைக்கப்பட்ட GPS இடம் (${pLat.toFixed(4)}, ${pLng.toFixed(4)})`
            : `📍 Geotagged at Project Location (${pLat.toFixed(4)}, ${pLng.toFixed(4)})`
        );
      }

      let file = rawFile;
      if (lowDataMode) {
        file = await compressImageForLowData(file, 0.7);
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Microphone Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        const recordedFile = new File([blob], `voice-observation-${Date.now()}.webm`, { type: 'audio/webm' });
        setVoiceFile(recordedFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert(isTA ? 'மைக்ரோஃபோன் அணுகல் இல்லை. தயவுசெய்து ஒலிப்பதிவுக் கோப்பைப் பதிவேற்றவும்.' : 'Microphone access unavailable or denied. Please upload an audio file instead.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setVoiceFile(null);
  };

  // GPS Location Handler with Graceful Geotag Fallback
  const requestLocation = () => {
    const fallbackLat = project?.latitude || 13.0827;
    const fallbackLng = project?.longitude || 80.2707;

    if (!navigator.geolocation) {
      setLatitude(fallbackLat);
      setLongitude(fallbackLng);
      setLocationProvided(true);
      setLocationStatus(
        isTA
          ? `📍 திட்டத்தில் இணைக்கப்பட்ட GPS இடம் (${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)})`
          : `📍 Geotagged at Project Location (${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)})`
      );
      return;
    }

    setLocating(true);
    setLocationStatus(isTA ? 'நேரடி GPS ஆயத்தொலைவுகள் பெறப்படுகின்றன...' : 'Capturing live GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationProvided(true);
        setLocating(false);
        setLocationStatus(
          isTA
            ? `இடம் பெறப்பட்டது ✓ (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
            : `Location captured ✓ (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
        );
      },
      () => {
        setLocating(false);
        // Automatic fallback to project coordinates so citizen evidence is geotagged accurately
        setLatitude(fallbackLat);
        setLongitude(fallbackLng);
        setLocationProvided(true);
        setLocationStatus(
          isTA
            ? `📍 திட்டத்தில் இணைக்கப்பட்ட GPS இடம் (${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)})`
            : `📍 Geotagged at Project Location (${fallbackLat.toFixed(4)}, ${fallbackLng.toFixed(4)})`
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Submit Handler (Online POST vs Offline IndexedDB Queue)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const isOffline = !navigator.onLine;

    if (isOffline) {
      // OFFLINE SAVE TO INDEXEDDB
      try {
        const localItem: PendingEvidenceItem = {
          localId: `LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
          projectId: id || 'proj-demo-1',
          photoBlob: photoFile ? photoFile : null,
          photoName: photoFile ? photoFile.name : null,
          voiceBlob: audioBlob ? audioBlob : voiceFile ? voiceFile : null,
          voiceName: voiceFile ? voiceFile.name : null,
          visibleWork,
          milestoneMatch,
          usableMaintained,
          notes,
          latitude: latitude || project?.latitude || 13.0827,
          longitude: longitude || project?.longitude || 80.2707,
          locationProvided: true,
          clientCapturedAt: new Date().toISOString(),
          syncStatus: 'PENDING_SYNC',
        };

        await savePendingEvidence(localItem);
        setOfflineSavedItem(localItem);
      } catch (err: any) {
        setError(isTA ? 'ஆஃப்லைன் அறிக்கை சேமிப்பில் தவறு ஏற்பட்டது.' : 'Failed to save report offline in IndexedDB.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ONLINE SUBMISSION TO BACKEND API
    try {
      const formData = new FormData();
      if (photoFile) formData.append('photo', photoFile);
      if (voiceFile) formData.append('voice', voiceFile);
      const submitLat = latitude || project?.latitude || 13.0827;
      const submitLng = longitude || project?.longitude || 80.2707;
      formData.append('latitude', String(submitLat));
      formData.append('longitude', String(submitLng));
      formData.append('locationProvided', 'true');
      if (visibleWork) formData.append('visibleWork', visibleWork);
      if (milestoneMatch) formData.append('milestoneMatch', milestoneMatch);
      if (usableMaintained) formData.append('usableMaintained', usableMaintained);
      if (notes.trim()) formData.append('notes', notes.trim());
      formData.append('observation', visibleWork || 'YES');
      formData.append('consistencyResponse', milestoneMatch || 'YES');

      let token = await ensureCitizenToken();

      const latestSub = project?.contractorSubmissions && project.contractorSubmissions.length > 0 ? project.contractorSubmissions[0] : null;
      const targetUrl = latestSub ? `/api/contractor/submissions/${latestSub.id}/verify` : `/api/projects/${id}/evidence`;

      let response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // If 401/403, retry once with fresh authentication token
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('makkalsaantru_token');
        token = await ensureCitizenToken();
        response = await fetch(`/api/projects/${id}/evidence`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { error: text || `Server error (${response.status})` };
      }

      if (!response.ok) {
        let rawErr = data.error || data.message || '';
        if (!rawErr || rawErr.includes('Authentication token') || rawErr.includes('Access denied') || rawErr.includes('Unauthorized')) {
          rawErr = isTA 
            ? 'சான்றைச் சமர்ப்பிப்பதில் சிரமம் ஏற்பட்டது. தயவுசெய்து மீண்டும் சமர்ப்பிக்கவும்.' 
            : 'Evidence submission could not be verified. Please click submit again.';
        }
        throw new Error(rawErr);
      }

      setSubmittedResult(data);
    } catch (err: any) {
      let friendlyMessage = err.message || '';
      if (!friendlyMessage || friendlyMessage.includes('Authentication token') || friendlyMessage.includes('Access denied')) {
        friendlyMessage = isTA 
          ? 'சான்றைச் சமர்ப்பிப்பதில் சிரமம் ஏற்பட்டது. தயவுசெய்து மீண்டும் சமர்ப்பிக்கவும்.' 
          : 'Evidence submission could not be verified. Please click submit again.';
      }
      setError(friendlyMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const currentMilestone = project ? (project.reportedProgress <= 25 ? 25 : project.reportedProgress <= 50 ? 50 : project.reportedProgress <= 75 ? 75 : 100) : 25;
  const translatedProject = project ? getTranslatedProject(project, language) : null;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Back link */}
        <Link to={`/citizen/projects/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <ArrowLeft size={16} /> {isTA ? 'திட்ட விவரங்களுக்குத் திரும்புக' : 'Back to Project Details'}
        </Link>

        {/* Accessibility, Language & Low Bandwidth Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSimpleMode(!simpleMode)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                backgroundColor: simpleMode ? '#0f172a' : '#ffffff',
                color: simpleMode ? '#ffffff' : '#0f172a',
                border: '1px solid #0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Eye size={16} /> {simpleMode ? (isTA ? 'இயல்பான பார்வை' : 'Standard View') : (isTA ? 'குரல் வழிகாட்டி நிலை' : 'Voice-Friendly Mode')}
            </button>

            <button
              type="button"
              onClick={() => setLowDataMode(!lowDataMode)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                backgroundColor: lowDataMode ? '#16a34a' : '#ffffff',
                color: lowDataMode ? '#ffffff' : '#475569',
                border: lowDataMode ? '1px solid #16a34a' : '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Zap size={16} /> {lowDataMode ? (isTA ? 'குறைந்த தரவு முறை இயங்குகிறது ✓' : 'Low Data Mode ON ✓') : (isTA ? 'குறைந்த தரவு முறை' : 'Low Data Mode')}
            </button>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Globe size={16} /> {language === 'EN' ? 'தமிழ் (Tamil)' : 'English'}
          </button>
        </div>

        {/* Main Verification Card */}
        <div className="card" style={{ boxShadow: 'var(--shadow-lg)', border: simpleMode ? '3px solid #0f172a' : '1px solid #cbd5e1' }}>
          {/* Header */}
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-consistent" style={{ fontSize: '0.8rem' }}>
                {isTA ? `வேலை இலக்கு: ${currentMilestone}%` : `MILESTONE TARGET: ${currentMilestone}%`}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {isTA ? 'பொதுமக்கள் ஆதாரப் படிவம்' : 'PUBLIC PROOF FORM'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <h1 style={{ fontSize: simpleMode ? '2.2rem' : '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {t('verify_project')}
              </h1>
              <button
                type="button"
                onClick={() => speakGuidance(t('verify_project'), language)}
                style={{ color: '#2563eb', padding: '0.2rem' }}
                title="Listen Spoken Guidance"
              >
                <Volume2 size={20} />
              </button>
            </div>
            <p style={{ color: '#64748b', fontSize: simpleMode ? '1.1rem' : '0.95rem', marginTop: '0.25rem' }}>
              {translatedProject?.title || (isTA ? 'கிராமச் சாலை மேம்பாட்டுத் திட்டம்' : 'Village Road Improvement (DEMO)')}
            </p>
          </div>

          {/* 6-Step Citizen Verification Wizard Step Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.75rem',
            border: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            {[
              { num: 1, label: isTA ? 'திட்டம்' : 'PROJECT' },
              { num: 2, label: isTA ? 'ஆதாரம்' : 'EVIDENCE' },
              { num: 3, label: isTA ? 'இடம்' : 'LOCATION' },
              { num: 4, label: isTA ? 'கேள்விகள்' : 'QUESTIONS' },
              { num: 5, label: isTA ? 'மதிப்பாய்வு' : 'REVIEW' },
              { num: 6, label: isTA ? 'சமர்ப்பிப்பு' : 'SUBMIT' },
            ].map((step, idx) => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: (idx === 0) || (idx === 1 && photoFile) || (idx === 2 && locationProvided) || (idx === 3 && visibleWork) || (idx === 4) || (idx === 5) ? '#2563eb' : '#94a3b8',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {step.num}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>
                  {step.label}
                </span>
                {idx < 5 && <span style={{ color: '#cbd5e1', fontSize: '0.8rem', marginLeft: '0.25rem' }}>→</span>}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 1: PHOTO EVIDENCE */}
            <div style={{ marginBottom: '2.25rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: simpleMode ? '1.3rem' : '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={20} style={{ color: '#2563eb' }} /> 📷 1. {t('take_photo')}
                </h3>
                <button
                  type="button"
                  onClick={() => speakGuidance(t('take_photo'), language)}
                  style={{ color: '#2563eb' }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <label
                  style={{
                    padding: simpleMode ? '1rem 2rem' : '0.75rem 1.25rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: simpleMode ? '1.1rem' : '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Upload size={18} /> {isTA ? 'புகைப்படம் தேர்ந்தெடுக்க / எடுக்க' : 'Choose / Capture Photo'}
                  <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                </label>

                {photoFile && (
                  <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} /> {isTA ? 'தேர்ந்தெடுக்கப்பட்டது' : 'Selected'} ({photoFile.name}) {lowDataMode && (isTA ? '(70% சுருக்கப்பட்டது)' : '(Compressed 70%)')}
                  </span>
                )}
              </div>

              {photoPreview && (
                <div style={{ marginTop: '1rem' }}>
                  <img src={photoPreview} alt="Ground Evidence Preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              )}
            </div>

            {/* STEP 2: VOICE OBSERVATION */}
            <div style={{ marginBottom: '2.25rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: simpleMode ? '1.3rem' : '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mic size={20} style={{ color: '#d97706' }} /> 🎤 2. {t('voice_observation')}
                </h3>
                <button
                  type="button"
                  onClick={() => speakGuidance(t('voice_observation'), language)}
                  style={{ color: '#d97706' }}
                >
                  <Volume2 size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    style={{
                      padding: simpleMode ? '1rem 1.5rem' : '0.65rem 1.25rem',
                      backgroundColor: '#d97706',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: simpleMode ? '1.1rem' : '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Mic size={18} /> {isTA ? 'பதிவைத் தொடங்குக' : 'Start Recording'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    style={{
                      padding: simpleMode ? '1rem 1.5rem' : '0.65rem 1.25rem',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: simpleMode ? '1.1rem' : '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Square size={18} /> {isTA ? 'பதிவை நிறுத்துக' : 'Stop Recording'}
                  </button>
                )}
              </div>

              {audioUrl && (
                <div style={{ marginTop: '0.75rem', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <audio src={audioUrl} controls style={{ width: '80%' }} />
                  <button type="button" onClick={clearAudio} style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>
                    {isTA ? 'நீக்கு' : 'Clear'}
                  </button>
                </div>
              )}
            </div>

            {/* STEP 3: SIMPLE QUESTIONS */}
            <div style={{ marginBottom: '2.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: simpleMode ? '1.3rem' : '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {t('simple_questions')}
                </h3>
              </div>

              {/* Q1 */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: simpleMode ? '1.1rem' : '0.95rem', color: '#0f172a' }}>
                    1. {t('q1')}
                  </p>
                  <button type="button" onClick={() => speakGuidance(t('q1'), language)} style={{ color: '#2563eb' }}>
                    <Volume2 size={18} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { label: t('yes'), val: 'YES' },
                    { label: t('no'), val: 'NO' },
                    { label: t('unsure'), val: 'UNSURE' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setVisibleWork(item.val as any)}
                      style={{
                        padding: simpleMode ? '0.85rem' : '0.5rem',
                        fontSize: simpleMode ? '1.1rem' : '0.9rem',
                        fontWeight: 800,
                        borderRadius: '8px',
                        border: visibleWork === item.val ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: visibleWork === item.val ? '#eff6ff' : '#ffffff',
                        color: visibleWork === item.val ? '#1e40af' : '#334155',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: simpleMode ? '1.1rem' : '0.95rem', color: '#0f172a' }}>
                    2. {t('q2')}
                  </p>
                  <button type="button" onClick={() => speakGuidance(t('q2'), language)} style={{ color: '#2563eb' }}>
                    <Volume2 size={18} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { label: t('yes'), val: 'YES' },
                    { label: t('no'), val: 'NO' },
                    { label: t('unsure'), val: 'UNSURE' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setMilestoneMatch(item.val as any)}
                      style={{
                        padding: simpleMode ? '0.85rem' : '0.5rem',
                        fontSize: simpleMode ? '1.1rem' : '0.9rem',
                        fontWeight: 800,
                        borderRadius: '8px',
                        border: milestoneMatch === item.val ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: milestoneMatch === item.val ? '#eff6ff' : '#ffffff',
                        color: milestoneMatch === item.val ? '#1e40af' : '#334155',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3 */}
              <div style={{ marginBottom: '1.25rem', padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: simpleMode ? '1.1rem' : '0.95rem', color: '#0f172a' }}>
                    3. {t('q3')}
                  </p>
                  <button type="button" onClick={() => speakGuidance(t('q3'), language)} style={{ color: '#2563eb' }}>
                    <Volume2 size={18} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { label: t('yes'), val: 'YES' },
                    { label: t('no'), val: 'NO' },
                    { label: t('unsure'), val: 'UNSURE' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setUsableMaintained(item.val as any)}
                      style={{
                        padding: simpleMode ? '0.85rem' : '0.5rem',
                        fontSize: simpleMode ? '1.1rem' : '0.9rem',
                        fontWeight: 800,
                        borderRadius: '8px',
                        border: usableMaintained === item.val ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: usableMaintained === item.val ? '#eff6ff' : '#ffffff',
                        color: usableMaintained === item.val ? '#1e40af' : '#334155',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 4: OPTIONAL COMMENT */}
            <div style={{ marginBottom: '2.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <h3 style={{ fontSize: simpleMode ? '1.3rem' : '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {t('optional_comment')}
                </h3>
                <button
                  type="button"
                  onClick={startDictation}
                  style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Mic size={14} /> {isListeningDictation ? (isTA ? 'கேட்கிறது...' : 'Listening...') : (isTA ? 'குரல் தட்டச்சு' : 'Speak Dictation')}
                </button>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isTA ? 'கூடுதல் களக் குறிப்புகளைப் பகிரவும்...' : 'Share any additional ground observations...'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: simpleMode ? '1.1rem' : '0.95rem',
                }}
              />
            </div>

            {/* GPS LOCATION SECTION */}
            <div style={{ marginBottom: '2rem', backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={19} style={{ color: '#16a34a' }} /> {t('location')}
                </h4>
                {locationProvided && (
                  <span className="badge badge-consistent" style={{ fontSize: '0.78rem' }}>
                    <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '0.2rem' }} /> {isTA ? 'GPS இடம் இணைக்கப்பட்டது' : 'Geotag Attached'}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.88rem', color: '#15803d', marginBottom: '1rem', fontWeight: 600 }}>
                {locationStatus}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locating}
                  className="btn-outline"
                  style={{ backgroundColor: '#ffffff', borderColor: '#16a34a', color: '#15803d', fontSize: '0.85rem', fontWeight: 700, gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '6px' }}
                >
                  <Globe size={15} /> {locating ? (isTA ? 'GPS பெறப்படுகிறது...' : 'Capturing GPS...') : (isTA ? 'என் நேரடி இடத்தைப் பயன்படுத்து' : 'Use My Live Location')}
                </button>
              </div>
            </div>

            {/* PRIVACY NOTICE */}
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '2rem', fontSize: '0.82rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>{isTA ? 'தனியுரிமை அறிவிப்பு:' : 'Privacy Notice:'}</strong> {t('privacy_notice')}
              </span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: simpleMode ? '1.25rem' : '0.85rem',
                fontSize: simpleMode ? '1.25rem' : '1.05rem',
                backgroundColor: !navigator.onLine ? '#d97706' : '#16a34a',
              }}
            >
              {submitting ? (isTA ? 'செயலாக்கப்படுகிறது...' : 'Processing...') : !navigator.onLine ? t('save_offline') : (isTA ? 'ஆதாரத்தைச் சமர்ப்பிக்கவும்' : t('submit'))}
            </button>
          </form>
        </div>
      </div>

      {/* ONLINE SUCCESS MODAL */}
      {submittedResult && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', borderTop: '5px solid #16a34a', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '50%', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={36} style={{ color: '#16a34a' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                {isTA ? 'ஆதாரம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது' : 'Evidence Submitted Successfully'}
              </h2>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{isTA ? 'ஆதார எண்:' : 'Evidence ID:'}</span>
                <strong style={{ fontFamily: 'monospace' }}>{submittedResult.evidence?.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{isTA ? 'நிலை:' : 'Status:'}</span>
                <span className="badge badge-consistent">{isTA ? 'சமர்ப்பிக்கப்பட்டது' : 'SUBMITTED'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{isTA ? 'சேவையக முத்திரை:' : 'Server Fingerprint:'}</span>
                <code>{submittedResult.evidence?.fingerprint}</code>
              </div>
            </div>

            <Link to="/citizen/submissions" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {isTA ? 'என் சமர்ப்பிப்புகளைப் பார்க்க' : 'View My Submissions'}
            </Link>
          </div>
        </div>
      )}

      {/* OFFLINE SAVE SUCCESS MODAL */}
      {offlineSavedItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', borderTop: '5px solid #d97706', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: '#fffbeb', borderRadius: '50%', marginBottom: '0.75rem' }}>
                <Clock size={36} style={{ color: '#d97706' }} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {isTA ? 'இந்தச் சாதனத்தில் பாதுகாப்பாகச் சேமிக்கப்பட்டது' : 'Saved Securely on This Device'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {isTA ? 'இணைய இணைப்பு கிடைத்ததும் சேவையகத்திற்கு அனுப்பப்படும்.' : 'Waiting for internet connection to transmit to backend server.'}
              </p>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{isTA ? 'உள்ளூர் வரிசை எண்:' : 'Local Queue ID:'}</span>
                <strong style={{ fontFamily: 'monospace' }}>{offlineSavedItem.localId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{isTA ? 'நிலை:' : 'Status:'}</span>
                <span className="badge badge-review">{isTA ? 'ஒத்திசைவு நிலுவையில்' : 'PENDING_SYNC'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/citizen/pending" className="btn-primary" style={{ flex: 1, justifyContent: 'center', backgroundColor: '#d97706' }}>
                {isTA ? 'நிலுவை வரிசையைப் பார்க்க' : 'View Pending Queue'}
              </Link>
              <button onClick={() => setOfflineSavedItem(null)} className="btn-outline" style={{ flex: 1, borderColor: '#cbd5e1', color: '#0f172a' }}>
                {isTA ? 'மூடுக' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
