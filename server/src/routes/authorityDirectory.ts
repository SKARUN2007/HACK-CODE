import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { createChainedAuditLog } from '../utils/auditLogger';
import { inMemoryAuthorities } from './civicReports';
import { AuthorityRecord } from '../services/civic/authorityRouter';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/authority-directory
 * Public/Citizen list of authority directories
 */
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    let list: any[] = [];
    try {
      list = await prisma.authorityDirectory.findMany({ orderBy: { name: 'asc' } });
    } catch (err) {
      // Fallback
    }

    if (list.length === 0) {
      list = inMemoryAuthorities;
    }

    res.json({ success: true, authorities: list });
  } catch (error: any) {
    console.error('[AuthorityDirectory API] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch authority directory.' });
  }
});

/**
 * POST /api/admin/authorities
 * Admin create new Authority Directory entry
 */
router.post('/admin/authorities', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, type, jurisdiction, city, state, supportedCategories, submissionUrl, contactMethod, isDemo } = req.body;

    if (!name || !type || !jurisdiction || !supportedCategories) {
      return res.status(400).json({ error: 'Missing required fields: name, type, jurisdiction, supportedCategories.' });
    }

    const categoriesArray = Array.isArray(supportedCategories) ? supportedCategories : String(supportedCategories).split(',');
    const categoriesString = categoriesArray.map(c => c.trim().toUpperCase()).join(',');

    const authData: AuthorityRecord = {
      id: `auth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      type: type as any,
      jurisdiction,
      city: city || undefined,
      state: state || 'Tamil Nadu',
      supportedCategories: categoriesArray as any,
      submissionUrl: submissionUrl || undefined,
      contactMethod: contactMethod || undefined,
      isDemo: isDemo !== undefined ? Boolean(isDemo) : true,
    };

    let created: any;
    try {
      created = await prisma.authorityDirectory.create({
        data: {
          name: authData.name,
          type: authData.type,
          jurisdiction: authData.jurisdiction,
          city: authData.city,
          state: authData.state,
          supportedCategories: categoriesString,
          submissionUrl: authData.submissionUrl,
          contactMethod: authData.contactMethod,
          isDemo: authData.isDemo,
        }
      });
    } catch (dbErr) {
      inMemoryAuthorities.push(authData);
      created = authData;
    }

    await createChainedAuditLog({
      userId: req.user?.id || 'admin',
      action: 'AUTHORITY_ROUTED',
      entityType: 'AuthorityDirectory',
      entityId: created.id,
      details: JSON.stringify({ name: created.name, jurisdiction: created.jurisdiction, supportedCategories: categoriesString })
    });

    res.status(201).json({ success: true, authority: created });
  } catch (error: any) {
    console.error('[AuthorityDirectory API] Admin Create error:', error);
    res.status(500).json({ error: 'Failed to create authority entry.' });
  }
});

/**
 * PATCH /api/admin/authorities/:id
 * Admin update Authority Directory entry
 */
router.patch('/admin/authorities/:id', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, jurisdiction, city, state, supportedCategories, submissionUrl, contactMethod, isDemo } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (jurisdiction) updateData.jurisdiction = jurisdiction;
    if (city !== undefined) updateData.city = city;
    if (state) updateData.state = state;
    if (supportedCategories) {
      const arr = Array.isArray(supportedCategories) ? supportedCategories : String(supportedCategories).split(',');
      updateData.supportedCategories = arr.map(c => c.trim().toUpperCase()).join(',');
    }
    if (submissionUrl !== undefined) updateData.submissionUrl = submissionUrl;
    if (contactMethod !== undefined) updateData.contactMethod = contactMethod;
    if (isDemo !== undefined) updateData.isDemo = Boolean(isDemo);

    let updated: any;
    try {
      updated = await prisma.authorityDirectory.update({
        where: { id },
        data: updateData,
      });
    } catch (dbErr) {
      const idx = inMemoryAuthorities.findIndex(a => a.id === id);
      if (idx !== -1) {
        Object.assign(inMemoryAuthorities[idx], req.body);
        updated = inMemoryAuthorities[idx];
      } else {
        return res.status(404).json({ error: 'Authority entry not found.' });
      }
    }

    await createChainedAuditLog({
      userId: req.user?.id || 'admin',
      action: 'AUTHORITY_ROUTED',
      entityType: 'AuthorityDirectory',
      entityId: id,
      details: JSON.stringify(updateData)
    });

    res.json({ success: true, authority: updated });
  } catch (error: any) {
    console.error('[AuthorityDirectory API] Admin Update error:', error);
    res.status(500).json({ error: 'Failed to update authority entry.' });
  }
});

/**
 * DELETE /api/admin/authorities/:id
 * Admin delete/disable Authority Directory entry
 */
router.delete('/admin/authorities/:id', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    try {
      await prisma.authorityDirectory.delete({ where: { id } });
    } catch (dbErr) {
      const idx = inMemoryAuthorities.findIndex(a => a.id === id);
      if (idx !== -1) {
        inMemoryAuthorities.splice(idx, 1);
      }
    }

    await createChainedAuditLog({
      userId: req.user?.id || 'admin',
      action: 'AUTHORITY_ROUTED',
      entityType: 'AuthorityDirectory',
      entityId: id,
      details: JSON.stringify({ deleted: true })
    });

    res.json({ success: true, message: 'Authority entry removed.' });
  } catch (error: any) {
    console.error('[AuthorityDirectory API] Admin Delete error:', error);
    res.status(500).json({ error: 'Failed to remove authority entry.' });
  }
});

export default router;
