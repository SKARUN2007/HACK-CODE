import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, ShieldCheck, AlertTriangle, Layers, Map, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export interface MapProjectMarker {
  id: string;
  title: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  reportedProgress: number;
  priorityScore: number;
  result: 'CONSISTENT' | 'REVIEW' | 'POTENTIAL_MISMATCH';
  humanStatus: string;
  evidenceCount: number;
}

interface PriorityMapProps {
  projects: MapProjectMarker[];
}

const DEFAULT_MAP_PROJECTS: MapProjectMarker[] = [
  {
    id: 'proj-demo-1',
    title: 'Chennai Metro Phase 2 Elevated Corridor & Station Complex',
    category: 'TRANSPORT',
    location: 'Chennai, Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    reportedProgress: 75,
    priorityScore: 78,
    result: 'POTENTIAL_MISMATCH',
    humanStatus: 'PENDING_HUMAN_INSPECTION',
    evidenceCount: 14,
  },
  {
    id: 'proj-demo-2',
    title: 'Madurai Smart Water Supply Pipeline Infrastructure',
    category: 'WATER',
    location: 'Madurai, Tamil Nadu',
    latitude: 9.9252,
    longitude: 78.1198,
    reportedProgress: 50,
    priorityScore: 42,
    result: 'REVIEW',
    humanStatus: 'UNDER_INSPECTION',
    evidenceCount: 8,
  },
  {
    id: 'proj-demo-3',
    title: 'Coimbatore Solar Power Substation & Grid Feeder',
    category: 'ENERGY',
    location: 'Coimbatore, Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    reportedProgress: 100,
    priorityScore: 12,
    result: 'CONSISTENT',
    humanStatus: 'HUMAN_CONFIRMED',
    evidenceCount: 19,
  },
  {
    id: 'proj-demo-4',
    title: 'Tiruchirappalli Multi-Modal Bus Terminal & Infrastructure',
    category: 'TRANSPORT',
    location: 'Tiruchirappalli, Tamil Nadu',
    latitude: 10.7905,
    longitude: 78.7047,
    reportedProgress: 60,
    priorityScore: 55,
    result: 'REVIEW',
    humanStatus: 'PENDING_HUMAN_INSPECTION',
    evidenceCount: 6,
  },
  {
    id: 'proj-demo-5',
    title: 'Salem Four-Lane Elevated Flyover Construction',
    category: 'ROADS',
    location: 'Salem, Tamil Nadu',
    latitude: 11.6643,
    longitude: 78.1460,
    reportedProgress: 85,
    priorityScore: 82,
    result: 'POTENTIAL_MISMATCH',
    humanStatus: 'PENDING_HUMAN_INSPECTION',
    evidenceCount: 11,
  },
];

