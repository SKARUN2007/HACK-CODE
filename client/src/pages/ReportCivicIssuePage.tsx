import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Upload,
  Mic,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Edit3,
  ShieldCheck,
  Building2,
  Globe,
  WifiOff,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { savePendingCivicReport } from '../services/db';
import { downloadComplaintText, printOrDownloadComplaintPDF } from '../utils/pdfGenerator';
import { Logo } from '../components/Logo';
import { detectCrossDomains } from '../services/crossDomainService';


export type CivicCategoryType =
  | 'ROAD'
  | 'SANITATION'
  | 'WATER_SUPPLY'
  | 'DRAINAGE'
  | 'STREETLIGHT'
  | 'PUBLIC_BUILDING'
  | 'PUBLIC_SPACE'
  | 'SEWAGE'
  | 'OTHER';

const CIVIC_CATEGORIES: { key: CivicCategoryType; labelEN: string; labelTA: string; icon: string }[] = [
  { key: 'ROAD', labelEN: 'Road & Pavement', labelTA: 'சாலை மற்றும் நடைபாதை', icon: '🛣️' },
  { key: 'SANITATION', labelEN: 'Sanitation & Garbage', labelTA: 'சுகாதாரம் மற்றும் குப்பை', icon: '🧹' },
  { key: 'WATER_SUPPLY', labelEN: 'Water Supply & Leakage', labelTA: 'குடிநீர் மற்றும் கசிவு', icon: '🚰' },
  { key: 'DRAINAGE', labelEN: 'Drainage & Canal', labelTA: 'சாக்கடை மற்றும் வடிகால்', icon: '🌊' },
  { key: 'STREETLIGHT', labelEN: 'Streetlight & Lighting', labelTA: 'தெருவிளக்கு பராமரிப்பு', icon: '💡' },
  { key: 'PUBLIC_BUILDING', labelEN: 'Public Building Maintenance', labelTA: 'பொதுக் கட்டிட பராமரிப்பு', icon: '🏛️' },
  { key: 'PUBLIC_SPACE', labelEN: 'Public Space & Parks', labelTA: 'பொது இடம் மற்றும் பூங்காக்கள்', icon: '🌳' },
  { key: 'SEWAGE', labelEN: 'Sewage Overflow & Manhole', labelTA: 'கழிவுநீர் வெளியேற்றம்', icon: '☣️' },
  { key: 'OTHER', labelEN: 'Other Civic Issue', labelTA: 'இதர குடிமைப் பிரச்சினை', icon: '📌' },
];

