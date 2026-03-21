# PROMPT — AGENTE CLÍNICA
# Pega esto completo en una sesión de Claude Code dentro de C:\Users\krush\reservo-ai
# RAMA: git checkout feature/clinica (o créala desde main)

Eres el desarrollador de la vertical de clínica médica en RESERVO.AI.
Lee CLAUDE.md y src/types/index.ts antes de empezar.
Tu lógica siempre condicionada: si el tenant NO es tipo clinic, no renderices nada tuyo.

## RAMA DE TRABAJO
```bash
git checkout feature/clinica
# Si no existe: git checkout -b feature/clinica main
```

## TUS ARCHIVOS
```
src/app/(dashboard)/agenda/page.tsx      ← tu módulo principal (condicional por tipo)
src/app/(dashboard)/clientes/page.tsx    ← añade tab "Pacientes" si tenant es clinic
src/types/clinic.ts                      ← si el arquitecto no lo creó
src/components/clinic/AgendaClinica.tsx  ← componente principal de agenda
src/components/clinic/CitaModal.tsx      ← modal de nueva cita
```

## PATRÓN DE CONDICIONAL (usa en agenda/page.tsx y clientes/page.tsx)
```tsx
'use client'
import { useTenantType } from '@/lib/tenant-context'

export default function AgendaPage() {
  const tenantType = useTenantType()
  if (tenantType === 'clinic') return <AgendaClinica />
  if (tenantType === 'veterinary') return null  // el agente vet lo pone
  // default: agenda simple (usa lo que ya existe)
  return <AgendaSimple />
}
```

## COMPONENTE AgendaClinica
```
Layout: dos paneles
Panel izquierdo (60%): calendario semanal con slots de hora
  - Horas: 08:00 a 20:00 en filas de 30 min
  - Columnas: Lun-Dom (solo días con citas destacados)
  - Cada slot ocupado: nombre paciente + tipo (color) + duración visual
  - Click en slot vacío → abre CitaModal

Panel derecho (40%): lista del día seleccionado
  - Ordenada por hora
  - Cada item: hora | paciente | tipo | doctor | duración | estado
  - Botones rápidos: Confirmar llegada | En consulta | Completar

Colores de tipo:
  consulta=blue, urgencia=red, revision=green, primera_visita=violet, especialidad=orange
```

## COMPONENTE CitaModal (clínica)
```
Campos:
  - Paciente: nombre (required), teléfono, email
  - Doctor asignado (select o texto libre)
  - Tipo: consulta | especialidad | urgencia | revisión | primera visita
  - Fecha (date picker) y Hora (time select cada 15min)
  - Duración: 15 / 30 / 45 / 60 minutos
  - Motivo de consulta (textarea, max 300 chars)
  - Notas internas (textarea, opcional)

Validaciones:
  - Nombre requerido
  - Fecha no puede ser pasada
  - Hora en rango horario del negocio
```

## DATOS MOCK (si la tabla clinic_appointments no existe aún)
```typescript
// En tu componente, detecta si la tabla existe:
const { error } = await supabase.from('clinic_appointments').select('id').limit(1)
if (error?.code === '42P01') {
  // tabla no existe → usa MOCK_APPOINTMENTS
  return MOCK_APPOINTMENTS
}

const MOCK_APPOINTMENTS: ClinicAppointment[] = [
  { id:'1', tenant_id:'...', patient_name:'Carmen López', doctor_name:'Dra. García',
    type:'consulta', date: TODAY, time:'09:00', duration_minutes:30,
    reason:'Revisión anual', status:'confirmada', created_at: NOW },
  { id:'2', tenant_id:'...', patient_name:'Miguel Torres', doctor_name:'Dr. Ruiz',
    type:'urgencia', date: TODAY, time:'09:30', duration_minutes:15,
    reason:'Fiebre alta', status:'pendiente', created_at: NOW },
  // añade 4-5 más con variedad de tipos y horas
]
```

## CLIENTES/PACIENTES (si tenant es clinic)
En clientes/page.tsx, añade condicionalmente:
```tsx
if (tenantType === 'clinic') {
  // Muestra tabla de pacientes con columnas:
  // Nombre | Teléfono | Última visita | Próxima cita | Nº visitas totales
  // Botón "Nueva cita" en cada fila
  return <PacientesView tenantId={tenantId} />
}
```

## REGLA CRÍTICA
TODAS las queries con `.eq('tenant_id', tenantId)`.
Si la tabla no existe, usa mock data silenciosamente.

## AL TERMINAR
Crea `.agent-status/clinica/DONE.md`:
```markdown
# HANDOFF: CLÍNICA
## Archivos modificados
- src/app/(dashboard)/agenda/page.tsx
- src/app/(dashboard)/clientes/page.tsx
## Archivos nuevos
- src/types/clinic.ts (si el arquitecto no lo creó)
- src/components/clinic/AgendaClinica.tsx
- src/components/clinic/CitaModal.tsx
## Tablas Supabase necesarias
- clinic_appointments (esquema en src/types/clinic.ts)
## Advertencias para QA
[lo que no pudiste resolver o dejaste con mock]
## Estado: LISTO_PARA_QA
```
