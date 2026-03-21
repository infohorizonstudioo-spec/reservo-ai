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

export interface ClinicAppointment {
  id: string
  tenant_id: string
  patient_name: string
  patient_phone?: string
  patient_email?: string
  doctor_name?: string
  type: ClinicAppointmentType
  date: string
  time: string
  duration_minutes: 15 | 30 | 45 | 60
  reason?: string
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
