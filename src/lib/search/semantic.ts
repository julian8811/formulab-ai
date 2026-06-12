/**
 * Semantic search with pgvector (Phase 5).
 * Requires DATABASE_URL and pgvector extension enabled.
 */

import { embed } from "ai";
import { isDatabaseConfigured, getDb } from "@/db";
import { ingredients } from "@/db/schema";
import { sql } from "drizzle-orm";
import { searchIngredients } from "@/lib/data/repository";
import { getEmbeddingModel, isAiConfigured } from "@/lib/ai/config";

export async function semanticSearchIngredients(
  query: string,
  embedding?: number[],
  limit = 10,
) {
  if (!isDatabaseConfigured() || !embedding) {
    return searchIngredients(query);
  }

  try {
    const db = getDb();
    const embeddingStr = `[${embedding.join(",")}]`;

    const results = await db
      .select()
      .from(ingredients)
      .orderBy(sql`${ingredients.embedding} <=> ${embeddingStr}::vector`)
      .limit(limit);

    return results;
  } catch {
    return searchIngredients(query);
  }
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!isAiConfigured()) {
    return null;
  }

  try {
    const model = getEmbeddingModel();
    if (!model) return null;

    const result = await embed({
      model,
      value: text,
    });

    return result.embedding;
  } catch {
    return null;
  }
}
