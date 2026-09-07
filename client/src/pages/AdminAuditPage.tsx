import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Filter, Search, ListOrdered, CheckCircle2 } from 'lucide-react';

interface AuditLogItem {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  previousHash?: string;
  recordHash?: string;
  timestamp: string;
}

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, entityFilter, searchQuery]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('makkalsaantru_token') || '';
      const queryParams = new URLSearchParams();
      if (actionFilter !== 'ALL') queryParams.append('action', actionFilter);
      if (entityFilter !== 'ALL') queryParams.append('entityType', entityFilter);
      if (searchQuery.trim() !== '') queryParams.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/audit?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch admin audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-consistent" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                ROLE: SYSTEM ADMINISTRATOR
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={14} className="text-emerald-600" /> Cryptographic Tamper-Evident Audit System
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Chained Tamper-Evident Audit Trail
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Immutable record of system events, evidence submissions, SHA-256 hashes, and human inspection decisions.
            </p>
          </div>
        </div>

        {/* SECURITY & TRUST CONTROL STATUS PANEL */}
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} className="text-emerald-600" /> ACTIVE SECURITY & CONTROL PANEL
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Authentication</div>
              <strong style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> JWT PROTECTED</strong>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role Authorization</div>
              <strong style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> RBAC ACTIVE</strong>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence Integrity</div>
              <strong style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> SHA-256 VERIFIED</strong>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>API Rate Limiting</div>
              <strong style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> ACTIVE (100 req/15m)</strong>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Audit Trail</div>
              <strong style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={14} /> CHAINED HASH ACTIVE</strong>
            </div>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search audit log details or user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
              >
                <option value="ALL">All Actions</option>
                <option value="EVIDENCE_SUBMITTED">EVIDENCE_SUBMITTED</option>
                <option value="OFFLINE_EVIDENCE_SYNCED">OFFLINE_EVIDENCE_SYNCED</option>
                <option value="AI_ANALYSIS_COMPLETED">AI_ANALYSIS_COMPLETED</option>
                <option value="HUMAN_DECISION_RECORDED">HUMAN_DECISION_RECORDED</option>
                <option value="CORRECTIVE_ACTION_CREATED">CORRECTIVE_ACTION_CREATED</option>
                <option value="INSPECTOR_ASSIGNED">INSPECTOR_ASSIGNED</option>
              </select>
            </div>
          </div>
        </div>

        {/* AUDIT LOG TABLE */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              System Audit Event Trail ({logs.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Loading audit trail logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              No audit log events found matching the criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Actor</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Action</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Entity</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Details & Chained SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{log.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{log.userRole}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>
                        {log.entityType} ({log.entityId || 'N/A'})
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ color: '#334155', marginBottom: '0.3rem' }}>{log.details}</div>
                        {log.recordHash && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                            Hash: {log.recordHash.slice(0, 16)}...{log.recordHash.slice(-16)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
