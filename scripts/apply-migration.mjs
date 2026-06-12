import { readFileSync } from "fs";
import { resolve } from "path";

const PROJECT_REF = "qndtqqrmupalxwhjbxuf";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("Set SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

const migration = readFileSync(
  resolve("drizzle/migrations/0000_initial.sql"),
  "utf-8",
);

const statements = migration
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}

console.log(`Applying ${statements.length} statements...`);

for (let i = 0; i < statements.length; i++) {
  const stmt = statements[i];
  const preview = stmt.slice(0, 60).replace(/\n/g, " ");
  try {
    await runQuery(stmt);
    console.log(`[${i + 1}/${statements.length}] OK: ${preview}...`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already exists")) {
      console.log(`[${i + 1}/${statements.length}] SKIP (exists): ${preview}...`);
    } else {
      console.error(`[${i + 1}/${statements.length}] FAIL: ${preview}...`);
      console.error(msg);
      process.exit(1);
    }
  }
}

console.log("Migration complete!");
