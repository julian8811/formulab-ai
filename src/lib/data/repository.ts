import { seedIngredients, seedIncompatibilities, seedClaimRules } from "@/data/seed";
import type { SeedIngredient, SeedIncompatibility, SeedClaimRule } from "@/data/seed";
import { isDatabaseConfigured, getDb } from "@/db";
import { ingredients, incompatibilities, claimsRules } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function getAllIngredients(): Promise<SeedIngredient[]> {
  if (!isDatabaseConfigured()) {
    return seedIngredients;
  }

  try {
    const db = getDb();
    const rows = await db.select().from(ingredients);
    if (rows.length === 0) return seedIngredients;

    return rows.map((r) => ({
      id: r.id,
      commercialName: r.commercialName,
      inciName: r.inciName,
      commonName: r.commonName ?? r.inciName,
      function: r.function,
      supplier: r.supplier ?? "",
      origin: r.origin,
      ionicCharge: r.ionicCharge,
      minPercentage: Number(r.minPercentage ?? 0),
      maxPercentage: Number(r.maxPercentage ?? 100),
      phStabilityMin: r.phStabilityMin ? Number(r.phStabilityMin) : undefined,
      phStabilityMax: r.phStabilityMax ? Number(r.phStabilityMax) : undefined,
      solubility: r.solubility ?? "",
      restrictions: r.restrictions ?? undefined,
      allergens: (r.allergens as string[]) ?? [],
      biodegradable: r.biodegradable ?? false,
      certifications: (r.certifications as string[]) ?? [],
      approvedForHuman: r.approvedForHuman ?? true,
      recommendedUse: r.recommendedUse ?? "",
      dogCompatibility: r.dogCompatibility,
      lickRisk: r.lickRisk,
      fragranceRisk: r.fragranceRisk,
      heatSensitive: r.heatSensitive ?? false,
      costPerKg: Number(r.costPerKg ?? 0),
      naturalOriginIndex: Number(r.naturalOriginIndex ?? 0),
    }));
  } catch {
    return seedIngredients;
  }
}

export async function getIngredientById(id: string): Promise<SeedIngredient | undefined> {
  const all = await getAllIngredients();
  return all.find((i) => i.id === id);
}

export async function searchIngredients(query: string): Promise<SeedIngredient[]> {
  const all = await getAllIngredients();
  const q = query.toLowerCase();
  return all.filter(
    (i) =>
      i.inciName.toLowerCase().includes(q) ||
      i.commonName.toLowerCase().includes(q) ||
      i.commercialName.toLowerCase().includes(q) ||
      i.function.toLowerCase().includes(q),
  );
}

export async function getAllIncompatibilities(): Promise<SeedIncompatibility[]> {
  if (!isDatabaseConfigured()) return seedIncompatibilities;

  try {
    const db = getDb();
    const rows = await db.select().from(incompatibilities);
    if (rows.length === 0) return seedIncompatibilities;

    return rows.map((r) => ({
      id: r.id,
      ruleKey: r.ruleKey,
      ingredientAId: r.ingredientAId ?? undefined,
      ingredientBId: r.ingredientBId ?? undefined,
      ionicChargeA: r.ionicChargeA ?? undefined,
      ionicChargeB: r.ionicChargeB ?? undefined,
      category: r.category,
      severity: r.severity,
      message: r.message,
      suggestion: r.suggestion ?? "",
    }));
  } catch {
    return seedIncompatibilities;
  }
}

export async function getAllClaimRules(): Promise<SeedClaimRule[]> {
  if (!isDatabaseConfigured()) return seedClaimRules;

  try {
    const db = getDb();
    const rows = await db.select().from(claimsRules);
    if (rows.length === 0) return seedClaimRules;

    return rows.map((r) => ({
      id: r.id,
      pattern: r.pattern,
      riskLevel: r.riskLevel,
      reason: r.reason,
      safeAlternative: r.safeAlternative,
      species: r.species,
      requiresEvidence: r.requiresEvidence ?? false,
      evidenceQuestion: r.evidenceQuestion ?? undefined,
      category: r.category ?? "",
    }));
  } catch {
    return seedClaimRules;
  }
}

export async function upsertIngredient(
  data: Omit<SeedIngredient, "id"> & { id?: string },
): Promise<SeedIngredient> {
  if (!isDatabaseConfigured()) {
    const id = data.id ?? `ing-${Date.now()}`;
    const ingredient = { ...data, id } as SeedIngredient;
    seedIngredients.push(ingredient);
    return ingredient;
  }

  const db = getDb();
  const values = {
    id: data.id,
    commercialName: data.commercialName,
    inciName: data.inciName,
    commonName: data.commonName,
    function: data.function,
    supplier: data.supplier,
    origin: data.origin,
    ionicCharge: data.ionicCharge,
    minPercentage: String(data.minPercentage),
    maxPercentage: String(data.maxPercentage),
    phStabilityMin: data.phStabilityMin ? String(data.phStabilityMin) : null,
    phStabilityMax: data.phStabilityMax ? String(data.phStabilityMax) : null,
    solubility: data.solubility,
    restrictions: data.restrictions,
    allergens: data.allergens,
    biodegradable: data.biodegradable,
    certifications: data.certifications,
    approvedForHuman: data.approvedForHuman,
    recommendedUse: data.recommendedUse,
    dogCompatibility: data.dogCompatibility,
    lickRisk: data.lickRisk,
    fragranceRisk: data.fragranceRisk,
    heatSensitive: data.heatSensitive,
    costPerKg: String(data.costPerKg),
    naturalOriginIndex: String(data.naturalOriginIndex),
    updatedAt: new Date(),
  };

  const { id: _id, ...updateFields } = values;
  const [row] = data.id
    ? await db
        .insert(ingredients)
        .values(values)
        .onConflictDoUpdate({
          target: ingredients.id,
          set: updateFields,
        })
        .returning()
    : await db.insert(ingredients).values(values).returning();

  return {
    id: row.id,
    commercialName: row.commercialName,
    inciName: row.inciName,
    commonName: row.commonName ?? row.inciName,
    function: row.function,
    supplier: row.supplier ?? "",
    origin: row.origin,
    ionicCharge: row.ionicCharge,
    minPercentage: Number(row.minPercentage),
    maxPercentage: Number(row.maxPercentage),
    solubility: row.solubility ?? "",
    allergens: (row.allergens as string[]) ?? [],
    biodegradable: row.biodegradable ?? false,
    certifications: (row.certifications as string[]) ?? [],
    approvedForHuman: row.approvedForHuman ?? true,
    recommendedUse: row.recommendedUse ?? "",
    dogCompatibility: row.dogCompatibility,
    lickRisk: row.lickRisk,
    fragranceRisk: row.fragranceRisk,
    heatSensitive: row.heatSensitive ?? false,
    costPerKg: Number(row.costPerKg),
    naturalOriginIndex: Number(row.naturalOriginIndex),
  };
}

export async function deleteIngredient(id: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    const idx = seedIngredients.findIndex((i) => i.id === id);
    if (idx >= 0) {
      seedIngredients.splice(idx, 1);
      return true;
    }
    return false;
  }

  const db = getDb();
  await db.delete(ingredients).where(eq(ingredients.id, id));
  return true;
}

export async function dbSearchIngredients(query: string) {
  if (!isDatabaseConfigured()) return searchIngredients(query);

  const db = getDb();
  return db
    .select()
    .from(ingredients)
    .where(
      or(
        ilike(ingredients.inciName, `%${query}%`),
        ilike(ingredients.commonName, `%${query}%`),
        ilike(ingredients.commercialName, `%${query}%`),
      ),
    );
}
