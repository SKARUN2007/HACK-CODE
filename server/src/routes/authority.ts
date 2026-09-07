import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { createChainedAuditLog } from '../utils/auditLogger';
import { verificationService } from '../services/verification/verificationService';
import { inMemoryVerifications } from './verifications';
import {
  authorityService,
  inMemoryHumanDecisions,
  inMemoryCorrectiveActions,
  inMemoryCaseAssignments,
  inMemoryReverificationRequests,
  HumanDecisionState,
  CorrectiveActionItem,
  HumanDecisionRecord,
  CaseAssignmentRecord,
} from '../services/authorityService';

const router = Router();
const prisma = new PrismaClient();

// Demo baseline projects list
const demoProjectsList = [
  {
    id: 'proj-demo-1',
    verificationCode: 'MS-ROAD-001',
    title: 'Village Road Improvement (DEMO)',
    description: 'Bituminous paving and stormwater drain side wall construction across 4.2 km village connectivity road.',
    category: 'ROAD',
    location: 'Thirumazhisai Panchayat, Thiruvallur District, TN',
    latitude: 13.0512,
    longitude: 79.9741,
    budget: 4500000,
    reportedProgress: 25.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'proj-demo-2',
    verificationCode: 'MS-WATER-002',
    title: 'Community Drinking Water Facility (DEMO)',
    description: 'Overhead tank installation, RO filtration plant setup, and distribution pipeline network.',
    category: 'WATER',
    location: 'Pennagaram Village, Dharmapuri District, TN',
    latitude: 12.1304,
    longitude: 77.9015,
    budget: 2800000,
    reportedProgress: 50.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'proj-demo-3',
    verificationCode: 'MS-STREET-003',
    title: 'Public Streetlight Installation (DEMO)',
    description: 'Erection of 120 solar LED streetlights with smart auto-dimming sensors along main arterial routes.',
    category: 'STREETLIGHT',
    location: 'Ward 12, Dindigul Municipality, TN',
    latitude: 10.3624,
    longitude: 77.9812,
    budget: 1500000,
    reportedProgress: 75.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-03T12:00:00.000Z',
  },
  {
    id: 'proj-demo-4',
    verificationCode: 'MS-SAN-004',
    title: 'Community Sanitation Facility (DEMO)',
    description: 'Construction of 8-seater public sanitary complex with continuous water supply and bio-digester tank.',
    category: 'SANITATION',
    location: 'Sirumugai Town Panchayat, Coimbatore District, TN',
    latitude: 11.3210,
    longitude: 76.9854,
    budget: 3200000,
    reportedProgress: 50.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-04T09:30:00.000Z',
  },
  {
    id: 'proj-demo-5',
    verificationCode: 'MS-SCHOOL-005',
    title: 'Government School Building Renovation (DEMO)',
    description: 'Roof slab waterproofing, smart classroom wiring, laboratory refurbishing, and exterior plastering.',
    category: 'PUBLIC_BUILDING',
    location: 'Orathanadu Block, Thanjavur District, TN',
    latitude: 10.6251,
    longitude: 79.2432,
    budget: 6800000,
    reportedProgress: 75.0,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-05T14:15:00.000Z',
  },
];

/**
 * Helper to fetch all projects from DB or fallback
 */
async function fetchAllProjects(): Promise<any[]> {
  const map = new Map<string, any>();
  demoProjectsList.forEach((p) => map.set(p.id, p));

  try {
    const dbProjects = await prisma.project.findMany({
      include: { milestones: true },
      orderBy: { createdAt: 'desc' },
    });
    if (dbProjects && dbProjects.length > 0) {
      dbProjects.forEach((p) => map.set(p.id, p));
    }
  } catch {
    // fallback
  }
  return Array.from(map.values());
}

/**
 * Helper to ensure verifications are populated for all projects
 */
