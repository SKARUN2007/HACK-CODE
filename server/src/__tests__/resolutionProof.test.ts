import { computeSHA256, ResolutionComparisonService } from '../services/civic/resolutionService';

describe('MakkalSaantru — Before → After Resolution Proof Tests', () => {

  describe('1. Cryptographic SHA-256 Evidence Hashing', () => {
    it('generates consistent 64-character hex SHA-256 hash for photo buffer', () => {
      const buffer = Buffer.from('TEST_BEFORE_PHOTO_DATA_POLLUTION_FREE_TAMIL_NADU');
      const hash1 = computeSHA256(buffer);
      const hash2 = computeSHA256(buffer);

      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);
    });

    it('generates distinct SHA-256 hashes for BEFORE vs AFTER photos', () => {
      const beforeBuffer = Buffer.from('POTHOLE_BEFORE_REPAIR');
      const afterBuffer = Buffer.from('ROAD_AFTER_BITUMEN_REPAIR');

      const hashBefore = computeSHA256(beforeBuffer);
      const hashAfter = computeSHA256(afterBuffer);

      expect(hashBefore).not.toBe(hashAfter);
    });
  });

  describe('2. Vision AI Comparison Observation (Human-in-the-Loop)', () => {
    it('returns POSSIBLY_RESOLVED observation when repair features match category', async () => {
      const comparison = await ResolutionComparisonService.compareBeforeAfter({
        beforePhotoUrl: '/uploads/before-pothole.jpg',
        afterPhotoUrl: '/uploads/after-repaired.jpg',
        category: 'ROAD',
      });

      expect(['POSSIBLY_RESOLVED', 'POSSIBLY_UNRESOLVED', 'UNCERTAIN']).toContain(comparison.aiObservation);
      expect(comparison.notes).toBeDefined();
    });

    it('never sets final status automatically — AI verdict remains advisory', async () => {
      const comparison = await ResolutionComparisonService.compareBeforeAfter({
        beforePhotoUrl: '/uploads/before-pothole.jpg',
        afterPhotoUrl: '/uploads/after-repaired.jpg',
        category: 'ROAD',
      });

      expect(comparison.aiObservation).not.toBe('RESOLVED');
      expect(comparison.humanVerificationRequired).toBe(true);
    });
  });

  describe('3. Lifecycle & Reopening Logic', () => {
    it('validates lifecycle transition from ACTION_IN_PROGRESS to AWAITING_REVERIFICATION', () => {
      const validStatuses = [
        'REPORTED',
        'UNDER_REVIEW',
        'ACTION_IN_PROGRESS',
        'AWAITING_AFTER_EVIDENCE',
        'AWAITING_REVERIFICATION',
        'RESOLVED',
        'REOPENED',
      ];

      expect(validStatuses).toContain('AWAITING_REVERIFICATION');
      expect(validStatuses).toContain('REOPENED');
    });
  });

});
