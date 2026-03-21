'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { LeadEvent, LeadCallState } from '@/types/realestate'
import { INTENT_LABELS, OPERATION_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/realestate-engine'

const STATE_LABELS: Record<LeadCallState, { label: string; color: string; animate: boolean }> = {
  incoming:        { label: 'Entrante',        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',    animate: true },
  listening:       { label: 'Escuchando',      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', animate: true },
  processing:      { label: 'Procesando',      color: 'bg-violet-500/20 text-violet-300 border-violet-500/40', animate: true },
  speaking:        { label: 'Hablando',        color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',       animate: false },
  collecting_data: { label: 'Recogiendo datos', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',      animate: true },
}

const MOCK_EVENTS: LeadEvent[] = [
  {
    id: 'mock-re-1', tenant_id: '', call_id: 'call-re-101',
    client_name: 'Carlos Ruiz', client_phone: '+34 612 345 678',
    operation: 'compra', property_type: 'piso',
    zone: 'Salamanca', budget: 350000,
    intent: 'busqueda_vivienda', state: 'listening',
    decision: 'crear_lead',
    collected_data: { habitaciones: '3', ascensor: 'sí', planta: 'alta' },
    created_at: new Date().toISOString(),
  },
]

export default function LeadCallPanel({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<LeadEvent[]>([])
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('lead_events')
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
      .channel(`realestate-calls-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'lead_events',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as LeadEvent, ...prev].slice(0, 5))
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === (payload.new as LeadEvent).id ? payload.new as LeadEvent : e))
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
        <div className="text-4xl">🏠</div>
        <p className="text-white/30 text-sm">Sin llamadas activas</p>
        <p className="text-white/15 text-xs">Los leads se capturan automáticamente de cada llamada</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Captación en curso</h2>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>
      {events.map(ev => {
        const stateInfo = STATE_LABELS[ev.state]
        return (
          <div key={ev.id} className="glass rounded-2xl p-5 space-y-3 border border-white/[0.06]">
            {/* Header: estado + cliente */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">
                🏠
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-lg">{ev.client_name || 'Cliente desconocido'}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${stateInfo.color} ${stateInfo.animate ? 'animate-pulse' : ''}`}>
                    {stateInfo.label}
                  </span>
                </div>
                {ev.client_phone && <p className="text-sm text-white/40 mt-0.5">{ev.client_phone}</p>}
                {ev.intent && (
                  <p className="text-xs text-white/40 mt-1">Intención: <span className="text-white/60">{INTENT_LABELS[ev.intent]}</span></p>
                )}
              </div>
            </div>

            {/* Datos capturados en tiempo real */}
            <div className="bg-white/[0.03] rounded-xl p-3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Datos capturados</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {ev.client_name && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Cliente:</span>
                    <span className="text-white/70">{ev.client_name}</span>
                  </div>
                )}
                {ev.operation && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Operación:</span>
                    <span className="text-white/70">{OPERATION_LABELS[ev.operation]}</span>
                  </div>
                )}
                {ev.property_type && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Tipo:</span>
                    <span className="text-white/70">{PROPERTY_TYPE_LABELS[ev.property_type]}</span>
                  </div>
                )}
                {ev.zone && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Zona:</span>
                    <span className="text-white/70">{ev.zone}</span>
                  </div>
                )}
                {ev.budget != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Presupuesto:</span>
                    <span className="text-white/70">{ev.budget.toLocaleString('es-ES')} €</span>
                  </div>
                )}
                {ev.property_ref && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Ref:</span>
                    <span className="text-white/70">{ev.property_ref}</span>
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

            {/* Lead estructurado final */}
            {ev.decision && ev.decision !== 'pending' && (
              <div className="bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.08]">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Lead estructurado</p>
                <p className="text-sm text-white/80">
                  Cliente: <span className="text-white font-medium">{ev.client_name || '—'}</span>
                  {' | '}Interés: <span className="text-violet-300">{ev.operation ? OPERATION_LABELS[ev.operation] : '—'}</span>
                  {' | '}Tipo: <span className="text-cyan-300">{ev.property_type ? PROPERTY_TYPE_LABELS[ev.property_type] : '—'}</span>
                  {' | '}Zona: <span className="text-amber-300">{ev.zone || '—'}</span>
                  {' | '}Presupuesto: <span className="text-emerald-300">{ev.budget ? `${ev.budget.toLocaleString('es-ES')} €` : '—'}</span>
                </p>
              </div>
            )}

            {/* Decisión */}
            {ev.decision && (
              <div className={`rounded-xl px-3 py-2 text-sm border flex items-center justify-between ${
                ev.decision === 'crear_visita' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
                ev.decision === 'crear_lead' ? 'bg-blue-500/10 border-blue-500/25 text-blue-300' :
                ev.decision === 'escalar' ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' :
                'bg-white/5 border-white/10 text-white/50'
              }`}>
                <span className="font-medium">
                  {ev.decision === 'crear_lead' && '📋 Lead listo para guardar'}
                  {ev.decision === 'crear_visita' && '📅 Visita lista para agendar'}
                  {ev.decision === 'escalar' && '⬆️ Escalar a agente'}
                  {ev.decision === 'pending' && '⏳ Recopilando datos...'}
                </span>
                <div className="flex gap-2">
                  {(ev.decision === 'crear_lead' || ev.decision === 'crear_visita') && (
                    <button className="text-xs bg-white/10 hover:bg-white/15 px-3 py-1 rounded-lg transition-colors">
                      Guardar lead
                    </button>
                  )}
                  {ev.decision === 'crear_visita' && (
                    <button className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-lg transition-colors text-emerald-300">
                      Agendar visita
                    </button>
                  )}
                </div>
              </div>
            )}

            {ev.state === 'processing' && !ev.decision && (
              <div className="bg-violet-500/10 border border-violet-500/25 rounded-xl px-3 py-2 text-sm text-violet-300 animate-pulse">
                Analizando datos del cliente...
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
