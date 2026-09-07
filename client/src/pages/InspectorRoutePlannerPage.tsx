import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  UserCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CivicHeatmapCanvas, RouteStopMarker } from '../components/civic/CivicHeatmapCanvas';

export interface PlannedStop {
  reportId: string;
  reportCode: string;
  issueType: string | null;
  category: string;
  priorityLevel: string;
  priorityScore: number;
  status: string;
  locationText: string | null;
  latitude: number | null;
  longitude: number | null;
  sequence: number;
  approxDistanceFromPreviousKm: number;
  ageDays: number;
}

export const InspectorRoutePlannerPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filters & Options State
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');
  const [ageFilter, setAgeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('Inspection Required');

  const [startLocationName, setStartLocationName] = useState<string>('Trichy Municipal Authority Office');
  const [startLat, setStartLat] = useState<number>(10.8270);
  const [startLong, setStartLong] = useState<number>(78.6920);
  const [maxCases, setMaxCases] = useState<number>(8);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(5);

  // Backend Data State
  const [metrics, setMetrics] = useState<any>({
    casesNeedingInspection: 23,
    highPriorityCount: 8,
    unassignedCount: 15,
    suggestedBatches: 4,
  });

  const [eligibleCases, setEligibleCases] = useState<any[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);

  // Route Proposal State
  const [routeProposal, setRouteProposal] = useState<any | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  // Assign Modal State
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');
  const [routeNameInput, setRouteNameInput] = useState<string>('');
  const [savingRoute, setSavingRoute] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Selected report IDs passed from Civic Heatmap via query param e.g. ?cases=id1,id2
  const preselectedCases = searchParams.get('cases')?.split(',') || [];

  useEffect(() => {
    fetchEligibleCases();
    fetchInspectors();
  }, [priorityFilter, categoryFilter, areaFilter, ageFilter]);

  const fetchEligibleCases = async () => {
    setLoadingCases(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const query = new URLSearchParams({
        priority: priorityFilter,
        category: categoryFilter,
        area: areaFilter,
        age: ageFilter,
      });

      const res = await fetch(`/api/authority/inspection-routes/eligible-cases?${query}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || metrics);
        setEligibleCases(data.cases || []);

        // Auto-trigger route generation if returning from map selection or initial load
        if (data.cases && data.cases.length > 0 && !routeProposal) {
          handleGenerateRoute(data.cases);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch eligible inspection cases:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  const fetchInspectors = async () => {
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch('/api/authority/inspectors', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setInspectors(data.inspectors || []);
      } else {
        // Fallback demo inspectors if endpoint returns 404
        setInspectors([
          { id: 'insp-1', name: 'AE S. Sundaram (Trichy Roads)', role: 'INSPECTOR' },
          { id: 'insp-2', name: 'SI M. Perumal (Sanitation)', role: 'INSPECTOR' },
          { id: 'insp-3', name: 'AE K. Vijay (Water Board)', role: 'INSPECTOR' },
        ]);
      }
    } catch {
      setInspectors([
        { id: 'insp-1', name: 'AE S. Sundaram (Trichy Roads)', role: 'INSPECTOR' },
        { id: 'insp-2', name: 'SI M. Perumal (Sanitation)', role: 'INSPECTOR' },
        { id: 'insp-3', name: 'AE K. Vijay (Water Board)', role: 'INSPECTOR' },
      ]);
    }
  };

  const handleGenerateRoute = async (customCasesList?: any[]) => {
    setGenerating(true);
    setSaveSuccessMsg(null);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch('/api/authority/inspection-routes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          startLat,
          startLong,
          startLocationName,
          maxCases,
          maxRadiusKm,
          priorityFilter,
          categoryFilter,
          areaFilter,
          ageFilter,
          selectedReportIds: preselectedCases.length > 0 ? preselectedCases : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRouteProposal(data.routeProposal);
        setRouteNameInput(`Batch Inspection - Chatram Hub (${data.routeProposal.stops.length} Cases)`);
      }
    } catch (err) {
      console.error('Error generating route:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndAssignRoute = async () => {
    if (!routeProposal || routeProposal.stops.length === 0) return;
    setSavingRoute(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch('/api/authority/inspection-routes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          name: routeNameInput || `Suggested Inspection Route`,
          startLocationName: routeProposal.startLocationName,
          startLat: routeProposal.startLat,
          startLong: routeProposal.startLong,
          approxTotalDistanceKm: routeProposal.approxTotalDistanceKm,
          routeExplanation: routeProposal.routeExplanation,
          inspectorId: selectedInspectorId || undefined,
          stops: routeProposal.stops.map((s: any) => ({
            reportId: s.reportId,
            approxDistanceFromPreviousKm: s.approxDistanceFromPreviousKm,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveSuccessMsg(`Route ${data.route.routeCode} saved & assigned successfully!`);
        setShowAssignModal(false);
        setTimeout(() => {
          navigate('/authority/my-routes');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to save route:', err);
    } finally {
      setSavingRoute(false);
    }
  };

  // Prepare map route stops from routeProposal or eligibleCases
  const mapRouteStops: RouteStopMarker[] = (routeProposal?.stops || eligibleCases).map((item: any, idx: number) => ({
    sequence: item.sequence || idx + 1,
    reportCode: item.reportCode,
    latitude: item.latitude || 10.827,
    longitude: item.longitude || 78.692,
    category: item.category,
    issueType: item.issueType || 'CIVIC ISSUE',
    priorityLevel: item.priorityLevel,
    locationText: item.locationText,
  }));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.05em', color: '#2563eb', textTransform: 'uppercase', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
              RESOURCE INTELLIGENCE • DECISION SUPPORT
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>[DEMO DATA PRE-SEEDED]</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Navigation style={{ color: '#2563eb' }} size={28} />
            {isTA ? 'ஆய்வாளர் பாதை திட்டமிடல்' : 'Inspector Route Planner'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>
            {isTA
              ? 'அருகிலுள்ள முன்னுரிமைப் புகார்களைத் திறமையான கள ஆய்வுத் தொகுதிகளாகக் குழுவாக்குங்கள்.'
              : 'Group nearby priority cases into efficient field inspection batches.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/authority/my-routes" className="btn btn-outline" style={{ fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px' }}>
            <UserCheck size={16} /> {isTA ? 'என் ஒதுக்கப்பட்ட பாதைகள்' : 'My Assigned Routes'}
          </Link>
          <Link to="/authority/inspection-routes/history" className="btn btn-outline" style={{ fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px' }}>
            <FileText size={16} /> {isTA ? 'பாதை வரலாறு' : 'Route History'}
          </Link>
        </div>
      </div>

      {/* TOP SUMMARY BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '12px', borderLeft: '4px solid #2563eb', backgroundColor: '#ffffff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            {isTA ? 'ஆய்வு செய்ய வேண்டிய புகார்கள்' : 'CASES NEEDING INSPECTION'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {metrics.casesNeedingInspection}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Eligible for field verification</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '12px', borderLeft: '4px solid #dc2626', backgroundColor: '#ffffff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            {isTA ? 'அவசர முன்னுரிமை' : 'HIGH PRIORITY'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626', marginTop: '0.2rem' }}>
            {metrics.highPriorityCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>Score &gt; 70 or Urgent Review</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '12px', borderLeft: '4px solid #d97706', backgroundColor: '#ffffff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            {isTA ? 'ஒதுக்கப்படாதவை' : 'UNASSIGNED'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d97706', marginTop: '0.2rem' }}>
            {metrics.unassignedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Awaiting inspector assignment</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', borderRadius: '12px', borderLeft: '4px solid #16a34a', backgroundColor: '#ffffff' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            {isTA ? 'பரிந்துரைக்கப்பட்ட தொகுதிகள்' : 'SUGGESTED BATCHES'}
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '0.2rem' }}>
            {metrics.suggestedBatches}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Optimized 250m-2km clusters</div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {saveSuccessMsg}
        </div>
      )}

      {/* 3-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: '1.25rem', minHeight: '680px' }}>
        
        {/* COLUMN 1: FILTERS & ROUTE PARAMETERS */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={18} style={{ color: '#2563eb' }} /> Filters & Criteria
          </h3>

          {/* Priority Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              PRIORITY LEVEL
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="URGENT_REVIEW">URGENT REVIEW ONLY</option>
              <option value="HIGH">HIGH PRIORITY</option>
              <option value="MEDIUM">MEDIUM PRIORITY</option>
              <option value="LOW">LOW PRIORITY</option>
            </select>
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              CIVIC CATEGORY
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="ROAD">ROAD</option>
              <option value="WATER_SUPPLY">WATER SUPPLY</option>
              <option value="DRAINAGE">DRAINAGE</option>
              <option value="SANITATION">SANITATION</option>
              <option value="STREETLIGHT">STREETLIGHT</option>
              <option value="PUBLIC_BUILDING">PUBLIC BUILDING</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* Age Filter */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              REPORT AGE
            </label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            >
              <option value="ALL">ALL AGES</option>
              <option value="<1_DAY">&lt; 1 DAY</option>
              <option value="1-3_DAYS">1 – 3 DAYS</option>
              <option value="3-7_DAYS">3 – 7 DAYS</option>
              <option value=">7_DAYS">&gt; 7 DAYS</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.25rem 0' }} />

          <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Navigation size={16} style={{ color: '#2563eb' }} /> Route Config
          </h3>

          {/* Start Location */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              STARTING POINT
            </label>
            <input
              type="text"
              value={startLocationName}
              onChange={(e) => setStartLocationName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>

          {/* Max Cases */}
          <div style={{ marginBottom: '0.9rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              MAX CASES PER BATCH ({maxCases})
            </label>
            <input
              type="range"
              min={3}
              max={15}
              value={maxCases}
              onChange={(e) => setMaxCases(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>

          {/* Max Radius */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
              MAX RADIUS ({maxRadiusKm} KM)
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={maxRadiusKm}
              onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>

          <button
            onClick={() => handleGenerateRoute()}
            disabled={generating}
            className="btn btn-primary"
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              padding: '0.75rem',
              fontWeight: 800,
              fontSize: '0.88rem',
              borderRadius: '10px',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Sparkles size={16} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Calculating Route...' : 'GENERATE SUGGESTED ROUTE'}
          </button>
        </div>

        {/* COLUMN 2: INTERACTIVE LEAFLET ROUTE MAP */}
        <div className="card" style={{ padding: '0', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} style={{ color: '#2563eb' }} />
              {isTA ? 'சுற்றறிக்கை வரைபடம்' : 'SUGGESTED FIELD INSPECTION ROUTE SEQUENCE'}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
              Showing {mapRouteStops.length} stops
            </span>
          </div>

          <div style={{ flex: 1, minHeight: '580px', position: 'relative' }}>
            <CivicHeatmapCanvas
              reports={[]}
              routeStops={mapRouteStops}
              displayMode="INDIVIDUAL_REPORTS"
            />
          </div>
        </div>

        {/* COLUMN 3: ROUTE SEQUENCE & RATIONALE */}
        <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', backgroundColor: '#ffffff', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              {isTA ? 'பரிந்துரைக்கப்பட்ட பாதை' : 'SUGGESTED ROUTE'}
            </h3>
            {routeProposal && (
              <span className="badge badge-consistent" style={{ fontSize: '0.72rem' }}>
                {routeProposal.approxTotalDistanceKm} KM TOTAL
              </span>
            )}
          </div>

          {routeProposal ? (
            <>
              {/* Start Origin */}
              <div style={{ padding: '0.6rem 0.8rem', backgroundColor: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase' }}>
                  STARTING LOCATION
                </div>
                <div style={{ fontWeight: 800, color: '#1e293b' }}>
                  🏢 {routeProposal.startLocationName}
                </div>
              </div>

              {/* Stop Sequence List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                {routeProposal.stops.map((stop: PlannedStop) => (
                  <div
                    key={stop.reportId}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {stop.sequence}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', fontFamily: 'monospace' }}>
                          {stop.reportCode}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          backgroundColor: stop.priorityLevel === 'URGENT_REVIEW' ? '#fee2e2' : stop.priorityLevel === 'HIGH' ? '#ffedd5' : '#f1f5f9',
                          color: stop.priorityLevel === 'URGENT_REVIEW' ? '#991b1b' : stop.priorityLevel === 'HIGH' ? '#c2410c' : '#475569',
                        }}
                      >
                        {stop.priorityLevel.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                      {stop.category} • {stop.issueType || 'CIVIC ISSUE'}
                    </div>

                    {(stop.reportCode === 'MS-CIV-2026-142' || stop.reportCode === 'MS-CIV-2026-143' || stop.category === 'DRAINAGE' || stop.category === 'WATER_SUPPLY') && (
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '0.4rem 0.6rem', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800 }}>
                          <span>🧩</span> COORDINATED CASE ({stop.category === 'WATER_SUPPLY' ? 'Water + Road' : 'Drainage + Road'})
                        </div>
                        <div style={{ marginTop: '0.25rem', color: '#334155', fontSize: '0.7rem' }}>
                          • Task 1: Primary {stop.category} Inspection & Action<br />
                          • Task 2: Dependent Road Surface Reassessment
                        </div>
                      </div>
                    )}

                    {stop.locationText && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.36rem' }}>
                        <MapPin size={12} style={{ color: '#0284c7' }} /> {stop.locationText}
                      </div>
                    )}


                    <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', paddingTop: '0.3rem', borderTop: '1px dashed #f1f5f9' }}>
                      <span>Leg distance: <strong>+{stop.approxDistanceFromPreviousKm} km</strong></span>
                      <span>Age: <strong>{stop.ageDays}d</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* RATIONALE CARD */}
              <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', color: '#78350f' }}>
                <div style={{ fontWeight: 900, color: '#b45309', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Info size={14} /> WHY THIS ROUTE?
                </div>
                {routeProposal.routeExplanation}
              </div>

              {/* RESOURCE INTELLIGENCE CARD */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', color: '#14532d' }}>
                <div style={{ fontWeight: 900, color: '#15803d', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Zap size={14} /> RESOURCE INTELLIGENCE
                </div>
                <strong>Without batching:</strong> {routeProposal.stops.length} separate inspection trips.
                <br />
                <strong>Suggested:</strong> 1 geographic inspection batch (~{routeProposal.approxTotalDistanceKm} km total span).
              </div>

              <button
                onClick={() => setShowAssignModal(true)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  backgroundColor: '#16a34a',
                  padding: '0.75rem',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <UserCheck size={18} /> {isTA ? 'ஆய்வாளருக்குப் பாதையை ஒதுக்குக' : 'ASSIGN ROUTE TO INSPECTOR'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <Navigation size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>No route proposal calculated yet</div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click "Generate Suggested Route" to calculate a batch.</p>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN INSPECTOR MODAL */}
      {showAssignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem', borderRadius: '16px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
              {isTA ? 'ஆய்வாளரை நியமிக்கவும்' : 'Assign Inspection Route'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Assign this suggested batch of {routeProposal?.stops.length} cases to an authorized field inspector.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                ROUTE TITLE
              </label>
              <input
                type="text"
                value={routeNameInput}
                onChange={(e) => setRouteNameInput(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                SELECT INSPECTOR
              </label>
              <select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="">Select an Authorized Inspector...</option>
                {inspectors.map((insp) => (
                  <option key={insp.id} value={insp.id}>
                    {insp.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndAssignRoute}
                disabled={savingRoute || !selectedInspectorId}
                className="btn btn-primary"
                style={{ backgroundColor: '#16a34a', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                {savingRoute ? 'Saving...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
