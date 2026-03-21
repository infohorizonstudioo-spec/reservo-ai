import type { ConsultationEvent, ConsultType, DecisionType } from '@/types/clinic'

const URGENCY_KEYWORDS = [
  'dolor fuerte', 'infección', 'sangrado', 'crítico',
  'no puedo', 'emergencia', 'urgente', 'hinchazón severa',
  'fiebre alta', 'accidente'
]

const CONSULT_KEYWORDS: Record<ConsultType, string[]> = {
  revision: ['revisión', 'revision', 'chequeo', 'control', 'seguimiento', 'consulta general'],
  limpieza: ['limpieza', 'higiene', 'profilaxis', 'sarro', 'placa'],
  tratamiento: ['tratamiento', 'empaste', 'endodoncia', 'extracción', 'corona', 'implante', 'ortodoncia', 'cirugía'],
  urgencia: ['urgencia', 'urgente', 'dolor', 'emergencia', 'roto', 'fractura'],
  otro: [],
}

const CONSULT_DURATIONS: Record<ConsultType, number> = {
  revision: 20,
  limpieza: 30,
  tratamiento: 60,
  urgencia: 30,
  otro: 20,
}

export function detectUrgency(text: string): boolean {
  const lower = text.toLowerCase()
  return URGENCY_KEYWORDS.some(kw => lower.includes(kw))
}

export function findUrgencyKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return URGENCY_KEYWORDS.filter(kw => lower.includes(kw))
}

export function classifyConsult(text: string): ConsultType {
  const lower = text.toLowerCase()
  for (const [type, keywords] of Object.entries(CONSULT_KEYWORDS) as [ConsultType, string[]][]) {
    if (type === 'otro') continue
    if (keywords.some(kw => lower.includes(kw))) return type
  }
  return 'otro'
}

export function getConsultDuration(type: ConsultType): number {
  return CONSULT_DURATIONS[type] ?? 20
}

export function makeClinicDecision(
  event: ConsultationEvent,
  availableSlots: string[]
): DecisionType {
  if (event.is_urgent) return 'escalar_urgencia'

  const hasName = !!event.patient_name
  const hasType = !!event.consult_type
  if (!hasName || !hasType) return 'pending_review'

  if (availableSlots.length > 0) return 'confirmar_cita'

  return 'sugerir_alternativa'
}

export function getDecisionReason(decision: DecisionType, event: ConsultationEvent, availableSlots: string[]): string {
  switch (decision) {
    case 'escalar_urgencia':
      return `Urgencia detectada${event.urgency_keywords?.length ? ': ' + event.urgency_keywords.join(', ') : ''}`
    case 'confirmar_cita':
      return `Hueco disponible: ${availableSlots[0]}. Tipo: ${event.consult_type}`
    case 'sugerir_alternativa':
      return 'No hay huecos disponibles en la fecha solicitada'
    case 'pending_review':
      return `Datos incompletos: ${!event.patient_name ? 'falta nombre' : ''}${!event.consult_type ? ' falta tipo consulta' : ''}`.trim()
    default:
      return ''
  }
}

export const CONSULT_TYPE_LABELS: Record<ConsultType, string> = {
  revision: 'Revisión',
  limpieza: 'Limpieza',
  tratamiento: 'Tratamiento',
  urgencia: 'Urgencia',
  otro: 'Otro',
}

export const CONSULT_TYPE_COLORS: Record<ConsultType, string> = {
  revision: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  limpieza: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  tratamiento: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  urgencia: 'bg-red-500/20 border-red-500/40 text-red-300',
  otro: 'bg-white/10 border-white/20 text-white/60',
}
