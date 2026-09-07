import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  WifiOff,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Truck,
  Droplet,
  Sun,
  Building,
  School,
  QrCode,
  Navigation,
  Globe,
  Camera,
} from 'lucide-react';
import { Project } from '../types';
import { cacheProjectsLocally, getCachedProjectsLocally, getAllPendingEvidence } from '../services/db';
import { useLanguage } from '../context/LanguageContext';
import { getCategoryLabel, getReportedStatusLabel, getTranslatedProject } from '../utils/projectTranslations';
import { Logo } from '../components/Logo';
import { TnEmblem } from '../components/TnEmblem';

export const CitizenDashboard: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const isTA = language === 'TA';

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Near me state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locatingNear, setLocatingNear] = useState<boolean>(false);
  const [nearMeActive, setNearMeActive] = useState<boolean>(false);

  useEffect(() => {
    fetchProjects(selectedCategory);
    loadPendingCount();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [selectedCategory]);

  const loadPendingCount = async () => {
    try {
      const items = await getAllPendingEvidence();
      const pending = items.filter((i) => i.syncStatus === 'PENDING_SYNC' || i.syncStatus === 'SYNC_FAILED');
      setPendingCount(pending.length);
    } catch {
      setPendingCount(0);
    }
  };

  const fetchProjects = async (category: string) => {
    setLoading(true);
    try {
      const query = category !== 'ALL' ? `?category=${category}` : '';
      const response = await fetch(`/api/projects${query}`);
      const data = await response.json();
      if (response.ok && data.projects) {
        setProjects(data.projects);
        await cacheProjectsLocally(data.projects);
      } else {
        throw new Error('Server returned non-ok status');
      }
    } catch (err) {
      console.warn('Failed to fetch projects online, attempting IndexedDB offline cache:', err);
      try {
        const cached = await getCachedProjectsLocally();
        if (category !== 'ALL') {
          setProjects(cached.filter((p) => p.category === category));
        } else {
          setProjects(cached);
        }
      } catch (cacheErr) {
        console.error('Failed to load offline cached projects:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleVerifyNearMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocatingNear(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setNearMeActive(true);
        setLocatingNear(false);
      },
      () => {
        setLocatingNear(false);
        alert('Location permission denied. Displaying standard project list.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'ROAD':
        return <Truck size={18} className="text-blue-600" />;
      case 'WATER':
        return <Droplet size={18} className="text-cyan-600" />;
      case 'STREETLIGHT':
        return <Sun size={18} className="text-amber-500" />;
      case 'SANITATION':
        return <Building size={18} className="text-emerald-600" />;
      case 'PUBLIC_BUILDING':
        return <School size={18} className="text-purple-600" />;
      default:
        return <Building size={18} className="text-slate-600" />;
    }
  };

  const categories = [
    { label: t('cat_all'), value: 'ALL' },
    { label: t('cat_road'), value: 'ROAD' },
    { label: t('cat_water'), value: 'WATER' },
    { label: t('cat_streetlight'), value: 'STREETLIGHT' },
    { label: t('cat_sanitation'), value: 'SANITATION' },
    { label: t('cat_public_building'), value: 'PUBLIC_BUILDING' },
  ];

  const processedProjects = projects
    .map((p) => {
      let distanceMeters: number | null = null;
      if (userLat !== null && userLng !== null) {
        distanceMeters = calculateDistance(userLat, userLng, p.latitude, p.longitude);
      }
      return { ...p, distanceMeters };
    })
    .sort((a, b) => {
      if (nearMeActive && a.distanceMeters !== null && b.distanceMeters !== null) {
        return a.distanceMeters - b.distanceMeters;
      }
      return 0;
    });

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Official Government Citizen Workspace Banner */}
      <div style={{
        background: `linear-gradient(135deg, rgba(2, 24, 43, 0.92) 0%, rgba(0, 43, 73, 0.85) 50%, rgba(2, 24, 43, 0.95) 100%), url('/citizen_hero.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '3rem 0 3.5rem',
        marginBottom: '2.5rem',
        borderBottom: '4px solid #10B981',
        boxShadow: 'inset 0 -30px 40px rgba(0,0,0,0.5)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.45rem 1.1rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.15) 100%)',
                border: '1.5px solid rgba(52, 211, 153, 0.5)',
                borderRadius: '9999px',
                color: '#34d399',
                fontSize: '0.85rem',
                fontWeight: 800,
                marginBottom: '1rem',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                letterSpacing: '0.02em',
              }}>
                <TnEmblem size={24} />
                <span>தமிழ்நாடு அரசு • {t('app_name')} • TNGIS VERIFIED</span>
              </div>
              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                {t('citizen_workspace_title')}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0, maxWidth: '650px' }}>
                {t('citizen_workspace_subtitle')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={toggleLanguage}
                className="btn"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 800,
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                }}
              >
                <Globe size={18} style={{ color: '#2563eb' }} />
                {language === 'EN' ? 'தமிழ் (Tamil)' : 'English'}
              </button>

              <button
                type="button"
                onClick={handleVerifyNearMe}
                className="btn"
                style={{
                  backgroundColor: nearMeActive ? '#10B981' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 800,
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Navigation size={18} style={{ color: nearMeActive ? '#ffffff' : '#38bdf8' }} />
                {locatingNear ? t('locating') : nearMeActive ? t('sorted_by_distance') : t('near_me')}
              </button>
            </div>
          </div>

          {/* TWO PRIMARY CITIZEN ACTIONS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
            {/* Card 1: VERIFY A PUBLIC WORK */}
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={32} style={{ color: '#34d399' }} />
                  <span style={{ backgroundColor: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                    ACTION 1
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.4rem 0', color: '#ffffff' }}>
                  {isTA ? 'பொதுப் பணியைச் சரிபார்க்கவும்' : 'VERIFY A PUBLIC WORK'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                  {isTA ? 'நடைபெறும் அரசு பொதுப்பணியின் முன்னேற்றத்தைச் சரிபார்க்கவும்.' : 'Check the progress of an existing public project.'}
                </p>
              </div>
              <a href="#projects-list" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>
                {isTA ? 'திட்டங்களைக் காண்க ↓' : 'EXPLORE PROJECTS BELOW ↓'}
              </a>
            </div>

            {/* Card 2: REPORT A CIVIC ISSUE */}
            <Link to="/citizen/report" style={{
              textDecoration: 'none',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              border: '2px solid #fbbf24',
              borderRadius: '16px',
              padding: '1.5rem',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', color: '#fbbf24' }}>
                    <Camera size={30} />
                    <MapPin size={30} />
                  </div>
                  <span style={{ backgroundColor: '#fbbf24', color: '#0f172a', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                    ACTION 2
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.4rem 0', color: '#ffffff' }}>
                  {isTA ? 'குடிமைப் பிரச்சினையைப் புகாரளிக்கவும்' : 'REPORT A CIVIC ISSUE'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                  {isTA ? 'பிரச்சினையைக் காண்கிறீர்களா? புகைப்படம் எடுங்கள், எங்கு புகாரளிக்க வேண்டும் என்பதை நாங்கள் வழிகாட்டுகிறோம்.' : 'See a problem? Take a photo and we\'ll help identify where it should be reported.'}
                </p>
              </div>
              <span style={{ display: 'inline-block', marginTop: '1.25rem', fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>
                {isTA ? 'புகாரளிக்கத் தொடக்குக →' : 'REPORT ISSUE NOW →'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-consistent">{t('demo_portal')}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <WifiOff size={14} /> {t('offline_queue_ready')}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              {t('projects_near_you')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              {t('inspect_projects_desc')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleVerifyNearMe}
              disabled={locatingNear}
              className="btn-primary"
              style={{ backgroundColor: nearMeActive ? '#16a34a' : '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Navigation size={18} /> {locatingNear ? t('locating') : nearMeActive ? t('sorted_by_distance') : t('near_me')}
            </button>

            <Link to="/citizen/pending" className="btn-outline" style={{ borderColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <WifiOff size={18} className="text-amber-500" /> {t('pending_reports')}
              {pendingCount > 0 && (
                <span style={{ backgroundColor: '#f59e0b', color: '#ffffff', borderRadius: '9999px', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                  {pendingCount}
                </span>
              )}
            </Link>

            <Link to="/citizen/qr-resolve" className="btn-outline" style={{ borderColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} /> {t('scan_qr')}
            </Link>

            <Link to="/citizen/submissions" className="btn-outline" style={{ borderColor: '#cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck size={18} /> {t('my_submissions')}
            </Link>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={16} /> {t('filter_by_category')}
          </span>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setNearMeActive(false);
              }}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                border: selectedCategory === cat.value && !nearMeActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: selectedCategory === cat.value && !nearMeActive ? '#2563eb' : '#ffffff',
                color: selectedCategory === cat.value && !nearMeActive ? '#ffffff' : '#475569',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Project Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Loading public projects...
          </div>
        ) : processedProjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#64748b' }}>No public projects found for category '{selectedCategory}'.</p>
          </div>
        ) : (
          <div className="grid-2">
            {processedProjects.map((rawProj) => {
              const proj = getTranslatedProject(rawProj, language);
              const currentMilestone = proj.reportedProgress <= 25 ? 25 : proj.reportedProgress <= 50 ? 50 : proj.reportedProgress <= 75 ? 75 : 100;
              return (
                <div key={proj.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        {getCategoryIcon(proj.category)} {getCategoryLabel(proj.category, language)}
                      </span>

                      {proj.distanceMeters !== null ? (
                        <span className="badge badge-consistent" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                          📍 {proj.distanceMeters < 1000 ? `${proj.distanceMeters} m` : `${(proj.distanceMeters / 1000).toFixed(1)} km`}
                        </span>
                      ) : (
                        <span className="badge badge-consistent">
                          {getReportedStatusLabel(proj.reportedProgress, language)}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                      {proj.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                      <MapPin size={16} style={{ color: '#94a3b8', flexShrink: 0 }} /> {proj.location}
                    </p>

                    <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '1.25rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {proj.description}
                    </p>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                        <span>{t('target_milestone')}: <strong>{currentMilestone}%</strong></span>
                        <span>{language === 'TA' ? 'குறியீடு' : 'Code'}: <strong>{proj.verificationCode || 'MS-ROAD-001'}</strong></span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${proj.reportedProgress}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/citizen/projects/${proj.id}`}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', gap: '0.5rem', padding: '0.65rem' }}
                    >
                      {t('view_and_verify')} <ArrowRight size={16} />
                    </Link>
                    <Link
                      to={`/admin/projects/${proj.id}/verification-code`}
                      className="btn-outline"
                      style={{ borderColor: '#cbd5e1', color: '#0f172a', padding: '0.65rem' }}
                      title="View Project QR Code"
                    >
                      <QrCode size={18} />
                    </Link>
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

