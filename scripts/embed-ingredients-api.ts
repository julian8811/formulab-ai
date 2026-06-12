/**
 * Genera pseudo-embeddings vía Supabase REST (sin conexión Postgres directa).
 * Uso: npm run db:embed:api
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { seedIngredients } from "../src/data/seed/index";
import { generateEmbedding } from "../src/lib/search/semantic";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log(`Generando embeddings para ${seedIngredients.length} ingredientes...`);
  let updated = 0;
  let skipped = 0;

  for (const ing of seedIngredients) {
    const text = [
      ing.inciName,
      ing.commonName,
      ing.function,
      ing.recommendedUse,
      ing.restrictions,
    ]
      .filter(Boolean)
      .join(" ");

    const embedding = await generateEmbedding(text);
    if (!embedding) {
      skipped++;
      continue;
    }

    const embeddingStr = `[${embedding.join(",")}]`;
    const { error } = await supabase
      .from("ingredients")
      .update({ embedding: embeddingStr })
      .eq("id", ing.id);

    if (error) {
      console.warn(`${ing.id}: ${error.message}`);
      skipped++;
    } else {
      updated++;
      if (updated % 25 === 0) console.log(`  ${updated}...`);
    }
  }

  console.log(`Listo: ${updated} actualizados, ${skipped} omitidos`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
