import { Router, Request, Response } from 'express';
import { PrismaClient, RouteStatus, StopStatus, CivicReportStatus } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logSecurityEvent } from '../utils/securityLogger';
import {
  generateInspectionRoute,
  getEligibleInspectionReports,
  getRoutePlannerSummaryMetrics,
  RoutePlannerOptions,
} from '../services/civic/routePlannerService';
import { createChainedAuditLog } from '../utils/auditLogger';

const router = Router();
const prisma = new PrismaClient();

// Enforce auth on all route planner endpoints
router.use(authenticateToken);
router.use(requireRole(['INSPECTOR', 'ADMIN']));

/**
 * GET /api/authority/inspection-routes/eligible-cases
 * Fetch top summary stats and eligible cases for inspection.
 */
router.get('/eligible-cases', async (req: Request, res: Response) => {
  try {
    const metrics = await getRoutePlannerSummaryMetrics();
    const cases = await getEligibleInspectionReports({
      priorityFilter: (req.query.priority as string) || 'ALL',
      categoryFilter: (req.query.category as string) || 'ALL',
      areaFilter: (req.query.area as string) || 'ALL',
      ageFilter: (req.query.age as string) || 'ALL',
    });

    // Strip citizen PII for security
    const sanitizedCases = cases.map((c) => ({
      id: c.id,
      reportCode: c.reportCode,
      category: c.category,
      issueType: c.issueType,
      latitude: c.latitude,
      longitude: c.longitude,
      locationText: c.locationText,
      priorityScore: c.priorityScore,
      priorityLevel: c.priorityLevel,
      status: c.status,
      createdAt: c.createdAt,
    }));

    return res.json({
      metrics,
      cases: sanitizedCases,
    });
  } catch (error: any) {
    console.error('Error fetching eligible inspection cases:', error);
    return res.status(500).json({ error: 'Failed to retrieve eligible cases.' });
  }
});

/**
 * POST /api/authority/inspection-routes/generate
 * Generate a suggested inspection route proposal without saving.
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const options: RoutePlannerOptions = {
      startLat: req.body.startLat ? Number(req.body.startLat) : 10.827,
      startLong: req.body.startLong ? Number(req.body.startLong) : 78.692,
      startLocationName: req.body.startLocationName || 'Authority Office',
      maxCases: req.body.maxCases ? Number(req.body.maxCases) : 8,
      maxRadiusKm: req.body.maxRadiusKm ? Number(req.body.maxRadiusKm) : 5,
      priorityPreference: req.body.priorityPreference,
      selectedReportIds: req.body.selectedReportIds,
      priorityFilter: req.body.priorityFilter,
      categoryFilter: req.body.categoryFilter,
      areaFilter: req.body.areaFilter,
      ageFilter: req.body.ageFilter,
    };

    const routeProposal = await generateInspectionRoute(options);
    return res.json({ routeProposal });
  } catch (error: any) {
    console.error('Error generating inspection route:', error);
    return res.status(500).json({ error: 'Failed to generate inspection route.' });
  }
});

/**
 * POST /api/authority/inspection-routes/save
 * Persist a generated inspection route as a new InspectionRoute record.
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, startLocationName, startLat, startLong, stops, routeExplanation, approxTotalDistanceKm, inspectorId } = req.body;

    if (!stops || !Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({ error: 'Cannot save a route with no stops.' });
    }

    const count = await prisma.inspectionRoute.count();
    const routeCode = `IR-2026-${String(count + 1).padStart(5, '0')}`;

    const newRoute = await prisma.inspectionRoute.create({
      data: {
        routeCode,
        name: name || `Inspection Route ${routeCode}`,
        createdBy: user.userId,
        inspectorId: inspectorId || (user.role === 'INSPECTOR' ? user.userId : null),
        startLocationName: startLocationName || 'Authority Office',
        startLat: Number(startLat) || 10.827,
        startLong: Number(startLong) || 78.692,
        status: inspectorId ? RouteStatus.ASSIGNED : RouteStatus.DRAFT,
        assignedAt: inspectorId ? new Date() : null,
        totalCases: stops.length,
        approxTotalDistanceKm: Number(approxTotalDistanceKm) || 0.0,
        routeExplanation,
        stops: {
          create: stops.map((s: any, idx: number) => ({
            reportId: s.reportId,
            sequence: idx + 1,
            approxDistanceFromPreviousKm: Number(s.approxDistanceFromPreviousKm) || 0.0,
            status: StopStatus.PENDING,
          })),
        },
      },
      include: {
        stops: {
          include: {
            report: true,
          },
        },
        inspector: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await createChainedAuditLog({
      userId: user.userId,
      action: 'INSPECTION_ROUTE_GENERATED',
      entityType: 'InspectionRoute',
      entityId: newRoute.id,
      details: `Generated route ${routeCode} with ${stops.length} cases`,
    });

    return res.status(201).json({ route: newRoute });
  } catch (error: any) {
    console.error('Error saving inspection route:', error);
    return res.status(500).json({ error: 'Failed to save inspection route.' });
  }
});

/**
 * GET /api/authority/inspection-routes
 * List all inspection routes.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const routes = await prisma.inspectionRoute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inspector: {
          select: { id: true, name: true, email: true },
        },
        stops: {
          include: {
            report: true,
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return res.json({ routes });
  } catch (error: any) {
    console.error('Error listing inspection routes:', error);
    return res.status(500).json({ error: 'Failed to retrieve inspection routes.' });
  }
});

/**
 * GET /api/authority/inspection-routes/my-routes
 * Fetch assigned routes for currently logged-in inspector.
 */
