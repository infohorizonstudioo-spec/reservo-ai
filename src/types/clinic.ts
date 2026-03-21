// Shared appointment types (used by other agents)
export type ClinicAppointmentType =
  | 'consulta'
  | 'especialidad'
  | 'urgencia'
  | 'revision'
  | 'primera_visita'

export type AppointmentStatus =
  | 'pendiente'
  | 'confirmada'
  | 'en_consulta'
  | 'completada'
  | 'cancelada'
  | 'no_show'

// Clinic AI call system types
export type CallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
export type ConsultType = 'revision' | 'limpieza' | 'tratamiento' | 'urgencia' | 'otro'
export type IntentType = 'pedir_cita' | 'consulta_general' | 'urgencia' | 'duda_administrativa'
export type DecisionType = 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review' | 'escalar_urgencia'

export interface ConsultationEvent {
  id: string
  tenant_id: string
  call_id?: string
  patient_name?: string
  is_new_patient?: boolean
  reason?: string
  consult_type?: ConsultType
  is_urgent: boolean
  urgency_keywords?: string[]
  intent?: IntentType
  state: CallState
  decision?: DecisionType
  decision_reason?: string
  collected_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ClinicAppointment {
  id: string
  tenant_id: string
  patient_name: string
  patient_phone?: string
  patient_email?: string
  doctor_name?: string
  type?: ClinicAppointmentType
  consult_type: ConsultType
  date: string
  time: string
  duration_minutes: number
  reason?: string
  is_urgent: boolean
  status: AppointmentStatus
  notes?: string
  created_at: string
}

export interface ClinicDoctor {
  id: string
  tenant_id: string
  name: string
  specialty: string
  color: string
  active: boolean
}

export interface ClinicMemory {
  tenant_id: string
  frequent_consult_types: Record<ConsultType, number>
  avg_durations: Record<ConsultType, number>
  recurring_patients: string[]
  urgency_patterns: string[]
  last_updated: string
}
