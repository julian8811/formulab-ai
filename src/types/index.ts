export type ProductType =
  | "shampoo"
  | "espuma"
  | "crema"
  | "serum"
  | "balm"
  | "spray"
  | "gel"
  | "lotion"
  | "tonic"
  | "solid";

export type TargetAudience =
  | "dog"
  | "dog_puppy"
  | "dog_sensitive"
  | "dog_long_coat"
  | "human_adult"
  | "human_sensitive"
  | "human_oily_hair"
  | "human_dry_skin";

export type ProductFormat = "liquid" | "foam" | "emulsion" | "gel" | "solid" | "spray";

export type Positioning =
  | "natural"
  | "vegan"
  | "premium"
  | "economy"
  | "dermatologically_tested"
  | "sulfate_free"
  | "paraben_free"
  | "biodegradable";

export type IonicCharge = "anionic" | "cationic" | "amphoteric" | "non_ionic";

export type Origin = "vegetal" | "synthetic" | "biotech" | "mineral";

export type DogCompatibility = "approved" | "caution" | "avoid";

export type RiskLevel = "low" | "medium" | "high";

export type ValidationStatus = "pass" | "warning" | "fail";

export type Market = "colombia" | "can" | "usa" | "eu" | "mexico" | "brazil";

export type Species = "dog" | "human" | "both";

export type DocumentType =
  | "technical_sheet"
  | "sds"
  | "coa"
  | "ifra"
  | "allergen_declaration"
  | "formula_master"
  | "manufacturing_order"
  | "label"
  | "checklist";

export type AgentType =
  | "formulator"
  | "regulatory"
  | "stability"
  | "microbiology"
  | "costs"
  | "sensory"
  | "documentation"
  | "market";

export interface ValidationAlert {
  id: string;
  category: "ph" | "compatibility" | "percentage" | "microbiology" | "dog" | "stability";
  status: ValidationStatus;
  title: string;
  message: string;
  suggestion?: string;
}

export interface FormulaScore {
  safety: number;
  stability: number;
  regulatory: number;
  naturalness: number;
  cost: number;
  sensory: number;
  microbiologicalRisk: RiskLevel;
  claimsRisk: RiskLevel;
  summary: string;
}

export interface ClaimValidationResult {
  originalClaim: string;
  riskLevel: RiskLevel;
  reason: string;
  safeAlternative: string;
  requiresEvidence?: boolean;
  evidenceQuestion?: string;
}

export interface CostScenario {
  name: string;
  batchSizeKg: number;
  formulaCost: number;
  packagingCost: number;
  totalCost: number;
  costPerUnit?: number;
}

export interface ReformulationSuggestion {
  type: "natural" | "cost" | "irritation" | "stability";
  change: string;
  impact: {
    sensory?: string;
    stability?: string;
    claim?: string;
    cost?: string;
    naturalness?: string;
  };
}
