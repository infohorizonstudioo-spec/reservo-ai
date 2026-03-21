# Agente: CLINIC
# Rama: feature/clinica
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   git checkout feature/clinica
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra Claude Code escribe: Lee y ejecuta agents/CLINIC.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Crear el sistema de clínica médica de RESERVO.AI.
Sustituye a una recepcionista real. No es un chatbot — es un sistema operativo para clínicas.

## Lo que puedes tocar
- src/app/(dashboard)/agenda/page.tsx (condicional: solo si tenantType === 'clinic')
- src/app/(dashboard)/clientes/page.tsx (condicional: solo si tenantType === 'clinic')
- src/app/(dashboard)/llamadas/page.tsx (condicional: añadir panel clínica)
- src/app/(dashboard)/dashboard/page.tsx (condicional: vista clínica)
- src/types/clinic.ts (crear)
- src/components/clinic/ (crear carpeta y todos los componentes)
- src/lib/clinic-engine.ts (crear — motor de decisiones)

## Lo que NO puedes tocar
- src/lib/supabase.ts · src/types/index.ts · src/app/layout.tsx
- Lógica de restaurante (mesas, pedidos, turnos) — no existe aquí
- Sistema de llamadas ElevenLabs (lo gestiona el agente ELEVENLABS)
- auth · billing · deploy

## Regla crítica
TODA query a Supabase lleva .eq('tenant_id', tenantId) sin excepción.
Usa siempre el patrón: if (tenantType !== 'clinic') return null

## SISTEMA COMPLETO A CONSTRUIR

### BLOQUE 1 — Tipos (src/types/clinic.ts)

```typescript
type CallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
type ConsultType = 'revision' | 'limpieza' | 'tratamiento' | 'urgencia' | 'otro'
type ConsultDuration = { revision: 20, limpieza: 30, tratamiento: 60 }
type IntentType = 'pedir_cita' | 'consulta_general' | 'urgencia' | 'duda_administrativa'
type DecisionType = 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review' | 'escalar_urgencia'

interface ConsultationEvent {
  id: string; tenant_id: string; call_id?: string
  patient_name?: string; is_new_patient?: boolean
  reason?: string; consult_type?: ConsultType
  is_urgent: boolean; urgency_keywords?: string[]
  intent?: IntentType; state: CallState
  decision?: DecisionType; decision_reason?: string
  collected_data: Record<string, any>
  created_at: string; updated_at: string
}

interface ClinicAppointment {
  id: string; tenant_id: string
  patient_name: string; patient_phone?: string
  doctor_name?: string; consult_type: ConsultType
  date: string; time: string; duration_minutes: number
  reason?: string; is_urgent: boolean
  status: 'pendiente' | 'confirmada' | 'en_consulta' | 'completada' | 'cancelada' | 'no_show'
  notes?: string; created_at: string
}

interface ClinicMemory {
  tenant_id: string
  frequent_consult_types: Record<ConsultType, number>
  avg_durations: Record<ConsultType, number>
  recurring_patients: string[]
  urgency_patterns: string[]
  last_updated: string
}
```

### BLOQUE 2 — Motor de decisiones (src/lib/clinic-engine.ts)
Crea una función `makeClinicDecision(event: ConsultationEvent, availableSlots: string[]): DecisionType`
- Si is_urgent → 'escalar_urgencia'
- Si hay hueco disponible → 'confirmar_cita'
- Si no hay hueco → 'sugerir_alternativa'
- Si datos incompletos → 'pending_review'
PROHIBIDO confirmar sin verificar disponibilidad real.

Crea también `detectUrgency(text: string): boolean`
Palabras clave de urgencia: dolor fuerte, infección, sangrado, crítico, no puedo, emergencia, urgente

Crea `classifyConsult(text: string): ConsultType`
Clasifica por palabras clave del motivo.

Crea `getConsultDuration(type: ConsultType): number`
revision=20, limpieza=30, tratamiento=60, urgencia=30, otro=20

### BLOQUE 3 — Panel de llamadas en tiempo real (src/components/clinic/ClinicCallPanel.tsx)
Panel que muestra INMEDIATAMENTE cuando entra una llamada. No espera al final.
- Estado de la llamada: badge animado con el estado actual (incoming/listening/processing/speaking/collecting_data)
- Datos recopilados en tiempo real: nombre paciente, motivo, urgencia (se van llenando mientras habla)
- Si is_urgent: banner rojo pulsante "URGENCIA DETECTADA"
- Si generating_appointment: "Verificando disponibilidad..."
- Transcripción en vivo (últimas 4 líneas)
- Decisión tomada al final con razón explicada
Suscripción realtime a tabla consultation_events con cleanup.

### BLOQUE 4 — Agenda clínica (src/components/clinic/AgendaClinica.tsx)
Vista semanal con slots de 08:00 a 20:00 cada 30 min.
- Colores por tipo: revision=blue, urgencia=red, tratamiento=orange, limpieza=teal
- Click en slot vacío → modal nueva cita
- NO permite solapamientos (verificar antes de mostrar slot como libre)
- Duración visual: la cita ocupa el espacio correcto según su duración
- Panel lateral: lista del día con botones Confirmar / En consulta / Completar
- Si clinic_appointments no existe en Supabase → usar datos mock realistas

### BLOQUE 5 — Notificaciones en tiempo real (src/components/clinic/ClinicNotifications.tsx)
Badge en el header que muestra:
- Nueva consulta → click abre el evento
- Nueva cita confirmada → click abre la agenda
- Urgencia detectada → alerta roja con sonido visual (animación)

### BLOQUE 6 — Trazabilidad (src/components/clinic/ConsultTrace.tsx)
Para cada consultation_event muestra:
- Qué entendió el agente
- Qué datos recogió
- Qué decisión tomó y por qué

### BLOQUE 7 — Memoria por clínica (src/lib/clinic-memory.ts)
Funciones para actualizar y leer ClinicMemory:
- updateClinicMemory(tenantId, event) → actualiza estadísticas
- getClinicInsights(tenantId) → devuelve patrones aprendidos
NO compartir datos entre tenants.

### BLOQUE 8 — Páginas principales
src/app/(dashboard)/agenda/page.tsx:
  if (tenantType === 'clinic') return <AgendaClinica tenantId={tenantId} />

src/app/(dashboard)/llamadas/page.tsx:
  Añadir debajo de la lista de llamadas activas, si tenantType === 'clinic':
  <ClinicCallPanel tenantId={tenantId} />

src/app/(dashboard)/clientes/page.tsx:
  if (tenantType === 'clinic') return <PacientesClinica tenantId={tenantId} />

## Al terminar
Crea agents/status/CLINIC.done con:
- Lista de archivos creados
- LISTO
