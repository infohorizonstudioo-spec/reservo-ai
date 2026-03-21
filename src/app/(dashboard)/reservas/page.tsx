'use client'
import { useEffect, useState } from 'react'
import { supabase, getDemoTenant } from '@/lib/supabase'
import { Reservation, Tenant } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { Modal } from '@/components/ui/Modal'

type TabKey = 'todas' | 'pendiente' | 'confirmada' | 'sentada' | 'cancelada'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'todas',      label: 'Todas' },
  { key: 'pendiente',  label: 'Pendientes' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'sentada',    label: 'Sentadas' },
  { key: 'cancelada',  label: 'Canceladas' },
]

const EMPTY_FORM = {
  customer_name: '', customer_phone: '', date: '', time: '',
  people: 2, zone: 'Principal', notes: '', allergies: '',
}

export default function ReservasPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('todas')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  async function load(tid: string) {
    const { data } = await supabase
      .from('reservations').select('*')
      .eq('tenant_id', tid)
      .eq('date', today)
      .order('time')
    setReservations(data || [])
    setLoading(false)
  }

  useEffect(() => {
    getDemoTenant().then(t => {
      if (!t) return setLoading(false)
      setTenant(t)
      load(t.id)
      const ch = supabase.channel('reservas-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => load(t.id))
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateStatus(id: string, status: Reservation['status']) {
    if (!tenant) return
    await supabase.from('reservations').update({ status, updated_at: new Date().toISOString() })
      .eq('id', id).eq('tenant_id', tenant.id)
  }

  async function handleCreate() {
    if (!tenant || !form.customer_name || !form.date || !form.time) return
    setSaving(true)
    await supabase.from('reservations').insert({
      ...form, tenant_id: tenant.id, people: Number(form.people),
      status: 'pendiente', source: 'manual',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setModal(false)
    setForm(EMPTY_FORM)
  }

  const filtered = tab === 'todas' ? reservations : reservations.filter(r => r.status === tab)

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Reservas</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={() => setModal(true)}
          className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30
            text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors">
          + Nueva reserva
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] w-fit">
        {TABS.map(t => {
          const count = t.key === 'todas' ? reservations.length
            : reservations.filter(r => r.status === t.key).length
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                ${tab === t.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
              {t.label}
              {count > 0 && <span className={`text-[10px] px-1.5 rounded-full
                ${tab === t.key ? 'bg-violet-500/30 text-violet-300' : 'bg-white/[0.07] text-white/40'}`}>
                {count}
              </span>}
            </button>
          )
        })}
      </div>

      {/* Lista */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? <LoadingSkeleton lines={6} /> : filtered.length === 0 ? (
          <EmptyState icon="📅" title="Sin reservas"
            description="No hay reservas para este filtro hoy."
            action={{ label: '+ Nueva reserva', onClick: () => setModal(true) }} />
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] group">
                <div className="text-sm font-mono text-white/40 w-12 shrink-0">{r.time.slice(0, 5)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.customer_name}</p>
                  <p className="text-xs text-white/30">
                    {r.people} pers · {r.zone}{r.customer_phone ? ` · ${r.customer_phone}` : ''}
                  </p>
                </div>
                {r.allergies && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium border bg-amber-500/15 text-amber-400 border-amber-500/25">
                    ⚠ {r.allergies}
                  </span>
                )}
                <StatusBadge status={r.status} />
                {/* Acciones */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.status === 'pendiente' && (
                    <button onClick={() => updateStatus(r.id, 'confirmada')}
                      className="text-[11px] px-2 py-1 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                      Confirmar
                    </button>
                  )}
                  {r.status === 'confirmada' && (
                    <button onClick={() => updateStatus(r.id, 'sentada')}
                      className="text-[11px] px-2 py-1 rounded-lg bg-violet-500/15 text-violet-400 hover:bg-violet-500/25 transition-colors">
                      Sentar
                    </button>
                  )}
                  {(r.status === 'pendiente' || r.status === 'confirmada') && (
                    <>
                      <button onClick={() => updateStatus(r.id, 'no_show')}
                        className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.05] text-white/40 hover:bg-white/[0.08] transition-colors">
                        No show
                      </button>
                      <button onClick={() => updateStatus(r.id, 'cancelada')}
                        className="text-[11px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva reserva */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nueva reserva">
        <div className="space-y-3">
          {[
            { label: 'Nombre', key: 'customer_name', type: 'text', placeholder: 'Nombre del cliente', required: true },
            { label: 'Teléfono', key: 'customer_phone', type: 'tel', placeholder: '+34 600 000 000' },
            { label: 'Fecha', key: 'date', type: 'date', required: true },
            { label: 'Hora', key: 'time', type: 'time', required: true },
            { label: 'Alergias', key: 'allergies', type: 'text', placeholder: 'Frutos secos, gluten...' },
            { label: 'Notas', key: 'notes', type: 'text', placeholder: 'Cumpleaños, mesa especial...' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-white/40 mb-1">{f.label}{f.required && ' *'}</label>
              <input type={f.type} placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="input-base" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Personas *</label>
              <input type="number" min={1} max={20} value={form.people}
                onChange={e => setForm(prev => ({ ...prev, people: Number(e.target.value) }))}
                className="input-base" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Zona</label>
              <select value={form.zone} onChange={e => setForm(prev => ({ ...prev, zone: e.target.value }))}
                className="input-base">
                {['Principal', 'Terraza', 'Privada', 'Barra'].map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleCreate} disabled={saving || !form.customer_name || !form.date || !form.time}
            className="w-full mt-2 py-2.5 rounded-xl bg-violet-500/80 hover:bg-violet-500
              text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? 'Guardando...' : 'Crear reserva'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
