import type { EmotionalUrgencyLevel, PsychSessionType } from '@/types/psychology'

const CRISIS_KEYWORDS = ['no puedo más', 'hacerme daño', 'crisis', 'emergencia', 'suicidarme', 'acabar con todo', 'no quiero vivir']
const HIGH_KEYWORDS = ['muy mal', 'angustia', 'no duermo', 'pánico', 'no aguanto', 'desesperado', 'desesperada', 'ataques de pánico']
const MEDIUM_KEYWORDS = ['ansiedad', 'estrés', 'preocupado', 'preocupada', 'nervioso', 'nerviosa', 'insomnio', 'tristeza']

export function detectEmotionalUrgency(text: string): EmotionalUrgencyLevel {
  const lower = text.toLowerCase()
  if (CRISIS_KEYWORDS.some(k => lower.includes(k))) return 'crisis'
  if (HIGH_KEYWORDS.some(k => lower.includes(k))) return 'high'
  if (MEDIUM_KEYWORDS.some(k => lower.includes(k))) return 'medium'
  return 'none'
}

export function classifySession(text: string, isNew: boolean): PsychSessionType {
  const lower = text.toLowerCase()
  if (CRISIS_KEYWORDS.some(k => lower.includes(k)) || HIGH_KEYWORDS.some(k => lower.includes(k))) {
    return 'urgencia_emocional'
  }
  if (isNew) return 'primera_sesion'
  if (lower.includes('seguimiento') || lower.includes('continuar') || lower.includes('siguiente sesión')) {
    return 'seguimiento'
  }
  return 'consulta_general'
}

export function getPsychDuration(type: PsychSessionType): number {
  switch (type) {
    case 'primera_sesion': return 60
    case 'seguimiento': return 50
    case 'urgencia_emocional': return 60
    case 'consulta_general': return 50
  }
}

export const SESSION_TYPE_LABELS: Record<PsychSessionType, string> = {
  primera_sesion: 'Primera sesión',
  seguimiento: 'Seguimiento',
  urgencia_emocional: 'Urgencia emocional',
  consulta_general: 'Consulta general',
}

export const SESSION_TYPE_COLORS: Record<PsychSessionType, string> = {
  primera_sesion: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  seguimiento: 'bg-slate-400/15 text-slate-300 border-slate-400/25',
  urgencia_emocional: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  consulta_general: 'bg-slate-300/10 text-slate-400 border-slate-300/20',
}

export const MODALITY_COLORS: Record<string, string> = {
  presencial: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  online: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
}

export const CRISIS_MESSAGE = '024 - Línea de atención a conducta suicida'
export const CRISIS_HELP_TEXT = 'Si estás en crisis, puedes llamar al 024'