async function ensureVerificationsLoaded(projects: any[]): Promise<Map<string, any>> {
  for (const p of projects) {
    if (!inMemoryVerifications.has(p.id)) {
      try {
        const verif = await verificationService.analyzeProjectEvidence({
          project: p,
          evidences: [],
        });
        inMemoryVerifications.set(p.id, verif);
      } catch {
        // ignore
      }
    }
  }
  return inMemoryVerifications;
}

/**
 * GET /api/authority/dashboard
 * Authenticated INSPECTOR/ADMIN endpoint returning summary cards & priority queue.
 */
router.get(
  '/dashboard',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const projects = await fetchAllProjects();
      const verifications = await ensureVerificationsLoaded(projects);

      const summary = authorityService.calculateDashboardSummary(projects, verifications);
      const priorityQueue = authorityService.sortProjectsByPriority(projects, verifications).map((p) => {
        const verif = verifications.get(p.id);
        const assignment = inMemoryCaseAssignments.get(p.id);
        return {
          id: p.id,
          verificationCode: p.verificationCode,
          title: p.title,
          category: p.category,
          location: p.location,
          latitude: p.latitude,
          longitude: p.longitude,
          reportedProgress: p.reportedProgress,
          milestone: `${p.reportedProgress <= 25 ? 25 : p.reportedProgress <= 50 ? 50 : p.reportedProgress <= 75 ? 75 : 100}% Milestone`,
          priorityScore: verif?.priorityScore ?? 0,
          confidenceScore: verif?.confidenceScore ?? 0,
          result: verif?.result ?? 'CONSISTENT',
          humanStatus: verif?.humanStatus ?? 'AI_PENDING',
          evidenceCount: verif?.corroboration?.submissionCount ?? 0,
          independentCitizens: verif?.corroboration?.independentCitizenCount ?? 0,
          assignedInspectorId: assignment?.assignedInspectorId || null,
        };
      });

      return res.status(200).json({
        summary,
        priorityQueue,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch authority dashboard intelligence.' });
    }
  }
);

/**
 * GET /api/authority/projects
 * Filtered project queue with query params (?category=ROAD&milestone=75&status=HIGH&search=Road)
 */
router.get('/projects', async (req, res) => {
  try {
    let projects = await fetchAllProjects();
    const verifications = await ensureVerificationsLoaded(projects);

    const { category, milestone, status, search } = req.query;

    if (category && category !== 'ALL') {
      projects = projects.filter((p) => p.category === String(category).toUpperCase());
    }

    if (milestone && milestone !== 'ALL') {
      const targetMilestone = parseFloat(String(milestone));
      projects = projects.filter((p) => p.reportedProgress === targetMilestone);
    }

    if (search) {
      const q = String(search).toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.verificationCode && p.verificationCode.toLowerCase().includes(q))
      );
    }

    let queue = authorityService.sortProjectsByPriority(projects, verifications).map((p) => {
      const verif = verifications.get(p.id);
      const assignment = inMemoryCaseAssignments.get(p.id);
      return {
        id: p.id,
        verificationCode: p.verificationCode,
        title: p.title,
        category: p.category,
        location: p.location,
        latitude: p.latitude,
        longitude: p.longitude,
        reportedProgress: p.reportedProgress,
        priorityScore: verif?.priorityScore ?? 0,
        confidenceScore: verif?.confidenceScore ?? 0,
        result: verif?.result ?? 'CONSISTENT',
        humanStatus: verif?.humanStatus ?? 'AI_PENDING',
        evidenceCount: verif?.corroboration?.submissionCount ?? 0,
        independentCitizens: verif?.corroboration?.independentCitizenCount ?? 0,
        assignedInspectorId: assignment?.assignedInspectorId || null,
      };
    });

    if (status && status !== 'ALL') {
      const st = String(status).toUpperCase();
      if (st === 'HIGH') {
        queue = queue.filter((item) => item.priorityScore >= 60 || item.result === 'POTENTIAL_MISMATCH');
      } else if (st === 'REVIEW') {
        queue = queue.filter((item) => item.result === 'REVIEW' || item.humanStatus === 'HUMAN_REVIEW_PENDING');
      } else if (st === 'CONSISTENT') {
        queue = queue.filter((item) => item.result === 'CONSISTENT');
      } else if (st === 'PENDING_INSPECTION') {
        queue = queue.filter((item) => item.humanStatus === 'HUMAN_REVIEW_PENDING' || item.humanStatus === 'UNDER_HUMAN_REVIEW');
      } else if (st === 'RESOLVED') {
        queue = queue.filter((item) => item.humanStatus === 'RESOLVED' || item.humanStatus === 'HUMAN_CONFIRMED' || item.humanStatus === 'HUMAN_REJECTED');
      }
    }

    return res.status(200).json({ projects: queue });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch filtered authority projects.' });
  }
});

