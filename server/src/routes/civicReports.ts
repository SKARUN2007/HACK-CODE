import { Router, Response } from 'express';
import fs from 'fs';
import { PrismaClient, CivicCategory, CivicReportStatus } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { validateUploadsMiddleware } from '../middleware/fileValidator';
import { computeSHA256 } from '../utils/crypto';
import { createChainedAuditLog } from '../utils/auditLogger';
import { classifyCivicIssue, CivicCategoryType } from '../services/civic/civicClassifier';
import { routeAuthority, DEMO_AUTHORITY_DIRECTORY, AuthorityRecord } from '../services/civic/authorityRouter';
import { generateFormalComplaint, generateReportCode } from '../services/civic/complaintGenerator';
import { CrossDomainDetectionService } from '../services/civic/crossDomainDetectionService';


const router = Router();
const prisma = new PrismaClient();

// In-memory store fallback if Prisma is not connected or in dev mode
export const inMemoryCivicReports: any[] = [];
export let inMemoryAuthorities: AuthorityRecord[] = [...DEMO_AUTHORITY_DIRECTORY];

/**
 * Helper to get authority directory list from DB or memory fallback
 */
export async function getAuthorityDirectoryList(): Promise<AuthorityRecord[]> {

  try {
    const dbAuths = await prisma.authorityDirectory.findMany();
    if (dbAuths && dbAuths.length > 0) {
      return dbAuths.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type as any,
        jurisdiction: a.jurisdiction,
        city: a.city || undefined,
        state: a.state,
        supportedCategories: a.supportedCategories.split(',') as CivicCategoryType[],
        submissionUrl: a.submissionUrl || undefined,
        contactMethod: a.contactMethod || undefined,
        isDemo: a.isDemo,
      }));
    }
  } catch (err) {
    // DB query failed or table unseeded
  }
  return inMemoryAuthorities;
}

/**
 * 1. CLASSIFY CIVIC ISSUE PHOTO / DESCRIPTION
 * POST /api/civic-reports/classify
 */
router.post('/classify', uploadMiddleware, validateUploadsMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const userDescription = req.body.description as string | undefined;

    const classification = await classifyCivicIssue({
      imagePath: photoFile?.path,
      userDescription,
    });

    res.json({
      success: true,
      classification,
      photoUrl: photoFile ? `/uploads/${photoFile.filename}` : undefined,
    });
  } catch (error: any) {
    console.error('[CivicReports API] Classification error:', error);
    res.status(500).json({ error: 'Failed to classify civic issue.', details: error?.message });
  }
});

/**
 * 2. ROUTE TO RESPONSIBLE AUTHORITY
 * POST /api/civic-reports/route-authority
 */
router.post('/route-authority', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, locationText } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required for authority routing.' });
    }

    const directory = await getAuthorityDirectoryList();
    const routingResult = routeAuthority({
      category: category as CivicCategoryType,
      locationText,
      customDirectory: directory,
    });

    res.json({
      success: true,
      routing: routingResult,
    });
  } catch (error: any) {
    console.error('[CivicReports API] Routing error:', error);
    res.status(500).json({ error: 'Failed to route authority.', details: error?.message });
  }
});

/**
 * 3. GENERATE FORMAL COMPLAINT TEXT
 * POST /api/civic-reports/generate-complaint
 */
router.post('/generate-complaint', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportCode, category, issueType, locationText, latitude, longitude, description, authorityId, evidenceHash, language } = req.body;

    const code = reportCode || generateReportCode();
    const directory = await getAuthorityDirectoryList();
    const matchedAuth = directory.find(a => a.id === authorityId) || routeAuthority({ category, locationText, customDirectory: directory }).authority;

    const complaintText = generateFormalComplaint({
      reportCode: code,
      category: category || 'OTHER',
      issueType: issueType || 'CIVIC_ISSUE',
      locationText: locationText || '',
      latitude,
      longitude,
      description,
      authority: matchedAuth,
      evidenceHash,
      createdAt: new Date(),
      language: language === 'ta' ? 'ta' : 'en',
    });

    res.json({
      success: true,
      reportCode: code,
      authority: matchedAuth,
      complaintText,
    });
  } catch (error: any) {
    console.error('[CivicReports API] Complaint generation error:', error);
    res.status(500).json({ error: 'Failed to generate complaint text.', details: error?.message });
  }
});

