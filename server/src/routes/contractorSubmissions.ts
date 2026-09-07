import { Router, Response } from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient, VerificationResult } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest, AuthUserPayload } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { computeSHA256 } from '../utils/crypto';
import { calculateHaversineDistance } from '../utils/geo';
import { createChainedAuditLog } from '../utils/auditLogger';
import { validateFileMagicBytes } from '../middleware/fileValidator';
import { logSecurityEvent } from '../utils/securityLogger';
import { ProgressEvidenceComparisonService } from '../services/civic/progressComparisonService';

const router = Router();
const prisma = new PrismaClient();
const comparisonService = new ProgressEvidenceComparisonService();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

// Default stage templates by project category
export const defaultStageTemplates: Record<string, Array<{ name: string; description: string; sequence: number }>> = {
  ROAD: [
    { name: 'Site Preparation', description: 'Surveying, land clearing, and site setup.', sequence: 1 },
    { name: 'Drainage Preparation', description: 'Side wall culverts and stormwater trench excavation.', sequence: 2 },
    { name: 'Road Base Work', description: 'Crushed stone aggregate layer compaction.', sequence: 3 },
    { name: 'Surface Work', description: 'Bituminous asphalt wearing coat laying.', sequence: 4 },
    { name: 'Finishing Work', description: 'Road marking, reflectors, and signage.', sequence: 5 },
    { name: 'Final Inspection', description: 'Joint quality audit and site handover.', sequence: 6 },
  ],
  PUBLIC_BUILDING: [
    { name: 'Site Preparation', description: 'Soil testing, excavation, and leveling.', sequence: 1 },
    { name: 'Foundation Work', description: 'RCC footings and plinth beam construction.', sequence: 2 },
    { name: 'Structural Framework', description: 'Columns, beams, and roof slab casting.', sequence: 3 },
    { name: 'Roofing & Masonry', description: 'Brickwork walls and ceiling waterproofing.', sequence: 4 },
    { name: 'Electrical & Plumbing', description: 'Conduit laying, piping, and fixtures.', sequence: 5 },
    { name: 'Finishing Work', description: 'Plastering, painting, and tiling.', sequence: 6 },
    { name: 'Final Inspection', description: 'Safety audit and final completion certificate.', sequence: 7 },
  ],
  WATER: [
    { name: 'Site Preparation', description: 'Pipeline route survey and site access.', sequence: 1 },
    { name: 'Excavation & Piping', description: 'Trench digging and main supply pipe laying.', sequence: 2 },
    { name: 'Structural Foundation', description: 'Overhead tank base RCC casting.', sequence: 3 },
    { name: 'Equipment Installation', description: 'RO plant motor and filter setup.', sequence: 4 },
    { name: 'Testing & Chlorination', description: 'Hydrostatic pressure test and water sample testing.', sequence: 5 },
    { name: 'Final Handover', description: 'Public tap connection and commissioning.', sequence: 6 },
  ],
  STREETLIGHT: [
    { name: 'Pole Location Survey', description: 'Marking pole locations along arterial route.', sequence: 1 },
    { name: 'Pole Erection', description: 'Foundation concrete and GI pole erection.', sequence: 2 },
    { name: 'Solar & Wiring Assembly', description: 'Solar panel mounting and battery connection.', sequence: 3 },
    { name: 'Auto-Dimming Calibration', description: 'Smart sensor configuration and testing.', sequence: 4 },
    { name: 'Final Lighting Inspection', description: 'Night illumination verification.', sequence: 5 },
  ],
  DEFAULT: [
    { name: 'Site Preparation', description: 'Initial site setup and materials arrival.', sequence: 1 },
    { name: 'Intermediate Execution', description: 'Core construction/installation activities.', sequence: 2 },
    { name: 'Pre-Finishing Work', description: 'Quality checks and pre-handover prep.', sequence: 3 },
    { name: 'Final Inspection', description: 'Final verification and handover.', sequence: 4 },
  ],
};

// In-Memory Fallback Repositories for Dev / Unseeded State
export const inMemoryStages: any[] = [];
export const inMemoryContractorSubmissions: any[] = [];
export const inMemoryProgressEvidences: any[] = [];
export const inMemoryProgressVerifications: any[] = [];
export const inMemoryProgressAnalyses: any[] = [];
export const inMemoryProgressDecisions: any[] = [];

