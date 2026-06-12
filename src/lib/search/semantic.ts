/**
 * Semantic search with pgvector (Phase 5).
 * Requires DATABASE_URL and pgvector extension enabled.
 */

import { isDatabaseConfigured, getDb } from "@/db";
import { ingredients } from "@/db/schema";
import { sql } from "drizzle-orm";
import { searchIngredients } from "@/lib/data/repository";

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
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}
