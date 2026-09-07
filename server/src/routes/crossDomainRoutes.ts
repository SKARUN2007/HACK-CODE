import { Router, Response } from 'express';
import { PrismaClient, CivicCategory, DomainAssignmentRole, DomainAssignmentStatus, DomainTaskStatus } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { createChainedAuditLog } from '../utils/auditLogger';
import { logSecurityEvent } from '../utils/securityLogger';
import { CrossDomainDetectionService, inMemoryDomainAssignments, inMemoryDomainTasks, InMemDomainAssignment, InMemDomainTask, formatCategoryName } from '../services/civic/crossDomainDetectionService';
import { inMemoryCivicReports, getAuthorityDirectoryList } from './civicReports';

const router = Router();
const prisma = new PrismaClient();

/**
 * 1. DETECT CANDIDATE RELATED DOMAINS
 * POST /api/cross-domain/detect
 */
router.post('/detect', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { primaryDomain, description, locationText } = req.body;
    if (!primaryDomain) {
      return res.status(400).json({ error: 'primaryDomain is required.' });
    }

    const authorities = await getAuthorityDirectoryList();
    const result = await CrossDomainDetectionService.detectRelatedDomains({
      primaryDomain: primaryDomain as CivicCategory,
      description,
      locationText,
      customAuthorities: authorities
    });

    res.json({
      success: true,
      detection: result
    });
  } catch (error: any) {
    console.error('[CrossDomain API] Detection error:', error);
    res.status(500).json({ error: 'Failed to detect cross-domain relationships.', details: error?.message });
  }
});

/**
 * 2. GET DOMAIN ASSIGNMENTS & TASK GRAPH FOR REPORT
 * GET /api/cross-domain/reports/:reportId
 */
router.get('/reports/:reportId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportId } = req.params;

    // Check DB first
    let dbReport: any = null;
    try {
      dbReport = await prisma.civicReport.findUnique({
        where: { id: reportId },
        include: {
          domainAssignments: true,
          domainTasks: true,
          authority: true,
        }
      });
    } catch (err) {
      // Fallback
    }

    let report = dbReport;
    let assignments: any[] = [];
    let tasks: any[] = [];

    if (report) {
      assignments = report.domainAssignments || [];
      tasks = report.domainTasks || [];
    } else {
      // Check in-memory reports
      const inMemRep = inMemoryCivicReports.find(r => r.id === reportId || r.reportCode === reportId);
      report = inMemRep;
      assignments = inMemoryDomainAssignments.filter(a => a.reportId === reportId || (report && a.reportId === report.id));
      tasks = inMemoryDomainTasks.filter(t => t.reportId === reportId || (report && t.reportId === report.id));
    }

    if (!report && assignments.length === 0) {
      return res.status(404).json({ error: 'Report or domain assignments not found.' });
    }

    const authorities = await getAuthorityDirectoryList();
    const mappedAssignments = assignments.map((a: any) => {
      const auth = authorities.find((directory: any) => directory.id === a.authorityId);
      return {
        ...a,
        authorityName: auth?.name || 'DEMO Municipal Unit',
        domainLabel: formatCategoryName(a.domain)
      };
    });

    const isMultiDomain = mappedAssignments.filter((a: any) => a.status !== 'REJECTED').length > 1;

    res.json({
      success: true,
      reportId,
      isMultiDomain,
      assignments: mappedAssignments,
      tasks,
      overallStatus: report?.status || 'UNDER_REVIEW'
    });
  } catch (error: any) {
    console.error('[CrossDomain API] Fetch assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch cross-domain details.', details: error?.message });
  }
});

/**
 * 3. CITIZEN CONFIRM / MODIFY SUGGESTED DOMAINS
 * POST /api/cross-domain/reports/:reportId/citizen-confirm
 */
