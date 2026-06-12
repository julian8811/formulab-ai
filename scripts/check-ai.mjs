#!/usr/bin/env node
/**
 * Verifica conectividad IA local o remota.
 * Uso: node scripts/check-ai.mjs [url]
 */
const baseUrl = process.argv[2] ?? "http://localhost:3000";

async function main() {
  const url = `${baseUrl.replace(/\/$/, "")}/api/ai/status`;
  console.log(`Checking ${url} ...`);

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  console.log(JSON.stringify(data, null, 2));

  if (data.ok) {
    console.log("\n✓ IA en modo LIVE");
    process.exit(0);
  }

  console.log("\n✗ IA en modo demo — configura un proveedor gratis: npm run ai:setup");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
