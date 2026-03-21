'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { VetConsultationEvent, VetCallState } from '@/types/veterinary'
import { SPECIES_EMOJI, CONSULT_TYPE_LABELS } from '@/lib/vet-engine'

const STATE_LABELS: Record<VetCallState, { label: string; color: string; animate: boolean }> = {
  incoming:        { label: 'Entrante',        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',    animate: true },
  listening:       { label: 'Escuchando',      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', animate: true },
  processing:      { label: 'Procesando',      color: 'bg-violet-500/20 text-violet-300 border-violet-500/40', animate: true },
  speaking:        { label: 'Hablando',        color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',       animate: false },
  collecting_data: { label: 'Recogiendo datos', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',      animate: true },
}

const MOCK_EVENTS: VetConsultationEvent[] = [
  {
    id: 'mock-vet-1', tenant_id: '', call_id: 'call-vet-101',
    owner_name: 'Carlos Lopez', pet_name: 'Rocky', pet_species: 'perro',
    reason: 'Cojera pata trasera desde ayer',
    consult_type: 'revision', is_urgent: false, urgency_keywords: [],
    state: 'collecting_data', decision: 'confirmar_cita',
    collected_data: { raza: 'Labrador', edad: '5 años', peso: '32kg' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-vet-2', tenant_id: '', call_id: 'call-vet-102',
    owner_name: 'Maria Fernandez', pet_name: 'Luna', pet_species: 'gato',
    reason: 'Vomitos y no come desde hace 2 días',
    consult_type: 'urgencia', is_urgent: true, urgency_keywords: ['estado grave', 'no come'],
    state: 'listening', decision: 'escalar_urgencia',
    collected_data: { raza: 'Siamés', edad: '3 años' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
]

export default function VetCallPanel({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<VetConsultationEvent[]>([])
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('vet_consultation_events')
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
      .channel(`vet-calls-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'vet_consultation_events',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as VetConsultationEvent, ...prev].slice(0, 5))
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === (payload.new as VetConsultationEvent).id ? payload.new as VetConsultationEvent : e))
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
        <div className="text-4xl">🐾</div>
        <p className="text-white/30 text-sm">Sin llamadas veterinarias activas</p>
        <p className="text-white/15 text-xs">La IA atenderá y triará automáticamente las llamadas</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Recepción veterinaria en curso</h2>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>
      {events.map(ev => {
        const stateInfo = STATE_LABELS[ev.state]
        const speciesEmoji = ev.pet_species ? SPECIES_EMOJI[ev.pet_species] : '🐾'

        return (
          <div key={ev.id} className="glass rounded-2xl p-5 space-y-3 border border-white/[0.06]">
            {/* Urgency banner */}
            {ev.is_urgent && (
              <div className="rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-300 animate-pulse flex items-center gap-2">
                <span className="text-lg">🚨</span> URGENCIA VETERINARIA
                {ev.urgency_keywords && ev.urgency_keywords.length > 0 && (
                  <span className="text-xs font-normal text-red-300/60 ml-2">
                    ({ev.urgency_keywords.join(', ')})
                  </span>
                )}
              </div>
            )}

            {/* Header: state + pet as protagonist */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center text-3xl">
                {speciesEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-xl">{ev.pet_name || 'Mascota desconocida'}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${stateInfo.color} ${stateInfo.animate ? 'animate-pulse' : ''}`}>
                    {stateInfo.label}
                  </span>
                </div>
                {ev.owner_name && <p className="text-sm text-white/40 mt-0.5">Dueño: {ev.owner_name}</p>}
                {ev.consult_type && (
                  <p className="text-xs text-white/40 mt-1">
                    Tipo: <span className="text-teal-300">{CONSULT_TYPE_LABELS[ev.consult_type]}</span>
                  </p>
                )}
                {ev.reason && <p className="text-xs text-white/30 mt-0.5">{ev.reason}</p>}
              </div>
            </div>

            {/* Collected data in real-time */}
            {Object.keys(ev.collected_data).length > 0 && (
              <div className="bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Datos recopilados</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {ev.pet_name && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Mascota:</span>
                      <span className="text-white/70 font-medium">{speciesEmoji} {ev.pet_name}</span>
                    </div>
                  )}
                  {ev.owner_name && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Dueño:</span>
                      <span className="text-white/70">{ev.owner_name}</span>
                    </div>
                  )}
                  {ev.pet_species && (
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Especie:</span>
                      <span className="text-white/70">{ev.pet_species}</span>
                    </div>
                  )}
                  {Object.entries(ev.collected_data).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-white/40">{key}:</span>
                      <span className="text-white/70">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decision */}
            {ev.decision && (
              <div className={`rounded-xl px-3 py-2 text-sm border flex items-center justify-between ${
                ev.decision === 'confirmar_cita' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
                ev.decision === 'sugerir_alternativa' ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' :
                ev.decision === 'escalar_urgencia' ? 'bg-red-500/10 border-red-500/25 text-red-300' :
                'bg-white/5 border-white/10 text-white/50'
              }`}>
                <span className="font-medium">
                  {ev.decision === 'confirmar_cita' && '✅ Cita lista para confirmar'}
                  {ev.decision === 'sugerir_alternativa' && '🔄 Sugerir horario alternativo'}
                  {ev.decision === 'escalar_urgencia' && '🚨 Escalar — urgencia veterinaria'}
                  {ev.decision === 'pending_review' && '⏳ Recopilando datos...'}
                </span>
                <div className="flex gap-2">
                  {ev.decision === 'confirmar_cita' && (
                    <button className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-lg transition-colors text-emerald-300">
                      Confirmar cita
                    </button>
                  )}
                  {ev.decision === 'escalar_urgencia' && (
                    <button className="text-xs bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg transition-colors text-red-300">
                      Atender urgencia
                    </button>
                  )}
                </div>
              </div>
            )}

            {ev.state === 'processing' && !ev.decision && (
              <div className="bg-teal-500/10 border border-teal-500/25 rounded-xl px-3 py-2 text-sm text-teal-300 animate-pulse">
                Analizando consulta veterinaria...
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