router.post('/reports/:reportId/citizen-confirm', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { confirmed, selectedRelatedDomains } = req.body;
    const userId = req.user?.id;

    // RBAC: Verify report ownership to prevent IDOR
    let report: any = null;
    try {
      report = await prisma.civicReport.findUnique({ where: { id: reportId } });
    } catch (err) {
      report = inMemoryCivicReports.find(r => r.id === reportId);
    }

    if (report && report.citizenId !== userId && req.user?.role === 'CITIZEN') {
      logSecurityEvent({
        type: 'ACCESS_DENIED',
        severity: 'HIGH',
        userId: userId || 'anonymous',
        endpoint: `/api/cross-domain/reports/${reportId}/citizen-confirm`,
        description: 'Citizen attempted to confirm domains for another citizen report.'
      });
      return res.status(403).json({ error: 'Access denied. You can only confirm domain suggestions for your own reports.' });
    }


    // Update assignment statuses
    let dbAssignments: any[] = [];
    try {
      dbAssignments = await prisma.caseDomainAssignment.findMany({ where: { reportId } });
      for (const asgn of dbAssignments) {
        let newStatus: DomainAssignmentStatus = confirmed ? 'CONFIRMED' : 'SUGGESTED';
        if (asgn.relationshipRole === 'RELATED' && Array.isArray(selectedRelatedDomains)) {
          newStatus = selectedRelatedDomains.includes(asgn.domain) ? 'CONFIRMED' : 'REJECTED';
        }
        await prisma.caseDomainAssignment.update({
          where: { id: asgn.id },
          data: { status: newStatus, confirmedAt: confirmed ? new Date() : null }
        });
      }
    } catch (err) {
      // In-memory update
      for (const asgn of inMemoryDomainAssignments.filter(a => a.reportId === reportId)) {
        if (asgn.relationshipRole === 'RELATED' && Array.isArray(selectedRelatedDomains)) {
          asgn.status = selectedRelatedDomains.includes(asgn.domain) ? 'CONFIRMED' : 'REJECTED';
        } else {
          asgn.status = confirmed ? 'CONFIRMED' : 'SUGGESTED';
        }
        if (confirmed) asgn.confirmedAt = new Date();
      }
    }

    await createChainedAuditLog({
      userId,
      action: 'CROSS_DOMAIN_CITIZEN_CONFIRMED',
      entityType: 'CivicReport',
      entityId: reportId,
      details: JSON.stringify({ confirmed, selectedRelatedDomains })
    });

    res.json({ success: true, message: 'Citizen domain confirmation saved.' });
  } catch (error: any) {
    console.error('[CrossDomain API] Citizen confirm error:', error);
    res.status(500).json({ error: 'Failed to record citizen confirmation.', details: error?.message });
  }
});

/**
 * 4. AUTHORITY / INSPECTOR HUMAN CONFIRMATION (CONFIRM, REJECT, ADD)
 * POST /api/cross-domain/reports/:reportId/authority-action
 */
