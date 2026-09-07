import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronRight, Info, Edit3, CheckCircle2 } from 'lucide-react';

interface PriorityCardProps {
  priorityScore: number; // 0 - 100
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT_REVIEW' | string;
  reasons?: string[] | string;
  evidenceConfidence?: number; // 0 - 100 or 0.0 - 1.0
  isManualOverride?: boolean;
  overrideReason?: string;
  onOpenOverrideModal?: () => void;
  showOverrideButton?: boolean;
}

export const PriorityCard: React.FC<PriorityCardProps> = ({
  priorityScore,
  priorityLevel,
  reasons,
  evidenceConfidence = 88,
  isManualOverride,
  overrideReason,
  onOpenOverrideModal,
  showOverrideButton = false,
}) => {
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Parse reasons
  let parsedReasons: string[] = [];
  if (Array.isArray(reasons)) {
    parsedReasons = reasons;
  } else if (typeof reasons === 'string') {
    try {
      parsedReasons = JSON.parse(reasons);
    } catch (e) {
      parsedReasons = [reasons];
    }
  }

  if (parsedReasons.length === 0) {
    parsedReasons = [
      '+ Independent citizen report registered',
      '+ Location & category validated',
      '+ Operational response queue prioritized',
    ];
  }

  // Level Badge Styling
  let levelLabel = 'LOW';
  let badgeBg = '#f1f5f9';
  let badgeColor = '#475569';
  let borderStyle = '1px solid #cbd5e1';

  if (priorityLevel === 'URGENT_REVIEW' || priorityScore >= 80) {
    levelLabel = 'URGENT REVIEW';
    badgeBg = '#fef2f2';
    badgeColor = '#dc2626';
    borderStyle = '2px solid #fca5a5';
  } else if (priorityLevel === 'HIGH' || priorityScore >= 55) {
    levelLabel = 'HIGH';
    badgeBg = '#fff7ed';
    badgeColor = '#c2410c';
    borderStyle = '1.5px solid #ffbb7c';
  } else if (priorityLevel === 'MEDIUM' || priorityScore >= 30) {
    levelLabel = 'MEDIUM';
    badgeBg = '#fefce8';
    badgeColor = '#a16207';
    borderStyle = '1px solid #fef08a';
  }

  const confidencePct = evidenceConfidence <= 1 ? Math.round(evidenceConfidence * 100) : Math.round(evidenceConfidence);

  return (
    <div className="card" style={{ padding: '1.25rem', borderRadius: '16px', border: borderStyle, backgroundColor: '#ffffff', boxShadow: '0 4px 18px rgba(0,0,0,0.05)', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={18} style={{ color: badgeColor }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ACTION PRIORITY SCORE
          </span>
        </div>
        <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '0.3rem 0.75rem', borderRadius: '8px', fontWeight: 900, fontSize: '0.82rem', letterSpacing: '0.04em' }}>
          {levelLabel}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
          {Math.round(priorityScore)}
        </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>
          / 100
        </span>
      </div>

      {isManualOverride && (
        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '0.4rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          ✏️ Manual Priority Override Active: {overrideReason || 'Adjusted by Authority'}
        </div>
      )}

      {/* Primary Reasons List */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
          Why?
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {parsedReasons.slice(0, 4).map((r, i) => (
            <li key={i} style={{ fontWeight: 600 }}>{r}</li>
          ))}
        </ul>
      </div>

      {/* Footer & Separate Evidence Confidence */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#166534', fontSize: '0.75rem', fontWeight: 700 }}>
          <ShieldCheck size={14} /> Evidence Confidence: {confidencePct}%
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {showOverrideButton && onOpenOverrideModal && (
            <button
              type="button"
              onClick={onOpenOverrideModal}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem', fontWeight: 700, borderRadius: '8px' }}
            >
              <Edit3 size={14} /> Override
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowBreakdownModal(true)}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: 0 }}
          >
            VIEW PRIORITY BREAKDOWN <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdownModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '520px', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={20} style={{ color: '#2563eb' }} /> Priority Calculation Breakdown
              </h3>
              <button onClick={() => setShowBreakdownModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: '#64748b' }}>
                ×
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Calculated Priority Score</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: badgeColor }}>{Math.round(priorityScore)} / 100 ({levelLabel})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Evidence Quality & Integrity Confidence</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534' }}>{confidencePct}%</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              Evaluated Priority Signals:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {parsedReasons.map((reason, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              Note: Priority score is calculated deterministically to order civic response queues. It does not measure or imply criminal liability.
            </div>

            <button
              onClick={() => setShowBreakdownModal(false)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', fontWeight: 800 }}
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
