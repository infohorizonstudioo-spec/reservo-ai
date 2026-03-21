'use client'
import { useEffect, useState } from 'react'
import { supabase, getDemoTenant } from '@/lib/supabase'
import { Order, Tenant } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import EcomOrdersPanel from '@/components/ecommerce/EcomOrdersPanel'

type OrderStatus = Order['status']
const COLS: { key: OrderStatus; label: string; next?: OrderStatus; color: string }[] = [
  { key: 'nuevo',      label: 'Nuevo',      next: 'preparando', color: 'border-violet-500/20' },
  { key: 'preparando', label: 'Preparando', next: 'listo',      color: 'border-orange-500/20' },
  { key: 'listo',      label: 'Listo',      next: 'entregado',  color: 'border-emerald-500/20' },
  { key: 'entregado',  label: 'Entregado',                      color: 'border-white/10' },
]

function timeColor(createdAt: string) {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000
  if (mins < 10) return 'text-emerald-400'
  if (mins < 20) return 'text-amber-400'
  return 'text-red-400'
}
function timeBg(createdAt: string) {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000
  if (mins < 10) return 'bg-emerald-500/10'
  if (mins < 20) return 'bg-amber-500/10'
  return 'bg-red-500/10'
}
function timeLabel(createdAt: string) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function PedidosPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function load(tid: string) {
    const { data } = await supabase.from('orders').select('*')
      .eq('tenant_id', tid)
      .not('status', 'in', '("entregado","cancelado")')
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    getDemoTenant().then(t => {
      if (!t) return setLoading(false)
      setTenant(t)
      if (t.type === 'ecommerce') return setLoading(false)
      load(t.id)
      const ch = supabase.channel('pedidos-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load(t.id))
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (tenant?.type === 'ecommerce') {
    return <EcomOrdersPanel tenantId={tenant.id} />
  }

  async function advance(id: string, next: OrderStatus) {
    if (!tenant) return
    await supabase.from('orders').update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', id).eq('tenant_id', tenant.id)
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold">Pedidos</h1>
        <p className="text-white/40 text-xs mt-0.5">{orders.length} pedido{orders.length !== 1 ? 's' : ''} activos</p>
      </div>

      {loading ? <LoadingSkeleton type="card" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {COLS.map(col => {
            const colOrders = orders.filter(o => o.status === col.key)
            return (
              <div key={col.key} className={`glass rounded-2xl border ${col.color} overflow-hidden`}>
                <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                  <span className="text-xs font-semibold">{col.label}</span>
                  <span className="text-[11px] text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full">
                    {colOrders.length}
                  </span>
                </div>
                <div className="p-2 space-y-2 min-h-[120px]">
                  {colOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-[11px] text-white/20">Sin pedidos</p>
                    </div>
                  ) : colOrders.map(o => (
                    <div key={o.id} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium leading-tight">
                          {o.customer_name || `Mesa ${o.table_id?.slice(-4) || '?'}`}
                        </p>
                        <span className={`text-[11px] font-mono shrink-0 px-1.5 py-0.5 rounded-md ${timeColor(o.created_at)} ${timeBg(o.created_at)}`}>
                          {timeLabel(o.created_at)}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {o.items?.slice(0, 3).map((item, i) => (
                          <p key={i} className="text-[11px] text-white/40">
                            {item.name} ×{item.qty}
                          </p>
                        ))}
                        {(o.items?.length || 0) > 3 && (
                          <p className="text-[11px] text-white/25">+{o.items.length - 3} más</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/70">{o.total?.toFixed(2)}€</span>
                        {col.next && (
                          <button onClick={() => advance(o.id, col.next!)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.07]
                              hover:bg-white/[0.12] text-white/60 transition-colors">
                            Avanzar →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <EmptyState icon="🍳" title="Cocina tranquila por ahora"
          description="Aquí aparecerán los pedidos activos en tiempo real." />
      )}
    </div>
  )
}
