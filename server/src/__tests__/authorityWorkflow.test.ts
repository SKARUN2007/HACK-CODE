import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import { authorityService } from '../services/authorityService';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

const citizenToken = jwt.sign(
  { id: 'test-citizen-1', email: 'citizen@makkalsaantru.gov.in', name: 'Citizen User', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const inspectorToken = jwt.sign(
  { id: 'test-inspector-1', email: 'inspector@makkalsaantru.gov.in', name: 'Inspector User', role: 'INSPECTOR' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  { id: 'test-admin-1', email: 'admin@makkalsaantru.gov.in', name: 'Admin User', role: 'ADMIN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Phase 6: Authority Intelligence & Human Workflow Test Suite', () => {
  test('1. Citizen accessing Authority Dashboard API -> 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/authority/dashboard')
      .set('Authorization', `Bearer ${citizenToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/i);
  });

  test('2. Inspector accessing Authority Dashboard API -> 200 OK with summary stats & priority queue', async () => {
    const res = await request(app)
      .get('/api/authority/dashboard')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalProjects).toBeGreaterThan(0);
    expect(Array.isArray(res.body.priorityQueue)).toBe(true);

    // Verify priority sorting (highest score first)
    const queue = res.body.priorityQueue;
    for (let i = 0; i < queue.length - 1; i++) {
      expect(queue[i].priorityScore).toBeGreaterThanOrEqual(queue[i + 1].priorityScore);
    }
  });

  test('3. State machine validation enforces allowed decision state transitions', () => {
    expect(authorityService.isValidStateTransition('HUMAN_REVIEW_PENDING', 'UNDER_HUMAN_REVIEW')).toBe(true);
    expect(authorityService.isValidStateTransition('UNDER_HUMAN_REVIEW', 'ISSUE_CONFIRMED')).toBe(true);
    expect(authorityService.isValidStateTransition('UNDER_HUMAN_REVIEW', 'NO_ISSUE_FOUND')).toBe(true);
    expect(authorityService.isValidStateTransition('ISSUE_CONFIRMED', 'RESOLVED')).toBe(true);
  });

  test('4. Inspector recording issue decision without inspection note -> 400 Rejected', async () => {
    const res = await request(app)
      .post('/api/authority/cases/proj-demo-3/decision')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ decision: 'ISSUE_CONFIRMED', notes: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/inspection note/i);
  });

  test('5. Inspector recording issue decision with inspection note -> 200 OK', async () => {
    const res = await request(app)
      .post('/api/authority/cases/proj-demo-3/decision')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ decision: 'ISSUE_CONFIRMED', notes: 'Streetlight stretch B poles missing solar panels.' });

    expect(res.status).toBe(200);
    expect(res.body.humanStatus).toBe('ISSUE_CONFIRMED');
  });

  test('6. Corrective Action creation & status update lifecycle', async () => {
    // Step A: Create Corrective Action
    const createRes = await request(app)
      .post('/api/authority/cases/proj-demo-3/actions')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        description: 'Erect 90 missing solar LED panels on stretch B poles',
        department: 'Electrical Works Division',
        targetCompletionDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.actionItem).toBeDefined();
    const actionId = createRes.body.actionItem.id;
    expect(createRes.body.actionItem.status).toBe('ACTION_REQUIRED');

    // Step B: Update status to IN_PROGRESS
    const updateRes = await request(app)
      .patch(`/api/authority/actions/${actionId}`)
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.actionItem.status).toBe('IN_PROGRESS');
  });

  test('7. Admin assigning inspector to case -> 200 OK (Inspector role rejected -> 403)', async () => {
    // Inspector role attempt -> 403 Forbidden
    const forbiddenRes = await request(app)
      .post('/api/authority/cases/proj-demo-1/assign')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ assignedInspectorId: 'insp-002' });

    expect(forbiddenRes.status).toBe(403);

    // Admin role attempt -> 200 OK
    const adminRes = await request(app)
      .post('/api/authority/cases/proj-demo-1/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedInspectorId: 'insp-002' });

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.assignment.assignedInspectorId).toBe('insp-002');
  });

  test('8. Admin Audit Trail API endpoint (`/api/admin/audit`) protected by ADMIN role', async () => {
    // Citizen role attempt -> 403
    const citRes = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${citizenToken}`);
    expect(citRes.status).toBe(403);

    // Inspector role attempt -> 403
    const inspRes = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${inspectorToken}`);
    expect(inspRes.status).toBe(403);

    // Admin role attempt -> 200 OK
    const adminRes = await request(app)
      .get('/api/admin/audit')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(Array.isArray(adminRes.body.logs)).toBe(true);
  });
});
