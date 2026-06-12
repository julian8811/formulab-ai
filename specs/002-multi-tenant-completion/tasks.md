# Tasks — Spec 002

## Fase 1 — Seguridad API

- [x] T1.1 `requireApiAuth()` en `api-guard.ts`
- [x] T1.2 Filtro `userId` en `dbGetFormulas` + ownership get/update/delete
- [x] T1.3 Auth en APIs fórmulas, ingredientes, docs, IA, claims, regulatory, documents

## Fase 2 — Org y proyectos

- [x] T2.1 `ensureDefaultProject` al crear org
- [x] T2.2 `projectId` en `dbCreateFormula`

## Fase 3 — Datos y documentos

- [x] T3.1 Cache scores con `getLatestScores`
- [x] T3.2 Signed URL descarga + delete Storage
- [x] T3.3 Badge embeddings en ingredientes

## Fase 4 — Producto y ops

- [x] T4.1 Tab irritación reformulación
- [x] T4.2 Settings con proyecto
- [x] T4.3 `.env.example` completo
- [x] T4.4 CI GitHub Actions
- [x] T4.5 Tests api-guard + ownership
