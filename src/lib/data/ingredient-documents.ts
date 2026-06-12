import { isDatabaseConfigured, getDb } from "@/db";
import { ingredientDocuments } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { DocumentType } from "@/types";

export interface IngredientDocument {
  id: string;
  ingredientId: string;
  documentType: DocumentType;
  fileName: string;
  storagePath: string;
  uploadedAt: string;
}

const memoryDocs: IngredientDocument[] = [];

export async function getIngredientDocuments(
  ingredientId: string,
): Promise<IngredientDocument[]> {
  if (!isDatabaseConfigured()) {
    return memoryDocs.filter((d) => d.ingredientId === ingredientId);
  }

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(ingredientDocuments)
      .where(eq(ingredientDocuments.ingredientId, ingredientId));

    return rows.map((r) => ({
      id: r.id,
      ingredientId: r.ingredientId,
      documentType: r.documentType,
      fileName: r.fileName,
      storagePath: r.storagePath,
      uploadedAt: r.uploadedAt.toISOString(),
    }));
  } catch {
    return memoryDocs.filter((d) => d.ingredientId === ingredientId);
  }
}

export async function saveIngredientDocument(
  data: Omit<IngredientDocument, "id" | "uploadedAt">,
): Promise<IngredientDocument> {
  if (!isDatabaseConfigured()) {
    const doc: IngredientDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    memoryDocs.push(doc);
    return doc;
  }

  const db = getDb();
  const [row] = await db
    .insert(ingredientDocuments)
    .values({
      ingredientId: data.ingredientId,
      documentType: data.documentType,
      fileName: data.fileName,
      storagePath: data.storagePath,
    })
    .returning();

  return {
    id: row.id,
    ingredientId: row.ingredientId,
    documentType: row.documentType,
    fileName: row.fileName,
    storagePath: row.storagePath,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

export async function deleteIngredientDocument(id: string): Promise<void> {
  if (!isDatabaseConfigured()) {
    const idx = memoryDocs.findIndex((d) => d.id === id);
    if (idx >= 0) memoryDocs.splice(idx, 1);
    return;
  }

  const db = getDb();
  await db.delete(ingredientDocuments).where(eq(ingredientDocuments.id, id));
}
