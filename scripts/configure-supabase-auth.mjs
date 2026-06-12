/**
 * Configura Auth redirect en Supabase (requiere SUPABASE_ACCESS_TOKEN).
 * Uso: node scripts/configure-supabase-auth.mjs
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const PROJECT_REF = "qndtqqrmupalxwhjbxuf";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SITE_URL = "https://formulab-ai.vercel.app";

if (!TOKEN) {
  console.log("SUPABASE_ACCESS_TOKEN no configurado — omitiendo auth config.");
  console.log("Añade un PAT de https://supabase.com/dashboard/account/tokens a .env.local");
  process.exit(0);
}

const body = {
  site_url: SITE_URL,
  uri_allow_list: `${SITE_URL}/auth/callback,${SITE_URL}/**,http://localhost:3000/auth/callback,http://localhost:3000/**`,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error("Error auth config:", res.status, await res.text());
  process.exit(1);
}

console.log("OK: Supabase Auth site_url y redirects configurados para", SITE_URL);
