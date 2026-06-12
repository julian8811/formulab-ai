/**
 * Sincroniza variables críticas de .env.local → Vercel production.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const KEYS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GITHUB_TOKEN",
  "NEXT_PUBLIC_APP_URL",
  "SETUP_SECRET",
];

console.log("Sincronizando env a Vercel production...\n");

for (const key of KEYS) {
  const value = process.env[key];
  if (!value) {
    console.log(`SKIP ${key} (vacío en .env.local)`);
    continue;
  }

  try {
    execSync(`npx vercel env rm ${key} production --yes`, { stdio: "pipe" });
  } catch {
    // ok
  }

  const tmp = `.env-sync-${key}.tmp`;
  writeFileSync(tmp, value, "utf8");
  try {
    execSync(`npx vercel env add ${key} production < ${tmp}`, {
      stdio: "inherit",
      shell: true,
    });
    console.log(`OK: ${key}`);
  } finally {
    unlinkSync(tmp);
  }
}

console.log("\nListo. Redeploy: npx vercel --prod --yes");
