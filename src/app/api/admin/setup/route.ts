import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";
import { isDatabaseConfigured } from "@/db";

export const runtime = "nodejs";

const EXTRA_SQL = `
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

const MIGRATION_FILES = [
  "supabase/migrations/001_rls_policies.sql",
  "supabase/migrations/002_rls_complete.sql",
];

async function runSql(
  client: ReturnType<typeof postgres>,
  content: string,
  label: string,
) {
  try {
    await client.unsafe(content);
    return `OK: ${label}`;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      return `SKIP: ${label}`;
    }
    return `WARN ${label}: ${msg}`;
  }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-setup-secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  const results: string[] = [];

  try {
    for (const file of MIGRATION_FILES) {
      const sql = readFileSync(resolve(process.cwd(), file), "utf-8");
      results.push(await runSql(client, sql, file));
    }
    results.push(await runSql(client, EXTRA_SQL, "storage+org policies"));

    const [ing] = await client`SELECT count(*)::int as c FROM ingredients`;
    const [buckets] = await client`
      SELECT count(*)::int as c FROM storage.buckets WHERE id = 'ingredient-documents'
    `.catch(() => [{ c: 0 }]);

    return NextResponse.json({
      ok: true,
      results,
      ingredientCount: ing.c,
      bucketExists: buckets.c > 0,
    });
  } finally {
    await client.end();
  }
}
