# Spec 001 — Production Hardening (4 fases)

## Objetivo

Llevar FormuLab AI de prototipo demo a producto multi-usuario con datos persistentes, seguridad Supabase y funcionalidad completa.

## Usuarios

- Formulador cosmético (perro/humano)
- Químico / responsable regulatorio
- Admin de organización (Fase 4)

## Requisitos funcionales

### Fase 1 — Seguridad

- FR-1.1: Rutas `/dashboard/*` requieren sesión Supabase (redirect `/login`)
- FR-1.2: APIs de mutación requieren usuario autenticado
- FR-1.3: RLS completo: formulas por user_id, ingredient_documents, formula_versions INSERT
- FR-1.4: Bucket Storage `ingredient-documents` documentado + upload real
- FR-1.5: Producción (`NODE_ENV=production`) sin fallback in-memory para fórmulas/docs

### Fase 2 — Datos

- FR-2.1: UI historial de versiones en detalle de fórmula
- FR-2.2: Página editar fórmula existente
- FR-2.3: Persistir formula_scores y cost_scenarios al analizar
- FR-2.4: Selector de fórmula en `/costs` y `/stability`

### Fase 3 — IA y regulatorio

- FR-3.1: Búsqueda semántica en catálogo ingredientes (UI + API)
- FR-3.2: Reformulación vía orquestador IA con fallback reglas
- FR-3.3: Import CosIng ampliado (CSV/batch 100+)
- FR-3.4: Script embeddings + indicador en UI si faltan

### Fase 4 — Producto

- FR-4.1: Organizaciones: crear org al signup, asociar fórmulas a project
- FR-4.2: Perfiles regulatorios México y Brasil
- FR-4.3: Tests: auth guard, formulas repo, claims (ampliar)
- FR-4.4: README/docs actualizados
- FR-4.5: Catálogo ≥300 ingredientes únicos

## Criterios de aceptación

- `npm run build` y `npm run test` pasan
- Usuario no autenticado no accede a dashboard
- Fórmulas en producción solo en Postgres
- Versiones visibles y editables
- Búsqueda semántica usable en /ingredients
