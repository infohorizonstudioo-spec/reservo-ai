'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ConsultationEvent, CallState } from '@/types/clinic'
import { CONSULT_TYPE_LABELS } from '@/lib/clinic-engine'

const STATE_LABELS: Record<CallState, { label: string; color: string; animate: boolean }> = {
  incoming:       { label: 'Entrante',       color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   animate: true },
  listening:      { label: 'Escuchando',     color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', animate: true },
  processing:     { label: 'Procesando',     color: 'bg-violet-500/20 text-violet-300 border-violet-500/40', animate: true },
  speaking:       { label: 'Hablando',       color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',      animate: false },
  collecting_data:{ label: 'Recogiendo datos',color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',     animate: true },
}

const MOCK_EVENTS: ConsultationEvent[] = [
  {
    id: 'mock-1', tenant_id: '', call_id: 'call-101',
    patient_name: 'María García', is_new_patient: false,
    reason: 'Dolor en muela del juicio', consult_type: 'urgencia',
    is_urgent: true, urgency_keywords: ['dolor fuerte'],
    intent: 'urgencia', state: 'listening',
    decision: 'escalar_urgencia', decision_reason: 'Urgencia detectada: dolor fuerte',
    collected_data: { tooth: 'muela del juicio', pain_level: 'alto' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

export default function ClinicCallPanel({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<ConsultationEvent[]>([])
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('consultation_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('state', ['incoming', 'listening', 'processing', 'speaking', 'collecting_data'])
        .order('created_at', { ascending: false })
        .limit(5)

      if (error || !data || data.length === 0) {
        setUseMock(true)
        setEvents(MOCK_EVENTS.map(e => ({ ...e, tenant_id: tenantId })))
      } else {
        setEvents(data)
      }
    }
    load()

    const channel = supabase
      .channel(`clinic-calls-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'consultation_events',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as ConsultationEvent, ...prev].slice(0, 5))
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === (payload.new as ConsultationEvent).id ? payload.new as ConsultationEvent : e))
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(e => e.id !== (payload.old as any).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  if (events.length === 0) {
    return (
      <div className="glass rounded-2xl py-12 text-center space-y-2">
        <div className="text-4xl">🏥</div>
        <p className="text-white/30 text-sm">Sin consultas activas</p>
        <p className="text-white/15 text-xs">Las llamadas aparecerán aquí en tiempo real</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Consultas en curso</h2>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>
      {events.map(ev => {
        const stateInfo = STATE_LABELS[ev.state]
        return (
          <div key={ev.id} className="glass rounded-2xl p-5 space-y-3 border border-white/[0.06]">
            {ev.is_urgent && (
              <div className="bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-2.5 text-red-300 text-sm font-semibold animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"/>
                URGENCIA DETECTADA
                {ev.urgency_keywords && <span className="font-normal text-red-400/70 text-xs ml-2">({ev.urgency_keywords.join(', ')})</span>}
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${ev.is_urgent ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                🏥
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg">{ev.patient_name || 'Paciente desconocido'}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${stateInfo.color} ${stateInfo.animate ? 'animate-pulse' : ''}`}>
                    {stateInfo.label}
                  </span>
                  {ev.is_new_patient && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">Nuevo</span>
                  )}
                </div>
                {ev.reason && <p className="text-sm text-white/50 mt-0.5">{ev.reason}</p>}
                {ev.consult_type && (
                  <p className="text-xs text-white/40 mt-1">Tipo: <span className="text-white/60">{CONSULT_TYPE_LABELS[ev.consult_type]}</span></p>
                )}
              </div>
            </div>

            {Object.keys(ev.collected_data).length > 0 && (
              <div className="bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Datos recopilados</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(ev.collected_data).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-white/40">{key}:</span>
                      <span className="text-white/70">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ev.decision && (
              <div className={`rounded-xl px-3 py-2 text-sm border ${
                ev.decision === 'escalar_urgencia' ? 'bg-red-500/10 border-red-500/25 text-red-300' :
                ev.decision === 'confirmar_cita' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
                ev.decision === 'sugerir_alternativa' ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' :
                'bg-white/5 border-white/10 text-white/50'
              }`}>
                <span className="font-medium">
                  {ev.decision === 'escalar_urgencia' && '🚨 Escalar urgencia'}
                  {ev.decision === 'confirmar_cita' && '✅ Cita confirmada'}
                  {ev.decision === 'sugerir_alternativa' && '📅 Sugerir alternativa'}
                  {ev.decision === 'pending_review' && '⏳ Pendiente de revisión'}
                </span>
                {ev.decision_reason && <p className="text-xs opacity-70 mt-0.5">{ev.decision_reason}</p>}
              </div>
            )}

            {ev.state === 'processing' && !ev.decision && (
              <div className="bg-violet-500/10 border border-violet-500/25 rounded-xl px-3 py-2 text-sm text-violet-300 animate-pulse">
                Verificando disponibilidad...
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
