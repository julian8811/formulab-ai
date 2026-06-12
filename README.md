# FormuLab AI

Copiloto técnico de formulación cosmética para **perros y humanos**. Lleva una idea cosmética a un prototipo validado: fórmula base, validación de pH e incompatibilidades, claims seguros, estabilidad, microbiología, costos y documentación técnica.

> **Disclaimer:** FormuLab AI acelera prototipos y detecta errores tempranos. No sustituye la evaluación de un químico cosmético, microbiólogo, toxicólogo o regulador profesional.

## Demo en vivo

| Entorno    | URL                                                                                   |
| ---------- | ------------------------------------------------------------------------------------- |
| Producción | [https://formulab-ai.vercel.app](https://formulab-ai.vercel.app)                      |
| GitHub     | [julian8811/formulab-ai](https://github.com/julian8811/formulab-ai)                   |
| Vercel     | [Panel del proyecto](https://vercel.com/montoya8811-1146s-projects/formulab-ai)       |
| Supabase   | [Dashboard del proyecto](https://supabase.com/dashboard/project/qndtqqrmupalxwhjbxuf) |

## Características

- **Constructor de fórmula** — tipo de producto, público (perro/humano), formato, posicionamiento y composición por fases
- **Base de ingredientes** — 30+ materias primas con INCI, rangos de uso, compatibilidad canina y costos
- **Validador técnico** — semáforos para pH, porcentajes, incompatibilidades iónicas y microbiología
- **Validador de claims** — detecta frases riesgosas (medicamento veterinario, pesticida, etc.)
- **Módulo regulatorio** — perfiles Colombia/CAN, FDA, UE
- **Estabilidad y microbiología** — protocolos y alertas de challenge test
- **Costos y escalado** — escenarios prototipo / piloto / comercial
- **Documentación PDF** — fórmula maestra, procedimiento, INCI, checklist
- **Asistente IA** — agentes formulador, regulatorio, estabilidad, costos (IA gratis: GitHub Models / Gemini / Groq)

## Stack

| Capa               | Tecnología                            |
| ------------------ | ------------------------------------- |
| Frontend / Backend | Next.js 16 (App Router) + TypeScript  |
| UI                 | Tailwind CSS + shadcn/ui              |
| Base de datos      | Supabase (Postgres + Auth + Storage)  |
| ORM                | Drizzle ORM                           |
| IA                 | Vercel AI SDK + proveedores gratuitos |
| Tests              | Vitest                                |
| Deploy             | Vercel                                |

## Estructura del repositorio

```
formulab-ai/
├── src/
│   ├── app/              # Rutas App Router (dashboard, API)
│   ├── components/       # UI, layout, fórmulas, validación
│   ├── data/seed/        # Datos iniciales (ingredientes, claims, reglas)
│   ├── db/               # Esquema Drizzle
│   ├── lib/              # Motor de validación, IA, PDF, costos
│   └── types/
├── drizzle/migrations/   # Migraciones SQL
├── supabase/migrations/  # Políticas RLS
├── scripts/              # Seed, migraciones, utilidades
├── public/
├── .env.example          # Plantilla de variables (sin secretos)
└── vercel.json
```

## Inicio rápido

### Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com) (opcional — modo demo sin BD)
- Cuenta [Vercel](https://vercel.com) (para deploy)

### Instalación

```bash
git clone https://github.com/julian8811/formulab-ai.git
cd formulab-ai
npm install
cp .env.example .env.local
# Edita .env.local con tus credenciales Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Modo demo (sin Supabase)

Si `DATABASE_URL` no está configurada, la app usa datos sembrados en memoria. Todos los módulos de validación, claims, scoring y documentos funcionan igual.

## Variables de entorno

| Variable                        | Descripción                         | Requerida   |
| ------------------------------- | ----------------------------------- | ----------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase           | Producción  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon/public                   | Producción  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clave service role (solo servidor)  | Producción  |
| `DATABASE_URL`                  | Postgres (pooler `:6543` en Vercel) | Producción  |
| `NEXT_PUBLIC_APP_URL`           | URL pública de la app               | Producción  |
| `GITHUB_TOKEN`                  | GitHub Models (gratis, sin tarjeta) | IA (1 de 3) |
| `GEMINI_API_KEY`                | Google Gemini AI Studio (gratis)    | IA (1 de 3) |
| `GROQ_API_KEY`                  | Groq (gratis, Llama 3.3)            | IA (1 de 3) |
| `SUPABASE_ACCESS_TOKEN`         | PAT para scripts de migración       | Solo dev/CI |

Ver [`.env.example`](.env.example) para la plantilla completa.

## Base de datos

```bash
# Sembrar ingredientes, reglas y perfiles (vía REST API)
npm run db:seed

# Aplicar migración inicial (requiere SUPABASE_ACCESS_TOKEN en .env.local)
npm run db:migrate

# Push schema con Drizzle (requiere conexión Postgres directa)
npm run db:push
```

Políticas RLS: [`supabase/migrations/001_rls_policies.sql`](supabase/migrations/001_rls_policies.sql)

## Scripts

| Comando              | Descripción                   |
| -------------------- | ----------------------------- |
| `npm run dev`        | Servidor de desarrollo        |
| `npm run build`      | Build de producción           |
| `npm run start`      | Servidor de producción        |
| `npm run test`       | Tests unitarios (Vitest)      |
| `npm run lint`       | ESLint                        |
| `npm run db:seed`    | Sembrar datos en Supabase     |
| `npm run db:migrate` | Aplicar migración SQL vía API |
| `npm run format`     | Prettier                      |

## Módulos de la plataforma

1. Constructor de fórmula
2. Generador de fórmula base (plantillas + IA)
3. Validación técnica (semáforos)
4. Base de datos de ingredientes
5. Módulo regulatorio multi-mercado
6. Validador de claims
7. Estabilidad
8. Microbiología / conservantes
9. Formulación diferencial para perros
10. Asistente de reformulación
11. Costos y escalado
12. Documentación automática (PDF)
13. Capa IA multi-agente
14. Sistema de puntuación de fórmula

## Deploy en Vercel

El proyecto está configurado para deploy automático desde GitHub:

1. Conecta el repo en [vercel.com/new](https://vercel.com/new)
2. Importa `julian8811/formulab-ai`
3. Agrega las variables de entorno listadas arriba
4. Deploy

Deploy manual:

```bash
npx vercel link
npx vercel env pull   # opcional: sincronizar env local
npx vercel --prod
```

Más detalle en [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Licencia

Proyecto privado — uso según acuerdo del autor.

## Autor

[Julian Montoya](https://github.com/julian8811) — FormuLab AI / Guau Fresh
