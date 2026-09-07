const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export interface RelatedDomainSuggestion {
  domain: string;
  confidence: number;
  reason: string;
  relationshipType: string;
  mappedAuthority?: {
    id: string;
    name: string;
    type: string;
    jurisdiction: string;
  };
}

export interface CrossDomainDetectionResponse {
  primaryDomain: string;
  primaryConfidence: number;
  isMultiDomain: boolean;
  relatedDomains: RelatedDomainSuggestion[];
  observations: string[];
}

export interface CaseDomainAssignmentUI {
  id: string;
  reportId: string;
  domain: string;
  domainLabel: string;
  relationshipRole: 'PRIMARY' | 'RELATED';
  confidence: number;
  reason: string;
  status: 'SUGGESTED' | 'CONFIRMED' | 'REJECTED';
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  authorityId?: string;
  authorityName?: string;
}

export interface CaseDomainTaskUI {
  id: string;
  reportId: string;
  domainAssignmentId?: string;
  domain: string;
  title: string;
  action: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  sequence: number;
  dependsOnTaskId?: string;
  assignedAuthorityId?: string;
  assignedInspector?: string;
  beforeProofUrl?: string;
  afterProofUrl?: string;
  notes?: string;
  completedAt?: string;
}

export interface CrossDomainDetailsResponse {
  success: boolean;
  reportId: string;
  isMultiDomain: boolean;
  assignments: CaseDomainAssignmentUI[];
  tasks: CaseDomainTaskUI[];
  overallStatus: string;
}

/**
 * Detect candidate related domains for a primary domain & description
 */
export async function detectCrossDomains(params: {
  primaryDomain: string;
  description?: string;
  locationText?: string;
}): Promise<CrossDomainDetectionResponse> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cross-domain/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    throw new Error('Failed to detect cross-domain relationships');
  }
  const data = await res.json();
  return data.detection;
}

/**
 * Fetch domain assignments and task graph for a report
 */
export async function fetchCrossDomainDetails(reportId: string): Promise<CrossDomainDetailsResponse> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cross-domain/reports/${reportId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch cross-domain details');
  }
  return await res.json();
}

/**
 * Citizen confirm or modify domain suggestions
 */
export async function citizenConfirmDomains(reportId: string, confirmed: boolean, selectedRelatedDomains?: string[]) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cross-domain/reports/${reportId}/citizen-confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ confirmed, selectedRelatedDomains })
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to save citizen domain confirmation');
  }
  return await res.json();
}

/**
 * Inspector/Supervisor authority decision (CONFIRM, REJECT, ADD)
 */
export async function authorityDomainAction(reportId: string, action: 'CONFIRM' | 'REJECT' | 'ADD', domain: string, reason: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cross-domain/reports/${reportId}/authority-action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ action, domain, reason })
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to record authority domain decision');
  }
  return await res.json();
}

/**
 * Update domain task status (e.g. IN_PROGRESS -> COMPLETED)
 */
export async function updateDomainTaskStatus(taskId: string, status: string, notes?: string, proofUrl?: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cross-domain/tasks/${taskId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status, notes, proofUrl })
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Failed to update task status');
  }
  return await res.json();
}

/**
 * Fetch cross-domain analytics for authority dashboard
 */
export async function fetchCrossDomainAnalytics() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/cross-domain/analytics`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch cross-domain analytics');
  }
  return await res.json();
}
