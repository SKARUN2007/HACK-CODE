import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import {
  inMemorySecurityEvents,
  calculateSecuritySummary,
  SecurityEventRecord,
} from '../utils/securityLogger';

const router = Router();

/**
 * GET /api/admin/security/events
 * Admin-only endpoint returning filterable security event logs.
 */
router.get(
  '/events',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type, severity, search } = req.query;

      let events: SecurityEventRecord[] = [...inMemorySecurityEvents];

      if (type && type !== 'ALL') {
        events = events.filter((e) => e.type === String(type));
      }

      if (severity && severity !== 'ALL') {
        events = events.filter((e) => e.severity === String(severity).toUpperCase());
      }

      if (search) {
        const q = String(search).toLowerCase();
        events = events.filter(
          (e) =>
            e.description.toLowerCase().includes(q) ||
            e.type.toLowerCase().includes(q) ||
            e.endpoint.toLowerCase().includes(q) ||
            (e.userName && e.userName.toLowerCase().includes(q))
        );
      }

      const summary = calculateSecuritySummary();

      return res.status(200).json({
        summary,
        events,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch security events.' });
    }
  }
);

/**
 * GET /api/admin/security/status
 * Admin-only endpoint returning active security controls matrix.
 */
router.get(
  '/status',
  authenticateToken,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const controls = [
        { name: 'Authentication & JWT Validation', status: 'ACTIVE', detail: 'JWT Bearer token with expiration & secret validation' },
        { name: 'Role-Based Access Control (RBAC)', status: 'ACTIVE', detail: 'Server-enforced CITIZEN / INSPECTOR / ADMIN permission checks' },
        { name: 'Password Security & Hashing', status: 'ACTIVE', detail: 'bcrypt password hashing (work factor 10), min 8 chars with letter & number' },
        { name: 'API Rate Limiting & Brute-Force Defense', status: 'ACTIVE', detail: 'Endpoint-specific express-rate-limiters (Auth: 20 req/15m, Global: 300 req/15m)' },
        { name: 'File Upload & Magic-Byte Validation', status: 'ACTIVE', detail: 'Binary header signature verification (JPEG, PNG, WEBP, WAV magic bytes)' },
        { name: 'Evidence Integrity & SHA-256 Hashing', status: 'ACTIVE', detail: 'Server-computed 64-char SHA-256 cryptographic digests with reverification' },
        { name: 'Audit Trail & Event Logging', status: 'ACTIVE', detail: 'Chained tamper-evident audit logs & security threat event tracking' },
        { name: 'Secure HTTP Headers & CORS Policy', status: 'ACTIVE', detail: 'Helmet security headers (CSP, nosniff, frameguard) & origin-bound CORS' },
        { name: 'Secrets Protection & Key Isolation', status: 'ACTIVE', detail: 'Environment variables, .env exclusion, zero leak of secrets via API' },
      ];

      return res.status(200).json({ controls });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch security status.' });
    }
  }
);

export default router;
