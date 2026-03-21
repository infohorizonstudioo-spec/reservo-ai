# PROMPT — AGENTE VETERINARIA
# Pega esto completo en una sesión de Claude Code dentro de C:\Users\krush\reservo-ai
# RAMA: git checkout feature/veterinaria (o créala desde main)

Eres el desarrollador de la vertical veterinaria en RESERVO.AI.
Tu lógica siempre condicionada: solo activa si tenant type es 'veterinary'.

## RAMA DE TRABAJO
```bash
git checkout feature/veterinaria
# Si no existe: git checkout -b feature/veterinaria main
```

## TUS ARCHIVOS
```
src/app/(dashboard)/agenda/page.tsx      ← añade caso veterinary (condicional)
src/app/(dashboard)/clientes/page.tsx    ← añade vista mascotas/propietarios
src/types/veterinary.ts                  ← si el arquitecto no lo creó
src/components/vet/AgendaVet.tsx
src/components/vet/CitaVetModal.tsx
src/components/vet/MascotasView.tsx
```

## PATRÓN DE CONDICIONAL EN agenda/page.tsx
```tsx
'use client'
import { useTenantType } from '@/lib/tenant-context'

export default function AgendaPage() {
  const tenantType = useTenantType()
  if (tenantType === 'veterinary') return <AgendaVet />
  if (tenantType === 'clinic') return <AgendaClinica />   // ya lo creó el agente clínica
  return <AgendaSimple />
}
```

## COMPONENTE AgendaVet
```
Layout principal: vista de DÍA (no semana — más práctica para vet)

Sección URGENCIAS (si hay citas urgentes hoy):
  - Banner rojo arriba: "⚠️ 2 urgencias pendientes"
  - Lista de urgencias con nombre animal + propietario + motivo

Lista principal del día:
  - Ordenada por hora
  - Cada item:
    [HORA] [EMOJI_ESPECIE] [NOMBRE ANIMAL] ([raza]) — [PROPIETARIO] — [TIPO] — [DOCTOR]
    Emojis: perro=🐕 gato=🐈 conejo=🐇 ave=🦜 reptil=🦎 otro=🐾
    Badge de tipo: color por tipo (vacuna=teal, urgencia=red, cirugia=orange, peluqueria=pink)
    Botones: Confirmar | En consulta | Completar | Cancelar

Selector de fecha (arrows prev/next día) arriba de la lista
```

## COMPONENTE CitaVetModal
```
Campos:
  MASCOTA:
    - Nombre animal (required)
    - Especie (select: perro/gato/conejo/ave/reptil/otro)
    - Raza (texto libre, opcional)
    - Edad aprox (texto: "2 años", "6 meses")
    - Color/descripción breve

  PROPIETARIO:
    - Nombre (required)
    - Teléfono

  CITA:
    - Veterinario asignado (texto libre)
    - Tipo: consulta | vacuna | revisión | urgencia | cirugía | peluquería
    - Fecha y hora
    - Duración: 15/30/45/60/90 min
    - Motivo (textarea)
```

## COMPONENTE MascotasView (en clientes/page.tsx si tenant es veterinary)
```tsx
if (tenantType === 'veterinary') return <MascotasView tenantId={tenantId} />

// MascotasView muestra dos tabs: "Mascotas" | "Propietarios"
//
// Tab Mascotas:
//   Grid de cards — cada card: emoji especie, nombre, raza, propietario, última visita
//   Botón "Nueva cita" en cada card
//
// Tab Propietarios:
//   Lista — cada fila: nombre propietario, teléfono, mascotas (badges con emoji+nombre)
//   Click en propietario → expand con lista de sus mascotas
```

## MOCK DATA para veterinaria
```typescript
const MOCK_VET_APPOINTMENTS: VetAppointment[] = [
  { id:'v1', tenant_id:'...', pet_name:'Rocky', pet_species:'perro',
    owner_name:'Carlos Fernández', owner_phone:'612345678',
    type:'consulta', date:TODAY, time:'09:00', duration_minutes:30,
    reason:'Cojera pata trasera', status:'confirmada', created_at:NOW },
  { id:'v2', tenant_id:'...', pet_name:'Luna', pet_species:'gato',
    owner_name:'Marta Sanz', owner_phone:'698765432',
    type:'vacuna', date:TODAY, time:'09:30', duration_minutes:15,
    reason:'Vacuna anual', status:'pendiente', created_at:NOW },
  { id:'v3', tenant_id:'...', pet_name:'Tobi', pet_species:'perro',
    owner_name:'José Luis García',
    type:'urgencia', date:TODAY, time:'10:00', duration_minutes:45,
    reason:'Vómitos frecuentes', status:'pendiente', created_at:NOW },
  // añade 3-4 más
]
```

## DIFERENCIADOR UX CLAVE
La mascota es el protagonista, no el propietario.
El nombre del animal va PRIMERO y EN GRANDE. El propietario es secundario.
Usa los emojis de especie siempre — hacen la lista legible de un vistazo.

## AL TERMINAR
Crea `.agent-status/veterinaria/DONE.md`:
```markdown
# HANDOFF: VETERINARIA
## Archivos modificados
- src/app/(dashboard)/agenda/page.tsx
- src/app/(dashboard)/clientes/page.tsx
## Archivos nuevos
- src/types/veterinary.ts (si el arquitecto no lo creó)
- src/components/vet/AgendaVet.tsx
- src/components/vet/CitaVetModal.tsx
- src/components/vet/MascotasView.tsx
## Tablas Supabase necesarias
- vet_appointments, pets
## Advertencias para QA
[edge cases, mock data usado, etc.]
## Estado: LISTO_PARA_QA
```
