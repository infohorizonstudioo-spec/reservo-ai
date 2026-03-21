'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PropertyVisit } from '@/types/realestate'

type VisitStatus = PropertyVisit['status']

const STATUS_COLORS: Record<VisitStatus, string> = {
  programada: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  confirmada: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  realizada: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cancelada: 'bg-red-500/20 text-red-300 border-red-500/30',
  sin_mostrar: 'bg-white/[0.06] text-white/40 border-white/[0.08]',
}

const STATUS_LABELS: Record<VisitStatus, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  sin_mostrar: 'Sin mostrar',
}

const today = new Date().toISOString().split('T')[0]

const MOCK_VISITS: PropertyVisit[] = [
  {
    id: '1', tenant_id: 'demo', client_name: 'María García', client_phone: '+34 612 345 678',
    agent_name: 'Carlos', property_address: 'C/ Gran Vía 42, 3ºA',
    date: today, time: '10:00', status: 'confirmada', created_at: new Date().toISOString(),
  },
  {
    id: '2', tenant_id: 'demo', client_name: 'Javier Ruiz', client_phone: '+34 623 456 789',
    agent_name: 'Laura', property_address: 'Av. Constitución 18, bajo',
    date: today, time: '12:30', status: 'programada', created_at: new Date().toISOString(),
  },
  {
    id: '3', tenant_id: 'demo', client_name: 'Ana Fernández', client_phone: '+34 634 567 890',
    agent_name: 'Carlos', property_address: 'C/ Serrano 95, 5ºB',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:00', status: 'programada', created_at: new Date().toISOString(),
  },
  {
    id: '4', tenant_id: 'demo', client_name: 'Pedro Sánchez', client_phone: '+34 645 678 901',
    agent_name: 'Laura', property_address: 'Paseo Marítimo 7, 2ºC',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    time: '17:00', status: 'confirmada', created_at: new Date().toISOString(),
  },
  {
    id: '5', tenant_id: 'demo', client_name: 'Lucía Moreno',
    agent_name: 'Carlos', property_address: 'C/ Mayor 12, ático',
    date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    time: '09:30', status: 'programada', created_at: new Date().toISOString(),
  },
]

