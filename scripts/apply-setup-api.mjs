/**
 * Aplica RLS + storage policies vía Supabase Management API (sin DATABASE_URL).
 * Uso: node scripts/apply-setup-api.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const PROJECT_REF = "qndtqqrmupalxwhjbxuf";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("Falta SUPABASE_ACCESS_TOKEN en .env.local");
  process.exit(1);
}

async function runQuery(query) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

async function runSqlBlock(content, label) {
  console.log(`\n--- ${label} ---`);
  try {
    await runQuery(content);
    console.log(`OK: ${label}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      console.log(`SKIP (exists): ${label}`);
    } else {
      console.error(`WARN ${label}:`, msg.slice(0, 200));
    }
  }
}

async function checkRls() {
  const rows = await runQuery(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'ingredients','formulas','formula_versions','formula_ingredients',
        'ingredient_documents','organizations','members'
      )
    ORDER BY tablename
  `);
  console.log("\n--- RLS status ---");
  for (const r of rows) {
    console.log(`${r.tablename}: RLS=${r.rowsecurity}`);
  }
}

async function main() {
  const rls001 = readFileSync(
    resolve("supabase/migrations/001_rls_policies.sql"),
    "utf-8",
  );
  const rls002 = readFileSync(
    resolve("supabase/migrations/002_rls_complete.sql"),
    "utf-8",
  );

  const storageAndOrg = `
DROP POLICY IF EXISTS "Authenticated read ingredient docs" ON storage.objects;
CREATE POLICY "Authenticated read ingredient docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "Authenticated upload ingredient docs" ON storage.objects;
CREATE POLICY "Authenticated upload ingredient docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "Authenticated delete ingredient docs" ON storage.objects;
CREATE POLICY "Authenticated delete ingredient docs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "Service role full storage" ON storage.objects;
CREATE POLICY "Service role full storage"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'ingredient-documents')
  WITH CHECK (bucket_id = 'ingredient-documents');

DROP POLICY IF EXISTS "organizations_insert" ON organizations;
CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
`;

  await runSqlBlock(rls001, "RLS 001");
  await runSqlBlock(rls002, "RLS 002");
  await runSqlBlock(storageAndOrg, "Storage + org policies");
  await checkRls();

  const [ing] = await runQuery("SELECT count(*)::int as c FROM ingredients");
  console.log(`\nIngredientes: ${ing.c}`);
  console.log("Setup API completado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
