import type { SeedClaimRule } from "@/data/seed";
import type { ClaimValidationResult, RiskLevel } from "@/types";

export function validateClaim(
  claimText: string,
  rules: SeedClaimRule[],
  species: "dog" | "human" = "dog",
): ClaimValidationResult[] {
  const results: ClaimValidationResult[] = [];
  const normalizedClaim = claimText.toLowerCase().trim();

  for (const rule of rules) {
    if (rule.species !== "both" && rule.species !== species) continue;

    const regex = new RegExp(rule.pattern, "i");
    if (regex.test(normalizedClaim)) {
      results.push({
        originalClaim: claimText,
        riskLevel: rule.riskLevel,
        reason: rule.reason,
        safeAlternative: rule.safeAlternative,
        requiresEvidence: rule.requiresEvidence,
        evidenceQuestion: rule.evidenceQuestion,
      });
    }
  }

  if (results.length === 0) {
    results.push({
      originalClaim: claimText,
      riskLevel: "low",
      reason: "No se detectaron claims de alto riesgo en este texto.",
      safeAlternative: claimText,
      requiresEvidence: false,
    });
  }

  return results;
}

export function validateMultipleClaims(
  claims: string[],
  rules: SeedClaimRule[],
  species: "dog" | "human" = "dog",
): ClaimValidationResult[] {
  return claims.flatMap((claim) => validateClaim(claim, rules, species));
}

export function getHighestClaimRisk(results: ClaimValidationResult[]): RiskLevel {
  if (results.some((r) => r.riskLevel === "high")) return "high";
  if (results.some((r) => r.riskLevel === "medium")) return "medium";
  return "low";
}

export function getSafeClaimsSuggestions(
  rules: SeedClaimRule[],
  species: "dog" | "human" = "dog",
): string[] {
  return rules
    .filter(
      (r) => r.riskLevel === "low" && (r.species === species || r.species === "both"),
    )
    .map((r) => r.safeAlternative)
    .slice(0, 8);
}
