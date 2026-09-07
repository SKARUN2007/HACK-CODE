import { PrismaClient, PriorityLevel, CivicCategory } from '@prisma/client';
import { createChainedAuditLog } from '../../utils/auditLogger';

const prisma = new PrismaClient();

export interface PriorityCalculationResult {
  priorityScore: number; // 0–100
  priorityLevel: PriorityLevel;
  reasons: string[];
  evidenceConfidence: number; // 0–100
  version: string;
}

export interface PriorityInputSignals {
  independentReportCount?: number;
  confirmationCount?: number;
  createdAt?: Date;
  category?: CivicCategory | string;
  locationText?: string;
  hasPhoto?: boolean;
  hasVoice?: boolean;
  hasLocation?: boolean;
  hasDescription?: boolean;
  hasCrossDomain?: boolean;
}

/**
 * PriorityEngine: Calculates an explainable ACTION PRIORITY SCORE (0–100)
 * based on validated system signals.
 * 
 * IMPORTANT:
 * - Systems prioritizes review attention based on operational signals.
 * - DOES NOT declare cases dangerous, illegal, or corrupt.
 * - Deterministic, explainable, and works 100% without external AI APIs.
 */
export function calculatePriorityScore(signals: PriorityInputSignals): PriorityCalculationResult {
  let rawScore = 0;
  const reasons: string[] = [];

  // 1. Independent Reports Signal (Max 35 points)
  const count = Math.max(1, signals.independentReportCount || 1);
  let reportPts = 10;
  if (count >= 8) reportPts = 35;
  else if (count >= 5) reportPts = 28;
  else if (count >= 3) reportPts = 20;
  else if (count >= 2) reportPts = 14;

  rawScore += reportPts;
  if (count > 1) {
    reasons.push(`+ ${count} independent citizen reports from nearby area`);
  } else {
    reasons.push(`+ Initial citizen report received`);
  }

  // 2. Citizen Confirmations Signal (Max 20 points)
  const confirmations = Math.max(0, signals.confirmationCount || 0);
  const confirmPts = Math.min(20, confirmations * 3.5);
  rawScore += confirmPts;
  if (confirmations > 0) {
    reasons.push(`+ ${confirmations} community confirmations verified`);
  }

  // 3. Unresolved Report Age Signal (Max 20 points)
  const created = signals.createdAt ? new Date(signals.createdAt) : new Date();
  const ageDays = Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
  const agePts = Math.min(20, ageDays * 3.5);
  rawScore += agePts;
  if (ageDays >= 1) {
    reasons.push(`+ Issue unresolved for ${ageDays} ${ageDays === 1 ? 'day' : 'days'}`);
  }

  // 4. Category Operational Weight Signal (Max 18 points)
  const cat = (signals.category || 'OTHER').toString().toUpperCase();
  let catPts = 10;
  let catLabel = 'Civic issue';

  switch (cat) {
    case 'ROAD':
      catPts = 16;
      catLabel = 'Road & Pavement surface disruption';
      break;
    case 'WATER_SUPPLY':
      catPts = 18;
      catLabel = 'Essential water supply / pipe leakage';
      break;
    case 'SEWAGE':
      catPts = 18;
      catLabel = 'Sewage overflow / manhole hazard';
      break;
    case 'DRAINAGE':
      catPts = 16;
      catLabel = 'Blocked drainage / stormwater canal';
      break;
    case 'SANITATION':
      catPts = 14;
      catLabel = 'Sanitation / waste accumulation';
      break;
    case 'STREETLIGHT':
      catPts = 12;
      catLabel = 'Streetlight & public lighting maintenance';
      break;
    case 'PUBLIC_BUILDING':
      catPts = 12;
      catLabel = 'Public building structural maintenance';
      break;
    case 'PUBLIC_SPACE':
      catPts = 10;
      catLabel = 'Public park / amenity maintenance';
      break;
    default:
      catPts = 8;
      catLabel = 'General civic report';
      break;
  }

  rawScore += catPts;
  reasons.push(`+ ${catLabel} (configured high operational priority)`);

  // 5. Public Location Proximity Signal (Max 10 points)
  const loc = (signals.locationText || '').toLowerCase();
  const publicKeywords = ['bus', 'stand', 'station', 'school', 'hospital', 'market', 'main road', 'junction', 'park', 'temple', 'college'];
  const matchesPublic = publicKeywords.some((k) => loc.includes(k));
  if (matchesPublic) {
    rawScore += 10;
    reasons.push(`+ Proximity to public transit or high-footfall facility`);
  }

  // 6. Cross-Department Coordinated Review Signal (Max 10 points)
  if (signals.hasCrossDomain) {
    rawScore += 10;
    reasons.push(`+ Coordinated review across two service domains`);
  }

  // 7. Evidence Completeness Signal (Max 7 points)
  let evidencePts = 0;
  if (signals.hasPhoto) evidencePts += 3;
  if (signals.hasLocation) evidencePts += 2;
  if (signals.hasDescription || signals.hasVoice) evidencePts += 2;
  rawScore += evidencePts;
  if (evidencePts >= 5) {
    reasons.push(`+ High evidence completeness (Geotagged photo + description)`);
  }


  // Final score normalized to 0–100
  const priorityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determine Level Thresholds:
  // 0–29 = LOW, 30–54 = MEDIUM, 55–79 = HIGH, 80–100 = URGENT_REVIEW
  let priorityLevel: PriorityLevel = PriorityLevel.LOW;
  if (priorityScore >= 80) {
    priorityLevel = PriorityLevel.URGENT_REVIEW;
  } else if (priorityScore >= 55) {
    priorityLevel = PriorityLevel.HIGH;
  } else if (priorityScore >= 30) {
    priorityLevel = PriorityLevel.MEDIUM;
  } else {
    priorityLevel = PriorityLevel.LOW;
  }

  // Calculate Separate Evidence Confidence Score (0–100)
  let confidencePts = 70;
  if (signals.hasPhoto) confidencePts += 15;
  if (signals.hasLocation) confidencePts += 10;
  if (signals.hasVoice || signals.hasDescription) confidencePts += 5;
  const evidenceConfidence = Math.min(98, confidencePts);

  return {
    priorityScore,
    priorityLevel,
    reasons,
    evidenceConfidence,
    version: '1.0',
  };
}

