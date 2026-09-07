import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ShieldCheck, ArrowRight, Clock, AlertTriangle } from 'lucide-react';

interface AssignedCaseItem {
  id: string;
  verificationCode?: string;
  title: string;
  category: string;
  reportedProgress: number;
  priorityScore: number;
  confidenceScore: number;
  result: string;
  humanStatus: string;
  correctiveActionsCount: number;
}

export const MyAssignedCasesPage: React.FC = () => {
  const [cases, setCases] = useState<AssignedCaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMyCases();
  }, []);

  const fetchMyCases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const response = await fetch('/api/authority/my-cases', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && data.cases) {
        setCases(data.cases);
      }
    } catch (err) {
      console.warn('Failed to fetch assigned cases:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-review">ROLE: INSPECTOR</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned Cases Scope</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              My Assigned Inspection Cases
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Authorized cases assigned specifically to your inspector account for site audit & decision recording.
            </p>
          </div>

          <Link to="/authority" className="btn-primary">
            Authority Command Center
          </Link>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading your assigned inspection cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            No cases assigned to your account yet.
          </div>
        ) : (
          <div className="grid-2">
            {cases.map((c) => (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      {c.category} • Code: {c.verificationCode || c.id}
                    </span>
                    <span className="badge badge-consistent">Priority Score: {c.priorityScore}/100</span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    {c.title}
                  </h3>

                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9', marginBottom: '1rem', fontSize: '0.82rem', color: '#334155' }}>
                    <div>Reported Milestone: <strong>{c.reportedProgress}%</strong></div>
                    <div>AI Pattern Result: <strong>{c.result}</strong></div>
                    <div>Human Status: <strong>{c.humanStatus}</strong></div>
                    <div>Active Actions: <strong>{c.correctiveActionsCount} Items</strong></div>
                  </div>
                </div>

                <Link to={`/authority/projects/${c.id}`} className="btn-primary" style={{ justifyContent: 'center', gap: '0.4rem', padding: '0.65rem' }}>
                  Review & Record Inspection <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
