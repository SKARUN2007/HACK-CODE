import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, PlusCircle, AlertCircle, Building2 } from 'lucide-react';
import { CaseDomainAssignmentUI, authorityDomainAction } from '../../services/crossDomainService';

interface CrossDomainIntelligenceCardProps {
  reportId: string;
  assignments: CaseDomainAssignmentUI[];
  userRole?: 'CITIZEN' | 'INSPECTOR' | 'ADMIN';
  onActionComplete?: () => void;
}

export const CrossDomainIntelligenceCard: React.FC<CrossDomainIntelligenceCardProps> = ({
  reportId,
  assignments,
  userRole = 'CITIZEN',
  onActionComplete
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'CONFIRM' | 'REJECT' | 'ADD'>('CONFIRM');
  const [targetDomain, setTargetDomain] = useState<string>('ROAD');
  const [reasonInput, setReasonInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const primaryAssignment = assignments.find(a => a.relationshipRole === 'PRIMARY') || assignments[0];
  const relatedAssignments = assignments.filter(a => a.id !== primaryAssignment?.id);

  const handleOpenModal = (action: 'CONFIRM' | 'REJECT' | 'ADD', domain: string) => {
    setModalAction(action);
    setTargetDomain(domain);
    setReasonInput(action === 'CONFIRM' ? 'Confirmed via field inspection.' : '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleExecuteAction = async () => {
    if (!reasonInput || reasonInput.trim().length < 5) {
      setErrorMsg('Please provide a detailed reason (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await authorityDomainAction(reportId, modalAction, targetDomain, reasonInput);
      setShowModal(false);
      setReasonInput('');
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update domain routing decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>🧩</span>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CROSS-DEPARTMENT INTELLIGENCE
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Multi-Domain Relationship & Authority Routing
            </h3>
          </div>
        </div>

        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd', padding: '0.25rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
          COORDINATED REVIEW RECOMMENDATION
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Primary Domain Box */}
        {primaryAssignment && (
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #bfdbfe', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              PRIMARY DOMAIN
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
              {primaryAssignment.domainLabel || primaryAssignment.domain}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} style={{ color: '#2563eb' }} />
              <strong>Authority:</strong> {primaryAssignment.authorityName || 'DEMO Municipal Drainage Unit'}
            </div>
          </div>
        )}

        {/* Related Domains Box */}
        {relatedAssignments.map((rel) => (
          <div key={rel.id} style={{ backgroundColor: '#ffffff', border: `1.5px solid ${rel.status === 'CONFIRMED' ? '#86efac' : rel.status === 'REJECTED' ? '#fca5a5' : '#fde047'}`, padding: '1rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                POSSIBLY RELATED DOMAIN
              </span>
              <span style={{ backgroundColor: rel.status === 'CONFIRMED' ? '#dcfce7' : rel.status === 'REJECTED' ? '#fee2e2' : '#fef9c3', color: rel.status === 'CONFIRMED' ? '#15803d' : rel.status === 'REJECTED' ? '#991b1b' : '#854d0e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                {rel.status === 'SUGGESTED' ? 'AWAITING HUMAN CONFIRMATION' : rel.status}
              </span>
            </div>

            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
              {rel.domainLabel || rel.domain} Infrastructure
            </div>

            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} style={{ color: '#059669' }} />
              <strong>Authority:</strong> {rel.authorityName || 'DEMO Road / Engineering Unit'}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic', margin: '0.5rem 0 0.75rem 0', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
              "{rel.reason}"
            </p>

            {/* Inspector Action Controls */}
            {(userRole === 'INSPECTOR' || userRole === 'ADMIN') && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {rel.status !== 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={() => handleOpenModal('CONFIRM', rel.domain)}
                    style={{ flex: 1, backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.45rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <CheckCircle2 size={14} /> CONFIRM
                  </button>
                )}
                {rel.status !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => handleOpenModal('REJECT', rel.domain)}
                    style={{ flex: 1, backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.45rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                  >
                    <XCircle size={14} /> REJECT
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Permitted Related Domain Button for Authorities */}
      {(userRole === 'INSPECTOR' || userRole === 'ADMIN') && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleOpenModal('ADD', 'ROAD')}
            style={{ backgroundColor: '#ffffff', color: '#2563eb', border: '1.5px solid #2563eb', padding: '0.45rem 0.9rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={16} /> ADD PERMITTED RELATED DOMAIN
          </button>
        </div>
      )}

      {/* Required Human Confirmation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
              {modalAction === 'CONFIRM' ? 'CONFIRM RELATED DOMAIN ROUTING' : modalAction === 'REJECT' ? 'REJECT RELATED DOMAIN SUGGESTION' : 'ADD PERMITTED SERVICE DOMAIN'}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Inspectors determine final multi-domain routing decisions. Please document your inspection observations below.
            </p>

            {modalAction === 'ADD' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                  SELECT DOMAIN TO ADD:
                </label>
                <select
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="ROAD">Road Infrastructure</option>
                  <option value="WATER_SUPPLY">Water Supply</option>
                  <option value="DRAINAGE">Drainage System</option>
                  <option value="SANITATION">Sanitation & Waste</option>
                  <option value="STREETLIGHT">Street Lighting</option>
                  <option value="SEWAGE">Sewage Infrastructure</option>
                  <option value="PUBLIC_BUILDING">Public Building</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.3rem' }}>
                REASON / INSPECTOR FIELD OBSERVATIONS (REQUIRED):
              </label>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder={modalAction === 'REJECT' ? 'e.g., No drainage involvement observed during physical inspection. Issue is isolated to road pavement.' : 'e.g., Confirmed standing water overflow affecting adjacent tarmac.'}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', minHeight: '90px' }}
              />
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleExecuteAction}
                style={{ backgroundColor: modalAction === 'REJECT' ? '#dc2626' : '#16a34a', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {submitting ? 'Saving...' : 'Submit Human Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
