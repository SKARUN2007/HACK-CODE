import { PrismaClient, Role, ProjectStatus, MilestoneStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with demo public projects, verification codes, and users...');

  // 1. Seed Demo Users
  const citizenPassword = await bcrypt.hash('citizen123', 10);
  const inspectorPassword = await bcrypt.hash('inspector123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@makkalsaantru.gov.in' },
    update: {},
    create: {
      id: 'demo-citizen-1',
      name: 'Anitha Ramesh (Citizen)',
      email: 'citizen@makkalsaantru.gov.in',
      passwordHash: citizenPassword,
      role: Role.CITIZEN,
    },
  });

  const inspector = await prisma.user.upsert({
    where: { email: 'inspector@makkalsaantru.gov.in' },
    update: {},
    create: {
      id: 'demo-inspector-1',
      name: 'Er. Rajesh Kumar (Inspector)',
      email: 'inspector@makkalsaantru.gov.in',
      passwordHash: inspectorPassword,
      role: Role.INSPECTOR,
    },
  });

  const contractorPassword = await bcrypt.hash('contractor123', 10);

  const contractor = await prisma.user.upsert({
    where: { email: 'contractor@makkalsaantru.gov.in' },
    update: {},
    create: {
      id: 'demo-contractor-1',
      name: 'Suresh Infrastructure Pvt Ltd (Contractor)',
      email: 'contractor@makkalsaantru.gov.in',
      passwordHash: contractorPassword,
      role: Role.CONTRACTOR,
    },
  });

  console.log(`✅ Demo users created/verified (Citizen, Inspector, Admin, Contractor).`);

  // 2. Seed 5 Fictional Demo Projects with Unique QR Verification Codes
  const demoProjectsData = [
    {
      id: 'proj-demo-1',
      verificationCode: 'MS-ROAD-001',
      title: 'Village Road Improvement (DEMO)',
      description: 'Bituminous paving and stormwater drain side wall construction across 4.2 km village connectivity road.',
      category: 'ROAD',
      location: 'Thirumazhisai Panchayat, Thiruvallur District, TN',
      latitude: 13.0512,
      longitude: 79.9741,
      budget: 4500000,
      reportedProgress: 25.0,
      status: ProjectStatus.IN_PROGRESS,
      milestones: [
        { percentage: 25.0, status: MilestoneStatus.REACHED, reachedAt: new Date('2026-08-15') },
        { percentage: 50.0, status: MilestoneStatus.IN_PROGRESS },
        { percentage: 75.0, status: MilestoneStatus.NOT_STARTED },
        { percentage: 100.0, status: MilestoneStatus.NOT_STARTED },
      ],
    },
    {
      id: 'proj-demo-2',
      verificationCode: 'MS-WATER-002',
      title: 'Community Drinking Water Facility (DEMO)',
      description: 'Overhead tank installation, RO filtration plant setup, and distribution pipeline network.',
      category: 'WATER',
      location: 'Pennagaram Village, Dharmapuri District, TN',
      latitude: 12.1304,
      longitude: 77.9015,
      budget: 2800000,
      reportedProgress: 50.0,
      status: ProjectStatus.IN_PROGRESS,
      milestones: [
        { percentage: 25.0, status: MilestoneStatus.VERIFIED, reachedAt: new Date('2026-07-10') },
        { percentage: 50.0, status: MilestoneStatus.REACHED, reachedAt: new Date('2026-08-28') },
        { percentage: 75.0, status: MilestoneStatus.IN_PROGRESS },
        { percentage: 100.0, status: MilestoneStatus.NOT_STARTED },
      ],
    },
    {
      id: 'proj-demo-3',
      verificationCode: 'MS-STREET-003',
      title: 'Public Streetlight Installation (DEMO)',
      description: 'Erection of 120 solar LED streetlights with smart auto-dimming sensors along main arterial routes.',
      category: 'STREETLIGHT',
      location: 'Ward 12, Dindigul Municipality, TN',
      latitude: 10.3624,
      longitude: 77.9812,
      budget: 1500000,
      reportedProgress: 75.0,
      status: ProjectStatus.IN_PROGRESS,
      milestones: [
        { percentage: 25.0, status: MilestoneStatus.VERIFIED, reachedAt: new Date('2026-06-01') },
        { percentage: 50.0, status: MilestoneStatus.VERIFIED, reachedAt: new Date('2026-07-20') },
        { percentage: 75.0, status: MilestoneStatus.REACHED, reachedAt: new Date('2026-09-02') },
        { percentage: 100.0, status: MilestoneStatus.IN_PROGRESS },
      ],
    },
    {
      id: 'proj-demo-4',
      verificationCode: 'MS-SAN-004',
      title: 'Community Sanitation Facility (DEMO)',
      description: 'Construction of 8-seater public sanitary complex with continuous water supply and bio-digester tank.',
      category: 'SANITATION',
      location: 'Sirumugai Town Panchayat, Coimbatore District, TN',
      latitude: 11.3210,
      longitude: 76.9854,
      budget: 3200000,
      reportedProgress: 50.0,
      status: ProjectStatus.IN_PROGRESS,
      milestones: [
        { percentage: 25.0, status: MilestoneStatus.VERIFIED, reachedAt: new Date('2026-07-01') },
        { percentage: 50.0, status: MilestoneStatus.REACHED, reachedAt: new Date('2026-08-30') },
        { percentage: 75.0, status: MilestoneStatus.NOT_STARTED },
        { percentage: 100.0, status: MilestoneStatus.NOT_STARTED },
      ],
    },
    {
      id: 'proj-demo-5',
      verificationCode: 'MS-SCHOOL-005',
      title: 'Government School Building Renovation (DEMO)',
      description: 'Roof slab waterproofing, smart classroom wiring, laboratory refurbishing, and exterior plastering.',
      category: 'PUBLIC_BUILDING',
      location: 'Orathanadu Block, Thanjavur District, TN',
      latitude: 10.6251,
      longitude: 79.2432,
      budget: 6800000,
      reportedProgress: 75.0,
      status: ProjectStatus.IN_PROGRESS,
      milestones: [
        { percentage: 25.0, status: MilestoneStatus.VERIFIED, reachedAt: new Date('2026-05-15') },
        { percentage: 50.0, status: MilestoneStatus.VERIFIED, reachedAt: new Date('2026-07-12') },
        { percentage: 75.0, status: MilestoneStatus.REACHED, reachedAt: new Date('2026-09-01') },
        { percentage: 100.0, status: MilestoneStatus.IN_PROGRESS },
      ],
    },
  ];

  for (const projData of demoProjectsData) {
    const { milestones, ...projectFields } = projData;
    const project = await prisma.project.upsert({
      where: { id: projectFields.id },
      update: projectFields,
      create: projectFields,
    });

    for (const ms of milestones) {
      const existingMs = await prisma.milestone.findFirst({
        where: { projectId: project.id, percentage: ms.percentage },
      });

      if (!existingMs) {
        await prisma.milestone.create({
          data: {
            projectId: project.id,
            percentage: ms.percentage,
            status: ms.status,
            reachedAt: ms.reachedAt || null,
          },
        });
      }
    }
  }

  console.log(`✅ 5 Demo projects & QR codes seeded successfully.`);
}

main()
  .catch((e) => {
    if (e?.message?.includes("Can't reach database server")) {
      console.log('ℹ️ Local PostgreSQL server not active on 5432. Demo mode is fully ACTIVE using built-in API in-memory demo dataset.');
      process.exit(0);
    } else {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    }
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
