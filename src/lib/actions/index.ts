import { z } from "zod";
import {
  getAllIngredients,
  getAllIncompatibilities,
  getAllClaimRules,
  getIngredientById,
  upsertIngredient,
  deleteIngredient,
  searchIngredients,
} from "@/lib/data/repository";
import { validateFormula, type FormulaLineInput } from "@/lib/validation/engine";
import { validateClaim, validateMultipleClaims } from "@/lib/claims/validator";
import { scoreFromLines } from "@/lib/scoring/calculator";
import { assessStability, assessMicrobiology } from "@/lib/stability/assessor";
import {
  calculateCostScenarios,
  findMostExpensiveIngredients,
} from "@/lib/costs/calculator";
import { suggestReformulation } from "@/lib/reformulation/suggester";
import { seedRegulatoryProfiles, dogProductTemplates } from "@/data/seed";
import type {
  ProductType,
  TargetAudience,
  ProductFormat,
  Positioning,
  Market,
} from "@/types";

export interface StoredFormula {
  id: string;
  name: string;
  description?: string;
  productType: ProductType;
  targetAudience: TargetAudience;
  productFormat: ProductFormat;
  positioning: Positioning[];
  targetPh?: number;
  claims: string[];
  market: Market;
  lines: Array<{
    ingredientId: string;
    phase: string;
    percentage: number;
    functionInFormula?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const formulasStore: StoredFormula[] = [];
let demoSeeded = false;

async function ensureDemoFormula() {
  if (!demoSeeded && formulasStore.length === 0) {
    demoSeeded = true;
    await createFromTemplate(0);
  }
}

const formulaSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  productType: z.enum([
    "shampoo",
    "espuma",
    "crema",
    "serum",
    "balm",
    "spray",
    "gel",
    "lotion",
    "tonic",
    "solid",
  ]),
  targetAudience: z.enum([
    "dog",
    "dog_puppy",
    "dog_sensitive",
    "dog_long_coat",
    "human_adult",
    "human_sensitive",
    "human_oily_hair",
    "human_dry_skin",
  ]),
  productFormat: z.enum(["liquid", "foam", "emulsion", "gel", "solid", "spray"]),
  positioning: z.array(z.string()).default([]),
  targetPh: z.number().optional(),
  claims: z.array(z.string()).default([]),
  market: z
    .enum(["colombia", "can", "usa", "eu", "mexico", "brazil"])
    .default("colombia"),
  lines: z
    .array(
      z.object({
        ingredientId: z.string(),
        phase: z.string(),
        percentage: z.number().min(0).max(100),
        functionInFormula: z.string().optional(),
      }),
    )
    .min(1),
});

async function buildFormulaLines(
  lines: StoredFormula["lines"],
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

export async function getFormulas(): Promise<StoredFormula[]> {
  await ensureDemoFormula();
  return formulasStore;
}

export async function getFormulaById(id: string): Promise<StoredFormula | undefined> {
  return formulasStore.find((f) => f.id === id);
}

export async function createFormula(
  input: z.infer<typeof formulaSchema>,
): Promise<StoredFormula> {
  const data = formulaSchema.parse(input);
  const now = new Date().toISOString();
  const formula: StoredFormula = {
    id: `formula-${Date.now()}`,
    ...data,
    positioning: data.positioning as Positioning[],
    createdAt: now,
    updatedAt: now,
  };
  formulasStore.push(formula);
  return formula;
}

export async function updateFormula(
  id: string,
  input: Partial<z.infer<typeof formulaSchema>>,
): Promise<StoredFormula | null> {
  const idx = formulasStore.findIndex((f) => f.id === id);
  if (idx < 0) return null;

  const updated = {
    ...formulasStore[idx],
    ...input,
    positioning: (input.positioning ?? formulasStore[idx].positioning) as Positioning[],
    updatedAt: new Date().toISOString(),
  };
  formulasStore[idx] = updated;
  return updated;
}

export async function deleteFormula(id: string): Promise<boolean> {
  const idx = formulasStore.findIndex((f) => f.id === id);
  if (idx < 0) return false;
  formulasStore.splice(idx, 1);
  return true;
}

export async function validateFormulaById(formulaId: string) {
  const formula = await getFormulaById(formulaId);
  if (!formula) throw new Error("Fórmula no encontrada");

  const lines = await buildFormulaLines(formula.lines);
  const incompatibilities = await getAllIncompatibilities();

  return validateFormula({
    lines,
    targetAudience: formula.targetAudience,
    targetPh: formula.targetPh,
    productFormat: formula.productFormat,
    positioning: formula.positioning,
    incompatibilities,
  });
}

export async function getFormulaAnalysis(formulaId: string) {
  const formula = await getFormulaById(formulaId);
  if (!formula) throw new Error("Fórmula no encontrada");

  const lines = await buildFormulaLines(formula.lines);
  const incompatibilities = await getAllIncompatibilities();
  const claimRules = await getAllClaimRules();

  const validationInput = {
    lines,
    targetAudience: formula.targetAudience,
    targetPh: formula.targetPh,
    productFormat: formula.productFormat,
    positioning: formula.positioning,
    incompatibilities,
  };

  const alerts = validateFormula(validationInput);
  const score = scoreFromLines(
    lines,
    formula.targetAudience,
    formula.claims,
    claimRules,
    validationInput,
  );
  const stability = assessStability(validationInput);
  const microbiology = assessMicrobiology(validationInput);
  const costs = calculateCostScenarios({ lines });
  const expensive = findMostExpensiveIngredients(lines);
  const claimResults = validateMultipleClaims(
    formula.claims,
    claimRules,
    formula.targetAudience.startsWith("dog") ? "dog" : "human",
  );

  return {
    formula,
    alerts,
    score,
    stability,
    microbiology,
    costs,
    expensive,
    claimResults,
  };
}

export async function validateClaimsAction(
  claimText: string,
  species: "dog" | "human" = "dog",
) {
  const rules = await getAllClaimRules();
  return validateClaim(claimText, rules, species);
}

export async function getRegulatoryProfiles() {
  return seedRegulatoryProfiles;
}

export async function getProductTemplates() {
  return dogProductTemplates;
}

export async function createFromTemplate(templateIndex: number) {
  const template = dogProductTemplates[templateIndex];
  if (!template) throw new Error("Plantilla no encontrada");

  return createFormula({
    name: template.name,
    productType: template.productType,
    targetAudience: template.targetAudience,
    productFormat: template.productFormat,
    positioning: template.positioning,
    targetPh: template.targetPh,
    claims: ["Limpia y refresca suavemente", "Ayuda al cuidado del pelaje"],
    market: "colombia",
    lines: template.ingredients,
  });
}

export async function getReformulationSuggestions(
  formulaId: string,
  goal: "natural" | "cost" | "irritation",
) {
  const formula = await getFormulaById(formulaId);
  if (!formula) throw new Error("Fórmula no encontrada");
  const lines = await buildFormulaLines(formula.lines);
  return suggestReformulation(lines, goal);
}

export {
  getAllIngredients,
  getIngredientById,
  searchIngredients,
  upsertIngredient,
  deleteIngredient,
  getAllClaimRules,
};
