export type BodyArea = 'cervical' | 'lumbar' | 'hombro' | 'rodilla' | 'tobillo' | 'cadera' | 'otro'
export type PhysioConsultType = 'primera_visita' | 'tratamiento' | 'seguimiento' | 'rehabilitacion'
export type PhysioCallState = 'incoming' | 'listening' | 'processing' | 'speaking' | 'collecting_data'
export type PhysioAppointmentStatus = 'pendiente' | 'confirmada' | 'en_sesion' | 'completada' | 'cancelada'
export type TreatmentType = 'manual' | 'ejercicios' | 'electroterapia' | 'combinado'

export interface PhysioConsultationEvent {
  id: string
  tenant_id: string
  call_id?: string
  patient_name?: string
  is_new_patient?: boolean
  problem_description?: string
  body_area?: BodyArea
  consult_type?: PhysioConsultType
  is_recent_injury?: boolean
  state: PhysioCallState
  decision?: 'confirmar_cita' | 'sugerir_alternativa' | 'pending_review'
  collected_data: Record<string, any>
  created_at: string
}

export interface PhysioAppointment {
  id: string
  tenant_id: string
  patient_name: string
  patient_phone?: string
  therapist_name?: string
  consult_type: PhysioConsultType
  body_area?: BodyArea
  session_number?: number
  treatment_type?: TreatmentType
  date: string
  time: string
  duration_minutes: number
  reason?: string
  status: PhysioAppointmentStatus
  notes?: string
  created_at: string
}

export interface PhysioPatient {
  id: string
  tenant_id: string
  name: string
  phone?: string
  email?: string
  injury_description?: string
  body_area?: BodyArea
  sessions_completed: number
  total_sessions_planned?: number
  next_appointment?: string
  active: boolean
}
