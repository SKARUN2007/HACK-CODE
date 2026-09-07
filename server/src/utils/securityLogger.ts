export type SecurityEventType =
  | 'FAILED_LOGIN'
  | 'LOGIN_RATE_LIMITED'
  | 'ACCESS_DENIED'
  | 'INVALID_TOKEN'
  | 'INVALID_UPLOAD'
  | 'INTEGRITY_MISMATCH'
  | 'SUSPICIOUS_DUPLICATE_PATTERN'
  | 'MALFORMED_INPUT'
  | 'RATE_LIMIT_TRIGGERED';

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEventRecord {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  endpoint: string;
  description: string;
  timestamp: string;
}

// In-memory repository for security events
export const inMemorySecurityEvents: SecurityEventRecord[] = [
  {
    id: 'sec-demo-1',
    type: 'ACCESS_DENIED',
    severity: 'HIGH',
    userId: 'cit-101',
    userName: 'Citizen User',
    userRole: 'CITIZEN',
    endpoint: '/api/admin/audit',
    description: 'Unauthorized role access attempt blocked by RBAC middleware.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sec-demo-2',
    type: 'INVALID_UPLOAD',
    severity: 'MEDIUM',
    userId: 'cit-102',
    userName: 'Citizen User B',
    userRole: 'CITIZEN',
    endpoint: '/api/projects/proj-demo-1/evidence',
    description: 'Upload blocked: Executable magic-byte header signature mismatch.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sec-demo-3',
    type: 'LOGIN_RATE_LIMITED',
    severity: 'MEDIUM',
    userId: null,
    userName: 'Anonymous Client',
    userRole: 'UNAUTHENTICATED',
    endpoint: '/api/auth/login',
    description: 'Brute-force protection: Exceeded 5 failed login attempts per window.',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'sec-demo-4',
    type: 'INTEGRITY_MISMATCH',
    severity: 'CRITICAL',
    userId: 'insp-001',
    userName: 'Inspector Rajan',
    userRole: 'INSPECTOR',
    endpoint: '/api/evidence/ev-test-corrupted/reverify-integrity',
    description: 'Cryptographic alert: Recomputed SHA-256 hash does not match original evidence digest.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
];

/**
 * Logs a security event to memory and console (never logging credentials or keys)
 */
export function logSecurityEvent(event: Omit<SecurityEventRecord, 'id' | 'timestamp'>): SecurityEventRecord {
  const record: SecurityEventRecord = {
    ...event,
    id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };

  inMemorySecurityEvents.unshift(record);

  // Keep repository capped at 500 events
  if (inMemorySecurityEvents.length > 500) {
    inMemorySecurityEvents.pop();
  }

  console.warn(`[SECURITY EVENT ${record.severity}] ${record.type} on ${record.endpoint}: ${record.description}`);
  return record;
}

/**
 * Computes live security summary metrics for Admin Security Dashboard
 */
export function calculateSecuritySummary() {
  let failedLoginCount = 0;
  let accessDeniedCount = 0;
  let rateLimitCount = 0;
  let invalidUploadCount = 0;
  let integrityWarningCount = 0;

  inMemorySecurityEvents.forEach((evt) => {
    switch (evt.type) {
      case 'FAILED_LOGIN':
      case 'LOGIN_RATE_LIMITED':
        failedLoginCount++;
        break;
      case 'ACCESS_DENIED':
        accessDeniedCount++;
        break;
      case 'RATE_LIMIT_TRIGGERED':
        rateLimitCount++;
        break;
      case 'INVALID_UPLOAD':
        invalidUploadCount++;
        break;
      case 'INTEGRITY_MISMATCH':
        integrityWarningCount++;
        break;
    }
  });

  return {
    totalEvents: inMemorySecurityEvents.length,
    failedLoginCount,
    accessDeniedCount,
    rateLimitCount,
    invalidUploadCount,
    integrityWarningCount,
  };
}