router.get('/my-routes', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const routes = await prisma.inspectionRoute.findMany({
      where: {
        inspectorId: user.userId,
        status: { in: [RouteStatus.ASSIGNED, RouteStatus.IN_PROGRESS] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        stops: {
          include: {
            report: true,
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return res.json({ routes });
  } catch (error: any) {
    console.error('Error fetching inspector assigned routes:', error);
    return res.status(500).json({ error: 'Failed to retrieve assigned routes.' });
  }
});

/**
 * GET /api/authority/inspection-routes/history
 * Fetch completed or cancelled historical inspection routes.
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const where: any = {
      status: { in: [RouteStatus.COMPLETED, RouteStatus.CANCELLED] },
    };

    if (user.role === 'INSPECTOR') {
      where.inspectorId = user.userId;
    }

    const routes = await prisma.inspectionRoute.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      include: {
        inspector: { select: { id: true, name: true, email: true } },
        stops: {
          include: { report: true },
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return res.json({ routes });
  } catch (error: any) {
    console.error('Error fetching route history:', error);
    return res.status(500).json({ error: 'Failed to retrieve route history.' });
  }
});

/**
 * GET /api/authority/inspection-routes/:id
 * Fetch single route details with IDOR protection.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const route = await prisma.inspectionRoute.findUnique({
      where: { id: req.params.id },
      include: {
        inspector: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        stops: {
          include: {
            report: {
              include: {
                domainAssignments: true,
                domainTasks: true
              }
            }
          },
          orderBy: { sequence: 'asc' },
        },

      },
    });

    if (!route) {
      return res.status(404).json({ error: 'Inspection route not found.' });
    }

    // Object-level authorization check: INSPECTOR can only access assigned routes
    if (user.role === 'INSPECTOR' && route.inspectorId !== user.userId) {
      logSecurityEvent({
        type: 'ACCESS_DENIED',
        severity: 'HIGH',
        userId: user.userId,
        endpoint: `/api/authority/inspection-routes/${req.params.id}`,
        description: `Inspector ${user.userId} attempted to access route assigned to ${route.inspectorId}`,
      });
      return res.status(403).json({ error: 'Forbidden: You are not assigned to this inspection route.' });
    }

    return res.json({ route });
  } catch (error: any) {
    console.error('Error fetching route details:', error);
    return res.status(500).json({ error: 'Failed to retrieve route details.' });
  }
});

/**
 * PATCH /api/authority/inspection-routes/:id/assign
 * Assign an inspection route to a specific inspector (Admin role required).
 */
router.patch('/:id/assign', requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { inspectorId } = req.body;

    if (!inspectorId) {
      return res.status(400).json({ error: 'Inspector ID is required for route assignment.' });
    }

    const inspector = await prisma.user.findUnique({
      where: { id: inspectorId },
    });

    if (!inspector) {
      return res.status(404).json({ error: 'Inspector user not found.' });
    }

    const updated = await prisma.inspectionRoute.update({
      where: { id: req.params.id },
      data: {
        inspectorId,
        status: RouteStatus.ASSIGNED,
        assignedAt: new Date(),
      },
      include: {
        inspector: { select: { id: true, name: true, email: true } },
        stops: { include: { report: true } },
      },
    });

    await createChainedAuditLog({
      userId: user.userId,
      action: 'INSPECTION_ROUTE_ASSIGNED',
      entityType: 'InspectionRoute',
      entityId: updated.id,
      details: `Assigned route ${updated.routeCode} to inspector ${inspector.name} (${inspectorId})`,
    });

    return res.json({ route: updated });
  } catch (error: any) {
    console.error('Error assigning route:', error);
    return res.status(500).json({ error: 'Failed to assign route.' });
  }
});

/**
 * PATCH /api/authority/inspection-routes/:id/start
 * Inspector starts their assigned field inspection route.
 */
router.patch('/:id/start', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const route = await prisma.inspectionRoute.findUnique({
      where: { id: req.params.id },
    });

    if (!route) {
      return res.status(404).json({ error: 'Inspection route not found.' });
    }

    // IDOR Check
    if (user.role === 'INSPECTOR' && route.inspectorId !== user.userId) {
      return res.status(403).json({ error: 'Forbidden: You cannot start a route assigned to another inspector.' });
    }

    const updated = await prisma.inspectionRoute.update({
      where: { id: req.params.id },
      data: {
        status: RouteStatus.IN_PROGRESS,
        startedAt: route.startedAt || new Date(),
      },
      include: {
        stops: { include: { report: true }, orderBy: { sequence: 'asc' } },
      },
    });

    await createChainedAuditLog({
      userId: user.userId,
      action: 'INSPECTION_ROUTE_STARTED',
      entityType: 'InspectionRoute',
      entityId: updated.id,
      details: `Started inspection route ${updated.routeCode}`,
    });

    return res.json({ route: updated });
  } catch (error: any) {
    console.error('Error starting inspection route:', error);
    return res.status(500).json({ error: 'Failed to start inspection route.' });
  }
});

