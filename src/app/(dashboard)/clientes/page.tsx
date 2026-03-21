'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, getDemoTenant } from '@/lib/supabase'
import { useTenantType } from '@/lib/tenant-context'
import type { Customer, Reservation } from '@/types'
import LeadsKanban from '@/components/realestate/LeadsKanban'
import MascotasView from '@/components/vet/MascotasView'
import PacientesClinica from '@/components/clinic/PacientesClinica'

export default function ClientesPage() {
  const tenantType = useTenantType()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerReservations, setCustomerReservations] = useState<Reservation[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    async function load() {
      const t = await getDemoTenant()
      if (!t) return
      setTenantId(t.id)
      if (t.type === 'realestate' || t.type === 'veterinary') return
      const { data } = await supabase.from('customers').select('*').eq('tenant_id', t.id).order('visits', { ascending: false })
      setCustomers(data || [])
    }
    load()
  }, [])

  if (tenantType === 'clinic' && tenantId) {
    return <PacientesClinica tenantId={tenantId} />
  }

  if (tenantType === 'veterinary' && tenantId) {
    return <MascotasView tenantId={tenantId} />
  }

  if (tenantType === 'realestate' && tenantId) {
    return <LeadsKanban tenantId={tenantId} />
  }

  async function showHistory(customer: Customer) {
    if (!tenantId) return
    setSelectedCustomer(customer)
    setLoadingHistory(true)
    const { data } = await supabase
      .from('reservations').select('*')
      .eq('tenant_id', tenantId)
      .eq('customer_name', customer.name)
      .order('date', { ascending: false })
      .limit(20)
    setCustomerReservations(data || [])
    setLoadingHistory(false)
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-white/40 text-sm">{customers.length} clientes registrados</p>
        </div>
      </div>

      <input placeholder="Buscar por nombre, teléfono o email..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full max-w-md glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 bg-transparent focus:outline-none focus:border-violet-500/50"/>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
          {customers.length === 0 ? 'Sin clientes registrados aún. Se añaden automáticamente al hacer reservas.' : 'Sin resultados'}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Cliente','Teléfono','Visitas','Gasto total','Última visita','Notas'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(c => (
                <tr key={c.id} onClick={() => showHistory(c)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
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
                  <td className="px-4 py-3.5 text-sm font-medium">{c.visits}</td>
                  <td className="px-4 py-3.5 text-sm">{c.total_spent.toFixed(2)}€</td>
                  <td className="px-4 py-3.5 text-xs text-white/40">
                    {c.last_visit ? new Date(c.last_visit).toLocaleDateString('es-ES') : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-white/40 max-w-[200px] truncate">{c.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal historial de reservas */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center text-sm font-bold text-violet-300">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{selectedCustomer.name}</h2>
                  <p className="text-xs text-white/40">{selectedCustomer.phone || ''} {selectedCustomer.email ? `· ${selectedCustomer.email}` : ''}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-white/30 hover:text-white/60 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold">{selectedCustomer.visits}</div>
                <div className="text-[10px] text-white/30">Visitas</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold">{selectedCustomer.total_spent.toFixed(0)}€</div>
                <div className="text-[10px] text-white/30">Gastado</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold">{selectedCustomer.last_visit ? new Date(selectedCustomer.last_visit).toLocaleDateString('es-ES',{day:'numeric',month:'short'}) : '—'}</div>
                <div className="text-[10px] text-white/30">Última visita</div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 text-white/60">Historial de reservas</h3>
              {loadingHistory ? (
                <p className="text-xs text-white/25 text-center py-4">Cargando...</p>
              ) : customerReservations.length === 0 ? (
                <p className="text-xs text-white/25 text-center py-4">Sin reservas registradas</p>
              ) : (
                <div className="space-y-2">
                  {customerReservations.map(r => (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-xs text-white/30 w-20 shrink-0">
                        {new Date(r.date+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'2-digit'})}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">{r.time.slice(0,5)} · {r.people} pers · {r.zone}</p>
                        {r.notes && <p className="text-[10px] text-white/30 truncate">{r.notes}</p>}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        r.status === 'completada' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                        r.status === 'cancelada' ? 'bg-red-500/15 text-red-400 border-red-500/25' :
                        r.status === 'no_show' ? 'bg-red-500/10 text-red-300 border-red-500/20' :
                        'bg-white/5 text-white/30 border-white/10'
                      }`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
