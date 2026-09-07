/**
 * Configurable weights and thresholds for the MakkalSaantru AI-Assisted Verification Engine.
 * Modifying these parameters adjusts risk scoring sensitivity without altering application logic.
 */
export interface VerificationConfig {
  analysisVersion: string;
  progressMismatchWeight: number; // Weight assigned when independent citizens report progress mismatch
  corroborationWeight: number;    // Weight for independent citizen count
  locationWeight: number;         // Weight for verified location proximity
  duplicatePenalty: number;       // Score penalty factor for exact duplicate submissions
  conflictPenalty: number;        // Score penalty factor when citizen observations conflict
  
  // Score mapping thresholds (0–100 Verification Priority Score)
  thresholds: {
    consistentMax: number;        // 0 to 29 -> CONSISTENT
    reviewMax: number;            // 30 to 59 -> REVIEW
    // 60 to 100 -> POTENTIAL_MISMATCH
  };
}

export const defaultVerificationConfig: VerificationConfig = {
  analysisVersion: 'rules-v1.0',
  progressMismatchWeight: 35,
  corroborationWeight: 25,
  locationWeight: 20,
  duplicatePenalty: 10,
  conflictPenalty: 15,
  thresholds: {
    consistentMax: 29,
    reviewMax: 59,
  },
};
