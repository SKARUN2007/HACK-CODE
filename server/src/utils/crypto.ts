import crypto from 'crypto';

/**
 * Computes a SHA-256 hash for given string or buffer.
 * Used to ensure tamper-evident proof and evidence integrity.
 */
export function computeSHA256(input: string | Buffer): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generates an evidence integrity hash from metadata and raw content.
 */
export function generateEvidenceHash(metadata: {
  citizenId: string;
  projectId: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  rawBuffer?: Buffer;
}): string {
  const metaString = `${metadata.citizenId}:${metadata.projectId}:${metadata.latitude}:${metadata.longitude}:${metadata.capturedAt}`;
  if (metadata.rawBuffer) {
    return computeSHA256(Buffer.concat([Buffer.from(metaString), metadata.rawBuffer]));
  }
  return computeSHA256(metaString);
}
