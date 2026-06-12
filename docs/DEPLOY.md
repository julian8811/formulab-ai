# Guía de despliegue — FormuLab AI

## Supabase (ya configurado)

| Campo     | Valor                                                       |
| --------- | ----------------------------------------------------------- |
| Proyecto  | `formulab-ai`                                               |
| Ref       | `qndtqqrmupalxwhjbxuf`                                      |
| Región    | `us-east-1`                                                 |
| Dashboard | https://supabase.com/dashboard/project/qndtqqrmupalxwhjbxuf |

Estado: esquema aplicado, RLS activo, datos sembrados.

## Vercel

**Estado:** desplegado en producción.

| Campo     | Valor                                                                          |
| --------- | ------------------------------------------------------------------------------ |
| URL       | https://formulab-ai.vercel.app                                                 |
| Proyecto  | `montoya8811-1146s-projects/formulab-ai`                                       |
| Dashboard | https://vercel.com/montoya8811-1146s-projects/formulab-ai                      |
| Repo Git  | https://github.com/julian8811/formulab-ai (deploy automático en push a `main`) |

Variables de entorno ya configuradas en Production, Preview y Development.

Configura en **Project → Settings → Environment Variables** (Production, Preview, Development):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` — usar pooler `:6543` para serverless
- `NEXT_PUBLIC_APP_URL` — URL de producción de Vercel

Opcional (IA):

- `OPENAI_API_KEY` — OpenAI directo (recomendado; activa billing en OpenAI)
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway (alternativa; requiere tarjeta en Vercel)
- `VERCEL_OIDC_TOKEN` — automático en deploys Vercel (`vercel env pull` en local)

Diagnóstico: `GET /api/ai/status` en la app desplegada.

### CLI

```bash
npx vercel link
npx vercel env pull .env.vercel.local
npx vercel --prod
```

### GitHub → Vercel

1. Importa `julian8811/formulab-ai` en Vercel
2. Framework preset: **Next.js** (auto-detectado)
3. Root directory: `.` (raíz del repo)
4. Agrega variables de entorno antes del primer deploy de producción

## Migraciones

```bash
# Re-aplicar schema (requiere SUPABASE_ACCESS_TOKEN)
npm run db:migrate

# Re-sembrar datos
npm run db:seed
```

## Notas

- **Nunca** commitees `.env.local` ni claves en el repositorio.
- Rota tokens si fueron expuestos accidentalmente.
- La conexión Postgres directa puede fallar en redes sin IPv6; en local la app usa la REST API de Supabase.
