export type UserRole = 'CITIZEN' | 'INSPECTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';

export type MilestonePercentage = 25 | 50 | 75 | 100;

export type VerificationResultEnum = 'CONSISTENT' | 'REVIEW' | 'POTENTIAL_MISMATCH';

export type EvidenceStatus = 'SUBMITTED' | 'PROCESSING' | 'ANALYZED' | 'NEEDS_REVIEW' | 'VERIFIED';

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
