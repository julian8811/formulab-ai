# FormuLab AI — Especificación completa de UI/UX para rediseño

Documento de referencia de la aplicación en producción: [https://formulab-ai.vercel.app](https://formulab-ai.vercel.app)

Uso previsto: brief para herramientas de diseño (Stitch, Figma, etc.) y rediseño de UI/UX/CSS.

---

## 1. Contexto del producto

**Nombre:** FormuLab AI  
**Tagline:** Copiloto de formulación cosmética  
**Propuesta de valor:** Llevar una idea cosmética (perros o humanos) a un prototipo validado: fórmula, pH, incompatibilidades, claims, estabilidad, microbiología, costos y documentación PDF.

**Público:** Formuladores, emprendedores cosméticos, marcas pet care (Guau Fresh), químicos junior.

**Idioma:** Español (Colombia) en toda la UI.

**Disclaimer recurrente:** “No sustituye la evaluación de un químico cosmético, microbiólogo, toxicólogo o regulador profesional.”

---

## 2. Arquitectura de navegación

### 2.1 Rutas públicas (sin sidebar)

| Ruta      | Nombre         | Auth |
| --------- | -------------- | ---- |
| `/`       | Landing        | No   |
| `/login`  | Iniciar sesión | No   |
| `/signup` | Registro       | No   |

### 2.2 Rutas autenticadas (layout dashboard)

Todas requieren sesión Supabase. Layout: **sidebar fijo (desktop) + header superior + área de contenido scrollable**.

| Ruta                     | Título header                | Icono nav       |
| ------------------------ | ---------------------------- | --------------- |
| `/dashboard`             | Dashboard                    | LayoutDashboard |
| `/formulas`              | Fórmulas                     | FlaskConical    |
| `/formulas/new`          | Nueva fórmula                | —               |
| `/formulas/[id]`         | Nombre de la fórmula         | —               |
| `/formulas/[id]/edit`    | Editar: {nombre}             | —               |
| `/ingredients`           | Base de ingredientes         | Database        |
| `/ingredients/new`       | Nuevo ingrediente            | —               |
| `/ingredients/[id]`      | Nombre común del ingrediente | —               |
| `/ingredients/[id]/edit` | (mismo header que detalle)   | —               |
| `/validation`            | Validador técnico            | Beaker          |
| `/claims`                | Validador de claims          | Shield          |
| `/stability`             | Estabilidad y microbiología  | Scale           |
| `/costs`                 | Costos y escalado            | DollarSign      |
| `/regulatory`            | Módulo regulatorio           | Shield          |
| `/documents`             | Generador de documentos      | FileText        |
| `/ai`                    | Asistente IA                 | Bot             |
| `/settings`              | Configuración                | Settings        |

### 2.3 Sidebar (desktop ≥ lg)

- **Ancho:** 256px (`w-64`)
- **Fondo:** `bg-card`, borde derecho
- **Header sidebar:** icono Sparkles + “FormuLab AI” + subtítulo “Copiloto de formulación”
- **11 enlaces** con icono Lucide + label; item activo: `bg-primary text-primary-foreground`
- **Footer sidebar:** texto legal pequeño (disclaimer)

### 2.4 Header superior (todas las páginas dashboard)

- **Altura:** 64px
- **Contenido:** hamburger (mobile) | título de página | UserMenu (email truncado + dropdown “Cerrar sesión”)
- **Mobile nav:** Sheet lateral izquierdo con mismos links

### 2.5 Roles y permisos visibles en UI

| Rol    | Catálogo ingredientes | Settings miembros/proyectos | Import regulatorio |
| ------ | --------------------- | --------------------------- | ------------------ |
| owner  | Editar                | Sí                          | Sí                 |
| admin  | Editar                | No (solo tab org)           | Sí                 |
| member | Solo lectura          | No                          | No                 |

---

## 3. Sistema de diseño actual

### 3.1 Tipografía

- **Sans:** Geist (`--font-geist-sans`) — cuerpo y headings
- **Mono:** Geist Mono — INCI, IDs de usuario
- **Tamaños típicos:** h1 landing 4xl–5xl; h2 páginas 2xl; header app lg; cards sm/base

### 3.2 Paleta (CSS variables OKLCH, tema claro por defecto)

| Token                            | Uso                               |
| -------------------------------- | --------------------------------- |
| `--background`                   | Fondo general blanco              |
| `--foreground`                   | Texto principal casi negro        |
| `--primary`                      | Botones CTA, nav activo (negro)   |
| `--muted` / `--muted-foreground` | Textos secundarios, fondos suaves |
| `--destructive`                  | Errores, badges “avoid”           |
| `--border`                       | Bordes cards, tablas, inputs      |
| `--card`                         | Superficies elevadas              |
| `--radius`                       | 0.625rem base                     |

**Dark mode:** definido en CSS pero no hay toggle visible en UI.

### 3.3 Semántica de color (validación)

| Estado           | Color   | Uso                  |
| ---------------- | ------- | -------------------- |
| pass / low risk  | emerald | OK, riesgo bajo      |
| warning / medium | amber   | Advertencias         |
| fail / high      | red     | Crítico, alto riesgo |

Componentes: `StatusBadge`, `RiskBadge`, `ScoreBar` (barra 0–100 con verde/ámbar/rojo).

### 3.4 Biblioteca de componentes (shadcn/ui + custom)

Button, Input, Textarea, Label, Select, Card, Badge, Tabs, Table, Alert, Dialog, Sheet, DropdownMenu, Avatar, Progress, LinkButton, Sonner toasts.

**Patrones repetidos:**

- Card con CardHeader (título + descripción) + CardContent
- Grid responsive `sm:grid-cols-2`, `lg:grid-cols-3/4`
- Padding contenido: `p-6`, max-width formularios `max-w-3xl` / `max-w-4xl`
- Badges para metadata (productType, targetAudience, origen, etc.)

---

## 4. Páginas detalladas

### 4.1 Landing — `/`

**Layout:** página completa sin sidebar; gradiente vertical `from-background to-muted/40`.

#### Header sticky

- Logo Sparkles + “FormuLab AI”
- Botones derecha: “Entrar” (ghost) + “Registrarse” (primary)

#### Hero (centrado)

- **H1:** “Copiloto de formulación cosmética”
- **Subtítulo:** párrafo max-w-2xl sobre fórmulas, claims, estabilidad, costos, PDF; perros y humanos
- **CTAs:** “Empezar gratis” (primary lg) + “Ya tengo cuenta” (outline lg)

#### Grid de features (3 columnas en sm+)

Tres cards con borde, icono 32px, título y texto:

1. **Validación técnica** (FlaskConical) — pH, incompatibilidades, microbiología, scoring
2. **Claims seguros** (Shield) — frases de riesgo regulatorio
3. **IA gratuita** (Bot) — multi-agente GitHub/Gemini/Groq

#### Footer legal

- Texto xs muted + link “Acceder al dashboard” → `/login`

---

### 4.2 Login — `/login`

**Layout:** centrado vertical, min-h-screen, gap-8.

- Logo Sparkles + “FormuLab AI” (link a `/dashboard`)
- **Card auth** max-w-md:
  - Título: “Iniciar sesión”
  - Descripción: “Accede a tus fórmulas y proyectos”
  - Campo email (required)
  - Campo contraseña (min 6)
  - Botón full-width “Entrar”
  - Link inferior: “¿No tienes cuenta? Regístrate”

**Estados:** loading “Procesando…”, toast éxito/error.

---

### 4.3 Signup — `/signup`

Idéntico a login con copy:

- Título: “Crear cuenta”
- Descripción: “Regístrate para guardar fórmulas en la nube”
- Botón “Registrarse”
- Link: “¿Ya tienes cuenta? Inicia sesión”
- Tras registro: toast + redirect a login (confirmación email Supabase)

---

### 4.4 Dashboard — `/dashboard`

**Header:** “Dashboard”

#### Sección intro

- H2 “FormuLab AI” + subtítulo
- Botón “Nueva fórmula” → `/formulas/new`

#### KPI cards (grid 4 columnas lg)

| Card         | Métrica | Subtexto            |
| ------------ | ------- | ------------------- |
| Fórmulas     | count   | Proyectos activos   |
| Ingredientes | count   | En base de datos    |
| Plantillas   | 7       | Canino + humano     |
| Módulos      | 14      | Validación completa |

#### Grid 2 columnas lg

**Card A — Plantillas canino + humano**

- Lista de 7 plantillas: nombre, badges productType + targetAudience, botón “Usar” → `/formulas/new?template={i}`

**Card B — Accesos rápidos**

- Grid 2×3 de LinkButtons outline con icono:
  - Base de ingredientes, Validador técnico, Validador de claims, Generador documentos, Asistente IA, Módulo regulatorio

#### Card condicional — Fórmulas recientes

- Solo si hay fórmulas; lista hasta 5 con nombre, tipo, audiencia, badge “N ingredientes”; click → detalle

**Query param opcional:** `?project=` filtra métricas y listas (no visible en UI del dashboard).

---

### 4.5 Fórmulas — listado `/formulas`

**Header:** “Fórmulas”

#### Toolbar

- Contador “X fórmula(s)”
- **ProjectFilter** (Select 220px): “Todos los proyectos” + lista de proyectos org; actualiza URL `?project=uuid`
- Botón “Nueva fórmula”

#### Estado vacío

- Card centrada: “No hay fórmulas en este proyecto” + CTA crear

#### Grid de cards (md:2, lg:3)

Cada card clickeable:

- Título (nombre)
- Badges: productType (secondary), targetAudience (outline)
- Meta: “N ingredientes · pH X”

#### Nota footer (solo member)

- “El catálogo de ingredientes es solo lectura para tu rol.”

---

### 4.6 Nueva fórmula — `/formulas/new`

**Header:** “Nueva fórmula”  
**Contenedor:** max-w-4xl

#### Sección TemplatePicker (si no hay `?template=`)

- Subtítulo muted: “Empezar desde plantilla (7 disponibles)”
- Grid cards 3 cols: nombre, badges; link a `?template={i}`

#### FormulaBuilder — formulario multi-card

**Card 1 — “Definir producto”** (grid 2 cols)

| Campo               | Tipo            | Opciones                                                                                                    |
| ------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| Nombre del producto | Input           | placeholder espuma perros                                                                                   |
| Descripción         | Textarea 2 rows |                                                                                                             |
| Proyecto            | Select (si hay) | lista org                                                                                                   |
| Tipo de producto    | Select          | shampoo, espuma, crema, serum, balm, spray, gel, lotion, tonic, solid                                       |
| Público objetivo    | Select          | dog, dog_puppy, dog_sensitive, dog_long_coat, human_adult, human_sensitive, human_oily_hair, human_dry_skin |
| Formato             | Select          | liquid, foam, emulsion, gel, solid, spray                                                                   |
| pH objetivo         | Number step 0.1 | default 5.5                                                                                                 |
| Mercado             | Select          | colombia, can, usa, eu, mexico, brazil                                                                      |
| Claims              | Textarea 3 rows | uno por línea                                                                                               |

**Card 2 — “Composición (XX.X%)”**

- Header con botón “+ Ingrediente”
- Filas repetibles (grid 12 cols):
  - Fase (Input, ej. A)
  - Ingrediente (Select de 310+ items: commonName + INCI)
  - % (number)
  - Función en fórmula (input)
  - Botón trash eliminar fila
- Alerta ámbar si total ≠ 100% (±0.5)

**Footer acciones**

- “Crear fórmula” (submit) + “Cancelar” (router.back)

---

### 4.7 Detalle fórmula — `/formulas/[id]`

**Header:** nombre de la fórmula

#### Barra metadata + acciones

- Badges: productType, targetAudience, productFormat, pH
- Botones: Editar | Documentos | Validar

#### VersionHistory (si hay versiones DB)

- Card lista: v1, v2… con fecha, badge “Actual”, link `?version=N`

#### Grid principal (lg: 2/3 + 1/3)

**Columna izquierda — Fórmula maestra (tabla)**

| Fase | INCI | Función | % |

**Columna derecha — Puntuación**

- 6 ScoreBars: Seguridad, Estabilidad, Regulatorio, Naturalidad, Costo, Sensorial
- RiskBadge: riesgo microbiológico, riesgo claims
- Párrafo resumen score

#### Tabs (5 pestañas)

1. **Validación (N)** — `ValidationAlertsList`: alertas con icono, título, StatusBadge, mensaje, sugerencia
2. **Claims** — cards por claim: original, RiskBadge, razón, alternativa segura
3. **Estabilidad** — resumen, lista pruebas, microbiología
4. **Costos** — tabla escenarios: nombre, lote kg, fórmula $, envase $, total $
5. **Reformulación** — `ReformulationPanel` con sub-tabs: Más natural | Bajar costos | Menos irritación

---

### 4.8 Editar fórmula — `/formulas/[id]/edit`

Mismo FormulaBuilder prellenado; botón “Guardar cambios”; PATCH API; sin TemplatePicker ni selector proyecto en edición actual.

---

### 4.9 Ingredientes — listado `/ingredients`

**Header:** “Base de ingredientes”

#### Toolbar

- “X materias primas catalogadas”
- **EmbeddingStatusBadge:** demo | pseudo (ámbar warning) | real (Gemini)
- Botón “Nuevo ingrediente” (solo owner/admin)

#### Card “Ingredientes”

**Filtros (fila flexible)**

1. **SemanticSearchBar** — input con icono Search + toggle Texto/Semántica; dropdown resultados (max 10); filtra tabla por IDs
2. Select función (todas + lista dinámica)
3. Select origen: todos, vegetal, synthetic, biotech, mineral
4. Select perros: todos, approved, caution, avoid

**Contador:** “X de Y ingredientes”

**Tabla**

| INCI (mono link) | Nombre común | Función | Rango % | Perros (badge) | Origen | Costo/kg |

Filas hover + link a detalle.

---

### 4.10 Detalle ingrediente — `/ingredients/[id]`

**Header:** commonName

#### Barra superior

- Badges: INCI (mono outline), origin, ionicCharge
- Botón “Editar”

#### Grid 2 cols lg

**Card Información general** (grid label/value)

- Nombre comercial, proveedor, función, solubilidad, rango %, costo/kg, origen natural %
- Bloques opcionales: uso recomendado, restricciones (ámbar)

**Card Seguridad y compatibilidad**

- Perros (badge color por approved/caution/avoid)
- Riesgo lamido, fragancia (RiskBadge)
- Aprobado humano, biodegradable (Sí/No)
- Certificaciones (badges outline)
- Alérgenos (lista)

#### Card Documentos

- Select tipo: Ficha técnica, SDS, COA, IFRA, Declaración alérgenos
- Botón subir archivo (.pdf, doc, xls, img)
- Lista docs: nombre, tipo, descargar, eliminar

#### Link “← Volver al catálogo”

---

### 4.11 Nuevo / Editar ingrediente

**Formulario IngredientForm** max-w-3xl, 2 cards:

**Identificación:** commercialName, INCI, commonName, function, supplier, origin  
**Parámetros técnicos:** min/max %, costo/kg, carga iónica, compatibilidad perros, índice natural, solubilidad, uso recomendado, restricciones

Botones: Crear/Guardar + Cancelar

---

### 4.12 Validación técnica — `/validation`

**Header:** “Validador técnico”  
**Max-width:** 4xl

**Card selector**

- Título con icono Beaker: “Validación técnica con semáforos”
- Select fórmula (carga análisis vía API)

**Estados:** “Validando…”, card puntuación (4 ScoreBars + riesgo micro), lista alertas

**Query:** `?formula=id` preselecciona; `?project=` filtra lista fórmulas

---

### 4.13 Claims — `/claims`

**Client page**, max-w-3xl

**Card validador**

- Icono Shield + “Validar claim de marketing”
- Select especie: Perro | Humano
- Textarea claim
- Botón “Validar claim”
- **Chips ejemplo** (4 botones outline): claims riesgosos y seguros truncados

**Resultados** (cards apiladas)

- Claim original + RiskBadge
- Razón (muted)
- Alternativa segura
- Banner ámbar si requiere evidencia + pregunta

---

### 4.14 Estabilidad — `/stability`

**Header:** “Estabilidad y microbiología”

- **FormulaSelector** (label “Fórmula”, cambia `?formula=`)

**Grid 2 cols**

- Card Estabilidad: resumen, pruebas recomendadas, notas envase
- Card Microbiología: resumen, alerta challenge test (ámbar), lista pruebas

**Card Protocolos disponibles**

- Grid md:2 de protocolos seed: nombre, descripción, lista tests xs

**Card alertas** (condicional): ValidationAlertsList de estabilidad

**Empty:** “Crea una fórmula para ver evaluación”

---

### 4.15 Costos — `/costs`

**Header:** “Costos y escalado”

- FormulaSelector
- **Tabla escenarios:** Escenario, Lote kg, Fórmula $, Envase $, Total $, $/unidad
- **Grid ingredientes más costosos:** cards con nombre, %, contribución $/kg

**Empty:** card centrada “Crea una fórmula para calcular costos”

---

### 4.16 Regulatorio — `/regulatory`

**Header:** “Módulo regulatorio”

#### RegulatoryImportPanel (top)

- Card con icono Database
- Texto explicativo CosIng/IFRA
- 3 botones outline: Importar CosIng muestra | CosIng ampliado | IFRA muestra
- Mensaje éxito verde

#### Alert legal (AlertTriangle)

- Diferenciación grooming vs medicamento/pesticida; CPR UE

#### Tabs por mercado

TabsList wrap: Colombia, CAN, USA, EU, México, Brasil

**Contenido por tab (card)**

- Título con Shield + nombre perfil
- Descripción
- Grid md:2:
  - Categorías producto (badges Humano / Perro)
  - Etiquetado requerido (lista)
  - Claims permitidos (badges secondary)
  - Claims restringidos (badges destructive)
  - Advertencias (lista full-width)

---

### 4.17 Documentos — `/documents`

**Header:** “Generador de documentos”  
**Max-width:** 2xl

**Card exportar**

- Icono FileText + “Exportar dossier técnico”
- Select fórmula (fetch `/api/formulas`)
- Botones: “Descargar PDF” | “Exportar JSON” (outline)
- Query `?formula=id` preselecciona

---

### 4.18 Asistente IA — `/ai`

**Header:** “Asistente IA”  
**Max-width:** 3xl

**Card agentes**

- Icono Bot + “Agentes especializados”
- Select agente (8 opciones): Formulador, Regulatorio, Estabilidad, Microbiológico, Costos, Sensorial, Documentación, Mercado
- Textarea consulta (4 rows, placeholder producto)
- Botón Send “Consultar agente”

**Card respuesta** (condicional): texto plano en `<pre>` con wrap

**Footer xs:** nota IA gratis + link `/api/ai/status`

---

### 4.19 Configuración — `/settings`

**Header:** “Configuración”

#### Intro

- H2 + “Cuenta, organización y proyectos”

#### Card Cuenta

- Label “Correo” + email usuario

#### Sin org

- Card vacía: “Sin organización vinculada”

#### Con org — Tabs

**Tab Organización**

- Card: nombre org, rol
- Texto permisos catálogo (si admin/owner)
- **ClaimLegacyButton:** reclamar fórmulas sin dueño

**Tab Miembros** (solo owner)

- Invitar: email + rol (member/admin) + botón Invitar
- Lista miembros: userId truncado, “(tú)”, select rol o “owner” fijo, trash eliminar

**Tab Proyectos** (solo owner)

- Input nombre proyecto + Crear
- Lista proyectos: nombre, descripción, LinkButton “Ver fórmulas” → `/formulas?project=id`

---

## 5. Componentes transversales

### UserMenu

- Sin sesión: botón “Entrar”
- Con sesión: ghost button email truncado 120px + dropdown logout

### FormulaSelector

- Label + Select; navega `{pathname}?formula={id}`

### ProjectFilter

- Select “Todos” / proyectos; navega `/formulas?project=`

### ValidationAlertsList

- Empty: Alert verde “Sin alertas”
- Items: borde, icono pass/warning/fail, título, StatusBadge, mensaje, sugerencia

### ScoreBar

- Label + valor /100 + barra horizontal coloreada

### Toasts (Sonner)

- Éxito verde, error rojo en acciones async

---

## 6. Comportamiento responsive

| Breakpoint | Comportamiento                                           |
| ---------- | -------------------------------------------------------- |
| Mobile     | Sidebar oculto; Sheet menú; filtros en columna           |
| sm         | Grids 2 cols; toolbars flex-row                          |
| lg         | Sidebar visible; grids 3–4 cols; detalle fórmula 2/3+1/3 |

---

## 7. Flujos de usuario principales

```
Landing → Signup → Login → Dashboard
Dashboard → Nueva fórmula → Plantilla o blank → FormulaBuilder → Detalle fórmula
Detalle → Validación / Claims / Documentos / IA
Dashboard → Catálogo ingredientes → Detalle → Documentos técnicos
Dashboard → Settings → Proyectos / Miembros
```

**Flujo formulador típico:** Dashboard → plantilla → ajustar composición → ver scores → validar claims → exportar PDF → consultar IA.

**Flujo admin org:** Settings → crear proyectos → invitar miembros → filtrar fórmulas por proyecto.

**Flujo catálogo:** Ingredientes → búsqueda semántica → detalle → subir COA/SDS → (admin) import CosIng.

---

## 8. Estados vacíos, carga y error

| Página           | Empty                          | Loading                  |
| ---------------- | ------------------------------ | ------------------------ |
| Fórmulas         | Card CTA crear                 | —                        |
| Ingredientes     | 0 resultados filtrados         | “Buscando…” en semántica |
| Validación       | Sin fórmulas                   | “Validando…”             |
| Costos/Stability | “Crea una fórmula…”            | —                        |
| Documentos       | Select vacío, botones disabled | “Cargando…” Suspense     |
| IA               | Sin card respuesta             | “Consultando…”           |
| Reformulación    | “No hay sugerencias”           | “Cargando…” por tab      |
| Docs ingrediente | “Sin documentos adjuntos”      | “Subiendo…”              |

Errores: toast sonner; 404 notFound en fórmulas/ingredientes ajenos.

---

## 9. Datos visibles en UI

- **310+ ingredientes** con INCI, rangos %, costo, compatibilidad canina
- **7 plantillas** producto (shampoo, espuma, etc. canino/humano)
- **6 mercados** regulatorios + MX/BR
- **3 escenarios costo:** prototipo, piloto, comercial
- **8 agentes IA** especializados

---

## 10. Oportunidades de rediseño

1. **Identidad visual:** paleta casi monocromática; oportunidad de color de marca pet care / cosmética natural.
2. **Sidebar:** 11 items densos; considerar agrupación (Formulación | Calidad | Negocio | Admin).
3. **Dashboard:** KPIs genéricos; podría mostrar salud de fórmulas (semáforos agregados).
4. **Detalle fórmula:** mucha información en tabs; considerar layout tipo command center.
5. **Ingredientes:** tabla densa en mobile; cards o vista compacta.
6. **Auth:** páginas muy minimalistas vs landing; unificar shell visual.
7. **Dark mode:** tokens listos, sin toggle.
8. **Roles:** feedback visual limitado para member.
9. **IA:** respuesta en `<pre>`; mejorar como chat/markdown.
10. **Settings:** miembros muestran userId no email; mejora UX colaboración.

---

## 11. Meta técnica para implementación CSS

- **Framework:** Tailwind CSS v4 + shadcn/ui v4
- **Iconos:** Lucide React (h-4 w-4 nav, h-5 w-5 cards, h-6–8 branding)
- **Animaciones:** tw-animate-css
- **Fuentes:** next/font Geist
- **Archivo tokens:** `src/app/globals.css`

---

_Generado para FormuLab AI — Spec 003. Actualizar cuando cambien rutas o componentes._
