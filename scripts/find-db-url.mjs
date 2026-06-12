/**
 * Resuelve DATABASE_URL correcta vía Supabase Management API (pooler aws-1).
 * Uso: node scripts/find-db-url.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env.local") });

const PROJECT_REF = "qndtqqrmupalxwhjbxuf";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const password =
  process.env.SUPABASE_DB_PASSWORD ||
  process.env.DATABASE_URL?.match(/postgres\.[^:]+:([^@]+)@/)?.[1] ||
  "";

if (!TOKEN) {
  console.error("Falta SUPABASE_ACCESS_TOKEN en .env.local");
  process.exit(1);
}

if (!password) {
  console.error("Falta SUPABASE_DB_PASSWORD o DATABASE_URL en .env.local");
  process.exit(1);
}

const enc = encodeURIComponent(decodeURIComponent(password));

const poolerRes = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/database/pooler`,
  { headers: { Authorization: `Bearer ${TOKEN}` } },
);

if (!poolerRes.ok) {
  console.error("No se pudo leer pooler config:", await poolerRes.text());
  process.exit(1);
}

const poolers = await poolerRes.json();
const primary = poolers.find((p) => p.database_type === "PRIMARY") ?? poolers[0];

if (!primary?.db_host) {
  console.error("Pooler config vacío:", poolers);
  process.exit(1);
}

const url = `postgresql://${primary.db_user}:${enc}@${primary.db_host}:${primary.db_port}/${primary.db_name}?sslmode=require`;
const masked = url.replace(enc, "***");

console.log("Pooler:", primary.db_host, "mode:", primary.pool_mode);

const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15 });
try {
  const [r] = await sql`SELECT 1 as ok`;
  console.log("WORKS:", masked, r);
  console.log("\nDATABASE_URL=", url);
} catch (e) {
  console.error("FAIL:", (e instanceof Error ? e.message : e).slice(0, 120));
  process.exit(1);
} finally {
  await sql.end();
}