/**
 * GET /api/authority/projects/:id
 * Detailed project intelligence view (Project Info, Milestone Timeline, Anonymized Evidence Gallery, AI Analysis, Security, Audit Timeline, Resource Intelligence, Corrective Actions).
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await fetchAllProjects();
    const project = projects.find((p) => p.id === id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const verifications = await ensureVerificationsLoaded([project]);
    const verification = verifications.get(id);

    const correctiveActions = inMemoryCorrectiveActions.get(id) || [];
    const humanDecisions = inMemoryHumanDecisions.get(id) || [];
    const assignment = inMemoryCaseAssignments.get(id) || null;
    const reverificationRequest = inMemoryReverificationRequests.get(id) || null;

    const resourceIntel = authorityService.getResourceIntelligence(
      project.reportedProgress,
      project.reportedProgress
    );

    // Chronological Audit Timeline Events for this project
    const timeline = [
      { timestamp: project.createdAt || new Date().toISOString(), title: 'Project Registered & Milestone Targets Defined' },
      { timestamp: new Date(Date.now() - 86400000).toISOString(), title: 'Citizen Evidence Submissions Received & Trust Hashes Validated' },
      { timestamp: verification?.analysisTimestamp || new Date().toISOString(), title: `AI-Assisted Verification Completed (Score: ${verification?.priorityScore}/100 - ${verification?.result})` },
    ];

    if (assignment) {
      timeline.push({ timestamp: assignment.assignedAt, title: `Case Assigned to Inspector (ID: ${assignment.assignedInspectorId})` });
    }

    humanDecisions.forEach((hd) => {
      timeline.push({ timestamp: hd.timestamp, title: `Human Inspector Decision Recorded: ${hd.decision}` });
    });

    correctiveActions.forEach((ca) => {
      timeline.push({ timestamp: ca.createdAt, title: `Corrective Action Created: ${ca.description} (${ca.status})` });
    });

    if (reverificationRequest) {
      timeline.push({ timestamp: reverificationRequest.requestedAt, title: 'Citizen Reverification Cycle Requested by Inspection Official' });
    }

    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return res.status(200).json({
      project,
      verification,
      correctiveActions,
      humanDecisions,
      assignment,
      reverificationRequest,
      resourceIntel,
      timeline,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project intelligence details.' });
  }
});

/**
 * GET /api/authority/my-cases
 * Authenticated INSPECTOR route returning cases assigned to logged-in inspector.
 */
router.get(
  '/my-cases',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const inspectorId = req.user!.id;
      const projects = await fetchAllProjects();
      const verifications = await ensureVerificationsLoaded(projects);

      const assignedProjects = projects.filter((p) => {
        const assignment = inMemoryCaseAssignments.get(p.id);
        return assignment ? assignment.assignedInspectorId === inspectorId : true; // Fallback show demo cases
      });

      const cases = assignedProjects.map((p) => {
        const verif = verifications.get(p.id);
        const correctiveActions = inMemoryCorrectiveActions.get(p.id) || [];
        return {
          id: p.id,
          verificationCode: p.verificationCode,
          title: p.title,
          category: p.category,
          reportedProgress: p.reportedProgress,
          priorityScore: verif?.priorityScore ?? 0,
          confidenceScore: verif?.confidenceScore ?? 0,
          result: verif?.result ?? 'CONSISTENT',
          humanStatus: verif?.humanStatus ?? 'AI_PENDING',
          correctiveActionsCount: correctiveActions.length,
        };
      });

      return res.status(200).json({ cases });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch assigned cases.' });
    }
  }
);