/**
 * POST /api/authority/inspection-routes/:id/stops/:stopId/action
 * Submit human inspection audit verdict & notes for a stop.
 */
router.post('/:id/stops/:stopId/action', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id: routeId, stopId } = req.params;
    const { verdict, note, afterPhotoUrl, afterActionNote } = req.body;

    if (!verdict) {
      return res.status(400).json({ error: 'Inspection verdict is required.' });
    }

    const stop = await prisma.inspectionRouteStop.findUnique({
      where: { id: stopId },
      include: { route: true, report: true },
    });

    if (!stop || stop.routeId !== routeId) {
      return res.status(404).json({ error: 'Route stop not found.' });
    }

    // IDOR Check
    if (user.role === 'INSPECTOR' && stop.route.inspectorId !== user.userId) {
      return res.status(403).json({ error: 'Forbidden: You cannot complete stops on a route assigned to another inspector.' });
    }

    // Update stop record
    const updatedStop = await prisma.inspectionRouteStop.update({
      where: { id: stopId },
      data: {
        status: StopStatus.COMPLETED,
        completedAt: new Date(),
        verificationVerdict: verdict,
        verificationNote: note,
      },
    });

    // Update report verification status if applicable
    if (afterPhotoUrl) {
      await prisma.civicReport.update({
        where: { id: stop.reportId },
        data: {
          afterPhotoUrl,
          afterActionNote,
          afterUploadedBy: user.userId,
          afterCapturedAt: new Date(),
          humanReverificationStatus: 'RESOLUTION_CONFIRMED',
          humanReverifiedBy: user.userId,
          humanReverifiedAt: new Date(),
          status: CivicReportStatus.AWAITING_REVERIFICATION,
        },
      });
    }

    // Recalculate route progress
    const allStops = await prisma.inspectionRouteStop.findMany({
      where: { routeId },
    });

    const completedCases = allStops.filter((s) => s.status === StopStatus.COMPLETED).length;
    const skippedCases = allStops.filter((s) => s.status === StopStatus.SKIPPED).length;
    const isAllDone = completedCases + skippedCases === allStops.length;

    const updatedRoute = await prisma.inspectionRoute.update({
      where: { id: routeId },
      data: {
        completedCases,
        skippedCases,
        status: isAllDone ? RouteStatus.COMPLETED : RouteStatus.IN_PROGRESS,
        completedAt: isAllDone ? new Date() : null,
      },
      include: {
        stops: { include: { report: true }, orderBy: { sequence: 'asc' } },
      },
    });

    await createChainedAuditLog({
      userId: user.userId,
      action: 'INSPECTION_STOP_COMPLETED',
      entityType: 'InspectionRouteStop',
      entityId: stopId,
      details: `Completed stop ${stop.sequence} on route ${stop.route.routeCode} with verdict ${verdict}`,
    });

    if (isAllDone) {
      await createChainedAuditLog({
        userId: user.userId,
        action: 'INSPECTION_ROUTE_COMPLETED',
        entityType: 'InspectionRoute',
        entityId: routeId,
        details: `Inspection route ${stop.route.routeCode} completed (${completedCases} done, ${skippedCases} skipped)`,
      });
    }

    return res.json({
      stop: updatedStop,
      route: updatedRoute,
    });
  } catch (error: any) {
    console.error('Error submitting stop action:', error);
    return res.status(500).json({ error: 'Failed to record stop action.' });
  }
});