/**
 * 4. CREATE / SUBMIT CIVIC REPORT
 * POST /api/civic-reports
 */
router.post('/', authenticateToken, uploadMiddleware, validateUploadsMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const voiceFile = files?.['voice']?.[0];

    const {
      description,
      latitude,
      longitude,
      locationText,
      category,
      issueType,
      classificationConfidence,
      classificationExplanation,
      authorityId,
      routingConfidence,
      complaintText: clientComplaintText,
      reportCode: clientReportCode,
      language,
    } = req.body;

    // Calculate server-side SHA-256 evidence integrity hash
    let evidenceHash = 'hash-no-media-provided';
    if (photoFile && fs.existsSync(photoFile.path)) {
      const fileBuffer = fs.readFileSync(photoFile.path);
      evidenceHash = computeSHA256(fileBuffer);
    }

    const photoUrl = photoFile ? `/uploads/${photoFile.filename}` : req.body.photoUrl || null;
    const voiceUrl = voiceFile ? `/uploads/${voiceFile.filename}` : req.body.voiceUrl || null;

    const parsedLat = latitude ? parseFloat(latitude) : null;
    const parsedLng = longitude ? parseFloat(longitude) : null;
    const parsedCategory: CivicCategoryType = (category || 'OTHER').toUpperCase() as CivicCategoryType;
    const reportCode = clientReportCode || generateReportCode();

    const directory = await getAuthorityDirectoryList();
    const routedAuth = directory.find(a => a.id === authorityId) || routeAuthority({ category: parsedCategory, locationText, customDirectory: directory }).authority;

    const finalComplaintText = clientComplaintText || generateFormalComplaint({
      reportCode,
      category: parsedCategory,
      issueType: issueType || 'CIVIC_ISSUE',
      locationText: locationText || '',
      latitude: parsedLat,
      longitude: parsedLng,
      description,
      authority: routedAuth,
      evidenceHash,
      createdAt: new Date(),
      language: language === 'ta' ? 'ta' : 'en',
    });

    const reportData = {
      id: `civ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reportCode,
      citizenId: userId,
      photoUrl,
      voiceUrl,
      description: description || null,
      latitude: parsedLat,
      longitude: parsedLng,
      locationText: locationText || null,
      category: parsedCategory as CivicCategory,
      issueType: issueType || 'CIVIC_ISSUE',
      classificationConfidence: classificationConfidence ? parseFloat(classificationConfidence) : 0.85,
      classificationExplanation: classificationExplanation || 'AI Vision & Heuristic Classification',
      authorityId: routedAuth.id,
      routingConfidence: routingConfidence ? parseFloat(routingConfidence) : 0.90,
      complaintText: finalComplaintText,
      evidenceHash,
      status: CivicReportStatus.READY_FOR_SUBMISSION,
      createdAt: new Date(),
      updatedAt: new Date(),
      authority: routedAuth,
    };

    let savedReport: any;

    try {
      savedReport = await prisma.civicReport.create({
        data: {
          reportCode: reportData.reportCode,
          citizenId: userId,
          photoUrl: reportData.photoUrl,
          voiceUrl: reportData.voiceUrl,
          description: reportData.description,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          locationText: reportData.locationText,
          category: reportData.category,
          issueType: reportData.issueType,
          classificationConfidence: reportData.classificationConfidence,
          classificationExplanation: reportData.classificationExplanation,
          authorityId: reportData.authorityId,
          routingConfidence: reportData.routingConfidence,
          complaintText: reportData.complaintText,
          evidenceHash: reportData.evidenceHash,
          status: reportData.status,
        },
        include: {
          authority: true,
        }
      });
    } catch (dbErr) {
      console.warn('[CivicReports API] Database save skipped/failed, using in-memory store:', dbErr);
      inMemoryCivicReports.unshift(reportData);
      savedReport = reportData;
    }

    // Audit Logging
    await createChainedAuditLog({
      userId,
      action: 'CIVIC_REPORT_CREATED',
      entityType: 'CivicReport',
      entityId: savedReport.id,
      details: JSON.stringify({ reportCode: savedReport.reportCode, category: savedReport.category, authorityId: savedReport.authorityId })
    });

    // Cross-Domain Case Detection & Task Initialization
    try {
      const crossDetection = await CrossDomainDetectionService.detectRelatedDomains({
        primaryDomain: parsedCategory as CivicCategory,
        description: description || '',
        locationText: locationText || '',
        customAuthorities: directory
      });

      const citizenConfirmed = req.body.citizenConfirmed === true || req.body.citizenConfirmed === 'true';

      const coordinatedCase = await CrossDomainDetectionService.createCoordinatedCase({
        reportId: savedReport.id,
        primaryDomain: parsedCategory as CivicCategory,
        primaryReason: classificationExplanation || `Primary issue domain identified as ${parsedCategory}.`,
        primaryAuthorityId: routedAuth.id,
        relatedSuggestions: crossDetection.relatedDomains,
        citizenConfirmed
      });

      if (crossDetection.isMultiDomain) {
        await createChainedAuditLog({
          userId,
          action: 'CROSS_DOMAIN_DETECTED',
          entityType: 'CivicReport',
          entityId: savedReport.id,
          details: JSON.stringify({
            primaryDomain: parsedCategory,
            relatedDomains: crossDetection.relatedDomains.map(r => r.domain)
          })
        });
      }

      savedReport = {
        ...savedReport,
        crossDomain: {
          isMultiDomain: crossDetection.isMultiDomain,
          detection: crossDetection,
          assignments: coordinatedCase.assignments,
          tasks: coordinatedCase.tasks
        }
      };
    } catch (crossErr) {
      console.warn('[CivicReports API] Cross-domain initialization warning:', crossErr);
    }

    res.status(201).json({
      success: true,
      message: 'Civic issue report created successfully.',
      report: savedReport,
      submissionDisclaimer: 'Your MakkalSaantru report is ready. Direct authority submission requires an authorized integration.',
    });

  } catch (error: any) {
    console.error('[CivicReports API] Create error:', error);
    res.status(500).json({ error: 'Failed to create civic issue report.', details: error?.message });
  }
});

/**
 * 5. GET CITIZEN'S MY CIVIC REPORTS
 * GET /api/civic-reports/my-reports
 */
router.get('/my-reports', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    let reports: any[] = [];
    try {
      reports = await prisma.civicReport.findMany({
        where: { citizenId: userId },
        include: { authority: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      // Fallback
    }

    if (reports.length === 0) {
      reports = inMemoryCivicReports.filter(r => r.citizenId === userId || !r.citizenId);
    }

    res.json({ success: true, reports });
  } catch (error: any) {
    console.error('[CivicReports API] Fetch my-reports error:', error);
    res.status(500).json({ error: 'Failed to fetch civic reports.' });
  }
});

/**
 * 6. GET ALL CIVIC REPORTS (FOR INSPECTOR & ADMIN)
 * GET /api/civic-reports/all
 */
router.get('/all', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let reports: any[] = [];
    try {
      reports = await prisma.civicReport.findMany({
        include: { authority: true, citizen: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      // Fallback
    }

    if (reports.length === 0) {
      reports = inMemoryCivicReports;
    }

    res.json({ success: true, reports });
  } catch (error: any) {
    console.error('[CivicReports API] Fetch all reports error:', error);
    res.status(500).json({ error: 'Failed to fetch civic reports.' });
  }
});

/**
 * 7. GET SINGLE CIVIC REPORT BY ID
 * GET /api/civic-reports/:id
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let report: any = null;
    try {
      report = await prisma.civicReport.findUnique({
        where: { id },
        include: { authority: true, citizen: { select: { id: true, name: true, email: true } } },
      });
    } catch (err) {
      // Fallback
    }

    if (!report) {
      report = inMemoryCivicReports.find(r => r.id === id || r.reportCode === id);
    }

    if (!report) {
      return res.status(404).json({ error: 'Civic report not found.' });
    }

    // Security check: Citizen can only view their own report, unless Inspector/Admin
    if (userRole === 'CITIZEN' && report.citizenId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this report.' });
    }

    res.json({ success: true, report });
  } catch (error: any) {
    console.error('[CivicReports API] Fetch report by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch civic report.' });
  }
});

/**
 * 8. UPDATE / REVISE CIVIC REPORT
 * PATCH /api/civic-reports/:id
 */
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { category, locationText, description, issueType, authorityId, status, complaintText } = req.body;

    let report: any = null;
    try {
      report = await prisma.civicReport.findUnique({ where: { id } });
    } catch (err) {
      // Fallback
    }
    if (!report) {
      report = inMemoryCivicReports.find(r => r.id === id || r.reportCode === id);
    }

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Citizen can update details before final submission
    if (req.user?.role === 'CITIZEN' && report.citizenId !== userId) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const updatedData: any = {};
    if (category) updatedData.category = category;
    if (locationText !== undefined) updatedData.locationText = locationText;
    if (description !== undefined) updatedData.description = description;
    if (issueType) updatedData.issueType = issueType;
    if (authorityId) updatedData.authorityId = authorityId;
    if (status) updatedData.status = status;

    if (category || locationText || authorityId) {
      const directory = await getAuthorityDirectoryList();
      const newCategory = category || report.category;
      const newLoc = locationText !== undefined ? locationText : report.locationText;
      const newAuth = directory.find(a => a.id === (authorityId || report.authorityId)) || routeAuthority({ category: newCategory, locationText: newLoc, customDirectory: directory }).authority;
      
      updatedData.authorityId = newAuth.id;
      updatedData.complaintText = complaintText || generateFormalComplaint({
        reportCode: report.reportCode,
        category: newCategory,
        issueType: updatedData.issueType || report.issueType || 'CIVIC_ISSUE',
        locationText: newLoc || '',
        latitude: report.latitude,
        longitude: report.longitude,
        description: updatedData.description !== undefined ? updatedData.description : report.description,
        authority: newAuth,
        evidenceHash: report.evidenceHash,
        createdAt: report.createdAt || new Date(),
      });
    }

    let updatedReport: any;
    try {
      updatedReport = await prisma.civicReport.update({
        where: { id },
        data: updatedData,
        include: { authority: true },
      });
    } catch (dbErr) {
      Object.assign(report, updatedData, { updatedAt: new Date() });
      updatedReport = report;
    }

    await createChainedAuditLog({
      userId: userId || 'system',
      action: 'CIVIC_REPORT_CATEGORY_CHANGED',
      entityType: 'CivicReport',
      entityId: id,
      details: JSON.stringify(updatedData)
    });

    res.json({ success: true, report: updatedReport });
  } catch (error: any) {
    console.error('[CivicReports API] Update error:', error);
    res.status(500).json({ error: 'Failed to update civic report.' });
  }
});

/**
 * 9. SEED JUDGE DEMO CASES
 * GET /api/civic-reports/seed-demo-cases
 */
router.get('/seed-demo-cases', async (_req, res: Response) => {
  try {
    const { seedJudgeDemoCases } = await import('../services/civic/seedDemoCases');
    await seedJudgeDemoCases();
    res.json({ success: true, message: 'Judge demo cases seeded successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to seed demo cases', details: err?.message });
  }
});

/**
 * 10. MANUAL PRIORITY OVERRIDE (INSPECTOR / ADMIN ONLY)
 * POST /api/civic-reports/:id/priority-override
 */
router.post('/:id/priority-override', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newLevel, newScore, reason } = req.body;
    const userId = req.user?.id || 'inspector-admin';

    if (!newLevel || newScore === undefined || !reason) {
      return res.status(400).json({ error: 'newLevel, newScore, and reason for override are required.' });
    }

    const { overrideReportPriority } = await import('../services/civic/priorityEngine');
    const success = await overrideReportPriority({
      reportId: id,
      newLevel,
      newScore: parseFloat(newScore),
      reason,
      overrideByUserId: userId,
    });

    if (!success) return res.status(404).json({ error: 'Report not found.' });

    const updatedReport = await prisma.civicReport.findUnique({ where: { id }, include: { authority: true } });
    res.json({ success: true, report: updatedReport, message: 'Priority score overridden successfully.' });
  } catch (err: any) {
    console.error('[CivicReports API] Priority override error:', err);
    res.status(500).json({ error: 'Failed to override priority.' });
  }
});

/**
 * 11. RECORD AUTHORITY ACTION STARTED
 * POST /api/civic-reports/:id/action-start
 */
router.post('/:id/action-start', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { actionType, actionDescription, assignedInspector, expectedCompletionDate } = req.body;
    const userId = req.user?.id || 'authority-user';

    if (!actionType || !actionDescription) {
      return res.status(400).json({ error: 'actionType and actionDescription are required.' });
    }

    const { recordAuthorityAction } = await import('../services/civic/resolutionService');
    const report = await recordAuthorityAction({
      reportId: id,
      actionType,
      actionDescription,
      assignedInspector,
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : undefined,
      isDemoAction: true,
      userId,
    });

    res.json({ success: true, report, message: 'Authority action recorded successfully.' });
  } catch (err: any) {
    console.error('[CivicReports API] Action start error:', err);
    res.status(500).json({ error: 'Failed to record authority action.' });
  }
});

/**
 * 12. UPLOAD AFTER EVIDENCE
 * POST /api/civic-reports/:id/after-evidence
 */
router.post('/:id/after-evidence', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), uploadMiddleware, validateUploadsMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'inspector-user';

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const voiceFile = files?.['voice']?.[0];

    const { afterActionNote, latitude, longitude, locationText } = req.body;

    const photoUrl = photoFile ? `/uploads/${photoFile.filename}` : req.body.afterPhotoUrl;
    if (!photoUrl) {
      return res.status(400).json({ error: 'AFTER evidence photo is required.' });
    }

    const { submitAfterEvidence } = await import('../services/civic/resolutionService');
    const report = await submitAfterEvidence({
      reportId: id,
      afterPhotoUrl: photoUrl,
      afterPhotoPath: photoFile?.path,
      afterVoiceUrl: voiceFile ? `/uploads/${voiceFile.filename}` : undefined,
      afterActionNote,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      locationText,
      userId,
    });

    res.json({ success: true, report, message: 'AFTER evidence uploaded and analyzed successfully.' });
  } catch (err: any) {
    console.error('[CivicReports API] After evidence error:', err);
    res.status(500).json({ error: 'Failed to submit after evidence.' });
  }
});

/**
 * 13. HUMAN RE-VERIFICATION DECISION (INSPECTOR / ADMIN)
 * POST /api/civic-reports/:id/human-verify
 */
router.post('/:id/human-verify', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { verdict, inspectorNote } = req.body;
    const userId = req.user?.id || 'inspector-user';

    if (!verdict || !inspectorNote) {
      return res.status(400).json({ error: 'verdict and inspectorNote are required.' });
    }

    const { recordHumanReverification } = await import('../services/civic/resolutionService');
    const report = await recordHumanReverification({
      reportId: id,
      verdict,
      inspectorNote,
      inspectorUserId: userId,
    });

    res.json({ success: true, report, message: `Inspector verdict '${verdict}' recorded.` });
  } catch (err: any) {
    console.error('[CivicReports API] Human verify error:', err);
    res.status(500).json({ error: 'Failed to record human verification.' });
  }
});

/**
 * 14. CITIZEN RE-VERIFICATION FEEDBACK
 * POST /api/civic-reports/:id/citizen-verify
 */
router.post('/:id/citizen-verify', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const userId = req.user?.id || 'citizen-user';

    if (!status) {
      return res.status(400).json({ error: 'status is required.' });
    }

    const { recordCitizenReverification } = await import('../services/civic/resolutionService');
    const report = await recordCitizenReverification({
      reportId: id,
      status,
      comment,
      citizenUserId: userId,
    });

    res.json({ success: true, report, message: 'Citizen re-verification feedback recorded.' });
  } catch (err: any) {
    console.error('[CivicReports API] Citizen verify error:', err);
    res.status(500).json({ error: 'Failed to record citizen verification.' });
  }
});

/**
 * 15. ACTION PRIORITY QUEUE (AUTHORITY)
 * GET /api/civic-reports/authority/priority-queue
 */
router.get('/authority/priority-queue', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { level, category } = req.query;

    const where: any = {};
    if (level) where.priorityLevel = level as string;
    if (category) where.category = category as string;

    let reports = await prisma.civicReport.findMany({
      where,
      include: { authority: true, citizen: { select: { name: true, email: true } } },
      orderBy: { priorityScore: 'desc' },
    });

    if (reports.length === 0) {
      const { seedJudgeDemoCases } = await import('../services/civic/seedDemoCases');
      await seedJudgeDemoCases();
      reports = await prisma.civicReport.findMany({
        where,
        include: { authority: true, citizen: { select: { name: true, email: true } } },
        orderBy: { priorityScore: 'desc' },
      });
    }

    res.json({ success: true, count: reports.length, queue: reports });
  } catch (err: any) {
    console.error('[CivicReports API] Priority queue error:', err);
    res.status(500).json({ error: 'Failed to fetch priority queue.' });
  }
});

/**
 * 16. RESOLUTION VERIFICATION QUEUE (AUTHORITY)
 * GET /api/civic-reports/authority/resolution-queue
 */
router.get('/authority/resolution-queue', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let reports = await prisma.civicReport.findMany({
      where: {
        status: {
          in: [
            CivicReportStatus.AWAITING_AFTER_EVIDENCE,
            CivicReportStatus.AWAITING_REVERIFICATION,
            CivicReportStatus.REOPENED,
            CivicReportStatus.RESOLVED,
          ],
        },
      },
      include: { authority: true, citizen: { select: { name: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    if (reports.length === 0) {
      const { seedJudgeDemoCases } = await import('../services/civic/seedDemoCases');
      await seedJudgeDemoCases();
      reports = await prisma.civicReport.findMany({
        where: {
          status: {
            in: [
              CivicReportStatus.AWAITING_AFTER_EVIDENCE,
              CivicReportStatus.AWAITING_REVERIFICATION,
              CivicReportStatus.REOPENED,
              CivicReportStatus.RESOLVED,
            ],
          },
        },
        include: { authority: true, citizen: { select: { name: true, email: true } } },
        orderBy: { updatedAt: 'desc' },
      });
    }

    res.json({ success: true, count: reports.length, queue: reports });
  } catch (err: any) {
    console.error('[CivicReports API] Resolution queue error:', err);
    res.status(500).json({ error: 'Failed to fetch resolution queue.' });
  }
});

/**
 * 17. RESOURCE INTELLIGENCE METRICS (AUTHORITY)
 * GET /api/civic-reports/authority/metrics
 */
router.get('/authority/metrics', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let reports = await prisma.civicReport.findMany();
    if (reports.length === 0) {
      const { seedJudgeDemoCases } = await import('../services/civic/seedDemoCases');
      await seedJudgeDemoCases();
      reports = await prisma.civicReport.findMany();
    }

    const openCases = reports.filter(r => r.status !== 'RESOLVED' && r.status !== 'CLOSED').length;
    const urgentHighCases = reports.filter(r => r.priorityLevel === 'URGENT_REVIEW' || r.priorityLevel === 'HIGH').length;
    const actionsInProgress = reports.filter(r => r.status === 'ACTION_IN_PROGRESS').length;
    const awaitingReverification = reports.filter(r => r.status === 'AWAITING_REVERIFICATION').length;
    const resolvedCases = reports.filter(r => r.status === 'RESOLVED').length;
    const reopenedCases = reports.filter(r => r.status === 'REOPENED').length;

    res.json({
      success: true,
      metrics: {
        openCases,
        urgentHighCases,
        actionsInProgress,
        awaitingReverification,
        resolvedCases,
        reopenedCases,
        avgTimeToResponseHours: 4.5,
        avgTimeToResolutionDays: 2.5,
        isDemoData: true,
      },
    });
  } catch (err: any) {
    console.error('[CivicReports API] Metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch resource metrics.' });
  }
});

export default router;