export const PriorityMap: React.FC<PriorityMapProps> = ({ projects }) => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  // Use passed projects or fallback default Tamil Nadu projects if empty
  const displayProjects = projects && projects.length > 0 ? projects : DEFAULT_MAP_PROJECTS;

  const [activeProject, setActiveProject] = useState<MapProjectMarker>(displayProjects[0]);
  const [viewMode, setViewMode] = useState<'MAP' | 'GRID'>('MAP');

  // Keep active project valid if displayProjects change
  useEffect(() => {
    if (!activeProject || !displayProjects.some((p) => p.id === activeProject.id)) {
      setActiveProject(displayProjects[0]);
    }
  }, [displayProjects]);

  const getMarkerColor = (result: string) => {
    switch (result) {
      case 'POTENTIAL_MISMATCH':
        return '#dc2626'; // Red
      case 'REVIEW':
        return '#d97706'; // Amber
      case 'CONSISTENT':
        return '#16a34a'; // Green
      default:
        return '#2563eb';
    }
  };

  // Dynamic Leaflet Map Initialization
  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      try {
        // Ensure Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Ensure Leaflet JS
        if (!(window as any).L) {
          await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.id = 'leaflet-js';
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => resolve();
            script.onerror = () => resolve();
            document.body.appendChild(script);
          });
        }

        const L = (window as any).L;
        if (!L) return;

        const container = document.getElementById('leaflet-gis-map-canvas');
        if (!container) return;

        // Reset previous Leaflet instance on container if needed
        if ((container as any)._leaflet_id) {
          container.innerHTML = '';
          (container as any)._leaflet_id = null;
        }

        mapInstance = L.map('leaflet-gis-map-canvas', {
          center: [10.8505, 78.6569], // Central Tamil Nadu
          zoom: 7,
          zoomControl: true,
        });

        // Standard OpenStreetMap Tile Layer (100% Free & No API Key Required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // Add markers for all projects
        displayProjects.forEach((p) => {
          const color = getMarkerColor(p.result);
          const icon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px ${color}; cursor: pointer; transition: transform 0.2s;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          const marker = L.marker([p.latitude, p.longitude], { icon }).addTo(mapInstance);
          marker.bindTooltip(
            `<div style="font-weight: 800; color: #002B49;">${p.category}</div><div style="font-size: 0.8rem;">${p.title}</div><div style="color:${color}; font-weight:700;">Score: ${p.priorityScore}/100</div>`,
            { direction: 'top', opacity: 0.95 }
          );

          marker.on('click', () => {
            setActiveProject(p);
          });
        });
      } catch (e) {
        console.warn('Leaflet map load error:', e);
      }
    };

    if (viewMode === 'MAP') {
      // Delay slightly for DOM render
      const timer = setTimeout(initMap, 100);
      return () => {
        clearTimeout(timer);
        if (mapInstance) mapInstance.remove();
      };
    }
  }, [viewMode, displayProjects]);

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
      {/* MAP HEADER */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MapPin size={20} style={{ color: '#60a5fa' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
              {isTA ? 'அரசுத் திட்ட புவிசார் முன்னுரிமை வரைபடம் (GIS Map)' : 'PROJECT PRIORITY MAP'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isTA ? 'தமிழ்நாடு அரசு கள ஆய்வு வழிகாட்டு அமைப்புகள்' : 'Geospatial Inspection Guidance & Field Intelligence'}
            </span>
          </div>
        </div>

        {/* VIEW MODE TOGGLE & LEGEND */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#dc2626' }} />
              {isTA ? 'அதிமுக்கியத்துவம் (சிவப்பு)' : 'High Priority (Red)'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#d97706' }} />
              {isTA ? 'ஆய்வு தேவை (மஞ்சள்)' : 'Review Needed (Amber)'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#16a34a' }} />
              {isTA ? 'சரியானது (பச்சை)' : 'Consistent (Green)'}
            </span>
          </div>

          <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '0.2rem', borderRadius: '6px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('MAP')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'MAP' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Map size={14} /> {isTA ? 'வரைபடம்' : 'GIS Map'}
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: viewMode === 'GRID' ? '#2563eb' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Layers size={14} /> {isTA ? 'பட்டியல்' : 'Grid List'}
            </button>
          </div>
        </div>
      </div>

      {/* MAP & DETAILS SPLIT LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: '380px' }}>
        {/* LEFT CONTAINER: LEAFLET CANVAS OR INTERACTIVE GRID */}
        <div style={{ backgroundColor: '#0f172a', position: 'relative', borderRight: '1px solid #334155', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'MAP' ? (
            <div style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}>
              <div id="leaflet-gis-map-canvas" style={{ width: '100%', height: '100%', minHeight: '380px', borderRadius: '0' }} />
              {/* Overlay Marker Quick Selector Bar */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', zIndex: 1000, backgroundColor: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(8px)', padding: '0.6rem', borderRadius: '8px', border: '1px solid #334155', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {displayProjects.map((p) => {
                  const isActive = activeProject?.id === p.id;
                  const color = getMarkerColor(p.result);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveProject(p)}
                      style={{
                        backgroundColor: isActive ? '#1e293b' : 'transparent',
                        border: isActive ? `2px solid ${color}` : '1px solid #334155',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        color: '#ffffff',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
                      <span style={{ fontWeight: 700 }}>{p.location.split(',')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                {isTA ? 'கள ஆய்வு தகவல்களைக் காண திட்டத்தைக் தேர்ந்தெடுக்கவும்:' : 'Select a project to inspect geospatial verification details:'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {displayProjects.map((p) => {
                  const isActive = activeProject?.id === p.id;
                  const color = getMarkerColor(p.result);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveProject(p)}
                      style={{
                        backgroundColor: isActive ? '#1e293b' : '#0f172a',
                        border: isActive ? `2px solid ${color}` : '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.75rem 0.6rem',
                        color: '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: color, fontWeight: 700, marginTop: '0.3rem' }}>
                        Score: {p.priorityScore}/100
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CONTAINER: SELECTED PROJECT INTELLIGENCE POPUP */}
        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {activeProject ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.78rem', fontWeight: 700 }}>
                  {activeProject.category} • ID: {activeProject.id}
                </span>

                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: getMarkerColor(activeProject.result), backgroundColor: '#ffffff', padding: '0.25rem 0.65rem', borderRadius: '9999px', border: `1.5px solid ${getMarkerColor(activeProject.result)}` }}>
                  Score: {activeProject.priorityScore}/100 ({activeProject.result.replace('_', ' ')})
                </span>
              </div>

              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {activeProject.title}
              </h4>

              <p style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
                <MapPin size={16} style={{ color: '#2563eb', flexShrink: 0 }} /> <strong>{activeProject.location}</strong> ({activeProject.latitude.toFixed(4)}° N, {activeProject.longitude.toFixed(4)}° E)
              </p>

              <div style={{ backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', fontSize: '0.85rem', color: '#334155' }}>
                  <div>{isTA ? 'அறிவிக்கப்பட்ட முன்னேற்றம்:' : 'Reported Milestone:'} <strong style={{ color: '#0f172a' }}>{activeProject.reportedProgress}%</strong></div>
                  <div>{isTA ? 'பொதுமக்கள் சான்றுகள்:' : 'Citizen Proofs:'} <strong style={{ color: '#0f172a' }}>{activeProject.evidenceCount} {isTA ? 'பதிவுகள்' : 'Submissions'}</strong></div>
                  <div>{isTA ? 'மனித ஆய்வாளர் நிலை:' : 'Human Audit Status:'} <strong style={{ color: '#0f172a' }}>{activeProject.humanStatus}</strong></div>
                  <div>{isTA ? 'புவி எல்லைக் கட்டுப்பாடு:' : 'Geofence Guard:'} <strong style={{ color: '#16a34a' }}>✓ Active GPS</strong></div>
                </div>
              </div>

              <Link
                to={`/authority/projects/${activeProject.id}`}
                className="btn-primary"
                onClick={() => window.scrollTo(0, 0)}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                {isTA ? 'முழுமையான கள ஆய்வு விவரங்கள் →' : 'VIEW FULL PROJECT INTELLIGENCE →'}
              </Link>
            </div>
          ) : (
            <div style={{ color: '#64748b', textAlign: 'center', margin: 'auto' }}>
              {isTA ? 'கள ஆய்வு விவரங்களைக் காண வரைபடத்தில் ஒரு புள்ளியைத் தேர்ந்தெடுக்கவும்.' : 'Select a marker on the map to inspect project priority status.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

