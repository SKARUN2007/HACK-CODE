import React from 'react';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface TimelineStep {
  title: string;
  description: string;
  timestamp?: string | Date | null;
  status: 'completed' | 'current' | 'pending' | 'reopened';
}

interface ResolutionTimelineProps {
  report?: any;
  reportCode?: string;
  createdAt?: string | Date;
  status?: string;
  actionStartedAt?: string | Date | null;
  afterCapturedAt?: string | Date | null;
  resolvedAt?: string | Date | null;
  reopenedAt?: string | Date | null;
  priorityLevel?: string;
  priorityScore?: number;
}

export const ResolutionTimeline: React.FC<ResolutionTimelineProps> = ({
  report,
  reportCode,
  createdAt,
  status,
  actionStartedAt,
  afterCapturedAt,
  resolvedAt,
  reopenedAt,
  priorityLevel = 'HIGH',
  priorityScore = 84,
}) => {
  const rCode = reportCode || report?.reportCode || report?.id || 'MS-CIV-2026';
  const cDate = createdAt || report?.createdAt || new Date();
  const st = status || report?.status || 'REPORTED';
  const actDate = actionStartedAt || report?.actionStartedAt;
  const aftDate = afterCapturedAt || report?.afterEvidenceSubmittedAt;
  const resDate = resolvedAt || report?.humanVerifiedAt;
  const reopDate = reopenedAt || report?.reopenedAt;
  const pLevel = priorityLevel || report?.priorityLevel || 'HIGH';
  const pScore = priorityScore || report?.actionPriorityScore || 75;
  const steps: TimelineStep[] = [
    {
      title: 'Issue Reported',
      description: `Report ${reportCode} submitted with geotagged evidence`,
      timestamp: createdAt,
      status: 'completed',
    },
    {
      title: 'Classified & Prioritized',
      description: `Domain classified. Action Priority: ${Math.round(priorityScore)}/100 (${priorityLevel})`,
      timestamp: createdAt,
      status: 'completed',
    },
    {
      title: 'Authority Review',
      description: 'Routed to configured authority directory queue',
      timestamp: createdAt,
      status: 'completed',
    },
    {
      title: 'Action Started',
      description: actionStartedAt ? 'Public Works Department initiated corrective action' : 'Awaiting authority action start',
      timestamp: actionStartedAt,
      status: actionStartedAt ? 'completed' : status === 'ACTION_IN_PROGRESS' ? 'current' : 'pending',
    },
    {
      title: 'After Evidence Uploaded',
      description: afterCapturedAt ? 'Corrective work photo evidence uploaded with SHA-256 hash' : 'Awaiting AFTER photo evidence',
      timestamp: afterCapturedAt,
      status: afterCapturedAt ? 'completed' : status === 'AWAITING_AFTER_EVIDENCE' ? 'current' : 'pending',
    },
    {
      title: 'Re-Verification',
      description: resolvedAt || reopenedAt ? 'Inspector site audit & citizen feedback completed' : 'Awaiting inspector site re-verification',
      timestamp: resolvedAt || reopenedAt || afterCapturedAt,
      status: status === 'RESOLVED' || status === 'REOPENED' ? 'completed' : status === 'AWAITING_REVERIFICATION' ? 'current' : 'pending',
    },
    {
      title: status === 'REOPENED' ? 'Case Reopened' : 'Resolution Confirmed',
      description: status === 'RESOLVED' ? 'Issue address verified with before/after proof' : status === 'REOPENED' ? 'Issue requires secondary cleanup' : 'Final resolution status pending',
      timestamp: resolvedAt || reopenedAt,
      status: status === 'RESOLVED' ? 'completed' : status === 'REOPENED' ? 'reopened' : 'pending',
    },
  ];

  return (
    <div className="card" style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Clock size={18} style={{ color: '#2563eb' }} /> RESOLUTION TIMELINE ({reportCode})
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '0.5rem' }}>
        {steps.map((step, idx) => {
          let icon = <CheckCircle2 size={18} style={{ color: '#16a34a' }} />;
          let circleBg = '#dcfce7';
          let textColor = '#0f172a';

          if (step.status === 'reopened') {
            icon = <RefreshCw size={18} style={{ color: '#dc2626' }} />;
            circleBg = '#fee2e2';
            textColor = '#991b1b';
          } else if (step.status === 'current') {
            icon = <Clock size={18} style={{ color: '#2563eb' }} />;
            circleBg = '#dbeafe';
            textColor = '#1e40af';
          } else if (step.status === 'pending') {
            icon = <Clock size={18} style={{ color: '#94a3b8' }} />;
            circleBg = '#f1f5f9';
            textColor = '#64748b';
          }

          return (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: circleBg, padding: '0.35rem', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
              <div style={{ flex: 1, borderBottom: idx === steps.length - 1 ? 'none' : '1px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: textColor }}>{step.title}</span>
                  {step.timestamp && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
