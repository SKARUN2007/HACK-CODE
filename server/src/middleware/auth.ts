import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { logSecurityEvent } from '../utils/securityLogger';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'INSPECTOR' | 'ADMIN' | 'CONTRACTOR';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Authentication token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    logSecurityEvent({
      type: 'INVALID_TOKEN',
      severity: 'MEDIUM',
      endpoint: req.originalUrl,
      description: 'Rejected invalid or expired JWT token signature.',
    });
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Restricts access to specific user roles.
 */
export function requireRole(allowedRoles: Array<'CITIZEN' | 'INSPECTOR' | 'ADMIN' | 'CONTRACTOR'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent({
        type: 'ACCESS_DENIED',
        severity: 'HIGH',
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        endpoint: req.originalUrl,
        description: `Blocked unauthorized access attempt by role '${req.user.role}'. Required role(s): ${allowedRoles.join(', ')}`,
      });
      return res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}
