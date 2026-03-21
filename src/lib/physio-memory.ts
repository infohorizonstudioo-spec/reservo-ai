import type { BodyArea } from '@/types/physiotherapy'

interface TenantPhysioMemory {
  frequent_injuries: Record<BodyArea, number>
  real_durations: Record<string, number[]>
  recovery_ratios: Record<BodyArea, { completed: number; total: number }>
}

const memoryStore = new Map<string, TenantPhysioMemory>()

function getOrCreate(tenantId: string): TenantPhysioMemory {
  if (!memoryStore.has(tenantId)) {
    memoryStore.set(tenantId, {
      frequent_injuries: { cervical: 0, lumbar: 0, hombro: 0, rodilla: 0, tobillo: 0, cadera: 0, otro: 0 },
      real_durations: {},
      recovery_ratios: {
        cervical: { completed: 0, total: 0 },
        lumbar: { completed: 0, total: 0 },
        hombro: { completed: 0, total: 0 },
        rodilla: { completed: 0, total: 0 },
        tobillo: { completed: 0, total: 0 },
        cadera: { completed: 0, total: 0 },
        otro: { completed: 0, total: 0 },
      },
    })
  }
  return memoryStore.get(tenantId)!
}

export function recordInjury(tenantId: string, area: BodyArea) {
  const mem = getOrCreate(tenantId)
  mem.frequent_injuries[area]++
}

export function recordDuration(tenantId: string, consultType: string, actualMinutes: number) {
  const mem = getOrCreate(tenantId)
  if (!mem.real_durations[consultType]) mem.real_durations[consultType] = []
  mem.real_durations[consultType].push(actualMinutes)
}

export function recordRecovery(tenantId: string, area: BodyArea, completed: boolean) {
  const mem = getOrCreate(tenantId)
  mem.recovery_ratios[area].total++
  if (completed) mem.recovery_ratios[area].completed++
}

export function getFrequentInjuries(tenantId: string): Record<BodyArea, number> {
  return getOrCreate(tenantId).frequent_injuries
}

export function getAverageDuration(tenantId: string, consultType: string): number | null {
  const durations = getOrCreate(tenantId).real_durations[consultType]
  if (!durations || durations.length === 0) return null
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

export function getRecoveryRatio(tenantId: string, area: BodyArea): number | null {
  const r = getOrCreate(tenantId).recovery_ratios[area]
  if (r.total === 0) return null
  return Math.round((r.completed / r.total) * 100)
}
