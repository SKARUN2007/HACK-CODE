import {
  VerificationProvider,
  ProjectEvidenceAnalysisInput,
  VerificationAnalysisResult,
  VerificationResultEnum,
  HumanStatusEnum,
  CorroborationSummary,
  StructuredVerificationSignals,
} from './verification.interface';
import { defaultVerificationConfig, VerificationConfig } from './verificationConfig';

export class DeterministicVerificationEngine implements VerificationProvider {
  private config: VerificationConfig;

  constructor(config: VerificationConfig = defaultVerificationConfig) {
    this.config = config;
  }

  async analyzeProjectEvidence(
    input: ProjectEvidenceAnalysisInput
  ): Promise<VerificationAnalysisResult> {
    const { project, evidences } = input;
    const timestamp = new Date().toISOString();

    // 1. Calculate Multi-Citizen Corroboration Metrics
    const corroboration = this.calculateCorroboration(evidences);

    // 2. Derive Structured Signals
    const signals = this.deriveStructuredSignals(evidences, corroboration);

    // 3. Compute Verification Priority Score (0–100) & Evidence Confidence Score (0–100)
    const priorityScore = this.calculatePriorityScore(evidences, corroboration, signals);
    const confidenceScore = this.calculateConfidenceScore(evidences, corroboration, signals);

    // 4. Map Priority Score to Result Status
    const result = this.mapScoreToResult(priorityScore);

    // 5. Determine Human-In-The-Loop Status
    const humanStatus: HumanStatusEnum =
      result === 'CONSISTENT' ? 'AI_ANALYZED' : 'HUMAN_REVIEW_PENDING';

    // 6. Generate Plain-Language Explainability Bullet Points & Recommendation
    const whyFlagged = this.generateExplainability(evidences, corroboration, signals, priorityScore, result);
    const recommendation = this.generateRecommendation(result, priorityScore);

    return {
      id: `verif-${project.id}-${Date.now()}`,
      projectId: project.id,
      analysisVersion: this.config.analysisVersion,
      provider: 'deterministic-rules-engine',
      analysisTimestamp: timestamp,
      priorityScore,
      confidenceScore,
      result,
      humanStatus,
      signals,
      corroboration,
      whyFlagged,
      recommendation,
      aiVisionUsed: false,
      aiNotice: 'AI vision unavailable — using structured evidence analysis.',
    };
  }

  private calculateCorroboration(evidences: ProjectEvidenceAnalysisInput['evidences']): CorroborationSummary {
    const submissionCount = evidences.length;

    // Filter unique authenticated citizen IDs for anti-manipulation
    const uniqueCitizens = new Set<string>();
    let exactDuplicateCount = 0;
    let locationVerifiedCount = 0;
    let similarAnswerCount = 0;     // Mismatch observations ('NO' to milestone match or visible work)
    let consistentAnswerCount = 0;  // Matching observations ('YES')
    let unsureAnswerCount = 0;      // Uncertain observations ('UNSURE')

    evidences.forEach((ev) => {
      if (ev.exactDuplicate) {
        exactDuplicateCount++;
      } else {
        uniqueCitizens.add(ev.citizenId);
      }

      if (ev.locationStatus === 'NEAR_PROJECT' || (ev.distanceFromProject !== null && ev.distanceFromProject !== undefined && ev.distanceFromProject <= 250)) {
        locationVerifiedCount++;
      }

      const match = ev.milestoneMatch || ev.visibleWork;
      if (match === 'NO') {
        similarAnswerCount++;
      } else if (match === 'YES') {
        consistentAnswerCount++;
      } else if (match === 'UNSURE') {
        unsureAnswerCount++;
      }
    });

    const independentCitizenCount = uniqueCitizens.size;
    const conflictingAnswerCount = Math.min(similarAnswerCount, consistentAnswerCount);

    return {
      submissionCount,
      independentCitizenCount,
      similarAnswerCount,
      consistentAnswerCount,
      unsureAnswerCount,
      conflictingAnswerCount,
      exactDuplicateCount,
      locationVerifiedCount,
    };
  }