/**
 * Recalculate priority score for a Civic Report and save to DB + Audit Log
 */
export async function recalculateReportPriority(reportId: string): Promise<PriorityCalculationResult | null> {
  const report = await prisma.civicReport.findUnique({
    where: { id: reportId },
  });

  if (!report) return null;

  // Don't override if priority was manually set by an inspector, unless explicitly requested
  if (report.priorityManualOverride) {
    const existingReasons = report.priorityReasons ? JSON.parse(report.priorityReasons) : ['Manual priority override by authority'];
    return {
      priorityScore: report.priorityScore,
      priorityLevel: report.priorityLevel,
      reasons: existingReasons,
      evidenceConfidence: Math.round((report.evidenceConfidence || 0.85) * 100),
      version: report.priorityVersion || '1.0',
    };
  }

  const result = calculatePriorityScore({
    independentReportCount: report.independentReportCount,
    confirmationCount: report.confirmationCount,
    createdAt: report.createdAt,
    category: report.category,
    locationText: report.locationText || '',
    hasPhoto: !!report.photoUrl,
    hasVoice: !!report.voiceUrl,
    hasLocation: !!(report.latitude && report.longitude),
    hasDescription: !!report.description,
  });

  await prisma.civicReport.update({
    where: { id: reportId },
    data: {
      priorityScore: result.priorityScore,
      priorityLevel: result.priorityLevel,
      priorityReasons: JSON.stringify(result.reasons),
      priorityCalculatedAt: new Date(),
      evidenceConfidence: result.evidenceConfidence / 100,
    },
  });

  await createChainedAuditLog({
    userId: report.citizenId,
    action: 'PRIORITY_RECALCULATED',
    entityType: 'CIVIC_REPORT',
    entityId: reportId,
    details: `Priority updated to ${result.priorityLevel} (${result.priorityScore}/100)`,
  });

  return result;
}

/**
 * Inspector/Authority manual priority override with required justification reason
 */
export async function overrideReportPriority(params: {
  reportId: string;
  newLevel: PriorityLevel;
  newScore: number;
  reason: string;
  overrideByUserId: string;
}): Promise<boolean> {
  const { reportId, newLevel, newScore, reason, overrideByUserId } = params;

  const existingReport = await prisma.civicReport.findUnique({
    where: { id: reportId },
  });

  if (!existingReport) return false;

  const previousLevel = existingReport.priorityLevel;
  const previousScore = existingReport.priorityScore;

  const updatedReasons = [
    `MANUAL OVERRIDE by Authority (${overrideByUserId}): ${reason}`,
    `Previous Score: ${previousScore} (${previousLevel}) → New Score: ${newScore} (${newLevel})`,
  ];

  await prisma.civicReport.update({
    where: { id: reportId },
    data: {
      priorityScore: newScore,
      priorityLevel: newLevel,
      priorityManualOverride: true,
      priorityOverrideReason: reason,
      priorityOverrideBy: overrideByUserId,
      priorityReasons: JSON.stringify(updatedReasons),
      priorityCalculatedAt: new Date(),
    },
  });

  await createChainedAuditLog({
    userId: overrideByUserId,
    action: 'PRIORITY_MANUALLY_UPDATED',
    entityType: 'CIVIC_REPORT',
    entityId: reportId,
    details: `Authority manually set priority to ${newLevel} (${newScore}/100). Reason: ${reason}`,
  });

  return true;
}
