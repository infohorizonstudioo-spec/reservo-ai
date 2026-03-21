# Agente: PHYSIOTHERAPY
# Rama: feature/fisioterapia
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   git checkout feature/fisioterapia
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra escribe: Lee y ejecuta agents/PHYSIOTHERAPY.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Sistema de recepción para centros de fisioterapia.
Entiende el problema del paciente, clasifica la lesión, gestiona citas con duración correcta.

## Patrón obligatorio
if (tenantType !== 'physiotherapy') return null

## Lo que puedes tocar
- src/types/physiotherapy.ts (crear)
- src/components/physio/ (crear carpeta)
- src/lib/physio-engine.ts (crear)
- src/app/(dashboard)/agenda/page.tsx (añadir caso physiotherapy)
- src/app/(dashboard)/clientes/page.tsx (añadir caso physiotherapy)
- src/app/(dashboard)/llamadas/page.tsx (añadir panel physio)

## Tipos (src/types/physiotherapy.ts)
```typescript
type BodyArea = 'cervical' | 'lumbar' | 'hombro' | 'rodilla' | 'tobillo' | 'cadera' | 'otro'
type PhysioConsultType = 'primera_visita' | 'tratamiento' | 'seguimiento' | 'rehabilitacion'
type PhysioCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'

interface PhysioConsultationEvent {
  id: string; tenant_id: string; call_id?: string
  patient_name?: string; is_new_patient?: boolean
  problem_description?: string; body_area?: BodyArea
  consult_type?: PhysioConsultType; is_recent_injury?: boolean
  state: PhysioCallState
  decision?: 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review'
  collected_data: Record<string, any>
  created_at: string
}

interface PhysioAppointment {
  id: string; tenant_id: string
  patient_name: string; patient_phone?: string
  therapist_name?: string; consult_type: PhysioConsultType
  body_area?: BodyArea; session_number?: number
  treatment_type?: 'manual' | 'ejercicios' | 'electroterapia' | 'combinado'
  date: string; time: string; duration_minutes: number
  reason?: string
  status: 'pendiente' | 'confirmada' | 'en_sesion' | 'completada' | 'cancelada'
  notes?: string; created_at: string
}

interface PhysioPatient {
  id: string; tenant_id: string
  name: string; phone?: string; email?: string
  injury_description?: string; body_area?: BodyArea
  sessions_completed: number; total_sessions_planned?: number
  next_appointment?: string; active: boolean
}
```

## Motor (src/lib/physio-engine.ts)
- detectBodyArea(text): BodyArea → cervical, lumbar, espalda, rodilla, tobillo...
- classifyPhysioConsult(text, isNew): PhysioConsultType
- getPhysioDuration(type): number → primera_visita=60, tratamiento=30, seguimiento=20, rehabilitacion=45
- isRecentInjury(text): boolean → "ayer", "hace 2 días", "reciente", "esta semana"

## Panel de llamadas en tiempo real (src/components/physio/PhysioCallPanel.tsx)
Muestra INMEDIATAMENTE:
- Estado animado
- Datos en tiempo real: nombre, zona corporal (badge con color), tipo de lesión
- Colores por zona: cervical=blue, lumbar=orange, hombro=violet, rodilla=green, otro=gray
- Si lesión reciente: badge "LESIÓN RECIENTE" en naranja
- Sesión número si es paciente recurrente

## Agenda fisioterapia (src/components/physio/AgendaFisio.tsx)
Vista de DÍA con slots cada 30 min:
- Duración visual correcta (primera visita ocupa más espacio)
- Cada cita: paciente, zona corporal badge, nº sesión ("Sesión 3/10"), tipo tratamiento
- Panel lateral: lista del día con botones Confirmar / En sesión / Completar
- Mock data realista si physio_appointments no existe

## Pacientes fisio (src/components/physio/PacientesFisio.tsx)
Lista con: nombre, lesión/zona, sesiones completadas/planificadas (barra de progreso), próxima cita

## Memoria (src/lib/physio-memory.ts)
Por tenant: lesiones frecuentes, duraciones reales, ratios de recuperación.
NO compartir entre tenants.

## Páginas
agenda/page.tsx: if (tenantType === 'physiotherapy') return <AgendaFisio tenantId={tenantId} />
clientes/page.tsx: if (tenantType === 'physiotherapy') return <PacientesFisio tenantId={tenantId} />

## Al terminar
Crea agents/status/PHYSIOTHERAPY.done con lista de archivos y: LISTO
