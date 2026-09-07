import request from 'supertest';
import app from '../index';
import { CrossDomainDetectionService } from '../services/civic/crossDomainDetectionService';
import { seedJudgeDemoCases } from '../services/civic/seedDemoCases';

describe('Cross-Department Case Detection Test Suite', () => {

  beforeAll(async () => {
    await seedJudgeDemoCases();
  });

  describe('CrossDomainDetectionService Unit Logic', () => {


    test('1. Single-domain report remains single domain when no co-occurrence rule matches', async () => {
      const result = await CrossDomainDetectionService.detectRelatedDomains({
        primaryDomain: 'STREETLIGHT' as any,
        description: 'Single isolated broken bulb on residential lane'
      });

      // Should not trigger unnecessary related domains if context doesn't indicate road interaction
      expect(result.primaryDomain).toBe('STREETLIGHT');
      expect(result.isMultiDomain).toBe(false);
    });

    test('2. Multi-domain suggestion works for DRAINAGE + ROAD co-occurrence', async () => {
      const result = await CrossDomainDetectionService.detectRelatedDomains({
        primaryDomain: 'DRAINAGE' as any,
        description: 'Overflowing storm drain causing water pooling on asphalt road surface'
      });

      expect(result.primaryDomain).toBe('DRAINAGE');
      expect(result.isMultiDomain).toBe(true);
      expect(result.relatedDomains.some(r => r.domain === 'ROAD')).toBe(true);
      const roadRel = result.relatedDomains.find(r => r.domain === 'ROAD');
      expect(roadRel?.reason).toContain('Standing water and visible road-surface damage appear together');
      // Must not accuse departments
      expect(roadRel?.reason).not.toMatch(/department caused|blame/i);
    });

    test('3. Multi-domain suggestion works for WATER_SUPPLY + ROAD co-occurrence', async () => {
      const result = await CrossDomainDetectionService.detectRelatedDomains({
        primaryDomain: 'WATER_SUPPLY' as any,
        description: 'Underground main water pipe leak affecting road pavement'
      });

      expect(result.isMultiDomain).toBe(true);
      expect(result.relatedDomains.some(r => r.domain === 'ROAD')).toBe(true);
    });

    test('4. Configured relationship model returns pre-seeded relationships', async () => {
      const rels = await CrossDomainDetectionService.getRelationships();
      expect(rels.length).toBeGreaterThanOrEqual(5);
      expect(rels.some(r => r.primaryDomain === 'DRAINAGE' && r.relatedDomain === 'ROAD')).toBe(true);
    });

    test('5. Coordinated case creation creates ONE case with multiple assignments and tasks', async () => {
      const reportId = 'test-rep-101';
      const result = await CrossDomainDetectionService.createCoordinatedCase({
        reportId,
        primaryDomain: 'DRAINAGE' as any,
        primaryReason: 'Overflowing drain',
        primaryAuthorityId: 'auth-1',
        relatedSuggestions: [
          { domain: 'ROAD' as any, confidence: 0.85, reason: 'Standing water affecting road', relationshipType: 'POSSIBLE_IMPACT' }
        ],
        citizenConfirmed: true
      });

      expect(result.assignments.length).toBe(2);
      expect(result.tasks.length).toBe(2);
      // Primary task sequence 1
      expect(result.tasks[0].sequence).toBe(1);
      // Related task sequence 2 depends on primary task
      expect(result.tasks[1].sequence).toBe(2);
      expect(result.tasks[1].dependsOnTaskId).toBe(result.tasks[0].id);
    });

  });

  describe('Cross-Department API Endpoints & RBAC', () => {

    test('6. POST /api/cross-domain/detect returns candidate suggestions', async () => {
      const res = await request(app)
        .post('/api/cross-domain/detect')
        .send({
          primaryDomain: 'DRAINAGE',
          description: 'Blocked stormwater canal flooding road'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.detection.isMultiDomain).toBe(true);
      expect(res.body.detection.relatedDomains[0].mappedAuthority).toBeDefined();
    });

    test('7. GET /api/cross-domain/reports/:reportId returns domain details for pre-seeded case MS-CIV-2026-142', async () => {
      const res = await request(app)
        .get('/api/cross-domain/reports/MS-CIV-2026-142');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.isMultiDomain).toBe(true);
      expect(res.body.assignments.length).toBeGreaterThanOrEqual(2);
    });

    test('8. GET /api/cross-domain/analytics returns summary metrics and recurring pattern message', async () => {
      const res = await request(app)
        .get('/api/cross-domain/analytics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.summary).toBeDefined();
      expect(res.body.resourceIntelligence).toBeDefined();
    });

  });

});
