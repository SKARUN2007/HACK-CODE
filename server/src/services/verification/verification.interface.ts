export type VerificationResultEnum = 'CONSISTENT' | 'REVIEW' | 'POTENTIAL_MISMATCH';

export type HumanStatusEnum =
  | 'AI_PENDING'
  | 'AI_ANALYZED'
  | 'HUMAN_REVIEW_PENDING'
  | 'UNDER_HUMAN_REVIEW'
  | 'ISSUE_CONFIRMED'
  | 'NO_ISSUE_FOUND'
  | 'MORE_EVIDENCE_REQUIRED'
  | 'HUMAN_CONFIRMED'
  | 'HUMAN_REJECTED'
  | 'RESOLVED';

export type LocationSignalEnum =
  | 'NEAR_PROJECT'
  | 'LOCATION_REVIEW'
  | 'LOCATION_MISMATCH'
  | 'LOCATION_NOT_PROVIDED';

export type IntegritySignalEnum = 'VALID' | 'MISMATCH' | 'UNKNOWN';

export type DuplicateSignalEnum = 'UNIQUE' | 'POSSIBLE_DUPLICATE';

export type CitizenProgressSignalEnum =
  | 'MATCHES_REPORTED_PROGRESS'
  | 'UNCERTAIN'
  | 'DOES_NOT_MATCH_REPORTED_PROGRESS';

export type CorroborationSignalEnum = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StructuredVerificationSignals {
  locationSignal: LocationSignalEnum;
  integritySignal: IntegritySignalEnum;
  duplicateSignal: DuplicateSignalEnum;
  citizenProgressSignal: CitizenProgressSignalEnum;
  corroborationSignal: CorroborationSignalEnum;
}

export interface CorroborationSummary {
  submissionCount: number;
  independentCitizenCount: number;
  similarAnswerCount: number;      // mismatch observations
  consistentAnswerCount: number;   // matching observations
  unsureAnswerCount: number;       // uncertain observations
  conflictingAnswerCount: number;
  exactDuplicateCount: number;
  locationVerifiedCount: number;
}

export interface ProjectEvidenceAnalysisInput {
  project: {
    id: string;
    title: string;
    category: string;
    reportedProgress: number;
    latitude: number;
    longitude: number;
  };
  evidences: Array<{
    id: string;
    citizenId: string;
    photoUrl?: string | null;
    voiceUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    locationProvided?: boolean;
    distanceFromProject?: number | null;
    locationStatus?: string | null;
    exactDuplicate: boolean;
    duplicateOfId?: string | null;
    capturedAt: Date | string;
    evidenceHash: string;
    visibleWork?: string | null;
    milestoneMatch?: string | null;
    usableMaintained?: string | null;
    notes?: string | null;
  }>;
}

export interface VerificationAnalysisResult {
  id: string;
  projectId: string;
  analysisVersion: string;
  provider: string; // e.g. 'deterministic-v1.0' or 'google-gemini-2.5-flash'
  modelName?: string;
  analysisTimestamp: string;
  priorityScore: number;    // 0 to 100 Verification Priority Score
  confidenceScore: number;  // 0 to 100 Evidence Confidence Score
  result: VerificationResultEnum; // CONSISTENT | REVIEW | POTENTIAL_MISMATCH
  humanStatus: HumanStatusEnum;   // AI_ANALYZED | HUMAN_REVIEW_PENDING | HUMAN_CONFIRMED | HUMAN_REJECTED
  signals: StructuredVerificationSignals;
  corroboration: CorroborationSummary;
  whyFlagged: string[];    // Array of plain language explainability bullet points
  recommendation: string;  // Plain language actionable guidance
  aiVisionUsed: boolean;
  aiNotice?: string;       // e.g. "AI vision unavailable — using structured evidence analysis."
}

export interface VerificationProvider {
  analyzeProjectEvidence(input: ProjectEvidenceAnalysisInput): Promise<VerificationAnalysisResult>;
}
