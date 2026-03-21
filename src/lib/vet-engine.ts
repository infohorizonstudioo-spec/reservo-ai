import type { VetConsultType, VetDecision, VetConsultationEvent, PetSpecies } from '@/types/veterinary'

const URGENCY_KEYWORDS = [
  'accidente', 'sangrado', 'sangra', 'respiración', 'respira', 'no respira',
  'dolor intenso', 'dolor fuerte', 'estado grave', 'grave', 'convulsión',
  'envenenamiento', 'veneno', 'atropello', 'fractura', 'herida abierta',
  'inconsciente', 'no se mueve', 'ahogando', 'asfixia', 'mordedura',
]

const SPECIES_PATTERNS: { pattern: RegExp; species: PetSpecies }[] = [
  { pattern: /\b(perro|perra|cachorro|cachorra)\b/i, species: 'perro' },
  { pattern: /\b(gato|gata|gatito|gatita|minino)\b/i, species: 'gato' },
  { pattern: /\b(conejo|coneja|conejito)\b/i, species: 'conejo' },
  { pattern: /\b(ave|pájaro|pájara|loro|canario|periquito)\b/i, species: 'ave' },
  { pattern: /\b(reptil|tortuga|iguana|serpiente|camaleón|lagarto)\b/i, species: 'reptil' },
]

const CONSULT_PATTERNS: { pattern: RegExp; type: VetConsultType }[] = [
  { pattern: /\b(vacuna|vacunación|vacunar)\b/i, type: 'vacuna' },
  { pattern: /\b(urgencia|urgente|emergencia|grave|accidente)\b/i, type: 'urgencia' },
  { pattern: /\b(tratamiento|curar|medicación|operar|cirugía)\b/i, type: 'tratamiento' },
  { pattern: /\b(revisión|revision|chequeo|control|rutina)\b/i, type: 'revision' },
]

export function detectVetUrgency(text: string): boolean {
  const lower = text.toLowerCase()
  return URGENCY_KEYWORDS.some(kw => lower.includes(kw))
}

export function getUrgencyKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  return URGENCY_KEYWORDS.filter(kw => lower.includes(kw))
}

export function classifyVetConsult(text: string): VetConsultType {
  for (const { pattern, type } of CONSULT_PATTERNS) {
    if (pattern.test(text)) return type
  }
  return 'otro'
}

export function getVetDuration(type: VetConsultType): number {
  const durations: Record<VetConsultType, number> = {
    revision: 20,
    vacuna: 15,
    tratamiento: 45,
    urgencia: 30,
    otro: 30,
  }
  return durations[type]
}

export function detectPetSpecies(text: string): PetSpecies {
  for (const { pattern, species } of SPECIES_PATTERNS) {
    if (pattern.test(text)) return species
  }
  return 'otro'
}

export function makeVetDecision(
  event: VetConsultationEvent,
  slots: { date: string; time: string }[]
): VetDecision {
  if (event.is_urgent) return 'escalar_urgencia'
  if (!event.pet_name || !event.owner_name) return 'pending_review'
  if (slots.length === 0) return 'sugerir_alternativa'
  return 'confirmar_cita'
}

export const CONSULT_TYPE_LABELS: Record<VetConsultType, string> = {
  revision: 'Revisión',
  vacuna: 'Vacuna',
  tratamiento: 'Tratamiento',
  urgencia: 'Urgencia',
  otro: 'Otro',
}

export const SPECIES_EMOJI: Record<PetSpecies, string> = {
  perro: '🐕',
  gato: '🐈',
  conejo: '🐇',
  ave: '🦜',
  reptil: '🦎',
  otro: '🐾',
}
