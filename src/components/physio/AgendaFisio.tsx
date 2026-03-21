'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PhysioAppointment, PhysioAppointmentStatus, PhysioConsultType, BodyArea } from '@/types/physiotherapy'
import { BODY_AREA_LABELS, BODY_AREA_COLORS, CONSULT_TYPE_LABELS, CONSULT_TYPE_COLORS, TREATMENT_LABELS, getPhysioDuration } from '@/lib/physio-engine'

const SLOTS = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2, '0')}:${m}`
})

const TODAY = new Date().toISOString().split('T')[0]

function getTomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
}

const MOCK_APPOINTMENTS: PhysioAppointment[] = [
  { id: 'p1', tenant_id: '', patient_name: 'Roberto Méndez', patient_phone: '612345678', therapist_name: 'Ana Fisio', consult_type: 'tratamiento', body_area: 'rodilla', session_number: 3, treatment_type: 'manual', date: TODAY, time: '09:00', duration_minutes: 30, status: 'confirmada', created_at: '' },
  { id: 'p2', tenant_id: '', patient_name: 'Elena Vázquez', therapist_name: 'Ana Fisio', consult_type: 'primera_visita', body_area: 'cervical', date: TODAY, time: '09:30', duration_minutes: 60, reason: 'Dolor cervical crónico', status: 'pendiente', created_at: '' },
  { id: 'p3', tenant_id: '', patient_name: 'Carlos Ruiz', patient_phone: '623456789', therapist_name: 'Pedro Fisio', consult_type: 'rehabilitacion', body_area: 'hombro', session_number: 7, treatment_type: 'combinado', date: TODAY, time: '10:30', duration_minutes: 45, reason: 'Post-operatorio manguito rotador', status: 'en_sesion', created_at: '' },
  { id: 'p4', tenant_id: '', patient_name: 'Laura Fernández', therapist_name: 'Ana Fisio', consult_type: 'seguimiento', body_area: 'lumbar', session_number: 5, date: TODAY, time: '11:30', duration_minutes: 20, status: 'pendiente', created_at: '' },
  { id: 'p5', tenant_id: '', patient_name: 'Javier Torres', patient_phone: '634567890', therapist_name: 'Pedro Fisio', consult_type: 'tratamiento', body_area: 'tobillo', session_number: 2, treatment_type: 'ejercicios', date: TODAY, time: '12:00', duration_minutes: 30, reason: 'Esguince grado II', status: 'completada', created_at: '' },
  { id: 'p6', tenant_id: '', patient_name: 'María García', therapist_name: 'Ana Fisio', consult_type: 'tratamiento', body_area: 'cadera', session_number: 4, treatment_type: 'electroterapia', date: TODAY, time: '16:00', duration_minutes: 30, status: 'confirmada', created_at: '' },
  { id: 'p7', tenant_id: '', patient_name: 'Pedro Jiménez', consult_type: 'primera_visita', body_area: 'lumbar', date: getTomorrow(), time: '10:00', duration_minutes: 60, reason: 'Lumbalgia recurrente', status: 'pendiente', created_at: '' },
]

const STATUS_STYLES: Record<PhysioAppointmentStatus, string> = {
  pendiente: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  confirmada: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  en_sesion: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completada: 'bg-white/5 text-white/30 border-white/10',
  cancelada: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const STATUS_ACTIONS: Record<string, { next: PhysioAppointmentStatus; label: string }> = {
  pendiente: { next: 'confirmada', label: 'Confirmar' },
  confirmada: { next: 'en_sesion', label: 'En sesión' },
  en_sesion: { next: 'completada', label: 'Completar' },
}

export default function AgendaFisio({ tenantId }: { tenantId: string }) {
  const [appointments, setAppointments] = useState<PhysioAppointment[]>([])
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [usingMock, setUsingMock] = useState(false)
  const [modal, setModal] = useState<{ date: string; time: string } | null>(null)
  const [form, setForm] = useState({
    patient_name: '',
    consult_type: 'tratamiento' as PhysioConsultType,
    body_area: 'otro' as BodyArea,
    reason: '',
  })

  const loadAppointments = useCallback(async () => {
    const { data, error } = await supabase
      .from('physio_appointments')
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

  useEffect(() => { loadAppointments() }, [loadAppointments])

  useEffect(() => {
    if (usingMock) return
    const channel = supabase
      .channel(`physio-agenda-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'physio_appointments',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => { loadAppointments() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tenantId, usingMock, loadAppointments])

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  // Track covered slots for multi-slot appointments
  const coveredSlots = new Set<string>()
  dayAppointments.forEach(a => {
    if (a.duration_minutes > 30) {
      const [h, m] = a.time.split(':').map(Number)
      const startMinutes = h * 60 + m
      for (let offset = 30; offset < a.duration_minutes; offset += 30) {
        const totalMin = startMinutes + offset
        const slotH = Math.floor(totalMin / 60).toString().padStart(2, '0')
        const slotM = (totalMin % 60).toString().padStart(2, '0')
        coveredSlots.add(`${slotH}:${slotM}`)
      }
    }
  })

  function slotSpan(a: PhysioAppointment): number {
    return Math.max(1, a.duration_minutes / 30)
  }

  async function updateStatus(id: string, status: PhysioAppointmentStatus) {
    if (usingMock) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      return
    }
    await supabase.from('physio_appointments').update({ status }).eq('id', id).eq('tenant_id', tenantId)
    loadAppointments()
  }

  async function createAppointment() {
    if (!modal || !form.patient_name) return
    const duration = getPhysioDuration(form.consult_type)
    const newAppt: PhysioAppointment = {
      id: usingMock ? `p-${Date.now()}` : '',
      tenant_id: tenantId,
      patient_name: form.patient_name,
      consult_type: form.consult_type,
      body_area: form.body_area,
      date: modal.date,
      time: modal.time,
      duration_minutes: duration,
      reason: form.reason,
      status: 'pendiente',
      created_at: new Date().toISOString(),
    }
    if (usingMock) {
      setAppointments(prev => [...prev, newAppt])
    } else {
      await supabase.from('physio_appointments').insert({ ...newAppt, id: undefined })
    }
    setModal(null)
    setForm({ patient_name: '', consult_type: 'tratamiento', body_area: 'otro', reason: '' })
  }

  function navigateDay(offset: number) {
    const d = new Date(selectedDate + 'T12:00')
    d.setDate(d.getDate() + offset)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda Fisioterapia</h1>
          <p className="text-white/40 text-sm">
            {dayAppointments.length} citas el{' '}
            {new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            {usingMock && <span className="ml-2 text-amber-400/60">(demo)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => navigateDay(-1)}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">&larr;</button>
            <button onClick={() => setSelectedDate(TODAY)}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">Hoy</button>
            <button onClick={() => navigateDay(1)}
              className="px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-all">&rarr;</button>
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm text-white/70 bg-transparent" />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Left: Day timeline */}
        <div className="w-[60%] glass rounded-2xl overflow-hidden">
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto divide-y divide-white/[0.04]">
            {SLOTS.map(time => {
              if (coveredSlots.has(time)) return null
              const slotAppts = dayAppointments.filter(a => a.time === time)

              return (
                <div key={time}
                  onClick={() => { if (slotAppts.length === 0) setModal({ date: selectedDate, time }) }}
                  className="flex gap-4 px-5 py-2.5 min-h-[48px] hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <div className="w-12 shrink-0 text-[11px] font-mono text-white/25 pt-1">{time}</div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    {slotAppts.map(a => (
                      <div key={a.id}
                        className={`rounded-xl px-3 py-2 text-xs border ${CONSULT_TYPE_COLORS[a.consult_type]}`}
                        style={{ minHeight: `${slotSpan(a) * 48 - 6}px` }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{a.patient_name}</span>
                          {a.body_area && a.body_area !== 'otro' && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${BODY_AREA_COLORS[a.body_area]}`}>
                              {BODY_AREA_LABELS[a.body_area]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-70">
                          <span>{CONSULT_TYPE_LABELS[a.consult_type]}</span>
                          <span>{a.duration_minutes}min</span>
                          {a.session_number && <span>Sesion {a.session_number}{a.treatment_type ? `/${TREATMENT_LABELS[a.treatment_type] || a.treatment_type}` : ''}</span>}
                        </div>
                        {a.reason && <p className="opacity-60 mt-0.5 truncate">{a.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Day list panel */}
        <div className="w-[40%] glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white/80">
              Citas del dia — {new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
            </h2>
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-white/[0.04]">
            {dayAppointments.length === 0 ? (
              <div className="px-5 py-12 text-center text-white/25 text-sm">Sin citas para este dia</div>
            ) : (
              dayAppointments.map(a => {
                const action = STATUS_ACTIONS[a.status]
                return (
                  <div key={a.id} className="px-5 py-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-white/50">{a.time}</span>
                          <span className="font-semibold text-sm text-white/90">{a.patient_name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${CONSULT_TYPE_COLORS[a.consult_type]}`}>
                            {CONSULT_TYPE_LABELS[a.consult_type]}
                          </span>
                          {a.body_area && a.body_area !== 'otro' && (
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${BODY_AREA_COLORS[a.body_area]}`}>
                              {BODY_AREA_LABELS[a.body_area]}
                            </span>
                          )}
                          {a.session_number && (
                            <span className="text-[10px] text-white/40">
                              Sesion {a.session_number}{a.treatment_type ? ` · ${TREATMENT_LABELS[a.treatment_type] || a.treatment_type}` : ''}
                            </span>
                          )}
                          {a.therapist_name && <span className="text-xs text-white/30">{a.therapist_name}</span>}
                          <span className="text-xs text-white/30">{a.duration_minutes}min</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                    </div>
                    {a.reason && <p className="text-xs text-white/35">{a.reason}</p>}
                    {action && (
                      <button onClick={() => updateStatus(a.id, action.next)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25 transition-colors">
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

      {/* Modal: nueva cita */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md space-y-4 border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Nueva cita fisioterapia</h3>
            <p className="text-sm text-white/40">{modal.date} a las {modal.time}</p>

            <input placeholder="Nombre del paciente" value={form.patient_name}
              onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent placeholder-white/25 focus:outline-none focus:border-violet-500/50" />

            <select value={form.consult_type}
              onChange={e => setForm(f => ({ ...f, consult_type: e.target.value as PhysioConsultType }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent focus:outline-none">
              {Object.entries(CONSULT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} className="bg-neutral-900">{v}</option>
              ))}
            </select>

            <select value={form.body_area}
              onChange={e => setForm(f => ({ ...f, body_area: e.target.value as BodyArea }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent focus:outline-none">
              {Object.entries(BODY_AREA_LABELS).map(([k, v]) => (
                <option key={k} value={k} className="bg-neutral-900">{v}</option>
              ))}
            </select>

            <input placeholder="Motivo (opcional)" value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent placeholder-white/25 focus:outline-none" />

            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 glass rounded-xl py-2.5 text-sm text-white/50 hover:text-white/70">Cancelar</button>
              <button onClick={createAppointment}
                className="flex-1 bg-violet-500/20 border border-violet-500/40 rounded-xl py-2.5 text-sm text-violet-300 font-medium hover:bg-violet-500/30">
                Crear cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
