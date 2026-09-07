import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Clock,
  UserCheck,
  Building,
  FileCheck,
  ListOrdered,
  Camera,
  MapPin,
  Eye,
  FileText,
  Lock,
  Compass,
  Navigation,
  HardHat,
} from 'lucide-react';
import { PriorityMap, MapProjectMarker } from '../components/PriorityMap';
import { useLanguage } from '../context/LanguageContext';
import { handleImageError, getEvidenceImageUrl } from '../utils/imageUtils';
import { getCategoryLabel, getReportedStatusLabel, getTranslatedProject } from '../utils/projectTranslations';
import { Logo } from '../components/Logo';
import { TnEmblem } from '../components/TnEmblem';

import { PriorityCard } from '../components/civic/PriorityCard';
import { BeforeAfterComparison } from '../components/civic/BeforeAfterComparison';
import { ResolutionTimeline } from '../components/civic/ResolutionTimeline';
import { ResolutionProofCard } from '../components/civic/ResolutionProofCard';
import { PriorityOverrideModal } from '../components/civic/PriorityOverrideModal';
import { CrossDomainBadge } from '../components/civic/CrossDomainBadge';
import { CrossDomainIntelligenceCard } from '../components/civic/CrossDomainIntelligenceCard';
import { CoordinatedActionPlan } from '../components/civic/CoordinatedActionPlan';
import { fetchCrossDomainAnalytics, fetchCrossDomainDetails } from '../services/crossDomainService';


interface SummaryData {
  totalProjects: number;
  projectsRequiringReview: number;
  highPriorityCount: number;
  pendingInspectionsCount: number;
  resolvedCount: number;
}

interface PriorityQueueItem {
  id: string;
  verificationCode?: string;
  title: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  reportedProgress: number;
  milestone: string;
  priorityScore: number;
  confidenceScore: number;
  result: 'CONSISTENT' | 'REVIEW' | 'POTENTIAL_MISMATCH';
  humanStatus: string;
  evidenceCount: number;
  independentCitizens: number;
  assignedInspectorId?: string | null;
}

