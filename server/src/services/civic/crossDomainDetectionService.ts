import { PrismaClient, CivicCategory, DomainAssignmentRole, DomainAssignmentStatus, DomainTaskStatus } from '@prisma/client';
import { routeAuthority, DEMO_AUTHORITY_DIRECTORY, AuthorityRecord } from './authorityRouter';

const prisma = new PrismaClient();

export interface ConfiguredDomainRelationship {
  id: string;
  primaryDomain: CivicCategory;
  relatedDomain: CivicCategory;
  relationshipType: string;
  description: string;
  enabled: boolean;
  minimumConfidence: number;
}

export interface RelatedDomainSuggestion {
  domain: CivicCategory;
  confidence: number;
  reason: string;
  relationshipType: string;
  mappedAuthority?: AuthorityRecord;
}

export interface CrossDomainDetectionResult {
  primaryDomain: CivicCategory;
  primaryConfidence: number;
  isMultiDomain: boolean;
  relatedDomains: RelatedDomainSuggestion[];
  observations: string[];
}

export interface InMemDomainAssignment {
  id: string;
  reportId: string;
  domain: CivicCategory;
  relationshipRole: DomainAssignmentRole;
  confidence: number;
  reason: string;
  status: DomainAssignmentStatus;
  confirmedBy?: string;
  confirmedAt?: Date;
  rejectionReason?: string;
  authorityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemDomainTask {
  id: string;
  reportId: string;
  domainAssignmentId?: string;
  domain: CivicCategory;
  title: string;
  action: string;
  status: DomainTaskStatus;
  sequence: number;
  dependsOnTaskId?: string;
  assignedAuthorityId?: string;
  assignedInspector?: string;
  beforeProofUrl?: string;
  afterProofUrl?: string;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Default in-memory relationship rules
export const DEFAULT_DOMAIN_RELATIONSHIPS: ConfiguredDomainRelationship[] = [
  {
    id: 'rel-water-road',
    primaryDomain: 'WATER_SUPPLY',
    relatedDomain: 'ROAD',
    relationshipType: 'POSSIBLE_IMPACT',
    description: 'Water leakage and visible road-surface damage appear together in submitted evidence.',
    enabled: true,
    minimumConfidence: 0.60
  },
  {
    id: 'rel-drainage-road',
    primaryDomain: 'DRAINAGE',
    relatedDomain: 'ROAD',
    relationshipType: 'POSSIBLE_IMPACT',
    description: 'Standing water and visible road-surface damage appear together in submitted evidence.',
    enabled: true,
    minimumConfidence: 0.60
  },
  {
    id: 'rel-sewage-road',
    primaryDomain: 'SEWAGE',
    relatedDomain: 'ROAD',
    relationshipType: 'POSSIBLE_IMPACT',
    description: 'Sewage overflow and roadway area coincide in submitted evidence.',
    enabled: true,
    minimumConfidence: 0.60
  },
  {
    id: 'rel-sanitation-drainage',
    primaryDomain: 'SANITATION',
    relatedDomain: 'DRAINAGE',
    relationshipType: 'CO_OCCURRENCE',
    description: 'Waste accumulation is observed adjacent to drainage infrastructure in submitted evidence.',
    enabled: true,
    minimumConfidence: 0.60
  },
  {
    id: 'rel-streetlight-road',
    primaryDomain: 'STREETLIGHT',
    relatedDomain: 'ROAD',
    relationshipType: 'CO_OCCURRENCE',
    description: 'Streetlight infrastructure issue associated with roadway location.',
    enabled: true,
    minimumConfidence: 0.60
  },
  {
    id: 'rel-building-water',
    primaryDomain: 'PUBLIC_BUILDING',
    relatedDomain: 'WATER_SUPPLY',
    relationshipType: 'CO_OCCURRENCE',
    description: 'Visible water supply issue affecting public building premises.',
    enabled: true,
    minimumConfidence: 0.60
  }
];

// Global in-memory fallback stores
export const inMemoryDomainAssignments: InMemDomainAssignment[] = [
  {
    id: 'asgn-MS-CIV-2026-142-primary',
    reportId: 'MS-CIV-2026-142',
    domain: 'DRAINAGE',
    relationshipRole: 'PRIMARY',
    confidence: 0.91,
    reason: 'Primary issue detected as overflowing storm drain.',
    status: 'CONFIRMED',
    authorityId: 'auth-sanitation-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'asgn-MS-CIV-2026-142-rel-ROAD',
    reportId: 'MS-CIV-2026-142',
    domain: 'ROAD',
    relationshipRole: 'RELATED',
    confidence: 0.85,
    reason: 'Standing water and visible road-surface damage appear together in the submitted evidence.',
    status: 'CONFIRMED',
    authorityId: 'auth-roads-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'asgn-MS-CIV-2026-143-primary',
    reportId: 'MS-CIV-2026-143',
    domain: 'WATER_SUPPLY',
    relationshipRole: 'PRIMARY',
    confidence: 0.88,
    reason: 'Water main pipe leak detected.',
    status: 'SUGGESTED',
    authorityId: 'auth-water-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'asgn-MS-CIV-2026-143-rel-ROAD',
    reportId: 'MS-CIV-2026-143',
    domain: 'ROAD',
    relationshipRole: 'RELATED',
    confidence: 0.82,
    reason: 'Water leakage with visible road surface impact observed in submitted evidence.',
    status: 'SUGGESTED',
    authorityId: 'auth-roads-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'asgn-MS-CIV-2026-144-primary',
    reportId: 'MS-CIV-2026-144',
    domain: 'ROAD',
    relationshipRole: 'PRIMARY',
    confidence: 0.88,
    reason: 'Primary road surface damage.',
    status: 'CONFIRMED',
    authorityId: 'auth-roads-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'asgn-MS-CIV-2026-144-rel-DRAINAGE',
    reportId: 'MS-CIV-2026-144',
    domain: 'DRAINAGE',
    relationshipRole: 'RELATED',
    confidence: 0.65,
    reason: 'Standing water suggested drainage involvement.',
    status: 'REJECTED',
    rejectionReason: 'No drainage involvement observed during physical inspection. Pothole caused purely by heavy vehicle traffic wear.',
    authorityId: 'auth-sanitation-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const inMemoryDomainTasks: InMemDomainTask[] = [
  {
    id: 'task-MS-CIV-2026-142-1',
    reportId: 'MS-CIV-2026-142',
    domainAssignmentId: 'asgn-MS-CIV-2026-142-primary',
    domain: 'DRAINAGE',
    title: 'Drainage Review & Clearance',
    action: 'Desilt clogged roadside drain channel and restore stormwater flow.',
    status: 'COMPLETED',
    sequence: 1,
    assignedAuthorityId: 'auth-sanitation-1',
    completedAt: new Date(),
    notes: 'Drainage channel cleared of silt and standing water receded.',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task-MS-CIV-2026-142-2',
    reportId: 'MS-CIV-2026-142',
    domainAssignmentId: 'asgn-MS-CIV-2026-142-rel-ROAD',
    domain: 'ROAD',
    title: 'Road Surface Reassessment & Patching',
    action: 'Inspect road surface pavement after drainage issue is addressed and execute patching.',
    status: 'IN_PROGRESS',
    sequence: 2,
    dependsOnTaskId: 'task-MS-CIV-2026-142-1',
    assignedAuthorityId: 'auth-roads-1',
    notes: 'Road crew scheduled for asphalt compaction following drain clearance.',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];


/**
 * CrossDomainDetectionService - Handles non-accusatory cross-department case detection,
 * relationship rule loading, candidate authority routing, and task graph generation.
 */
export class CrossDomainDetectionService {
  /**
   * Fetches active relationship rules from DB or returns fallback defaults
   */
  static async getRelationships(): Promise<ConfiguredDomainRelationship[]> {
    try {
      const dbRels = await prisma.domainRelationship.findMany({ where: { enabled: true } });
      if (dbRels && dbRels.length > 0) {
        return dbRels.map(r => ({
          id: r.id,
          primaryDomain: r.primaryDomain,
          relatedDomain: r.relatedDomain,
          relationshipType: r.relationshipType,
          description: r.description,
          enabled: r.enabled,
          minimumConfidence: r.minimumConfidence ?? 0.60
        }));
      }
    } catch (err) {
      // DB query failed or table not seeded yet
    }
    return DEFAULT_DOMAIN_RELATIONSHIPS;
  }

  /**
   * Detects candidate related domains based on primary domain, user description, and AI observations.
   * STRICT SAFETY RULE: Never infers blame or causation ("Department X caused this").
   */
  static async detectRelatedDomains(params: {
    primaryDomain: CivicCategory;
    primaryConfidence?: number;
    description?: string;
    locationText?: string;
    customAuthorities?: AuthorityRecord[];
  }): Promise<CrossDomainDetectionResult> {
    const { primaryDomain, primaryConfidence = 0.88, description = '', locationText = '', customAuthorities } = params;
    const textLower = description.toLowerCase();
    const relationships = await this.getRelationships();
    const authorities = customAuthorities || DEMO_AUTHORITY_DIRECTORY;

    const candidateMatches = relationships.filter(r => r.primaryDomain === primaryDomain && r.enabled);
    const relatedDomains: RelatedDomainSuggestion[] = [];
    const observations: string[] = [`Primary civic domain detected as ${primaryDomain}.`];

    for (const match of candidateMatches) {
      let isRelevant = false;
      let reason = match.description;
      let matchConfidence = 0.76;

      // Heuristic context matching to elevate confidence
      if (primaryDomain === 'DRAINAGE' && match.relatedDomain === 'ROAD') {
        isRelevant = true; // Always evaluate potential road interaction for drainage issues
        if (textLower.includes('road') || textLower.includes('pothole') || textLower.includes('water') || textLower.includes('street')) {
          matchConfidence = 0.85;
          reason = 'Standing water and visible road-surface damage appear together in the submitted evidence.';
          observations.push('Observable standing water appears to affect adjacent roadway surface.');
        }
      } else if (primaryDomain === 'WATER_SUPPLY' && match.relatedDomain === 'ROAD') {
        isRelevant = true;
        if (textLower.includes('leak') || textLower.includes('road') || textLower.includes('tarmac') || textLower.includes('pavement')) {
          matchConfidence = 0.82;
          reason = 'Water leakage with visible road surface impact observed in submitted evidence.';
          observations.push('Water accumulation coincides with road surface infrastructure.');
        }
      } else if (primaryDomain === 'SEWAGE' && match.relatedDomain === 'ROAD') {
        isRelevant = true;
        reason = 'Sewage overflow affects public roadway area in submitted evidence.';
        observations.push('Sewage overflow observed adjacent to roadway area.');
      } else if (primaryDomain === 'SANITATION' && match.relatedDomain === 'DRAINAGE') {
        if (textLower.includes('drain') || textLower.includes('clog') || textLower.includes('water') || textLower.includes('block')) {
          isRelevant = true;
          matchConfidence = 0.80;
          reason = 'Waste accumulation is associated with blocked drainage infrastructure in submitted evidence.';
          observations.push('Litter/waste observed obstructing storm drain.');
        }
      } else if (primaryDomain === 'STREETLIGHT' && match.relatedDomain === 'ROAD') {
        if (textLower.includes('road') || textLower.includes('street') || textLower.includes('dark')) {
          isRelevant = true;
          matchConfidence = 0.72;
          reason = 'Streetlight infrastructure issue associated with public roadway location.';
        }
      } else if (primaryDomain === 'PUBLIC_BUILDING' && match.relatedDomain === 'WATER_SUPPLY') {
        if (textLower.includes('water') || textLower.includes('pipe') || textLower.includes('leak')) {
          isRelevant = true;
          matchConfidence = 0.75;
          reason = 'Visible water supply issue affecting public building infrastructure.';
        }
      }

      if (isRelevant) {
        // Find mapped authority from AuthorityDirectory (NEVER invent department names)
        const authorityResult = routeAuthority({
          category: match.relatedDomain as any,
          locationText,
          customDirectory: authorities
        });

        relatedDomains.push({
          domain: match.relatedDomain,
          confidence: matchConfidence,
          reason,
          relationshipType: match.relationshipType,
          mappedAuthority: authorityResult.authority || undefined
        });
      }
    }

    return {
      primaryDomain,
      primaryConfidence,
      isMultiDomain: relatedDomains.length > 0,
      relatedDomains,
      observations
    };
  }

  /**
   * Initializes case domain assignments and sequential action tasks for a CivicReport.
   * ONE CivicReport -> Multiple normalized CaseDomainAssignments + CaseDomainTasks.
   */
  static async createCoordinatedCase(params: {
    reportId: string;
    primaryDomain: CivicCategory;
    primaryReason?: string;
    primaryAuthorityId?: string;
    relatedSuggestions?: RelatedDomainSuggestion[];
    citizenConfirmed?: boolean;
  }): Promise<{ assignments: any[]; tasks: any[] }> {
    const { reportId, primaryDomain, primaryReason, primaryAuthorityId, relatedSuggestions = [], citizenConfirmed = false } = params;

    const createdAssignments: any[] = [];
    const createdTasks: any[] = [];

    // 1. Primary Assignment
    const primaryStatus = citizenConfirmed ? 'CONFIRMED' : 'SUGGESTED';
    const primaryAssignmentData = {
      reportId,
      domain: primaryDomain,
      relationshipRole: 'PRIMARY' as DomainAssignmentRole,
      confidence: 0.90,
      reason: primaryReason || `Primary issue domain identified as ${primaryDomain}.`,
      status: primaryStatus as DomainAssignmentStatus,
      authorityId: primaryAuthorityId || null,
      confirmedAt: citizenConfirmed ? new Date() : null,
    };

    let primaryAssignmentId = `asgn-${reportId}-primary`;
    try {
      const dbPrimary = await prisma.caseDomainAssignment.create({ data: primaryAssignmentData });
      primaryAssignmentId = dbPrimary.id;
      createdAssignments.push(dbPrimary);
    } catch (err) {
      // In-memory fallback
      const inMemPrimary: InMemDomainAssignment = {
        id: primaryAssignmentId,
        ...primaryAssignmentData,
        authorityId: primaryAuthorityId || undefined,
        confirmedAt: citizenConfirmed ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDomainAssignments.push(inMemPrimary);
      createdAssignments.push(inMemPrimary);
    }

    // 2. Primary Domain Action Task (Sequence 1)
    const primaryTaskAction = getActionForDomain(primaryDomain, 'PRIMARY');
    const primaryTaskData = {
      reportId,
      domainAssignmentId: primaryAssignmentId,
      domain: primaryDomain,
      title: `${formatCategoryName(primaryDomain)} Review & Resolution`,
      action: primaryTaskAction,
      status: 'IN_PROGRESS' as DomainTaskStatus,
      sequence: 1,
      assignedAuthorityId: primaryAuthorityId || null,
    };

    let primaryTaskId = `task-${reportId}-1`;
    try {
      const dbTask1 = await prisma.caseDomainTask.create({ data: primaryTaskData });
      primaryTaskId = dbTask1.id;
      createdTasks.push(dbTask1);
    } catch (err) {
      const inMemTask1: InMemDomainTask = {
        id: primaryTaskId,
        ...primaryTaskData,
        assignedAuthorityId: primaryAuthorityId || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDomainTasks.push(inMemTask1);
      createdTasks.push(inMemTask1);
    }

    // 3. Related Domain Assignments & Dependent Tasks (Sequence 2, 3...)
    let currentSeq = 2;
    let previousTaskId = primaryTaskId;

    for (const rel of relatedSuggestions) {
      const relatedAssignmentData = {
        reportId,
        domain: rel.domain,
        relationshipRole: 'RELATED' as DomainAssignmentRole,
        confidence: rel.confidence,
        reason: rel.reason,
        status: citizenConfirmed ? ('CONFIRMED' as DomainAssignmentStatus) : ('SUGGESTED' as DomainAssignmentStatus),
        authorityId: rel.mappedAuthority?.id || null,
        confirmedAt: citizenConfirmed ? new Date() : null,
      };

      let relAssignmentId = `asgn-${reportId}-rel-${rel.domain}`;
      try {
        const dbRel = await prisma.caseDomainAssignment.create({ data: relatedAssignmentData });
        relAssignmentId = dbRel.id;
        createdAssignments.push(dbRel);
      } catch (err) {
        const inMemRel: InMemDomainAssignment = {
          id: relAssignmentId,
          ...relatedAssignmentData,
          authorityId: rel.mappedAuthority?.id || undefined,
          confirmedAt: citizenConfirmed ? new Date() : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryDomainAssignments.push(inMemRel);
        createdAssignments.push(inMemRel);
      }

      // Related Task depends on Primary Task (Sequence 2)
      const relatedTaskAction = getActionForDomain(rel.domain, 'RELATED');
      const relatedTaskData = {
        reportId,
        domainAssignmentId: relAssignmentId,
        domain: rel.domain,
        title: `${formatCategoryName(rel.domain)} Surface & Infrastructure Reassessment`,
        action: relatedTaskAction,
        status: 'PENDING' as DomainTaskStatus,
        sequence: currentSeq,
        dependsOnTaskId: previousTaskId,
        assignedAuthorityId: rel.mappedAuthority?.id || null,
      };

      let relTaskId = `task-${reportId}-${currentSeq}`;
      try {
        const dbTask2 = await prisma.caseDomainTask.create({ data: relatedTaskData });
        createdTasks.push(dbTask2);
      } catch (err) {
        const inMemTask2: InMemDomainTask = {
          id: relTaskId,
          ...relatedTaskData,
          assignedAuthorityId: rel.mappedAuthority?.id || undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryDomainTasks.push(inMemTask2);
        createdTasks.push(inMemTask2);
      }

      currentSeq++;
    }

    return { assignments: createdAssignments, tasks: createdTasks };
  }
}

/**
 * Helper to produce standard non-judgmental action text for domain tasks
 */
function getActionForDomain(domain: CivicCategory, role: 'PRIMARY' | 'RELATED'): string {
  if (role === 'PRIMARY') {
    switch (domain) {
      case 'DRAINAGE': return 'Clear drain blockage and resolve standing water.';
      case 'WATER_SUPPLY': return 'Repair pipeline leak and secure water supply infrastructure.';
      case 'SEWAGE': return 'Inspect manhole and clear sewage overflow blockage.';
      case 'SANITATION': return 'Clear accumulated waste dump and sanitize site.';
      case 'ROAD': return 'Repair surface damage and patch road pavement.';
      case 'STREETLIGHT': return 'Repair electrical wiring and replace damaged street lamp.';
      default: return 'Inspect primary civic issue and initiate field resolution.';
    }
  } else {
    switch (domain) {
      case 'ROAD': return 'Inspect and repair road surface pavement after primary infrastructure work is addressed.';
      case 'DRAINAGE': return 'Reassess roadside drain channels after primary surface repairs.';
      case 'WATER_SUPPLY': return 'Inspect nearby supply valves and pipe connections following site work.';
      case 'SANITATION': return 'Perform secondary site clearance after main infrastructure repair.';
      default: return 'Inspect related infrastructure after primary resolution completes.';
    }
  }
}

/**
 * Format category enum to human readable string
 */
export function formatCategoryName(domain: CivicCategory | string): string {
  switch (domain) {
    case 'ROAD': return 'Road Infrastructure';
    case 'WATER_SUPPLY': return 'Water Supply';
    case 'DRAINAGE': return 'Drainage System';
    case 'SANITATION': return 'Sanitation & Waste';
    case 'STREETLIGHT': return 'Street Lighting';
    case 'SEWAGE': return 'Sewage Infrastructure';
    case 'PUBLIC_BUILDING': return 'Public Building';
    case 'PUBLIC_SPACE': return 'Public Space';
    default: return String(domain).replace('_', ' ');
  }
}
