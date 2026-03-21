'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PhysioConsultationEvent, PhysioCallState, BodyArea } from '@/types/physiotherapy'
import { detectBodyArea, classifyPhysioConsult, isRecentInjury, BODY_AREA_LABELS, BODY_AREA_COLORS, CONSULT_TYPE_LABELS } from '@/lib/physio-engine'

const STATE_LABELS: Record<PhysioCallState, { label: string; color: string }> = {
  incoming: { label: 'Entrante', color: 'text-amber-400' },
  listening: { label: 'Escuchando', color: 'text-blue-400' },
  processing: { label: 'Procesando', color: 'text-violet-400' },
  speaking: { label: 'Hablando', color: 'text-emerald-400' },
  collecting_data: { label: 'Recopilando datos', color: 'text-cyan-400' },
}

const MOCK_EVENTS: PhysioConsultationEvent[] = [
  {
    id: 'pc1', tenant_id: '', call_id: 'call-1',
    patient_name: 'Roberto Méndez', is_new_patient: false,
    problem_description: 'Me duele mucho la rodilla desde ayer jugando al fútbol',
    body_area: 'rodilla', consult_type: 'tratamiento',
    is_recent_injury: true, state: 'listening',
    collected_data: { session_number: 1 }, created_at: new Date().toISOString(),
  },
  {
    id: 'pc2', tenant_id: '', call_id: 'call-2',
    patient_name: 'Elena Vázquez', is_new_patient: true,
    problem_description: 'Tengo dolor cervical desde hace una semana, no puedo girar el cuello',
    body_area: 'cervical', consult_type: 'primera_visita',
    is_recent_injury: true, state: 'processing',
    collected_data: {}, created_at: new Date().toISOString(),
  },
]

export default function PhysioCallPanel({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<PhysioConsultationEvent[]>([])
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('physio_consultations')
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

    const channel = supabase
      .channel(`physio-calls-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'physio_consultations',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => { load() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  if (events.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
        Consultas fisio en curso
        {usingMock && <span className="ml-2 text-amber-400/60 normal-case">(demo)</span>}
      </h2>
      {events.map(ev => {
        const stateInfo = STATE_LABELS[ev.state]
        const bodyArea = ev.body_area || (ev.problem_description ? detectBodyArea(ev.problem_description) : 'otro')
        const consultType = ev.consult_type || (ev.problem_description ? classifyPhysioConsult(ev.problem_description, !!ev.is_new_patient) : 'tratamiento')
        const recentInjury = ev.is_recent_injury ?? (ev.problem_description ? isRecentInjury(ev.problem_description) : false)
        const sessionNumber = ev.collected_data?.session_number

        return (
          <div key={ev.id} className="glass rounded-2xl border border-violet-500/25 bg-violet-500/5 p-5">
            <div className="flex items-start gap-4">
              {/* Animated state indicator */}
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center relative">
                <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse" />
                <div className="absolute inset-0 rounded-xl border border-violet-400/30 animate-ping opacity-25" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold text-lg truncate">
                    {ev.patient_name || 'Paciente desconocido'}
                  </p>
                  <span className={`text-xs font-medium ${stateInfo.color}`}>
                    {stateInfo.label}
                  </span>
                  {ev.is_new_patient && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                      NUEVO
                    </span>
                  )}
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Body area badge */}
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[11px] font-medium border ${BODY_AREA_COLORS[bodyArea]}`}>
                    {BODY_AREA_LABELS[bodyArea]}
                  </span>

                  {/* Consult type */}
                  <span className="text-xs text-white/40">
                    {CONSULT_TYPE_LABELS[consultType]}
                  </span>

                  {/* Recent injury badge */}
                  {recentInjury && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold">
                      LESION RECIENTE
                    </span>
                  )}

                  {/* Session number for recurring */}
                  {sessionNumber && sessionNumber > 1 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                      Sesion {sessionNumber}
                    </span>
                  )}
                </div>

                {/* Problem description */}
                {ev.problem_description && (
                  <p className="text-sm text-white/50 truncate">{ev.problem_description}</p>
                )}

                {/* Decision */}
                {ev.decision && (
                  <div className={`mt-2 inline-flex px-3 py-1.5 rounded-xl text-xs font-medium border ${
                    ev.decision === 'confirmar_cita'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : ev.decision === 'sugerir_alternativa'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                        : 'bg-white/5 text-white/40 border-white/10'
                  }`}>
                    {ev.decision === 'confirmar_cita' && 'Cita confirmada'}
                    {ev.decision === 'sugerir_alternativa' && 'Sugiriendo alternativa'}
                    {ev.decision === 'pending_review' && 'Pendiente de revisión'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
