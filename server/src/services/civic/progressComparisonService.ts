import { VerificationResult } from '@prisma/client';

export interface ProgressComparisonInput {
  submissionId: string;
  projectStageName: string;
  contractorClaim: string;
  contractorEvidencesCount: number;
  citizenVerifications: Array<{
    verifierId: string;
    verifierRole: string;
    observation: string; // 'YES' | 'NO' | 'UNSURE'
    consistencyResponse: string; // 'YES' | 'NO' | 'UNSURE'
    comment?: string | null;
    photoUrl?: string | null;
    distanceFromProject?: number | null;
  }>;
}

export interface ProgressComparisonOutput {
  result: VerificationResult;
  confidence: number; // 0.0 to 1.0
  explanation: string;
  observations: string[];
  recommendedHumanAction: string;
  provider: string;
}

/**
 * Service to evaluate evidence comparison between Contractor Progress Claims
 * and Citizen Field Observations in a non-accusatory, factual manner.
 */
export class ProgressEvidenceComparisonService {
  public compareEvidence(input: ProgressComparisonInput): ProgressComparisonOutput {
    const { projectStageName, contractorClaim, contractorEvidencesCount, citizenVerifications } = input;
    const totalCitizenCount = citizenVerifications.length;

    const observations: string[] = [];
    observations.push(`Contractor submitted ${contractorEvidencesCount} ground photo(s) for stage '${projectStageName}'.`);
    observations.push(`Contractor progress claim: "${contractorClaim}".`);

    if (totalCitizenCount === 0) {
      observations.push('No citizen ground verifications received yet.');
      return {
        result: VerificationResult.INSUFFICIENT_EVIDENCE,
        confidence: 0.50,
        explanation: `Contractor progress evidence submitted for '${projectStageName}'. Awaiting community ground corroboration or field inspector review.`,
        observations,
        recommendedHumanAction: 'Assign field inspector or await initial citizen corroboration.',
        provider: 'HeuristicComparisonEngine-v1.0',
      };
    }

    let yesObserve = 0;
    let noObserve = 0;
    let yesConsistent = 0;
    let noConsistent = 0;
    let photoCount = 0;

    for (const cv of citizenVerifications) {
      if (cv.observation === 'YES') yesObserve++;
      if (cv.observation === 'NO') noObserve++;
      if (cv.consistencyResponse === 'YES') yesConsistent++;
      if (cv.consistencyResponse === 'NO') noConsistent++;
      if (cv.photoUrl) photoCount++;
    }

    observations.push(`Received ${totalCitizenCount} independent citizen observation(s) (${photoCount} with current photos).`);

    const observeRatio = yesObserve / totalCitizenCount;
    const consistentRatio = yesConsistent / totalCitizenCount;
    const inconsistentRatio = noConsistent / totalCitizenCount;

    // Evaluate results non-accusatorily
    if (inconsistentRatio >= 0.40 || (noObserve / totalCitizenCount) >= 0.40) {
      observations.push(`Noticeable variation between contractor evidence and citizen ground observations.`);
      return {
        result: VerificationResult.POTENTIAL_MISMATCH,
        confidence: 0.85,
        explanation: `Ground observations indicate visible work or site condition may differ from the submitted progress claim.`,
        observations,
        recommendedHumanAction: 'Schedule an official field inspection before confirming stage completion.',
        provider: 'HeuristicComparisonEngine-v1.0',
      };
    }

    if (consistentRatio >= 0.60 && observeRatio >= 0.60) {
      observations.push(`High level of alignment between contractor photos and independent community observations.`);
      return {
        result: VerificationResult.CONSISTENT,
        confidence: Math.min(0.95, 0.70 + totalCitizenCount * 0.05),
        explanation: `Multiple citizen submissions confirm observable work at the project location consistent with the contractor's progress claim.`,
        observations,
        recommendedHumanAction: 'Review evidence and confirm progress update.',
        provider: 'HeuristicComparisonEngine-v1.0',
      };
    }

    observations.push(`Mixed or inconclusive community feedback regarding stage progress.`);
    return {
      result: VerificationResult.REVIEW,
      confidence: 0.70,
      explanation: `Community evidence presents mixed observations. Requires human administrative review.`,
      observations,
      recommendedHumanAction: 'Review submitted evidence photos and citizen notes.',
      provider: 'HeuristicComparisonEngine-v1.0',
    };
  }
}
