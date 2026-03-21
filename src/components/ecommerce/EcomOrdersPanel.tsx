'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EcomOrder, OrderStatus } from '@/types/ecommerce'
import { ORDER_STATUS_LABELS } from '@/lib/ecommerce-engine'

type FilterMode = 'activos' | 'todos' | OrderStatus

const STATUS_FLOW: { key: OrderStatus; next?: OrderStatus; color: string; bg: string }[] = [
  { key: 'nuevo',      next: 'confirmado',  color: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/25' },
  { key: 'confirmado', next: 'preparando',  color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/25' },
  { key: 'preparando', next: 'enviado',     color: 'text-orange-400',  bg: 'bg-orange-500/15 border-orange-500/25' },
  { key: 'enviado',    next: 'entregado',   color: 'text-cyan-400',    bg: 'bg-cyan-500/15 border-cyan-500/25' },
  { key: 'entregado',                       color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  { key: 'cancelado',                       color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/25' },
  { key: 'devolucion',                      color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/25' },
]

const MOCK_ORDERS: EcomOrder[] = [
  {
    id: 'mock-o-1', tenant_id: '',
    client_name: 'Laura Martinez', client_phone: '+34 655 123 456', client_email: 'laura@email.com',
    items: [
      { product_name: 'Zapatillas Running Pro', sku: 'ZRP-42', qty: 2, price: 89.99 },
      { product_name: 'Calcetines Técnicos', sku: 'CT-M', qty: 3, price: 12.50 },
    ],
    shipping_address: 'C/ Gran Via 45, Madrid', total: 217.48,
    status: 'preparando', source: 'llamada', created_at: new Date(Date.now() - 35 * 60000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-o-2', tenant_id: '',
    client_name: 'Pedro Sanchez', client_phone: '+34 611 222 333',
    items: [{ product_name: 'Mochila Urbana', sku: 'MU-01', qty: 1, price: 59.90 }],
    shipping_address: 'Av. Diagonal 200, Barcelona', total: 59.90,
    status: 'nuevo', source: 'web', created_at: new Date(Date.now() - 8 * 60000).toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-o-3', tenant_id: '',
    client_name: 'Ana López', client_email: 'ana.lopez@gmail.com',
    items: [
      { product_name: 'Camiseta Dry-Fit', qty: 2, price: 34.99 },
      { product_name: 'Pantalón Corto Sport', qty: 1, price: 29.99 },
    ],
    total: 99.97, status: 'enviado', source: 'llamada',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(), updated_at: new Date().toISOString(),
  },
]

function timeLabel(createdAt: string) {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ${mins % 60}m`
  return `${Math.floor(mins / 1440)}d`
}

function timeColor(createdAt: string) {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000
  if (mins < 30) return 'text-emerald-400 bg-emerald-500/10'
  if (mins < 120) return 'text-amber-400 bg-amber-500/10'
  return 'text-red-400 bg-red-500/10'
}

export default function EcomOrdersPanel({ tenantId }: { tenantId: string }) {
  const [orders, setOrders] = useState<EcomOrder[]>([])
  const [filter, setFilter] = useState<FilterMode>('activos')
  const [useMock, setUseMock] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('ecom_orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error || !data || data.length === 0) {
        setUseMock(true)
        setOrders(MOCK_ORDERS.map(o => ({ ...o, tenant_id: tenantId })))
      } else {
        setOrders(data)
      }
    }
    load()

    const channel = supabase
      .channel(`ecom-orders-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'ecom_orders',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => { load() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  async function advanceStatus(orderId: string, nextStatus: OrderStatus) {
    if (useMock) {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: nextStatus, updated_at: new Date().toISOString() } : o
      ))
      return
    }
    await supabase.from('ecom_orders')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId).eq('tenant_id', tenantId)
  }

  const ACTIVE_STATUSES: OrderStatus[] = ['nuevo', 'confirmado', 'preparando', 'enviado']

  const filtered = orders.filter(o => {
    if (filter === 'activos') return ACTIVE_STATUSES.includes(o.status)
    if (filter === 'todos') return true
    return o.status === filter
  })

  const filters: { key: FilterMode; label: string }[] = [
    { key: 'activos', label: 'Activos' },
    { key: 'todos', label: 'Todos' },
    { key: 'nuevo', label: 'Nuevos' },
    { key: 'preparando', label: 'Preparando' },
    { key: 'enviado', label: 'Enviados' },
    { key: 'entregado', label: 'Entregados' },
  ]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos eCommerce</h1>
          <p className="text-white/40 text-sm">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {useMock && <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded">demo</span>}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f.key
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                : 'bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
          Sin pedidos en esta vista
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const statusInfo = STATUS_FLOW.find(s => s.key === order.status)
            const nextStatus = statusInfo?.next
            return (
              <div key={order.id} className="glass rounded-2xl p-4 space-y-3 border border-white/[0.06]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-sm font-bold text-violet-300">
                      {order.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.client_name}</p>
                      <p className="text-[11px] text-white/30">
                        {order.client_phone || order.client_email || '—'}
                        {' · '}{order.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${timeColor(order.created_at)}`}>
                      {timeLabel(order.created_at)}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusInfo?.bg || 'bg-white/5 border-white/10'} ${statusInfo?.color || 'text-white/40'}`}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white/[0.02] rounded-xl p-3 space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-white/60">
                        {item.product_name} {item.sku && <span className="text-white/25">({item.sku})</span>}
                      </span>
                      <span className="text-white/40">
                        x{item.qty} · {(item.price * item.qty).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{order.total.toFixed(2)}€</div>
                  {nextStatus && (
                    <button onClick={() => advanceStatus(order.id, nextStatus)}
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-white/60 transition-colors">
                      Avanzar a {ORDER_STATUS_LABELS[nextStatus]} →
                    </button>
                  )}
                </div>

                {order.shipping_address && (
                  <p className="text-[11px] text-white/30">Envío: {order.shipping_address}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