router.post('/reports/:reportId/authority-action', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action, domain, reason } = req.body;
    const userId = req.user?.id;

    if (!action || !domain || !reason || reason.trim().length < 5) {
      return res.status(400).json({ error: 'Action (CONFIRM|REJECT|ADD), domain, and a detailed reason (at least 5 characters) are required.' });
    }

    const authorities = await getAuthorityDirectoryList();

    if (action === 'CONFIRM' || action === 'REJECT') {
      let updatedAssignment: any = null;
      try {
        const existing = await prisma.caseDomainAssignment.findFirst({
          where: { reportId, domain: domain as CivicCategory }
        });
        if (existing) {
          updatedAssignment = await prisma.caseDomainAssignment.update({
            where: { id: existing.id },
            data: {
              status: action === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED',
              confirmedBy: userId,
              confirmedAt: new Date(),
              rejectionReason: action === 'REJECT' ? reason : null,
              reason: action === 'CONFIRM' ? `${existing.reason} (Inspector note: ${reason})` : existing.reason
            }
          });
        }
      } catch (err) {
        // In-memory
        const existing = inMemoryDomainAssignments.find(a => a.reportId === reportId && a.domain === domain);
        if (existing) {
          existing.status = action === 'CONFIRM' ? 'CONFIRMED' : 'REJECTED';
          existing.confirmedBy = userId;
          existing.confirmedAt = new Date();
          existing.rejectionReason = action === 'REJECT' ? reason : undefined;
          updatedAssignment = existing;
        }
      }

      const auditAction = action === 'CONFIRM' ? 'RELATED_DOMAIN_CONFIRMED' : 'RELATED_DOMAIN_REJECTED';
      await createChainedAuditLog({
        userId,
        action: auditAction,
        entityType: 'CaseDomainAssignment',
        entityId: updatedAssignment?.id || reportId,
        details: JSON.stringify({ domain, action, reason, confirmedBy: userId })
      });

    } else if (action === 'ADD') {
      const mappedAuth = authorities.find((a: any) => a.supportedCategories && a.supportedCategories.includes(domain as CivicCategory));

      const newAsgnData = {
        reportId,
        domain: domain as CivicCategory,
        relationshipRole: 'RELATED' as DomainAssignmentRole,
        confidence: 1.0,
        reason: `Manually added by inspector: ${reason}`,
        status: 'CONFIRMED' as DomainAssignmentStatus,
        confirmedBy: userId,
        confirmedAt: new Date(),
        authorityId: mappedAuth?.id || null,
      };

      let newAsgnId = `asgn-${reportId}-manual-${domain}`;
      try {
        const dbAsgn = await prisma.caseDomainAssignment.create({ data: newAsgnData });
        newAsgnId = dbAsgn.id;
      } catch (err) {
        const inMemAsgn: InMemDomainAssignment = {
          id: newAsgnId,
          ...newAsgnData,
          authorityId: mappedAuth?.id || undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryDomainAssignments.push(inMemAsgn);
      }

      // Add corresponding task
      const taskData = {
        reportId,
        domainAssignmentId: newAsgnId,
        domain: domain as CivicCategory,
        title: `${formatCategoryName(domain as CivicCategory)} Inspection & Resolution`,
        action: `Inspect and address ${formatCategoryName(domain as CivicCategory)} requirements.`,
        status: 'PENDING' as DomainTaskStatus,
        sequence: 2,
        assignedAuthorityId: mappedAuth?.id || null,
      };

      try {
        await prisma.caseDomainTask.create({ data: taskData });
      } catch (err) {
        inMemoryDomainTasks.push({
          id: `task-${reportId}-manual-${domain}`,
          ...taskData,
          assignedAuthorityId: mappedAuth?.id || undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      await createChainedAuditLog({
        userId,
        action: 'RELATED_DOMAIN_MANUALLY_ADDED',
        entityType: 'CaseDomainAssignment',
        entityId: newAsgnId,
        details: JSON.stringify({ domain, reason, addedBy: userId })
      });
    }

    res.json({
      success: true,
      message: `Domain ${domain} successfully updated with action ${action}.`
    });
  } catch (error: any) {
    console.error('[CrossDomain API] Authority action error:', error);
    res.status(500).json({ error: 'Failed to record authority domain decision.', details: error?.message });
  }
});

/**
 * 5. UPDATE DOMAIN TASK STATUS (Enforcing dependencies & partial resolution)
 * PUT /api/cross-domain/tasks/:taskId/status
 */
router.put('/tasks/:taskId/status', authenticateToken, requireRole(['INSPECTOR', 'ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { status, notes, proofUrl } = req.body;
    const userId = req.user?.id;

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid task status.' });
    }

    let task: any = null;
    let reportId = '';

    try {
      task = await prisma.caseDomainTask.findUnique({ where: { id: taskId } });
      if (task) reportId = task.reportId;
    } catch (err) {
      task = inMemoryDomainTasks.find(t => t.id === taskId);
      if (task) reportId = task.reportId;
    }

    if (!task) {
      return res.status(404).json({ error: 'Domain task not found.' });
    }

    // Check dependency ordering if attempting to start/complete task
    if ((status === 'IN_PROGRESS' || status === 'COMPLETED') && task.dependsOnTaskId) {
      let depTask: any = null;
      try {
        depTask = await prisma.caseDomainTask.findUnique({ where: { id: task.dependsOnTaskId } });
      } catch (err) {
        depTask = inMemoryDomainTasks.find(t => t.id === task.dependsOnTaskId);
      }

      if (depTask && depTask.status !== 'COMPLETED' && depTask.status !== 'SKIPPED') {
        return res.status(400).json({
          error: `Task dependency lock: Previous task "${depTask.title}" (${depTask.domain}) must be completed before starting this task.`
        });
      }
    }

    // Update task
    let updatedTask: any = null;
    try {
      updatedTask = await prisma.caseDomainTask.update({
        where: { id: taskId },
        data: {
          status: status as DomainTaskStatus,
          notes: notes || task.notes,
          afterProofUrl: proofUrl || task.afterProofUrl,
          completedAt: status === 'COMPLETED' ? new Date() : null
        }
      });
    } catch (err) {
      task.status = status as DomainTaskStatus;
      if (notes) task.notes = notes;
      if (proofUrl) task.afterProofUrl = proofUrl;
      if (status === 'COMPLETED') task.completedAt = new Date();
      updatedTask = task;
    }

    await createChainedAuditLog({
      userId,
      action: 'DOMAIN_TASK_COMPLETED',
      entityType: 'CaseDomainTask',
      entityId: taskId,
      details: JSON.stringify({ status, domain: task.domain, completedBy: userId })
    });

    // Check overall case status progression (PARTIALLY ADDRESSED vs RESOLVED)
    let allReportTasks: any[] = [];
    let confirmedAssignments: any[] = [];
    try {
      allReportTasks = await prisma.caseDomainTask.findMany({ where: { reportId } });
      confirmedAssignments = await prisma.caseDomainAssignment.findMany({
        where: { reportId, status: 'CONFIRMED' }
      });
    } catch (err) {
      allReportTasks = inMemoryDomainTasks.filter(t => t.reportId === reportId);
      confirmedAssignments = inMemoryDomainAssignments.filter(a => a.reportId === reportId && a.status === 'CONFIRMED');
    }

    const confirmedDomains = confirmedAssignments.map(a => a.domain);
    const relevantTasks = allReportTasks.filter(t => confirmedDomains.includes(t.domain));
    const completedTasksCount = relevantTasks.filter(t => t.status === 'COMPLETED' || t.status === 'SKIPPED').length;

    let newCaseStatus = 'ACTION_IN_PROGRESS';
    if (completedTasksCount === relevantTasks.length && relevantTasks.length > 0) {
      newCaseStatus = 'RESOLVED';
      try {
        await prisma.civicReport.update({
          where: { id: reportId },
          data: { status: 'RESOLVED', resolvedAt: new Date() }
        });
      } catch (err) {
        const rep = inMemoryCivicReports.find(r => r.id === reportId);
        if (rep) {
          rep.status = 'RESOLVED';
          rep.resolvedAt = new Date();
        }
      }

      await createChainedAuditLog({
        userId,
        action: 'COORDINATED_CASE_RESOLVED',
        entityType: 'CivicReport',
        entityId: reportId,
        details: JSON.stringify({ completedTasksCount, totalTasks: relevantTasks.length })
      });
    } else if (completedTasksCount > 0) {
      newCaseStatus = 'PARTIALLY_ADDRESSED';
      try {
        await prisma.civicReport.update({
          where: { id: reportId },
          data: { status: 'ACTION_IN_PROGRESS' }
        });
      } catch (err) {
        const rep = inMemoryCivicReports.find(r => r.id === reportId);
        if (rep) rep.status = 'ACTION_IN_PROGRESS';
      }

      await createChainedAuditLog({
        userId,
        action: 'PARTIAL_RESOLUTION_RECORDED',
        entityType: 'CivicReport',
        entityId: reportId,
        details: JSON.stringify({ completedTasksCount, totalTasks: relevantTasks.length })
      });
    }

    res.json({
      success: true,
      task: updatedTask,
      completedTasksCount,
      totalTasks: relevantTasks.length,
      overallCaseStatus: newCaseStatus
    });
  } catch (error: any) {
    console.error('[CrossDomain API] Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status.', details: error?.message });
  }
});

