import type { FormulaLineInput } from "@/lib/validation/engine";
import type { ValidationAlert } from "@/types";
import { validateFormula, type ValidationInput } from "@/lib/validation/engine";
import { seedStabilityProtocols } from "@/data/seed";

export interface StabilityAssessment {
  alerts: ValidationAlert[];
  recommendedTests: string[];
  packagingNotes: string[];
  summary: string;
}

export function assessStability(input: ValidationInput): StabilityAssessment {
  const alerts = validateFormula(input).filter(
    (a) => a.category === "stability" || a.category === "compatibility",
  );

  const protocol = seedStabilityProtocols.find(
    (p) => p.productFormat === input.productFormat,
  );

  const recommendedTests = protocol?.tests ?? [
    "pH inicial y final",
    "Separación de fases",
    "Viscosidad",
    "Estabilidad acelerada (40°C, 4 semanas)",
    "Estabilidad en tiempo real (3-6 meses)",
    "Fotostabilidad",
  ];

  const packagingNotes: string[] = [];

  if (input.productFormat === "foam") {
    packagingNotes.push(
      "Validar fluidez con bomba espumadora específica.",
      "Verificar que los tensioactivos generen espuma estable.",
      "Comprobar que la fragancia no desestabilice la espuma.",
    );
  }

  if (input.productFormat === "spray") {
    packagingNotes.push(
      "Validar compatibilidad con válvula spray.",
      "Revisar viscosidad para atomización adecuada.",
    );
  }

  const hasHeatSensitive = input.lines.some((l) => l.ingredient.heatSensitive);
  if (hasHeatSensitive) {
    packagingNotes.push("Documentar orden de fabricación con fase de enfriamiento.");
  }

  const hasFragrance = input.lines.some((l) => l.ingredient.inciName === "Parfum");
  if (hasFragrance) {
    packagingNotes.push("Monitorear cambios de olor en estabilidad acelerada.");
  }

  const failCount = alerts.filter((a) => a.status === "fail").length;
  const summary =
    failCount > 0
      ? "Riesgos de estabilidad detectados. Resolver antes de iniciar protocolo."
      : "Iniciar protocolo de estabilidad recomendado para validar en laboratorio.";

  return { alerts, recommendedTests, packagingNotes, summary };
}

export function assessMicrobiology(input: ValidationInput): {
  alerts: ValidationAlert[];
  requiresChallengeTest: boolean;
  recommendedTests: string[];
  summary: string;
} {
  const alerts = validateFormula(input).filter((a) => a.category === "microbiology");
  const hasWater = input.lines.some(
    (l) => l.ingredient.inciName === "Aqua" || l.percentage > 50,
  );

  const requiresChallengeTest = hasWater;
  const recommendedTests = requiresChallengeTest
    ? [
        "Recuento total mesófilos",
        "Hongos y levaduras",
        "Challenge test (P. aeruginosa, S. aureus, E. coli, C. albicans, A. brasiliensis)",
        "Actividad de agua (aw) si aplica",
      ]
    : ["Evaluación microbiológica según tipo de producto anhidro"];

  const summary = requiresChallengeTest
    ? "Producto acuoso: challenge test obligatorio antes de comercializar."
    : "Producto anhidro: evaluar riesgo microbiológico según uso y envase.";

  return { alerts, requiresChallengeTest, recommendedTests, summary };
}
