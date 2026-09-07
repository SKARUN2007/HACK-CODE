import { verificationService } from './verification/verificationService';
import { inMemoryVerifications } from '../routes/verifications';

export type HumanDecisionState =
  | 'HUMAN_REVIEW_PENDING'
  | 'UNDER_HUMAN_REVIEW'
  | 'ISSUE_CONFIRMED'
  | 'NO_ISSUE_FOUND'
  | 'MORE_EVIDENCE_REQUIRED'
  | 'RESOLVED';

export type CorrectiveActionStatus =
  | 'ACTION_REQUIRED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED';

export interface CorrectiveActionItem {
  id: string;
  projectId: string;
  description: string;
  department: string;
  targetCompletionDate: string;
  status: CorrectiveActionStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface HumanDecisionRecord {
  id: string;
  projectId: string;
  inspectorId: string;
  decision: HumanDecisionState;
  notes?: string;
  timestamp: string;
}

export interface CaseAssignmentRecord {
  projectId: string;
  assignedInspectorId: string;
  assignedBy: string;
  assignedAt: string;
}

// In-memory data structures for authority workflow management
export const inMemoryHumanDecisions: Map<string, HumanDecisionRecord[]> = new Map();
export const inMemoryCorrectiveActions: Map<string, CorrectiveActionItem[]> = new Map();
export const inMemoryCaseAssignments: Map<string, CaseAssignmentRecord> = new Map();
export const inMemoryReverificationRequests: Map<string, { requestedAt: string; requestedBy: string }> = new Map();

// Allowed Human Review State Transitions Matrix
const ALLOWED_STATE_TRANSITIONS: Record<HumanDecisionState, HumanDecisionState[]> = {
  HUMAN_REVIEW_PENDING: ['UNDER_HUMAN_REVIEW'],
  UNDER_HUMAN_REVIEW: ['ISSUE_CONFIRMED', 'NO_ISSUE_FOUND', 'MORE_EVIDENCE_REQUIRED'],
  ISSUE_CONFIRMED: ['RESOLVED', 'MORE_EVIDENCE_REQUIRED'],
  NO_ISSUE_FOUND: ['RESOLVED', 'HUMAN_REVIEW_PENDING'],
  MORE_EVIDENCE_REQUIRED: ['UNDER_HUMAN_REVIEW', 'RESOLVED'],
  RESOLVED: ['HUMAN_REVIEW_PENDING'], // Requires explicit reopen action
};

export class AuthorityService {
  /**
   * Validates state transitions to prevent invalid jumps or concurrency bugs.
   */
  isValidStateTransition(currentState: HumanDecisionState, nextState: HumanDecisionState): boolean {
    const allowed = ALLOWED_STATE_TRANSITIONS[currentState];
    return allowed ? allowed.includes(nextState) : false;
  }

  /**
   * Computes dynamic dashboard summary metrics across all projects.
   */
  calculateDashboardSummary(projects: any[], verificationsMap: Map<string, any>) {
    const totalProjects = projects.length;
    let projectsRequiringReview = 0;
    let highPriorityCount = 0;
    let pendingInspectionsCount = 0;
    let resolvedCount = 0;

    projects.forEach((proj) => {
      const verif = verificationsMap.get(proj.id);
      const priorityScore = verif ? verif.priorityScore : 0;
      const humanStatus = verif ? verif.humanStatus : 'AI_PENDING';

      if (priorityScore >= 60 || verif?.result === 'POTENTIAL_MISMATCH') {
        highPriorityCount++;
      }

      if (verif?.result === 'REVIEW' || verif?.result === 'POTENTIAL_MISMATCH' || humanStatus === 'HUMAN_REVIEW_PENDING') {
        projectsRequiringReview++;
      }

      if (humanStatus === 'HUMAN_REVIEW_PENDING' || humanStatus === 'UNDER_HUMAN_REVIEW') {
        pendingInspectionsCount++;
      }

      if (humanStatus === 'RESOLVED' || humanStatus === 'HUMAN_REJECTED' || humanStatus === 'NO_ISSUE_FOUND') {
        resolvedCount++;
      }
    });

    return {
      totalProjects,
      projectsRequiringReview,
      highPriorityCount,
      pendingInspectionsCount,
      resolvedCount,
    };
  }

  /**
   * Sorts projects by Priority Score descending for the Priority Queue.
   */
  sortProjectsByPriority(projects: any[], verificationsMap: Map<string, any>): any[] {
    return [...projects].sort((a, b) => {
      const verifA = verificationsMap.get(a.id);
      const verifB = verificationsMap.get(b.id);
      const scoreA = verifA ? verifA.priorityScore : 0;
      const scoreB = verifB ? verifB.priorityScore : 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Retrieves Early Intervention & Resource Intelligence metrics.
   */
  getResourceIntelligence(reportedProgress: number, milestonePercentage: number) {
    let earlyInterventionStage: 'VERY_EARLY' | 'EARLY' | 'LATE_STAGE' | 'POST_COMPLETION' = 'EARLY';

    if (reportedProgress <= 25) {
      earlyInterventionStage = 'VERY_EARLY';
    } else if (reportedProgress <= 50) {
      earlyInterventionStage = 'EARLY';
    } else if (reportedProgress <= 75) {
      earlyInterventionStage = 'LATE_STAGE';
    } else {
      earlyInterventionStage = 'POST_COMPLETION';
    }

    const message =
      earlyInterventionStage === 'VERY_EARLY' || earlyInterventionStage === 'EARLY'
        ? 'Opportunity for earlier intervention — early milestone verification enables authorities to investigate before the project progresses further.'
        : 'Late-stage milestone verification — urgent physical inspection recommended before project completion handoff.';

    return {
      earlyInterventionStage,
      remainingProgress: Math.max(0, 100 - reportedProgress),
      message,
    };
  }
}

export const authorityService = new AuthorityService();