function StatusBadge({ status }: { status: VisitStatus }) {
  return (
    <span className={`text-[10px] rounded-md px-2 py-0.5 border font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export default function VisitasView({ tenantId }: { tenantId: string }) {
  const [visits, setVisits] = useState<PropertyVisit[]>([])
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('property_visits')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('date', today)
        .order('date')
        .order('time')

      if (error?.code === '42P01' || !data) {
        setVisits(MOCK_VISITS)
      } else {
        setVisits(data as PropertyVisit[])
      }
    }
    load()
  }, [tenantId])

  function updateStatus(visitId: string, newStatus: VisitStatus) {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status: newStatus } : v))
    supabase
      .from('property_visits')
      .update({ status: newStatus })
      .eq('id', visitId)
      .eq('tenant_id', tenantId)
      .then(() => {})
  }

  const todayVisits = visits.filter(v => v.date === today)
  const nextVisits = visits.filter(v => v.date > today)

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Visitas</h1>
          <p className="text-white/40 text-sm">{visits.length} visitas programadas</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
        >
          + Nueva visita
        </button>
      </div>

      {/* HOY */}
      <div>
        <h2 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          HOY — {new Date(today + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>
        {todayVisits.length === 0 ? (
          <div className="glass rounded-2xl py-8 text-center text-white/25 text-sm border border-amber-500/10 bg-amber-500/[0.03]">
            Sin visitas para hoy
          </div>
        ) : (
          <div className="space-y-2">
            {todayVisits.map(v => (
              <VisitCard key={v.id} visit={v} onUpdateStatus={updateStatus} highlight />
            ))}
          </div>
        )}
      </div>

      {/* PRÓXIMAS */}
      {nextVisits.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white/50 mb-3">PRÓXIMAS</h2>
          <div className="space-y-2">
            {nextVisits.map(v => (
              <VisitCard key={v.id} visit={v} onUpdateStatus={updateStatus} />
            ))}
          </div>
        </div>
      )}

      {showNewModal && (
        <NewVisitModal
          tenantId={tenantId}
          onClose={() => setShowNewModal(false)}
          onSave={(visit) => {
            setVisits(prev => [...prev, visit].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)))
            setShowNewModal(false)
          }}
        />
      )}
    </div>
  )
}

function VisitCard({
  visit,
  onUpdateStatus,
  highlight,
}: {
  visit: PropertyVisit
  onUpdateStatus: (id: string, status: VisitStatus) => void
  highlight?: boolean
}) {
  const dateLabel = visit.date === today
    ? 'Hoy'
    : new Date(visit.date + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div
      className={`glass rounded-xl px-4 py-3.5 flex items-center gap-4 border transition-colors ${
        highlight
          ? 'border-amber-500/15 bg-amber-500/[0.03] hover:border-amber-500/25'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {/* Time */}
      <div className="text-center min-w-[50px]">
        <p className="text-sm font-bold text-white/80">{visit.time.slice(0, 5)}</p>
        {!highlight && <p className="text-[10px] text-white/30">{dateLabel}</p>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{visit.client_name}</p>
        <p className="text-xs text-white/40 truncate">{visit.property_address || 'Sin dirección'}</p>
      </div>

      {/* Agent */}
      {visit.agent_name && (
        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 rounded-md px-2 py-0.5 border border-indigo-500/20 shrink-0">
          {visit.agent_name}
        </span>
      )}

      {/* Status */}
      <StatusBadge status={visit.status} />

      {/* Quick actions */}
      <div className="flex gap-1.5 shrink-0">
        {visit.status === 'programada' && (
          <button
            onClick={() => onUpdateStatus(visit.id, 'confirmada')}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors font-medium"
          >
            Confirmar
          </button>
        )}
        {(visit.status === 'programada' || visit.status === 'confirmada') && (
          <>
            <button
              onClick={() => onUpdateStatus(visit.id, 'realizada')}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors font-medium"
            >
              Realizada
            </button>
            <button
              onClick={() => onUpdateStatus(visit.id, 'cancelada')}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors font-medium"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function NewVisitModal({
  tenantId,
  onClose,
  onSave,
}: {
  tenantId: string
  onClose: () => void
  onSave: (visit: PropertyVisit) => void
}) {
  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    property_address: '',
    agent_name: '',
    date: today,
    time: '10:00',
    notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client_name.trim()) return
    const visit: PropertyVisit = {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      client_name: form.client_name.trim(),
      client_phone: form.client_phone || undefined,
      property_address: form.property_address || undefined,
      agent_name: form.agent_name || undefined,
      date: form.date,
      time: form.time,
      status: 'programada',
      notes: form.notes || undefined,
      created_at: new Date().toISOString(),
    }
    onSave(visit)
    // Persist (best-effort)
    supabase.from('property_visits').insert(visit).then(() => {})
  }

  const inputClass =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors'
  const labelClass = 'text-xs text-white/50 font-medium mb-1 block'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-[#16161d] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Nueva Visita</h2>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white/60 text-lg">
            ✕
          </button>
        </div>

        <div>
          <label className={labelClass}>Cliente *</label>
          <input required value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Nombre del cliente" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Teléfono</label>
            <input value={form.client_phone} onChange={e => set('client_phone', e.target.value)} placeholder="+34 600 000 000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Agente</label>
            <input value={form.agent_name} onChange={e => set('agent_name', e.target.value)} placeholder="Agente asignado" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Dirección propiedad</label>
          <input value={form.property_address} onChange={e => set('property_address', e.target.value)} placeholder="C/ Ejemplo 42, 3ºA" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hora</label>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notas adicionales..." rows={2} className={inputClass + ' resize-none'} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-white/40 hover:text-white/70 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
            Agendar Visita
          </button>
        </div>
      </form>
    </div>
  )
}
