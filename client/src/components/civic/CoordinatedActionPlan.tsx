import React, { useState } from 'react';
import { CheckCircle2, Clock, Lock, ArrowDown, Play, AlertCircle } from 'lucide-react';
import { CaseDomainTaskUI, updateDomainTaskStatus } from '../../services/crossDomainService';

interface CoordinatedActionPlanProps {
  reportId: string;
  tasks: CaseDomainTaskUI[];
  userRole?: 'CITIZEN' | 'INSPECTOR' | 'ADMIN';
  onTaskUpdated?: () => void;
}

export const CoordinatedActionPlan: React.FC<CoordinatedActionPlanProps> = ({
  reportId,
  tasks,
  userRole = 'CITIZEN',
  onTaskUpdated
}) => {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [taskNotes, setTaskNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortedTasks = [...tasks].sort((a, b) => a.sequence - b.sequence);

  const handleUpdateStatus = async (taskId: string, targetStatus: string) => {
    setUpdatingTaskId(taskId);
    setErrorMessage(null);
    try {
      await updateDomainTaskStatus(taskId, targetStatus, taskNotes);
      setTaskNotes('');
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ACTION DEPENDENCY WORKFLOW
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0.1rem 0' }}>
            🧩 COORDINATED ACTION PLAN
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
          {sortedTasks.filter(t => t.status === 'COMPLETED').length} of {sortedTasks.length} Tasks Complete
        </span>
      </div>

      {errorMessage && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sortedTasks.map((task, index) => {
          const isCompleted = task.status === 'COMPLETED';
          const isInProgress = task.status === 'IN_PROGRESS';
          const isPending = task.status === 'PENDING';

          // Check if dependency locked
          const previousTask = sortedTasks.find(t => t.id === task.dependsOnTaskId || t.sequence === task.sequence - 1);
          const isLocked = isPending && previousTask && previousTask.status !== 'COMPLETED' && previousTask.status !== 'SKIPPED';

          let statusBadgeBg = '#f1f5f9';
          let statusBadgeColor = '#64748b';
          let statusLabel = 'WAITING';

          if (isCompleted) {
            statusBadgeBg = '#dcfce7';
            statusBadgeColor = '#15803d';
            statusLabel = 'COMPLETED';
          } else if (isInProgress) {
            statusBadgeBg = '#dbeafe';
            statusBadgeColor = '#1d4ed8';
            statusLabel = 'IN PROGRESS';
          } else if (isLocked) {
            statusBadgeBg = '#fef3c7';
            statusBadgeColor = '#b45309';
            statusLabel = 'DEPENDENCY LOCKED';
          }

          return (
            <React.Fragment key={task.id}>
              <div
                style={{
                  backgroundColor: isInProgress ? '#eff6ff' : isCompleted ? '#f0fdf4' : '#f8fafc',
                  border: `1.5px solid ${isInProgress ? '#93c5fd' : isCompleted ? '#86efac' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  padding: '1.1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: isLocked ? 0.75 : 1
                }}
              >
                {/* Step Number Circle */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#16a34a' : isInProgress ? '#2563eb' : '#94a3b8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : isLocked ? <Lock size={16} /> : index + 1}
                </div>

                {/* Task Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#334155' }}>
                        {task.domain}
                      </span>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {task.title}
                      </h4>
                    </div>

                    <span style={{ backgroundColor: statusBadgeBg, color: statusBadgeColor, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {statusLabel}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0.2rem 0 0.5rem 0' }}>
                    {task.action}
                  </p>

                  {task.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#15803d', backgroundColor: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: '6px', marginTop: '0.4rem', fontWeight: 600 }}>
                      Note: {task.notes}
                    </div>
                  )}

                  {/* Inspector Actions */}
                  {(userRole === 'INSPECTOR' || userRole === 'ADMIN') && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {isPending && !isLocked && (
                        <button
                          type="button"
                          disabled={updatingTaskId === task.id}
                          onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                          style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Play size={14} /> Start Task
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          type="button"
                          disabled={updatingTaskId === task.id}
                          onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                          style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <CheckCircle2 size={14} /> Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sequential Arrow Connector */}
              {index < sortedTasks.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0' }}>
                  <ArrowDown size={20} style={{ color: '#94a3b8' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
