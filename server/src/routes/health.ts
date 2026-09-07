import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/health
 * Health check endpoint for system monitoring.
 */
router.get('/', async (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'MakkalSaantru API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/system/info
 * Safe system metadata endpoint returning operational status without exposing secrets.
 */
router.get('/info', async (_req: Request, res: Response) => {
  let dbStatus = 'HEALTHY';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'DISCONNECTED';
  }

  const aiProvider = process.env.AI_PROVIDER || 'mock';
  const hasAiKey = Boolean(process.env.AI_API_KEY && process.env.AI_API_KEY.length > 5);

  return res.status(200).json({
    application: 'MakkalSaantru',
    tagline: 'Public Money. Public Work. Public Proof.',
    version: '1.0.0',
    apiSemver: 'v1',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      engine: 'PostgreSQL / SQLite via Prisma',
    },
    aiProvider: {
      name: aiProvider.toUpperCase(),
      active: true,
      apiKeyConfigured: hasAiKey,
    },
    securityControls: {
      rbac: 'ACTIVE',
      jwtAuth: 'ACTIVE',
      fileMagicByteValidation: 'ACTIVE',
      sha256EvidenceIntegrity: 'ACTIVE',
      rateLimiting: 'ACTIVE',
      auditLogging: 'ACTIVE',
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
