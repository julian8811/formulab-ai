#!/usr/bin/env node
/**
 * Abre la página para crear un token gratuito de GitHub Models.
 * Solo necesitas estar logueado en GitHub y pulsar "Generate token".
 */
import { execSync } from "node:child_process";

const url =
  "https://github.com/settings/personal-access-tokens/new?name=FormuLab+AI&description=IA+gratis+FormuLab&user_models=read&expires_in=90";

console.log("Abriendo creación de token GitHub Models (gratis, sin tarjeta)...");
console.log(url);
console.log("\nPasos:");
console.log("1. Pulsa 'Generate token' en el navegador");
console.log("2. Copia el token (github_pat_...)");
console.log("3. Añádelo como GITHUB_TOKEN en Vercel y en .env.local");
console.log("4. Ejecuta: npm run ai:check:prod\n");

try {
  if (process.platform === "win32") {
    execSync(`start "" "${url}"`, { shell: true });
  } else if (process.platform === "darwin") {
    execSync(`open "${url}"`);
  } else {
    execSync(`xdg-open "${url}"`);
  }
} catch {
  console.log("Abre manualmente:", url);
}
