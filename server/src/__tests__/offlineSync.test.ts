import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

const citizenToken = jwt.sign(
  { id: 'test-offline-citizen-1', email: 'offline@makkalsaantru.gov.in', name: 'Offline Citizen', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Offline Evidence Sync Processing', () => {
  const dummyImagePath = path.join(__dirname, 'test_offline_image.jpg');

  beforeAll(() => {
    fs.writeFileSync(dummyImagePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]));
  });

  afterAll(() => {
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
  });

  test('Submitting offline-queued evidence with clientCapturedAt metadata', async () => {
    const offlineTimestamp = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenToken}`)
      .field('latitude', '13.0512')
      .field('longitude', '79.9741')
      .field('visibleWork', 'YES')
      .field('milestoneMatch', 'YES')
      .field('notes', 'Captured offline during power outage, synced now.')
      .field('clientCapturedAt', offlineTimestamp)
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body.integrityStatus).toBe('INTEGRITY_RECORDED');
    expect(res.body.evidence).toBeDefined();
    expect(res.body.evidence.evidenceHash).toBeDefined();
    expect(res.body.evidence.evidenceHash.length).toBe(64);
  });
});
