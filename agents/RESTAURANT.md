# Agente: RESTAURANT
# Rama: feature/restaurante
# Pega esto en Claude Code después de: git checkout feature/restaurante

Lee CLAUDE.md antes de empezar.

## Contexto
La plantilla de restaurante ya existe y está bastante avanzada.
Tu trabajo es completarla y dejarla production-ready.

## Lo que puedes tocar
- src/app/(dashboard)/reservas/page.tsx
- src/app/(dashboard)/pedidos/page.tsx
- src/app/(dashboard)/mesas/page.tsx
- src/app/(dashboard)/llamadas/page.tsx
- src/app/(dashboard)/dashboard/page.tsx
- src/app/(dashboard)/clientes/page.tsx
- src/app/(dashboard)/agenda/page.tsx
- src/types/restaurant.ts (crear si no existe)
- src/components/restaurant/ (crear si no existe)

## Lo que NO puedes tocar
- src/lib/supabase.ts
- src/types/index.ts
- src/app/layout.tsx
- src/app/globals.css
- Sistema de llamadas ElevenLabs (lo gestiona el agente ELEVENLABS)
- next.config.js · package.json · .env.local

## Regla crítica
TODA query a Supabase lleva .eq('tenant_id', tenantId) sin excepción.

## Tareas

### 1. Reservas (/reservas)
Revisar y mejorar la página existente:
- Añadir filtro por fecha (hoy / mañana / esta semana)
- Añadir contador de personas totales en el header
- Añadir botón "Imprimir lista del día"
- Asegurarse de que el modal de nueva reserva valida todos los campos requeridos
- Suscripción realtime con cleanup correcto

### 2. Pedidos (/pedidos)
Revisar y mejorar:
- Añadir badge de tiempo transcurrido en cada card (verde <10min, naranja 10-20, rojo >20)
- Añadir sonido/notificación visual cuando llega un pedido nuevo (priority urgente)
- El kanban debe mostrar empty state por columna, no solo global

### 3. Mesas (/mesas)
Revisar y mejorar:
- Añadir capacidad total de la zona en el header de cada tab
- Añadir botón "Liberar todas las mesas" con confirmación
- El plano posicional debe funcionar correctamente con position_x/position_y

### 4. Dashboard (/dashboard)
Revisar y mejorar:
- Los 4 KPIs deben mostrar datos reales de hoy
- Añadir sección "Próximas reservas" (siguientes 2 horas)
- Añadir sección "Alertas" con las no leídas
- Realtime activo con cleanup correcto

### 5. Clientes (/clientes)
Si tenant type es restaurant:
- Lista de clientes con: nombre, teléfono, visitas, última visita, total gastado
- Búsqueda por nombre o teléfono
- Click en cliente muestra su historial de reservas

### 6. Agenda (/agenda)
Si tenant type es restaurant:
- Vista semanal de reservas en formato calendario
- Click en día muestra las reservas de ese día

## Al terminar
Crea el archivo agents/status/RESTAURANT.done con contenido: LISTO
