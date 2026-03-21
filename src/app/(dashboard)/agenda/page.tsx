'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { supabase, getDemoTenant } from '@/lib/supabase'
import { useTenantType } from '@/lib/tenant-context'
import type { Reservation } from '@/types'
import AgendaClinica from '@/components/clinic/AgendaClinica'
import AgendaVet from '@/components/vet/AgendaVet'
import VisitasView from '@/components/realestate/VisitasView'
import AgendaPsico from '@/components/psychology/AgendaPsico'

const HOURS = Array.from({length:14}, (_,i) => i + 9)

const STATUS_COLOR: Record<string,string> = {
  pendiente:'bg-amber-500/30 border-amber-500/50 text-amber-200',
  confirmada:'bg-emerald-500/30 border-emerald-500/50 text-emerald-200',
  sentada:'bg-blue-500/30 border-blue-500/50 text-blue-200',
  cancelada:'bg-red-500/20 border-red-500/30 text-red-300',
  completada:'bg-white/5 border-white/10 text-white/30',
  no_show:'bg-red-500/15 border-red-500/25 text-red-300',
}

export default function AgendaPage() {
  const tenantType = useTenantType()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [view, setView] = useState<'day'|'week'>('day')

  const load = useCallback(async () => {
    const t = await getDemoTenant()
    if (!t) return
    setTenantId(t.id)
    const { data } = await supabase.from('reservations').select('*').eq('tenant_id', t.id).order('date').order('time')
    setReservations(data || [])
  }, [])

  useEffect(() => {
    load()
    const channel = supabase.channel('agenda-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  if (!tenantId) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-white/30 text-sm">Cargando...</div>
      </div>
    )
  }

  if (tenantType === 'clinic') return <AgendaClinica tenantId={tenantId} />
  if (tenantType === 'veterinary') return <AgendaVet tenantId={tenantId} />
  if (tenantType === 'realestate') return <VisitasView tenantId={tenantId} />
  if (tenantType === 'psychology') return <AgendaPsico tenantId={tenantId} />

  // Restaurant agenda
  const dayRes = reservations.filter(r => r.date === selectedDate)
  const totalPeople = dayRes.reduce((s, r) => s + r.people, 0)

  function getWeekDays() {
    const days = []
    const d = new Date(selectedDate + 'T12:00')
    const day = d.getDay()
    const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    for (let i = 0; i < 7; i++) {
      const dd = new Date(mon); dd.setDate(mon.getDate() + i)
      days.push(dd.toISOString().split('T')[0])
    }
    return days
  }

  function navigateDay(offset: number) {
    const d = new Date(selectedDate + 'T12:00')
    d.setDate(d.getDate() + offset)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  function navigateWeek(offset: number) {
    const d = new Date(selectedDate + 'T12:00')
    d.setDate(d.getDate() + offset * 7)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const weekDays = getWeekDays()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-white/40 text-sm">
            {dayRes.length} reservas · {totalPeople} personas · {new Date(selectedDate+'T12:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => view === 'day' ? navigateDay(-1) : navigateWeek(-1)}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">&larr;</button>
            <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">Hoy</button>
            <button onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">&rarr;</button>
          </div>
          <div className="flex gap-1">
            {(['day','week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view===v?'bg-white/12 text-white':'text-white/40 hover:text-white/60'}`}>
                {v === 'day' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm text-white/70 bg-transparent"/>
        </div>
      </div>

      {view === 'day' ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {HOURS.map(h => {
              const hRes = dayRes.filter(r => parseInt(r.time) === h)
              return (
                <div key={h} className="flex gap-4 px-5 py-3 min-h-[60px]">
                  <div className="w-12 shrink-0 text-sm font-mono text-white/25 pt-1">{h}:00</div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {hRes.map(r => (
                      <div key={r.id} className={`rounded-xl px-3 py-2 text-xs border ${STATUS_COLOR[r.status] || STATUS_COLOR.pendiente} min-w-[140px]`}>
                        <p className="font-semibold">{r.customer_name}</p>
                        <p className="opacity-70">{r.time.slice(0,5)} · {r.people}p · {r.zone}</p>
                        {r.allergies && <p className="text-amber-300 opacity-70 mt-0.5">⚠ {r.allergies}</p>}
                        {r.notes && <p className="opacity-50 truncate mt-0.5">{r.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-8 border-b border-white/[0.06]">
            <div className="px-3 py-3"/>
            {weekDays.map(d => {
              const dd = new Date(d+'T12:00')
              const isToday = d === new Date().toISOString().split('T')[0]
              const isSelected = d === selectedDate
              const dayCount = reservations.filter(r=>r.date===d).length
              return (
                <button key={d} onClick={() => { setSelectedDate(d); setView('day') }}
                  className={`px-2 py-3 text-center transition-all hover:bg-white/[0.03] ${isSelected ? 'bg-violet-500/15' : ''}`}>
                  <p className="text-xs text-white/30">{dd.toLocaleDateString('es-ES',{weekday:'short'})}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-violet-400' : 'text-white/70'}`}>
                    {dd.getDate()}
                  </p>
                  <p className={`text-[10px] ${dayCount > 0 ? 'text-white/40' : 'text-white/15'}`}>{dayCount} res.</p>
                </button>
              )
            })}
          </div>
          {HOURS.map(h => (
            <div key={h} className="grid grid-cols-8 border-b border-white/[0.04] min-h-[52px]">
              <div className="px-3 py-2 text-xs font-mono text-white/20">{h}:00</div>
              {weekDays.map(d => {
                const hRes = reservations.filter(r => r.date === d && parseInt(r.time) === h)
                return (
                  <div key={d} className="px-1 py-1 border-l border-white/[0.04]">
                    {hRes.map(r => (
                      <div key={r.id} className={`rounded px-1.5 py-1 text-[10px] mb-0.5 border ${STATUS_COLOR[r.status] || STATUS_COLOR.pendiente}`}>
                        {r.customer_name.split(' ')[0]} · {r.people}p
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
