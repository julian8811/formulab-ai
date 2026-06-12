/**
 * Genera embeddings pgvector para todos los ingredientes.
 * Requiere DATABASE_URL y GEMINI_API_KEY (o GOOGLE_GENERATIVE_AI_API_KEY).
 *
 * Uso: npm run db:embed
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { getDb, closeDb } from "../src/db";
import { ingredients } from "../src/db/schema";
import { generateEmbedding } from "../src/lib/search/semantic";
import { eq } from "drizzle-orm";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL no configurada");
    process.exit(1);
  }

  const db = getDb();
  const rows = await db.select().from(ingredients);
  console.log(`Procesando ${rows.length} ingredientes...`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const text = [
      row.inciName,
      row.commonName,
      row.function,
      row.recommendedUse,
      row.restrictions,
    ]
      .filter(Boolean)
      .join(" ");

    const embedding = await generateEmbedding(text);
    if (!embedding) {
      skipped++;
      continue;
    }

    await db.update(ingredients).set({ embedding }).where(eq(ingredients.id, row.id));

    updated++;
    if (updated % 10 === 0) {
      console.log(`  ${updated} embeddings generados...`);
    }
  }

  console.log(`Listo: ${updated} actualizados, ${skipped} omitidos (sin proveedor IA)`);
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
