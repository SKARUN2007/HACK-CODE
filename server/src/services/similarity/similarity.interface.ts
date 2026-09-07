/**
 * Modular Image & File Similarity Architecture Interface.
 * Current prototype detects exact duplicate files using SHA-256 hashes.
 * Near-duplicate image detection (e.g. perceptual hashing / AI vision embedding)
 * is planned for future AI verification phases.
 */

export interface DuplicateCheckResult {
  exactDuplicate: boolean;
  duplicateOfId?: string;
  matchType: 'EXACT_SHA256' | 'NONE';
}

export interface ISimilarityService {
  checkForDuplicate(evidenceHash: string, existingHashes: Array<{ id: string; hash: string }>): Promise<DuplicateCheckResult>;
}

export class ExactHashSimilarityService implements ISimilarityService {
  async checkForDuplicate(
    evidenceHash: string,
    existingHashes: Array<{ id: string; hash: string }>
  ): Promise<DuplicateCheckResult> {
    const match = existingHashes.find((item) => item.hash === evidenceHash);
    if (match) {
      return {
        exactDuplicate: true,
        duplicateOfId: match.id,
        matchType: 'EXACT_SHA256',
      };
    }

    return {
      exactDuplicate: false,
      matchType: 'NONE',
    };
  }
}
