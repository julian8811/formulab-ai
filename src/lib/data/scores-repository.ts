import { isDatabaseConfigured, getDb } from "@/db";
import { formulaScores, costScenarios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { FormulaScore, CostScenario } from "@/types";

export interface StoredFormulaScore extends FormulaScore {
  id: string;
  calculatedAt: string;
}

export interface LatestScoresResult {
  score: StoredFormulaScore;
  costs: CostScenario[];
}

export function isScoresDbAvailable(): boolean {
  return isDatabaseConfigured();
}

export async function saveFormulaAnalysis(
  formulaVersionId: string,
  score: FormulaScore,
  costs: CostScenario[],
): Promise<void> {
  const db = getDb();

  await db.insert(formulaScores).values({
    formulaVersionId,
    safety: score.safety,
    stability: score.stability,
    regulatory: score.regulatory,
    naturalness: score.naturalness,
    cost: score.cost,
    sensory: score.sensory,
    microbiologicalRisk: score.microbiologicalRisk,
    claimsRisk: score.claimsRisk,
    summary: score.summary,
  });

  await db
    .delete(costScenarios)
    .where(eq(costScenarios.formulaVersionId, formulaVersionId));

  if (costs.length > 0) {
    await db.insert(costScenarios).values(
      costs.map((c) => ({
        formulaVersionId,
        name: c.name,
        batchSizeKg: String(c.batchSizeKg),
        formulaCost: String(c.formulaCost),
        packagingCost: String(c.packagingCost),
        totalCost: String(c.totalCost),
      })),
    );
  }
}

export async function getLatestScores(
  formulaVersionId: string,
): Promise<LatestScoresResult | null> {
  const db = getDb();

  const [scoreRow] = await db
    .select()
    .from(formulaScores)
    .where(eq(formulaScores.formulaVersionId, formulaVersionId))
    .orderBy(desc(formulaScores.calculatedAt))
    .limit(1);

  if (!scoreRow) return null;

  const costRows = await db
    .select()
    .from(costScenarios)
    .where(eq(costScenarios.formulaVersionId, formulaVersionId));

  return {
    score: {
      id: scoreRow.id,
      safety: scoreRow.safety,
      stability: scoreRow.stability,
      regulatory: scoreRow.regulatory,
      naturalness: scoreRow.naturalness,
      cost: scoreRow.cost,
      sensory: scoreRow.sensory,
      microbiologicalRisk: scoreRow.microbiologicalRisk,
      claimsRisk: scoreRow.claimsRisk,
      summary: scoreRow.summary ?? "",
      calculatedAt: scoreRow.calculatedAt.toISOString(),
    },
    costs: costRows.map((c) => ({
      name: c.name,
      batchSizeKg: Number(c.batchSizeKg),
      formulaCost: Number(c.formulaCost),
      packagingCost: Number(c.packagingCost),
      totalCost: Number(c.totalCost),
    })),
  };
}
