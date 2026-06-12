import { generateAiText, isAiConfigured } from "@/lib/ai/config";
import { suggestReformulation } from "@/lib/reformulation/suggester";
import type { FormulaLineInput } from "@/lib/validation/engine";
import type { ReformulationSuggestion } from "@/types";

const GOAL_LABELS: Record<"natural" | "cost" | "irritation", string> = {
  natural: "aumentar naturalidad y origen vegetal",
  cost: "reducir costo sin sacrificar estabilidad",
  irritation: "reducir irritación y tensioactivos agresivos",
};

function buildFormulaSummary(lines: FormulaLineInput[]): string {
  return lines
    .map(
      (l) =>
        `- ${l.ingredient.commonName} (${l.ingredient.inciName}): ${l.percentage}% — función: ${l.ingredient.function}, costo $${l.ingredient.costPerKg}/kg, naturalidad ${l.ingredient.naturalOriginIndex}%`,
    )
    .join("\n");
}

function parseSuggestionsFromText(
  text: string,
  goal: "natural" | "cost" | "irritation",
): ReformulationSuggestion[] | null {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as unknown;
    if (!Array.isArray(parsed)) return null;

    const suggestions: ReformulationSuggestion[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      if (typeof obj.change !== "string") continue;

      const impact =
        obj.impact && typeof obj.impact === "object"
          ? (obj.impact as ReformulationSuggestion["impact"])
          : {};

      suggestions.push({
        type:
          (obj.type as ReformulationSuggestion["type"]) ??
          (goal === "irritation" ? "irritation" : goal),
        change: obj.change,
        impact,
      });
    }

    return suggestions.length > 0 ? suggestions : null;
  } catch {
    return null;
  }
}

export async function suggestReformulationWithAi(
  lines: FormulaLineInput[],
  goal: "natural" | "cost" | "irritation",
): Promise<{ suggestions: ReformulationSuggestion[]; source: "ai" | "rules" }> {
  if (!isAiConfigured() || lines.length === 0) {
    return { suggestions: suggestReformulation(lines, goal), source: "rules" };
  }

  const system = `Eres un formulador cosmético experto. Responde SOLO con un array JSON válido de sugerencias de reformulación.
Cada elemento debe tener: type ("natural"|"cost"|"irritation"|"stability"), change (string), impact (objeto con claves opcionales: sensory, stability, claim, cost, naturalness).
Máximo 5 sugerencias concretas y accionables.`;

  const prompt = `Objetivo: ${GOAL_LABELS[goal]}

Fórmula actual:
${buildFormulaSummary(lines)}

Devuelve únicamente el array JSON de sugerencias.`;

  try {
    const { result } = await generateAiText({ system, prompt, maxOutputTokens: 1500 });
    const parsed = parseSuggestionsFromText(result.text, goal);

    if (parsed && parsed.length > 0) {
      return { suggestions: parsed, source: "ai" };
    }
  } catch {
    // fallback below
  }

  return { suggestions: suggestReformulation(lines, goal), source: "rules" };
}
