/**
 * CosIng / IFRA integration stubs for Phase 5.
 * Import ingredient data from external regulatory databases.
 */

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

export async function fetchCosIngReference(
  inciName: string,
): Promise<CosIngEntry | null> {
  // CosIng API/database integration point
  // Reference: https://ec.europa.eu/growth/tools-databases/cosing/
  console.info(`[CosIng] Lookup requested for: ${inciName}`);
  return null;
}

export async function fetchIFRALimits(
  fragranceName: string,
  category: string,
): Promise<IFRAEntry | null> {
  // IFRA standards integration point
  // Reference: https://ifrafragrance.org/safe-use/library
  console.info(`[IFRA] Lookup requested for: ${fragranceName} cat ${category}`);
  return null;
}

export async function importCosIngBatch(
  entries: CosIngEntry[],
): Promise<{ imported: number; skipped: number }> {
  return { imported: 0, skipped: entries.length };
}

export async function importIFRABatch(
  entries: IFRAEntry[],
): Promise<{ imported: number; skipped: number }> {
  return { imported: 0, skipped: entries.length };
}