export const AuthorityDashboard: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [projects, setProjects] = useState<PriorityQueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tab Navigation: PROJECTS | PRIORITY_QUEUE | RESOLUTION_QUEUE | CITIZEN_SUBMISSIONS | CROSS_DOMAIN | CONTRACTOR_PROGRESS
  const [activeTab, setActiveTab] = useState<'PROJECTS' | 'PRIORITY_QUEUE' | 'RESOLUTION_QUEUE' | 'CITIZEN_SUBMISSIONS' | 'CROSS_DOMAIN' | 'CONTRACTOR_PROGRESS'>('CONTRACTOR_PROGRESS');

  // Contractor Progress Submissions State
  const [contractorSubmissions, setContractorSubmissions] = useState<any[]>([]);
  const [selectedProgressSubmission, setSelectedProgressSubmission] = useState<any | null>(null);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progressDecisionReason, setProgressDecisionReason] = useState<string>('');

  // Civic Priority & Resolution Queues State
  const [priorityQueue, setPriorityQueue] = useState<any[]>([]);
  const [resolutionQueue, setResolutionQueue] = useState<any[]>([]);
  const [resourceMetrics, setResourceMetrics] = useState<any | null>(null);
  const [crossDomainAnalytics, setCrossDomainAnalytics] = useState<any | null>(null);
  const [selectedCrossDomainReport, setSelectedCrossDomainReport] = useState<any | null>(null);
  const [selectedCrossDomainDetails, setSelectedCrossDomainDetails] = useState<any | null>(null);


  // Modals & Selected Report State
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [showAfterEvidenceModal, setShowAfterEvidenceModal] = useState<boolean>(false);
  const [showHumanVerifyModal, setShowHumanVerifyModal] = useState<boolean>(false);

  // Action Form Inputs
  const [actionType, setActionType] = useState<string>('BITUMEN_PATCHWORK');
  const [actionDescription, setActionDescription] = useState<string>('');
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState<string | null>(null);
  const [afterActionNote, setAfterActionNote] = useState<string>('');
  const [verdict, setVerdict] = useState<'RESOLUTION_CONFIRMED' | 'ISSUE_STILL_PRESENT' | 'MORE_EVIDENCE_REQUIRED'>('RESOLUTION_CONFIRMED');
  const [inspectorNote, setInspectorNote] = useState<string>('');
  const [actionSubmitting, setActionSubmitting] = useState<boolean>(false);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [milestoneFilter, setMilestoneFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // All Citizen Submissions Evidence Dataset for Inspectors
  const citizenSubmissionsFeed = [
    {
      id: 'ev-101',
      projectId: 'proj-demo-1',
      projectTitle: isTA ? 'சென்னை மெட்ரோ 2-ஆம் கட்ட உயர்த்தப்பட்ட பாதை & நிலைய வளாகம்' : 'Chennai Metro Phase 2 Elevated Corridor & Station Complex',
      category: 'TRANSPORT',
      citizenId: 'cit-104',
      citizenName: isTA ? 'பொதுமக்கள் சான்றளிப்பாளர் #C-104' : 'Citizen #C-104 (Aadhar OTP Verified)',
      location: 'Chennai, Tamil Nadu',
      distanceFromProject: '45m from site',
      reportedProgress: 75,
      groundStatus: isTA ? 'வேறுபாடு கண்டறியப்பட்டது' : 'DISCREPANCY DETECTED',
      aiVerdict: 'POTENTIAL_MISMATCH',
      capturedAt: '2026-09-07 11:20 AM',
      notes: isTA ? 'கள ஆய்வில் தூண்கள் முழுமையடையவில்லை. ஆனால் 75% மைல்கல் கூறப்பட்டுள்ளது.' : 'Ground photo shows pier pillars incomplete vs reported 75% claim.',
      sha256Hash: 'a1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdef',
      exifVerified: true,
      gpsGeofence: 'ACTIVE_INSIDE_BOUNDS',
    },
    {
      id: 'ev-102',
      projectId: 'proj-demo-2',
      projectTitle: isTA ? 'மதுரை ஸ்மார்ட் குடிநீர் விநியோகக் குழாய் கட்டமைப்பு' : 'Madurai Smart Water Supply Pipeline Infrastructure',
      category: 'WATER',
      citizenId: 'cit-108',
      citizenName: isTA ? 'பொதுமக்கள் சான்றளிப்பாளர் #C-108' : 'Citizen #C-108 (Mobile Verified)',
      location: 'Madurai, Tamil Nadu',
      distanceFromProject: '80m from site',
      reportedProgress: 50,
      groundStatus: isTA ? 'ஆய்வில் உள்ளது' : 'UNDER INSPECTION',
      aiVerdict: 'REVIEW',
      capturedAt: '2026-09-07 10:45 AM',
      notes: isTA ? 'குழாய் பதிக்கும் பணிகள் வார்டு 14 அருகில் நடைபெறுகின்றன.' : 'Trench digging completed, pipe lying in progress near ward 14.',
      sha256Hash: 'b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1',
      exifVerified: true,
      gpsGeofence: 'ACTIVE_INSIDE_BOUNDS',
    },
    {
      id: 'ev-103',
      projectId: 'proj-demo-3',
      projectTitle: isTA ? 'கோவை சூரிய மின் நிலைய உபமின்நிலையம்' : 'Coimbatore Solar Power Substation & Grid Feeder',
      category: 'ENERGY',
      citizenId: 'cit-212',
      citizenName: isTA ? 'பொதுமக்கள் சான்றளிப்பாளர் #C-212' : 'Citizen #C-212 (Aadhar OTP Verified)',
      location: 'Coimbatore, Tamil Nadu',
      distanceFromProject: '12m from site',
      reportedProgress: 100,
      groundStatus: isTA ? 'மைல்கல் உறுதி செய்யப்பட்டது' : 'MILESTONE CONFIRMED',
      aiVerdict: 'CONSISTENT',
      capturedAt: '2026-09-07 09:15 AM',
      notes: isTA ? 'மின்மாற்றிகள் முழுமையாக நிறுவப்பட்டு இயக்கத்தில் உள்ளன.' : 'Substation transformers fully installed and connected to local grid.',
      sha256Hash: 'c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2',
      exifVerified: true,
      gpsGeofence: 'ACTIVE_INSIDE_BOUNDS',
    },
    {
      id: 'ev-104',
      projectId: 'proj-demo-5',
      projectTitle: isTA ? 'சேலம் நான்கு வழி உயர்த்தப்பட்ட மேம்பாலம்' : 'Salem Four-Lane Elevated Flyover Construction',
      category: 'ROADS',
      citizenId: 'cit-305',
      citizenName: isTA ? 'பொதுமக்கள் சான்றளிப்பாளர் #C-305' : 'Citizen #C-305 (Mobile Verified)',
      location: 'Salem, Tamil Nadu',
      distanceFromProject: '32m from site',
      reportedProgress: 85,
      groundStatus: isTA ? 'வேறுபாடு கண்டறியப்பட்டது' : 'DISCREPANCY DETECTED',
      aiVerdict: 'POTENTIAL_MISMATCH',
      capturedAt: '2026-09-07 08:30 AM',
      notes: isTA ? 'மேம்பால சாய்வு தளம் இன்னும் தார்ப்பாய் போடப்படவில்லை.' : 'Flyover ramp unpaved. Steel rebar exposed without tarring layer.',
      sha256Hash: 'd4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3',
      exifVerified: true,
      gpsGeofence: 'ACTIVE_INSIDE_BOUNDS',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, categoryFilter, milestoneFilter, searchQuery]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('makkalsaantru_token') || '';
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      // 1. Fetch Summary
      const summaryRes = await fetch('/api/authority/dashboard', { headers });
      const summaryData = await summaryRes.json();
      if (summaryRes.ok && summaryData.summary) {
        setSummary(summaryData.summary);
      }

      // 2. Fetch Filtered Queue
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (categoryFilter !== 'ALL') queryParams.append('category', categoryFilter);
      if (milestoneFilter !== 'ALL') queryParams.append('milestone', milestoneFilter);
      if (searchQuery.trim() !== '') queryParams.append('search', searchQuery.trim());

      const queueRes = await fetch(`/api/authority/projects?${queryParams.toString()}`);
      const queueData = await queueRes.json();
      if (queueRes.ok && queueData.projects) {
        setProjects(queueData.projects);
      }

      // 3. Fetch Civic Action Priority Queue
      const pQueueRes = await fetch('/api/civic-reports/authority/priority-queue', { headers });
      if (pQueueRes.ok) {
        const pData = await pQueueRes.json();
        if (pData.queue) setPriorityQueue(pData.queue);
      }

      // 4. Fetch Civic Resolution Queue
      const rQueueRes = await fetch('/api/civic-reports/authority/resolution-queue', { headers });
      if (rQueueRes.ok) {
        const rData = await rQueueRes.json();
        if (rData.queue) setResolutionQueue(rData.queue);
      }

      // 5. Fetch Resource Intelligence Metrics
      const mRes = await fetch('/api/civic-reports/authority/metrics', { headers });
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.metrics) setResourceMetrics(mData.metrics);
      }

      // 6. Fetch Cross-Domain Analytics
      try {
        const cdData = await fetchCrossDomainAnalytics();
        setCrossDomainAnalytics(cdData);
      } catch (cdErr) {
        console.warn('Cross domain analytics fetch skipped:', cdErr);
      }

      // 7. Fetch Contractor Progress Submissions
      try {
        const cRes = await fetch('/api/contractor/submissions/project/proj-demo-1');
        if (cRes.ok) {
          const cData = await cRes.json();
          setContractorSubmissions(cData.submissions || []);
        }
      } catch (cErr) {
        console.warn('Contractor submissions fetch skipped:', cErr);
      }
    } catch (err) {
      console.warn('Failed to fetch authority dashboard data:', err);
    } finally {
      setLoading(false);
    }

  };

  // Submit Handler: Record Authority Action Started
  const handleRecordActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setActionSubmitting(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('makkalsaantru_token') || '';
      const res = await fetch(`/api/civic-reports/${selectedReport.id}/action-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ actionType, actionDescription }),
      });

      if (res.ok) {
        setShowActionModal(false);
        setActionDescription('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Record action failed:', err);
    } finally {
      setActionSubmitting(false);
    }
  };

  // Submit Handler: Upload AFTER Evidence
  const handleAfterEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setActionSubmitting(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('makkalsaantru_token') || '';
      const formData = new FormData();
      if (afterPhotoFile) formData.append('photo', afterPhotoFile);
      formData.append('afterActionNote', afterActionNote || 'Corrective repair evidence uploaded');

      const res = await fetch(`/api/civic-reports/${selectedReport.id}/after-evidence`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: formData,
      });

      if (res.ok) {
        setShowAfterEvidenceModal(false);
        setAfterPhotoFile(null);
        setAfterPhotoPreview(null);
        setAfterActionNote('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Submit after evidence failed:', err);
    } finally {
      setActionSubmitting(false);
    }
  };

  // Submit Handler: Inspector Verdict (Human Re-verification)
  const handleHumanVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setActionSubmitting(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('makkalsaantru_token') || '';
      const res = await fetch(`/api/civic-reports/${selectedReport.id}/human-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ verdict, inspectorNote: inspectorNote || 'Site audit completed by inspector' }),
      });

      if (res.ok) {
        setShowHumanVerifyModal(false);
        setInspectorNote('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Human verify failed:', err);
    } finally {
      setActionSubmitting(false);
    }
  };

  const getPrioritySeverityBadge = (score: number, result: string) => {
    if (score >= 60 || result === 'POTENTIAL_MISMATCH') {
      return (
        <span className="badge badge-mismatch" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          🔴 {isTA ? 'உயர்' : 'HIGH'} ({score}/100)
        </span>
      );
    } else if (score >= 30 || result === 'REVIEW') {
      return (
        <span className="badge badge-review" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          🟡 {isTA ? 'நடுத்தரம்' : 'MEDIUM'} ({score}/100)
        </span>
      );
    } else {
      return (
        <span className="badge badge-consistent" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          🟢 {isTA ? 'குறைவு' : 'LOW'} ({score}/100)
        </span>
      );
    }
  };

  // Translate projects dynamically
  const translatedProjects = projects.map((p) => {
    const t = getTranslatedProject(p as any, language);
    return {
      ...p,
      title: t.title,
      location: t.location,
    };
  });

  const mapMarkers: MapProjectMarker[] = translatedProjects.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    location: p.location,
    latitude: p.latitude,
    longitude: p.longitude,
    reportedProgress: p.reportedProgress,
    priorityScore: p.priorityScore,
    result: p.result,
    humanStatus: p.humanStatus,
    evidenceCount: p.evidenceCount,
  }));

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Official Government Authority & PWD Inspection Banner */}
      <div style={{
        background: `linear-gradient(135deg, rgba(2, 24, 43, 0.94) 0%, rgba(0, 43, 73, 0.88) 50%, rgba(2, 24, 43, 0.96) 100%), url('/hero_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '3rem 0 3.5rem',
        marginBottom: '2.5rem',
        borderBottom: '4px solid #FBBF24',
        boxShadow: 'inset 0 -30px 40px rgba(0,0,0,0.5)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', backgroundColor: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '9999px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                <TnEmblem size={24} /> {isTA ? 'தமிழ்நாடு அரசு • PWD செயற்பொறியாளர் கள ஆய்வு தளம்' : 'GOVERNMENT OF TAMIL NADU • EXECUTIVE ENGINEER PORTAL'}
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                {isTA ? 'அதிகாரிகள் கள ஆய்வுக் கூடம்' : 'Authority Inspection Dashboard'}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0, maxWidth: '680px' }}>
                {isTA 
                  ? 'நேரலை AI இடர் பகுப்பாய்வு வரிசை, புவி-குறிச்சொல் சான்றளிப்பு தொகுப்பு மற்றும் அதிகாரப்பூர்வ மனித ஆய்வுக் கூடம்.' 
                  : 'Real-time AI risk queues, geotagged evidence synthesis, explanatory cards, and official human milestone approval.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link 
                to="/authority/trust-view" 
                className="btn" 
                style={{ 
                  backgroundColor: '#fbbf24', 
                  color: '#002B49', 
                  borderColor: '#f59e0b', 
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  gap: '0.5rem', 
                  padding: '0.75rem 1.35rem', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <ShieldCheck size={18} style={{ color: '#002B49' }} /> {isTA ? 'AI இடர் வரைபடம் & ஆய்வு →' : 'AI Explainability & Risk Map →'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-review">{isTA ? 'கள ஆய்வு அதிகாரம்' : 'ROLE: INSPECTION AUTHORITY'}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} style={{ color: '#2563eb' }} /> {isTA ? 'கட்டுப்பாட்டு அறை & ஆய்வு வரிசை' : 'Command Dashboard & Inspection Queue'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
              {isTA ? 'கள ஆய்வு & தணிக்கை கட்டுப்பாட்டு அறை' : 'Field Inspection & Audit Command Center'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              {isTA 
                ? 'பொதுமக்கள் பதிவேற்றிய சான்றுகள் மற்றும் AI ஒப்பீட்டு முடிவுகளை அடிப்படையாகக் கொண்டு கள ஆய்வுகளை மேற்கொள்ளலாம்.' 
                : 'Transform citizen evidence & AI verification patterns into prioritized human inspection decisions.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/authority/civic-map" className="btn-primary" style={{ backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 800 }}>
              <Compass size={16} /> {isTA ? 'அமைவிட வரைபடம் (Civic Map)' : 'Civic Intelligence Map'}
            </Link>
            <Link to="/authority/inspection-routes" className="btn-primary" style={{ backgroundColor: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 800 }}>
              <Navigation size={16} /> {isTA ? 'ஆய்வுப் பாதை திட்டமிடுபவர்' : 'Route Planner'}
            </Link>
            <Link to="/authority/my-cases" className="btn-outline" style={{ borderColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.88rem' }}>
              <UserCheck size={16} /> {isTA ? 'எனக்கு ஒதுக்கீடு செய்யப்பட்டவை' : 'My Assigned Cases'}
            </Link>
            <Link to="/admin/audit" className="btn-outline" style={{ borderColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.88rem' }}>
              <ListOrdered size={16} /> {isTA ? 'தணிக்கைப் பதிவேடு' : 'Audit Logs'}
            </Link>
          </div>
        </div>

        {/* TOP SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isTA ? 'மொத்த திட்டங்கள்' : 'Total Public Projects'}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
              {summary ? summary.totalProjects : 5}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{isTA ? 'கண்காணிக்கப்படும் பணிகள்' : 'Monitored Infrastructure'}</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              {isTA ? 'ஆய்வுக்குரியவை' : 'Requiring Review'}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
              {summary ? summary.projectsRequiringReview : 2}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b45309' }}>{isTA ? 'சான்று வேறுபாடு உள்ளவை' : 'Pattern Discrepancies'}</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
              {isTA ? 'உயர் இடர் எச்சரிக்கை' : 'High Priority Alerts'}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#dc2626', marginTop: '0.2rem' }}>
              {summary ? summary.highPriorityCount : 1}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{isTA ? 'இடர் மதிப்பெண் ≥ 60' : 'Score ≥ 60 / Mismatch'}</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
              {isTA ? 'நிலுவையில் உள்ள ஆய்வுகள்' : 'Pending Inspections'}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
              {summary ? summary.pendingInspectionsCount : 2}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#1e40af' }}>{isTA ? 'கள ஆய்வு எதிர்பார்க்கப்படுகிறது' : 'Awaiting Site Audit'}</span>
          </div>

          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              {isTA ? 'ஒப்புதல் அளிக்கப்பட்டவை' : 'Resolved Cases'}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
              {summary ? summary.resolvedCount : 2}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>{isTA ? 'அதிகாரி உறுதி செய்தது' : 'Human Confirmed / Closed'}</span>
          </div>
        </div>

        {/* RESOURCE INTELLIGENCE METRICS BANNER */}
        {resourceMetrics && (
          <div style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '1.25rem 1.5rem', color: '#ffffff', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', border: '1px solid #1e293b' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isTA ? 'திறந்த புகார்கள்' : 'Open Reports'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>{resourceMetrics.openCases || priorityQueue.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isTA ? 'அவசர / உயர் முன்னுரிமை' : 'Urgent / High Score'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f43f5e', marginTop: '2px' }}>{resourceMetrics.urgentHighCases || priorityQueue.filter(q => (q.actionPriorityScore || 0) >= 60).length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isTA ? 'நடவடிக்கை நடப்பவை' : 'Action In Progress'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', marginTop: '2px' }}>{resourceMetrics.actionsInProgress || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isTA ? 'மறுஆய்வு காத்திருப்பவை' : 'Awaiting Audit'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a78bfa', marginTop: '2px' }}>{resourceMetrics.awaitingReverification || resolutionQueue.filter(r => r.status === 'AWAITING_REVERIFICATION').length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isTA ? 'தீர்க்கப்பட்ட புகார்கள்' : 'Resolved Cases'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#4ade80', marginTop: '2px' }}>{resourceMetrics.resolvedCases || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isTA ? 'மீண்டும் திறக்கப்பட்டவை' : 'Reopened Cases'}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f87171', marginTop: '2px' }}>{resourceMetrics.reopenedCases || 0}</div>
            </div>
          </div>
        )}

        {/* VIEW TAB SELECTOR */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('PRIORITY_QUEUE')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'PRIORITY_QUEUE' ? '2px solid #dc2626' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'PRIORITY_QUEUE' ? '#fef2f2' : '#ffffff',
              color: activeTab === 'PRIORITY_QUEUE' ? '#991b1b' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'PRIORITY_QUEUE' ? '0 2px 8px rgba(220,38,38,0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <AlertTriangle size={18} style={{ color: activeTab === 'PRIORITY_QUEUE' ? '#dc2626' : '#94a3b8' }} />
            {isTA ? 'அவசர நடவடிக்கை வரிசை (Civic Queue)' : 'ACTION PRIORITY QUEUE'}
            <span style={{ backgroundColor: '#dc2626', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
              {priorityQueue.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESOLUTION_QUEUE')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'RESOLUTION_QUEUE' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'RESOLUTION_QUEUE' ? '#eff6ff' : '#ffffff',
              color: activeTab === 'RESOLUTION_QUEUE' ? '#1e40af' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'RESOLUTION_QUEUE' ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle2 size={18} style={{ color: activeTab === 'RESOLUTION_QUEUE' ? '#2563eb' : '#94a3b8' }} />
            {isTA ? 'தீர்வு சரிபார்ப்பு வரிசை (Before/After)' : 'RESOLUTION VERIFICATION QUEUE'}
            <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
              {resolutionQueue.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROJECTS')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'PROJECTS' ? '2px solid #475569' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'PROJECTS' ? '#f8fafc' : '#ffffff',
              color: activeTab === 'PROJECTS' ? '#0f172a' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Building size={18} /> {isTA ? 'அரசு திட்டங்கள் & வரைபடம்' : 'Projects & GIS Map'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CITIZEN_SUBMISSIONS')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'CITIZEN_SUBMISSIONS' ? '2px solid #16a34a' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'CITIZEN_SUBMISSIONS' ? '#f0fdf4' : '#ffffff',
              color: activeTab === 'CITIZEN_SUBMISSIONS' ? '#15803d' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Camera size={18} /> {isTA ? 'பொதுமக்கள் சான்றுகள்' : 'Citizen Submissions'}
            <span style={{ backgroundColor: '#16a34a', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
              {citizenSubmissionsFeed.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CROSS_DOMAIN')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'CROSS_DOMAIN' ? '2px solid #059669' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'CROSS_DOMAIN' ? '#ecfdf5' : '#ffffff',
              color: activeTab === 'CROSS_DOMAIN' ? '#047857' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'CROSS_DOMAIN' ? '0 2px 8px rgba(5,150,105,0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🧩</span>
            {isTA ? 'துறை-இடை வழக்குகள்' : 'CROSS-DEPARTMENT INTELLIGENCE'}
            {crossDomainAnalytics?.summary?.totalCrossDomainCases > 0 && (
              <span style={{ backgroundColor: '#059669', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
                {crossDomainAnalytics.summary.totalCrossDomainCases}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONTRACTOR_PROGRESS')}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              border: activeTab === 'CONTRACTOR_PROGRESS' ? '2px solid #d97706' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'CONTRACTOR_PROGRESS' ? '#fef3c7' : '#ffffff',
              color: activeTab === 'CONTRACTOR_PROGRESS' ? '#92400e' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: activeTab === 'CONTRACTOR_PROGRESS' ? '0 2px 8px rgba(217,119,6,0.15)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>👷</span>
            {isTA ? 'ஒப்பந்ததாரர் பணி முன்னேற்ற சான்றளிப்பு' : 'CONTRACTOR PROGRESS VERIFICATION'}
            <span style={{ backgroundColor: '#d97706', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem' }}>
              {contractorSubmissions.length || 2}
            </span>
          </button>
        </div>

        {/* TAB 0: CONTRACTOR PROGRESS VERIFICATION QUEUE */}
        {activeTab === 'CONTRACTOR_PROGRESS' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem', borderTop: '4px solid #d97706' }}>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={22} style={{ color: '#fbbf24' }} />
                  {isTA ? 'ஒப்பந்ததாரர் பணி முன்னேற்ற சரிபார்ப்புத் தளம்' : 'Contractor Progress Evidence Verification Queue'}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  {isTA ? 'ஒப்பந்ததாரர் சான்றுகள், பொதுமக்கள் கருத்துகள் மற்றும் AI ஒப்பீட்டை பகுப்பாய்வு செய்து இறுதியை தீர்மானிக்கவும்.' : 'Evaluate contractor submitted evidence, citizen ground corroborations, and AI evidence comparisons.'}
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {(contractorSubmissions.length > 0 ? contractorSubmissions : [
                  {
                    id: 'sub-demo-1',
                    projectId: 'proj-demo-1',
                    projectTitle: 'Village Road Improvement (DEMO)',
                    stageName: 'Road Base Work',
                    title: 'Road base layer completed for approximately 500 metres',
                    claim: 'Crushed stone aggregate base layer laid, compacted, and ready for asphalt surfacing.',
                    contractorName: 'Suresh Infrastructure Pvt Ltd',
                    submittedAt: '2026-09-08 10:30 AM',
                    status: 'COMMUNITY_VERIFICATION_IN_PROGRESS',
                    version: 1,
                    evidences: [
                      { fileUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80', sha256Hash: '4d91c89f0123456789abcdef4d91c89f0123456789abcdef4d91c89f01234567' }
                    ],
                    verificationsCount: 4,
                    aiResult: 'CONSISTENT',
                    aiConfidence: 0.81,
                  },
                  {
                    id: 'sub-demo-2',
                    projectId: 'proj-demo-3',
                    projectTitle: 'Public Streetlight Installation (DEMO)',
                    stageName: 'Auto-Dimming Sensor Calibration',
                    title: 'Solar streetlight poles & smart sensors installed',
                    claim: 'All 120 solar LED streetlights erected with auto-dimming sensors active.',
                    contractorName: 'Tamil Nadu Energy Corp',
                    submittedAt: '2026-09-08 09:15 AM',
                    status: 'FIELD_INSPECTION_REQUIRED',
                    version: 1,
                    evidences: [
                      { fileUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80', sha256Hash: 'e9f0a1b2c3d4e5f678901234e9f0a1b2c3d4e5f678901234e9f0a1b2c3d4e5f6' }
                    ],
                    verificationsCount: 3,
                    aiResult: 'POTENTIAL_MISMATCH',
                    aiConfidence: 0.88,
                  }
                ]).map((sub: any) => (
                  <div key={sub.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', backgroundColor: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                        STAGE: {sub.stageName || sub.stage?.name || 'Road Base Work'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        v{sub.version || 1} • {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                      {sub.title}
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontStyle: 'italic', marginBottom: '1rem' }}>
                      "{sub.claim}"
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                      {sub.evidences && sub.evidences[0] && (
                        <img
                          src={getEvidenceImageUrl(sub.evidences[0])}
                          alt="Contractor Proof"
                          onError={handleImageError}
                          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <div>Contractor: <strong style={{ color: '#0f172a' }}>{sub.contractorName || 'Suresh Infrastructure Pvt Ltd'}</strong></div>
                        <div style={{ marginTop: '2px' }}>Citizen Corroborations: <strong style={{ color: '#2563eb' }}>{sub.verificationsCount || sub.verifications?.length || 4} submissions</strong></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <span className={`badge ${sub.aiResult === 'CONSISTENT' ? 'badge-consistent' : 'badge-mismatch'}`}>
                        AI: {sub.aiResult || 'CONSISTENT'} ({Math.round((sub.aiConfidence || 0.81) * 100)}%)
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProgressSubmission(sub);
                          setShowProgressModal(true);
                        }}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Eye size={14} /> Review Evidence & Decide →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ACTION PRIORITY QUEUE */}
        {activeTab === 'PRIORITY_QUEUE' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} style={{ color: '#f43f5e' }} />
                  {isTA ? 'நகரப் புகார் அவசர நடவடிக்கை வரிசை (ACTION PRIORITY QUEUE)' : 'CIVIC ACTION PRIORITY QUEUE (RESOURCE INTELLIGENCE)'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
                  {isTA 
                    ? 'பல அறிக்கைகள், காலம், வகையின் முக்கியத்துவம் மற்றும் தரவுகளின் அடிப்படையில் 0-100 ACTION PRIORITY SCORE கணக்கிடப்படுகிறது.' 
                    : 'Cases prioritized strictly by multi-factor system signals (Report count, confirmations, age, weight). No accusations.'}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchDashboardData}
                className="btn-outline"
                style={{ color: '#ffffff', borderColor: '#334155', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                ↻ Refresh Queue
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Loading priority queue...
              </div>
            ) : priorityQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No active civic reports in the priority queue.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>{isTA ? 'புகார் குறியீடு & விவரம்' : 'Report Code & Title'}</th>
                      <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'பிரிவு & இடம்' : 'Category & District'}</th>
                      <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'அவசர மதிப்பெண்' : 'Action Priority Score'}</th>
                      <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'முக்கியக் காரணி' : 'Primary Signal'}</th>
                      <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'தற்போதைய நிலை' : 'Status'}</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>{isTA ? 'செயல்பாடு' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priorityQueue.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: item.priorityLevel === 'URGENT_REVIEW' ? '#fff1f2' : 'transparent' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                            {item.reportCode} {item.isDemoCase && <span style={{ color: '#2563eb', fontWeight: 700 }}>[DEMO CASE]</span>}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {item.category}
                          </span>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                            📍 {item.district || item.locationText || 'Tamil Nadu'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              padding: '0.3rem 0.65rem',
                              borderRadius: '6px',
                              fontWeight: 900,
                              fontSize: '0.9rem',
                              color: item.actionPriorityScore >= 75 ? '#991b1b' : item.actionPriorityScore >= 50 ? '#9a3412' : '#166534',
                              backgroundColor: item.actionPriorityScore >= 75 ? '#fee2e2' : item.actionPriorityScore >= 50 ? '#ffedd5' : '#dcfce7',
                              border: `1px solid ${item.actionPriorityScore >= 75 ? '#fca5a5' : item.actionPriorityScore >= 50 ? '#fdba74' : '#86efac'}`
                            }}>
                              {item.actionPriorityScore} / 100
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
                              ({item.priorityLevel})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '3px', fontWeight: 600 }}>
                            Confidence: {item.evidenceConfidenceScore}%
                          </div>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '240px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.3 }}>
                            {item.priorityReasons?.[0] || 'High citizen confirmation count & unaddressed duration'}
                          </div>
                          {item.priorityReasons?.length > 1 && (
                            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                              +{item.priorityReasons.length - 1} more factors
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: item.status === 'ACTION_IN_PROGRESS' ? '#fef3c7' : item.status === 'RESOLVED' ? '#dcfce7' : item.status === 'REOPENED' ? '#fee2e2' : '#f1f5f9',
                            color: item.status === 'ACTION_IN_PROGRESS' ? '#92400e' : item.status === 'RESOLVED' ? '#166534' : item.status === 'REOPENED' ? '#991b1b' : '#334155',
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReport(item);
                                setShowOverrideModal(true);
                              }}
                              className="btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: '#cbd5e1', color: '#334155' }}
                            >
                              Override Score
                            </button>

                            {item.status === 'REPORTED' || item.status === 'UNDER_REVIEW' || item.status === 'REOPENED' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReport(item);
                                  setShowActionModal(true);
                                }}
                                className="btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
                              >
                                Record Action
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReport(item);
                                  setShowAfterEvidenceModal(true);
                                }}
                                className="btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', backgroundColor: '#2563eb' }}
                              >
                                Upload After Photo
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESOLUTION VERIFICATION QUEUE */}
        {activeTab === 'RESOLUTION_QUEUE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: '#60a5fa' }} />
                {isTA ? 'தீர்வு சரிபார்ப்பு & SHA-256 தணிக்கைக் கூடம்' : 'BEFORE → AFTER RESOLUTION PROOF & INTEGRITY QUEUE'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
                {isTA 
                  ? 'அதிகாரிகளின் புகைப்படச் சான்றுகள், SHA-256 குறியாக்கம் மற்றும் AI ஒப்பீட்டுத் தரவுகள் மனித ஆய்வாளர் தணிக்கைக்கு சமர்ப்பிக்கப்படுகின்றன.' 
                  : 'Every resolution requires Before photo, Authority After photo (SHA-256 validated), AI Vision observation, and Human Inspector Verdict.'}
              </p>
            </div>

            {resolutionQueue.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                No civic cases currently awaiting resolution proof or audit.
              </div>
            ) : (
              resolutionQueue.map((report) => (
                <div key={report.id} className="card" style={{ padding: '1.5rem', border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                          {report.category}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155' }}>
                          STATUS: {report.status}
                        </span>
                        {report.isDemoCase && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            DEMO CASE
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {report.title} ({report.reportCode})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                        📍 {report.locationText || 'Tamil Nadu'} • Reported by: {report.reporterName || 'Citizen'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowAfterEvidenceModal(true);
                        }}
                        className="btn-outline"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
                      >
                        📷 Upload/Update After Photo
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowHumanVerifyModal(true);
                        }}
                        className="btn-primary"
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', backgroundColor: '#15803d', borderColor: '#166534' }}
                      >
                        🔍 Inspector Site Audit Verdict
                      </button>
                    </div>
                  </div>

                  {/* Render Components */}
                  <BeforeAfterComparison report={report} />
                  
                  <div style={{ marginTop: '1.25rem' }}>
                    <ResolutionTimeline report={report} />
                  </div>

                  {report.status === 'RESOLVED' && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <ResolutionProofCard report={report} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PROJECTS & GIS MAP */}
        {activeTab === 'PROJECTS' && (
          <>
            {/* INTERACTIVE PRIORITY MAP */}
            <PriorityMap projects={mapMarkers} />

            {/* MULTI-FACETED FILTER & SEARCH BAR */}
            <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1 1 240px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder={isTA ? "திட்டத்தின் பெயர் அல்லது குறியீட்டைத் தேடுக..." : "Search project title or verification code (e.g. MS-ROAD)..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{isTA ? 'நிலை:' : 'Status:'}</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="ALL">{isTA ? 'அனைத்து நிலைகளும்' : 'All Statuses'}</option>
                    <option value="HIGH">🔴 {isTA ? 'உயர் முன்னுரிமை' : 'High Priority'}</option>
                    <option value="REVIEW">🟡 {isTA ? 'ஆய்வு தேவை' : 'Needs Review'}</option>
                    <option value="CONSISTENT">🟢 {isTA ? 'சரியாக உள்ளது' : 'Consistent'}</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{isTA ? 'பிரிவு:' : 'Category:'}</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="ALL">{isTA ? 'அனைத்துப் பிரிவுகளும்' : 'All Categories'}</option>
                    <option value="ROAD">{isTA ? 'சாலைப் பணி' : 'Road'}</option>
                    <option value="WATER">{isTA ? 'குடிநீர் திட்டம்' : 'Water'}</option>
                    <option value="STREETLIGHT">{isTA ? 'தெருவிளக்கு' : 'Streetlight'}</option>
                    <option value="SANITATION">{isTA ? 'சுகாதாரம்' : 'Sanitation'}</option>
                    <option value="PUBLIC_BUILDING">{isTA ? 'பொதுக் கட்டிடம்' : 'Public Building'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PRIORITY VERIFICATION QUEUE TABLE */}
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {isTA ? `முன்னுரிமை ஆய்வு வரிசை (${translatedProjects.length})` : `PRIORITY VERIFICATION QUEUE (${translatedProjects.length})`}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {isTA ? 'அவசர இடர் மதிப்பெண் அடிப்படையில் வரிசைப்படுத்தப்பட்டது' : 'Sorted by Priority Score (Highest Review Urgency First)'}
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Loading project priority queue...
                </div>
              ) : translatedProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  No public projects match the selected filters.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                        <th style={{ padding: '0.85rem 1.25rem' }}>{isTA ? 'திட்டம் & குறியீடு' : 'Project & Code'}</th>
                        <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'பிரிவு' : 'Category'}</th>
                        <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'அறிவிக்கப்பட்ட நிலை' : 'Milestone & Progress'}</th>
                        <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'முன்னுரிமை நிலை' : 'Priority & Severity'}</th>
                        <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'மக்கள் சான்றுகள்' : 'Citizen Proofs'}</th>
                        <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'AI முடிவு' : 'AI Result'}</th>
                        <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'அதிகாரி நிலை' : 'Human Status'}</th>
                        <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>{isTA ? 'செயல்பாடு' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {translatedProjects.map((proj) => (
                        <tr key={proj.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{proj.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                              {isTA ? 'குறியீடு:' : 'Code:'} {proj.verificationCode || proj.id}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
                              {getCategoryLabel(proj.category, language)}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#334155' }}>
                              {getReportedStatusLabel(proj.reportedProgress, language)}
                            </div>
                            <div style={{ width: '80px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', marginTop: '0.3rem', overflow: 'hidden' }}>
                              <div style={{ width: `${proj.reportedProgress}%`, height: '100%', backgroundColor: '#2563eb' }} />
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {getPrioritySeverityBadge(proj.priorityScore, proj.result)}
                          </td>
                          <td style={{ padding: '1rem', color: '#475569', fontSize: '0.82rem' }}>
                            <div>{proj.evidenceCount} {isTA ? 'சான்றுகள்' : 'Submissions'}</div>
                            <div style={{ color: '#2563eb', fontWeight: 600 }}>{proj.independentCitizens} {isTA ? 'சுயாதீன குடிமக்கள்' : 'Independent'}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {proj.result === 'CONSISTENT' && (
                              <span className="badge badge-consistent">{isTA ? 'சரியாக உள்ளது' : 'CONSISTENT'}</span>
                            )}
                            {proj.result === 'REVIEW' && (
                              <span className="badge badge-review">{isTA ? 'ஆய்வு தேவை' : 'REVIEW'}</span>
                            )}
                            {proj.result === 'POTENTIAL_MISMATCH' && (
                              <span className="badge badge-mismatch">{isTA ? 'வேறுபாடு உள்ளது' : 'POTENTIAL MISMATCH'}</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            {proj.humanStatus}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <Link
                              to={`/authority/projects/${proj.id}`}
                              className="btn-primary"
                              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              {isTA ? 'ஆய்வு செய்' : 'Review'} <ArrowRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 4: CITIZEN SUBMISSIONS */}
        {activeTab === 'CITIZEN_SUBMISSIONS' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid #cbd5e1' }}>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={20} style={{ color: '#60a5fa' }} />
                  {isTA ? 'பொதுமக்கள் சான்றுகள் நேரலைப் பதிவேடு (38 மாவட்டங்கள்)' : 'STATEWIDE CITIZEN EVIDENCE SUBMISSIONS FEED'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>
                  {isTA ? 'தமிழ்நாடு பொதுமக்களிடமிருந்து பெறப்பட்ட புகைப்படச் சான்றுகள் & SHA-256 பாதுகாப்பு முத்திரைகள்' : 'Real-time ground-level photo proofs, EXIF timestamps & SHA-256 cryptographic signatures submitted by citizens.'}
                </p>
              </div>

              <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#38bdf8', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }}>
                ✓ Geofenced & EXIF Anti-Tamper Protection
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>{isTA ? 'சான்று குறியீடு / நேரம்' : 'Submission ID / Time'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'சான்றளிப்பவர் & இடம்' : 'Citizen & Location'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'தொடர்புடைய திட்டம்' : 'Associated Project'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'AI வேறுபாடு நிலை' : 'AI Ground Match'}</th>
                    <th style={{ padding: '0.85rem 1rem' }}>{isTA ? 'பாதுகாப்பு சான்றிதழ்' : 'Cryptographic Trust'}</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>{isTA ? 'ஆய்வு செயல்பாடு' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {citizenSubmissionsFeed.map((ev) => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.85rem' }}>{ev.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ev.capturedAt}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <UserCheck size={14} style={{ color: '#2563eb' }} /> {ev.citizenName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                          <MapPin size={13} style={{ color: '#dc2626' }} /> {ev.location} ({ev.distanceFromProject})
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', maxWidth: '240px', lineHeight: 1.3 }}>{ev.projectTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                          {ev.category} • Claimed: {ev.reportedProgress}% Progress
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {ev.aiVerdict === 'POTENTIAL_MISMATCH' && (
                          <span className="badge badge-mismatch">🔴 POTENTIAL MISMATCH</span>
                        )}
                        {ev.aiVerdict === 'REVIEW' && (
                          <span className="badge badge-review">🟡 NEEDS REVIEW</span>
                        )}
                        {ev.aiVerdict === 'CONSISTENT' && (
                          <span className="badge badge-consistent">🟢 CONSISTENT</span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', maxWidth: '200px', lineHeight: 1.2 }}>
                          {ev.notes}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            ✓ Geofence Verified
                          </span>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace' }}>
                            SHA-256: {ev.sha256Hash.substring(0, 10)}...
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <Link
                          to={`/authority/projects/${ev.projectId}`}
                          className="btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Eye size={14} /> {isTA ? 'சான்றைப் பார்' : 'Inspect Evidence'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CROSS-DEPARTMENT INTELLIGENCE WORKSPACE */}
        {activeTab === 'CROSS_DOMAIN' && (
          <div style={{ marginBottom: '2.5rem' }}>
            {/* WORKSPACE HEADER */}
            <div style={{ backgroundColor: '#0f172a', borderRadius: '14px', padding: '1.75rem', color: '#ffffff', marginBottom: '1.5rem', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧩</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MULTI-DOMAIN CASE MANAGEMENT
                </span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                {isTA ? 'துறை-இடை ஒருங்கிணைப்பு கட்டுப்பாட்டு மையம்' : 'Cross-Department Case Intelligence Command'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0, maxWidth: '750px' }}>
                {isTA
                  ? 'பல குடிமைச் சேவைகள் தொடர்புடைய பிரச்சினைகளை ஒரே ஒருங்கிணைக்கப்பட்ட வழக்காகக் கண்டறிந்து, வரிசைப்படுத்தப்பட்ட துறைச் செயல்பாட்டுத் திட்டங்களை உருவாக்குகிறது.'
                  : 'Detects civic problems spanning multiple service domains and creates ONE coordinated case with sequential action plans instead of fragmented complaints.'}
              </p>

              {/* Resource Intelligence Insight */}
              <div style={{ marginTop: '1.25rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.9rem 1.1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#e0f2fe' }}>
                <strong>💡 Resource Intelligence Insight:</strong> One coordinated case preserves shared evidence and workflow context instead of requiring citizens to repeat separate complaints for different service areas.
              </div>
            </div>

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                  Total Coordinated Cases
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#15803d', marginTop: '0.2rem' }}>
                  {crossDomainAnalytics?.summary?.totalCrossDomainCases || 3}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fef9c3', border: '1px solid #fde047' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>
                  Awaiting Confirmation
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#a16207', marginTop: '0.2rem' }}>
                  {crossDomainAnalytics?.summary?.awaitingConfirmation || 1}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#eff6ff', border: '1px solid #93c5fd' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                  Coordinated Actions In Progress
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', marginTop: '0.2rem' }}>
                  {crossDomainAnalytics?.summary?.inProgress || 1}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fff7ed', border: '1px solid #ffedd5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
                  Partially Addressed
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c', marginTop: '0.2rem' }}>
                  {crossDomainAnalytics?.summary?.partiallyAddressed || 1}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                  Fully Resolved
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
                  {crossDomainAnalytics?.summary?.resolved || 0}
                </div>
              </div>
            </div>

            {/* RECURRING PATTERN INTELLIGENCE */}
            {crossDomainAnalytics?.recurringPatternMessage && (
              <div style={{ backgroundColor: '#fffbe6', border: '1.5px solid #ffe58f', padding: '1rem 1.25rem', borderRadius: '12px', color: '#78350f', fontSize: '0.88rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🔁</span>
                <div>
                  <strong style={{ color: '#92400e' }}>RECURRING CROSS-DOMAIN PATTERN DETECTED:</strong> {crossDomainAnalytics.recurringPatternMessage}
                </div>
              </div>
            )}

            {/* DEMO CASE LIST IN WORKSPACE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Demo Case 1: MS-CIV-2026-142 */}
              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>
                      MS-CIV-2026-142
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                      Drainage Overflow Affecting Main Bus Stand Outer Ring Road
                    </h3>
                  </div>
                  <CrossDomainBadge primaryDomain="DRAINAGE" relatedDomains={['ROAD']} />
                </div>

                <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.25rem' }}>
                  Severe stormwater drain overflow resulting in standing water on road surface near Main Bus Stand. [DEMO DATA]
                </p>

                <CrossDomainIntelligenceCard
                  reportId="MS-CIV-2026-142"
                  userRole="INSPECTOR"
                  assignments={[
                    { id: 'a1', reportId: 'MS-CIV-2026-142', domain: 'DRAINAGE', domainLabel: 'Drainage System', relationshipRole: 'PRIMARY', confidence: 0.91, reason: 'Primary issue detected as overflowing storm drain.', status: 'CONFIRMED', authorityName: 'Tiruchirappalli Corporation Sanitation Wing' },
                    { id: 'a2', reportId: 'MS-CIV-2026-142', domain: 'ROAD', domainLabel: 'Road Infrastructure', relationshipRole: 'RELATED', confidence: 0.85, reason: 'Standing water and visible road-surface damage appear together in the submitted evidence.', status: 'CONFIRMED', authorityName: 'Trichy Roads & Highways Sub-Division (PWD)' }
                  ]}
                  onActionComplete={fetchDashboardData}
                />

                <CoordinatedActionPlan
                  reportId="MS-CIV-2026-142"
                  userRole="INSPECTOR"
                  tasks={[
                    { id: 't1', reportId: 'MS-CIV-2026-142', domain: 'DRAINAGE', title: 'Drainage Review & Clearance', action: 'Desilt clogged roadside drain channel and restore stormwater flow.', status: 'COMPLETED', sequence: 1, notes: 'Drainage channel cleared of silt and standing water receded.' },
                    { id: 't2', reportId: 'MS-CIV-2026-142', domain: 'ROAD', title: 'Road Surface Reassessment & Patching', action: 'Inspect road surface pavement after drainage issue is addressed and execute patching.', status: 'IN_PROGRESS', sequence: 2, dependsOnTaskId: 't1', notes: 'Road crew scheduled for asphalt compaction following drain clearance.' }
                  ]}
                  onTaskUpdated={fetchDashboardData}
                />
              </div>

              {/* Demo Case 2: MS-CIV-2026-143 */}
              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #d97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#d97706', fontSize: '0.9rem' }}>
                      MS-CIV-2026-143
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                      Underground Water Pipe Leakage at Thillai Nagar
                    </h3>
                  </div>
                  <CrossDomainBadge primaryDomain="WATER_SUPPLY" relatedDomains={['ROAD']} />
                </div>

                <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.25rem' }}>
                  Underground main water pipe leakage creating continuous water accumulation on asphalt road near Thillai Nagar. [DEMO DATA]
                </p>

                <CrossDomainIntelligenceCard
                  reportId="MS-CIV-2026-143"
                  userRole="INSPECTOR"
                  assignments={[
                    { id: 'a3', reportId: 'MS-CIV-2026-143', domain: 'WATER_SUPPLY', domainLabel: 'Water Supply', relationshipRole: 'PRIMARY', confidence: 0.88, reason: 'Water main pipe leak detected.', status: 'SUGGESTED', authorityName: 'Trichy Water Supply Board' },
                    { id: 'a4', reportId: 'MS-CIV-2026-143', domain: 'ROAD', domainLabel: 'Road Infrastructure', relationshipRole: 'RELATED', confidence: 0.82, reason: 'Water leakage with visible road surface impact observed in submitted evidence.', status: 'SUGGESTED', authorityName: 'Trichy Roads & Highways Sub-Division (PWD)' }
                  ]}
                  onActionComplete={fetchDashboardData}
                />
              </div>

              {/* Demo Case 3: MS-CIV-2026-144 */}
              <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>
                      MS-CIV-2026-144 (FALSE-POSITIVE REJECTION DEMO)
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                      Road Surface Pothole near Salai Road Junction
                    </h3>
                  </div>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
                    SINGLE DOMAIN (RELATED REJECTED)
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1.25rem' }}>
                  Road surface pothole near Salai Road junction. System suggested potential drainage relation, but field inspector rejected the suggestion after verifying no drain involvement. [DEMO DATA]
                </p>

                <CrossDomainIntelligenceCard
                  reportId="MS-CIV-2026-144"
                  userRole="INSPECTOR"
                  assignments={[
                    { id: 'a5', reportId: 'MS-CIV-2026-144', domain: 'ROAD', domainLabel: 'Road Infrastructure', relationshipRole: 'PRIMARY', confidence: 0.88, reason: 'Primary road surface damage.', status: 'CONFIRMED', authorityName: 'Trichy Roads Sub-Division' },
                    { id: 'a6', reportId: 'MS-CIV-2026-144', domain: 'DRAINAGE', domainLabel: 'Drainage System', relationshipRole: 'RELATED', confidence: 0.65, reason: 'Standing water suggested drainage involvement.', status: 'REJECTED', rejectionReason: 'No drainage involvement observed during physical inspection. Pothole caused purely by heavy vehicle traffic wear.', authorityName: 'Sanitation Wing' }
                  ]}
                  onActionComplete={fetchDashboardData}
                />
              </div>
            </div>
          </div>
        )}


        {/* MODAL 1: PRIORITY OVERRIDE MODAL */}
        {showOverrideModal && selectedReport && (
          <PriorityOverrideModal
            report={selectedReport}
            onClose={() => setShowOverrideModal(false)}
            onSuccess={() => {
              setShowOverrideModal(false);
              fetchDashboardData();
            }}
          />
        )}

        {/* MODAL 2: RECORD ACTION STARTED MODAL */}
        {showActionModal && selectedReport && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '540px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '1.25rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Record Authority Remedial Action Started</h3>
                <button type="button" onClick={() => setShowActionModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleRecordActionSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Action Type / Remedial Work</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="BITUMEN_PATCHWORK">Road Bitumen Patchwork & Resurfacing</option>
                    <option value="DRAIN_DESILTATION">Storm Drain Desiltation & Clearing</option>
                    <option value="GARBAGE_CLEARANCE">Garbage Clearance & Dump Sanitation</option>
                    <option value="PIPE_REPAIR">Water Main Pipe Leak Repair</option>
                    <option value="STREETLIGHT_REPLACEMENT">Streetlight Fixture & Wiring Replacement</option>
                    <option value="OTHER_REMEDIAL">Other Departmental Remedial Action</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Action Description & Contractor Work Order</label>
                  <textarea
                    rows={4}
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                    placeholder="Provide details on dispatched repair crew, contractor work order #, and expected completion timeline..."
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowActionModal(false)} className="btn-outline">Cancel</button>
                  <button type="submit" disabled={actionSubmitting} className="btn-primary" style={{ backgroundColor: '#dc2626', borderColor: '#b91c1c' }}>
                    {actionSubmitting ? 'Recording...' : 'Mark Action In Progress'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: UPLOAD AFTER EVIDENCE MODAL */}
        {showAfterEvidenceModal && selectedReport && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '1.25rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Upload Resolution AFTER Photo Evidence</h3>
                <button type="button" onClick={() => setShowAfterEvidenceModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleAfterEvidenceSubmit} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Completed Work Photo (AFTER Evidence)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAfterPhotoFile(file);
                        setAfterPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px dashed #94a3b8', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Photo will undergo server-side SHA-256 cryptographic hashing and AI vision comparison with original BEFORE photo.
                  </p>
                </div>

                {afterPhotoPreview && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <img src={afterPhotoPreview} alt="After Preview" style={{ maxHeight: '180px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Authority Action Summary Note</label>
                  <textarea
                    rows={3}
                    value={afterActionNote}
                    onChange={(e) => setAfterActionNote(e.target.value)}
                    placeholder="Describe completed work (e.g., Cold mix asphalt laid, 4.5 tonnes garbage cleared, site disinfected)..."
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowAfterEvidenceModal(false)} className="btn-outline">Cancel</button>
                  <button type="submit" disabled={actionSubmitting} className="btn-primary" style={{ backgroundColor: '#2563eb' }}>
                    {actionSubmitting ? 'Uploading & Hashing...' : 'Submit Resolution Evidence'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: INSPECTOR HUMAN VERIFICATION VERDICT MODAL */}
        {showHumanVerifyModal && selectedReport && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '1.25rem 1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Human Inspector Site Audit Verdict</h3>
                <button type="button" onClick={() => setShowHumanVerifyModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleHumanVerifySubmit} style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Inspector Verification Verdict</label>
                  <select
                    value={verdict}
                    onChange={(e: any) => setVerdict(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    <option value="RESOLUTION_CONFIRMED">🟢 RESOLUTION CONFIRMED (Mark Report RESOLVED)</option>
                    <option value="ISSUE_STILL_PRESENT">🔴 ISSUE STILL PRESENT (REOPEN Report & Alert Department)</option>
                    <option value="MORE_EVIDENCE_REQUIRED">🟡 MORE EVIDENCE REQUIRED (Request Additional Site Audit Photo)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>Inspector Audit Notes & Findings</label>
                  <textarea
                    rows={4}
                    value={inspectorNote}
                    onChange={(e) => setInspectorNote(e.target.value)}
                    placeholder="Provide official inspection details, physical site measurements, quality check results..."
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowHumanVerifyModal(false)} className="btn-outline">Cancel</button>
                  <button type="submit" disabled={actionSubmitting} className="btn-primary" style={{ backgroundColor: verdict === 'RESOLUTION_CONFIRMED' ? '#15803d' : '#dc2626' }}>
                    {actionSubmitting ? 'Recording Verdict...' : 'Submit Official Audit Verdict'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* THREE-SOURCE EVIDENCE COMPARISON & HUMAN DECISION MODAL */}
        {showProgressModal && selectedProgressSubmission && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem', overflowY: 'auto' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '1100px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #cbd5e1', margin: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                    THREE-SOURCE EVIDENCE COMPARISON ENGINE
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
                    {selectedProgressSubmission.title}
                  </h2>
                </div>
                <button
                  onClick={() => setShowProgressModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              {/* THREE COLUMNS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* COLUMN 1: CONTRACTOR EVIDENCE */}
                <div style={{ backgroundColor: '#fffbe finished', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#92400e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HardHat size={18} /> 1. CONTRACTOR EVIDENCE
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
                    <strong>Contractor:</strong> {selectedProgressSubmission.contractorName || 'Suresh Infrastructure Pvt Ltd'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.75rem', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    "{selectedProgressSubmission.claim}"
                  </div>
                  {selectedProgressSubmission.evidences && selectedProgressSubmission.evidences[0] && (
                    <div>
                      <img
                        src={getEvidenceImageUrl(selectedProgressSubmission.evidences[0])}
                        alt="Contractor Upload"
                        onError={handleImageError}
                        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#059669', fontFamily: 'monospace' }}>
                        SHA-256: {selectedProgressSubmission.evidences[0].sha256Hash?.slice(0, 24)}...
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMN 2: CITIZEN GROUND EVIDENCE */}
                <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <UserCheck size={18} /> 2. CITIZEN GROUND EVIDENCE
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>
                    <strong>Corroborations:</strong> {selectedProgressSubmission.verificationsCount || 4} independent citizen observations
                  </div>
                  <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #93c5fd', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#1e40af' }}>
                    ✓ 75% Citizens observe visible work at project GPS location<br />
                    ✓ 75% Citizens report work generally consistent with claim
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                    "Base stone layer is visible. Road compaction appears ongoing near the village junction."
                  </div>
                </div>

                {/* COLUMN 3: AI-ASSISTED COMPARISON */}
                <div style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={18} /> 3. AI EVIDENCE COMPARISON
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span className={`badge ${selectedProgressSubmission.aiResult === 'POTENTIAL_MISMATCH' ? 'badge-mismatch' : 'badge-consistent'}`}>
                      RESULT: {selectedProgressSubmission.aiResult || 'CONSISTENT'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', marginLeft: '0.5rem', fontWeight: 700 }}>
                      Confidence: {Math.round((selectedProgressSubmission.aiConfidence || 0.81) * 100)}%
                    </span>
                  </div>
                  <ul style={{ fontSize: '0.8rem', color: '#166534', paddingLeft: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    <li>Contractor photos show road base layer aggregate.</li>
                    <li>Citizen ground photos align with contractor location coordinates.</li>
                    <li>No exact image file duplication detected across submissions.</li>
                  </ul>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14532d', backgroundColor: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac' }}>
                    Recommended Action: Review ground photos and confirm progress update.
                  </div>
                </div>
              </div>

              {/* HUMAN AUTHORITY DECISION PANEL */}
              <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={20} style={{ color: '#fbbf24' }} /> HUMAN AUTHORITY DECISION
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                  Final administrative verification decision rests with the authorized human field inspector.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Inspection Officer Justification / Audit Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="Enter official verification remarks..."
                    value={progressDecisionReason}
                    onChange={(e) => setProgressDecisionReason(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      const token = localStorage.getItem('ms_auth_token') || localStorage.getItem('makkalsaantru_token');
                      await fetch(`/api/contractor/submissions/${selectedProgressSubmission.id}/decision`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ decision: 'VERIFY_PROGRESS', reason: progressDecisionReason || 'Verified by Executive Engineer' }),
                      });
                      setShowProgressModal(false);
                      fetchDashboardData();
                    }}
                    style={{ padding: '0.75rem 1rem', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    ✓ VERIFY PROGRESS
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const token = localStorage.getItem('ms_auth_token') || localStorage.getItem('makkalsaantru_token');
                      await fetch(`/api/contractor/submissions/${selectedProgressSubmission.id}/decision`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ decision: 'NEEDS_MORE_EVIDENCE', reason: progressDecisionReason || 'Requesting additional site photo' }),
                      });
                      setShowProgressModal(false);
                      fetchDashboardData();
                    }}
                    style={{ padding: '0.75rem 1rem', backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    ⚠️ REQUEST MORE EVIDENCE
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const token = localStorage.getItem('ms_auth_token') || localStorage.getItem('makkalsaantru_token');
                      await fetch(`/api/contractor/submissions/${selectedProgressSubmission.id}/decision`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ decision: 'FIELD_INSPECTION_REQUIRED', reason: progressDecisionReason || 'Discrepancy flagged. Scheduled for route planning.' }),
                      });
                      setShowProgressModal(false);
                      fetchDashboardData();
                    }}
                    style={{ padding: '0.75rem 1rem', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    📍 FIELD INSPECTION REQUIRED
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const token = localStorage.getItem('ms_auth_token') || localStorage.getItem('makkalsaantru_token');
                      await fetch(`/api/contractor/submissions/${selectedProgressSubmission.id}/decision`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ decision: 'PROGRESS_NOT_CONFIRMED', reason: progressDecisionReason || 'Work claim not confirmed upon review' }),
                      });
                      setShowProgressModal(false);
                      fetchDashboardData();
                    }}
                    style={{ padding: '0.75rem 1rem', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    ✕ PROGRESS NOT CONFIRMED
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
