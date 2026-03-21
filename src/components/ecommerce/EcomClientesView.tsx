'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EcomOrder } from '@/types/ecommerce'

interface EcomClient {
  name: string
  phone?: string
  email?: string
  total_orders: number
  total_spent: number
  last_order?: string
}

export default function EcomClientesView({ tenantId }: { tenantId: string }) {
  const [clients, setClients] = useState<EcomClient[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('ecom_orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (!data || data.length === 0) {
        // Mock data
        setClients([
          { name: 'Laura Martinez', phone: '+34 655 123 456', email: 'laura@email.com', total_orders: 5, total_spent: 487.30, last_order: new Date(Date.now() - 2 * 86400000).toISOString() },
          { name: 'Pedro Sanchez', phone: '+34 611 222 333', total_orders: 2, total_spent: 119.80, last_order: new Date(Date.now() - 5 * 86400000).toISOString() },
          { name: 'Ana López', email: 'ana.lopez@gmail.com', total_orders: 8, total_spent: 892.15, last_order: new Date(Date.now() - 1 * 86400000).toISOString() },
          { name: 'Carlos Ruiz', phone: '+34 622 333 444', email: 'carlos@empresa.com', total_orders: 1, total_spent: 89.99, last_order: new Date(Date.now() - 10 * 86400000).toISOString() },
        ])
        setLoading(false)
        return
      }

      // Aggregate clients from orders
      const clientMap = new Map<string, EcomClient>()
      for (const order of data as EcomOrder[]) {
        const key = order.client_name.toLowerCase()
        const existing = clientMap.get(key)
        if (existing) {
          existing.total_orders++
          existing.total_spent += order.total
          if (!existing.last_order || order.created_at > existing.last_order) {
            existing.last_order = order.created_at
          }
          if (!existing.phone && order.client_phone) existing.phone = order.client_phone
          if (!existing.email && order.client_email) existing.email = order.client_email
        } else {
          clientMap.set(key, {
            name: order.client_name,
            phone: order.client_phone,
            email: order.client_email,
            total_orders: 1,
            total_spent: order.total,
            last_order: order.created_at,
          })
        }
      }
      setClients(Array.from(clientMap.values()).sort((a, b) => b.total_spent - a.total_spent))
      setLoading(false)
    }
    load()
  }, [tenantId])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="p-6 text-center text-white/30 text-sm">Cargando clientes...</div>
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes eCommerce</h1>
          <p className="text-white/40 text-sm">{clients.length} clientes registrados</p>
        </div>
      </div>

      <input placeholder="Buscar por nombre, teléfono o email..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 bg-transparent focus:outline-none focus:border-violet-500/50" />

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
          {clients.length === 0 ? 'Sin clientes registrados. Se añaden al realizar pedidos.' : 'Sin resultados'}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Cliente', 'Teléfono', 'Pedidos', 'Gasto total', 'Último pedido'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(c => (
                <tr key={c.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        {c.email && <p className="text-xs text-white/30">{c.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-white/50">{c.phone || '—'}</td>
                  <td className="px-4 py-3.5 text-sm font-medium">{c.total_orders}</td>
                  <td className="px-4 py-3.5 text-sm">{c.total_spent.toFixed(2)}€</td>
                  <td className="px-4 py-3.5 text-xs text-white/40">
                    {c.last_order ? new Date(c.last_order).toLocaleDateString('es-ES') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
