export type UserRole = 'CITIZEN' | 'INSPECTOR' | 'ADMIN' | 'CONTRACTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';

export type MilestonePercentage = 25 | 50 | 75 | 100;

export type VerificationResultEnum = 'CONSISTENT' | 'REVIEW' | 'POTENTIAL_MISMATCH' | 'INSUFFICIENT_EVIDENCE';

export type EvidenceStatus = 'SUBMITTED' | 'PROCESSING' | 'ANALYZED' | 'NEEDS_REVIEW' | 'VERIFIED';

export interface ProjectStage {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  sequence: number;
  required: boolean;
  createdAt: string;
}

export interface ProgressEvidence {
  id: string;
  submissionId: string;
  evidenceType: 'PHOTO' | 'VIDEO' | 'AUDIO';
  fileUrl: string;
  latitude?: number;
  longitude?: number;
  capturedAt: string;
  serverReceivedAt: string;
  sha256Hash: string;
  createdAt: string;
}

export interface ProgressVerification {
  id: string;
  submissionId: string;
  verifierId: string;
  verifierRole: UserRole;
  observation: 'YES' | 'NO' | 'UNSURE';
  consistencyResponse: 'YES' | 'NO' | 'UNSURE';
  comment?: string;
  photoUrl?: string;
  voiceUrl?: string;
  latitude?: number;
  longitude?: number;
  distanceFromProject?: number;
  sha256Hash?: string;
  createdAt: string;
  verifier?: Partial<User>;
}

export interface ProgressAnalysis {
  id: string;
  submissionId: string;
  result: VerificationResultEnum;
  confidence: number;
  explanation: string;
  observations: string; // JSON array string
  recommendedHumanAction?: string;
  provider: string;
  createdAt: string;
}

export interface ProgressHumanDecision {
  id: string;
  submissionId: string;
  inspectorId: string;
  decision: 'VERIFY_PROGRESS' | 'NEEDS_MORE_EVIDENCE' | 'FIELD_INSPECTION_REQUIRED' | 'PROGRESS_NOT_CONFIRMED';
  reason?: string;
  decidedAt: string;
  inspector?: Partial<User>;
}

export interface ContractorProgressSubmission {
  id: string;
  projectId: string;
  projectStageId: string;
  contractorId: string;
  title: string;
  description: string;
  claim: string;
  status: 'AWAITING_VERIFICATION' | 'COMMUNITY_VERIFICATION_IN_PROGRESS' | 'AI_ANALYZED' | 'HUMAN_REVIEW_REQUIRED' | 'FIELD_INSPECTION_REQUIRED' | 'VERIFIED' | 'NOT_CONFIRMED' | 'MORE_EVIDENCE_REQUIRED' | 'SUPERSEDED';
  version: number;
  submittedAt: string;
  createdAt: string;
  stage?: ProjectStage;
  contractor?: Partial<User>;
  evidences?: ProgressEvidence[];
  verifications?: ProgressVerification[];
  analyses?: ProgressAnalysis[];
  decisions?: ProgressHumanDecision[];
}

export interface Project {
  id: string;
  verificationCode?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  budget: number;
  reportedProgress: number;
  status: ProjectStatus;
  createdAt: string;
  milestones?: Milestone[];
  stages?: ProjectStage[];
  contractorSubmissions?: ContractorProgressSubmission[];
}

export interface Milestone {
  id: string;
  projectId: string;
  percentage: MilestonePercentage;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'REACHED' | 'VERIFIED';
  reachedAt?: string;
}

export interface Evidence {
  id: string;
  projectId: string;
  citizenId: string;
  milestoneId?: string;
  photoUrl?: string;
  voiceUrl?: string;
  latitude?: number;
  longitude?: number;
  locationProvided: boolean;
  distanceFromProject?: number;
  locationStatus?: 'NEAR_PROJECT' | 'LOCATION_REVIEW' | 'LOCATION_MISMATCH' | 'LOCATION_NOT_PROVIDED';
  exactDuplicate?: boolean;
  duplicateOfId?: string;
  capturedAt: string;
  evidenceHash: string;
  status: EvidenceStatus;
  visibleWork?: 'YES' | 'NO' | 'UNSURE';
  milestoneMatch?: 'YES' | 'NO' | 'UNSURE';
  usableMaintained?: 'YES' | 'NO' | 'UNSURE';
  notes?: string;
  createdAt: string;
  project?: Project;
  milestone?: Milestone;
}
