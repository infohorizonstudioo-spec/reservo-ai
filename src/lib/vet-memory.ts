import type { VetConsultType } from '@/types/veterinary'

interface VetTenantMemory {
  frequentConsults: Record<VetConsultType, number>
  realDurations: { type: VetConsultType; actual: number }[]
  urgencyPatterns: string[]
}

const tenantMemories = new Map<string, VetTenantMemory>()

function getMemory(tenantId: string): VetTenantMemory {
  if (!tenantMemories.has(tenantId)) {
    tenantMemories.set(tenantId, {
      frequentConsults: { revision: 0, vacuna: 0, tratamiento: 0, urgencia: 0, otro: 0 },
      realDurations: [],
      urgencyPatterns: [],
    })
  }
  return tenantMemories.get(tenantId)!
}

export function recordConsult(tenantId: string, type: VetConsultType): void {
  const mem = getMemory(tenantId)
  mem.frequentConsults[type]++
}

export function recordDuration(tenantId: string, type: VetConsultType, actualMinutes: number): void {
  const mem = getMemory(tenantId)
  mem.realDurations.push({ type, actual: actualMinutes })
  if (mem.realDurations.length > 200) {
    mem.realDurations = mem.realDurations.slice(-200)
  }
}

export function recordUrgencyPattern(tenantId: string, keywords: string[]): void {
  const mem = getMemory(tenantId)
  for (const kw of keywords) {
    if (!mem.urgencyPatterns.includes(kw)) {
      mem.urgencyPatterns.push(kw)
    }
  }
}

export function getAverageDuration(tenantId: string, type: VetConsultType): number | null {
  const mem = getMemory(tenantId)
  const relevant = mem.realDurations.filter(d => d.type === type)
  if (relevant.length === 0) return null
  return Math.round(relevant.reduce((sum, d) => sum + d.actual, 0) / relevant.length)
}

export function getTopConsultTypes(tenantId: string): { type: VetConsultType; count: number }[] {
  const mem = getMemory(tenantId)
  return Object.entries(mem.frequentConsults)
    .map(([type, count]) => ({ type: type as VetConsultType, count }))
    .sort((a, b) => b.count - a.count)
}

export function getUrgencyPatterns(tenantId: string): string[] {
  return getMemory(tenantId).urgencyPatterns
}
