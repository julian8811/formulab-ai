import type { DogCompatibility, IonicCharge, Origin, RiskLevel, Species } from "@/types";

export interface SeedIngredient {
  id: string;
  commercialName: string;
  inciName: string;
  commonName: string;
  function: string;
  supplier: string;
  origin: Origin;
  ionicCharge: IonicCharge;
  minPercentage: number;
  maxPercentage: number;
  phStabilityMin?: number;
  phStabilityMax?: number;
  solubility: string;
  restrictions?: string;
  allergens: string[];
  biodegradable: boolean;
  certifications: string[];
  approvedForHuman: boolean;
  recommendedUse: string;
  dogCompatibility: DogCompatibility;
  lickRisk: RiskLevel;
  fragranceRisk: RiskLevel;
  heatSensitive: boolean;
  costPerKg: number;
  naturalOriginIndex: number;
}

export interface SeedIncompatibility {
  id: string;
  ruleKey: string;
  ingredientAId?: string;
  ingredientBId?: string;
  ionicChargeA?: IonicCharge;
  ionicChargeB?: IonicCharge;
  category: string;
  severity: RiskLevel;
  message: string;
  suggestion: string;
}

export interface SeedClaimRule {
  id: string;
  pattern: string;
  riskLevel: RiskLevel;
  reason: string;
  safeAlternative: string;
  species: Species;
  requiresEvidence: boolean;
  evidenceQuestion?: string;
  category: string;
}
