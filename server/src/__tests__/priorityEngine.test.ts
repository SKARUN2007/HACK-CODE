import { calculatePriorityScore } from '../services/civic/priorityEngine';

describe('MakkalSaantru — Action Priority Score Engine Tests', () => {

  describe('1. Action Priority Score Calculation (0 - 100)', () => {
    it('calculates higher priority score for high report count and unaddressed duration', () => {
      const resultHigh = calculatePriorityScore({
        independentReportCount: 9,
        confirmationCount: 5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        category: 'ROAD',
        locationText: 'Near District Hospital, Main Junction',
        hasPhoto: true,
        hasLocation: true,
        hasDescription: true,
      });

      expect(resultHigh.priorityScore).toBeGreaterThanOrEqual(75);
      expect(resultHigh.priorityLevel).toBe('URGENT_REVIEW');
      expect(resultHigh.reasons.length).toBeGreaterThan(0);
    });

    it('calculates lower priority score for single report created recently', () => {
      const resultLow = calculatePriorityScore({
        independentReportCount: 1,
        confirmationCount: 0,
        createdAt: new Date(),
        category: 'OTHER',
        locationText: 'Quiet residential street',
        hasPhoto: false,
        hasLocation: false,
        hasDescription: false,
      });

      expect(resultLow.priorityScore).toBeLessThan(40);
      expect(resultLow.priorityLevel).toBe('LOW');
    });

    it('caps maximum action priority score at 100', () => {
      const resultOverflow = calculatePriorityScore({
        independentReportCount: 50,
        confirmationCount: 100,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        category: 'SEWAGE',
        locationText: 'Main Bus Stand',
        hasPhoto: true,
        hasLocation: true,
        hasDescription: true,
      });

      expect(resultOverflow.priorityScore).toBe(100);
      expect(resultOverflow.priorityLevel).toBe('URGENT_REVIEW');
    });
  });

  describe('2. Evidence Confidence Score (0 - 100)', () => {
    it('calculates higher evidence confidence when geotagged photo is present', () => {
      const result = calculatePriorityScore({
        independentReportCount: 1,
        hasPhoto: true,
        hasLocation: true,
        hasDescription: true,
      });

      expect(result.evidenceConfidence).toBeGreaterThanOrEqual(90);
    });

    it('calculates baseline evidence confidence when photo is missing', () => {
      const result = calculatePriorityScore({
        independentReportCount: 1,
        hasPhoto: false,
        hasLocation: false,
        hasDescription: false,
      });

      expect(result.evidenceConfidence).toBe(70);
    });
  });

  describe('3. Neutrality & Terminology Enforcement', () => {
    it('ensures explanation reasons use objective civic terms (No accusations/bias)', () => {
      const result = calculatePriorityScore({
        independentReportCount: 5,
        confirmationCount: 3,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        category: 'ROAD',
        locationText: 'Main Street',
        hasPhoto: true,
      });

      const forbiddenTerms = ['CRIME', 'CORRUPT', 'ILLEGAL', 'DANGEROUS', 'GUILTY'];
      const reasonsText = result.reasons.join(' ').toUpperCase();

      forbiddenTerms.forEach((term) => {
        expect(reasonsText).not.toContain(term);
      });
    });
  });

});
