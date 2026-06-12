# Tasks — Spec 001

## Fase 1 — Seguridad [P1] ✅

- [x] T1.1 `lib/auth/guard.ts` + `requireAuth` en layout dashboard
- [x] T1.2 Middleware redirect login para rutas protegidas
- [x] T1.3 RLS migration 002 (documents, versions write, orgs read)
- [x] T1.4 `isDemoMode()` — memory solo dev sin DATABASE_URL
- [x] T1.5 Storage docs + upload error claro

## Fase 2 — Datos [P2] ✅

- [x] T2.1 `dbListFormulaVersions` + version history UI
- [x] T2.2 Edit formula page + PATCH flow
- [x] T2.3 `scores-repository.ts` persist on analysis
- [x] T2.4 FormulaSelector en costs/stability

## Fase 3 — IA/Regulatorio [P3] ✅

- [x] T3.1 SemanticSearch component en ingredients
- [x] T3.2 reformulation-agent.ts + API update
- [x] T3.3 cosing-extended.ts + import route
- [x] T3.4 Embedding fallback + badge en UI

## Fase 4 — Producto [P4] ✅

- [x] T4.1 organizations.ts + ensureOrgOnSignup
- [x] T4.2 seed MX/BR regulatory profiles
- [x] T4.3 Vitest: guard, formulas-repo, import
- [x] T4.4 README + dashboard copy
- [x] T4.5 ingredients-batch3.ts (312 total)

## Verificación

- `npm run test` — 17 tests OK
- `npm run build` — OK
- Catálogo: 312 ingredientes únicos