// Helper to seed initial stage data in-memory if needed
function getOrCreateInMemoryStages(projectId: string, category: string = 'ROAD') {
  let existing = inMemoryStages.filter((s) => s.projectId === projectId);
  if (existing.length === 0) {
    const template = defaultStageTemplates[category.toUpperCase()] || defaultStageTemplates.DEFAULT;
    existing = template.map((st) => ({
      id: `stage-${projectId}-${st.sequence}`,
      projectId,
      name: st.name,
      description: st.description,
      sequence: st.sequence,
      required: true,
      createdAt: new Date(),
    }));
    inMemoryStages.push(...existing);
  }
  return existing.sort((a, b) => a.sequence - b.sequence);
}

/**
 * GET /api/contractor/projects/:projectId/stages
 * Returns stages for a given project (creates defaults if missing).
 */
router.get('/projects/:projectId/stages', async (req, res) => {
  try {
    const { projectId } = req.params;
    let stages: any[] = [];

    try {
      stages = await prisma.projectStage.findMany({
        where: { projectId },
        orderBy: { sequence: 'asc' },
      });

      if (stages.length === 0) {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        const category = project ? project.category : 'ROAD';
        const template = defaultStageTemplates[category.toUpperCase()] || defaultStageTemplates.DEFAULT;

        for (const st of template) {
          const created = await prisma.projectStage.create({
            data: {
              projectId,
              name: st.name,
              description: st.description,
              sequence: st.sequence,
            },
          });
          stages.push(created);
        }
      }
    } catch {
      stages = getOrCreateInMemoryStages(projectId);
    }

    return res.status(200).json({ stages });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project stages.' });
  }
});

/**
 * GET /api/contractor/assigned-projects
 * Contractor endpoint to list assigned projects and active stages.
 */
router.get(
  '/assigned-projects',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Optional JWT decoding for contractor context
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
          req.user = decoded;
        } catch {
          // Token optional for public/demo reading
        }
      }
      let projects: any[] = [];

      try {
        projects = await prisma.project.findMany({
          include: {
            stages: { orderBy: { sequence: 'asc' } },
            contractorSubmissions: {
              include: { evidences: true, verifications: true, analyses: true, decisions: true },
              orderBy: { submittedAt: 'desc' },
            },
          },
        });
      } catch {
        // Dev fallback
        projects = [
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
            status: 'IN_PROGRESS',
            stages: getOrCreateInMemoryStages('proj-demo-1', 'ROAD'),
            contractorSubmissions: inMemoryContractorSubmissions.filter((s) => s.projectId === 'proj-demo-1'),
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
            status: 'IN_PROGRESS',
            stages: getOrCreateInMemoryStages('proj-demo-3', 'STREETLIGHT'),
            contractorSubmissions: inMemoryContractorSubmissions.filter((s) => s.projectId === 'proj-demo-3'),
          },
        ];
      }

      return res.status(200).json({ projects });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch contractor projects.' });
    }
  }
);

/**
 * POST /api/contractor/submissions
 * Authenticated CONTRACTOR endpoint to upload progress evidence for a project stage.
 */
