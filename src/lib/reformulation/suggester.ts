import type { FormulaLineInput } from "@/lib/validation/engine";
import type { ReformulationSuggestion } from "@/types";
import { seedIngredients } from "@/data/seed";

export function suggestNaturalReformulation(
  lines: FormulaLineInput[],
): ReformulationSuggestion[] {
  const suggestions: ReformulationSuggestion[] = [];

  for (const line of lines) {
    if (line.ingredient.naturalOriginIndex < 50) {
      const alternatives = seedIngredients.filter(
        (i) =>
          i.function === line.ingredient.function &&
          i.naturalOriginIndex >= 80 &&
          i.dogCompatibility !== "avoid",
      );

      if (alternatives.length > 0) {
        suggestions.push({
          type: "natural",
          change: `Reemplazar ${line.ingredient.commonName} por ${alternatives[0].commonName}`,
          impact: {
            sensory: "Puede cambiar textura o espuma; validar en prototipo.",
            stability: alternatives[0].restrictions ?? "Revisar compatibilidad.",
            naturalness: `Naturalidad sube de ${line.ingredient.naturalOriginIndex}% a ${alternatives[0].naturalOriginIndex}%.`,
            claim: "Permite posicionamiento más natural.",
          },
        });
      }
    }

    if (line.ingredient.inciName === "Parfum") {
      suggestions.push({
        type: "natural",
        change:
          "Cambiar fragancia sintética por fragancia certificada IFRA baja alérgenos",
        impact: {
          sensory: "Perfil olfativo puede ser más suave.",
          claim: "No necesariamente será menos alergénica; documentar alérgenos.",
          stability: "Validar compatibilidad con base acuosa.",
        },
      });
    }
  }

  return suggestions;
}

export function suggestCostReduction(
  lines: FormulaLineInput[],
): ReformulationSuggestion[] {
  const suggestions: ReformulationSuggestion[] = [];

  const sorted = [...lines].sort(
    (a, b) =>
      b.ingredient.costPerKg * b.percentage - a.ingredient.costPerKg * a.percentage,
  );

  for (const line of sorted.slice(0, 3)) {
    if (line.ingredient.costPerKg > 15) {
      const cheaper = seedIngredients.find(
        (i) =>
          i.function === line.ingredient.function &&
          i.costPerKg < line.ingredient.costPerKg * 0.6 &&
          i.dogCompatibility !== "avoid",
      );

      if (cheaper) {
        suggestions.push({
          type: "cost",
          change: `Sustituir ${line.ingredient.commonName} ($${line.ingredient.costPerKg}/kg) por ${cheaper.commonName} ($${cheaper.costPerKg}/kg)`,
          impact: {
            cost: `Ahorro estimado: $${(((line.ingredient.costPerKg - cheaper.costPerKg) * line.percentage) / 100).toFixed(2)}/kg de fórmula.`,
            sensory: "Puede afectar sensorialidad; validar con panel.",
            stability: cheaper.restrictions ?? "Revisar compatibilidad.",
            claim: "Verificar impacto en claims de naturalidad/premium.",
          },
        });
      }
    }
  }

  const anionicTotal = lines
    .filter((l) => l.ingredient.ionicCharge === "anionic")
    .reduce((s, l) => s + l.percentage, 0);

  if (anionicTotal > 8) {
    suggestions.push({
      type: "irritation",
      change: "Reducir tensioactivo aniónico total para menor irritación",
      impact: {
        sensory: "Puede reducir espuma y limpieza percibida.",
        stability: "Reformular con glucósidos para compensar.",
        claim: "Permite claim de limpieza suave.",
      },
    });
  }

  return suggestions;
}

export function suggestReformulation(
  lines: FormulaLineInput[],
  goal: "natural" | "cost" | "irritation",
): ReformulationSuggestion[] {
  switch (goal) {
    case "natural":
      return suggestNaturalReformulation(lines);
    case "cost":
      return suggestCostReduction(lines);
    case "irritation":
      return suggestCostReduction(lines).filter((s) => s.type === "irritation");
    default:
      return [];
  }
}
