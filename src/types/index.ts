export interface BankModel {
  id: string;
  name: string;
  category: '风控' | '营销' | '运营' | '综合';
  scenarios: string[];
  capabilities: string[];
  dataRequirements: string[];
  metrics: {
    accuracy?: string;
    ks?: string;
    auc?: string;
    precision?: string;
    recall?: string;
    lift?: string;
  };
  description: string;
  targetAudience: string[];
  complianceBoundaries: string[];
  cases: string[];
  tags: string[];
}

export interface ParsedRequirement {
  domain: string;
  stage: string;
  audience: string[];
  coreCapabilities: string[];
  dataAvailable: string[];
  expectedOutput: string;
}

export interface SingleRecommendation {
  model: BankModel;
  matchScore: number;
  matchReasons: string[];
  radarData: { subject: string; A: number; fullMark: number }[];
}

export interface CombinedRecommendationNode {
  id: string;
  model: BankModel;
  roleInFlow: string;
  input: string;
  output: string;
  expectedValue: string;
}

export interface CombinedRecommendation {
  id: string;
  name: string;
  matchScore: number;
  nodes: CombinedRecommendationNode[];
  overallExplanation: string;
}
