/**
 * Configura variables de entorno en Vercel (producción).
 * Uso: node scripts/configure-vercel-env.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(process.cwd(), ".env.local") });

const SETUP_SECRET = process.env.SETUP_SECRET || "formulab-setup-prod-2026";
const APP_URL = "https://formulab-ai.vercel.app";

const vars = {
  NEXT_PUBLIC_APP_URL: APP_URL,
  SETUP_SECRET,
};

console.log("Configurando Vercel production env...");

import { writeFileSync, unlinkSync } from "fs";

for (const [key, value] of Object.entries(vars)) {
  try {
    execSync(`npx vercel env rm ${key} production --yes`, { stdio: "pipe" });
  } catch {
    // may not exist
  }
  const tmp = `.env-${key}.tmp`;
  writeFileSync(tmp, value, "utf8");
  execSync(`npx vercel env add ${key} production < ${tmp}`, {
    stdio: "inherit",
    shell: true,
  });
  unlinkSync(tmp);
  console.log(`OK: ${key}`);
}

console.log("\nRedeploy con: npx vercel --prod --yes");
