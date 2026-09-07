import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { createChainedAuditLog } from '../utils/auditLogger';
import { verificationService } from '../services/verification/verificationService';
import { VerificationAnalysisResult } from '../services/verification/verification.interface';

const router = Router();
const prisma = new PrismaClient();

// In-memory verification storage fallback
export const inMemoryVerifications: Map<string, VerificationAnalysisResult> = new Map();

// Demo project baseline evidence seed cases
const demoProjectEvidencesSeed: Record<string, any[]> = {
  // CASE A: Green - CONSISTENT (Village Road Improvement)
  'proj-demo-1': [
    {
      id: 'demo-ev-1-1',
      citizenId: 'cit-101',
      locationProvided: true,
      latitude: 13.0512,
      longitude: 79.9741,
      distanceFromProject: 45,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 86400000).toISOString(),
      evidenceHash: 'a1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdef',
      visibleWork: 'YES',
      milestoneMatch: 'YES',
      usableMaintained: 'YES',
      notes: 'Road base levelling and initial gravel work is clearly visible.',
    },
    {
      id: 'demo-ev-1-2',
      citizenId: 'cit-102',
      locationProvided: true,
      latitude: 13.0515,
      longitude: 79.9745,
      distanceFromProject: 80,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 43200000).toISOString(),
      evidenceHash: 'b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1',
      visibleWork: 'YES',
      milestoneMatch: 'YES',
      usableMaintained: 'YES',
      notes: 'Culvert drainage side walls construction in progress.',
    },
    {
      id: 'demo-ev-1-3',
      citizenId: 'cit-103',
      locationProvided: true,
      latitude: 13.0510,
      longitude: 79.9740,
      distanceFromProject: 30,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 21600000).toISOString(),
      evidenceHash: 'c3d4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2',
      visibleWork: 'YES',
      milestoneMatch: 'YES',
      usableMaintained: 'YES',
      notes: 'Machines active laying bitumen sub-layer.',
    },
  ],

  // CASE B: Amber - REVIEW (Community Drinking Water Facility)
  'proj-demo-2': [
    {
      id: 'demo-ev-2-1',
      citizenId: 'cit-201',
      locationProvided: true,
      latitude: 12.1304,
      longitude: 77.9015,
      distanceFromProject: 110,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 72000000).toISOString(),
      evidenceHash: 'd4e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3',
      visibleWork: 'YES',
      milestoneMatch: 'YES',
      usableMaintained: 'YES',
      notes: 'Overhead tank foundation concrete poured.',
    },
    {
      id: 'demo-ev-2-2',
      citizenId: 'cit-202',
      locationProvided: true,
      latitude: 12.1308,
      longitude: 77.9020,
      distanceFromProject: 350,
      locationStatus: 'LOCATION_REVIEW',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 36000000).toISOString(),
      evidenceHash: 'e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Pipeline trench remains open without pipes laid.',
    },
    {
      id: 'demo-ev-2-3',
      citizenId: 'cit-203',
      locationProvided: false,
      latitude: null,
      longitude: null,
      distanceFromProject: null,
      locationStatus: 'LOCATION_NOT_PROVIDED',
      exactDuplicate: true,
      duplicateOfId: 'demo-ev-2-2',
      capturedAt: new Date(Date.now() - 18000000).toISOString(),
      evidenceHash: 'e5f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4',
      visibleWork: 'UNSURE',
      milestoneMatch: 'UNSURE',
      usableMaintained: 'UNSURE',
      notes: 'Site locked during visit.',
    },
  ],

  // CASE C: Red - POTENTIAL_MISMATCH (Public Streetlight Installation)
  'proj-demo-3': [
    {
      id: 'demo-ev-3-1',
      citizenId: 'cit-301',
      locationProvided: true,
      latitude: 10.3624,
      longitude: 77.9812,
      distanceFromProject: 65,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 90000000).toISOString(),
      evidenceHash: 'f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Only 30 poles installed out of reported 120 poles for 75% milestone.',
    },
    {
      id: 'demo-ev-3-2',
      citizenId: 'cit-302',
      locationProvided: true,
      latitude: 10.3628,
      longitude: 77.9815,
      distanceFromProject: 90,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 70000000).toISOString(),
      evidenceHash: '78901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f6',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Solar panels missing on stretch B streetlights.',
    },
    {
      id: 'demo-ev-3-3',
      citizenId: 'cit-303',
      locationProvided: true,
      latitude: 10.3620,
      longitude: 77.9810,
      distanceFromProject: 40,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 50000000).toISOString(),
      evidenceHash: '8901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f67',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Cables hanging unattached at bus stand junction.',
    },
    {
      id: 'demo-ev-3-4',
      citizenId: 'cit-304',
      locationProvided: true,
      latitude: 10.3630,
      longitude: 77.9820,
      distanceFromProject: 120,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 30000000).toISOString(),
      evidenceHash: '901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f678',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Lights not functional at night time inspection.',
    },
    {
      id: 'demo-ev-3-5',
      citizenId: 'cit-305',
      locationProvided: true,
      latitude: 10.3622,
      longitude: 77.9811,
      distanceFromProject: 50,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 20000000).toISOString(),
      evidenceHash: '01234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f6789',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Work appears incomplete compared to 75% claim.',
    },
    {
      id: 'demo-ev-3-6',
      citizenId: 'cit-306',
      locationProvided: true,
      latitude: 10.3625,
      longitude: 77.9813,
      distanceFromProject: 70,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date(Date.now() - 10000000).toISOString(),
      evidenceHash: '1234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f67890',
      visibleWork: 'YES',
      milestoneMatch: 'YES',
      usableMaintained: 'YES',
      notes: 'Some poles are working fine.',
    },
    {
      id: 'demo-ev-3-7',
      citizenId: 'cit-301', // Repeat from cit-301 (exact duplicate upload)
      locationProvided: true,
      latitude: 10.3624,
      longitude: 77.9812,
      distanceFromProject: 65,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: true,
      duplicateOfId: 'demo-ev-3-1',
      capturedAt: new Date(Date.now() - 5000000).toISOString(),
      evidenceHash: 'f678901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Only 30 poles installed out of reported 120 poles.',
    },
    {
      id: 'demo-ev-3-8',
      citizenId: 'cit-302', // Repeat from cit-302 (exact duplicate upload)
      locationProvided: true,
      latitude: 10.3628,
      longitude: 77.9815,
      distanceFromProject: 90,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: true,
      duplicateOfId: 'demo-ev-3-2',
      capturedAt: new Date(Date.now() - 2000000).toISOString(),
      evidenceHash: '78901234567890abcdefa1b2c3d4e5f678901234567890abcdefa1b2c3d4e5f6',
      visibleWork: 'NO',
      milestoneMatch: 'NO',
      usableMaintained: 'NO',
      notes: 'Solar panels missing on stretch B.',
    },
  ],
};

