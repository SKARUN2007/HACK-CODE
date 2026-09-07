import {
  VerificationProvider,
  ProjectEvidenceAnalysisInput,
  VerificationAnalysisResult,
} from './verification.interface';
import { DeterministicVerificationEngine } from './deterministicEngine';
import { AIVisionVerificationProvider } from './aiVisionProvider';

export class VerificationService implements VerificationProvider {
  private provider: VerificationProvider;

  constructor() {
    if (process.env.AI_PROVIDER && process.env.AI_API_KEY) {
      this.provider = new AIVisionVerificationProvider();
    } else {
      this.provider = new DeterministicVerificationEngine();
    }
  }

  async analyzeProjectEvidence(
    input: ProjectEvidenceAnalysisInput
  ): Promise<VerificationAnalysisResult> {
    return this.provider.analyzeProjectEvidence(input);
  }
}

export const verificationService = new VerificationService();
