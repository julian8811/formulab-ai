# Spec 002 — Multi-tenant completion

## Objetivo

Cerrar brechas de Spec 001: aislamiento de datos por usuario, auth en APIs, proyectos/org, calidad de datos y operaciones.

## Requisitos

### Fase 1 — Seguridad API

- FR-1.1: Helper `requireApiAuth()` para rutas `/api/*` de mutación y datos sensibles
- FR-1.2: Fórmulas filtradas y verificadas por `userId`
- FR-1.3: Ingredientes/regulatorio/import solo mutables autenticado

### Fase 2 — Org y proyectos

- FR-2.1: Proyecto default al crear organización
- FR-2.2: `projectId` asignado al crear fórmula

### Fase 3 — Datos y documentos

- FR-3.1: Reutilizar scores persistidos (`getLatestScores`) antes de recalcular
- FR-3.2: Descarga documentos vía signed URL
- FR-3.3: Borrar objeto Storage al eliminar documento
- FR-3.4: Badge estado embeddings en `/ingredients`

### Fase 4 — Producto y ops

- FR-4.1: Tab reformulación "irritación"
- FR-4.2: Settings con info de proyecto
- FR-4.3: `.env.example` completo
- FR-4.4: CI GitHub Actions (test + build)
- FR-4.5: Tests auth API y ownership fórmulas

## Criterios de aceptación

- `npm run test` y `npm run build` pasan
- Usuario A no ve/edita fórmulas de usuario B
- APIs mutación devuelven 401 sin sesión (prod)
- Documentos descargables con auth
