import type { BodyArea, PhysioConsultType } from '@/types/physiotherapy'

const BODY_AREA_KEYWORDS: Record<BodyArea, string[]> = {
  cervical: ['cervical', 'cuello', 'cervicales', 'nuca', 'tortícolis', 'torticolis'],
  lumbar: ['lumbar', 'lumbares', 'espalda baja', 'ciática', 'ciatica', 'lumbalgia'],
  hombro: ['hombro', 'hombros', 'manguito', 'rotador', 'deltoides', 'supraespinoso'],
  rodilla: ['rodilla', 'rodillas', 'menisco', 'ligamento cruzado', 'rótula', 'rotula'],
  tobillo: ['tobillo', 'tobillos', 'esguince', 'pie', 'aquiles', 'plantar'],
  cadera: ['cadera', 'caderas', 'ingle', 'psoas', 'glúteo', 'gluteo', 'piriforme'],
  otro: [],
}

const CONSULT_KEYWORDS: Record<PhysioConsultType, string[]> = {
  primera_visita: ['primera vez', 'primera visita', 'nuevo', 'nunca he venido', 'primera consulta'],
  tratamiento: ['tratamiento', 'sesión', 'sesion', 'terapia', 'masaje', 'manipulación', 'punción seca'],
  seguimiento: ['seguimiento', 'control', 'revisión', 'revision', 'cómo va', 'como va', 'evolución'],
  rehabilitacion: ['rehabilitación', 'rehabilitacion', 'post-operatorio', 'postoperatorio', 'postquirúrgico', 'recuperación', 'recuperacion'],
}

const CONSULT_DURATIONS: Record<PhysioConsultType, number> = {
  primera_visita: 60,
  tratamiento: 30,
  seguimiento: 20,
  rehabilitacion: 45,
}

const RECENT_INJURY_KEYWORDS = [
  'ayer', 'hace 2 días', 'hace dos días', 'hace un día', 'reciente',
  'esta semana', 'hace poco', 'hace unos días', 'anteayer', 'hoy',
  'hace 3 días', 'hace tres días', 'me acabo de', 'justo ahora',
]

export function detectBodyArea(text: string): BodyArea {
  const lower = text.toLowerCase()
  for (const [area, keywords] of Object.entries(BODY_AREA_KEYWORDS) as [BodyArea, string[]][]) {
    if (area === 'otro') continue
    if (keywords.some(kw => lower.includes(kw))) return area
  }
  if (lower.includes('espalda')) return 'lumbar'
  return 'otro'
}

export function classifyPhysioConsult(text: string, isNew: boolean): PhysioConsultType {
  if (isNew) return 'primera_visita'
  const lower = text.toLowerCase()
  for (const [type, keywords] of Object.entries(CONSULT_KEYWORDS) as [PhysioConsultType, string[]][]) {
    if (keywords.some(kw => lower.includes(kw))) return type
  }
  return 'tratamiento'
}

export function getPhysioDuration(type: PhysioConsultType): number {
  return CONSULT_DURATIONS[type] ?? 30
}

export function isRecentInjury(text: string): boolean {
  const lower = text.toLowerCase()
  return RECENT_INJURY_KEYWORDS.some(kw => lower.includes(kw))
}

export const BODY_AREA_LABELS: Record<BodyArea, string> = {
  cervical: 'Cervical',
  lumbar: 'Lumbar',
  hombro: 'Hombro',
  rodilla: 'Rodilla',
  tobillo: 'Tobillo',
  cadera: 'Cadera',
  otro: 'Otro',
}

export const BODY_AREA_COLORS: Record<BodyArea, string> = {
  cervical: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  lumbar: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  hombro: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  rodilla: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  tobillo: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
  cadera: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
  otro: 'bg-white/10 border-white/20 text-white/60',
}

export const CONSULT_TYPE_LABELS: Record<PhysioConsultType, string> = {
  primera_visita: 'Primera visita',
  tratamiento: 'Tratamiento',
  seguimiento: 'Seguimiento',
  rehabilitacion: 'Rehabilitación',
}

export const CONSULT_TYPE_COLORS: Record<PhysioConsultType, string> = {
  primera_visita: 'bg-violet-500/20 border-violet-500/40 text-violet-300',
  tratamiento: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  seguimiento: 'bg-teal-500/20 border-teal-500/40 text-teal-300',
  rehabilitacion: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
}

export const TREATMENT_LABELS: Record<string, string> = {
  manual: 'Terapia manual',
  ejercicios: 'Ejercicios',
  electroterapia: 'Electroterapia',
  combinado: 'Combinado',
}
