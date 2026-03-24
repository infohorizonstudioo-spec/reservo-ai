'use client'
import { useEffect, useState } from 'react'
import { supabase, getDemoTenant } from '@/lib/supabase'
import { Table, Tenant } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { getTenantConfig, TenantType } from '@/lib/tenant-context'

type TableStatus = Table['status']

const STATUS_STYLE: Record<TableStatus, { bg: string; border: string; dot: string }> = {
  libre:     { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  reservada: { bg: 'bg-blue-500/15',    border: 'border-blue-500/30',    dot: 'bg-blue-400' },
  ocupada:   { bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  dot: 'bg-orange-400' },
  pendiente: { bg: 'bg-yellow-500/15',  border: 'border-yellow-500/30',  dot: 'bg-yellow-400' },
  bloqueada: { bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   dot: 'bg-slate-400' },
}

const STATUS_ACTIONS: { from: TableStatus; to: TableStatus; label: string; cls: string }[] = [
  { from: 'libre',     to: 'ocupada',   label: 'Ocupar',     cls: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25' },
  { from: 'libre',     to: 'reservada', label: 'Reservar',   cls: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' },
  { from: 'libre',     to: 'bloqueada', label: 'Bloquear',   cls: 'bg-slate-500/15 text-slate-400 hover:bg-slate-500/25' },
  { from: 'reservada', to: 'ocupada',   label: 'Ocupar',     cls: 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/25' },
  { from: 'reservada', to: 'libre',     label: 'Liberar',    cls: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' },
  { from: 'ocupada',   to: 'libre',     label: 'Liberar',    cls: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' },
  { from: 'bloqueada', to: 'libre',     label: 'Desbloquear', cls: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' },
]

const LEGEND: { status: TableStatus; label: string }[] = [
  { status: 'libre',     label: 'Libre' },
  { status: 'reservada', label: 'Reservada' },
  { status: 'ocupada',   label: 'Ocupada' },
  { status: 'bloqueada', label: 'Bloqueada' },
]

export default function MesasPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [selected, setSelected] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  async function load(tid: string) {
    const { data } = await supabase.from('tables').select('*')
      .eq('tenant_id', tid).eq('active', true).order('number')
    setTables(data || [])
    setLoading(false)
  }

  useEffect(() => {
    getDemoTenant().then(t => {
      if (!t) return setLoading(false)
      setTenant(t)
      load(t.id)
      const ch = supabase.channel('mesas-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => load(t.id))
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateStatus(id: string, status: TableStatus) {
    if (!tenant) return
    await supabase.from('tables').update({ status }).eq('id', id).eq('tenant_id', tenant.id)
    setSelected(prev => prev ? { ...prev, status } : null)
  }

  const tenantType = (tenant?.type || 'restaurant') as TenantType
  const config = getTenantConfig(tenantType)
  const unitLabels = config.unitLabels

  const stats = {
    libres:     tables.filter(t => t.status === 'libre').length,
    ocupadas:   tables.filter(t => t.status === 'ocupada').length,
    reservadas: tables.filter(t => t.status === 'reservada').length,
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{unitLabels.plural}</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {stats.libres} libres · {stats.ocupadas} ocupadas · {stats.reservadas} reservadas
          </p>
        </div>
      </div>

      {loading ? <LoadingSkeleton type="card" /> : tables.length === 0 ? (
        <EmptyState icon="⊞" title={`Sin ${unitLabels.plural.toLowerCase()} configuradas`}
          description={`Configura ${unitLabels.plural.toLowerCase()} para empezar.`} />
      ) : (
        <div className="flex gap-5">
          {/* Grid de mesas */}
          <div className="flex-1">
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map(t => {
                const style = STATUS_STYLE[t.status]
                const isSelected = selected?.id === t.id
                return (
                  <button key={t.id} onClick={() => setSelected(t)}
                    className={`relative rounded-2xl border p-4 transition-all text-center
                      ${style.bg} ${style.border}
                      ${isSelected ? 'ring-2 ring-violet-500/50 scale-[1.03]' : 'hover:scale-[1.02]'}`}>
                    <div className="text-2xl font-bold leading-none">{t.number}</div>
                    <div className="text-[11px] text-white/40 mt-1.5">
                      {t.current_people}/{t.capacity}
                    </div>
                    <div className={`w-2 h-2 rounded-full absolute top-2.5 right-2.5 ${style.dot}`} />
                    {t.zone && (
                      <div className="text-[10px] text-white/25 mt-1 truncate">{t.zone}</div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/[0.06]">
              {LEGEND.map(l => {
                const style = STATUS_STYLE[l.status]
                return (
                  <div key={l.status} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className="text-[11px] text-white/40">{l.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Panel lateral */}
          {selected && (
            <div className="w-72 shrink-0 glass rounded-2xl border border-white/[0.06] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <h2 className="font-semibold text-sm">{unitLabels.singular} {selected.number}</h2>
                <button onClick={() => setSelected(null)}
                  className="text-white/30 hover:text-white/70 transition-colors text-lg leading-none">
                  ✕
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Estado</span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Capacidad</span>
                    <span className="text-xs font-medium">{selected.capacity} personas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Ocupación</span>
                    <span className="text-xs font-medium">{selected.current_people} / {selected.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Zona</span>
                    <span className="text-xs font-medium">{selected.zone || '—'}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">Cambiar estado</p>
                  {STATUS_ACTIONS.filter(a => a.from === selected.status).map(a => (
                    <button key={a.to} onClick={() => updateStatus(selected.id, a.to)}
                      className={`w-full text-xs px-3 py-2 rounded-xl border border-white/[0.06] transition-colors ${a.cls}`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
