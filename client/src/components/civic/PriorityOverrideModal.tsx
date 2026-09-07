import React, { useState } from 'react';
import { Edit3, AlertCircle, ShieldAlert } from 'lucide-react';

interface PriorityOverrideModalProps {
  report?: any;
  reportId?: string;
  reportCode?: string;
  currentLevel?: string;
  currentScore?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PriorityOverrideModal: React.FC<PriorityOverrideModalProps> = ({
  report,
  reportId,
  reportCode,
  currentLevel,
  currentScore,
  onClose,
  onSuccess,
}) => {
  const rId = reportId || report?.id || 'rep-01';
  const rCode = reportCode || report?.reportCode || report?.id || 'MS-CIV-2026';
  const cLevel = currentLevel || report?.priorityLevel || 'HIGH';
  const cScore = currentScore || report?.actionPriorityScore || report?.priorityScore || 75;

  const [newLevel, setNewLevel] = useState<string>(cLevel);
  const [newScore, setNewScore] = useState<number>(cScore);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a mandatory explanation reason for overriding priority.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('makkalsaantru_token') || '';
      const res = await fetch(`/api/civic-reports/${rId}/priority-override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          newLevel,
          newScore: parseFloat(newScore.toString()),
          reason,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to override priority score.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server error while updating priority.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Edit3 size={18} style={{ color: '#2563eb' }} /> Override Action Priority ({reportCode})
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer', color: '#64748b' }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
              Select Priority Level
            </label>
            <select
              value={newLevel}
              onChange={(e) => {
                const lvl = e.target.value;
                setNewLevel(lvl);
                if (lvl === 'URGENT_REVIEW') setNewScore(85);
                else if (lvl === 'HIGH') setNewScore(65);
                else if (lvl === 'MEDIUM') setNewScore(45);
                else setNewScore(20);
              }}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700 }}
            >
              <option value="URGENT_REVIEW">URGENT REVIEW (80–100)</option>
              <option value="HIGH">HIGH (55–79)</option>
              <option value="MEDIUM">MEDIUM (30–54)</option>
              <option value="LOW">LOW (0–29)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
              Priority Score (0–100): {newScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={newScore}
              onChange={(e) => setNewScore(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '0.3rem' }}>
              Reason for Override (Mandatory for Audit Trail)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., On-site physical inspection confirmed severe road blockage requiring immediate paving..."
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', minHeight: '80px' }}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldAlert size={14} style={{ color: '#2563eb' }} />
            This change will be recorded under audit event <code>PRIORITY_MANUALLY_UPDATED</code>.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', fontWeight: 800 }}
            >
              {isSubmitting ? 'Updating...' : 'Confirm Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
