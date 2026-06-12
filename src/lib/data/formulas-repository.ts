import { isDatabaseConfigured, getDb } from "@/db";
import { formulas, formulaVersions, formulaIngredients } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormulaInput {
  name: string;
  description?: string;
  productType: ProductType;
  targetAudience: TargetAudience;
  productFormat: ProductFormat;
  positioning?: Positioning[];
  targetPh?: number;
  claims?: string[];
  market?: Market;
  userId?: string;
  projectId?: string;
  lines: StoredFormula["lines"];
}

function rowToFormula(
  formula: typeof formulas.$inferSelect,
  version: typeof formulaVersions.$inferSelect,
  lines: (typeof formulaIngredients.$inferSelect)[],
): StoredFormula {
  return {
    id: formula.id,
    name: formula.name,
    description: formula.description ?? undefined,
    productType: formula.productType,
    targetAudience: formula.targetAudience,
    productFormat: formula.productFormat,
    positioning: (formula.positioning as Positioning[]) ?? [],
    targetPh: formula.targetPh ? Number(formula.targetPh) : undefined,
    claims: (formula.claims as string[]) ?? [],
    market: formula.market ?? "colombia",
    versionNumber: version.versionNumber,
    lines: lines.map((l) => ({
      ingredientId: l.ingredientId,
      phase: l.phase,
      percentage: Number(l.percentage),
      functionInFormula: l.functionInFormula ?? undefined,
    })),
    createdAt: formula.createdAt.toISOString(),
    updatedAt: formula.updatedAt.toISOString(),
  };
}

async function loadFormulaWithLines(
  formulaId: string,
): Promise<StoredFormula | undefined> {
  const db = getDb();
  const [formula] = await db
    .select()
    .from(formulas)
    .where(eq(formulas.id, formulaId))
    .limit(1);

  if (!formula) return undefined;

  const [version] = await db
    .select()
    .from(formulaVersions)
    .where(eq(formulaVersions.formulaId, formulaId))
    .orderBy(desc(formulaVersions.versionNumber))
    .limit(1);

  if (!version) return undefined;

  const lines = await db
    .select()
    .from(formulaIngredients)
    .where(eq(formulaIngredients.formulaVersionId, version.id))
    .orderBy(formulaIngredients.sortOrder);

  return rowToFormula(formula, version, lines);
}

async function getFormulaOwnerId(formulaId: string): Promise<string | null | undefined> {
  const db = getDb();
  const [row] = await db
    .select({ userId: formulas.userId })
    .from(formulas)
    .where(eq(formulas.id, formulaId))
    .limit(1);
  return row?.userId;
}

export async function canAccessFormula(
  formulaId: string,
  userId?: string,
): Promise<boolean> {
  if (!userId) return true;

  const ownerId = await getFormulaOwnerId(formulaId);
  if (ownerId === undefined) return false;
  if (ownerId === null) return false;
  return ownerId === userId;
}

export async function dbGetFormulas(
  userId?: string,
  projectId?: string,
): Promise<StoredFormula[]> {
  const db = getDb();
  const filters = [];
  if (userId) filters.push(eq(formulas.userId, userId));
  if (projectId) filters.push(eq(formulas.projectId, projectId));

  const allFormulas =
    filters.length === 0
      ? await db.select().from(formulas).orderBy(desc(formulas.updatedAt))
      : filters.length === 1
        ? await db
            .select()
            .from(formulas)
            .where(filters[0])
            .orderBy(desc(formulas.updatedAt))
        : await db
            .select()
            .from(formulas)
            .where(and(filters[0], filters[1]))
            .orderBy(desc(formulas.updatedAt));

  const results: StoredFormula[] = [];
  for (const f of allFormulas) {
    const stored = await loadFormulaWithLines(f.id);
    if (stored) results.push(stored);
  }
  return results;
}

export async function dbGetFormulaById(
  id: string,
  userId?: string,
): Promise<StoredFormula | undefined> {
  if (userId && !(await canAccessFormula(id, userId))) {
    return undefined;
  }
  return loadFormulaWithLines(id);
}

export interface FormulaVersionSummary {
  id: string;
  versionNumber: number;
  notes: string | null;
  createdAt: string;
}

export async function dbListFormulaVersions(
  formulaId: string,
): Promise<FormulaVersionSummary[]> {
  const db = getDb();
  const versions = await db
    .select()
    .from(formulaVersions)
    .where(eq(formulaVersions.formulaId, formulaId))
    .orderBy(desc(formulaVersions.versionNumber));

  return versions.map((v) => ({
    id: v.id,
    versionNumber: v.versionNumber,
    notes: v.notes,
    createdAt: v.createdAt.toISOString(),
  }));
}

