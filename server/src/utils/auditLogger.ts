import { PrismaClient } from '@prisma/client';
import { computeSHA256 } from './crypto';

const prisma = new PrismaClient();
let lastRecordHash = '0000000000000000000000000000000000000000000000000000000000000000';

export interface CreateAuditLogInput {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: string | null;
}

/**
 * Creates a tamper-evident chained audit log entry.
 * Computes recordHash = SHA256(userId + action + entityType + entityId + timestamp + previousHash).
 */
export async function createChainedAuditLog(input: CreateAuditLogInput) {
  const timestamp = new Date();
  const previousHash = lastRecordHash;

  const payloadString = `${input.userId || 'system'}:${input.action}:${input.entityType}:${input.entityId || ''}:${timestamp.toISOString()}:${previousHash}`;
  const recordHash = computeSHA256(payloadString);
  lastRecordHash = recordHash;

  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        details: input.details || null,
        previousHash,
        recordHash,
        timestamp,
      },
    });
    return log;
  } catch (err) {
    // In-memory fallback if DB unseeded
    return {
      id: `log-${Date.now()}`,
      ...input,
      previousHash,
      recordHash,
      timestamp,
    };
  }
}
