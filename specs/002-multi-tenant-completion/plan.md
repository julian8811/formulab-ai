# Plan técnico — Spec 002

## Fase 1

| Archivo                               | Acción                          |
| ------------------------------------- | ------------------------------- |
| `src/lib/auth/api-guard.ts`           | `requireApiAuth`, `withApiAuth` |
| `src/lib/data/formulas-repository.ts` | Filtro `userId`, ownership      |
| `src/lib/actions/index.ts`            | Pasar userId a repo             |
| `src/app/api/**/route.ts`             | Auth en mutaciones              |

## Fase 2

| Archivo                         | Acción                                            |
| ------------------------------- | ------------------------------------------------- |
| `src/lib/auth/organizations.ts` | `ensureDefaultProject`, `getUserDefaultProjectId` |
| `formulas-repository.ts`        | `projectId` en create                             |

## Fase 3

| Archivo                                           | Acción              |
| ------------------------------------------------- | ------------------- |
| `src/lib/actions/index.ts`                        | Cache scores        |
| `src/lib/storage/documents.ts`                    | Signed URL + delete |
| `src/app/api/.../download/route.ts`               | GET descarga        |
| `src/components/ingredients/embedding-status.tsx` | Badge UI            |

## Fase 4

| Archivo                                    | Acción               |
| ------------------------------------------ | -------------------- |
| `reformulation-panel.tsx`                  | Tab irritación       |
| `settings/page.tsx`                        | Proyecto default     |
| `.env.example`, `.github/workflows/ci.yml` | Ops                  |
| Tests                                      | api-guard, ownership |