/**
 * Helper to fetch project details from DB or fallback
 */
async function fetchProjectData(projectId: string): Promise<any> {
  try {
    const proj = await prisma.project.findUnique({ where: { id: projectId } });
    if (proj) return proj;
  } catch {
    // ignore
  }

  // Fallback demo projects
  const fallbacks: Record<string, any> = {
    'proj-demo-1': {
      id: 'proj-demo-1',
      title: 'Village Road Improvement (DEMO)',
      category: 'ROAD',
      reportedProgress: 25.0,
      latitude: 13.0512,
      longitude: 79.9741,
    },
    'proj-demo-2': {
      id: 'proj-demo-2',
      title: 'Community Drinking Water Facility (DEMO)',
      category: 'WATER',
      reportedProgress: 50.0,
      latitude: 12.1304,
      longitude: 77.9015,
    },
    'proj-demo-3': {
      id: 'proj-demo-3',
      title: 'Public Streetlight Installation (DEMO)',
      category: 'STREETLIGHT',
      reportedProgress: 75.0,
      latitude: 10.3624,
      longitude: 77.9812,
    },
    'proj-demo-4': {
      id: 'proj-demo-4',
      title: 'Community Sanitation Facility (DEMO)',
      category: 'SANITATION',
      reportedProgress: 50.0,
      latitude: 11.3210,
      longitude: 76.9854,
    },
    'proj-demo-5': {
      id: 'proj-demo-5',
      title: 'Government School Building Renovation (DEMO)',
      category: 'PUBLIC_BUILDING',
      reportedProgress: 75.0,
      latitude: 10.6251,
      longitude: 79.2432,
    },
  };

  return fallbacks[projectId] || {
    id: projectId,
    title: 'Public Infrastructure Project',
    category: 'CIVIC',
    reportedProgress: 50.0,
    latitude: 13.0,
    longitude: 80.0,
  };
}

/**
 * Helper to fetch project evidences from DB or seeded demo data
 */
async function fetchProjectEvidences(projectId: string): Promise<any[]> {
  let evidences: any[] = [];
  try {
    evidences = await prisma.evidence.findMany({ where: { projectId } });
  } catch {
    evidences = [];
  }

  // If DB evidences exist, return them
  if (evidences && evidences.length > 0) {
    return evidences;
  }

  // Fallback to seeded demo evidence cases for demo projects
  return demoProjectEvidencesSeed[projectId] || [
    {
      id: `ev-fallback-${projectId}-1`,
      citizenId: 'cit-demo-user',
      locationProvided: true,
      latitude: 13.05,
      longitude: 79.97,
      distanceFromProject: 50,
      locationStatus: 'NEAR_PROJECT',
      exactDuplicate: false,
      capturedAt: new Date().toISOString(),
      evidenceHash: 'e1f2a3b4c5d6e7f8901234567890abcdef1234567890abcdef1234567890abcd',
      visibleWork: 'YES',
      milestoneMatch: 'YES',
      notes: 'Initial work in progress.',
    },
  ];
}

