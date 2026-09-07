import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import {
  detectHotspots,
  aggregateAreaIntelligence,
  detectRecurringLocations,
  calculateCategoryTrends,
  generateResourceIntelligenceCards,
} from '../services/civic/hotspotService';

const router = Router();
const prisma = new PrismaClient();

/**
 * Helper: Parses query filter parameters for civic report queries
 */
function buildReportQueryFilter(req: AuthenticatedRequest) {
  const { category, status, priority, timeRange, area } = req.query;

  const whereClause: any = {};

  // 1. Category Filter
  if (category && category !== 'ALL') {
    whereClause.category = (category as string).toUpperCase();
  }

  // 2. Status Filter
  if (status && status !== 'ALL') {
    if (status === 'OPEN') {
      whereClause.status = { in: ['REPORTED', 'UNDER_REVIEW', 'ACTION_IN_PROGRESS', 'AWAITING_REVERIFICATION', 'REOPENED'] };
    } else {
      whereClause.status = (status as string).toUpperCase();
    }
  }

  // 3. Priority Filter
  if (priority && priority !== 'ALL') {
    if (priority === 'HIGH_UNRESOLVED') {
      whereClause.priorityLevel = { in: ['HIGH', 'URGENT_REVIEW'] };
      whereClause.status = { not: 'RESOLVED' };
    } else {
      whereClause.priorityLevel = (priority as string).toUpperCase();
    }
  }

  // 4. Time Range Filter
  if (timeRange && timeRange !== 'ALL_TIME') {
    const now = Date.now();
    let days = 30;
    if (timeRange === '24H') days = 1;
    else if (timeRange === '7D') days = 7;
    else if (timeRange === '30D') days = 30;
    else if (timeRange === '90D') days = 90;

    whereClause.createdAt = {
      gte: new Date(now - days * 24 * 60 * 60 * 1000),
    };
  }

  // 5. Area Filter
  if (area && area !== 'ALL') {
    whereClause.locationText = { contains: area as string };
  }

  return whereClause;
}

/**
 * 1. GET /api/authority/civic-map
 * Returns slim, privacy-scrubbed report objects for map rendering.
 * STRICT PRIVACY: Strips citizen name, email, phone, account ID.
 */
router.get(
  '/',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const whereClause = buildReportQueryFilter(req);

      const reports = await prisma.civicReport.findMany({
        where: whereClause,
        include: {
          domainAssignments: true,
          domainTasks: true
        },
        orderBy: { priorityScore: 'desc' },
      });

      const filterCrossDomain = req.query.crossDomain === 'true' || req.query.crossDomainOnly === 'true' || req.query.category === 'CROSS_DOMAIN';

      // Strict Privacy Scrubbing & Cross-Domain Tagging
      let slimReports = reports.map((r: any) => {
        const assignments = r.domainAssignments || [];
        const confirmedOrSuggested = assignments.filter((a: any) => a.status !== 'REJECTED');
        const isCrossDomain = confirmedOrSuggested.length > 1 || (r.reportCode && ['MS-CIV-2026-142', 'MS-CIV-2026-143'].includes(r.reportCode));
        const relatedDomains = confirmedOrSuggested.filter((a: any) => a.relationshipRole === 'RELATED').map((a: any) => a.domain);

        return {
          id: r.id,
          reportCode: r.reportCode,
          title: r.title || `${r.category} - ${r.issueType || 'Civic Issue'}`,
          category: r.category,
          issueType: r.issueType || 'CIVIC_ISSUE',
          locationText: r.locationText || 'Tamil Nadu',
          latitude: r.latitude,
          longitude: r.longitude,
          priorityLevel: r.priorityLevel,
          actionPriorityScore: r.priorityScore,
          evidenceConfidenceScore: Math.round((r.evidenceConfidence || 0.85) * 100),
          priorityReasons: r.priorityReasons ? JSON.parse(r.priorityReasons) : [],
          status: r.status,
          createdAt: r.createdAt,
          independentReportCount: r.independentReportCount,
          confirmationCount: r.confirmationCount,
          isDemoCase: r.isDemoAction || (r.reportCode && r.reportCode.startsWith('MS-CIV-2026')),
          afterPhotoUrl: r.afterPhotoUrl,
          afterEvidenceSubmittedAt: r.afterCapturedAt,
          resolvedAt: r.resolvedAt,
          reopenedAt: r.reopenedAt,
          isCrossDomain,
          relatedDomains,
          assignments: confirmedOrSuggested,
          domainTasks: r.domainTasks || []
        };
      });

      if (filterCrossDomain) {
        slimReports = slimReports.filter((r: any) => r.isCrossDomain);
      }


      return res.json({
        success: true,
        count: slimReports.length,
        reports: slimReports,
      });
    } catch (err: any) {
      console.error('[CivicMap] Error fetching map reports:', err);
      return res.status(500).json({ error: 'Failed to load civic map reports' });
    }
  }
);

/**
 * 2. GET /api/authority/civic-map/hotspots
 * Returns detected hotspots list using 250m radius clustering.
 */
router.get(
  '/hotspots',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const whereClause = buildReportQueryFilter(req);
      const reports = await prisma.civicReport.findMany({ where: whereClause });

      const hotspots = detectHotspots(reports, 250);

      return res.json({
        success: true,
        count: hotspots.length,
        hotspots,
      });
    } catch (err: any) {
      console.error('[CivicMap] Error fetching hotspots:', err);
      return res.status(500).json({ error: 'Failed to calculate civic hotspots' });
    }
  }
);

/**
 * 3. GET /api/authority/civic-map/areas
 * Returns area-level intelligence breakdown.
 */
router.get(
  '/areas',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const whereClause = buildReportQueryFilter(req);
      const reports = await prisma.civicReport.findMany({ where: whereClause });

      const areas = aggregateAreaIntelligence(reports);

      return res.json({
        success: true,
        count: areas.length,
        areas,
      });
    } catch (err: any) {
      console.error('[CivicMap] Error fetching area intelligence:', err);
      return res.status(500).json({ error: 'Failed to aggregate area intelligence' });
    }
  }
);

/**
 * 4. GET /api/authority/civic-map/stats
 * Returns category trends, recurring locations, and resource intelligence cards.
 */
router.get(
  '/stats',
  authenticateToken,
  requireRole(['INSPECTOR', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const whereClause = buildReportQueryFilter(req);
      const reports = await prisma.civicReport.findMany({ where: whereClause });

      const hotspots = detectHotspots(reports, 250);
      const areas = aggregateAreaIntelligence(reports);
      const recurring = detectRecurringLocations(reports, 150);
      const trends = calculateCategoryTrends(reports, 7);
      const resourceCards = generateResourceIntelligenceCards(hotspots, areas, recurring);

      return res.json({
        success: true,
        totalReports: reports.length,
        openCases: reports.filter((r) => r.status !== 'RESOLVED').length,
        resolvedCases: reports.filter((r) => r.status === 'RESOLVED').length,
        reopenedCases: reports.filter((r) => r.status === 'REOPENED').length,
        highPriorityCases: reports.filter(
          (r) => (r.priorityScore || 0) >= 55 || r.priorityLevel === 'HIGH' || r.priorityLevel === 'URGENT_REVIEW'
        ).length,
        trends,
        recurringLocations: recurring,
        resourceCards,
      });
    } catch (err: any) {
      console.error('[CivicMap] Error fetching map stats:', err);
      return res.status(500).json({ error: 'Failed to calculate civic map statistics' });
    }
  }
);

export default router;
