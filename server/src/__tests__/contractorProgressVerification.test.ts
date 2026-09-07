import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { ProgressEvidenceComparisonService } from '../services/civic/progressComparisonService';
import { VerificationResult } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-makkalsaantru-jwt-token-key-change-in-production-2026';

const contractorToken = jwt.sign(
  { id: 'demo-contractor-1', email: 'contractor@makkalsaantru.gov.in', name: 'Contractor', role: 'CONTRACTOR' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const citizenToken = jwt.sign(
  { id: 'test-citizen-101', email: 'citizen@makkalsaantru.gov.in', name: 'Citizen', role: 'CITIZEN' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const inspectorToken = jwt.sign(
  { id: 'test-inspector-1', email: 'inspector@makkalsaantru.gov.in', name: 'Inspector', role: 'INSPECTOR' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Contractor Progress Verification & Evidence Comparison', () => {
  const dummyImagePath = path.join(__dirname, 'test_contractor_image.jpg');

  beforeAll(() => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    const jpegData = Buffer.concat([jpegHeader, Buffer.from('fake-contractor-evidence-data')]);
    fs.writeFileSync(dummyImagePath, jpegData);
  });

  afterAll(() => {
    if (fs.existsSync(dummyImagePath)) fs.unlinkSync(dummyImagePath);
  });

  test('1. Contractor can upload progress evidence for assigned project stage', async () => {
    const res = await request(app)
      .post('/api/contractor/submissions')
      .set('Authorization', `Bearer ${contractorToken}`)
      .field('projectId', 'proj-demo-1')
      .field('projectStageId', 'stage-demo-2')
      .field('title', 'Road base layer completed for 500 metres')
      .field('claim', 'Crushed stone aggregate base layer compacted and ready for asphalt.')
      .field('latitude', '13.0512')
      .field('longitude', '79.9741')
      .attach('photo', dummyImagePath);

    expect(res.status).toBe(201);
    expect(res.body.submission).toBeDefined();
    expect(res.body.submission.fingerprint).toBeDefined();
  });

  test('2. Contractor cannot verify their own submission -> 403 Security Error', async () => {
    // First submit evidence
    const subRes = await request(app)
      .post('/api/contractor/submissions')
      .set('Authorization', `Bearer ${contractorToken}`)
      .field('projectId', 'proj-demo-1')
      .field('projectStageId', 'stage-demo-2')
      .field('title', 'Test self verify')
      .field('claim', 'Test claim')
      .attach('photo', dummyImagePath);

    const submissionId = subRes.body.submission?.id;
    if (submissionId) {
      const verifyRes = await request(app)
        .post(`/api/contractor/submissions/${submissionId}/verify`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .field('observation', 'YES')
        .field('consistencyResponse', 'YES');

      expect(verifyRes.status).toBe(403);
      expect(verifyRes.body.error).toMatch(/Contractors are not permitted to verify/i);
    }
  });

  test('3. Citizen can verify contractor progress claim & trigger AI comparison', async () => {
    // Submit progress claim first
    const subRes = await request(app)
      .post('/api/contractor/submissions')
      .set('Authorization', `Bearer ${contractorToken}`)
      .field('projectId', 'proj-demo-1')
      .field('projectStageId', 'stage-demo-2')
      .field('title', 'Road base layer work')
      .field('claim', 'Base layer aggregate laid.')
      .attach('photo', dummyImagePath);

    const submissionId = subRes.body.submission?.id;

    if (submissionId) {
      const verifyRes = await request(app)
        .post(`/api/contractor/submissions/${submissionId}/verify`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('observation', 'YES')
        .field('consistencyResponse', 'YES')
        .field('comment', 'Observed road base stone layer at site.')
        .attach('photo', dummyImagePath);

      expect(verifyRes.status).toBe(201);
      expect(verifyRes.body.aiAnalysis).toBeDefined();
      expect(verifyRes.body.aiAnalysis.result).toBeDefined();
    }
  });

  test('4. ProgressEvidenceComparisonService evaluates consistent vs mismatch observations', () => {
    const compService = new ProgressEvidenceComparisonService();

    // Test case 1: Insufficient evidence
    const res1 = compService.compareEvidence({
      submissionId: 'sub-1',
      projectStageName: 'Road Base Work',
      contractorClaim: 'Base layer laid',
      contractorEvidencesCount: 1,
      citizenVerifications: [],
    });
    expect(res1.result).toBe(VerificationResult.INSUFFICIENT_EVIDENCE);

    // Test case 2: Consistent observations
    const res2 = compService.compareEvidence({
      submissionId: 'sub-2',
      projectStageName: 'Road Base Work',
      contractorClaim: 'Base layer laid',
      contractorEvidencesCount: 1,
      citizenVerifications: [
        { verifierId: 'c1', verifierRole: 'CITIZEN', observation: 'YES', consistencyResponse: 'YES' },
        { verifierId: 'c2', verifierRole: 'CITIZEN', observation: 'YES', consistencyResponse: 'YES' },
      ],
    });
    expect(res2.result).toBe(VerificationResult.CONSISTENT);

    // Test case 3: Mismatch observations
    const res3 = compService.compareEvidence({
      submissionId: 'sub-3',
      projectStageName: 'Road Base Work',
      contractorClaim: 'Base layer laid',
      contractorEvidencesCount: 1,
      citizenVerifications: [
        { verifierId: 'c1', verifierRole: 'CITIZEN', observation: 'NO', consistencyResponse: 'NO' },
        { verifierId: 'c2', verifierRole: 'CITIZEN', observation: 'NO', consistencyResponse: 'NO' },
      ],
    });
    expect(res3.result).toBe(VerificationResult.POTENTIAL_MISMATCH);
  });

  test('5. Inspector can record human decision on submission', async () => {
    // Submit progress claim
    const subRes = await request(app)
      .post('/api/contractor/submissions')
      .set('Authorization', `Bearer ${contractorToken}`)
      .field('projectId', 'proj-demo-1')
      .field('projectStageId', 'stage-demo-2')
      .field('title', 'Final inspection review test')
      .field('claim', 'Work completed.')
      .attach('photo', dummyImagePath);

    const submissionId = subRes.body.submission?.id;

    if (submissionId) {
      const decRes = await request(app)
        .post(`/api/contractor/submissions/${submissionId}/decision`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          decision: 'VERIFY_PROGRESS',
          reason: 'Verified by Executive Engineer upon site review.',
        });

      expect(decRes.status).toBe(200);
      expect(decRes.body.newStatus).toBe('VERIFIED');
    }
  });
});
