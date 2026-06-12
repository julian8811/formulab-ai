/**
 * CosIng / IFRA integration — importa datos regulatorios a la base de ingredientes.
 */

import { upsertIngredient, getAllIngredients } from "@/lib/data/repository";
import type { SeedIngredient } from "@/data/seed";

export interface CosIngEntry {
  inciName: string;
  function: string;
  restrictions?: string;
  casNumber?: string;
}

export interface IFRAEntry {
  ingredientName: string;
  category: string;
  maxLevel: number;
  restrictions?: string;
}

function slugFromInci(inciName: string): string {
  return `cosing-${inciName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function mapCosIngToIngredient(
  entry: CosIngEntry,
): Omit<SeedIngredient, "id"> & { id?: string } {
  const existing = entry.inciName;
  return {
    id: slugFromInci(entry.inciName),
    commercialName: entry.inciName,
    inciName: entry.inciName,
    commonName: entry.inciName,
    function: entry.function,
    supplier: "CosIng",
    origin: "synthetic",
    ionicCharge: "non_ionic",
    minPercentage: 0,
    maxPercentage: 100,
    solubility: "Variable",
    restrictions: entry.restrictions,
    allergens: [],
    biodegradable: true,
    certifications: ["CosIng"],
    approvedForHuman: true,
    recommendedUse: `Referencia CosIng — ${entry.function}`,
    dogCompatibility: "caution",
    lickRisk: "medium",
    fragranceRisk: "low",
    heatSensitive: false,
    costPerKg: 0,
    naturalOriginIndex: 0,
  };
}

function mapIFRAToIngredient(
  entry: IFRAEntry,
): Omit<SeedIngredient, "id"> & { id?: string } {
  return {
    id: `ifra-${entry.ingredientName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    commercialName: entry.ingredientName,
    inciName: entry.ingredientName,
    commonName: entry.ingredientName,
    function: "Componente de fragancia (IFRA)",
    supplier: "IFRA",
    origin: "vegetal",
    ionicCharge: "non_ionic",
    minPercentage: 0,
    maxPercentage: entry.maxLevel,
    solubility: "Aceite/alcohol",
    restrictions:
      entry.restrictions ?? `IFRA cat. ${entry.category} — máx ${entry.maxLevel}%`,
    allergens: [entry.ingredientName],
    biodegradable: true,
    certifications: ["IFRA"],
    approvedForHuman: true,
    recommendedUse: `Fragancia — límite IFRA categoría ${entry.category}`,
    dogCompatibility: "caution",
    lickRisk: "medium",
    fragranceRisk: "high",
    heatSensitive: false,
    costPerKg: 0,
    naturalOriginIndex: 50,
  };
}

export async function fetchCosIngReference(
  inciName: string,
): Promise<CosIngEntry | null> {
  const all = await getAllIngredients();
  const match = all.find((i) => i.inciName.toLowerCase() === inciName.toLowerCase());
  if (!match) return null;
  return {
    inciName: match.inciName,
    function: match.function,
    restrictions: match.restrictions,
  };
}

export async function fetchIFRALimits(
  fragranceName: string,
  category: string,
): Promise<IFRAEntry | null> {
  const all = await getAllIngredients();
  const match = all.find(
    (i) =>
      i.inciName.toLowerCase().includes(fragranceName.toLowerCase()) &&
      i.restrictions?.includes(category),
  );
  if (!match) return null;
  return {
    ingredientName: match.inciName,
    category,
    maxLevel: Number(match.maxPercentage),
    restrictions: match.restrictions,
  };
}

export async function importCosIngBatch(
  entries: CosIngEntry[],
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const existing = await getAllIngredients();
  const existingInci = new Set(existing.map((i) => i.inciName.toLowerCase()));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    if (existingInci.has(entry.inciName.toLowerCase())) {
      skipped++;
      continue;
    }
    try {
      await upsertIngredient(mapCosIngToIngredient(entry));
      existingInci.add(entry.inciName.toLowerCase());
      imported++;
    } catch (e) {
      errors.push(`${entry.inciName}: ${e instanceof Error ? e.message : "Error"}`);
    }
  }

  return { imported, skipped, errors };
}

export async function importIFRABatch(
  entries: IFRAEntry[],
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const existing = await getAllIngredients();
  const existingIds = new Set(existing.map((i) => i.id));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    const mapped = mapIFRAToIngredient(entry);
    if (existingIds.has(mapped.id!)) {
      skipped++;
      continue;
    }
    try {
      await upsertIngredient(mapped);
      existingIds.add(mapped.id!);
      imported++;
    } catch (e) {
      errors.push(`${entry.ingredientName}: ${e instanceof Error ? e.message : "Error"}`);
    }
  }

  return { imported, skipped, errors };
}
