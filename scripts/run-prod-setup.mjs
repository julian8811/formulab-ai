/**
 * Ejecuta setup en producción vía API admin.
 */
const SETUP_SECRET = "formulab-setup-prod-2026";
const URL = "https://formulab-ai.vercel.app/api/admin/setup";

const res = await fetch(URL, {
  method: "POST",
  headers: {
    "x-setup-secret": SETUP_SECRET,
    "Content-Type": "application/json",
  },
});

const body = await res.text();
console.log(res.status, body);
