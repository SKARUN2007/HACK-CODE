import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

const citizenAToken = jwt.sign(
  { id: 'test-citizen-A', email: 'citizenA@makkalsaantru.gov.in', name: 'Citizen A', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const citizenBToken = jwt.sign(
  { id: 'test-citizen-B', email: 'citizenB@makkalsaantru.gov.in', name: 'Citizen B', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const inspectorToken = jwt.sign(
  { id: 'test-inspector-1', email: 'inspector1@makkalsaantru.gov.in', name: 'Inspector 1', role: 'INSPECTOR' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Phase 3 Security, IDOR, Haversine & Integrity Test Suite', () => {
  const dummyImagePath = path.join(__dirname, 'test_secure_image.jpg');

  beforeAll(() => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegData = Buffer.concat([jpegHeader, Buffer.from('unique-binary-content-for-phase3-security-tests')]);
    fs.writeFileSync(dummyImagePath, jpegData);
  });

  afterAll(() => {
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
  });

  test('1. Invalid JWT token -> 403 / 401 rejected', async () => {
    const res = await request(app)
      .get('/api/evidence/my')
      .set('Authorization', 'Bearer invalid-junk-token');

    expect([401, 403]).toContain(res.status);
  });

  test('2. Citizen accessing Inspector endpoint (reverify integrity) -> 403 rejected', async () => {
    const res = await request(app)
      .post('/api/evidence/ev-101/reverify-integrity')
      .set('Authorization', `Bearer ${citizenAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('3. Invalid Project QR Verification Code -> 404 rejected', async () => {
    const res = await request(app)
      .get('/api/projects/resolve-code/INVALID-CODE-999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Project verification code not recognized.');
  });

  test('4. Valid Project QR Verification Code (MS-ROAD-001) -> 200 returned project', async () => {
    const res = await request(app)
      .get('/api/projects/resolve-code/MS-ROAD-001');

    expect(res.status).toBe(200);
    expect(res.body.project).toBeDefined();
    expect(res.body.project.verificationCode).toBe('MS-ROAD-001');
  });

  test('5. Malformed latitude (> 90) -> 400 rejected', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenAToken}`)
      .field('latitude', '120.5') // Invalid latitude > 90
      .field('longitude', '79.97')
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Malformed coordinates/i);
  });

  test('6. Malformed longitude (> 180) -> 400 rejected', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenAToken}`)
      .field('latitude', '13.05')
      .field('longitude', '210.0') // Invalid longitude > 180
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Malformed coordinates/i);
  });

  test('7. Server-side Haversine distance & NEAR_PROJECT categorization', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenAToken}`)
      .field('latitude', '13.0512') // Exactly project coordinates
      .field('longitude', '79.9741')
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body.evidence.distanceFromProject).toBeLessThanOrEqual(50);
    expect(res.body.evidence.locationStatus).toBe('NEAR_PROJECT');
    expect(res.body.trustSignals.locationStatus).toBe('NEAR_PROJECT');
  });

  test('8. IDOR Protection: Citizen B trying to view Citizen A evidence -> 403 rejected', async () => {
    // Citizen A submits evidence
    const submitRes = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenAToken}`)
      .field('notes', 'Citizen A private evidence')
      .attach('photo', dummyImagePath);

    const evidenceId = submitRes.body.evidence?.id;

    if (evidenceId) {
      // Citizen B requests Citizen A's evidence ID
      const res = await request(app)
        .get(`/api/evidence/${evidenceId}`)
        .set('Authorization', `Bearer ${citizenBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/i);
    }
  });

  test('9. Inspector Re-verifying stored Evidence SHA-256 -> VALID', async () => {
    const submitRes = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenAToken}`)
      .attach('photo', dummyImagePath);

    const evidenceId = submitRes.body.evidence?.id;

    if (evidenceId) {
      const reverifyRes = await request(app)
        .post(`/api/evidence/${evidenceId}/reverify-integrity`)
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(reverifyRes.status).toBe(200);
      expect(reverifyRes.body.integrityResult).toBe('VALID');
      expect(reverifyRes.body.originalHash).toBeDefined();
    }
  });
});
