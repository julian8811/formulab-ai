import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";
import { isDatabaseConfigured } from "@/db";
import { RLS_001, RLS_002, STORAGE_POLICIES } from "@/lib/admin/setup-sql";

export const runtime = "nodejs";

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
  const secret = request.headers.get("x-setup-secret")?.trim();
  const expected = process.env.SETUP_SECRET?.trim();
  if (!secret || !expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  const results: string[] = [];

  try {
    results.push(await runSql(client, RLS_001, "RLS 001"));
    results.push(await runSql(client, RLS_002, "RLS 002"));
    results.push(await runSql(client, STORAGE_POLICIES, "storage+org"));

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
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : String(e),
        results,
      },
      { status: 500 },
    );
  } finally {
    await client.end();
  }
}
