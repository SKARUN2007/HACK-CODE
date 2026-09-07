import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map,
  Layers,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  TrendingUp,
  RotateCcw,
  Sparkles,
  List,
  Eye,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TnEmblem } from '../components/TnEmblem';
import { CivicHeatmapCanvas, MapCivicReport, HotspotMarkerData } from '../components/civic/CivicHeatmapCanvas';

export const CivicIntelligenceMapPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';
  const navigate = useNavigate();

  // Data States
  const [reports, setReports] = useState<MapCivicReport[]>([]);
  const [hotspots, setHotspots] = useState<HotspotMarkerData[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Filter States
  const [displayMode, setDisplayMode] = useState<'HEATMAP' | 'CLUSTERS' | 'INDIVIDUAL_REPORTS' | 'AREA_SUMMARY' | 'TABLE_VIEW'>('HEATMAP');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<string>('ALL_TIME');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotMarkerData | null>(null);

  useEffect(() => {
    fetchMapIntelligenceData();
  }, [categoryFilter, statusFilter, priorityFilter, timeFilter, selectedArea]);

  const fetchMapIntelligenceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('makkalsaantru_token') || '';
      const headers = { Authorization: token ? `Bearer ${token}` : '' };

      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);
      if (timeFilter !== 'ALL_TIME') params.append('timeRange', timeFilter);
      if (selectedArea !== 'ALL') params.append('area', selectedArea);

      // 1. Fetch Reports
      const resReports = await fetch(`/api/authority/civic-map?${params.toString()}`, { headers });
      if (resReports.ok) {
        const data = await resReports.json();
        setReports(data.reports || []);
      }

      // 2. Fetch Hotspots
      const resHotspots = await fetch(`/api/authority/civic-map/hotspots?${params.toString()}`, { headers });
      if (resHotspots.ok) {
        const data = await resHotspots.json();
        setHotspots(data.hotspots || []);
      }

      // 3. Fetch Areas
      const resAreas = await fetch(`/api/authority/civic-map/areas?${params.toString()}`, { headers });
      if (resAreas.ok) {
        const data = await resAreas.json();
        setAreas(data.areas || []);
      }

      // 4. Fetch Stats & Intelligence Cards
      const resStats = await fetch(`/api/authority/civic-map/stats?${params.toString()}`, { headers });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('[CivicMap] Error fetching map intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  // Active Area Data
  const currentAreaObj = areas.find((a) => a.areaName === selectedArea) || areas[0];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Official Government & Intelligence Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, rgba(2, 24, 43, 0.94) 0%, rgba(0, 43, 73, 0.88) 50%, rgba(2, 24, 43, 0.96) 100%), url('/hero_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '2.5rem 0 3rem',
        marginBottom: '2rem',
        borderBottom: '4px solid #FBBF24',
        boxShadow: 'inset 0 -30px 40px rgba(0,0,0,0.5)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', backgroundColor: 'rgba(251, 191, 36, 0.2)', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '9999px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                <TnEmblem size={24} /> {isTA ? 'தமிழ்நாடு அரசு • PWD இட அமைவியல் அறிவுக் கூடம்' : 'GOVERNMENT OF TAMIL NADU • GEOSPATIAL RESOURCE INTELLIGENCE'}
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                {isTA ? 'நகரப் புகார் அமைவிட வரைபடம் (CIVIC INTELLIGENCE MAP)' : 'Civic Intelligence Map'}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, maxWidth: '780px', lineHeight: 1.4 }}>
                {isTA
                  ? 'பொதுமக்களின் புகார்களை வரைபடத்தில் பகுப்பாய்வு செய்து அவசர பகுதிகளை இனங்கண்டு பராமரிப்பு வளங்களை முன்னுரிமைப்படுத்த உதவும் தளம்.'
                  : 'Civic Heatmap transforms individual citizen reports into area-level intelligence. It helps authorized officials identify report concentrations, detect recurring hotspots, and prioritize maintenance resources.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fbbf24', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={16} /> DEMO DATA • TRICHY CLUSTERS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">

        {/* JUDGE EXPLANATION & DISCLAIMER BANNER */}
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.3 }}>
              <strong>Resource Intelligence Principle:</strong> Heatmap intensity represents report concentration & citizen corroboration density, not confirmed damage severity.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPriorityFilter('HIGH_UNRESOLVED');
            }}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', backgroundColor: '#dc2626', borderColor: '#b91c1c' }}
          >
            🔴 Show Only High-Priority Unresolved Cases
          </button>
        </div>

        {/* TOP FILTER CONTROLS BAR */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Row 1: Display Mode Selector Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginRight: '0.5rem' }}>
                Display Mode:
              </span>

              <button
                type="button"
                onClick={() => setDisplayMode('HEATMAP')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: displayMode === 'HEATMAP' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: displayMode === 'HEATMAP' ? '#eff6ff' : '#ffffff',
                  color: displayMode === 'HEATMAP' ? '#1d4ed8' : '#475569',
                }}
              >
                🔥 HEATMAP INTENSITY
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('CLUSTERS')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: displayMode === 'CLUSTERS' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  backgroundColor: displayMode === 'CLUSTERS' ? '#fef2f2' : '#ffffff',
                  color: displayMode === 'CLUSTERS' ? '#991b1b' : '#475569',
                }}
              >
                📍 MARKER CLUSTERS
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('INDIVIDUAL_REPORTS')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: displayMode === 'INDIVIDUAL_REPORTS' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  backgroundColor: displayMode === 'INDIVIDUAL_REPORTS' ? '#f0fdf4' : '#ffffff',
                  color: displayMode === 'INDIVIDUAL_REPORTS' ? '#15803d' : '#475569',
                }}
              >
                📌 INDIVIDUAL PINS
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('AREA_SUMMARY')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: displayMode === 'AREA_SUMMARY' ? '2px solid #9333ea' : '1px solid #cbd5e1',
                  backgroundColor: displayMode === 'AREA_SUMMARY' ? '#faf5ff' : '#ffffff',
                  color: displayMode === 'AREA_SUMMARY' ? '#7e22ce' : '#475569',
                }}
              >
                🏛️ AREA OVERLAYS
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode('TABLE_VIEW')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  border: displayMode === 'TABLE_VIEW' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                  backgroundColor: displayMode === 'TABLE_VIEW' ? '#0f172a' : '#ffffff',
                  color: displayMode === 'TABLE_VIEW' ? '#ffffff' : '#475569',
                }}
              >
                📊 ACCESSIBLE TABLE VIEW
              </button>
            </div>

            {/* Row 2: Category Filter Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginRight: '0.5rem' }}>
                Category:
              </span>
              {['ALL', 'CROSS_DOMAIN', 'ROAD', 'SANITATION', 'WATER_SUPPLY', 'DRAINAGE', 'STREETLIGHT', 'PUBLIC_BUILDING', 'SEWAGE', 'PUBLIC_SPACE', 'OTHER'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: categoryFilter === cat ? (cat === 'CROSS_DOMAIN' ? '1px solid #059669' : '1px solid #2563eb') : '1px solid #cbd5e1',
                    backgroundColor: categoryFilter === cat ? (cat === 'CROSS_DOMAIN' ? '#059669' : '#2563eb') : (cat === 'CROSS_DOMAIN' ? '#f0fdf4' : '#ffffff'),
                    color: categoryFilter === cat ? '#ffffff' : (cat === 'CROSS_DOMAIN' ? '#047857' : '#475569'),
                  }}
                >
                  {cat === 'CROSS_DOMAIN' ? '🧩 CROSS-DOMAIN CASES' : cat.replace(/_/g, ' ')}
                </button>
              ))}

            </div>

            {/* Row 3: Multi-Select Dropdowns */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">All Open Unresolved</option>
                  <option value="REPORTED">REPORTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="ACTION_IN_PROGRESS">ACTION IN PROGRESS</option>
                  <option value="AWAITING_REVERIFICATION">AWAITING REVERIFICATION</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REOPENED">REOPENED</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH_UNRESOLVED">🔴 High-Priority Unresolved</option>
                  <option value="URGENT_REVIEW">URGENT REVIEW (80-100)</option>
                  <option value="HIGH">HIGH (55-79)</option>
                  <option value="MEDIUM">MEDIUM (30-54)</option>
                  <option value="LOW">LOW (0-29)</option>
                </select>
              </div>

              {/* Time Range Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Time Period:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="ALL_TIME">All Time</option>
                  <option value="24H">Last 24 Hours</option>
                  <option value="7D">Last 7 Days</option>
                  <option value="30D">Last 30 Days</option>
                  <option value="90D">Last 90 Days</option>
                </select>
              </div>

              {/* Reset Filters */}
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('ALL');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setTimeFilter('ALL_TIME');
                  setSelectedArea('ALL');
                }}
                className="btn-outline"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
              >
                ↻ Reset Filters
              </button>
            </div>

          </div>
        </div>

        {/* MAIN DISPLAY GRID */}
        {displayMode === 'TABLE_VIEW' ? (
          /* ACCESSIBLE TABLE VIEW ALTERNATIVE */
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>
                ACCESSIBLE CIVIC INTELLIGENCE TABLE VIEW ({reports.length} Reports)
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Screen Reader Accessible</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Report Code / ID</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category & Title</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Locality / Area</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Action Priority Score</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                        {r.reportCode} {r.isDemoCase && <span style={{ color: '#2563eb' }}>[DEMO]</span>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{r.title}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>{r.category}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>📍 {r.locationText}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          fontWeight: 900,
                          backgroundColor: r.actionPriorityScore >= 75 ? '#fee2e2' : r.actionPriorityScore >= 50 ? '#ffedd5' : '#dcfce7',
                          color: r.actionPriorityScore >= 75 ? '#991b1b' : r.actionPriorityScore >= 50 ? '#9a3412' : '#166534',
                        }}>
                          {r.actionPriorityScore}/100 ({r.priorityLevel})
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#334155' }}>{r.status}</td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => navigate('/authority/dashboard')}
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          View Case →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GEOSPATIAL MAP & PANELS LAYOUT */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* LEFT MAIN MAP */}
            <div>
              <CivicHeatmapCanvas
                reports={reports}
                hotspots={hotspots}
                displayMode={displayMode}
                selectedCategory={categoryFilter}
                onSelectHotspot={(h) => setSelectedHotspot(h)}
              />

              {/* MAP LEGEND BAR */}
              <div className="card" style={{ marginTop: '1rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>Heat Intensity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                    <span>Low Report Density</span>
                    <div style={{ width: '100px', height: '8px', borderRadius: '999px', background: 'linear-gradient(to right, #22c55e, #eab308, #ea580c, #dc2626)' }} />
                    <span>High Density</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', fontWeight: 700 }}>
                  <span style={{ color: '#dc2626' }}>🔴 Urgent (80-100)</span>
                  <span style={{ color: '#ea580c' }}>🟠 High (55-79)</span>
                  <span style={{ color: '#d97706' }}>🟡 Medium (30-54)</span>
                  <span style={{ color: '#16a34a' }}>🟢 Low (0-29)</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE PANELS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* PANEL 1: AREA INTELLIGENCE PANEL */}
              <div className="card" style={{ padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Building size={18} style={{ color: '#2563eb' }} /> AREA INTELLIGENCE
                  </h3>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>Select Ward / Locality Area:</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <option value="ALL">All Trichy Districts & Wards</option>
                    {areas.map((a) => (
                      <option key={a.areaName} value={a.areaName}>{a.areaName} ({a.totalReports} Reports)</option>
                    ))}
                  </select>
                </div>

                {currentAreaObj && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>Total Reports</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{currentAreaObj.totalReports}</div>
                    </div>
                    <div>
                      <div style={{ color: '#dc2626', fontSize: '0.72rem', fontWeight: 700 }}>Open Cases</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626' }}>{currentAreaObj.openCases}</div>
                    </div>
                    <div>
                      <div style={{ color: '#d97706', fontSize: '0.72rem', fontWeight: 700 }}>High Priority</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#d97706' }}>{currentAreaObj.highPriorityCases}</div>
                    </div>
                    <div>
                      <div style={{ color: '#16a34a', fontSize: '0.72rem', fontWeight: 700 }}>Resolved</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>{currentAreaObj.resolvedCases}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        Most Common: <strong>{currentAreaObj.mostCommonCategory}</strong><br />
                        Avg Resolution Time: <strong>{currentAreaObj.avgResolutionTimeDays} days</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PANEL 2: HOTSPOT DETECTION LIST */}
              <div className="card" style={{ padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={18} style={{ color: '#dc2626' }} /> CIVIC HOTSPOTS ({hotspots.length})
                </h3>

                {hotspots.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', padding: '1rem 0' }}>
                    No hotspots detected for current filters.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '360px', overflowY: 'auto' }}>
                    {hotspots.map((h) => (
                      <div
                        key={h.hotspotId}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '8px',
                          border: `1px solid ${h.attentionLevel === 'HIGH_ATTENTION' ? '#fca5a5' : '#cbd5e1'}`,
                          backgroundColor: h.attentionLevel === 'HIGH_ATTENTION' ? '#fff1f2' : '#ffffff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: h.attentionLevel === 'HIGH_ATTENTION' ? '#dc2626' : '#ea580c',
                            color: '#ffffff',
                          }}>
                            {h.attentionLevel.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
                            {h.reportCount} Reports
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#0f172a' }}>
                          {h.localityName}
                        </h4>

                        <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '0.4rem' }}>
                          {h.highPriorityCount} high priority • {h.independentCitizenCount} independent citizens
                        </div>

                        <ul style={{ margin: '0 0 0.5rem 1rem', padding: 0, fontSize: '0.72rem', color: '#334155' }}>
                          {h.explainableReasons.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => setSelectedHotspot(h)}
                          style={{ width: '100%', padding: '0.35rem', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Focus Map on Hotspot →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* RESOURCE INTELLIGENCE INSIGHT CARDS */}
        {stats && stats.resourceCards && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} style={{ color: '#2563eb' }} /> RESOURCE INTELLIGENCE ACTION CARDS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {stats.resourceCards.map((card: any) => (
                <div key={card.id} className="card" style={{ padding: '1.25rem', borderLeft: `5px solid ${card.severity === 'URGENT' ? '#dc2626' : '#ea580c'}` }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: card.severity === 'URGENT' ? '#dc2626' : '#ea580c', textTransform: 'uppercase' }}>
                    {card.title}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0.4rem 0' }}>
                    {card.subtitle}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
                    {card.description}
                  </p>
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>
                    {card.metricLabel}: <span style={{ color: '#2563eb' }}>{card.metricValue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/authority/dashboard')}
                    className="btn-outline"
                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', fontWeight: 800, justifyContent: 'center' }}
                  >
                    {card.actionText} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORY INTELLIGENCE & TREND SUMMARY */}
        {stats && stats.trends && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: '#16a34a' }} /> CATEGORY REPORT VOLUME & TREND INDICATORS
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {stats.trends.map((trend: any) => (
                <div key={trend.category} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{trend.category}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: trend.changePercent > 0 ? '#dc2626' : '#16a34a',
                      backgroundColor: trend.changePercent > 0 ? '#fef2f2' : '#f0fdf4',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}>
                      {trend.changePercent > 0 ? `+${trend.changePercent}%` : `${trend.changePercent}%`}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb' }}>
                    {trend.currentCount} Reports
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    REPORT VOLUME CHANGE vs prior 7d
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
