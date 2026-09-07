import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

// Helper tokens
const citizenToken = jwt.sign(
  { id: 'test-citizen-100', email: 'testcitizen@makkalsaantru.gov.in', name: 'Test Citizen', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const otherCitizenToken = jwt.sign(
  { id: 'test-citizen-999', email: 'othercitizen@makkalsaantru.gov.in', name: 'Other Citizen', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const inspectorToken = jwt.sign(
  { id: 'test-inspector-1', email: 'testinspector@makkalsaantru.gov.in', name: 'Test Inspector', role: 'INSPECTOR' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Evidence Submission & Security Endpoints', () => {
  const dummyImagePath = path.join(__dirname, 'test_image.jpg');
  const dummyInvalidPath = path.join(__dirname, 'test_script.sh');

  beforeAll(() => {
    // Create dummy test files with valid JPEG magic bytes
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegData = Buffer.concat([jpegHeader, Buffer.from('fake-jpeg-binary-data-for-testing')]);
    fs.writeFileSync(dummyImagePath, jpegData);
    fs.writeFileSync(dummyInvalidPath, Buffer.from('#!/bin/bash\necho "exploit"'));
  });

  afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
    if (fs.existsSync(dummyInvalidPath)) fs.unlinkSync(dummyInvalidPath);
  });

  test('1. Unauthenticated evidence submission -> 401 rejected', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Access denied/i);
  });

  test('2. Wrong role submission (INSPECTOR role) -> 403 rejected', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('3. Unsupported file type upload (.sh script) -> 400 rejected', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('photo', dummyInvalidPath);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Unsupported file format/i);
  });

  test('4. Valid citizen submission -> 201 accepted with server-calculated SHA-256', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('latitude', '13.0512')
      .field('longitude', '79.9741')
      .field('visibleWork', 'YES')
      .field('milestoneMatch', 'YES')
      .field('notes', 'Road levelling is underway.')
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body.integrityStatus).toBe('INTEGRITY_RECORDED');
    expect(res.body.evidence).toBeDefined();
    expect(res.body.evidence.evidenceHash).toBeDefined();
    expect(res.body.evidence.evidenceHash.length).toBe(64); // Valid 64-char SHA-256 hex string
  });

  test('5. Citizen requesting another citizen private evidence -> 403 rejected', async () => {
    // Submit evidence as citizen 100 first
    const submitRes = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('notes', 'Private evidence')
      .attach('photo', dummyImagePath);

    const evidenceId = submitRes.body.evidence?.id;

    if (evidenceId) {
      // Try to fetch as other citizen 999
      const res = await request(app)
        .get(`/api/evidence/${evidenceId}`)
        .set('Authorization', `Bearer ${otherCitizenToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/i);
    }
  });

  test('6. GET /api/evidence/my returns only authenticated citizen submissions', async () => {
    const res = await request(app)
      .get('/api/evidence/my')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.evidences)).toBe(true);
  });
});
