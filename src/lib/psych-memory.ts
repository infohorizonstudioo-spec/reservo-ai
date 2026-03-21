import type { PsychSessionType, SessionModality } from '@/types/psychology'

interface PsychTenantMemory {
  frequent_session_types: Record<PsychSessionType, number>
  modality_distribution: Record<SessionModality, number>
  average_duration_minutes: number
  total_sessions: number
}

const tenantMemories = new Map<string, PsychTenantMemory>()

function getOrCreate(tenantId: string): PsychTenantMemory {
  if (!tenantMemories.has(tenantId)) {
    tenantMemories.set(tenantId, {
      frequent_session_types: { primera_sesion: 0, seguimiento: 0, urgencia_emocional: 0, consulta_general: 0 },
      modality_distribution: { presencial: 0, online: 0 },
      average_duration_minutes: 50,
      total_sessions: 0,
    })
  }
  return tenantMemories.get(tenantId)!
}

export function recordSession(tenantId: string, sessionType: PsychSessionType, modality: SessionModality, durationMinutes: number) {
  const mem = getOrCreate(tenantId)
  mem.frequent_session_types[sessionType]++
  mem.modality_distribution[modality]++
  mem.total_sessions++
  mem.average_duration_minutes = Math.round(
    ((mem.average_duration_minutes * (mem.total_sessions - 1)) + durationMinutes) / mem.total_sessions
  )
}

export function getTenantMemory(tenantId: string): PsychTenantMemory {
  return getOrCreate(tenantId)
}
