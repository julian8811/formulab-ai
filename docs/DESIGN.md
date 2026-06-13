# FormuLab AI Design System

Sincronizado desde [Stitch — Modern Web Identity Kit](https://stitch.withgoogle.com/projects/9355984338654781628).

## Marca

- **Primary (Scientific Teal):** `#0d4d4d`
- **Background:** `#f7f9fb`
- **Success / Warning / Critical:** `#10B981` / `#F59E0B` / `#E11D48`
- **Tipografías:** Geist Sans (UI), Geist Mono (datos técnicos), EB Garamond (display)

## Assets

| Archivo                 | Uso                        |
| ----------------------- | -------------------------- |
| `public/favicon.svg`    | Favicon + icono en logo    |
| `src/app/icon.svg`      | Icono App Router (Next.js) |
| `public/brand/logo.png` | Apple touch icon / OG      |

## Utilidades CSS (`globals.css`)

- `.glass-panel` — header / barras fijas
- `.glass-card` — tarjetas con hover sutil
- `.glass-sidebar` — navegación lateral
- `.nav-active` — ítem activo con borde teal
- `.hero-gradient` — fondo landing/auth
- `.text-display-lg` / `.text-label-caps` / `.text-technical`

## Componentes

- `BrandLogo` — logo + wordmark reutilizable
- Sidebar y landing adaptados desde pantallas Stitch V2
