# RESERVO.AI — REGLAS GLOBALES PARA TODOS LOS AGENTES

## PROYECTO
- **Repo:** `C:\Users\krush\reservo-ai`
- **Rama base:** `main`
- **Stack:** Next.js 16 + React 19 + TypeScript + Supabase + Tailwind 4
- **Supabase project:** `nyxvlgzvkfoxkcddidnk`

## NÚCLEO PROTEGIDO — NUNCA TOCAR SIN ARQUITECTO

| Archivo/Carpeta | Razón |
|---|---|
| `src/lib/supabase.ts` | Cliente global de DB |
| `src/types/index.ts` | Contratos de datos compartidos |
| `src/app/layout.tsx` | Root layout global |
| `src/app/globals.css` | Variables CSS globales |
| `next.config.js` | Config del bundler |
| `tsconfig.json` | Paths y aliases TS |
| `package.json` | Dependencias |
| `.env.local` | Variables de entorno |

## ZONAS PARALELIZABLES (cada agente trabaja la suya)
```
src/app/(dashboard)/reservas/     → AGENTE RESTAURANTE
src/app/(dashboard)/pedidos/      → AGENTE RESTAURANTE
src/app/(dashboard)/mesas/        → AGENTE RESTAURANTE
src/app/(dashboard)/dashboard/    → AGENTE RESTAURANTE
src/app/(dashboard)/llamadas/     → AGENTE RESTAURANTE
src/app/(dashboard)/agenda/       → AGENTE CLÍNICA / VETERINARIA (condicional por tipo)
src/app/(dashboard)/clientes/     → AGENTE CLÍNICA / VET / INMOBILIARIA (condicional)
src/components/                   → AGENTE DISEÑO UX (solo añadir, no romper)
src/types/restaurant.ts           → AGENTE RESTAURANTE
src/types/clinic.ts               → AGENTE CLÍNICA
src/types/veterinary.ts           → AGENTE VETERINARIA
src/types/realestate.ts           → AGENTE INMOBILIARIA
```

## CONVENCIÓN DE RAMAS
```
main                          ← producción, solo release puede pushear
dev                           ← integración, solo QA puede mergear aquí
feature/restaurante           ← agente restaurante
feature/clinica               ← agente clínica
feature/veterinaria           ← agente veterinaria
feature/inmobiliaria          ← agente inmobiliaria
feature/ux-global             ← agente diseño UX
```

## REGLA DE HANDOFF
Cada agente, al terminar su trabajo, crea el archivo:
```
.agent-status/<nombre-agente>/DONE.md
```
Con este contenido:
```markdown
# HANDOFF: [nombre-agente]
## Qué hice
## Archivos modificados
## Archivos nuevos
## Tests que corren
## Advertencias para QA
## Estado: LISTO_PARA_QA
```

## TIPOS TYPESCRIPT
Antes de crear un tipo nuevo, revisar `src/types/index.ts`.
Si necesitas un tipo específico de vertical, créalo en:
```
src/types/<vertical>.ts
```
Nunca extiendas `src/types/index.ts` sin aprobación del arquitecto.

## ESTILO VISUAL
- Dark theme: `#0f0f12` fondo, `white/[0.06]` bordes
- Accent: violet-500 / indigo-600
- Glass: `bg-white/[0.015]` + `border border-white/[0.06]`
- Radios: `rounded-2xl` cards, `rounded-xl` elementos internos
- NO usar fuentes externas (system-ui)

## PROHIBICIONES UNIVERSALES
- ❌ No cambiar el sistema de auth
- ❌ No cambiar tablas Supabase sin aprobación del arquitecto
- ❌ No añadir dependencias npm sin aprobación del arquitecto
- ❌ No tocar archivos de otro agente vertical
- ❌ No pushear a `main` directamente
- ❌ No deploys a Vercel directamente (solo release puede)
