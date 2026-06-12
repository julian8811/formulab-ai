import type { FormulaLineInput } from "@/lib/validation/engine";
import type { CostScenario } from "@/types";

export interface CostInput {
  lines: FormulaLineInput[];
  packagingCostPerUnit?: number;
  unitsPerBatch?: number;
  wastePercent?: number;
  manufacturingCostPerKg?: number;
  testingCost?: number;
  marginPercent?: number;
}

const BATCH_SCENARIOS = [
  { name: "Prototipo", batchSizeKg: 1 },
  { name: "Piloto", batchSizeKg: 10 },
  { name: "Comercial", batchSizeKg: 100 },
];

export function calculateCostPerKg(lines: FormulaLineInput[]): number {
  return lines.reduce((sum, l) => sum + (l.ingredient.costPerKg * l.percentage) / 100, 0);
}

export function calculateCostScenarios(input: CostInput): CostScenario[] {
  const {
    lines,
    packagingCostPerUnit = 2.5,
    unitsPerBatch = 50,
    wastePercent = 5,
    manufacturingCostPerKg = 3,
    testingCost = 0,
    marginPercent = 40,
  } = input;

  const costPerKg = calculateCostPerKg(lines);

  return BATCH_SCENARIOS.map(({ name, batchSizeKg }) => {
    const wasteFactor = 1 + wastePercent / 100;
    const formulaCost = costPerKg * batchSizeKg * wasteFactor;
    const packagingCost =
      batchSizeKg >= 10 ? packagingCostPerUnit * unitsPerBatch * (batchSizeKg / 10) : 15;
    const manufacturingCost = manufacturingCostPerKg * batchSizeKg;
    const testCost = batchSizeKg === 1 ? testingCost || 150 : testingCost || 0;
    const totalCost = formulaCost + packagingCost + manufacturingCost + testCost;

    return {
      name,
      batchSizeKg,
      formulaCost: Math.round(formulaCost * 100) / 100,
      packagingCost: Math.round(packagingCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      costPerUnit:
        batchSizeKg >= 10
          ? Math.round((totalCost / (unitsPerBatch * (batchSizeKg / 10))) * 100) / 100
          : undefined,
    };
  });
}

export function findMostExpensiveIngredients(
  lines: FormulaLineInput[],
  limit = 5,
): Array<{ name: string; costContribution: number; percentage: number }> {
  return lines
    .map((l) => ({
      name: l.ingredient.commonName,
      costContribution: (l.ingredient.costPerKg * l.percentage) / 100,
      percentage: l.percentage,
    }))
    .sort((a, b) => b.costContribution - a.costContribution)
    .slice(0, limit);
}