/**
 * POST /api/verifications/project/:projectId/analyze
 * Inspector/Admin endpoint to trigger AI-assisted verification analysis.
 */
router.post(
  '/project/:projectId/analyze',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { projectId } = req.params;
      const inspectorId = req.user!.id;

      // Log AI Analysis Started Event
      await createChainedAuditLog({
        userId: inspectorId,
        action: 'AI_ANALYSIS_STARTED',
        entityType: 'Project',
        entityId: projectId,
        details: `Triggered AI-assisted verification analysis for project ${projectId}`,
      });

      const project = await fetchProjectData(projectId);
      const evidences = await fetchProjectEvidences(projectId);

      const analysisResult = await verificationService.analyzeProjectEvidence({
        project,
        evidences,
      });

      // Save analysis in-memory
      inMemoryVerifications.set(projectId, analysisResult);

      // Log AI Analysis Completed & Result Created Events
      await createChainedAuditLog({
        userId: inspectorId,
        action: 'AI_ANALYSIS_COMPLETED',
        entityType: 'Verification',
        entityId: analysisResult.id,
        details: `Completed AI-assisted analysis for project ${projectId}. Result: ${analysisResult.result}, Priority Score: ${analysisResult.priorityScore}/100, Confidence: ${analysisResult.confidenceScore}/100`,
      });

      await createChainedAuditLog({
        userId: inspectorId,
        action: 'VERIFICATION_RESULT_CREATED',
        entityType: 'Verification',
        entityId: analysisResult.id,
        details: `Created verification result with humanStatus ${analysisResult.humanStatus}`,
      });

      return res.status(200).json({
        message: 'AI-assisted verification analysis completed successfully.',
        verification: analysisResult,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to run AI-assisted verification analysis.' });
    }
  }
);

/**
 * GET /api/verifications/project/:projectId
 * Fetch latest verification result for project (auto-analyzes if not generated yet).
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    let verification = inMemoryVerifications.get(projectId);

    if (!verification) {
      const project = await fetchProjectData(projectId);
      const evidences = await fetchProjectEvidences(projectId);
      verification = await verificationService.analyzeProjectEvidence({ project, evidences });
      inMemoryVerifications.set(projectId, verification);
    }

    return res.status(200).json({ verification });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project verification result.' });
  }
});

/**
 * GET /api/verifications/:id
 * Fetch single verification analysis record.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    for (const [, v] of inMemoryVerifications) {
      if (v.id === id) {
        return res.status(200).json({ verification: v });
      }
    }

    return res.status(404).json({ error: 'Verification analysis record not found.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch verification record.' });
  }
});

/**
 * PATCH /api/verifications/:id/human-review
 * Inspector/Admin endpoint to record human-in-the-loop inspection decision.
 */
router.patch(
  '/:id/human-review',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const inspectorId = req.user!.id;
      const { humanStatus, inspectorNotes } = req.body;

      const allowedStatuses = ['HUMAN_CONFIRMED', 'HUMAN_REJECTED', 'RESOLVED'];
      if (!humanStatus || !allowedStatuses.includes(humanStatus)) {
        return res.status(400).json({
          error: `Invalid humanStatus. Allowed values: ${allowedStatuses.join(', ')}`,
        });
      }

      let targetVerification: VerificationAnalysisResult | null = null;
      let targetProjectId = '';

      for (const [projId, v] of inMemoryVerifications) {
        if (v.id === id) {
          targetVerification = v;
          targetProjectId = projId;
          break;
        }
      }

      if (!targetVerification) {
        return res.status(404).json({ error: 'Verification record not found.' });
      }

      // Update Human Status
      targetVerification.humanStatus = humanStatus as any;
      if (inspectorNotes) {
        targetVerification.whyFlagged.push(`Human Inspector Note: ${inspectorNotes}`);
      }

      inMemoryVerifications.set(targetProjectId, targetVerification);

      // Log Audit Event
      await createChainedAuditLog({
        userId: inspectorId,
        action: 'VERIFICATION_REANALYZED',
        entityType: 'Verification',
        entityId: id,
        details: `Human Inspector updated verification status to ${humanStatus}. Notes: ${inspectorNotes || 'None'}`,
      });

      return res.status(200).json({
        message: 'Human review status recorded successfully.',
        verification: targetVerification,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to record human review status.' });
    }
  }
);

export default router;
