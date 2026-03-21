'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PsychAppointment, PsychAppointmentStatus, PsychSessionType, SessionModality } from '@/types/psychology'
import { SESSION_TYPE_LABELS, SESSION_TYPE_COLORS, MODALITY_COLORS, getPsychDuration } from '@/lib/psych-engine'

const TODAY = new Date().toISOString().split('T')[0]

function getTomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
}

// Slots de 50 min visualizados en grid de 30 min
const HOURS = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2, '0')}:${m}`
})

const MOCK_APPOINTMENTS: PsychAppointment[] = [
  { id: 'ps1', tenant_id: '', patient_name: 'Ana R.', therapist_name: 'Dra. Soto', session_type: 'primera_sesion', modality: 'presencial', session_number: 1, date: TODAY, time: '09:00', duration_minutes: 60, status: 'confirmada', created_at: '' },
  { id: 'ps2', tenant_id: '', patient_name: 'Carlos M.', therapist_name: 'Dra. Soto', session_type: 'seguimiento', modality: 'online', session_number: 5, date: TODAY, time: '10:30', duration_minutes: 50, status: 'pendiente', created_at: '' },
  { id: 'ps3', tenant_id: '', patient_name: 'Lucía F.', therapist_name: 'Dr. Reyes', session_type: 'seguimiento', modality: 'presencial', session_number: 12, date: TODAY, time: '12:00', duration_minutes: 50, status: 'en_sesion', created_at: '' },
  { id: 'ps4', tenant_id: '', patient_name: 'Jorge B.', therapist_name: 'Dra. Soto', session_type: 'consulta_general', modality: 'online', date: TODAY, time: '16:00', duration_minutes: 50, status: 'confirmada', created_at: '' },
  { id: 'ps5', tenant_id: '', patient_name: 'Elena V.', session_type: 'seguimiento', modality: 'presencial', session_number: 3, date: getTomorrow(), time: '09:30', duration_minutes: 50, status: 'pendiente', created_at: '' },
  { id: 'ps6', tenant_id: '', patient_name: 'Marta D.', therapist_name: 'Dr. Reyes', session_type: 'urgencia_emocional', modality: 'presencial', date: TODAY, time: '17:00', duration_minutes: 60, status: 'pendiente', created_at: '' },
]

const STATUS_STYLES: Record<PsychAppointmentStatus, string> = {
  pendiente: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  confirmada: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  en_sesion: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  completada: 'bg-white/5 text-white/25 border-white/10',
  cancelada: 'bg-red-500/10 text-red-300/50 border-red-500/15',
}

const STATUS_ACTIONS: Record<string, { next: PsychAppointmentStatus; label: string }> = {
  pendiente: { next: 'confirmada', label: 'Confirmar' },
  confirmada: { next: 'en_sesion', label: 'En sesión' },
  en_sesion: { next: 'completada', label: 'Completar' },
}

export default function AgendaPsico({ tenantId }: { tenantId: string }) {
  const [appointments, setAppointments] = useState<PsychAppointment[]>([])
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [usingMock, setUsingMock] = useState(false)
  const [selected, setSelected] = useState<PsychAppointment | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('psych_appointments')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error || !data || data.length === 0) {
      setUsingMock(true)
      setAppointments(MOCK_APPOINTMENTS.map(a => ({ ...a, tenant_id: tenantId })))
      return
    }
    setUsingMock(false)
    setAppointments(data)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (usingMock) return
    const channel = supabase
      .channel(`psych-agenda-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'psych_appointments',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => { load() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tenantId, usingMock, load])

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  function navigateDay(offset: number) {
    const d = new Date(selectedDate + 'T12:00')
    d.setDate(d.getDate() + offset)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  async function updateStatus(id: string, status: PsychAppointmentStatus) {
    if (usingMock) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      return
    }
    await supabase.from('psych_appointments').update({ status }).eq('id', id).eq('tenant_id', tenantId)
    load()
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Agenda</h1>
          <p className="text-white/35 text-sm">
            {dayAppointments.length} sesiones ·{' '}
            {new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            {usingMock && <span className="ml-2 text-amber-400/50">(demo)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateDay(-1)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-all">&larr;</button>
          <button onClick={() => setSelectedDate(TODAY)}
            className="px-3 py-1.5 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-all">Hoy</button>
          <button onClick={() => navigateDay(1)}
            className="px-2.5 py-1.5 rounded-lg text-xs text-white/35 hover:text-white/60 hover:bg-white/5 transition-all">&rarr;</button>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm text-white/60 bg-transparent" />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Timeline — left 60% */}
        <div className="w-[60%] glass rounded-2xl overflow-hidden">
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto divide-y divide-white/[0.04]">
            {HOURS.map(time => {
              const slotAppts = dayAppointments.filter(a => a.time === time)
              return (
                <div key={time} className="flex gap-3 px-4 py-2.5 min-h-[48px]">
                  <div className="w-12 shrink-0 text-[11px] font-mono text-white/20 pt-1">{time}</div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {slotAppts.map(a => (
                      <button key={a.id} onClick={() => setSelected(a)}
                        className={`rounded-xl px-3 py-2 text-left text-xs border transition-all hover:brightness-110 min-w-[160px] ${SESSION_TYPE_COLORS[a.session_type]}`}>
                        <p className="font-semibold text-white/80">{a.patient_name}</p>
                        <div className="flex items-center gap-2 mt-1 opacity-70">
                          <span>{a.time.slice(0, 5)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] border ${MODALITY_COLORS[a.modality]}`}>
                            {a.modality === 'online' ? 'Online' : 'Presencial'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Day list — right 40% */}
        <div className="w-[40%] glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white/60">
              Sesiones del día
            </h2>
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-white/[0.04]">
            {dayAppointments.length === 0 ? (
              <div className="px-5 py-12 text-center text-white/20 text-sm">Sin sesiones para este día</div>
            ) : (
              dayAppointments.map(a => {
                const action = STATUS_ACTIONS[a.status]
                return (
                  <div key={a.id} className="px-5 py-3.5 space-y-2 hover:bg-white/[0.015] transition-colors cursor-pointer"
                    onClick={() => setSelected(a)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-white/40">{a.time}</span>
                          <span className="font-semibold text-sm text-white/85">{a.patient_name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${MODALITY_COLORS[a.modality]}`}>
                            {a.modality === 'online' ? 'Online' : 'Presencial'}
                          </span>
                          <span className="text-xs text-white/30">{SESSION_TYPE_LABELS[a.session_type]}</span>
                          <span className="text-xs text-white/20">{a.duration_minutes}min</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </div>
                    {action && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(a.id, action.next) }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-500/12 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition-colors">
                        {action.label}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Panel lateral — información mínima */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm space-y-4 border border-white/[0.08]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white/90">{selected.patient_name}</h3>
              <button onClick={() => setSelected(null)} className="text-white/25 hover:text-white/50 text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Hora</span>
                <span className="text-white/70 font-mono">{selected.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Tipo</span>
                <span className="text-white/70">{SESSION_TYPE_LABELS[selected.session_type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Modalidad</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${MODALITY_COLORS[selected.modality]}`}>
                  {selected.modality === 'online' ? 'Online' : 'Presencial'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Duración</span>
                <span className="text-white/70">{selected.duration_minutes} min</span>
              </div>
              {selected.therapist_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/35">Terapeuta</span>
                  <span className="text-white/70">{selected.therapist_name}</span>
                </div>
              )}
              {selected.session_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/35">Sesión nº</span>
                  <span className="text-white/70">{selected.session_number}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/35">Estado</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