/**
 * POST /api/authority/inspection-routes/:id/stops/:stopId/skip
 * Skip a stop with mandatory reason.
 */
router.post('/:id/stops/:stopId/skip', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id: routeId, stopId } = req.params;
    const { skipReason, skipNotes } = req.body;

    if (!skipReason) {
      return res.status(400).json({ error: 'Mandatory skip reason is required (e.g. ACCESS_ISSUE, INSUFFICIENT_TIME).' });
    }

    const stop = await prisma.inspectionRouteStop.findUnique({
      where: { id: stopId },
      include: { route: true },
    });

    if (!stop || stop.routeId !== routeId) {
      return res.status(404).json({ error: 'Route stop not found.' });
    }

    // IDOR Check
    if (user.role === 'INSPECTOR' && stop.route.inspectorId !== user.userId) {
      return res.status(403).json({ error: 'Forbidden: You cannot skip stops on a route assigned to another inspector.' });
    }

    const updatedStop = await prisma.inspectionRouteStop.update({
      where: { id: stopId },
      data: {
        status: StopStatus.SKIPPED,
        skipReason,
        skipNotes,
      },
    });

    // Recalculate route progress
    const allStops = await prisma.inspectionRouteStop.findMany({
      where: { routeId },
    });

    const completedCases = allStops.filter((s) => s.status === StopStatus.COMPLETED).length;
    const skippedCases = allStops.filter((s) => s.status === StopStatus.SKIPPED).length;
    const isAllDone = completedCases + skippedCases === allStops.length;

    const updatedRoute = await prisma.inspectionRoute.update({
      where: { id: routeId },
      data: {
        completedCases,
        skippedCases,
        status: isAllDone ? RouteStatus.COMPLETED : RouteStatus.IN_PROGRESS,
        completedAt: isAllDone ? new Date() : null,
      },
      include: {
        stops: { include: { report: true }, orderBy: { sequence: 'asc' } },
      },
    });

    await createChainedAuditLog({
      userId: user.userId,
      action: 'INSPECTION_STOP_SKIPPED',
      entityType: 'InspectionRouteStop',
      entityId: stopId,
      details: `Skipped stop ${stop.sequence} on route ${stop.route.routeCode}. Reason: ${skipReason}`,
    });

    return res.json({
      stop: updatedStop,
      route: updatedRoute,
    });
  } catch (error: any) {
    console.error('Error skipping stop:', error);
    return res.status(500).json({ error: 'Failed to skip stop.' });
  }
});

/**
 * POST /api/authority/inspection-routes/:id/recalculate
 * Recalculate route sequence for remaining pending stops when priorities update.
 */
router.post('/:id/recalculate', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const route = await prisma.inspectionRoute.findUnique({
      where: { id },
      include: {
        stops: { include: { report: true }, orderBy: { sequence: 'asc' } },
      },
    });

    if (!route) {
      return res.status(404).json({ error: 'Inspection route not found.' });
    }

    const pendingStops = route.stops.filter((s) => s.status === StopStatus.PENDING);
    if (pendingStops.length === 0) {
      return res.status(400).json({ error: 'No pending stops left to recalculate.' });
    }

    // Re-generate route from current location or route start point
    const options: RoutePlannerOptions = {
      startLat: req.body.currentLat ? Number(req.body.currentLat) : route.startLat,
      startLong: req.body.currentLong ? Number(req.body.currentLong) : route.startLong,
      selectedReportIds: pendingStops.map((s) => s.reportId),
    };

    const recomputed = await generateInspectionRoute(options);

    // Update stop sequences for pending stops
    for (let i = 0; i < recomputed.stops.length; i++) {
      const rec = recomputed.stops[i];
      const existingStop = pendingStops.find((s) => s.reportId === rec.reportId);
      if (existingStop) {
        await prisma.inspectionRouteStop.update({
          where: { id: existingStop.id },
          data: {
            sequence: route.completedCases + route.skippedCases + i + 1,
            approxDistanceFromPreviousKm: rec.approxDistanceFromPreviousKm,
          },
        });
      }
    }

    const updatedRoute = await prisma.inspectionRoute.findUnique({
      where: { id },
      include: {
        stops: { include: { report: true }, orderBy: { sequence: 'asc' } },
      },
    });

    await createChainedAuditLog({
      userId: user.userId,
      action: 'INSPECTION_ROUTE_RECALCULATED',
      entityType: 'InspectionRoute',
      entityId: id,
      details: `Recalculated route sequence for ${pendingStops.length} pending stops on route ${route.routeCode}`,
    });

    return res.json({ route: updatedRoute });
  } catch (error: any) {
    console.error('Error recalculating route:', error);
    return res.status(500).json({ error: 'Failed to recalculate route.' });
  }
});

export default router;