/**
 * 6. CROSS-DOMAIN ANALYTICS & PATTERN INTELLIGENCE
 * GET /api/cross-domain/analytics
 */
router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    let assignments: any[] = [];
    let tasks: any[] = [];
    let reports: any[] = [];

    try {
      assignments = await prisma.caseDomainAssignment.findMany();
      tasks = await prisma.caseDomainTask.findMany();
      reports = await prisma.civicReport.findMany();
    } catch (err) {
      assignments = inMemoryDomainAssignments;
      tasks = inMemoryDomainTasks;
      reports = inMemoryCivicReports;
    }

    // Group report IDs that have more than 1 domain assignment (excluding REJECTED)
    const reportDomainMap: Record<string, string[]> = {};
    for (const a of assignments) {
      if (a.status !== 'REJECTED') {
        if (!reportDomainMap[a.reportId]) reportDomainMap[a.reportId] = [];
        reportDomainMap[a.reportId].push(a.domain);
      }
    }

    const crossDomainReportIds = Object.keys(reportDomainMap).filter(id => reportDomainMap[id].length > 1);
    const totalCrossDomainCases = crossDomainReportIds.length;

    let awaitingConfirmation = 0;
    let inProgress = 0;
    let partiallyAddressed = 0;
    let resolved = 0;

    for (const id of crossDomainReportIds) {
      const rep = reports.find(r => r.id === id);
      const repTasks = tasks.filter(t => t.reportId === id);
      const completedTasks = repTasks.filter(t => t.status === 'COMPLETED' || t.status === 'SKIPPED').length;

      if (rep?.status === 'RESOLVED' || (completedTasks === repTasks.length && repTasks.length > 0)) {
        resolved++;
      } else if (completedTasks > 0) {
        partiallyAddressed++;
      } else if (repTasks.some(t => t.status === 'IN_PROGRESS')) {
        inProgress++;
      } else {
        awaitingConfirmation++;
      }
    }

    // Common combinations count
    const combinationCounts: Record<string, number> = {};
    for (const id of crossDomainReportIds) {
      const domains = reportDomainMap[id].sort();
      const combo = domains.join(' + ');
      combinationCounts[combo] = (combinationCounts[combo] || 0) + 1;
    }

    const topCombinations = Object.entries(combinationCounts)
      .map(([combination, count]) => ({ combination, count }))
      .sort((a, b) => b.count - a.count);

    // Pattern intelligence message
    let recurringPatternMessage = null;
    if (topCombinations.length > 0) {
      const top = topCombinations[0];
      recurringPatternMessage = `${top.combination} reports frequently co-occur in the selected demo region (${top.count} cases recorded).`;
    }

    res.json({
      success: true,
      summary: {
        totalCrossDomainCases,
        awaitingConfirmation,
        inProgress,
        partiallyAddressed,
        resolved
      },
      topCombinations,
      recurringPatternMessage,
      resourceIntelligence: 'One coordinated case preserves shared evidence and workflow context instead of requiring citizens to repeat separate complaints for different service domains.'
    });
  } catch (error: any) {
    console.error('[CrossDomain API] Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch cross-domain analytics.', details: error?.message });
  }
});

export default router;
