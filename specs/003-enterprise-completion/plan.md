# Plan — Spec 003 Enterprise completion

## Fase 1 — Permisos y catálogo

- Roles `owner` / `admin` / `member` en `permissions.ts`
- APIs de ingredientes e import regulatorio con `requireCatalogAdminAuth()`
- UI oculta acciones de catálogo para `member`

## Fase 2 — Organización

- Miembros: listar, invitar, cambiar rol, eliminar (`org-actions.ts`, settings)
- Proyectos CRUD + filtro `?project=` en listados de fórmulas
- Reclamar fórmulas legacy sin `user_id`

## Fase 3 — Operaciones

- Rate limit en `/api/ai` y `/api/reformulation`
- Probe IA por proveedor en `/api/ai/status`
- Embeddings: `npm run db:embed:api` documentado en README

## Fase 4 — Producto y calidad

- Landing pública en `/`
- Búsqueda semántica filtra tabla de ingredientes
- Selector de proyecto al crear fórmula
- `docs/SECURITY.md`, tests de permisos y api-guard

## Verificación

```bash
npm test
npm run build
npm run ai:check:prod   # opcional en prod
```
