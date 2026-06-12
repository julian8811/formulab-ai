import type { FormulaLineInput, ValidationInput } from "@/lib/validation/engine";
import { validateFormula } from "@/lib/validation/engine";
import type { SeedClaimRule } from "@/data/seed";
import { getHighestClaimRisk, validateMultipleClaims } from "@/lib/claims/validator";
import type { FormulaScore, RiskLevel } from "@/types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateFormulaScore(
  validationInput: ValidationInput,
  claims: string[],
  claimRules: SeedClaimRule[],
): FormulaScore {
  const alerts = validateFormula(validationInput);
  const failCount = alerts.filter((a) => a.status === "fail").length;
  const warnCount = alerts.filter((a) => a.status === "warning").length;

  const safety = clampScore(95 - failCount * 15 - warnCount * 5);
  const stability = clampScore(
    90 -
      alerts.filter((a) => a.category === "stability" || a.category === "compatibility")
        .length *
        10,
  );

  const species = validationInput.targetAudience.startsWith("dog") ? "dog" : "human";
  const claimResults = validateMultipleClaims(claims, claimRules, species);
  const claimsRisk = getHighestClaimRisk(claimResults);
  const regulatory = clampScore(
    claimsRisk === "high" ? 40 : claimsRisk === "medium" ? 70 : 92 - failCount * 5,
  );

  const lines = validationInput.lines;
  const naturalness = clampScore(
    lines.reduce((sum, l) => sum + l.ingredient.naturalOriginIndex * l.percentage, 0) /
      100,
  );

  const totalCost = lines.reduce(
    (sum, l) => sum + (l.ingredient.costPerKg * l.percentage) / 100,
    0,
  );
  const cost = clampScore(Math.max(20, 100 - totalCost * 3));

  const sensory = clampScore(
    85 - alerts.filter((a) => a.title.toLowerCase().includes("fragancia")).length * 10,
  );

  const microAlerts = alerts.filter((a) => a.category === "microbiology");
  let microbiologicalRisk: RiskLevel = "low";
  if (microAlerts.some((a) => a.status === "fail")) microbiologicalRisk = "high";
  else if (microAlerts.length > 0) microbiologicalRisk = "medium";

  let summary = "Fórmula prometedora para prototipo.";
  if (failCount > 0) {
    summary = `Requiere ajustes: ${failCount} alerta(s) crítica(s) antes de prototipar.`;
  } else if (warnCount > 2) {
    summary =
      "Fórmula prometedora para prototipo, pero requiere revisión de conservante, fragancia y validación de estabilidad.";
  }

  return {
    safety,
    stability,
    regulatory,
    naturalness,
    cost,
    sensory,
    microbiologicalRisk,
    claimsRisk,
    summary,
  };
}

export function scoreFromLines(
  lines: FormulaLineInput[],
  targetAudience: ValidationInput["targetAudience"],
  claims: string[],
  claimRules: SeedClaimRule[],
  options: Partial<ValidationInput> = {},
): FormulaScore {
  return calculateFormulaScore(
    {
      lines,
      targetAudience,
      incompatibilities: options.incompatibilities ?? [],
      targetPh: options.targetPh,
      productFormat: options.productFormat,
      positioning: options.positioning,
    },
    claims,
    claimRules,
  );
}
