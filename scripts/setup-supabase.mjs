/**
 * Setup completo Supabase: RLS, Storage bucket, políticas.
 * Uso: node scripts/setup-supabase.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || !SUPABASE_URL || !SERVICE_KEY) {
  console.error("Faltan DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false, max: 1 });

async function runFile(relativePath, label) {
  const content = readFileSync(resolve(relativePath), "utf-8");
  console.log(`\n--- ${label} ---`);
  try {
    await sql.unsafe(content);
    console.log(`OK: ${label}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      console.log(`SKIP (exists): ${label}`);
    } else {
      console.error(`WARN ${label}:`, msg);
    }
  }
}

async function ensureBucket() {
  console.log("\n--- Storage bucket ---");
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "ingredient-documents",
      name: "ingredient-documents",
      public: false,
      file_size_limit: 10485760,
      allowed_mime_types: [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    }),
  });

  if (res.ok) {
    console.log("OK: bucket ingredient-documents creado");
    return;
  }

  const body = await res.text();
  if (res.status === 409 || body.includes("already exists")) {
    console.log("SKIP: bucket ya existe");
    return;
  }

  console.error("FAIL bucket:", res.status, body);
}

async function ensureStoragePolicies() {
  const policies = [
    {
      name: "Authenticated read ingredient docs",
      sql: `CREATE POLICY "Authenticated read ingredient docs"
        ON storage.objects FOR SELECT TO authenticated
        USING (bucket_id = 'ingredient-documents');`,
    },
    {
      name: "Authenticated upload ingredient docs",
      sql: `CREATE POLICY "Authenticated upload ingredient docs"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'ingredient-documents');`,
    },
    {
      name: "Authenticated delete ingredient docs",
      sql: `CREATE POLICY "Authenticated delete ingredient docs"
        ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = 'ingredient-documents');`,
    },
    {
      name: "Service role full storage",
      sql: `CREATE POLICY "Service role full storage"
        ON storage.objects FOR ALL TO service_role
        USING (bucket_id = 'ingredient-documents')
        WITH CHECK (bucket_id = 'ingredient-documents');`,
    },
  ];

  console.log("\n--- Storage policies ---");
  for (const p of policies) {
    try {
      await sql.unsafe(`DROP POLICY IF EXISTS "${p.name}" ON storage.objects;`);
      await sql.unsafe(p.sql);
      console.log(`OK: ${p.name}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`SKIP/WARN ${p.name}:`, msg);
    }
  }
}

async function ensureOrgPolicies() {
  console.log("\n--- Organization write policies ---");
  const stmts = [
    `DROP POLICY IF EXISTS "organizations_insert" ON organizations;`,
    `CREATE POLICY "organizations_insert" ON organizations
      FOR INSERT TO authenticated WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "members_insert" ON members;`,
    `CREATE POLICY "members_insert" ON members
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());`,
    `DROP POLICY IF EXISTS "members_select" ON members;`,
    `CREATE POLICY "members_select" ON members
      FOR SELECT USING (user_id = auth.uid());`,
  ];
  for (const stmt of stmts) {
    try {
      await sql.unsafe(stmt);
    } catch (e) {
      console.log("WARN:", e instanceof Error ? e.message : e);
    }
  }
  console.log("OK: org policies");
}

async function verify() {
  console.log("\n--- Verificación ---");
  const [ing] = await sql`SELECT count(*)::int as c FROM ingredients`;
  const [orgs] = await sql`SELECT count(*)::int as c FROM organizations`;
  console.log(`Ingredientes en BD: ${ing.c}`);
  console.log(`Organizaciones: ${orgs.c}`);

  const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/ingredient-documents`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
  });
  console.log(`Bucket ingredient-documents: ${bucketRes.ok ? "OK" : bucketRes.status}`);
}

async function main() {
  console.log("FormuLab AI — setup Supabase");

  await runFile("supabase/migrations/001_rls_policies.sql", "RLS 001");
  await runFile("supabase/migrations/002_rls_complete.sql", "RLS 002");
  await ensureOrgPolicies();
  await ensureBucket();
  await ensureStoragePolicies();
  await verify();

  await sql.end();
  console.log("\nSetup Supabase completado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
