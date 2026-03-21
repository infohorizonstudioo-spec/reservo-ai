# Agente: PSYCHOLOGY
# Rama: feature/psicologia
# Cómo abrir:
#   cd C:\Users\krush\reservo-ai
#   git checkout feature/psicologia
#   C:\Users\krush\.local\bin\claude.exe --dangerously-skip-permissions
# Cuando abra escribe: Lee y ejecuta agents/PSYCHOLOGY.md

Lee CLAUDE.md antes de empezar.

## Tu misión
Sistema de recepción para consultas psicológicas.
CRÍTICO: el tono es lo más importante. Empático, calmado, humano. Nunca robótico.
La privacidad del paciente es sagrada — no exponer datos sensibles en listas.

## Patrón obligatorio
if (tenantType !== 'psychology') return null

## Lo que puedes tocar
- src/types/psychology.ts (crear)
- src/components/psychology/ (crear carpeta)
- src/lib/psych-engine.ts (crear)
- src/app/(dashboard)/agenda/page.tsx (añadir caso psychology)
- src/app/(dashboard)/clientes/page.tsx (añadir caso psychology — minimal, privacidad)
- src/app/(dashboard)/llamadas/page.tsx (añadir panel psicología)

## Tipos (src/types/psychology.ts)
```typescript
type PsychSessionType = 'primera_sesion' | 'seguimiento' | 'urgencia_emocional' | 'consulta_general'
type SessionModality = 'presencial' | 'online'
type PsychCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
type EmotionalUrgencyLevel = 'none' | 'medium' | 'high' | 'crisis'

interface PsychConsultationEvent {
  id: string; tenant_id: string; call_id?: string
  patient_name?: string; is_new_patient?: boolean
  session_type?: PsychSessionType; modality?: SessionModality
  emotional_urgency: EmotionalUrgencyLevel
  state: PsychCallState
  decision?: 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review' | 'escalar_urgencia'
  // NUNCA guardar motivo detallado en este nivel — solo nivel general
  general_topic?: 'ansiedad' | 'estres' | 'relaciones' | 'duelo' | 'otro'
  collected_data: Record<string, any>
  created_at: string
}

interface PsychAppointment {
  id: string; tenant_id: string
  patient_name: string; patient_phone?: string
  therapist_name?: string; session_type: PsychSessionType
  modality: SessionModality; session_number?: number
  date: string; time: string; duration_minutes: number
  status: 'pendiente' | 'confirmada' | 'en_sesion' | 'completada' | 'cancelada'
  // Sin campo "notes" visible en listas — privacidad
  created_at: string
}

interface PsychPatient {
  id: string; tenant_id: string
  name: string; phone?: string
  modality_preference?: SessionModality
  sessions_completed: number; next_appointment?: string; active: boolean
  // Sin diagnóstico, sin notas clínicas en este nivel
}
```

## Motor (src/lib/psych-engine.ts)
- detectEmotionalUrgency(text): EmotionalUrgencyLevel
  · crisis: "no puedo más", "hacerme daño", "crisis", "emergencia"
  · high: "muy mal", "angustia", "no duermo", "pánico"
  · medium: "ansiedad", "estrés", "preocupado"
  · none: tono normal
- classifySession(text, isNew): PsychSessionType
- getPsychDuration(type): number → primera_sesion=60, seguimiento=50, urgencia=60
- Si emotionalUrgency === 'crisis' → decisión automática: ESCALAR. Incluir texto: "Si estás en crisis, puedes llamar al 024"

## Panel de llamadas en tiempo real (src/components/psychology/PsychCallPanel.tsx)
CRÍTICO: paleta neutra, sin colores agresivos. Gris + un accent sutil.
- Estado animado (sin colores llamativos)
- Datos mínimos en tiempo real: nombre, tipo de sesión, modalidad
- Si urgencia emocional alta: banner suave (no rojo agresivo) "Requiere atención prioritaria"
- Si crisis: banner con texto "024 - Línea de atención a conducta suicida"
- NUNCA mostrar el motivo detallado en el panel visible

## Agenda psicología (src/components/psychology/AgendaPsico.tsx)
Vista de DÍA con slots de 50 min:
- Paleta neutra — azul slate, gris, nada llamativo
- Cada cita: solo nombre, hora, modalidad badge (presencial=slate, online=blue), estado
- SIN motivos ni notas en la vista general
- Panel lateral: misma información mínima
- Mock data si psych_appointments no existe

## Pacientes psicología (src/components/psychology/PacientesPsico.tsx)
Lista minimal — privacidad ante todo:
- Solo: nombre, teléfono, sesiones completadas, próxima cita, modalidad
- Sin exponer ningún dato clínico en la lista
- Click en paciente → vista individual donde sí puede ver más (pero fuera del scope de este agente)

## Memoria (src/lib/psych-memory.ts)
Por tenant: tipos de sesión frecuentes, patrones de citas, duración real.
NUNCA almacenar motivos detallados ni datos sensibles.
NO compartir entre tenants.

## Páginas
agenda/page.tsx: if (tenantType === 'psychology') return <AgendaPsico tenantId={tenantId} />
clientes/page.tsx: if (tenantType === 'psychology') return <PacientesPsico tenantId={tenantId} />

## Al terminar
Crea agents/status/PSYCHOLOGY.done con lista de archivos y: LISTO