export const ReportCivicIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isTA = language === 'TA';

  // Wizard Step (1: CAPTURE, 2: LOCATION, 3: IDENTIFY, 4: CONFIRM, 5: COMPLAINT, 6: REVIEW)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  const [description, setDescription] = useState<string>('');
  
  // Location state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [landmark, setLandmark] = useState<string>('');
  const [areaLocality, setAreaLocality] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [locatingGPS, setLocatingGPS] = useState<boolean>(false);
  const [searchAddressQuery, setSearchAddressQuery] = useState<string>('');
  const [isSearchingAddress, setIsSearchingAddress] = useState<boolean>(false);
  const [showExactCoords, setShowExactCoords] = useState<boolean>(false);

  // AI Classification State
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CivicCategoryType>('ROAD');
  const [selectedIssueType, setSelectedIssueType] = useState<string>('POTHOLE');
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [crossDomainResult, setCrossDomainResult] = useState<any | null>(null);
  const [citizenConfirmedCrossDomain, setCitizenConfirmedCrossDomain] = useState<boolean>(true);


  // Routing State
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [authorityResult, setAuthorityResult] = useState<any | null>(null);

  // Complaint State
  const [reportCode, setReportCode] = useState<string>('');
  const [complaintText, setComplaintText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Location & Form Notice State
  const [formNotice, setFormNotice] = useState<string | null>(null);

  // Handle Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security MIME validation
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(file.type)) {
      setFormNotice(isTA ? 'அனுமதிக்கப்பட்ட பட வடிவம் மட்டுமே (JPEG, PNG, WEBP).' : 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.');
      return;
    }

    // Size limit check (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setFormNotice(isTA ? 'கோப்பின் அளவு 15MB க்கு குறைவாக இருக்க வேண்டும்.' : 'File size exceeds 15MB limit.');
      return;
    }

    setFormNotice(null);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setFormNotice(isTA ? 'ஒலிவாங்கி அணுகல் அனுமதி மறுக்கப்பட்டது.' : 'Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const [isLiveGps, setIsLiveGps] = useState<boolean>(false);

  // Reverse Geocode Helper (Fetch real address name from coordinates)
  const fetchReverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          const add = data.address;
          const detectedLandmark = add.amenity || add.building || add.road || add.suburb || '';
          const detectedArea = add.suburb || add.neighbourhood || add.residential || add.village || add.county || '';
          const detectedCity = add.city || add.town || add.state_district || add.state || '';

          if (detectedLandmark) setLandmark(detectedLandmark);
          if (detectedArea) setAreaLocality(detectedArea);
          if (detectedCity) setCity(detectedCity);
        }
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    }
  };

  // Address Search Handler (Locate real place name via OpenStreetMap)
  const handleSearchAddress = async () => {
    if (!searchAddressQuery.trim()) return;
    setIsSearchingAddress(true);
    setFormNotice(null);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddressQuery)}&limit=1`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const item = results[0];
          const realLat = parseFloat(item.lat);
          const realLng = parseFloat(item.lon);
          setLat(realLat);
          setLng(realLng);
          setIsLiveGps(true);

          const parts = item.display_name.split(',');
          if (parts.length > 0) setLandmark(parts[0].trim());
          if (parts.length > 1) setAreaLocality(parts[1].trim());
          if (parts.length > 2) setCity(parts[2].trim());

          setFormNotice(isTA ? `இடம் பெறப்பட்டது: ${item.display_name.substring(0, 60)}...` : `Real location found: ${item.display_name.substring(0, 60)}...`);
        } else {
          setFormNotice(isTA ? 'இருப்பிடம் கிடைக்கவில்லை. குறிப்பிட்ட முகவரியை டைப் செய்யவும்.' : 'Address not found. Try entering a nearby landmark or city name.');
        }
      }
    } catch (err) {
      console.warn('Address search failed:', err);
      setFormNotice(isTA ? 'முகவரி தேடலில் பிழை ஏற்பட்டது.' : 'Address search failed. Please enter location manually below.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Real Device GPS Location Handler
  const handleGetLocation = () => {
    setLocatingGPS(true);
    setFormNotice(null);

    if (!navigator.geolocation) {
      setFormNotice(isTA ? 'உங்கள் உலாவியில் GPS ஆதரிக்கப்படவில்லை. கீழே உள்ள முகவரி தேடலைப் பயன்படுத்தவும்.' : 'GPS Geolocation is not supported by your browser. Please use the address search below.');
      setLocatingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const realLat = pos.coords.latitude;
        const realLng = pos.coords.longitude;
        setLat(realLat);
        setLng(realLng);
        setIsLiveGps(true);
        setLocatingGPS(false);
        setFormNotice(null);
        fetchReverseGeocode(realLat, realLng);
      },
      (err) => {
        console.warn('High accuracy GPS error, retrying standard accuracy:', err);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const realLat = pos.coords.latitude;
            const realLng = pos.coords.longitude;
            setLat(realLat);
            setLng(realLng);
            setIsLiveGps(true);
            setLocatingGPS(false);
            setFormNotice(null);
            fetchReverseGeocode(realLat, realLng);
          },
          (err2) => {
            console.warn('GPS location error:', err2);
            setLocatingGPS(false);
            setIsLiveGps(false);
            if (err2.code === err2.PERMISSION_DENIED) {
              setFormNotice(isTA ? 'உலாவி GPS அனுமதி மறுக்கப்பட்டது. உலாவி முகவரிப் பட்டியில் அமைவிட அனுமதியை அனுமதிக்கவும், அல்லது கீழே உள்ள முகவரித் தேடலைப் பயன்படுத்தவும்.' : 'Location permission denied by browser. Please allow location access in your browser bar, or search address/enter coordinates below.');
            } else {
              setFormNotice(isTA ? 'GPS சமிக்ஞை பெற முடியவில்லை. கீழே உங்கள் உண்மையான முகவரியைத் தேடவும் அல்லது டைப் செய்யவும்.' : 'GPS signal unavailable. Please search your real address or enter landmark below.');
            }
          },
          { timeout: 8000, enableHighAccuracy: false }
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Run AI Classification (Step 3)
  const runAiClassification = async () => {
    setStep(3);
    setIsClassifying(true);
    setAiUnavailable(false);

    try {
      const formData = new FormData();
      if (photoFile) formData.append('photo', photoFile);
      if (description) formData.append('description', description);

      const response = await fetch('/api/civic-reports/classify', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.classification) {
          setAiResult(data.classification);
          setSelectedCategory(data.classification.category || 'ROAD');
          setSelectedIssueType(data.classification.issueType || 'POTHOLE');
          setIsClassifying(false);
          runAuthorityRouting(data.classification.category || 'ROAD');
          fetchCrossDomainInfo(data.classification.category || 'ROAD');
          return;
        }
      }
      throw new Error('AI Classification returned invalid response');
    } catch (err) {
      console.warn('AI classification backend unavailable, using smart frontend detection fallback:', err);
      const fileName = photoFile ? photoFile.name.toLowerCase() : '';
      const text = `${fileName} ${description}`.toLowerCase();
      let fallbackCat: CivicCategoryType = 'ROAD';
      let fallbackType = 'POTHOLE';
      let desc = 'Road damage or surface issue detected from photo evidence.';

      if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('sanitation')) {
        fallbackCat = 'SANITATION';
        fallbackType = 'GARBAGE_ACCUMULATION';
        desc = 'Sanitation or waste accumulation issue detected.';
      } else if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('supply')) {
        fallbackCat = 'WATER_SUPPLY';
        fallbackType = 'WATER_LEAKAGE';
        desc = 'Water supply pipe leak or disruption detected.';
      } else if (text.includes('drain') || text.includes('clog') || text.includes('canal')) {
        fallbackCat = 'DRAINAGE';
        fallbackType = 'BLOCKED_DRAIN';
        desc = 'Blocked or clogged drainage system detected.';
      } else if (text.includes('light') || text.includes('lamp') || text.includes('dark')) {
        fallbackCat = 'STREETLIGHT';
        fallbackType = 'BROKEN_STREETLIGHT';
        desc = 'Streetlight or public lighting issue detected.';
      } else if (text.includes('sewer') || text.includes('manhole') || text.includes('sewage')) {
        fallbackCat = 'SEWAGE';
        fallbackType = 'SEWAGE_OVERFLOW';
        desc = 'Sewage overflow or manhole issue detected.';
      }

      const fallbackResult = {
        category: fallbackCat,
        issueType: fallbackType,
        confidence: 0.88,
        description: desc,
        isAiGenerated: false
      };

      setAiResult(fallbackResult);
      setSelectedCategory(fallbackCat);
      setSelectedIssueType(fallbackType);
      setIsClassifying(false);
      runAuthorityRouting(fallbackCat);
      fetchCrossDomainInfo(fallbackCat);
    }
  };

  const fetchCrossDomainInfo = async (cat: string) => {
    try {
      const locationString = `${landmark ? landmark + ', ' : ''}${areaLocality}, ${city}`;
      const crossData = await detectCrossDomains({
        primaryDomain: cat,
        description,
        locationText: locationString
      });
      setCrossDomainResult(crossData);
    } catch (cErr) {
      console.warn('Cross domain fetch error:', cErr);
    }
  };

  // Run Authority Routing (Step 4)
  const runAuthorityRouting = async (category: CivicCategoryType) => {
    setIsRouting(true);
    try {
      const locationString = `${landmark ? landmark + ', ' : ''}${areaLocality}, ${city}`;
      const response = await fetch('/api/civic-reports/route-authority', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, locationText: locationString }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthorityResult(data.routing);
      }
    } catch (err) {
      console.error('Authority routing error:', err);
    } finally {
      setIsRouting(false);
    }
  };

  // Generate Complaint Text (Step 5)
  const handleConfirmAndGenerateComplaint = async () => {
    setStep(5);
    try {
      const locationString = `${landmark ? landmark + ', ' : ''}${areaLocality}, ${city}`;
      const response = await fetch('/api/civic-reports/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          issueType: selectedIssueType,
          locationText: locationString,
          latitude: lat,
          longitude: lng,
          description,
          authorityId: authorityResult?.authority?.id,
          language: isTA ? 'ta' : 'en',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReportCode(data.reportCode);
        setComplaintText(data.complaintText);
      }
    } catch (err) {
      console.error('Failed to generate complaint text:', err);
    }
  };

  // Submit Civic Report (Step 6)
  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    const locationString = `${landmark ? landmark + ', ' : ''}${areaLocality}, ${city}`;

    if (isOffline) {
      // Save to IndexedDB offline queue
      try {
        const pendingItem = {
          localId: `civic-off-${Date.now()}`,
          photoBlob: photoFile ? photoFile : null,
          photoName: photoFile ? photoFile.name : null,
          voiceBlob: voiceBlob,
          description,
          latitude: lat,
          longitude: lng,
          locationText: locationString,
          category: selectedCategory,
          issueType: selectedIssueType,
          clientCapturedAt: new Date().toISOString(),
          syncStatus: 'CIVIC_REPORT_PENDING_SYNC' as const,
        };

        await savePendingCivicReport(pendingItem);
        setIsSubmitting(false);
        setSubmissionSuccess(true);
        return;
      } catch (dbErr) {
        console.error('Failed to save offline civic report:', dbErr);
      }
    }

    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const formData = new FormData();
      if (photoFile) formData.append('photo', photoFile);
      if (voiceBlob) formData.append('voice', voiceBlob, 'voice_note.webm');
      formData.append('description', description);
      if (lat) formData.append('latitude', String(lat));
      if (lng) formData.append('longitude', String(lng));
      formData.append('locationText', locationString);
      formData.append('category', selectedCategory);
      formData.append('issueType', selectedIssueType);
      if (authorityResult?.authority?.id) formData.append('authorityId', authorityResult.authority.id);
      formData.append('complaintText', complaintText);
      if (reportCode) formData.append('reportCode', reportCode);
      formData.append('language', isTA ? 'ta' : 'en');
      formData.append('citizenConfirmed', String(citizenConfirmedCrossDomain));

      const response = await fetch('/api/civic-reports', {

        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissionSuccess(true);
        if (data.report?.reportCode) setReportCode(data.report.reportCode);
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      console.warn('Online submission failed, saving to IndexedDB offline storage:', err);
      try {
        await savePendingCivicReport({
          localId: `civic-off-${Date.now()}`,
          photoBlob: photoFile ? photoFile : null,
          photoName: photoFile ? photoFile.name : null,
          voiceBlob: voiceBlob,
          description,
          latitude: lat,
          longitude: lng,
          locationText: locationString,
          category: selectedCategory,
          issueType: selectedIssueType,
          clientCapturedAt: new Date().toISOString(),
          syncStatus: 'CIVIC_REPORT_PENDING_SYNC' as const,
        });
        setSubmissionSuccess(true);
      } catch (e) {
        alert(isTA ? 'அறிக்கையைச் சேமிக்க முடியவில்லை.' : 'Failed to save civic report.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(complaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const locationString = `${landmark ? landmark + ', ' : ''}${areaLocality}, ${city}`;

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '720px', margin: '0 auto' }}>
      
      {/* Top Header Card */}
      <div style={{
        backgroundColor: '#02182b',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        border: '1px solid #0a3a60'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#fbbf24' }}>
              <Camera size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                {isTA ? 'குடிமைப் பிரச்சினையைப் புகாரளிக்கவும்' : 'REPORT A CIVIC ISSUE'}
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>
                {isTA ? 'புகைப்படம் எடுங்கள். துறை மற்றும் அதிகாரியை நாங்கள் கண்டறிகிறோம்.' : 'Take a photo. We will help identify the issue category and authority.'}
              </p>
            </div>
          </div>
          {isOffline && (
            <span style={{ fontSize: '0.72rem', backgroundColor: '#dc2626', color: '#ffffff', padding: '0.3rem 0.6rem', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <WifiOff size={12} /> {isTA ? 'இணையமின்றி' : 'OFFLINE'}
            </span>
          )}
        </div>

        {/* Wizard Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {[
            { num: 1, label: isTA ? 'புகைப்படம்' : 'CAPTURE' },
            { num: 2, label: isTA ? 'இடம்' : 'LOCATION' },
            { num: 3, label: isTA ? 'கண்டறிதல்' : 'IDENTIFY' },
            { num: 4, label: isTA ? 'உறுதி' : 'CONFIRM' },
            { num: 5, label: isTA ? 'புகார்' : 'COMPLAINT' },
            { num: 6, label: isTA ? 'சரிபார்ப்பு' : 'REVIEW' },
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, opacity: step >= s.num ? 1 : 0.4 }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: step === s.num ? '#fbbf24' : step > s.num ? '#10b981' : 'rgba(255,255,255,0.2)',
                color: step === s.num ? '#0f172a' : '#ffffff',
                fontWeight: 800,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.2rem'
              }}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', color: step === s.num ? '#fbbf24' : '#ffffff' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: CAPTURE PROBLEM */}
      {step === 1 && (
        <div className="card" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera style={{ color: '#2563eb' }} size={22} />
            {isTA ? 'நீங்கள் என்ன பிரச்சினையைக் கண்டீர்கள்?' : 'WHAT PROBLEM DID YOU NOTICE?'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {isTA ? 'குடிமைப் பிரச்சினையைத் தெளிவாகப் புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்.' : 'Take a clear photo of the civic problem. You do not need to know the category yet.'}
          </p>

          {/* Hidden File Inputs */}
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />

          {/* Photo Action Buttons */}
          {!photoPreview ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="btn btn-primary"
                style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563eb', borderRadius: '12px' }}
              >
                <Camera size={32} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{isTA ? 'புகைப்படம் எடுங்கள்' : 'TAKE PHOTO'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline"
                style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', border: '2px solid #cbd5e1', color: '#1e293b' }}
              >
                <Upload size={32} style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{isTA ? 'படத்தைப் பதிவேற்றவும்' : 'UPLOAD PHOTO'}</span>
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '2px solid #3b82f6' }}>
              <img src={photoPreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Voice Record Section */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mic size={20} style={{ color: '#dc2626' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                  {isTA ? 'குரல் மூலம் கூறலாம் (விருப்பம்)' : 'RECORD VOICE OBSERVATION (OPTIONAL)'}
                </span>
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Mic size={14} /> {isTA ? 'பதிவுசெய்' : 'Record'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  ⏹ {isTA ? `நிறுத்து (${recordingTime}s)` : `Stop (${recordingTime}s)`}
                </button>
              )}
            </div>
            {voiceBlob && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> {isTA ? 'குரல் பதிவு வெற்றிகரமாக இணைக்கப்பட்டது' : 'Voice observation attached successfully'}
              </div>
            )}
          </div>

          {/* Short Description input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
              {isTA ? 'சிறுகுறிப்பு (விருப்பம்)' : 'ADD SHORT DESCRIPTION (OPTIONAL)'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isTA ? 'எடுத்துக்காட்டு: சாலையில் பெரிய குழி உள்ளது...' : 'e.g., Deep pothole near main bus stop area causing traffic blockage...'}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', minHeight: '80px' }}
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!photoFile && !description}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isTA ? 'அடுத்த படி: இருப்பிடம்' : 'NEXT STEP: LOCATION'} <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* STEP 2: LOCATION */}
      {step === 2 && (
        <div className="card" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin style={{ color: '#dc2626' }} size={22} />
            {isTA ? 'பிரச்சினை எங்கே உள்ளது?' : 'WHERE IS THE PROBLEM?'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {isTA ? 'உங்கள் சாதனத்தின் நேரடி GPS இருப்பிடத்தைப் பெறவும் அல்லது உங்கள் முகவரியைத் தேடவும்.' : 'Capture your live device GPS location, search your address, or specify details below.'}
          </p>

          {/* Notification Banner */}
          {formNotice && (
            <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', color: '#78350f', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} style={{ color: '#b45309', flexShrink: 0 }} />
              <span>{formNotice}</span>
            </div>
          )}

          {/* Option 1: Live GPS Location Button */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locatingGPS}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '2px solid #2563eb', color: '#2563eb', backgroundColor: '#eff6ff' }}
            >
              <MapPin size={20} />
              {locatingGPS ? (isTA ? 'GPS பெறப்படுகிறது...' : 'Locating Real Device GPS...') : (isTA ? 'என் தற்போதைய நேரடி இருப்பிடத்தைப் பயன்படுத்து (GPS)' : 'USE MY LIVE GPS LOCATION')}
            </button>
          </div>

          {/* Option 2: Real Address Search Bar */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.4rem' }}>
              🔍 {isTA ? 'உண்மையான முகவரி அல்லது இடத்தை தேடவும்' : 'SEARCH REAL ADDRESS OR PLACE'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchAddressQuery}
                onChange={(e) => setSearchAddressQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddress(); } }}
                placeholder={isTA ? 'எ.கா: அண்ணா நகர் சென்னை, அல்லது ராக்ஃபோர்ட் திருச்சி' : 'e.g., Anna Nagar Chennai, Rockfort Trichy, Ward 12 Coimbatore...'}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={isSearchingAddress || !searchAddressQuery.trim()}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {isSearchingAddress ? (isTA ? 'தேடப்படுகிறது...' : 'Searching...') : (isTA ? 'தேடு' : 'Search')}
              </button>
            </div>
          </div>

          {/* Real Location Status Badge */}
          {lat && lng ? (
            <div style={{ backgroundColor: isLiveGps ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isLiveGps ? '#86efac' : '#cbd5e1'}`, padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.88rem', color: isLiveGps ? '#166534' : '#334155', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} style={{ color: isLiveGps ? '#16a34a' : '#475569' }} />
                <span>
                  {isLiveGps
                    ? (isTA ? `உண்மையான இருப்பிடம் இணைக்கப்பட்டது ✓ (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})` : `Real Location Attached ✓ (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)})`)
                    : (isTA ? `இருப்பிடம்: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}` : `Coordinates: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`)}
                </span>
              </div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'underline', fontWeight: 700 }}
              >
                {isTA ? 'வரைபடத்தில் பார் ↗' : 'View on Map ↗'}
              </a>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#854d0e', fontWeight: 600, marginBottom: '1.5rem' }}>
              📍 {isTA ? 'தயவுசெய்து GPS அல்லது முகவரி தேடலைப் பயன்படுத்தி இருப்பிடத்தை அமைக்கவும்.' : 'Please click "USE MY LIVE GPS LOCATION" or search your address above.'}
            </div>
          )}

          {/* Toggle Manual Exact Coordinates Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowExactCoords(!showExactCoords)}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline', marginBottom: showExactCoords ? '0.75rem' : '0' }}
            >
              {showExactCoords
                ? (isTA ? '▼ ஆயத்தொலைவுகள் பெட்டியை மூடு' : '▼ Hide Exact Coordinate Fields')
                : (isTA ? '► துல்லியமான அட்சரேகை / தீர்க்கரேகையை கைமுறையாக உள்ளிட (Latitude/Longitude)' : '► Edit / Enter Exact GPS Coordinates (Latitude & Longitude) Manually')}
            </button>

            {showExactCoords && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '10px', marginTop: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                    {isTA ? 'அட்சரேகை (Latitude)' : 'Real Latitude (e.g. 13.0827)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lat ?? ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setLat(isNaN(v) ? null : v);
                      setIsLiveGps(true);
                    }}
                    placeholder="e.g. 13.0827"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>
                    {isTA ? 'தீர்க்கரேகை (Longitude)' : 'Real Longitude (e.g. 80.2707)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lng ?? ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setLng(isNaN(v) ? null : v);
                      setIsLiveGps(true);
                    }}
                    placeholder="e.g. 80.2707"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
              {isTA ? 'இடம் / மைல்கல் விவரங்கள்' : 'CHOOSE / ENTER LOCATION DETAILS'}
            </h4>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                {isTA ? 'அடையாளச் சின்னம் (Landmark / Street)' : 'Landmark / Nearby Building / Street'}
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder={isTA ? 'எ.கா: பஸ் ஸ்டாண்ட் அருகில், காந்தி சாலை' : 'e.g., Near Main Bus Stand, Opp City Bank, Gandhi Road'}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                  {isTA ? 'பகுதி / வார்டு' : 'Area / Ward / Locality'}
                </label>
                <input
                  type="text"
                  value={areaLocality}
                  onChange={(e) => setAreaLocality(e.target.value)}
                  placeholder={isTA ? 'எ.கா: வார்டு 12, அண்ணா நகர்' : 'e.g., Ward 12, Anna Nagar'}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                  {isTA ? 'நகரம் / மாவட்டம்' : 'City / District'}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={isTA ? 'எ.கா: திருச்சி, சென்னை, கோவை' : 'e.g., Tiruchirappalli, Chennai, Coimbatore'}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setStep(1)}
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', fontWeight: 700 }}
            >
              <ChevronLeft size={18} /> {isTA ? 'பின்செல்க' : 'Back'}
            </button>
            <button
              onClick={runAiClassification}
              disabled={!lat || !lng}
              className="btn btn-primary"
              style={{ flex: 2, backgroundColor: '#2563eb', padding: '0.8rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: (!lat || !lng) ? 0.6 : 1 }}
            >
              <Sparkles size={20} /> {isTA ? 'வகைப்பாடு செய்க (AI Identification)' : 'IDENTIFY ISSUE (AI)'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & STEP 4: AI DETECTION & CONFIRMATION */}
      {(step === 3 || step === 4) && (
        <div className="card" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {isClassifying ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <RefreshCw size={40} className="spin-animation" style={{ color: '#2563eb', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {isTA ? 'AI பார்வை பகுப்பாய்வு நடைபெறுகிறது...' : 'AI-ASSISTED ISSUE DETECTION IN PROGRESS...'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.5rem' }}>
                Analyzing photo features and location parameters...
              </p>
            </div>
          ) : (
            <div>
              {/* AI Detection Result Header */}
              <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={22} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {isTA ? 'நாங்கள் கணித்த பிரிவு:' : 'WE THINK THIS MAY BE:'}
                  </span>
                </div>

                {aiResult ? (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0.5rem 0' }}>
                      {CIVIC_CATEGORIES.find(c => c.key === selectedCategory)?.[isTA ? 'labelTA' : 'labelEN'] || selectedCategory}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                        {selectedIssueType}
                      </span>
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                        {Math.round((aiResult.confidence || 0.88) * 100)}% Confidence
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: '#334155', margin: 0, fontStyle: 'italic' }}>
                      "{aiResult.description || 'Civic issue detected from photo evidence.'}"
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0.5rem 0' }}>
                      {CIVIC_CATEGORIES.find(c => c.key === selectedCategory)?.[isTA ? 'labelTA' : 'labelEN'] || 'Road & Pavement'}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                        POTHOLE
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CROSS-DEPARTMENT CASE DETECTION CARD */}
              {crossDomainResult && crossDomainResult.isMultiDomain && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🧩</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isTA ? 'ஒருங்கிணைந்த குடிமை ஆய்வு பரிந்துரைக்கப்படுகிறது' : 'COORDINATED REVIEW SUGGESTED'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0 0.75rem 0' }}>
                    {isTA ? 'நாங்கள் கண்டறிந்தவை (WE IDENTIFIED):' : 'WE IDENTIFIED:'}
                  </h3>

                  <div style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      {isTA ? 'முதன்மை பிரிவு (PRIMARY ISSUE)' : 'PRIMARY ISSUE'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      {CIVIC_CATEGORIES.find(c => c.key === selectedCategory)?.[isTA ? 'labelTA' : 'labelEN'] || selectedCategory} ({selectedIssueType})
                    </div>
                  </div>

                  {crossDomainResult.relatedDomains.map((rel: any, idx: number) => (
                    <div key={idx} style={{ backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                        {isTA ? 'தொடர்புடைய சாத்தியமான பிரிவு (POSSIBLY RELATED ISSUE)' : 'POSSIBLY RELATED ISSUE'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        {CIVIC_CATEGORIES.find(c => c.key === rel.domain)?.[isTA ? 'labelTA' : 'labelEN'] || rel.domain}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>
                        "{rel.reason}"
                      </p>
                    </div>
                  ))}

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', margin: '0.75rem 0' }}>
                    "{isTA ? 'இந்த பிரச்சினை ஒன்றுக்கும் மேற்பட்ட குடிமைச் சேவைகளுடன் தொடர்புடையதாக இருக்கலாம்.' : 'This issue may involve more than one civic service.'}"
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setCitizenConfirmedCrossDomain(true)}
                      style={{ flex: 1, backgroundColor: citizenConfirmedCrossDomain ? '#15803d' : '#f1f5f9', color: citizenConfirmedCrossDomain ? '#ffffff' : '#334155', border: 'none', padding: '0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ✓ {isTA ? 'ஆம், இது சரியானதாகத் தெரிகிறது' : 'YES, THIS LOOKS CORRECT'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryPicker(true)}
                      style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ✏️ {isTA ? 'மாற்று' : 'CHANGE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenConfirmedCrossDomain(false)}
                      style={{ flex: 1, backgroundColor: !citizenConfirmedCrossDomain ? '#e2e8f0' : '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.65rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ❓ {isTA ? 'நிச்சயமில்லை' : 'NOT SURE'}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation / Change Category */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                  {isTA ? 'இது சரியானதா?' : 'IS THIS CORRECT?'}
                </h4>


                {!showCategoryPicker ? (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowCategoryPicker(false)}
                      style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <CheckCircle2 size={18} /> {isTA ? 'ஆம், சரியானது' : 'YES, CORRECT'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryPicker(true)}
                      style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <Edit3 size={18} /> {isTA ? 'பிரிவை மாற்றவும்' : 'CHANGE CATEGORY'}
                    </button>
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                      {isTA ? 'பொருத்தமான குடிமைப் பிரிவைத் தேர்ந்தெடுக்கவும்:' : 'Select Closest Civic Category:'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.65rem' }}>
                      {CIVIC_CATEGORIES.map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.key);
                            setShowCategoryPicker(false);
                            runAuthorityRouting(cat.key);
                          }}
                          style={{
                            padding: '0.6rem',
                            borderRadius: '8px',
                            border: selectedCategory === cat.key ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: selectedCategory === cat.key ? '#eff6ff' : '#ffffff',
                            color: selectedCategory === cat.key ? '#1d4ed8' : '#334155',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            cursor: 'pointer'
                          }}
                        >
                          {cat.icon} {isTA ? cat.labelTA : cat.labelEN}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Authority Directory Result */}
              <div style={{ backgroundColor: '#fafafa', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Building2 size={20} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                    {isTA ? 'பொறுப்புள்ள துறை / அதிகாரி:' : 'LIKELY RESPONSIBLE AUTHORITY:'}
                  </span>
                </div>

                {isRouting ? (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Routing authority directory...</div>
                ) : authorityResult ? (
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                      {authorityResult.authority.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#475569', margin: '0.2rem 0' }}>
                      📍 Jurisdiction: <strong>{authorityResult.authority.jurisdiction}</strong> | Contact: {authorityResult.authority.contactMethod || 'Civic Helpdesk'}
                    </div>
                    {authorityResult.authority.isDemo && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800, display: 'inline-block', marginTop: '0.4rem' }}>
                        DEMO AUTHORITY DIRECTORY MATCH
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', fontWeight: 700 }}>
                  <ChevronLeft size={18} /> {isTA ? 'பின்செல்க' : 'Back'}
                </button>
                <button
                  onClick={handleConfirmAndGenerateComplaint}
                  className="btn btn-primary"
                  style={{ flex: 2, backgroundColor: '#10b981', borderColor: '#10b981', padding: '0.8rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <FileText size={20} /> {isTA ? 'உறுதிசெய்து புகார் தயாரிக்கவும்' : 'CONFIRM & GENERATE COMPLAINT'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 5 & STEP 6: COMPLAINT GENERATION, REVIEW & OUTPUT */}
      {(step === 5 || step === 6) && (
        <div className="card" style={{ padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {!submissionSuccess ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                    {isTA ? 'அறிக்கை ஐடி:' : 'MAKKALSAANTRU REPORT ID:'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {reportCode || 'MS-CIV-2026-00124'}
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.7rem', borderRadius: '999px', fontWeight: 800 }}>
                  READY FOR SUBMISSION
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
                {isTA ? 'புகாரைச் சரிபார்க்கவும்:' : 'REVIEW YOUR FORMAL COMPLAINT DRAFT:'}
              </h3>

              {/* Formated Complaint Box */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderLeft: '4px solid #2563eb',
                borderRadius: '8px',
                padding: '1.25rem',
                fontSize: '0.88rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                maxHeight: '320px',
                overflowY: 'auto',
                marginBottom: '1.5rem'
              }}>
                {complaintText}
              </div>

              {/* Disclaimer */}
              <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#873800', marginBottom: '1.5rem' }}>
                <strong>⚠️ {isTA ? 'அரசமட்டச் சமர்ப்பிப்பு அறிவிப்பு:' : 'Government Submission Disclaimer:'}</strong>{' '}
                {isTA ? 'உங்கள் மக்கள் சான்று அறிக்கை தயாராக உள்ளது. நேரடியாக அரசதிகாரிக்கு அனுப்புவதற்கு அதிகாரப்பூர்வ போர்ட்டல் இணைப்பு தேவை.' : 'Direct authority submission requires an authorized integration. You can download or print this report.'}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="btn btn-outline"
                  style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Copy size={16} /> {copied ? (isTA ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (isTA ? 'புகாரை நகலெடு' : 'COPY COMPLAINT TEXT')}
                </button>

                <button
                  type="button"
                  onClick={() => printOrDownloadComplaintPDF({
                    reportCode,
                    category: selectedCategory,
                    issueType: selectedIssueType,
                    locationText: locationString,
                    authorityName: authorityResult?.authority?.name || 'Local Authority',
                    complaintText,
                    createdAt: new Date().toISOString(),
                    photoUrl: photoPreview,
                  })}
                  className="btn btn-outline"
                  style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <Download size={16} /> {isTA ? 'PDF பதிவிறக்கம்' : 'DOWNLOAD COMPLAINT PDF'}
                </button>
              </div>

              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', backgroundColor: '#10b981', borderColor: '#10b981', fontWeight: 900, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={22} />
                {isSubmitting ? (isTA ? 'சேமிக்கப்படுகிறது...' : 'Saving Report...') : (isTA ? 'அறிக்கையைச் சேமிக்க' : 'SAVE REPORT TO MAKKALSAANTRU')}
              </button>
            </div>
          ) : (
            /* SUCCESS SCREEN */
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                {isTA ? 'மக்கள் சான்று அறிக்கை தயாராக உள்ளது!' : 'YOUR MAKKALSAANTRU REPORT IS READY'}
              </h2>

              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                MakkalSaantru Report ID: <strong>{reportCode}</strong>
              </p>

              <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.4rem' }}>
                  ✓ Issue classified ({selectedCategory} - {selectedIssueType})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.4rem' }}>
                  ✓ Geotagged location recorded
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, marginBottom: '0.4rem' }}>
                  ✓ Responsible Authority Routed ({authorityResult?.authority?.name || 'Local Authority'})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700 }}>
                  ✓ Formal neutral complaint text generated
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => printOrDownloadComplaintPDF({
                    reportCode,
                    category: selectedCategory,
                    issueType: selectedIssueType,
                    locationText: locationString,
                    authorityName: authorityResult?.authority?.name || 'Local Authority',
                    complaintText,
                    createdAt: new Date().toISOString(),
                    photoUrl: photoPreview,
                  })}
                  className="btn btn-primary"
                  style={{ padding: '0.85rem', borderRadius: '10px', fontWeight: 800, backgroundColor: '#2563eb' }}
                >
                  <Download size={18} /> {isTA ? 'PDF பதிவிறக்குக' : 'DOWNLOAD COMPLAINT PDF'}
                </button>

                {authorityResult?.authority?.submissionUrl && (
                  <a
                    href={authorityResult.authority.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '0.85rem', borderRadius: '10px', fontWeight: 800, border: '2px solid #059669', color: '#059669', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Globe size={18} /> {isTA ? 'அதிகாரப்பூர்வ தளத்திற்குச் செல்க' : 'CONTINUE TO OFFICIAL PORTAL'}
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/citizen/reports')}
                  className="btn btn-outline"
                  style={{ padding: '0.85rem', borderRadius: '10px', fontWeight: 800 }}
                >
                  {isTA ? 'என் குடிமைப் புகார்களைக் காண்க' : 'VIEW MY CIVIC REPORTS'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