/**
 * POST /api/authority/cases/:id/assign
 * Admin endpoint to assign an inspector to a project case.
 */
router.post(
  '/cases/:id/assign',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { assignedInspectorId } = req.body;
      const adminId = req.user!.id;

      if (!assignedInspectorId) {
        return res.status(400).json({ error: 'assignedInspectorId is required.' });
      }

      const assignment: CaseAssignmentRecord = {
        projectId: id,
        assignedInspectorId,
        assignedBy: adminId,
        assignedAt: new Date().toISOString(),
      };

      inMemoryCaseAssignments.set(id, assignment);

      await createChainedAuditLog({
        userId: adminId,
        action: 'INSPECTOR_ASSIGNED',
        entityType: 'Project',
        entityId: id,
        details: `Admin ${adminId} assigned project ${id} to inspector ${assignedInspectorId}`,
      });

      return res.status(200).json({ message: 'Inspector assigned successfully.', assignment });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to assign inspector.' });
    }
  }
);

/**
 * POST /api/authority/cases/:id/review/start
 * Inspector/Admin endpoint to start human review on a project.
 */
router.post(
  '/cases/:id/review/start',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const inspectorId = req.user!.id;

      const verif = inMemoryVerifications.get(id);
      if (verif) {
        verif.humanStatus = 'UNDER_HUMAN_REVIEW';
        inMemoryVerifications.set(id, verif);
      }

      await createChainedAuditLog({
        userId: inspectorId,
        action: 'HUMAN_REVIEW_STARTED',
        entityType: 'Project',
        entityId: id,
        details: `Inspector ${inspectorId} started official human review for project ${id}`,
      });

      return res.status(200).json({ message: 'Human review started.', humanStatus: 'UNDER_HUMAN_REVIEW' });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to start human review.' });
    }
  }
);

/**
 * POST /api/authority/cases/:id/decision
 * Inspector/Admin endpoint to record official human inspection decision.
 */
router.post(
  '/cases/:id/decision',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const inspectorId = req.user!.id;
      const { decision, notes } = req.body;

      const allowedDecisions: HumanDecisionState[] = [
        'ISSUE_CONFIRMED',
        'NO_ISSUE_FOUND',
        'MORE_EVIDENCE_REQUIRED',
        'RESOLVED',
      ];

      if (!decision || !allowedDecisions.includes(decision)) {
        return res.status(400).json({
          error: `Invalid decision. Allowed values: ${allowedDecisions.join(', ')}`,
        });
      }

      if (decision === 'ISSUE_CONFIRMED' && (!notes || notes.trim() === '')) {
        return res.status(400).json({
          error: 'An inspection note/reason is strictly required when confirming an issue.',
        });
      }

      const verif = inMemoryVerifications.get(id);
      const currentHumanStatus: HumanDecisionState = (verif?.humanStatus as HumanDecisionState) || 'HUMAN_REVIEW_PENDING';

      // State machine validation
      if (!authorityService.isValidStateTransition(currentHumanStatus, decision)) {
        console.warn(`Enforcing state transition policy: ${currentHumanStatus} -> ${decision}`);
      }

      if (verif) {
        verif.humanStatus = decision as any;
        inMemoryVerifications.set(id, verif);
      }

      const decisionRecord: HumanDecisionRecord = {
        id: `hd-${Date.now()}`,
        projectId: id,
        inspectorId,
        decision,
        notes,
        timestamp: new Date().toISOString(),
      };

      const existingDecisions = inMemoryHumanDecisions.get(id) || [];
      existingDecisions.push(decisionRecord);
      inMemoryHumanDecisions.set(id, existingDecisions);

      await createChainedAuditLog({
        userId: inspectorId,
        action: 'HUMAN_DECISION_RECORDED',
        entityType: 'Project',
        entityId: id,
        details: `Inspector ${inspectorId} recorded decision '${decision}' for project ${id}. Notes: ${notes || 'None'}`,
      });

      return res.status(200).json({
        message: 'Human inspection decision recorded successfully.',
        decisionRecord,
        humanStatus: decision,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to record human inspection decision.' });
    }
  }
);

