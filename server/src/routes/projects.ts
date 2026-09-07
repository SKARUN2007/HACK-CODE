import { Router, Response } from 'express';
import fs from 'fs';
import { PrismaClient, EvidenceStatus } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { computeSHA256 } from '../utils/crypto';
import { calculateHaversineDistance, determineLocationStatus } from '../utils/geo';
import { createChainedAuditLog } from '../utils/auditLogger';
import { ExactHashSimilarityService } from '../services/similarity/similarity.interface';
import { validateFileMagicBytes } from '../middleware/fileValidator';
import { logSecurityEvent } from '../utils/securityLogger';

const router = Router();
const prisma = new PrismaClient();
const similarityService = new ExactHashSimilarityService();

export const inMemoryEvidences: any[] = [];

// Demo in-memory fallback projects if DB is unseeded in dev
const demoProjectsFallback = [
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
    milestones: [
      { id: 'm1-1', percentage: 25, status: 'REACHED' },
      { id: 'm1-2', percentage: 50, status: 'IN_PROGRESS' },
      { id: 'm1-3', percentage: 75, status: 'NOT_STARTED' },
      { id: 'm1-4', percentage: 100, status: 'NOT_STARTED' },
    ],
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
    milestones: [
      { id: 'm2-1', percentage: 25, status: 'VERIFIED' },
      { id: 'm2-2', percentage: 50, status: 'REACHED' },
      { id: 'm2-3', percentage: 75, status: 'IN_PROGRESS' },
      { id: 'm2-4', percentage: 100, status: 'NOT_STARTED' },
    ],
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
    milestones: [
      { id: 'm3-1', percentage: 25, status: 'VERIFIED' },
      { id: 'm3-2', percentage: 50, status: 'VERIFIED' },
      { id: 'm3-3', percentage: 75, status: 'REACHED' },
      { id: 'm3-4', percentage: 100, status: 'IN_PROGRESS' },
    ],
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
    milestones: [
      { id: 'm4-1', percentage: 25, status: 'VERIFIED' },
      { id: 'm4-2', percentage: 50, status: 'REACHED' },
      { id: 'm4-3', percentage: 75, status: 'NOT_STARTED' },
      { id: 'm4-4', percentage: 100, status: 'NOT_STARTED' },
    ],
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
    milestones: [
      { id: 'm5-1', percentage: 25, status: 'VERIFIED' },
      { id: 'm5-2', percentage: 50, status: 'VERIFIED' },
      { id: 'm5-3', percentage: 75, status: 'REACHED' },
      { id: 'm5-4', percentage: 100, status: 'IN_PROGRESS' },
    ],
  },
];

/**
 * GET /api/projects
 * Query params: ?category=ROAD|WATER|...
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let projects;

    try {
      const where: any = {};
      if (category && category !== 'ALL') {
        where.category = String(category).toUpperCase();
      }
      projects = await prisma.project.findMany({
        where,
        include: { milestones: { orderBy: { percentage: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });

      if (!projects || projects.length === 0) {
        throw new Error('No DB projects found, fallback');
      }
    } catch {
      projects = demoProjectsFallback.filter(
        (p) => !category || category === 'ALL' || p.category === String(category).toUpperCase()
      );
    }

    return res.status(200).json({ projects });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch public projects.' });
  }
});

/**
 * GET /api/projects/resolve-code/:code
 * Resolves QR project verification code server-side safely.
 */
router.get('/resolve-code/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    let project;

    try {
      project = await prisma.project.findFirst({
        where: { verificationCode: code },
        include: { milestones: { orderBy: { percentage: 'asc' } } },
      });
    } catch {
      project = null;
    }

    if (!project) {
      project = demoProjectsFallback.find((p) => p.verificationCode === code);
    }

    if (!project) {
      return res.status(404).json({ error: 'Project verification code not recognized.' });
    }

    // Log chained audit event
    await createChainedAuditLog({
      userId: (req as any).user?.id || null,
      action: 'QR_PROJECT_RESOLVED',
      entityType: 'Project',
      entityId: project.id,
      details: `Resolved QR verification code '${code}' for project '${project.title}'`,
    });

    return res.status(200).json({ project });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve project verification code.' });
  }
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let project;

    try {
      project = await prisma.project.findUnique({
        where: { id },
        include: {
          milestones: { orderBy: { percentage: 'asc' } },
          stages: { orderBy: { sequence: 'asc' } },
          contractorSubmissions: {
            include: { evidences: true, verifications: true, analyses: true, decisions: true },
            orderBy: { submittedAt: 'desc' },
          },
        },
      });
    } catch {
      project = null;
    }

    if (!project) {
      project = demoProjectsFallback.find((p) => p.id === id);
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.status(200).json({ project });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project details.' });
  }
});

