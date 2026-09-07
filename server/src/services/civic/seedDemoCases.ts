import crypto from 'crypto';
import { PrismaClient, CivicReportStatus, CivicCategory, PriorityLevel, EvidenceStage } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pre-seeds two comprehensive Judge Demo Cases into the database:
 * 1. MS-CIV-2026-00124: Road Pothole (Priority 84 - URGENT REVIEW -> Action -> After Photo -> RESOLVED)
 * 2. MS-CIV-2026-00125: Garbage Accumulation (Priority 62 - HIGH -> Action -> After Photo -> REOPENED)
 */
export async function seedJudgeDemoCases() {
  try {
    // 1. Find or create a demo citizen user
    let demoCitizen = await prisma.user.findFirst({
      where: { role: 'CITIZEN' },
    });

    if (!demoCitizen) {
      demoCitizen = await prisma.user.create({
        data: {
          name: 'Karthik Raja (Citizen)',
          email: 'citizen.demo@makkalsaantru.tn.gov.in',
          passwordHash: '$2b$10$demoHashForJudgePresentationOnly12345',
          role: 'CITIZEN',
        },
      });
    }

    // 2. Find or create Trichy Roads Department Authority
    let roadsDept = await prisma.authorityDirectory.findFirst({
      where: { name: { contains: 'Trichy Roads' } },
    });

    if (!roadsDept) {
      roadsDept = await prisma.authorityDirectory.create({
        data: {
          name: 'Trichy Roads & Highways Sub-Division (PWD)',
          type: 'PUBLIC_WORKS_DEPT',
          jurisdiction: 'Tiruchirappalli Corporation - Zone 3',
          city: 'Tiruchirappalli',
          state: 'Tamil Nadu',
          supportedCategories: 'ROAD,DRAINAGE',
          contactMethod: '0431-2410500 | pwd.roads.trichy@tn.gov.in',
          isDemo: true,
        },
      });
    }

    // 3. Find or create Trichy Sanitation Authority
    let sanitationDept = await prisma.authorityDirectory.findFirst({
      where: { name: { contains: 'Sanitation' } },
    });

    if (!sanitationDept) {
      sanitationDept = await prisma.authorityDirectory.create({
        data: {
          name: 'Tiruchirappalli City Corporation Sanitation Wing',
          type: 'MUNICIPAL_CORPORATION',
          jurisdiction: 'Tiruchirappalli City Wards 10 - 25',
          city: 'Tiruchirappalli',
          state: 'Tamil Nadu',
          supportedCategories: 'SANITATION,SEWAGE',
          contactMethod: '1800-425-4300 | sanitation.trichy@tn.gov.in',
          isDemo: true,
        },
      });
    }

    // DEMO CASE 1: Road Pothole (RESOLVED)
    const code1 = 'MS-CIV-2026-00124';
    const beforeHash1 = crypto.createHash('sha256').update(`BEFORE-${code1}-2026-09-01`).digest('hex');
    const afterHash1 = crypto.createHash('sha256').update(`AFTER-${code1}-2026-09-06`).digest('hex');

    const case1Reasons = [
      '+ 8 independent citizen reports from nearby area',
      '+ 6 community confirmations verified',
      '+ Issue unresolved for 6 days',
      '+ Road & Pavement surface disruption (configured high operational priority)',
      '+ Proximity to public transit or high-footfall facility',
      '+ High evidence completeness (Geotagged photo + description)',
    ];

    const case1 = await prisma.civicReport.upsert({
      where: { reportCode: code1 },
      update: {
        status: CivicReportStatus.RESOLVED,
        priorityScore: 84.0,
        priorityLevel: PriorityLevel.URGENT_REVIEW,
        priorityReasons: JSON.stringify(case1Reasons),
        independentReportCount: 8,
        confirmationCount: 6,
        evidenceConfidence: 0.94,
        actionStartedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        actionType: 'BITUMEN_PATCHWORK',
        actionDescription: 'Trichy Roads Sub-Division deployed asphalt mixer truck for hot-mix bitumen filling & compaction.',
        assignedInspector: 'AE S. Sundaram (Trichy Roads)',
        isDemoAction: true,
        afterPhotoUrl: '/uploads/demo_pothole_repaired.jpg',
        afterLocationText: 'Near Main Bus Stand Junction, Tiruchirappalli, Tamil Nadu 620001',
        afterLatitude: 10.7905,
        afterLongitude: 78.7047,
        afterCapturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        afterEvidenceHash: afterHash1,
        afterActionNote: 'Deep pothole refilled with 80mm bituminous concrete layer and roller compacted. Road resurfaced smoothly.',
        aiComparisonResult: 'POSSIBLY_RESOLVED',
        aiComparisonConfidence: 0.88,
        aiComparisonObservations: JSON.stringify([
          'The asphalt surface shows continuous uniform paving compared to the original BEFORE photo.',
          'The visible 45cm deep depression is completely sealed with fresh bitumen.',
        ]),
        humanReverificationStatus: 'RESOLUTION_CONFIRMED',
        humanReverificationNote: 'Inspected on-site by Assistant Engineer S. Sundaram. Bitumen patch verified level and durable.',
        humanReverifiedBy: 'AE S. Sundaram (Trichy Roads)',
        humanReverifiedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        citizenReverificationStatus: 'APPEARS_RESOLVED',
        citizenReverificationComment: 'Road looks smooth now and traffic flows without delay. Thanks!',
        citizenReverifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolvedConfirmations: 5,
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      create: {
        reportCode: code1,
        citizenId: demoCitizen.id,
        photoUrl: '/uploads/demo_pothole_before.jpg',
        description: 'Deep 45cm pothole on main artery near Central Bus Stand causing heavy vehicle damage and traffic bottleneck.',
        latitude: 10.7905,
        longitude: 78.7047,
        locationText: 'Near Main Bus Stand Junction, Tiruchirappalli, Tamil Nadu 620001',
        category: CivicCategory.ROAD,
        issueType: 'POTHOLE',
        classificationConfidence: 0.94,
        classificationExplanation: 'Visual analysis identifies unpaved asphalt crater measuring ~45cm width.',
        authorityId: roadsDept.id,
        routingConfidence: 0.96,
        complaintText: 'FORMAL CIVIC COMPLAINT - ROAD DISRUPTION\nReport Code: MS-CIV-2026-00124\nTarget Authority: Trichy Roads & Highways Sub-Division (PWD)\nLocation: Near Main Bus Stand Junction, Tiruchirappalli\nCategory: Road & Pavement (Pothole)\n\nDear Executive Engineer,\nThis formal complaint requests urgent bitumen repair for a 45cm deep pothole located at Trichy Central Bus Stand Junction.',
        evidenceHash: beforeHash1,
        status: CivicReportStatus.RESOLVED,
        priorityScore: 84.0,
        priorityLevel: PriorityLevel.URGENT_REVIEW,
        priorityReasons: JSON.stringify(case1Reasons),
        independentReportCount: 8,
        confirmationCount: 6,
        evidenceConfidence: 0.94,
        actionStartedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        actionType: 'BITUMEN_PATCHWORK',
        actionDescription: 'Trichy Roads Sub-Division deployed asphalt mixer truck for hot-mix bitumen filling & compaction.',
        assignedInspector: 'AE S. Sundaram (Trichy Roads)',
        isDemoAction: true,
        afterPhotoUrl: '/uploads/demo_pothole_repaired.jpg',
        afterLocationText: 'Near Main Bus Stand Junction, Tiruchirappalli, Tamil Nadu 620001',
        afterLatitude: 10.7905,
        afterLongitude: 78.7047,
        afterCapturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        afterEvidenceHash: afterHash1,
        afterActionNote: 'Deep pothole refilled with 80mm bituminous concrete layer and roller compacted. Road resurfaced smoothly.',
        aiComparisonResult: 'POSSIBLY_RESOLVED',
        aiComparisonConfidence: 0.88,
        aiComparisonObservations: JSON.stringify([
          'The asphalt surface shows continuous uniform paving compared to the original BEFORE photo.',
          'The visible 45cm deep depression is completely sealed with fresh bitumen.',
        ]),
        humanReverificationStatus: 'RESOLUTION_CONFIRMED',
        humanReverificationNote: 'Inspected on-site by Assistant Engineer S. Sundaram. Bitumen patch verified level and durable.',
        humanReverifiedBy: 'AE S. Sundaram (Trichy Roads)',
        humanReverifiedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        citizenReverificationStatus: 'APPEARS_RESOLVED',
        citizenReverificationComment: 'Road looks smooth now and traffic flows without delay. Thanks!',
        citizenReverifiedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolvedConfirmations: 5,
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    });

    // Add Evidence Chain Items for Case 1
    await prisma.civicEvidenceItem.createMany({
      data: [
        {
          reportId: case1.id,
          stage: EvidenceStage.ORIGINAL_BEFORE,
          photoUrl: '/uploads/demo_pothole_before.jpg',
          latitude: 10.7905,
          longitude: 78.7047,
          hash: beforeHash1,
          uploadedBy: demoCitizen.id,
          notes: 'BEFORE — Original Citizen Evidence',
        },
        {
          reportId: case1.id,
          stage: EvidenceStage.AFTER,
          photoUrl: '/uploads/demo_pothole_repaired.jpg',
          latitude: 10.7905,
          longitude: 78.7047,
          hash: afterHash1,
          uploadedBy: 'AE S. Sundaram (Trichy Roads)',
          notes: 'AFTER — Repaired Road Surface Evidence',
        },
      ],
      skipDuplicates: true,
    });

    // DEMO CASE 2: Garbage Accumulation (REOPENED)
    const code2 = 'MS-CIV-2026-00125';
    const beforeHash2 = crypto.createHash('sha256').update(`BEFORE-${code2}-2026-09-02`).digest('hex');
    const afterHash2 = crypto.createHash('sha256').update(`AFTER-${code2}-2026-09-06`).digest('hex');

    const case2Reasons = [
      '+ 4 independent citizen reports from nearby area',
      '+ 3 community confirmations verified',
      '+ Issue unresolved for 4 days',
      '+ Sanitation / waste accumulation (high public health priority)',
      '+ Proximity to public vegetable market',
    ];

    const case2 = await prisma.civicReport.upsert({
      where: { reportCode: code2 },
      update: {
        status: CivicReportStatus.REOPENED,
        priorityScore: 62.0,
        priorityLevel: PriorityLevel.HIGH,
        priorityReasons: JSON.stringify(case2Reasons),
        independentReportCount: 4,
        confirmationCount: 3,
        evidenceConfidence: 0.88,
        actionStartedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        actionType: 'GARBAGE_CONTAINER_CLEARANCE',
        actionDescription: 'Tiruchirappalli City Corporation sanitation truck cleared primary waste bin.',
        assignedInspector: 'Sanitation Inspector M. Perumal',
        isDemoAction: true,
        afterPhotoUrl: '/uploads/demo_garbage_unresolved.jpg',
        afterLocationText: 'Opp Gandhi Market Gate 2, Tiruchirappalli, Tamil Nadu 620008',
        afterLatitude: 10.8158,
        afterLongitude: 78.6972,
        afterCapturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        afterEvidenceHash: afterHash2,
        afterActionNote: 'Sanitation bin emptied by truck. Overflowing litter on pavement remains uncleared.',
        aiComparisonResult: 'POSSIBLY_UNRESOLVED',
        aiComparisonConfidence: 0.76,
        aiComparisonObservations: JSON.stringify([
          'The primary dumpster container appears emptied.',
          'Significant uncollected organic waste and plastic litter remain scattered across adjacent pavement.',
        ]),
        humanReverificationStatus: 'ISSUE_STILL_PRESENT',
        humanReverificationNote: 'Inspector site audit confirmed surrounding sidewalk litter was not swept. Case REOPENED for secondary cleanup.',
        humanReverifiedBy: 'Sanitation Inspector M. Perumal',
        humanReverifiedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        citizenReverificationStatus: 'STILL_PRESENT',
        citizenReverificationComment: 'Container was emptied but garbage on sidewalk is still rotting.',
        citizenReverifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        stillPresentConfirmations: 3,
        reopenReason: 'Sanitation bin emptied but surrounding pavement litter remains uncleared.',
        reopenedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      create: {
        reportCode: code2,
        citizenId: demoCitizen.id,
        photoUrl: '/uploads/demo_garbage_before.jpg',
        description: 'Overflowing municipal garbage container spilling onto pedestrian walkway near Gandhi Market.',
        latitude: 10.8158,
        longitude: 78.6972,
        locationText: 'Opp Gandhi Market Gate 2, Tiruchirappalli, Tamil Nadu 620008',
        category: CivicCategory.SANITATION,
        issueType: 'GARBAGE_ACCUMULATION',
        classificationConfidence: 0.91,
        classificationExplanation: 'Visual analysis detects overflowing waste container and uncollected solid litter.',
        authorityId: sanitationDept.id,
        routingConfidence: 0.94,
        complaintText: 'FORMAL CIVIC COMPLAINT - SANITATION DISRUPTION\nReport Code: MS-CIV-2026-00125\nTarget Authority: Tiruchirappalli City Corporation Sanitation Wing\nLocation: Opp Gandhi Market Gate 2, Tiruchirappalli\nCategory: Sanitation & Garbage',
        evidenceHash: beforeHash2,
        status: CivicReportStatus.REOPENED,
        priorityScore: 62.0,
        priorityLevel: PriorityLevel.HIGH,
        priorityReasons: JSON.stringify(case2Reasons),
        independentReportCount: 4,
        confirmationCount: 3,
        evidenceConfidence: 0.88,
        actionStartedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        actionType: 'GARBAGE_CONTAINER_CLEARANCE',
        actionDescription: 'Tiruchirappalli City Corporation sanitation truck cleared primary waste bin.',
        assignedInspector: 'Sanitation Inspector M. Perumal',
        isDemoAction: true,
        afterPhotoUrl: '/uploads/demo_garbage_unresolved.jpg',
        afterLocationText: 'Opp Gandhi Market Gate 2, Tiruchirappalli, Tamil Nadu 620008',
        afterLatitude: 10.8158,
        afterLongitude: 78.6972,
        afterCapturedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        afterEvidenceHash: afterHash2,
        afterActionNote: 'Sanitation bin emptied by truck. Overflowing litter on pavement remains uncleared.',
        aiComparisonResult: 'POSSIBLY_UNRESOLVED',
        aiComparisonConfidence: 0.76,
        aiComparisonObservations: JSON.stringify([
          'The primary dumpster container appears emptied.',
          'Significant uncollected organic waste and plastic litter remain scattered across adjacent pavement.',
        ]),
        humanReverificationStatus: 'ISSUE_STILL_PRESENT',
        humanReverificationNote: 'Inspector site audit confirmed surrounding sidewalk litter was not swept. Case REOPENED for secondary cleanup.',
        humanReverifiedBy: 'Sanitation Inspector M. Perumal',
        humanReverifiedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        citizenReverificationStatus: 'STILL_PRESENT',
        citizenReverificationComment: 'Container was emptied but garbage on sidewalk is still rotting.',
        citizenReverifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        stillPresentConfirmations: 3,
        reopenReason: 'Sanitation bin emptied but surrounding pavement litter remains uncleared.',
        reopenedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    });

    // Add Evidence Chain Items for Case 2
    await prisma.civicEvidenceItem.createMany({
      data: [
        {
          reportId: case2.id,
          stage: EvidenceStage.ORIGINAL_BEFORE,
          photoUrl: '/uploads/demo_garbage_before.jpg',
          latitude: 10.8158,
          longitude: 78.6972,
          hash: beforeHash2,
          uploadedBy: demoCitizen.id,
          notes: 'BEFORE — Original Garbage Accumulation Evidence',
        },
        {
          reportId: case2.id,
          stage: EvidenceStage.AFTER,
          photoUrl: '/uploads/demo_garbage_unresolved.jpg',
          latitude: 10.8158,
          longitude: 78.6972,
          hash: afterHash2,
          uploadedBy: 'Sanitation Inspector M. Perumal',
          notes: 'AFTER — Incomplete Clearance Evidence',
        },
      ],
      skipDuplicates: true,
    });

    console.log('[SeedDemoCases] Successfully seeded Judge Demo Cases: MS-CIV-2026-00124 (RESOLVED) and MS-CIV-2026-00125 (REOPENED)');

    // 4. Seed Additional Heatmap Demo Reports across Trichy Hotspots
    const additionalDemoReports = [
      // Trichy Central Bus Stand Hotspot Cluster (10.7905, 78.6925)
      { code: 'MS-CIV-2026-00201', title: 'Deep Pothole near Central Bus Stand Platform 3', cat: CivicCategory.ROAD, lat: 10.7908, lng: 78.6923, score: 92, level: PriorityLevel.URGENT_REVIEW, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00202', title: 'Asphalt Pavement Damage on Bus Stand Approach Road', cat: CivicCategory.ROAD, lat: 10.7912, lng: 78.6927, score: 88, level: PriorityLevel.URGENT_REVIEW, status: CivicReportStatus.UNDER_REVIEW, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00203', title: 'Cracked Bitumen & Caved Pavement Section', cat: CivicCategory.ROAD, lat: 10.7902, lng: 78.6921, score: 85, level: PriorityLevel.URGENT_REVIEW, status: CivicReportStatus.ACTION_IN_PROGRESS, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00204', title: 'Storm Drain Opening Defect on Main Bus Stand Road', cat: CivicCategory.DRAINAGE, lat: 10.7906, lng: 78.6929, score: 81, level: PriorityLevel.URGENT_REVIEW, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00205', title: 'Sunken Road Section near Bus Stand Auto Stand', cat: CivicCategory.ROAD, lat: 10.7898, lng: 78.6918, score: 79, level: PriorityLevel.HIGH, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00206', title: 'Water Leakage from Supply Main near Ticket Counter', cat: CivicCategory.WATER_SUPPLY, lat: 10.7915, lng: 78.6931, score: 74, level: PriorityLevel.HIGH, status: CivicReportStatus.UNDER_REVIEW, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00207', title: 'Pothole Hazard near Collectorate Turn Road', cat: CivicCategory.ROAD, lat: 10.7895, lng: 78.6912, score: 72, level: PriorityLevel.HIGH, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00208', title: 'Damaged Divider Kerb Structure', cat: CivicCategory.ROAD, lat: 10.7918, lng: 78.6935, score: 68, level: PriorityLevel.HIGH, status: CivicReportStatus.ACTION_IN_PROGRESS, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00209', title: 'Failing Pavement Slabs near Pedestrian Sub-way', cat: CivicCategory.ROAD, lat: 10.7900, lng: 78.6920, score: 65, level: PriorityLevel.HIGH, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00210', title: 'Streetlight Cable Damage on Bus Entry Gate', cat: CivicCategory.STREETLIGHT, lat: 10.7910, lng: 78.6926, score: 58, level: PriorityLevel.HIGH, status: CivicReportStatus.RESOLVED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00211', title: 'Waste Dumping Overflow behind Platform Restrooms', cat: CivicCategory.SANITATION, lat: 10.7892, lng: 78.6910, score: 54, level: PriorityLevel.MEDIUM, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },
      { code: 'MS-CIV-2026-00212', title: 'Broken Concrete Slab over Culvert', cat: CivicCategory.DRAINAGE, lat: 10.7920, lng: 78.6938, score: 50, level: PriorityLevel.MEDIUM, status: CivicReportStatus.REPORTED, loc: 'Trichy Central Bus Stand, Ward 12' },

      // Chatram Bus Stand Hotspot Cluster (10.8290, 78.6935)
      { code: 'MS-CIV-2026-00301', title: 'Severe Stormwater Drain Blockage at Chatram North Street', cat: CivicCategory.DRAINAGE, lat: 10.8292, lng: 78.6937, score: 86, level: PriorityLevel.URGENT_REVIEW, status: CivicReportStatus.REPORTED, loc: 'Chatram Bus Stand Area, Ward 8' },
      { code: 'MS-CIV-2026-00302', title: 'Sewage Canal Overflow onto Pedestrian Walkway', cat: CivicCategory.SEWAGE, lat: 10.8288, lng: 78.6932, score: 83, level: PriorityLevel.URGENT_REVIEW, status: CivicReportStatus.ACTION_IN_PROGRESS, loc: 'Chatram Bus Stand Area, Ward 8' },
      { code: 'MS-CIV-2026-00303', title: 'Open Manhole Hazard near St. Joseph College Gate', cat: CivicCategory.SEWAGE, lat: 10.8295, lng: 78.6940, score: 78, level: PriorityLevel.HIGH, status: CivicReportStatus.REPORTED, loc: 'Chatram Bus Stand Area, Ward 8' },
      { code: 'MS-CIV-2026-00304', title: 'Water Pipe Burst near College Bus Stop', cat: CivicCategory.WATER_SUPPLY, lat: 10.8285, lng: 78.6928, score: 71, level: PriorityLevel.HIGH, status: CivicReportStatus.UNDER_REVIEW, loc: 'Chatram Bus Stand Area, Ward 8' },
      { code: 'MS-CIV-2026-00305', title: 'Clogged Monsoon Canal Outlet', cat: CivicCategory.DRAINAGE, lat: 10.8298, lng: 78.6942, score: 66, level: PriorityLevel.HIGH, status: CivicReportStatus.REPORTED, loc: 'Chatram Bus Stand Area, Ward 8' },
      { code: 'MS-CIV-2026-00306', title: 'Sub-surface Water Seepage under Asphalt', cat: CivicCategory.WATER_SUPPLY, lat: 10.8282, lng: 78.6925, score: 55, level: PriorityLevel.HIGH, status: CivicReportStatus.RESOLVED, loc: 'Chatram Bus Stand Area, Ward 8' },
      { code: 'MS-CIV-2026-00307', title: 'Garbage Dump near Canal Edge', cat: CivicCategory.SANITATION, lat: 10.8290, lng: 78.6935, score: 48, level: PriorityLevel.MEDIUM, status: CivicReportStatus.REPORTED, loc: 'Chatram Bus Stand Area, Ward 8' },

      // Main Guard Gate Cluster (10.8250, 78.6970)
      { code: 'MS-CIV-2026-00401', title: 'Non-functional High-Mast Streetlight at Gate Junction', cat: CivicCategory.STREETLIGHT, lat: 10.8252, lng: 78.6972, score: 64, level: PriorityLevel.HIGH, status: CivicReportStatus.REPORTED, loc: 'Main Guard Gate Area, Ward 4' },
      { code: 'MS-CIV-2026-00402', title: 'Garbage Accumulation near Market Entry Alley', cat: CivicCategory.SANITATION, lat: 10.8248, lng: 78.6968, score: 58, level: PriorityLevel.HIGH, status: CivicReportStatus.ACTION_IN_PROGRESS, loc: 'Main Guard Gate Area, Ward 4' },
      { code: 'MS-CIV-2026-00403', title: 'Flickering Streetlight Poles on Market Road', cat: CivicCategory.STREETLIGHT, lat: 10.8255, lng: 78.6975, score: 42, level: PriorityLevel.MEDIUM, status: CivicReportStatus.REPORTED, loc: 'Main Guard Gate Area, Ward 4' },
      { code: 'MS-CIV-2026-00404', title: 'Public Park Wall Plaster Deterioration', cat: CivicCategory.PUBLIC_BUILDING, lat: 10.8245, lng: 78.6965, score: 28, level: PriorityLevel.LOW, status: CivicReportStatus.RESOLVED, loc: 'Main Guard Gate Area, Ward 4' },
    ];

    for (const item of additionalDemoReports) {
      const existing = await prisma.civicReport.findFirst({
        where: { reportCode: item.code },
      });

      if (!existing) {
        await prisma.civicReport.create({
          data: {
            reportCode: item.code,
            category: item.cat,
            issueType: item.title.split(' ')[0].toUpperCase(),

            description: `${item.title} reported by local citizens. Geotagged and verified. [DEMO DATA]`,
            locationText: item.loc,
            latitude: item.lat,
            longitude: item.lng,
            citizenId: demoCitizen.id,
            authorityId: roadsDept?.id || sanitationDept?.id,
            status: item.status,
            priorityScore: item.score,
            priorityLevel: item.level,
            evidenceConfidence: 0.88,
            priorityReasons: JSON.stringify([
              `+ Concentrated citizen reports near ${item.loc}`,
              `+ Geotagged evidence verified`,
              `+ High operational priority for ${item.cat}`,
            ]),
            independentReportCount: item.score > 80 ? 8 : item.score > 60 ? 5 : 2,
            confirmationCount: Math.floor(item.score / 10),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 8 + 1) * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    console.log('[SeedDemoCases] Successfully seeded 23 additional Trichy Hotspot Demo Reports.');

    // 6. SEED CROSS-DEPARTMENT RELATIONSHIP RULES
    const defaultRels = [
      { primaryDomain: CivicCategory.WATER_SUPPLY, relatedDomain: CivicCategory.ROAD, relationshipType: 'POSSIBLE_IMPACT', description: 'Water leakage with visible road surface damage' },
      { primaryDomain: CivicCategory.DRAINAGE, relatedDomain: CivicCategory.ROAD, relationshipType: 'POSSIBLE_IMPACT', description: 'Drainage overflow affecting roadway' },
      { primaryDomain: CivicCategory.SEWAGE, relatedDomain: CivicCategory.ROAD, relationshipType: 'POSSIBLE_IMPACT', description: 'Sewage overflow affecting public roadway' },
      { primaryDomain: CivicCategory.SANITATION, relatedDomain: CivicCategory.DRAINAGE, relationshipType: 'CO_OCCURRENCE', description: 'Waste accumulation associated with blocked drainage' },
      { primaryDomain: CivicCategory.STREETLIGHT, relatedDomain: CivicCategory.ROAD, relationshipType: 'CO_OCCURRENCE', description: 'Streetlight infrastructure issue associated with road/public-space location' },
      { primaryDomain: CivicCategory.PUBLIC_BUILDING, relatedDomain: CivicCategory.WATER_SUPPLY, relationshipType: 'CO_OCCURRENCE', description: 'Visible water supply issue affecting public building premises' },
    ];

    for (const rel of defaultRels) {
      try {
        await prisma.domainRelationship.upsert({
          where: { primaryDomain_relatedDomain: { primaryDomain: rel.primaryDomain, relatedDomain: rel.relatedDomain } },
          update: { enabled: true, description: rel.description },
          create: {
            primaryDomain: rel.primaryDomain,
            relatedDomain: rel.relatedDomain,
            relationshipType: rel.relationshipType,
            description: rel.description,
            enabled: true,
            minimumConfidence: 0.60
          }
        });
      } catch (err) {
        // Table unseeded or SQLite fallback
      }
    }

    // 7. SEED CROSS-DEPARTMENT JUDGE DEMO CASES
    // Demo Case 1: MS-CIV-2026-142 (Drainage Overflow + Road Damage - Confirmed Coordinated Case)
    const codeCross1 = 'MS-CIV-2026-142';
    let cross1Report = await prisma.civicReport.findFirst({ where: { reportCode: codeCross1 } });
    if (!cross1Report) {
      try {
        cross1Report = await prisma.civicReport.create({
          data: {
            reportCode: codeCross1,
            citizenId: demoCitizen.id,
            category: CivicCategory.DRAINAGE,
            issueType: 'OVERFLOWING_DRAIN',
            description: 'Severe stormwater drain overflow resulting in standing water on road surface near Main Bus Stand. [DEMO DATA]',
            locationText: 'Main Bus Stand Outer Ring Road, Tiruchirappalli, Tamil Nadu 620001',
            latitude: 10.7908,
            longitude: 78.6912,
            authorityId: roadsDept?.id || null,
            status: CivicReportStatus.ACTION_IN_PROGRESS,
            priorityScore: 82.0,
            priorityLevel: PriorityLevel.URGENT_REVIEW,
            priorityReasons: JSON.stringify([
              '+ 5 independent citizen reports from nearby area',
              '+ Issue unresolved for 4 days',
              '+ Blocked drainage / stormwater canal (configured high operational priority)',
              '+ Coordinated review across two service domains'
            ]),
            actionStartedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            actionType: 'DRAIN_DESILTING_AND_ROAD_REASSESSMENT',
            actionDescription: 'Coordinated civic action plan: Municipal Drainage Unit clearing drain blockage followed by Road Engineering Unit pavement assessment.',
            assignedInspector: 'AE S. Sundaram (Coordinated Operations)',
            photoUrl: '/uploads/demo_drain_overflow.jpg'
          }
        });
      } catch (err) {
        // Fallback
      }
    }

    if (cross1Report) {
      // Seed domain assignments for Case 1
      try {
        const asgnDrain = await prisma.caseDomainAssignment.upsert({
          where: { id: `asgn-${cross1Report.id}-primary` },
          update: { status: 'CONFIRMED' },
          create: {
            id: `asgn-${cross1Report.id}-primary`,
            reportId: cross1Report.id,
            domain: CivicCategory.DRAINAGE,
            relationshipRole: 'PRIMARY',
            confidence: 0.91,
            reason: 'Primary issue detected as overflowing storm drain.',
            status: 'CONFIRMED',
            confirmedBy: demoCitizen.id,
            confirmedAt: new Date(),
            authorityId: sanitationDept?.id || null
          }
        });

        const asgnRoad = await prisma.caseDomainAssignment.upsert({
          where: { id: `asgn-${cross1Report.id}-rel-ROAD` },
          update: { status: 'CONFIRMED' },
          create: {
            id: `asgn-${cross1Report.id}-rel-ROAD`,
            reportId: cross1Report.id,
            domain: CivicCategory.ROAD,
            relationshipRole: 'RELATED',
            confidence: 0.85,
            reason: 'Standing water and visible road-surface damage appear together in the submitted evidence.',
            status: 'CONFIRMED',
            confirmedBy: demoCitizen.id,
            confirmedAt: new Date(),
            authorityId: roadsDept?.id || null
          }
        });

        // Tasks for Case 1
        const task1 = await prisma.caseDomainTask.upsert({
          where: { id: `task-${cross1Report.id}-1` },
          update: { status: 'COMPLETED' },
          create: {
            id: `task-${cross1Report.id}-1`,
            reportId: cross1Report.id,
            domainAssignmentId: asgnDrain.id,
            domain: CivicCategory.DRAINAGE,
            title: 'Drainage Review & Clearance',
            action: 'Desilt clogged roadside drain channel and restore stormwater flow.',
            status: 'COMPLETED',
            sequence: 1,
            assignedAuthorityId: sanitationDept?.id || null,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            notes: 'Drainage channel cleared of silt and standing water receded.'
          }
        });

        await prisma.caseDomainTask.upsert({
          where: { id: `task-${cross1Report.id}-2` },
          update: { status: 'IN_PROGRESS' },
          create: {
            id: `task-${cross1Report.id}-2`,
            reportId: cross1Report.id,
            domainAssignmentId: asgnRoad.id,
            domain: CivicCategory.ROAD,
            title: 'Road Surface Reassessment & Patching',
            action: 'Inspect road surface pavement after drainage issue is addressed and execute patching.',
            status: 'IN_PROGRESS',
            sequence: 2,
            dependsOnTaskId: task1.id,
            assignedAuthorityId: roadsDept?.id || null,
            notes: 'Road crew scheduled for asphalt compaction following drain clearance.'
          }
        });
      } catch (err) {
        // Fallback
      }
    }

    // Demo Case 2: MS-CIV-2026-143 (Water Leakage + Road Damage)
    const codeCross2 = 'MS-CIV-2026-143';
    let cross2Report = await prisma.civicReport.findFirst({ where: { reportCode: codeCross2 } });
    if (!cross2Report) {
      try {
        cross2Report = await prisma.civicReport.create({
          data: {
            reportCode: codeCross2,
            citizenId: demoCitizen.id,
            category: CivicCategory.WATER_SUPPLY,
            issueType: 'WATER_LEAKAGE',
            description: 'Underground main water pipe leakage creating continuous water accumulation on asphalt road near Thillai Nagar. [DEMO DATA]',
            locationText: '11th Cross, Thillai Nagar, Tiruchirappalli, Tamil Nadu 620018',
            latitude: 10.8210,
            longitude: 78.6880,
            authorityId: roadsDept?.id || null,
            status: CivicReportStatus.UNDER_REVIEW,
            priorityScore: 78.0,
            priorityLevel: PriorityLevel.HIGH,
            priorityReasons: JSON.stringify([
              '+ Essential water supply / pipe leakage (configured high operational priority)',
              '+ Coordinated review across two service domains'
            ]),
            photoUrl: '/uploads/demo_water_leak.jpg'
          }
        });
      } catch (err) {}
    }

    if (cross2Report) {
      try {
        await prisma.caseDomainAssignment.upsert({
          where: { id: `asgn-${cross2Report.id}-primary` },
          update: {},
          create: {
            id: `asgn-${cross2Report.id}-primary`,
            reportId: cross2Report.id,
            domain: CivicCategory.WATER_SUPPLY,
            relationshipRole: 'PRIMARY',
            confidence: 0.88,
            reason: 'Water main pipe leak detected.',
            status: 'SUGGESTED',
            authorityId: roadsDept?.id || null
          }
        });

        await prisma.caseDomainAssignment.upsert({
          where: { id: `asgn-${cross2Report.id}-rel-ROAD` },
          update: {},
          create: {
            id: `asgn-${cross2Report.id}-rel-ROAD`,
            reportId: cross2Report.id,
            domain: CivicCategory.ROAD,
            relationshipRole: 'RELATED',
            confidence: 0.82,
            reason: 'Water leakage with visible road surface impact observed in submitted evidence.',
            status: 'SUGGESTED',
            authorityId: roadsDept?.id || null
          }
        });
      } catch (err) {}
    }

    // Demo Case 3: MS-CIV-2026-144 (False-Positive Rejection Demo Case)
    const codeCross3 = 'MS-CIV-2026-144';
    let cross3Report = await prisma.civicReport.findFirst({ where: { reportCode: codeCross3 } });
    if (!cross3Report) {
      try {
        cross3Report = await prisma.civicReport.create({
          data: {
            reportCode: codeCross3,
            citizenId: demoCitizen.id,
            category: CivicCategory.ROAD,
            issueType: 'POTHOLE',
            description: 'Road surface pothole near Salai Road junction. System suggested potential drainage relation. [DEMO DATA]',
            locationText: 'Salai Road Junction, Tiruchirappalli, Tamil Nadu 620018',
            latitude: 10.8240,
            longitude: 78.6895,
            authorityId: roadsDept?.id || null,
            status: CivicReportStatus.UNDER_REVIEW,
            priorityScore: 62.0,
            priorityLevel: PriorityLevel.HIGH,
            photoUrl: '/uploads/demo_road_only.jpg'
          }
        });
      } catch (err) {}
    }

    if (cross3Report) {
      try {
        await prisma.caseDomainAssignment.upsert({
          where: { id: `asgn-${cross3Report.id}-primary` },
          update: {},
          create: {
            id: `asgn-${cross3Report.id}-primary`,
            reportId: cross3Report.id,
            domain: CivicCategory.ROAD,
            relationshipRole: 'PRIMARY',
            confidence: 0.88,
            reason: 'Primary road surface damage.',
            status: 'CONFIRMED',
            authorityId: roadsDept?.id || null
          }
        });

        await prisma.caseDomainAssignment.upsert({
          where: { id: `asgn-${cross3Report.id}-rel-DRAINAGE` },
          update: { status: 'REJECTED' },
          create: {
            id: `asgn-${cross3Report.id}-rel-DRAINAGE`,
            reportId: cross3Report.id,
            domain: CivicCategory.DRAINAGE,
            relationshipRole: 'RELATED',
            confidence: 0.65,
            reason: 'Standing water suggested drainage involvement.',
            status: 'REJECTED',
            confirmedBy: demoCitizen.id,
            confirmedAt: new Date(),
            rejectionReason: 'No drainage involvement observed during physical inspection. Pothole caused purely by heavy vehicle traffic wear.',
            authorityId: sanitationDept?.id || null
          }
        });
      } catch (err) {}
    }

    console.log('[SeedDemoCases] Successfully seeded 3 Cross-Department Judge Demo Cases.');
  } catch (err) {
    console.error('[SeedDemoCases] Error seeding judge demo cases:', err);
  }
}

