import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

const citizenToken = jwt.sign(
  { id: 'test-citizen-1', email: 'citizen@makkalsaantru.gov.in', name: 'Citizen User', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { id: 'test-admin-1', email: 'admin@makkalsaantru.gov.in', name: 'Admin User', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Phase 7: Cybersecurity Hardening & Monitoring Test Suite', () => {
  const dummyScriptPath = path.join(__dirname, 'fake_image_exploit.jpg');

  beforeAll(() => {
    // Write fake JPEG image containing executable script bytes to trigger magic-byte rejection
    fs.writeFileSync(dummyScriptPath, Buffer.from('#!/bin/bash\necho "malicious script disguised as jpeg"'));
  });

  afterAll(() => {
    if (fs.existsSync(dummyScriptPath)) fs.unlinkSync(dummyScriptPath);
  });

  test('1. Registration rejects weak password (less than 8 chars or missing numbers) -> 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'weakpw@test.com', password: 'simple', role: 'CITIZEN' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Validation Error|Password must be/i);
  });

  test('2. Registration accepts strong password (min 8 chars with letter & number) -> 201 Created', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User Secure', email: `secuser-${Date.now()}@test.com`, password: 'SecurePassword123!', role: 'CITIZEN' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined(); // passwordHash strictly excluded
  });

  test('3. Failed login with wrong password -> 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'citizen@makkalsaantru.gov.in', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid email or password/i);
  });

  test('4. Expired or malformed JWT token -> 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/security/events')
      .set('Authorization', 'Bearer invalid-malformed-jwt-token-string');

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Invalid or expired/i);
  });

  test('5. Role Bypass Protection: Citizen role accessing Admin Security Dashboard -> 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/security/events')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('6. Admin accessing Security Dashboard & Status Matrix -> 200 OK', async () => {
    const res = await request(app)
      .get('/api/admin/security/events')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(Array.isArray(res.body.events)).toBe(true);

    const statusRes = await request(app)
      .get('/api/admin/security/status')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(statusRes.status).toBe(200);
    expect(Array.isArray(statusRes.body.controls)).toBe(true);
  });

  test('7. Magic Byte Validation: Uploading binary executable disguised as .jpg -> 400 Rejected', async () => {
    const res = await request(app)
      .post('/api/projects/proj-demo-1/evidence')
      .set('Authorization', `Bearer ${citizenToken}`)
      .attach('photo', dummyScriptPath);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Security Error|Unsupported file format|binary signature/i);
  });

  test('8. Responses contain Helmet secure HTTP headers (X-Content-Type-Options: nosniff)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('9. Secrets Protection: API outputs never leak AI_API_KEY or JWT_SECRET', async () => {
    const res = await request(app).get('/api/projects');
    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr).not.toMatch(/AI_API_KEY/i);
    expect(jsonStr).not.toMatch(/JWT_SECRET/i);
  });
});