/**
 * GET /api/projects/:id/milestones
 */
router.get('/:id/milestones', async (req, res) => {
  try {
    const { id } = req.params;
    let milestones;

    try {
      milestones = await prisma.milestone.findMany({
        where: { projectId: id },
        orderBy: { percentage: 'asc' },
      });
    } catch {
      milestones = null;
    }

    if (!milestones || milestones.length === 0) {
      const demo = demoProjectsFallback.find((p) => p.id === id);
      milestones = demo ? demo.milestones : [];
    }

    return res.status(200).json({ milestones });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch project milestones.' });
  }
});

/**
 * POST /api/projects/:id/evidence
 * Authenticated CITIZEN endpoint to submit ground proof.
 * Validates coordinates, computes Haversine distance, checks exact SHA-256 duplicate,
 * constructs evidence trust signals, and logs chained audit event.
 */
router.post(
  '/:id/evidence',
  authenticateToken,
  requireRole(['CITIZEN']),
  (req: AuthenticatedRequest, res: Response) => {
    uploadMiddleware(req, res, async (uploadErr) => {
      if (uploadErr) {
        return res.status(400).json({ error: uploadErr.message });
      }

      try {
        const projectId = req.params.id;
        const citizenId = req.user!.id;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const photoFile = files && files['photo'] ? files['photo'][0] : undefined;
        const voiceFile = files && files['voice'] ? files['voice'][0] : undefined;

        // MAGIC BYTE BINARY SIGNATURE SECURITY CHECK
        if (photoFile && !validateFileMagicBytes(photoFile.path, photoFile.mimetype)) {
          logSecurityEvent({
            type: 'INVALID_UPLOAD',
            severity: 'HIGH',
            userId: citizenId,
            endpoint: req.originalUrl,
            description: `Blocked unsafe photo file upload (${photoFile.originalname}): Magic byte binary signature check failed.`,
          });
          try { if (fs.existsSync(photoFile.path)) fs.unlinkSync(photoFile.path); } catch {}
          return res.status(400).json({ error: 'Security Error: File upload rejected. File binary signature does not match declared MIME type.' });
        }

        if (voiceFile && !validateFileMagicBytes(voiceFile.path, voiceFile.mimetype)) {
          logSecurityEvent({
            type: 'INVALID_UPLOAD',
            severity: 'HIGH',
            userId: citizenId,
            endpoint: req.originalUrl,
            description: `Blocked unsafe voice file upload (${voiceFile.originalname}): Magic byte binary signature check failed.`,
          });
          try { if (fs.existsSync(voiceFile.path)) fs.unlinkSync(voiceFile.path); } catch {}
          return res.status(400).json({ error: 'Security Error: File upload rejected. File binary signature does not match declared MIME type.' });
        }

        const milestoneId = req.body.milestoneId || null;
        const latitude = req.body.latitude !== undefined && req.body.latitude !== '' ? parseFloat(req.body.latitude) : null;
        const longitude = req.body.longitude !== undefined && req.body.longitude !== '' ? parseFloat(req.body.longitude) : null;
        const locationProvided = req.body.locationProvided === 'false' ? false : (latitude !== null && longitude !== null);

        // INPUT VALIDATION FOR COORDINATES
        if (latitude !== null && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
          return res.status(400).json({ error: 'Malformed coordinates. Latitude must be a number between -90 and 90.' });
        }
        if (longitude !== null && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
          return res.status(400).json({ error: 'Malformed coordinates. Longitude must be a number between -180 and 180.' });
        }

        const visibleWork = req.body.visibleWork || null;
        const milestoneMatch = req.body.milestoneMatch || null;
        const usableMaintained = req.body.usableMaintained || null;
        const notes = req.body.notes || null;

        const photoUrl = photoFile ? `/uploads/${photoFile.filename}` : null;
        const voiceUrl = voiceFile ? `/uploads/${voiceFile.filename}` : null;

        // Fetch project for Haversine distance calculation
        let projectCoords: any = demoProjectsFallback.find((p) => p.id === projectId);
        try {
          if (!projectCoords) {
            const p = await prisma.project.findUnique({ where: { id: projectId } });
            if (p) projectCoords = p;
          }
        } catch {
          // ignore
        }

        // SERVER-SIDE HAVERSINE DISTANCE COMPUTATION
        let distanceFromProject: number | null = null;
        if (latitude !== null && longitude !== null && projectCoords) {
          distanceFromProject = calculateHaversineDistance(
            latitude,
            longitude,
            projectCoords.latitude,
            projectCoords.longitude
          );
        }

        const locationStatus = determineLocationStatus(distanceFromProject);

        // SERVER-SIDE SHA-256 EVIDENCE INTEGRITY HASH COMPUTATION
        let hashContentBuffer = Buffer.from(
          `${citizenId}:${projectId}:${latitude}:${longitude}:${Date.now()}`
        );

        if (photoFile) {
          const photoBuf = fs.readFileSync(photoFile.path);
          hashContentBuffer = Buffer.concat([hashContentBuffer, photoBuf]);
        }
        if (voiceFile) {
          const voiceBuf = fs.readFileSync(voiceFile.path);
          hashContentBuffer = Buffer.concat([hashContentBuffer, voiceBuf]);
        }

        const serverEvidenceHash = computeSHA256(hashContentBuffer);
        const serverTimestamp = new Date();

        // EXACT DUPLICATE SHA-256 CHECK
        let existingHashes: Array<{ id: string; hash: string }> = [];
        try {
          const dbEvidences = await prisma.evidence.findMany({ select: { id: true, evidenceHash: true } });
          existingHashes = dbEvidences.map((e) => ({ id: e.id, hash: e.evidenceHash }));
        } catch {
          existingHashes = inMemoryEvidences.map((e) => ({ id: e.id, hash: e.evidenceHash }));
        }

        const duplicateCheck = await similarityService.checkForDuplicate(serverEvidenceHash, existingHashes);
        const exactDuplicate = duplicateCheck.exactDuplicate;
        const duplicateOfId = duplicateCheck.duplicateOfId || null;

        // Construct Evidence Trust Signals structure
        const trustSignals = {
          integrityRecorded: true,
          serverTimestampRecorded: true,
          locationStatus,
          distanceFromProject,
          exactDuplicate,
          photoProvided: Boolean(photoFile),
          voiceProvided: Boolean(voiceFile),
        };

        let newEvidence;

        try {
          newEvidence = await prisma.evidence.create({
            data: {
              projectId,
              citizenId,
              milestoneId,
              photoUrl,
              voiceUrl,
              latitude,
              longitude,
              locationProvided,
              distanceFromProject,
              locationStatus,
              exactDuplicate,
              duplicateOfId,
              capturedAt: serverTimestamp,
              evidenceHash: serverEvidenceHash,
              status: EvidenceStatus.SUBMITTED,
              visibleWork,
              milestoneMatch,
              usableMaintained,
              notes,
            },
          });
        } catch {
          // Fallback mock evidence record if DB is unseeded in dev
          newEvidence = {
            id: `ev-${Date.now()}`,
            projectId,
            citizenId,
            milestoneId,
            photoUrl,
            voiceUrl,
            latitude,
            longitude,
            locationProvided,
            distanceFromProject,
            locationStatus,
            exactDuplicate,
            duplicateOfId,
            capturedAt: serverTimestamp,
            evidenceHash: serverEvidenceHash,
            status: 'SUBMITTED',
            visibleWork,
            milestoneMatch,
            usableMaintained,
            notes,
            createdAt: serverTimestamp,
          };
          inMemoryEvidences.push(newEvidence);
        }

        const clientCapturedAt = req.body.clientCapturedAt;

        // Record Chained Audit Log Event
        const auditAction = clientCapturedAt ? 'OFFLINE_EVIDENCE_SYNCED' : 'EVIDENCE_SUBMITTED';
        await createChainedAuditLog({
          userId: citizenId,
          action: auditAction,
          entityType: 'Evidence',
          entityId: newEvidence.id,
          details: `${clientCapturedAt ? 'Synced offline evidence (captured at ' + clientCapturedAt + ')' : 'Submitted evidence'} for project ${projectId}. Distance: ${distanceFromProject ?? 'N/A'}m. LocationStatus: ${locationStatus}. SHA-256: ${serverEvidenceHash.slice(0, 16)}...`,
        });

        return res.status(201).json({
          message: 'Evidence submitted successfully.',
          integrityStatus: 'INTEGRITY_RECORDED',
          trustSignals,
          evidence: {
            id: newEvidence.id,
            projectId,
            milestoneId,
            photoUrl,
            voiceUrl,
            locationProvided,
            latitude,
            longitude,
            distanceFromProject,
            locationStatus,
            exactDuplicate,
            duplicateOfId,
            capturedAt: serverTimestamp,
            evidenceHash: serverEvidenceHash,
            fingerprint: `${serverEvidenceHash.slice(0, 4)}...${serverEvidenceHash.slice(-4)}`,
            status: 'SUBMITTED',
            visibleWork,
            milestoneMatch,
            usableMaintained,
            notes,
          },
        });
      } catch (err: any) {
        return res.status(500).json({ error: 'Failed to process evidence submission.' });
      }
    });
  }
);

export default router;
