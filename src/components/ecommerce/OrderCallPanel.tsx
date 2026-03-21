'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { OrderEvent, EcomCallState } from '@/types/ecommerce'
import { INTENT_LABELS } from '@/lib/ecommerce-engine'

const STATE_LABELS: Record<EcomCallState, { label: string; color: string; animate: boolean }> = {
  incoming:        { label: 'Entrante',        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',    animate: true },
  listening:       { label: 'Escuchando',      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', animate: true },
  processing:      { label: 'Procesando',      color: 'bg-violet-500/20 text-violet-300 border-violet-500/40', animate: true },
  speaking:        { label: 'Hablando',        color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',       animate: false },
  collecting_data: { label: 'Recogiendo datos', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',      animate: true },
}

const MOCK_EVENTS: OrderEvent[] = [
  {
    id: 'mock-ecom-1', tenant_id: '', call_id: 'call-ecom-101',
    client_name: 'Laura Martinez', client_phone: '+34 655 123 456',
    product_interest: 'Zapatillas Running Pro', quantity: 2,
    shipping_address: 'C/ Gran Via 45, Madrid',
    intent: 'compra_directa', state: 'listening',
    decision: 'confirmar_pedido',
    collected_data: { talla: '42', color: 'negro', envio_express: 'sí' },
    created_at: new Date().toISOString(),
  },
]

export default function OrderCallPanel({ tenantId }: { tenantId: string }) {
  const [events, setEvents] = useState<OrderEvent[]>([])
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('order_events')
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
      .channel(`ecom-calls-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'order_events',
        filter: `tenant_id=eq.${tenantId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as OrderEvent, ...prev].slice(0, 5))
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === (payload.new as OrderEvent).id ? payload.new as OrderEvent : e))
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
        <div className="text-4xl">🛒</div>
        <p className="text-white/30 text-sm">Sin llamadas activas</p>
        <p className="text-white/15 text-xs">Los pedidos se capturan automáticamente de cada llamada</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Ventas en curso</h2>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>
      {events.map(ev => {
        const stateInfo = STATE_LABELS[ev.state]
        const hasStock = ev.decision !== 'sugerir_alternativa'
        return (
          <div key={ev.id} className="glass rounded-2xl p-5 space-y-3 border border-white/[0.06]">
            {/* Header: estado + cliente */}
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg">
                🛒
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
                {ev.product_interest && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Producto:</span>
                    <span className="text-white/70">{ev.product_interest}</span>
                  </div>
                )}
                {ev.quantity != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Cantidad:</span>
                    <span className="text-white/70">{ev.quantity}</span>
                  </div>
                )}
                {ev.shipping_address && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Dirección:</span>
                    <span className="text-white/70">{ev.shipping_address}</span>
                  </div>
                )}
                {ev.order_ref && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">Ref pedido:</span>
                    <span className="text-white/70">{ev.order_ref}</span>
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

            {/* Stock badge */}
            {ev.product_interest && (
              <div className="flex items-center gap-2">
                {hasStock ? (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-medium">
                    EN STOCK
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 font-medium">
                    SIN STOCK
                  </span>
                )}
              </div>
            )}

            {/* Pedido estructurado */}
            {ev.decision && ev.decision !== 'pending' && (
              <div className="bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.08]">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Pedido estructurado</p>
                <p className="text-sm text-white/80">
                  Producto: <span className="text-white font-medium">{ev.product_interest || '—'}</span>
                  {' | '}Cantidad: <span className="text-violet-300">{ev.quantity || '—'}</span>
                  {' | '}Dirección: <span className="text-cyan-300">{ev.shipping_address || '—'}</span>
                </p>
              </div>
            )}

            {/* Decisión */}
            {ev.decision && (
              <div className={`rounded-xl px-3 py-2 text-sm border flex items-center justify-between ${
                ev.decision === 'confirmar_pedido' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
                ev.decision === 'sugerir_alternativa' ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' :
                ev.decision === 'escalar_problema' ? 'bg-red-500/10 border-red-500/25 text-red-300' :
                'bg-white/5 border-white/10 text-white/50'
              }`}>
                <span className="font-medium">
                  {ev.decision === 'confirmar_pedido' && '✓ Pedido listo para confirmar'}
                  {ev.decision === 'sugerir_alternativa' && '↔ Sugerir producto alternativo'}
                  {ev.decision === 'escalar_problema' && '⬆ Escalar a soporte'}
                  {ev.decision === 'pending' && '⏳ Recopilando datos...'}
                </span>
                <div className="flex gap-2">
                  {ev.decision === 'confirmar_pedido' && (
                    <button className="text-xs bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1 rounded-lg transition-colors text-emerald-300">
                      Confirmar pedido
                    </button>
                  )}
                  {ev.decision === 'sugerir_alternativa' && (
                    <button className="text-xs bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded-lg transition-colors text-amber-300">
                      Sugerir alternativa
                    </button>
                  )}
                </div>
              </div>
            )}

            {ev.state === 'processing' && !ev.decision && (
              <div className="bg-violet-500/10 border border-violet-500/25 rounded-xl px-3 py-2 text-sm text-violet-300 animate-pulse">
                Analizando solicitud del cliente...
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