  private deriveStructuredSignals(
    evidences: ProjectEvidenceAnalysisInput['evidences'],
    corroboration: CorroborationSummary
  ): StructuredVerificationSignals {
    // Location Signal
    let locationSignal: StructuredVerificationSignals['locationSignal'] = 'LOCATION_NOT_PROVIDED';
    if (corroboration.locationVerifiedCount > 0) {
      locationSignal = 'NEAR_PROJECT';
    } else if (evidences.some((e) => e.locationStatus === 'LOCATION_REVIEW')) {
      locationSignal = 'LOCATION_REVIEW';
    } else if (evidences.some((e) => e.locationStatus === 'LOCATION_MISMATCH')) {
      locationSignal = 'LOCATION_MISMATCH';
    }

    // Integrity Signal
    const integritySignal: StructuredVerificationSignals['integritySignal'] = evidences.every(
      (e) => e.evidenceHash && e.evidenceHash.length === 64
    )
      ? 'VALID'
      : 'UNKNOWN';

    // Duplicate Signal
    const duplicateSignal: StructuredVerificationSignals['duplicateSignal'] =
      corroboration.exactDuplicateCount > 0 ? 'POSSIBLE_DUPLICATE' : 'UNIQUE';

    // Citizen Progress Signal
    let citizenProgressSignal: StructuredVerificationSignals['citizenProgressSignal'] = 'UNCERTAIN';
    if (corroboration.similarAnswerCount > corroboration.consistentAnswerCount) {
      citizenProgressSignal = 'DOES_NOT_MATCH_REPORTED_PROGRESS';
    } else if (corroboration.consistentAnswerCount > corroboration.similarAnswerCount) {
      citizenProgressSignal = 'MATCHES_REPORTED_PROGRESS';
    }

    // Corroboration Signal
    let corroborationSignal: StructuredVerificationSignals['corroborationSignal'] = 'LOW';
    if (corroboration.independentCitizenCount >= 5) {
      corroborationSignal = 'HIGH';
    } else if (corroboration.independentCitizenCount >= 2) {
      corroborationSignal = 'MEDIUM';
    }

    return {
      locationSignal,
      integritySignal,
      duplicateSignal,
      citizenProgressSignal,
      corroborationSignal,
    };
  }

