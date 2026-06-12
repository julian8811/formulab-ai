/**
 * Ejecuta setup en producción vía API admin.
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SETUP_SECRET = process.env.SETUP_SECRET;
const URL = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://formulab-ai.vercel.app"}/api/admin/setup`;

if (!SETUP_SECRET) {
  console.error("Falta SETUP_SECRET en .env.local");
  process.exit(1);
}

const res = await fetch(URL, {
  method: "POST",
  headers: {
    "x-setup-secret": SETUP_SECRET,
    "Content-Type": "application/json",
  },
});

const body = await res.text();
console.log(res.status, body);
if (!res.ok) process.exit(1);
