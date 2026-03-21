# PROMPT — AGENTE INMOBILIARIA
# Pega esto completo en una sesión de Claude Code dentro de C:\Users\krush\reservo-ai
# RAMA: git checkout feature/inmobiliaria (o créala desde main)

Eres el desarrollador de la vertical inmobiliaria en RESERVO.AI.
Tu lógica siempre condicionada: solo activa si tenant type es 'realestate'.

## RAMA DE TRABAJO
```bash
git checkout feature/inmobiliaria
# Si no existe: git checkout -b feature/inmobiliaria main
```

## TUS ARCHIVOS
```
src/app/(dashboard)/clientes/page.tsx    ← kanban de leads (si tenant es realestate)
src/app/(dashboard)/agenda/page.tsx      ← lista de visitas (si tenant es realestate)
src/types/realestate.ts                  ← si el arquitecto no lo creó
src/components/realestate/LeadsKanban.tsx
src/components/realestate/VisitasView.tsx
src/components/realestate/LeadModal.tsx
```

## PATRÓN DE CONDICIONAL
```tsx
// En clientes/page.tsx
if (tenantType === 'realestate') return <LeadsKanban tenantId={tenantId} />

// En agenda/page.tsx
if (tenantType === 'realestate') return <VisitasView tenantId={tenantId} />
```

## COMPONENTE LeadsKanban
```
Layout: 5 columnas Kanban horizontal (scroll si pantalla pequeña)
Columnas: NUEVO | CONTACTADO | VISITA AGENDADA | OFERTA | CERRADO/PERDIDO

Cada card de lead:
  - Nombre + teléfono (prominente)
  - Qué busca: operación (compra/alquiler) + tipo + zona + presupuesto max
  - Agente asignado (badge pequeño)
  - Tiempo desde creación + badge rojo si >3 días sin contacto
  - Botones: "Llamar" (tel: link) | "Agendar visita" | "Mover estado"

Header de cada columna:
  - Nombre del estado + contador de leads en esa columna

Acción rápida: botón "+" en header de NUEVO para añadir lead
```

## COMPONENTE LeadModal (nuevo lead)
```
Campos:
  - Nombre (required), Teléfono, Email
  - Operación: Compra | Alquiler
  - Tipo de propiedad: Piso | Casa | Local | Terreno | Garaje | Otro
  - Zona de interés (texto libre)
  - Presupuesto máximo (número + € / mes si alquiler)
  - Fuente: Manual | Web | Portal | Teléfono | Referido
  - Agente asignado (texto libre)
  - Notas iniciales (textarea)
```

## COMPONENTE VisitasView (agenda con tenant realestate)
```
Layout: lista vertical (no calendario — es más útil para inmobiliaria)

Sección "HOY" (si hay visitas hoy):
  - Destacada arriba con fondo ligeramente diferente
  - Cada visita: hora | cliente | dirección propiedad | agente | estado

Sección "PRÓXIMAS":
  - Lista por fecha
  - Misma estructura

Cada item:
  [HORA] [CLIENTE] → [DIRECCIÓN] — Agente: [nombre] — [StatusBadge]
  Botones rápidos: Confirmar | Marcar realizada | Cancelar

Botón "Nueva visita" arriba a la derecha:
  Modal con: cliente (texto), propiedad (texto/dirección), agente, fecha, hora, notas
```

## MOCK DATA inmobiliaria
```typescript
const MOCK_LEADS: RealEstateLead[] = [
  { id:'r1', tenant_id:'...', name:'Ana Martínez', phone:'612000001',
    operation:'compra', property_type:'piso', zone:'Centro', budget_max:250000,
    status:'nuevo', source:'web', created_at: THREE_DAYS_AGO },
  { id:'r2', tenant_id:'...', name:'Roberto Gil', phone:'612000002',
    operation:'alquiler', property_type:'piso', zone:'Ensanche', budget_max:900,
    status:'contactado', source:'telefono', last_contact: YESTERDAY,
    created_at: FIVE_DAYS_AGO },
  { id:'r3', tenant_id:'...', name:'Lucía Peña', phone:'612000003',
    operation:'compra', property_type:'casa', zone:'Afueras', budget_max:380000,
    status:'visita_agendada', source:'referido', created_at: WEEK_AGO },
  // añade 3-4 más distribuidos en las columnas del kanban
]
```

## UX DIFERENCIADOR CLAVE
El badge de "X días sin contacto" es el elemento más importante.
Cualquier lead con más de 3 días sin `last_contact` tiene un badge rojo visible.
Los leads en 'nuevo' sin contactar más de 1 día → badge naranja.
Esto es lo que venden los CRMs inmobiliarios: urgencia visual de seguimiento.

## AL TERMINAR
Crea `.agent-status/inmobiliaria/DONE.md`:
```markdown
# HANDOFF: INMOBILIARIA
## Archivos modificados
- src/app/(dashboard)/clientes/page.tsx
- src/app/(dashboard)/agenda/page.tsx
## Archivos nuevos
- src/types/realestate.ts (si el arquitecto no lo creó)
- src/components/realestate/LeadsKanban.tsx
- src/components/realestate/VisitasView.tsx
- src/components/realestate/LeadModal.tsx
## Tablas Supabase necesarias
- real_estate_leads, property_visits
## Estado: LISTO_PARA_QA
```
