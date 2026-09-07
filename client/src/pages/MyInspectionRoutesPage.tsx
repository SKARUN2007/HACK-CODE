import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  SkipForward,
  ExternalLink,
  Camera,
  FileText,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MyInspectionRoutesPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Stop Action Modal State
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<string>('INSPECTION_COMPLETED');
  const [note, setNote] = useState<string>('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Skip Modal State
  const [showSkipModal, setShowSkipModal] = useState<boolean>(false);
  const [skipReason, setSkipReason] = useState<string>('ACCESS_ISSUE');
  const [skipNotes, setSkipNotes] = useState<string>('');
  const [submittingSkip, setSubmittingSkip] = useState<boolean>(false);

  useEffect(() => {
    fetchMyRoutes();
  }, []);

  const fetchMyRoutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch('/api/authority/inspection-routes/my-routes', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        const routeList = data.routes || [];
        setRoutes(routeList);
        if (routeList.length > 0 && !activeRoute) {
          setActiveRoute(routeList[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch assigned routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = async (routeId: string) => {
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch(`/api/authority/inspection-routes/${routeId}/start`, {
        method: 'PATCH',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRoute(data.route);
        await fetchMyRoutes();
      }
    } catch (err) {
      console.error('Failed to start route:', err);
    }
  };

  const handleSubmitStopAction = async () => {
    if (!activeRoute || !activeRoute.stops[activeStopIndex]) return;
    const currentStop = activeRoute.stops[activeStopIndex];
    setSubmittingAction(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch(`/api/authority/inspection-routes/${activeRoute.id}/stops/${currentStop.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          verdict,
          note,
          afterPhotoUrl: afterPhotoUrl || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRoute(data.route);
        setShowActionModal(false);
        setNote('');
        setAfterPhotoUrl('');

        // Move to next pending stop if available
        if (activeStopIndex < data.route.stops.length - 1) {
          setActiveStopIndex(activeStopIndex + 1);
        }
        await fetchMyRoutes();
      }
    } catch (err) {
      console.error('Failed to record stop action:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSkipStop = async () => {
    if (!activeRoute || !activeRoute.stops[activeStopIndex]) return;
    const currentStop = activeRoute.stops[activeStopIndex];
    setSubmittingSkip(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch(`/api/authority/inspection-routes/${activeRoute.id}/stops/${currentStop.id}/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          skipReason,
          skipNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRoute(data.route);
        setShowSkipModal(false);
        setSkipNotes('');

        if (activeStopIndex < data.route.stops.length - 1) {
          setActiveStopIndex(activeStopIndex + 1);
        }
        await fetchMyRoutes();
      }
    } catch (err) {
      console.error('Failed to skip stop:', err);
    } finally {
      setSubmittingSkip(false);
    }
  };

  const currentStop = activeRoute?.stops?.[activeStopIndex];
  const report = currentStop?.report;

  const getGoogleMapsUrl = (lat?: number, lng?: number) => {
    if (!lat || !lng) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Navigation style={{ color: '#2563eb' }} size={28} />
            {isTA ? 'என் ஒதுக்கப்பட்ட ஆய்வுப் பாதைகள்' : 'My Field Inspection Routes'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            {isTA ? 'உங்கள் ஒதுக்கப்பட்ட கள ஆய்வுப் பாதைகள் மற்றும் சரிபார்ப்பு முன்னேற்றம்.' : 'Assigned field routes and step-by-step verification progress.'}
          </p>
        </div>

        <Link to="/authority/inspection-routes" className="btn btn-primary" style={{ backgroundColor: '#2563eb', padding: '0.65rem 1.2rem', borderRadius: '10px', fontWeight: 800, gap: '0.4rem' }}>
          <Navigation size={16} /> {isTA ? 'பாதை திட்டமிடுபவர்' : 'Open Route Planner'}
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Loading assigned routes...</div>
      ) : routes.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <ShieldCheck size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
            {isTA ? 'ஒதுக்கப்பட்ட பாதைகள் எதுவும் இல்லை' : 'No Assigned Routes Found'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {isTA ? 'தற்போது உங்களுக்கு எந்தக் கள ஆய்வுப் பாதையும் ஒதுக்கப்படவில்லை.' : 'You currently have no active field inspection routes assigned.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          
          {/* LEFT: Assigned Routes Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              ASSIGNED ROUTES ({routes.length})
            </h3>

            {routes.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setActiveRoute(r);
                  setActiveStopIndex(0);
                }}
                className="card"
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: activeRoute?.id === r.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: activeRoute?.id === r.id ? '#eff6ff' : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                    {r.routeCode}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      backgroundColor: r.status === 'IN_PROGRESS' ? '#dcfce7' : '#fef3c7',
                      color: r.status === 'IN_PROGRESS' ? '#166534' : '#92400e',
                    }}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0 0.3rem 0' }}>
                  {r.name}
                </h4>

                <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '0.75rem' }}>
                  <span>📋 {r.totalCases} Cases</span>
                  <span>📍 ~{r.approxTotalDistanceKm} km</span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Active Route Field View */}
          {activeRoute && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Active Route Header & Progress */}
              <div className="card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      ROUTE CODE: {activeRoute.routeCode}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                      {activeRoute.name}
                    </h2>
                  </div>

                  {activeRoute.status === 'ASSIGNED' ? (
                    <button
                      onClick={() => handleStartRoute(activeRoute.id)}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#16a34a', padding: '0.55rem 1.25rem', fontWeight: 800, gap: '0.4rem' }}
                    >
                      <Play size={16} /> START INSPECTION ROUTE
                    </button>
                  ) : (
                    <span className="badge badge-consistent" style={{ fontSize: '0.8rem' }}>
                      ✓ IN PROGRESS
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
                    <span>ROUTE PROGRESS</span>
                    <span>
                      {activeRoute.completedCases} / {activeRoute.totalCases} Inspections Completed
                    </span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round((activeRoute.completedCases / Math.max(1, activeRoute.totalCases)) * 100)}%`,
                        backgroundColor: '#16a34a',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Stops Stepper Buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {activeRoute.stops.map((s: any, idx: number) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveStopIndex(idx)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: activeStopIndex === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: s.status === 'COMPLETED' ? '#dcfce7' : s.status === 'SKIPPED' ? '#fee2e2' : activeStopIndex === idx ? '#eff6ff' : '#ffffff',
                        color: s.status === 'COMPLETED' ? '#166534' : s.status === 'SKIPPED' ? '#991b1b' : '#1e293b',
                      }}
                    >
                      {s.status === 'COMPLETED' ? '✓ ' : s.status === 'SKIPPED' ? '⊘ ' : ''}
                      Stop {s.sequence}
                    </button>
                  ))}
                </div>
              </div>

              {/* CURRENT STOP CARD */}
              {currentStop && (
                <div className="card" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#2563eb', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      STOP {currentStop.sequence} OF {activeRoute.stops.length}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        backgroundColor: currentStop.status === 'COMPLETED' ? '#dcfce7' : currentStop.status === 'SKIPPED' ? '#fee2e2' : '#fef3c7',
                        color: currentStop.status === 'COMPLETED' ? '#166534' : currentStop.status === 'SKIPPED' ? '#991b1b' : '#92400e',
                      }}
                    >
                      {currentStop.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', fontFamily: 'monospace' }}>
                        CASE CODE: {report?.reportCode || currentStop.reportId}
                      </span>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                        {report?.category || 'CIVIC'} • {report?.issueType || 'ISSUE REPORT'}
                      </h3>
                    </div>

                    <a
                      href={getGoogleMapsUrl(report?.latitude, report?.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', fontWeight: 700, gap: '0.3rem', color: '#0284c7', borderColor: '#bae6fd' }}
                    >
                      <ExternalLink size={14} /> OPEN IN MAPS
                    </a>
                  </div>

                  {report?.locationText && (
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
                      <MapPin size={15} style={{ color: '#0284c7' }} /> {report.locationText}
                    </div>
                  )}

                  {report?.description && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', color: '#334155' }}>
                      <strong>Citizen Description:</strong> {report.description}
                    </div>
                  )}

                  {/* Evidence Attachment Viewer */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {report?.photoUrl && (
                      <div style={{ flex: 1, minWidth: '160px', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 0.6rem', backgroundColor: '#f1f5f9', color: '#475569' }}>
                          CITIZEN BEFORE PHOTO
                        </div>
                        <img src={report.photoUrl} alt="Evidence" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  {/* Actions for current stop */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <button
                      onClick={() => setShowSkipModal(true)}
                      className="btn btn-outline"
                      style={{ borderColor: '#fca5a5', color: '#991b1b', fontSize: '0.85rem', fontWeight: 700, gap: '0.3rem' }}
                    >
                      <SkipForward size={16} /> SKIP STOP
                    </button>

                    <button
                      onClick={() => setShowActionModal(true)}
                      className="btn btn-primary"
                      style={{ backgroundColor: '#16a34a', fontSize: '0.85rem', fontWeight: 800, gap: '0.4rem' }}
                    >
                      <CheckCircle2 size={16} /> SUBMIT FIELD VERDICT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STOP ACTION MODAL */}
      {showActionModal && currentStop && (
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
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', borderRadius: '16px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
              Field Inspection Verdict — Stop {currentStop.sequence}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Record your official ground inspection finding for case <strong>{report?.reportCode}</strong>.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                INSPECTION VERDICT
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { id: 'INSPECTION_COMPLETED', label: '✓ Inspection Completed (Verified on Ground)' },
                  { id: 'NEEDS_ACTION', label: '⚠️ Issue Verified — Requires Department Action' },
                  { id: 'NO_ISSUE_FOUND', label: '❌ No Issue Found at GPS Location' },
                  { id: 'NEEDS_MORE_EVIDENCE', label: '🔍 Needs Additional Evidence' },
                ].map((v) => (
                  <label
                    key={v.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: verdict === v.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: verdict === v.id ? '#eff6ff' : '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="verdict"
                      value={v.id}
                      checked={verdict === v.id}
                      onChange={(e) => setVerdict(e.target.value)}
                    />
                    {v.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                INSPECTOR FIELD NOTES
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter physical verification observations..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                AFTER EVIDENCE PHOTO URL (OPTIONAL FOR RESOLUTION PROOF)
              </label>
              <input
                type="text"
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                placeholder="e.g. /uploads/demo_pothole_repaired.jpg"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowActionModal(false)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStopAction}
                disabled={submittingAction}
                className="btn btn-primary"
                style={{ backgroundColor: '#16a34a', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                {submittingAction ? 'Saving...' : 'Submit Finding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKIP STOP MODAL */}
      {showSkipModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '1.5rem', borderRadius: '16px', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
              Skip Stop {currentStop?.sequence}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Please select a valid operational reason for skipping this case stop.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                SKIP REASON (REQUIRED)
              </label>
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              >
                <option value="ACCESS_ISSUE">Road Block / Restricted Access</option>
                <option value="INSUFFICIENT_TIME">Time Limit / Shift End</option>
                <option value="LOCATION_ISSUE">Inaccurate GPS / Cannot Locate</option>
                <option value="OTHER">Other Operational Issue</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
                ADDITIONAL NOTES
              </label>
              <input
                type="text"
                value={skipNotes}
                onChange={(e) => setSkipNotes(e.target.value)}
                placeholder="Optional detail..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowSkipModal(false)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSkipStop}
                disabled={submittingSkip}
                className="btn btn-primary"
                style={{ backgroundColor: '#dc2626', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                {submittingSkip ? 'Saving...' : 'Confirm Skip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
