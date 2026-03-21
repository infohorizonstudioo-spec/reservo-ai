import { supabase } from '@/lib/supabase'
import type { ClinicMemory, ConsultType, ConsultationEvent } from '@/types/clinic'

const DEFAULT_MEMORY: Omit<ClinicMemory, 'tenant_id'> = {
  frequent_consult_types: { revision: 0, limpieza: 0, tratamiento: 0, urgencia: 0, otro: 0 },
  avg_durations: { revision: 20, limpieza: 30, tratamiento: 60, urgencia: 30, otro: 20 },
  recurring_patients: [],
  urgency_patterns: [],
  last_updated: new Date().toISOString(),
}

export async function getClinicMemory(tenantId: string): Promise<ClinicMemory> {
  const { data } = await supabase
    .from('clinic_memory')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (data) return data as ClinicMemory

  return { tenant_id: tenantId, ...DEFAULT_MEMORY }
}

export async function updateClinicMemory(
  tenantId: string,
  event: ConsultationEvent
): Promise<void> {
  const memory = await getClinicMemory(tenantId)

  if (event.consult_type) {
    memory.frequent_consult_types[event.consult_type] =
      (memory.frequent_consult_types[event.consult_type] || 0) + 1
  }

  if (event.patient_name && !memory.recurring_patients.includes(event.patient_name)) {
    memory.recurring_patients.push(event.patient_name)
    if (memory.recurring_patients.length > 100) {
      memory.recurring_patients = memory.recurring_patients.slice(-100)
    }
  }

  if (event.is_urgent && event.urgency_keywords) {
    for (const kw of event.urgency_keywords) {
      if (!memory.urgency_patterns.includes(kw)) {
        memory.urgency_patterns.push(kw)
      }
    }
  }

  memory.last_updated = new Date().toISOString()

  await supabase
    .from('clinic_memory')
    .upsert({ ...memory, tenant_id: tenantId })
}

export async function getClinicInsights(tenantId: string) {
  const memory = await getClinicMemory(tenantId)

  const sortedTypes = Object.entries(memory.frequent_consult_types)
    .sort(([, a], [, b]) => b - a)
    .filter(([, count]) => count > 0)

  const totalConsults = sortedTypes.reduce((sum, [, count]) => sum + count, 0)

  return {
    totalConsults,
    mostCommonType: sortedTypes[0]?.[0] as ConsultType | undefined,
    typeDistribution: sortedTypes,
    totalPatients: memory.recurring_patients.length,
    urgencyKeywords: memory.urgency_patterns,
    avgDurations: memory.avg_durations,
  }
}
