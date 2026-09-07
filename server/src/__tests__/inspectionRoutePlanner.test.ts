import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../index';
import {
  scoreAndRankCandidateCases,
  orderStopsNearestNeighbor2Opt,
  generateInspectionRoute,
  ELIGIBLE_INSPECTION_STATUSES,
  EXCLUDED_INSPECTION_STATUSES,
} from '../services/civic/routePlannerService';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

const citizenToken = jwt.sign(
  { userId: 'test-citizen-1', email: 'citizen.demo@makkalsaantru.tn.gov.in', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const inspectorToken = jwt.sign(
  { userId: 'test-inspector-1', email: 'inspector.demo@makkalsaantru.tn.gov.in', role: 'INSPECTOR' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { userId: 'test-admin-1', email: 'admin.demo@makkalsaantru.tn.gov.in', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Inspector Route Planner Service & Algorithmic Unit Tests', () => {
  const dummyReports = [
    {
      id: 'rep-1',
      reportCode: 'MS-CIV-001',
      category: 'ROAD',
      issueType: 'POTHOLE',
      priorityLevel: 'URGENT_REVIEW',
      priorityScore: 90,
      latitude: 10.8290,
      longitude: 78.6935,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old
      status: 'REPORTED',
    },
    {
      id: 'rep-2',
      reportCode: 'MS-CIV-002',
      category: 'DRAINAGE',
      issueType: 'BLOCKAGE',
      priorityLevel: 'HIGH',
      priorityScore: 75,
      latitude: 10.8285,
      longitude: 78.6928,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days old
      status: 'UNDER_REVIEW',
    },
    {
      id: 'rep-3',
      reportCode: 'MS-CIV-003',
      category: 'STREETLIGHT',
      issueType: 'POLE_DAMAGE',
      priorityLevel: 'MEDIUM',
      priorityScore: 45,
      latitude: 10.8250,
      longitude: 78.6970,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day old
      status: 'REPORTED',
    },
  ];

  test('1. Score and rank candidate cases balances Priority, Proximity, and Age', () => {
    const startLat = 10.8270;
    const startLong = 78.6920;
    const scored = scoreAndRankCandidateCases(dummyReports, startLat, startLong, 5);

    expect(scored).toHaveLength(3);
    expect(scored[0].priorityWeight).toBe(100); // URGENT_REVIEW
    expect(scored[0].score).toBeGreaterThan(scored[2].score); // Urgent > Medium
    expect(scored[0].distanceKm).toBeGreaterThan(0);
  });

  test('2. 2-Opt Nearest Neighbor route optimizer generates valid sequence', () => {
    const startLat = 10.8270;
    const startLong = 78.6920;
    const scored = scoreAndRankCandidateCases(dummyReports, startLat, startLong, 5);
    const stops = orderStopsNearestNeighbor2Opt(scored, startLat, startLong);

    expect(stops).toHaveLength(3);
    expect(stops[0].sequence).toBe(1);
    expect(stops[1].sequence).toBe(2);
    expect(stops[2].sequence).toBe(3);
    expect(stops[0].approxDistanceFromPreviousKm).toBeGreaterThanOrEqual(0);
  });

  test('3. Eligible statuses exclude RESOLVED, DRAFT, and CLOSED reports', () => {
    expect(ELIGIBLE_INSPECTION_STATUSES).toContain('REPORTED');
    expect(ELIGIBLE_INSPECTION_STATUSES).toContain('UNDER_REVIEW');
    expect(ELIGIBLE_INSPECTION_STATUSES).toContain('REOPENED');

    expect(EXCLUDED_INSPECTION_STATUSES).toContain('RESOLVED');
    expect(EXCLUDED_INSPECTION_STATUSES).toContain('DRAFT');
    expect(EXCLUDED_INSPECTION_STATUSES).toContain('CLOSED');
  });

  test('4. Route planner result generates plain-English rationale', async () => {
    const result = await generateInspectionRoute({
      startLat: 10.8270,
      startLong: 78.6920,
      startLocationName: 'Trichy Municipal Office',
      maxCases: 5,
      maxRadiusKm: 5,
    });

    expect(result.algorithmVersion).toContain('2-Opt');
    expect(result.routeExplanation).toContain('suggested route');
    expect(result.startLocationName).toBe('Trichy Municipal Office');
  });
});

describe('Inspector Route Planner Security & API Integration Tests', () => {

  test('5. Citizen role receives 403 Forbidden on inspection route planner endpoints', async () => {
    const res = await request(app)
      .get('/api/authority/inspection-routes/eligible-cases')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('is not authorized to access this resource');
  });

  test('6. Admin can fetch eligible inspection cases and summary metrics', async () => {
    const res = await request(app)
      .get('/api/authority/inspection-routes/eligible-cases')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toHaveProperty('casesNeedingInspection');
    expect(res.body.metrics).toHaveProperty('highPriorityCount');
    expect(Array.isArray(res.body.cases)).toBe(true);
  });

  test('7. Admin can generate suggested route proposal', async () => {
    const res = await request(app)
      .post('/api/authority/inspection-routes/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        startLat: 10.8270,
        startLong: 78.6920,
        startLocationName: 'Trichy Main Office',
        maxCases: 5,
        maxRadiusKm: 5,
      });

    expect(res.status).toBe(200);
    expect(res.body.routeProposal).toHaveProperty('stops');
    expect(res.body.routeProposal).toHaveProperty('routeExplanation');
  });
});