router.post(
  '/submissions',
  authenticateToken,
  requireRole(['CONTRACTOR', 'ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    uploadMiddleware(req, res, async (uploadErr) => {
      if (uploadErr) {
        return res.status(400).json({ error: uploadErr.message });
      }

      try {
        const contractorId = req.user?.id || 'demo-contractor-1';
        const { projectId, projectStageId, title, description, claim, latitude, longitude } = req.body;

        if (!projectId || !projectStageId || !title || !claim) {
          return res.status(400).json({ error: 'Project ID, Project Stage, Title, and Work Claim are required.' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const photoFile = files ? (files['photo']?.[0] || files['photos']?.[0]) : undefined;

        if (!photoFile) {
          return res.status(400).json({ error: 'Contractor progress evidence photo is required.' });
        }

        // Magic byte binary validation check
        if (!validateFileMagicBytes(photoFile.path, photoFile.mimetype)) {
          logSecurityEvent({
            type: 'INVALID_UPLOAD',
            severity: 'HIGH',
            userId: contractorId,
            endpoint: req.originalUrl,
            description: `Blocked unsafe contractor file upload (${photoFile.originalname}): Magic byte check failed.`,
          });
          try { if (fs.existsSync(photoFile.path)) fs.unlinkSync(photoFile.path); } catch {}
          return res.status(400).json({ error: 'Security Error: File upload rejected. File binary signature does not match declared MIME type.' });
        }

        const photoBuf = fs.readFileSync(photoFile.path);
        const serverEvidenceHash = computeSHA256(
          Buffer.concat([Buffer.from(`${contractorId}:${projectId}:${projectStageId}:${Date.now()}`), photoBuf])
        );

        const photoUrl = `/uploads/${photoFile.filename}`;
        const serverTimestamp = new Date();

        // Versioning check
        let version = 1;
        try {
          const existingSubmissions = await prisma.contractorProgressSubmission.findMany({
            where: { projectId, projectStageId },
          });
          if (existingSubmissions.length > 0) {
            version = existingSubmissions.length + 1;
          }
        } catch {
          const existingMem = inMemoryContractorSubmissions.filter(
            (s) => s.projectId === projectId && s.projectStageId === projectStageId
          );
          if (existingMem.length > 0) {
            version = existingMem.length + 1;
          }
        }

        let newSubmission: any;
        let newEvidence: any;

        try {
          newSubmission = await prisma.contractorProgressSubmission.create({
            data: {
              projectId,
              projectStageId,
              contractorId,
              title,
              description: description || '',
              claim,
              status: 'AWAITING_VERIFICATION',
              version,
              submittedAt: serverTimestamp,
            },
          });

          newEvidence = await prisma.progressEvidence.create({
            data: {
              submissionId: newSubmission.id,
              evidenceType: 'PHOTO',
              fileUrl: photoUrl,
              latitude: latitude ? parseFloat(latitude) : null,
              longitude: longitude ? parseFloat(longitude) : null,
              sha256Hash: serverEvidenceHash,
              serverReceivedAt: serverTimestamp,
            },
          });
        } catch {
          // Dev in-memory fallback
          newSubmission = {
            id: `sub-${Date.now()}`,
            projectId,
            projectStageId,
            contractorId,
            title,
            description: description || '',
            claim,
            status: 'AWAITING_VERIFICATION',
            version,
            submittedAt: serverTimestamp,
            createdAt: serverTimestamp,
          };
          inMemoryContractorSubmissions.push(newSubmission);

          newEvidence = {
            id: `progev-${Date.now()}`,
            submissionId: newSubmission.id,
            evidenceType: 'PHOTO',
            fileUrl: photoUrl,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            sha256Hash: serverEvidenceHash,
            serverReceivedAt: serverTimestamp,
            createdAt: serverTimestamp,
          };
          inMemoryProgressEvidences.push(newEvidence);
        }

        // Audit Logging
        await createChainedAuditLog({
          userId: contractorId,
          action: 'CONTRACTOR_PROGRESS_SUBMITTED',
          entityType: 'ContractorProgressSubmission',
          entityId: newSubmission.id,
          details: `Contractor submitted progress evidence v${version} for stage '${projectStageId}'. Title: '${title}'. Hash: ${serverEvidenceHash.slice(0, 16)}...`,
        });

        return res.status(201).json({
          message: 'Contractor progress evidence submitted successfully.',
          submission: {
            ...newSubmission,
            evidences: [newEvidence],
            fingerprint: `${serverEvidenceHash.slice(0, 4)}...${serverEvidenceHash.slice(-4)}`,
          },
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to process contractor progress submission.' });
      }
    });
  }
);

/**
 * GET /api/contractor/submissions/project/:projectId
 * Returns all contractor progress submissions for a given project with verifications and analyses.
 */
router.get('/submissions/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    let submissions: any[] = [];

    try {
      submissions = await prisma.contractorProgressSubmission.findMany({
        where: { projectId },
        include: {
          stage: true,
          contractor: { select: { id: true, name: true, email: true } },
          evidences: true,
          verifications: { include: { verifier: { select: { id: true, name: true, role: true } } } },
          analyses: true,
          decisions: true,
        },
        orderBy: { submittedAt: 'desc' },
      });
    } catch {
      submissions = inMemoryContractorSubmissions
        .filter((s) => s.projectId === projectId)
        .map((s) => {
          const stage = inMemoryStages.find((st) => st.id === s.projectStageId);
          const evidences = inMemoryProgressEvidences.filter((e) => e.submissionId === s.id);
          const verifications = inMemoryProgressVerifications.filter((v) => v.submissionId === s.id);
          const analyses = inMemoryProgressAnalyses.filter((a) => a.submissionId === s.id);
          const decisions = inMemoryProgressDecisions.filter((d) => d.submissionId === s.id);
          return {
            ...s,
            stage,
            contractor: { id: s.contractorId, name: 'Suresh Infrastructure Pvt Ltd (Contractor)', role: 'CONTRACTOR' },
            evidences,
            verifications,
            analyses,
            decisions,
          };
        });
    }

    return res.status(200).json({ submissions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch contractor submissions for project.' });
  }
});

/**
 * POST /api/contractor/submissions/:id/verify
 * Authenticated CITIZEN / INSPECTOR endpoint to verify a contractor progress claim.
 * CRITICAL SECURITY RULE: Contractor CANNOT verify their own submission.
 */
router.post(
  '/submissions/:id/verify',
  authenticateToken,
  requireRole(['CITIZEN', 'INSPECTOR', 'ADMIN', 'CONTRACTOR']),
  (req: AuthenticatedRequest, res: Response) => {
    uploadMiddleware(req, res, async (uploadErr) => {
      if (uploadErr) {
        return res.status(400).json({ error: uploadErr.message });
      }

      try {
        const submissionId = req.params.id;
        const verifierId = req.user!.id;
        const verifierRole = req.user!.role;

        // Fetch submission to check contractor ownership
        let submission: any;
        try {
          submission = await prisma.contractorProgressSubmission.findUnique({
            where: { id: submissionId },
            include: { stage: true, evidences: true, verifications: true },
          });
        } catch {
          submission = inMemoryContractorSubmissions.find((s) => s.id === submissionId);
        }

        if (!submission) {
          return res.status(404).json({ error: 'Contractor progress submission not found.' });
        }

        // CRITICAL SECURITY RBAC CHECK: Contractor CANNOT verify own submission
        if (submission.contractorId === verifierId) {
          logSecurityEvent({
            type: 'ACCESS_DENIED',
            severity: 'HIGH',
            userId: verifierId,
            endpoint: req.originalUrl,
            description: `Blocked attempt by contractor '${verifierId}' to verify their own progress submission.`,
          });
          return res.status(403).json({ error: 'Security Policy: Contractors are not permitted to verify or approve their own submissions.' });
        }

        const { observation, consistencyResponse, comment, latitude, longitude } = req.body;

        if (!observation || !consistencyResponse) {
          return res.status(400).json({ error: 'Observation response and Consistency response are required.' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const photoFile = files && files['photo'] ? files['photo'][0] : undefined;
        const photoUrl = photoFile ? `/uploads/${photoFile.filename}` : null;

        let sha256Hash: string | null = null;
        if (photoFile) {
          const photoBuf = fs.readFileSync(photoFile.path);
          sha256Hash = computeSHA256(Buffer.concat([Buffer.from(`${verifierId}:${submissionId}:${Date.now()}`), photoBuf]));
        }

        let newVerification: any;
        try {
          newVerification = await prisma.progressVerification.create({
            data: {
              submissionId,
              verifierId,
              verifierRole: verifierRole as any,
              observation: String(observation).toUpperCase(),
              consistencyResponse: String(consistencyResponse).toUpperCase(),
              comment: comment || null,
              photoUrl,
              latitude: latitude ? parseFloat(latitude) : null,
              longitude: longitude ? parseFloat(longitude) : null,
              sha256Hash,
            },
          });
        } catch {
          newVerification = {
            id: `pver-${Date.now()}`,
            submissionId,
            verifierId,
            verifierRole,
            observation: String(observation).toUpperCase(),
            consistencyResponse: String(consistencyResponse).toUpperCase(),
            comment: comment || null,
            photoUrl,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            sha256Hash,
            createdAt: new Date(),
          };
          inMemoryProgressVerifications.push(newVerification);
        }

        // Trigger AI Evidence Comparison
        let allVerifications: any[] = [];
        try {
          allVerifications = await prisma.progressVerification.findMany({ where: { submissionId } });
        } catch {
          allVerifications = inMemoryProgressVerifications.filter((v) => v.submissionId === submissionId);
        }

        const stageName = submission.stage ? submission.stage.name : 'Current Stage';
        const comparisonInput = {
          submissionId,
          projectStageName: stageName,
          contractorClaim: submission.claim,
          contractorEvidencesCount: submission.evidences ? submission.evidences.length : 1,
          citizenVerifications: allVerifications.map((v) => ({
            verifierId: v.verifierId,
            verifierRole: v.verifierRole,
            observation: v.observation,
            consistencyResponse: v.consistencyResponse,
            comment: v.comment,
            photoUrl: v.photoUrl,
          })),
        };

        const analysisOutput = comparisonService.compareEvidence(comparisonInput);

        let newAnalysis: any;
        try {
          newAnalysis = await prisma.progressAnalysis.create({
            data: {
              submissionId,
              result: analysisOutput.result,
              confidence: analysisOutput.confidence,
              explanation: analysisOutput.explanation,
              observations: JSON.stringify(analysisOutput.observations),
              recommendedHumanAction: analysisOutput.recommendedHumanAction,
              provider: analysisOutput.provider,
            },
          });

          await prisma.contractorProgressSubmission.update({
            where: { id: submissionId },
            data: { status: 'COMMUNITY_VERIFICATION_IN_PROGRESS' },
          });
        } catch {
          newAnalysis = {
            id: `panal-${Date.now()}`,
            submissionId,
            result: analysisOutput.result,
            confidence: analysisOutput.confidence,
            explanation: analysisOutput.explanation,
            observations: JSON.stringify(analysisOutput.observations),
            recommendedHumanAction: analysisOutput.recommendedHumanAction,
            provider: analysisOutput.provider,
            createdAt: new Date(),
          };
          inMemoryProgressAnalyses.push(newAnalysis);

          const memSub = inMemoryContractorSubmissions.find((s) => s.id === submissionId);
          if (memSub) memSub.status = 'COMMUNITY_VERIFICATION_IN_PROGRESS';
        }

        // Audit log
        await createChainedAuditLog({
          userId: verifierId,
          action: 'PROGRESS_VERIFICATION_SUBMITTED',
          entityType: 'ProgressVerification',
          entityId: newVerification.id,
          details: `Role '${verifierRole}' submitted verification for contractor claim '${submissionId}'. Consistency: '${consistencyResponse}'. AI Result: '${analysisOutput.result}'.`,
        });

        return res.status(201).json({
          message: 'Ground verification recorded successfully.',
          verification: newVerification,
          aiAnalysis: newAnalysis,
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to submit progress verification.' });
      }
    });
  }
);

/**
 * POST /api/contractor/submissions/:id/decision
 * Authenticated INSPECTOR / ADMIN endpoint to record human administrative decision.
 * Allowed decisions: 'VERIFY_PROGRESS' | 'NEEDS_MORE_EVIDENCE' | 'FIELD_INSPECTION_REQUIRED' | 'PROGRESS_NOT_CONFIRMED'
 */
router.post(
  '/submissions/:id/decision',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const submissionId = req.params.id;
      const inspectorId = req.user!.id;
      const { decision, reason } = req.body;

      const allowedDecisions = ['VERIFY_PROGRESS', 'NEEDS_MORE_EVIDENCE', 'FIELD_INSPECTION_REQUIRED', 'PROGRESS_NOT_CONFIRMED'];
      if (!decision || !allowedDecisions.includes(decision)) {
        return res.status(400).json({
          error: `Invalid decision. Allowed values: ${allowedDecisions.join(', ')}`,
        });
      }

      let newStatus = 'HUMAN_REVIEW_REQUIRED';
      if (decision === 'VERIFY_PROGRESS') newStatus = 'VERIFIED';
      if (decision === 'NEEDS_MORE_EVIDENCE') newStatus = 'MORE_EVIDENCE_REQUIRED';
      if (decision === 'FIELD_INSPECTION_REQUIRED') newStatus = 'FIELD_INSPECTION_REQUIRED';
      if (decision === 'PROGRESS_NOT_CONFIRMED') newStatus = 'NOT_CONFIRMED';

      let decisionRecord: any;
      try {
        decisionRecord = await prisma.progressHumanDecision.create({
          data: {
            submissionId,
            inspectorId,
            decision,
            reason: reason || null,
          },
        });

        await prisma.contractorProgressSubmission.update({
          where: { id: submissionId },
          data: { status: newStatus },
        });
      } catch {
        decisionRecord = {
          id: `pdec-${Date.now()}`,
          submissionId,
          inspectorId,
          decision,
          reason: reason || null,
          decidedAt: new Date(),
        };
        inMemoryProgressDecisions.push(decisionRecord);

        const memSub = inMemoryContractorSubmissions.find((s) => s.id === submissionId);
        if (memSub) memSub.status = newStatus;
      }

      // Audit Log
      await createChainedAuditLog({
        userId: inspectorId,
        action: `PROGRESS_${decision}`,
        entityType: 'ProgressHumanDecision',
        entityId: decisionRecord.id,
        details: `Inspector '${inspectorId}' recorded decision '${decision}' for submission '${submissionId}'. Reason: ${reason || 'N/A'}. New Status: ${newStatus}`,
      });

      return res.status(200).json({
        message: `Human decision recorded: ${decision}`,
        decision: decisionRecord,
        newStatus,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to record human inspector decision.' });
    }
  }
);

export default router;