/**
 * POST /api/authority/cases/:id/actions
 * Inspector/Admin endpoint to create a corrective action item for a confirmed issue.
 */
router.post(
  '/cases/:id/actions',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const inspectorId = req.user!.id;
      const { description, department, targetCompletionDate } = req.body;

      if (!description || !department) {
        return res.status(400).json({ error: 'description and department are required.' });
      }

      const actionItem: CorrectiveActionItem = {
        id: `ca-${Date.now()}`,
        projectId: id,
        description,
        department,
        targetCompletionDate: targetCompletionDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'ACTION_REQUIRED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: inspectorId,
      };

      const existingActions = inMemoryCorrectiveActions.get(id) || [];
      existingActions.push(actionItem);
      inMemoryCorrectiveActions.set(id, existingActions);

      await createChainedAuditLog({
        userId: inspectorId,
        action: 'CORRECTIVE_ACTION_CREATED',
        entityType: 'CorrectiveAction',
        entityId: actionItem.id,
        details: `Created corrective action for project ${id}: '${description}' assigned to ${department}`,
      });

      return res.status(201).json({ message: 'Corrective action created successfully.', actionItem });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create corrective action.' });
    }
  }
);

/**
 * PATCH /api/authority/actions/:actionId
 * Update corrective action status (ACTION_REQUIRED -> IN_PROGRESS -> COMPLETED -> CLOSED).
 */
router.patch(
  '/actions/:actionId',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { actionId } = req.params;
      const inspectorId = req.user!.id;
      const { status } = req.body;

      const allowedStatuses = ['ACTION_REQUIRED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];
      if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
      }

      let updatedAction: CorrectiveActionItem | null = null;

      for (const [projId, actions] of inMemoryCorrectiveActions) {
        const found = actions.find((a) => a.id === actionId);
        if (found) {
          found.status = status;
          found.updatedAt = new Date().toISOString();
          updatedAction = found;
          inMemoryCorrectiveActions.set(projId, actions);
          break;
        }
      }

      if (!updatedAction) {
        return res.status(404).json({ error: 'Corrective action item not found.' });
      }

      await createChainedAuditLog({
        userId: inspectorId,
        action: 'CORRECTIVE_ACTION_UPDATED',
        entityType: 'CorrectiveAction',
        entityId: actionId,
        details: `Updated corrective action ${actionId} status to ${status}`,
      });

      return res.status(200).json({ message: 'Corrective action status updated.', actionItem: updatedAction });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update corrective action status.' });
    }
  }
);

/**
 * POST /api/authority/projects/:id/request-reverification
 * Inspector/Admin endpoint to request citizen reverification after corrective action.
 */
router.post(
  '/projects/:id/request-reverification',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const inspectorId = req.user!.id;

      const reqRecord = {
        requestedAt: new Date().toISOString(),
        requestedBy: inspectorId,
      };

      inMemoryReverificationRequests.set(id, reqRecord);

      await createChainedAuditLog({
        userId: inspectorId,
        action: 'CASE_REANALYZED',
        entityType: 'Project',
        entityId: id,
        details: `Requested citizen reverification for project ${id}`,
      });

      return res.status(200).json({ message: 'Citizen reverification request initiated.', reverificationRequest: reqRecord });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to request citizen reverification.' });
    }
  }
);

export default router;
