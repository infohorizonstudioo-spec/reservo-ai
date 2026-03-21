# PROMPT — AGENTE RESTAURANTE / BAR
# Pega esto completo en una sesión de Claude Code dentro de C:\Users\krush\reservo-ai
# RAMA: git checkout feature/restaurante (o créala desde main)

Eres el desarrollador responsable EXCLUSIVAMENTE de la plantilla restaurante/bar.
Lee primero CLAUDE.md y src/types/index.ts antes de escribir una sola línea.
Si existe src/lib/tenant-context.ts del arquitecto, impórtalo. Si no, créalo mínimo tú.

## RAMA DE TRABAJO
```bash
git checkout feature/restaurante
# Si no existe: git checkout -b feature/restaurante main
```

## TUS ARCHIVOS — SOLO ESTOS
```
src/app/(dashboard)/reservas/page.tsx
src/app/(dashboard)/pedidos/page.tsx
src/app/(dashboard)/mesas/page.tsx
src/app/(dashboard)/llamadas/page.tsx
src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/clientes/page.tsx   ← solo la parte de restaurante
src/types/restaurant.ts                 ← si no lo creó el arquitecto
```

## MÓDULO RESERVAS — /reservas
```tsx
'use client'
// Estado: lista de reservas del día desde Supabase
// Realtime: suscripción a cambios en tabla reservations
// Filtros: tabs por estado (todas / pendiente / confirmada / sentada / cancelada)
// Modal crear: nombre, teléfono, fecha, hora, personas (1-20), zona, notas, alergias
// Acciones por reserva: confirmar | sentar | no-show | cancelar
// Vista: lista ordenada por hora con StatusBadge en cada fila
// Empty state: "No hay reservas para hoy" con botón "Nueva reserva"
```

## MÓDULO PEDIDOS — /pedidos
```tsx
'use client'
// Layout: 4 columnas kanban (nuevo / preparando / listo / entregado)
// Cada card: número de mesa o nombre, items (lista), total €, tiempo transcurrido
// Badge de tiempo: verde <10min, naranja 10-20min, rojo >20min
// Botón en cada card para avanzar al siguiente estado
// Realtime: suscripción a tabla orders
// Filtro: tipo (mesa / domicilio / recogida)
// Empty: "Cocina tranquila por ahora 🍳"
```

## MÓDULO MESAS — /mesas
```tsx
'use client'
// Grid CSS de mesas (no canvas, no SVG complejo)
// Cada mesa: número, capacidad, personas actuales, estado
// Colores: libre=emerald, reservada=blue, ocupada=orange, bloqueada=slate
// Click en mesa → panel lateral con detalles y botón cambiar estado
// Realtime: suscripción a tabla tables
// Leyenda de colores abajo del grid
```

## MÓDULO LLAMADAS — /llamadas
```tsx
'use client'
// Sección superior: llamadas activas (status === 'activa')
//   - Cada llamada activa: teléfono, duración en curso (contador), intent detectado
//   - Transcripción en tiempo real si disponible
// Sección inferior: historial (últimas 20)
//   - Columnas: hora, teléfono, duración, intent, resultado (reserva creada / pedido / info)
// Realtime: suscripción a tabla calls
// Empty activas: indicador "🟢 Sin llamadas activas"
```

## MÓDULO DASHBOARD — /dashboard
Mejora el actual haciéndolo production-ready:
- Los 4 KPIs del top (reservas hoy, confirmadas, pedidos activos, llamadas) deben cargarse real
- Loading skeletons mientras carga (misma forma que el contenido)
- Timeline de reservas hoy: max 8 items + "Ver todas →"
- Sección "En cocina ahora": pedidos en estado 'preparando' (max 4)
- Sección "Alertas": alertas no leídas del tenant (max 3)
- Realtime activo en dashboard

## REGLAS DE CÓDIGO
- SIEMPRE `.eq('tenant_id', tenantId)` en TODAS las queries — nunca sin filtro
- El tenantId viene del TenantContext o de getDemoTenant()
- Loading: muestra skeleton de la misma estructura que el contenido real
- Error: captura con try/catch y muestra mensaje amigable en pantalla
- No uses `any` en TypeScript — usa los tipos de src/types/

## ESTILO
Sigue exactamente el patrón visual del dashboard existente:
- Fondo: bg-[#0f0f12] o similar oscuro
- Cards: bg-white/[0.015] border border-white/[0.06] rounded-2xl
- Texto primario: text-white/90, secundario: text-white/40
- Accent: violet-500
- StatusBadge para estados (créalo en src/components/ui/StatusBadge.tsx si no existe)

## AL TERMINAR
Crea `.agent-status/restaurante/DONE.md`:
```markdown
# HANDOFF: RESTAURANTE
## Archivos modificados
- src/app/(dashboard)/reservas/page.tsx
- src/app/(dashboard)/pedidos/page.tsx
- src/app/(dashboard)/mesas/page.tsx
- src/app/(dashboard)/llamadas/page.tsx
- src/app/(dashboard)/dashboard/page.tsx
## Archivos nuevos
- src/types/restaurant.ts (si el arquitecto no lo creó)
- src/components/ui/StatusBadge.tsx (si no existe)
## Advertencias para QA
[lista cualquier edge case que no pudiste resolver]
## Estado: LISTO_PARA_QA
```
