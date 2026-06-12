# Plan técnico — Spec 001

## Stack (sin cambios)

Next.js 16 App Router, Supabase Auth/Storage/RLS, Drizzle, Vercel AI SDK

## Fase 1 — Archivos clave

| Componente                                 | Acción                                   |
| ------------------------------------------ | ---------------------------------------- |
| `src/lib/auth/guard.ts`                    | Helper requireAuth, isProduction         |
| `src/middleware.ts`                        | Proteger `/dashboard`, `/formulas`, etc. |
| `src/lib/actions/index.ts`                 | Quitar memory store si production+DB     |
| `supabase/migrations/002_rls_complete.sql` | RLS ampliado                             |
| `docs/STORAGE.md`                          | Setup bucket                             |

## Fase 2 — Archivos clave

| Componente                                        | Acción                |
| ------------------------------------------------- | --------------------- |
| `src/lib/data/scores-repository.ts`               | Persist scores/costs  |
| `src/components/formulas/version-history.tsx`     | UI versiones          |
| `src/app/(dashboard)/formulas/[id]/edit/page.tsx` | Editar fórmula        |
| `src/components/formulas/formula-selector.tsx`    | Selector reutilizable |

## Fase 3 — Archivos clave

| Componente                                       | Acción                  |
| ------------------------------------------------ | ----------------------- |
| `src/components/ingredients/semantic-search.tsx` | UI búsqueda             |
| `src/lib/ai/reformulation-agent.ts`              | IA reformulación        |
| `src/data/regulatory/cosing-extended.ts`         | +100 entradas           |
| `src/lib/ai/config.ts`                           | Embedding fallback hash |

## Fase 4 — Archivos clave

| Componente                            | Acción            |
| ------------------------------------- | ----------------- |
| `src/lib/auth/organizations.ts`       | CRUD org/member   |
| `src/data/seed/index.ts`              | Perfiles MX/BR    |
| `src/data/seed/ingredients-batch3.ts` | +140 ingredientes |
| Tests + README                        |

## Orden de ejecución

Fase 1 → 2 → 3 → 4 (dependencias estrictas en auth y persistencia)
