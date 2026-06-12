# Seguridad — FormuLab AI

## Modelo de defensa

1. **Middleware** — redirige rutas del dashboard sin sesión Supabase.
2. **API auth** — `requireApiAuth()` en mutaciones y datos sensibles.
3. **Aislamiento app** — fórmulas filtradas por `userId`; ownership en get/update/delete.
4. **Roles org** — catálogo e import regulatorio solo `owner` / `admin`.
5. **RLS Supabase** — políticas en Postgres; la app usa conexión server `DATABASE_URL` (rol postgres) para Drizzle, por lo que **RLS no aplica en esas queries**. La capa de aplicación es la barrera principal.

## Recomendación futura

Migrar lecturas/escrituras user-scoped al cliente Supabase con sesión JWT para que RLS sea efectivo en runtime.

## Storage

Bucket `ingredient-documents` privado; descarga vía signed URL autenticada.

## Admin

- `POST /api/admin/setup` — requiere `SETUP_SECRET`
- Invitaciones org — Supabase Admin API + service role (solo servidor)

## Rate limiting

`/api/ai` y `/api/reformulation`: 30 req/min por IP (memoria en instancia serverless).
