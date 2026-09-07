import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, FileText, CheckCircle2, Clock, MapPin, Eye, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const InspectionRouteHistoryPage: React.FC = () => {
  const { language } = useLanguage();
  const isTA = language === 'TA';

  const [historyRoutes, setHistoryRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);

  useEffect(() => {
    fetchRouteHistory();
  }, []);

  const fetchRouteHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token');
      const res = await fetch('/api/authority/inspection-routes/history', {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryRoutes(data.routes || []);
      }
    } catch (err) {
      console.warn('Failed to fetch route history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/authority/inspection-routes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> {isTA ? 'பாதை திட்டமிடுபவருக்குத் திரும்புக' : 'Back to Route Planner'}
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText style={{ color: '#2563eb' }} size={28} />
            {isTA ? 'பாதை வரலாறு மற்றும் தணிக்கை பதிவு' : 'Inspection Route History & Audit Log'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
            {isTA ? 'முடிவடைந்த மற்றும் வரலாற்று ரீதியான சுற்றறிக்கை ஆய்வுகளின் விரிவான பதிவேடு.' : 'Immutable audit records of completed and historical field inspection batches.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>Loading route history...</div>
      ) : historyRoutes.length === 0 ? (
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <CheckCircle2 size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
            {isTA ? 'முடிவடைந்த பாதைகள் எதுவும் இல்லை' : 'No Completed Routes Found'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {isTA ? 'இன்னும் எந்த ஆய்வுகளும் முடிவடையவில்லை.' : 'No completed or historical inspection routes logged yet.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                <th style={{ padding: '0.85rem 1rem' }}>ROUTE CODE</th>
                <th style={{ padding: '0.85rem 1rem' }}>TITLE</th>
                <th style={{ padding: '0.85rem 1rem' }}>INSPECTOR</th>
                <th style={{ padding: '0.85rem 1rem' }}>STOPS (DONE/SKIP)</th>
                <th style={{ padding: '0.85rem 1rem' }}>DISTANCE</th>
                <th style={{ padding: '0.85rem 1rem' }}>COMPLETED AT</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {historyRoutes.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                    {r.routeCode}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                    {r.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                    {r.inspector?.name || 'Unassigned'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                    <span style={{ color: '#16a34a' }}>{r.completedCases} done</span> / <span style={{ color: '#dc2626' }}>{r.skippedCases} skipped</span> ({r.totalCases} total)
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    ~{r.approxTotalDistanceKm} km
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    {r.completedAt ? new Date(r.completedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedRoute(r)}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', fontWeight: 700, gap: '0.3rem' }}
                    >
                      <Eye size={14} /> View Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedRoute && (
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
          <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '1.5rem', borderRadius: '16px', backgroundColor: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>
                  {selectedRoute.routeCode}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
                  {selectedRoute.name}
                </h3>
              </div>
              <span className="badge badge-consistent">COMPLETED AUDIT LOG</span>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              {selectedRoute.routeExplanation}
            </p>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              STOPS AUDIT RECORD ({selectedRoute.stops.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {selectedRoute.stops.map((s: any) => (
                <div key={s.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                    <span>Stop {s.sequence}: {s.report?.category} ({s.report?.reportCode})</span>
                    <span style={{ color: s.status === 'COMPLETED' ? '#16a34a' : '#dc2626' }}>
                      {s.status}
                    </span>
                  </div>
                  {s.verificationVerdict && (
                    <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                      Verdict: <strong>{s.verificationVerdict}</strong>
                    </div>
                  )}
                  {s.verificationNote && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                      "{s.verificationNote}"
                    </div>
                  )}
                  {s.skipReason && (
                    <div style={{ fontSize: '0.78rem', color: '#dc2626' }}>
                      Skip Reason: <strong>{s.skipReason}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedRoute(null)} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
