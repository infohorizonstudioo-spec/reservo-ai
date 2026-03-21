'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PsychConsultationEvent } from '@/types/psychology'
import { detectEmotionalUrgency, SESSION_TYPE_LABELS, CRISIS_MESSAGE, CRISIS_HELP_TEXT } from '@/lib/psych-engine'

const STATE_LABELS: Record<string, string> = {
  incoming: 'Recibiendo llamada',
  listening: 'Escuchando',
  processing: 'Procesando',
  speaking: 'Hablando',
  collecting_data: 'Recogiendo datos',
}

const MOCK_EVENTS: PsychConsultationEvent[] = [
  {
    id: 'p1', tenant_id: '', call_id: 'c1',
    patient_name: 'Laura M.', is_new_patient: true,
    session_type: 'primera_sesion', modality: 'presencial',
    emotional_urgency: 'medium', state: 'listening',
    decision: 'pending_review',
    general_topic: 'ansiedad',
    collected_data: {}, created_at: new Date().toISOString(),
  },
  {
    id: 'p2', tenant_id: '', call_id: 'c2',
    patient_name: 'Roberto G.', is_new_patient: false,
    session_type: 'seguimiento', modality: 'online',
    emotional_urgency: 'none', state: 'speaking',
    decision: 'confirmar_cita',
    collected_data: {}, created_at: new Date().toISOString(),
  },
]

export default function PsychCallPanel({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<PsychConsultationEvent[]>([])
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('psych_consultation_events')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('state', ['incoming', 'listening', 'processing', 'speaking', 'collecting_data'])
        .order('created_at', { ascending: false })
        .limit(10)

      if (error || !data || data.length === 0) {
        setUsingMock(true)
        setEvents(MOCK_EVENTS.map(e => ({ ...e, tenant_id: tenantId })))
        return
      }
      setEvents(data)
    }
    load()
  }, [tenantId])

  if (events.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">
        Consultas en curso
        {usingMock && <span className="ml-2 text-amber-400/50 normal-case tracking-normal">(demo)</span>}
      </h2>
      {events.map(ev => (
        <div key={ev.id} className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-4">
            {/* State indicator — neutral, subtle animation */}
            <div className="w-11 h-11 rounded-xl bg-slate-500/15 flex items-center justify-center">
              <div className={`w-2.5 h-2.5 rounded-full ${
                ev.state === 'listening' ? 'bg-slate-400 animate-pulse' :
                ev.state === 'speaking' ? 'bg-blue-400 animate-pulse' :
                'bg-slate-500'
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-white/90">{ev.patient_name || 'Paciente'}</p>
                {ev.is_new_patient && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20">
                    Nuevo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>{STATE_LABELS[ev.state] || ev.state}</span>
                {ev.session_type && (
                  <>
                    <span className="text-white/15">·</span>
                    <span>{SESSION_TYPE_LABELS[ev.session_type]}</span>
                  </>
                )}
                {ev.modality && (
                  <>
                    <span className="text-white/15">·</span>
                    <span className={ev.modality === 'online' ? 'text-blue-400/60' : ''}>
                      {ev.modality === 'online' ? 'Online' : 'Presencial'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {ev.decision && (
              <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
                ev.decision === 'confirmar_cita' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                ev.decision === 'escalar_urgencia' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-white/5 text-white/30 border-white/10'
              }`}>
                {ev.decision === 'confirmar_cita' ? 'Cita confirmada' :
                 ev.decision === 'sugerir_alternativa' ? 'Alternativa sugerida' :
                 ev.decision === 'pending_review' ? 'Pendiente revisión' :
                 'Escalada'}
              </span>
            )}
          </div>

          {/* Urgency banners — soft, never aggressive */}
          {ev.emotional_urgency === 'crisis' && (
            <div className="rounded-xl px-4 py-3 bg-slate-500/10 border border-slate-400/20 text-sm">
              <p className="font-medium text-slate-300">{CRISIS_MESSAGE}</p>
              <p className="text-xs text-slate-400 mt-1">{CRISIS_HELP_TEXT}</p>
            </div>
          )}
          {ev.emotional_urgency === 'high' && (
            <div className="rounded-xl px-4 py-2.5 bg-slate-400/8 border border-slate-400/15 text-xs text-slate-400">
              Requiere atención prioritaria
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