export async function dbGetFormulaByVersion(
  formulaId: string,
  versionNumber: number,
  userId?: string,
): Promise<StoredFormula | undefined> {
  if (userId && !(await canAccessFormula(formulaId, userId))) {
    return undefined;
  }
  const db = getDb();
  const [formula] = await db
    .select()
    .from(formulas)
    .where(eq(formulas.id, formulaId))
    .limit(1);

  if (!formula) return undefined;

  const [version] = await db
    .select()
    .from(formulaVersions)
    .where(
      and(
        eq(formulaVersions.formulaId, formulaId),
        eq(formulaVersions.versionNumber, versionNumber),
      ),
    )
    .limit(1);

  if (!version) return undefined;

  const lines = await db
    .select()
    .from(formulaIngredients)
    .where(eq(formulaIngredients.formulaVersionId, version.id))
    .orderBy(formulaIngredients.sortOrder);

  return rowToFormula(formula, version, lines);
}

export async function dbGetFormulaVersionId(
  formulaId: string,
  versionNumber: number,
): Promise<string | undefined> {
  const db = getDb();
  const [version] = await db
    .select({ id: formulaVersions.id })
    .from(formulaVersions)
    .where(
      and(
        eq(formulaVersions.formulaId, formulaId),
        eq(formulaVersions.versionNumber, versionNumber),
      ),
    )
    .limit(1);

  return version?.id;
}

export async function dbCreateFormula(input: CreateFormulaInput): Promise<StoredFormula> {
  const db = getDb();

  const [formula] = await db
    .insert(formulas)
    .values({
      name: input.name,
      description: input.description,
      productType: input.productType,
      targetAudience: input.targetAudience,
      productFormat: input.productFormat,
      positioning: input.positioning ?? [],
      targetPh: input.targetPh != null ? String(input.targetPh) : null,
      claims: input.claims ?? [],
      market: input.market ?? "colombia",
      userId: input.userId,
      projectId: input.projectId,
    })
    .returning();

  const [version] = await db
    .insert(formulaVersions)
    .values({ formulaId: formula.id, versionNumber: 1, notes: "Versión inicial" })
    .returning();

  if (input.lines.length > 0) {
    await db.insert(formulaIngredients).values(
      input.lines.map((line, i) => ({
        formulaVersionId: version.id,
        ingredientId: line.ingredientId,
        phase: line.phase,
        percentage: String(line.percentage),
        functionInFormula: line.functionInFormula,
        sortOrder: i,
      })),
    );
  }

  const stored = await loadFormulaWithLines(formula.id);
  if (!stored) throw new Error("Error al crear fórmula");
  return stored;
}

export async function dbUpdateFormula(
  id: string,
  input: Partial<CreateFormulaInput>,
  userId?: string,
): Promise<StoredFormula | null> {
  if (userId && !(await canAccessFormula(id, userId))) {
    return null;
  }
  const existing = await loadFormulaWithLines(id);
  if (!existing) return null;

  const db = getDb();

  await db
    .update(formulas)
    .set({
      ...(input.name != null && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.productType != null && { productType: input.productType }),
      ...(input.targetAudience != null && { targetAudience: input.targetAudience }),
      ...(input.productFormat != null && { productFormat: input.productFormat }),
      ...(input.positioning != null && { positioning: input.positioning }),
      ...(input.targetPh !== undefined && {
        targetPh: input.targetPh != null ? String(input.targetPh) : null,
      }),
      ...(input.claims != null && { claims: input.claims }),
      ...(input.market != null && { market: input.market }),
      updatedAt: new Date(),
    })
    .where(eq(formulas.id, id));

  if (input.lines) {
    const [currentVersion] = await db
      .select()
      .from(formulaVersions)
      .where(eq(formulaVersions.formulaId, id))
      .orderBy(desc(formulaVersions.versionNumber))
      .limit(1);

    const newVersionNumber = (currentVersion?.versionNumber ?? 0) + 1;

    const [version] = await db
      .insert(formulaVersions)
      .values({
        formulaId: id,
        versionNumber: newVersionNumber,
        notes: "Actualización de composición",
      })
      .returning();

    await db.insert(formulaIngredients).values(
      input.lines.map((line, i) => ({
        formulaVersionId: version.id,
        ingredientId: line.ingredientId,
        phase: line.phase,
        percentage: String(line.percentage),
        functionInFormula: line.functionInFormula,
        sortOrder: i,
      })),
    );
  }

  return (await loadFormulaWithLines(id)) ?? null;
}

export async function dbDeleteFormula(id: string, userId?: string): Promise<boolean> {
  if (userId && !(await canAccessFormula(id, userId))) {
    return false;
  }
  const db = getDb();
  await db.delete(formulas).where(eq(formulas.id, id));
  return true;
}

export function isFormulasDbAvailable(): boolean {
  return isDatabaseConfigured();
}