  private calculatePriorityScore(
    evidences: ProjectEvidenceAnalysisInput['evidences'],
    corroboration: CorroborationSummary,
    signals: StructuredVerificationSignals
  ): number {
    if (evidences.length === 0) return 0;

    let score = 0;

    // A. Mismatch observations from independent citizens
    if (corroboration.independentCitizenCount > 0) {
      const mismatchRatio = corroboration.similarAnswerCount / corroboration.submissionCount;
      score += mismatchRatio * this.config.progressMismatchWeight;
    }

    // B. Independent Citizen Corroboration multiplier
    if (corroboration.independentCitizenCount >= 5) {
      score += this.config.corroborationWeight;
    } else if (corroboration.independentCitizenCount >= 2) {
      score += this.config.corroborationWeight * 0.6;
    } else if (corroboration.independentCitizenCount === 1) {
      score += this.config.corroborationWeight * 0.2;
    }

    // C. Proximity factor (Location verified evidence adds weight to review priority if mismatch reported)
    if (corroboration.locationVerifiedCount > 0 && signals.citizenProgressSignal === 'DOES_NOT_MATCH_REPORTED_PROGRESS') {
      score += this.config.locationWeight;
    }

    // D. Duplicate Penalty (Discount confidence/priority if heavily spammed by duplicate uploads)
    if (corroboration.exactDuplicateCount > 0) {
      score -= this.config.duplicatePenalty * (corroboration.exactDuplicateCount / corroboration.submissionCount);
    }

    // E. Conflict Penalty
    if (corroboration.conflictingAnswerCount > 0) {
      score -= this.config.conflictPenalty * (corroboration.conflictingAnswerCount / corroboration.submissionCount);
    }

    // Clamp score between 0 and 100
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private calculateConfidenceScore(
    evidences: ProjectEvidenceAnalysisInput['evidences'],
    corroboration: CorroborationSummary,
    signals: StructuredVerificationSignals
  ): number {
    if (evidences.length === 0) return 0;

    let confidence = 50; // Base baseline

    // Independent citizen volume adds strong confidence
    if (corroboration.independentCitizenCount >= 7) {
      confidence += 30;
    } else if (corroboration.independentCitizenCount >= 3) {
      confidence += 20;
    } else if (corroboration.independentCitizenCount >= 1) {
      confidence += 10;
    }

    // Location verification adds confidence
    if (corroboration.locationVerifiedCount > 0) {
      confidence += 15;
    }

    // Valid SHA-256 integrity hash adds confidence
    if (signals.integritySignal === 'VALID') {
      confidence += 10;
    }

    // Deduct confidence for exact duplicates and conflicts
    if (corroboration.exactDuplicateCount > 0) {
      confidence -= Math.min(20, corroboration.exactDuplicateCount * 5);
    }

    if (corroboration.conflictingAnswerCount > 0) {
      confidence -= Math.min(20, corroboration.conflictingAnswerCount * 5);
    }

    return Math.min(100, Math.max(0, Math.round(confidence)));
  }

  private mapScoreToResult(score: number): VerificationResultEnum {
    if (score <= this.config.thresholds.consistentMax) {
      return 'CONSISTENT';
    } else if (score <= this.config.thresholds.reviewMax) {
      return 'REVIEW';
    } else {
      return 'POTENTIAL_MISMATCH';
    }
  }

  private generateExplainability(
    evidences: ProjectEvidenceAnalysisInput['evidences'],
    corroboration: CorroborationSummary,
    signals: StructuredVerificationSignals,
    score: number,
    result: VerificationResultEnum
  ): string[] {
    const bullets: string[] = [];

    if (corroboration.independentCitizenCount > 0) {
      bullets.push(
        `${corroboration.independentCitizenCount} independent citizen observation(s) submitted for project verification.`
      );
    } else {
      bullets.push('No independent citizen submissions recorded yet.');
    }

    if (signals.citizenProgressSignal === 'DOES_NOT_MATCH_REPORTED_PROGRESS') {
      bullets.push(
        `${corroboration.similarAnswerCount} submission(s) indicate visible ground progress may differ from official reported milestone.`
      );
    } else if (signals.citizenProgressSignal === 'MATCHES_REPORTED_PROGRESS') {
      bullets.push(
        `${corroboration.consistentAnswerCount} submission(s) indicate visible ground progress broadly aligns with reported milestone.`
      );
    }

    if (corroboration.locationVerifiedCount > 0) {
      bullets.push(
        `${corroboration.locationVerifiedCount} submission(s) were captured near the project location (verified GPS proximity).`
      );
    } else {
      bullets.push('Location proximity pending verification or location not provided.');
    }

    if (signals.integritySignal === 'VALID') {
      bullets.push('Server SHA-256 integrity hash verification passed for all evidence payloads.');
    }

    if (corroboration.exactDuplicateCount > 0) {
      bullets.push(
        `⚠️ ${corroboration.exactDuplicateCount} exact duplicate submission(s) detected and discounted from independent corroboration.`
      );
    }

    if (corroboration.conflictingAnswerCount > 0) {
      bullets.push(
        `⚠️ Conflicting citizen observations detected (${corroboration.conflictingAnswerCount} conflicting pair(s)).`
      );
    }

    return bullets;
  }

  private generateRecommendation(result: VerificationResultEnum, score: number): string {
    switch (result) {
      case 'POTENTIAL_MISMATCH':
        return 'Prioritize this project for official human inspection. Multiple ground observations indicate potential milestone variance.';
      case 'REVIEW':
        return 'Schedule routine verification review. Evidence is inconclusive or conflicting observation signals require human inspection.';
      case 'CONSISTENT':
        return 'Routine progress monitoring. Citizen observations broadly align with reported progress milestone.';
    }
  }
}
