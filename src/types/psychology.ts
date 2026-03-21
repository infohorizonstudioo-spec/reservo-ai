export type PsychSessionType = 'primera_sesion' | 'seguimiento' | 'urgencia_emocional' | 'consulta_general'
export type SessionModality = 'presencial' | 'online'
export type PsychCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
export type EmotionalUrgencyLevel = 'none' | 'medium' | 'high' | 'crisis'

export interface PsychConsultationEvent {
  id: string
  tenant_id: string
  call_id?: string
  patient_name?: string
  is_new_patient?: boolean
  session_type?: PsychSessionType
  modality?: SessionModality
  emotional_urgency: EmotionalUrgencyLevel
  state: PsychCallState
  decision?: 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review' | 'escalar_urgencia'
  // NUNCA guardar motivo detallado en este nivel — solo nivel general
  general_topic?: 'ansiedad' | 'estres' | 'relaciones' | 'duelo' | 'otro'
  collected_data: Record<string, any>
  created_at: string
}

export interface PsychAppointment {
  id: string
  tenant_id: string
  patient_name: string
  patient_phone?: string
  therapist_name?: string
  session_type: PsychSessionType
  modality: SessionModality
  session_number?: number
  date: string
  time: string
  duration_minutes: number
  status: 'pendiente' | 'confirmada' | 'en_sesion' | 'completada' | 'cancelada'
  // Sin campo "notes" visible en listas — privacidad
  created_at: string
}

export type PsychAppointmentStatus = PsychAppointment['status']

export interface PsychPatient {
  id: string
  tenant_id: string
  name: string
  phone?: string
  modality_preference?: SessionModality
  sessions_completed: number
  next_appointment?: string
  active: boolean
  // Sin diagnóstico, sin notas clínicas en este nivel
}
