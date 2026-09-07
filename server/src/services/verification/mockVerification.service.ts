import { VerificationProvider, ProjectEvidenceAnalysisInput, VerificationAnalysisResult } from './verification.interface';
import { DeterministicVerificationEngine } from './deterministicEngine';

/**
 * Deterministic Mock Verification Service Provider.
 * Implements VerificationProvider interface for test/demo environments.
 */
export class MockVerificationService implements VerificationProvider {
  private engine = new DeterministicVerificationEngine();

  async analyzeProjectEvidence(input: ProjectEvidenceAnalysisInput): Promise<VerificationAnalysisResult> {
    return this.engine.analyzeProjectEvidence(input);
  }
}
