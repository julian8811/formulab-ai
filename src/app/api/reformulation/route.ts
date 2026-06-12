import { NextRequest, NextResponse } from "next/server";
import { getFormulaById } from "@/lib/actions";
import { suggestReformulationWithAi } from "@/lib/ai/reformulation-agent";
import { suggestReformulation } from "@/lib/reformulation/suggester";
import { getAllIngredients } from "@/lib/data/repository";
import type { FormulaLineInput } from "@/lib/validation/engine";

async function buildFormulaLines(
  lines: {
    ingredientId: string;
    phase: string;
    percentage: number;
    functionInFormula?: string;
  }[],
): Promise<FormulaLineInput[]> {
  const ingredients = await getAllIngredients();
  return lines
    .map((line) => {
      const ingredient = ingredients.find((i) => i.id === line.ingredientId);
      if (!ingredient) return null;
      return {
        ingredientId: line.ingredientId,
        ingredient,
        phase: line.phase,
        percentage: line.percentage,
        functionInFormula: line.functionInFormula,
      };
    })
    .filter(Boolean) as FormulaLineInput[];
}

export async function GET(request: NextRequest) {
  const formulaId = request.nextUrl.searchParams.get("formulaId");
  const goal = request.nextUrl.searchParams.get("goal") as
    | "natural"
    | "cost"
    | "irritation";

  if (!formulaId || !goal) {
    return NextResponse.json({ error: "Parámetros requeridos" }, { status: 400 });
  }

  try {
    const formula = await getFormulaById(formulaId);
    if (!formula) {
      return NextResponse.json({ error: "Fórmula no encontrada" }, { status: 404 });
    }

    const lines = await buildFormulaLines(formula.lines);

    try {
      const { suggestions, source } = await suggestReformulationWithAi(lines, goal);
      return NextResponse.json({ suggestions, source });
    } catch {
      const suggestions = suggestReformulation(lines, goal);
      return NextResponse.json({ suggestions, source: "rules" });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 400 },
    );
  }
}
