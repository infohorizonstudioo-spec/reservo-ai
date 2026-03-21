'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ConsultationEvent } from '@/types/clinic'
import { CONSULT_TYPE_LABELS } from '@/lib/clinic-engine'

const MOCK_TRACES: Omit<ConsultationEvent, 'tenant_id'>[] = [
  {
    id: 'trace-1', call_id: 'call-101',
    patient_name: 'María García', is_new_patient: false,
    reason: 'Dolor en muela del juicio, dice que lleva 3 días',
    consult_type: 'urgencia', is_urgent: true, urgency_keywords: ['dolor fuerte'],
    intent: 'urgencia', state: 'speaking',
    decision: 'escalar_urgencia', decision_reason: 'Urgencia detectada: dolor fuerte. Paciente con dolor persistente 3 días.',
    collected_data: { diente: 'muela del juicio', dolor_dias: 3, medicación: 'ibuprofeno' },
    created_at: new Date(Date.now() - 600000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'trace-2', call_id: 'call-102',
    patient_name: 'Pedro Martínez', is_new_patient: true,
    reason: 'Quiere hacerse una limpieza dental',
    consult_type: 'limpieza', is_urgent: false, urgency_keywords: [],
    intent: 'pedir_cita', state: 'speaking',
    decision: 'confirmar_cita', decision_reason: 'Hueco disponible: mañana 10:00. Tipo: limpieza',
    collected_data: { preferencia_horario: 'mañana', primera_vez: true },
    created_at: new Date(Date.now() - 1800000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'trace-3', call_id: 'call-103',
    patient_name: undefined, is_new_patient: undefined,
    reason: 'Pregunta sobre precio de empaste',
    consult_type: undefined, is_urgent: false,
    intent: 'duda_administrativa', state: 'speaking',
    decision: 'pending_review', decision_reason: 'Datos incompletos: falta nombre, falta tipo consulta',
    collected_data: { pregunta: 'precio empaste', respuesta_dada: 'derivado a recepción' },
    created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date().toISOString(),
  },
]

const DECISION_STYLES: Record<string, string> = {
  escalar_urgencia: 'bg-red-500/10 border-red-500/30 text-red-300',
  confirmar_cita: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  sugerir_alternativa: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  pending_review: 'bg-white/5 border-white/15 text-white/50',
}

const DECISION_ICONS: Record<string, string> = {
  escalar_urgencia: '🚨',
  confirmar_cita: '✅',
  sugerir_alternativa: '📅',
  pending_review: '⏳',
}

export default function ConsultTrace({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<ConsultationEvent[]>([])
  const [useMock, setUseMock] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('consultation_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error || !data || data.length === 0) {
        setUseMock(true)
        setEvents(MOCK_TRACES.map(e => ({ ...e, tenant_id: tenantId })) as ConsultationEvent[])
      } else {
        setEvents(data)
      }
    }
    load()
  }, [tenantId])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Trazabilidad de consultas</h2>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-white/20 text-center py-8">Sin eventos de consulta registrados</p>
      ) : (
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="glass rounded-xl overflow-hidden border border-white/[0.06]">
              <button
                onClick={() => setExpanded(expanded === ev.id ? null : ev.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
              >
                <span className="text-lg">{ev.decision ? DECISION_ICONS[ev.decision] : '📋'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.patient_name || 'Paciente desconocido'}</p>
                  <p className="text-xs text-white/40 truncate">{ev.reason || 'Sin motivo registrado'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-white/25">
                    {new Date(ev.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {ev.consult_type && (
                    <p className="text-[10px] text-white/35">{CONSULT_TYPE_LABELS[ev.consult_type]}</p>
                  )}
                </div>
                <svg className={`w-4 h-4 text-white/20 transition-transform ${expanded === ev.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {expanded === ev.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Qué entendió el agente</p>
                    <div className="bg-white/[0.03] rounded-lg p-3 text-xs space-y-1">
                      <p><span className="text-white/40">Intención:</span> <span className="text-white/70">{ev.intent || '—'}</span></p>
                      <p><span className="text-white/40">Tipo consulta:</span> <span className="text-white/70">{ev.consult_type ? CONSULT_TYPE_LABELS[ev.consult_type] : '—'}</span></p>
                      <p><span className="text-white/40">Urgente:</span> <span className={ev.is_urgent ? 'text-red-300 font-semibold' : 'text-white/70'}>{ev.is_urgent ? 'Sí' : 'No'}</span></p>
                      {ev.urgency_keywords && ev.urgency_keywords.length > 0 && (
                        <p><span className="text-white/40">Palabras clave:</span> <span className="text-red-300/70">{ev.urgency_keywords.join(', ')}</span></p>
                      )}
                      <p><span className="text-white/40">Paciente nuevo:</span> <span className="text-white/70">{ev.is_new_patient ? 'Sí' : ev.is_new_patient === false ? 'No' : '—'}</span></p>
                    </div>
                  </div>

                  {Object.keys(ev.collected_data).length > 0 && (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Datos recogidos</p>
                      <div className="bg-white/[0.03] rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(ev.collected_data).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-xs">
                              <span className="text-white/40">{key}:</span>
                              <span className="text-white/70">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {ev.decision && (
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Decisión tomada</p>
                      <div className={`rounded-lg px-3 py-2.5 border text-sm ${DECISION_STYLES[ev.decision]}`}>
                        <p className="font-medium">{DECISION_ICONS[ev.decision]} {ev.decision.replace(/_/g, ' ')}</p>
                        {ev.decision_reason && <p className="text-xs opacity-70 mt-0.5">{ev.decision_reason}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
