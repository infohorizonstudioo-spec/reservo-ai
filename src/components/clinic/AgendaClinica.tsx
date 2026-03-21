'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ClinicAppointment, AppointmentStatus, ConsultType } from '@/types/clinic'
import { CONSULT_TYPE_LABELS, CONSULT_TYPE_COLORS, getConsultDuration } from '@/lib/clinic-engine'

const HOURS = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2, '0')}:${m}`
})

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const TODAY = new Date().toISOString().split('T')[0]

function getTomorrow() {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
}

const MOCK_APPOINTMENTS: ClinicAppointment[] = [
  { id: 'm1', tenant_id: '', patient_name: 'María García', patient_phone: '612345678', doctor_name: 'Dr. López', consult_type: 'revision', date: TODAY, time: '09:00', duration_minutes: 20, is_urgent: false, status: 'confirmada', created_at: '' },
  { id: 'm2', tenant_id: '', patient_name: 'Carlos Ruiz', patient_phone: '623456789', doctor_name: 'Dra. Martín', consult_type: 'limpieza', date: TODAY, time: '10:00', duration_minutes: 30, is_urgent: false, status: 'pendiente', created_at: '' },
  { id: 'm3', tenant_id: '', patient_name: 'Ana Sánchez', doctor_name: 'Dr. López', consult_type: 'urgencia', date: TODAY, time: '10:30', duration_minutes: 30, reason: 'Dolor fuerte', is_urgent: true, status: 'en_consulta', created_at: '' },
  { id: 'm4', tenant_id: '', patient_name: 'Pedro Jiménez', patient_phone: '634567890', doctor_name: 'Dra. Martín', consult_type: 'tratamiento', date: TODAY, time: '12:00', duration_minutes: 60, reason: 'Empaste', is_urgent: false, status: 'completada', created_at: '' },
  { id: 'm5', tenant_id: '', patient_name: 'Laura Fernández', doctor_name: 'Dr. López', consult_type: 'revision', date: TODAY, time: '16:00', duration_minutes: 20, is_urgent: false, status: 'confirmada', created_at: '' },
  { id: 'm6', tenant_id: '', patient_name: 'Javier Torres', patient_phone: '645678901', consult_type: 'limpieza', date: getTomorrow(), time: '09:30', duration_minutes: 30, is_urgent: false, status: 'pendiente', created_at: '' },
]

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pendiente: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  confirmada: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  en_consulta: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completada: 'bg-white/5 text-white/30 border-white/10',
  cancelada: 'bg-red-500/20 text-red-300 border-red-500/30',
  no_show: 'bg-red-500/10 text-red-300/60 border-red-500/20',
}

const STATUS_ACTIONS: Record<string, { next: AppointmentStatus; label: string }> = {
  pendiente: { next: 'confirmada', label: 'Confirmar' },
  confirmada: { next: 'en_consulta', label: 'En consulta' },
  en_consulta: { next: 'completada', label: 'Completar' },
}

export default function AgendaClinica({ tenantId }: { tenantId: string }) {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([])
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [usingMock, setUsingMock] = useState(false)
  const [modal, setModal] = useState<{ date: string; time: string } | null>(null)
  const [form, setForm] = useState({ patient_name: '', consult_type: 'revision' as ConsultType, reason: '', is_urgent: false })

  const loadAppointments = useCallback(async () => {
    const { data, error } = await supabase
      .from('clinic_appointments')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error && error.code === '42P01') {
      setUsingMock(true)
      setAppointments(MOCK_APPOINTMENTS.map(a => ({ ...a, tenant_id: tenantId })))
      return
    }

    if (!data || data.length === 0) {
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
      .channel(`clinic-agenda-${tenantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'clinic_appointments',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => { loadAppointments() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tenantId, usingMock, loadAppointments])

  function getWeekDays(): string[] {
    const d = new Date(selectedDate + 'T12:00')
    const day = d.getDay()
    const mon = new Date(d)
    mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(mon); dd.setDate(mon.getDate() + i)
      return dd.toISOString().split('T')[0]
    })
  }

  const weekDays = getWeekDays()

  function getAppointmentsForSlot(date: string, time: string) {
    return appointments.filter(a => a.date === date && a.time === time)
  }

  function slotSpan(a: ClinicAppointment): number {
    return Math.max(1, a.duration_minutes / 30)
  }

  // Track which slots are covered by multi-slot appointments
  const coveredSlots = new Set<string>()
  appointments.forEach(a => {
    if (a.duration_minutes > 30) {
      const [h, m] = a.time.split(':').map(Number)
      const startMinutes = h * 60 + m
      for (let offset = 30; offset < a.duration_minutes; offset += 30) {
        const totalMin = startMinutes + offset
        const slotH = Math.floor(totalMin / 60).toString().padStart(2, '0')
        const slotM = (totalMin % 60).toString().padStart(2, '0')
        coveredSlots.add(`${a.date}-${slotH}:${slotM}`)
      }
    }
  })

  async function updateStatus(id: string, status: AppointmentStatus) {
    if (usingMock) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      return
    }
    await supabase.from('clinic_appointments').update({ status }).eq('id', id).eq('tenant_id', tenantId)
    loadAppointments()
  }

  async function createAppointment() {
    if (!modal || !form.patient_name) return
    const duration = getConsultDuration(form.consult_type)
    const newAppt: ClinicAppointment = {
      id: usingMock ? `m-${Date.now()}` : '',
      tenant_id: tenantId,
      patient_name: form.patient_name,
      consult_type: form.consult_type,
      date: modal.date,
      time: modal.time,
      duration_minutes: duration,
      reason: form.reason,
      is_urgent: form.is_urgent,
      status: 'pendiente',
      created_at: new Date().toISOString(),
    }
    if (usingMock) {
      setAppointments(prev => [...prev, newAppt])
    } else {
      await supabase.from('clinic_appointments').insert({ ...newAppt, id: undefined })
    }
    setModal(null)
    setForm({ patient_name: '', consult_type: 'revision', reason: '', is_urgent: false })
  }

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda Clínica</h1>
          <p className="text-white/40 text-sm">
            {dayAppointments.length} citas el{' '}
            {new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            {usingMock && <span className="ml-2 text-amber-400/60">(demo)</span>}
          </p>
        </div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm text-white/70 bg-transparent" />
      </div>

      <div className="flex gap-5">
        {/* Left panel - Weekly calendar (60%) */}
        <div className="w-[60%] glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-8 border-b border-white/[0.06]">
            <div className="px-2 py-3" />
            {weekDays.map((d, i) => {
              const dd = new Date(d + 'T12:00')
              const isToday = d === TODAY
              const isSelected = d === selectedDate
              const dayCount = appointments.filter(a => a.date === d).length
              return (
                <button key={d} onClick={() => setSelectedDate(d)}
                  className={`px-1 py-3 text-center transition-all hover:bg-white/[0.03] ${isSelected ? 'bg-violet-500/15' : ''}`}>
                  <p className="text-xs text-white/30">{DAYS[i]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-violet-400' : 'text-white/70'}`}>{dd.getDate()}</p>
                  <p className="text-[10px] text-white/25">{dayCount} citas</p>
                </button>
              )
            })}
          </div>
          <div className="max-h-[calc(100vh-240px)] overflow-y-auto">
            {HOURS.map(time => (
              <div key={time} className="grid grid-cols-8 border-b border-white/[0.04] min-h-[40px]">
                <div className="px-2 py-1.5 text-[11px] font-mono text-white/20">{time}</div>
                {weekDays.map(d => {
                  const slotKey = `${d}-${time}`
                  if (coveredSlots.has(slotKey)) return <div key={d} className="border-l border-white/[0.04]" />

                  const slotAppts = getAppointmentsForSlot(d, time)
                  return (
                    <div key={d}
                      onClick={() => { if (slotAppts.length === 0) setModal({ date: d, time }) }}
                      className="px-0.5 py-0.5 border-l border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                      {slotAppts.map(a => (
                        <div key={a.id}
                          className={`rounded px-1.5 py-1 text-[10px] border ${CONSULT_TYPE_COLORS[a.consult_type]} ${a.is_urgent ? 'ring-1 ring-red-500/50' : ''}`}
                          style={{ minHeight: `${slotSpan(a) * 40 - 4}px` }}>
                          <p className="font-semibold truncate">{a.patient_name.split(' ')[0]}</p>
                          <p className="opacity-70 truncate">{CONSULT_TYPE_LABELS[a.consult_type]}</p>
                          {a.is_urgent && <span className="text-red-300 text-[9px] font-bold">URGENTE</span>}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - Day list (40%) */}
        <div className="w-[40%] glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white/80">
              Citas del día — {new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
            </h2>
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto divide-y divide-white/[0.04]">
            {dayAppointments.length === 0 ? (
              <div className="px-5 py-12 text-center text-white/25 text-sm">Sin citas para este día</div>
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${CONSULT_TYPE_COLORS[a.consult_type]}`}>
                            {CONSULT_TYPE_LABELS[a.consult_type]}
                          </span>
                          {a.doctor_name && <span className="text-xs text-white/40">{a.doctor_name}</span>}
                          <span className="text-xs text-white/30">{a.duration_minutes}min</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                    </div>
                    {a.reason && <p className="text-xs text-white/35">{a.reason}</p>}
                    {a.is_urgent && <p className="text-xs text-red-400 font-semibold">URGENTE</p>}
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
            <h3 className="text-lg font-bold">Nueva cita</h3>
            <p className="text-sm text-white/40">{modal.date} a las {modal.time}</p>

            <input placeholder="Nombre del paciente" value={form.patient_name}
              onChange={e => setForm(f => ({ ...f, patient_name: e.target.value }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent placeholder-white/25 focus:outline-none focus:border-violet-500/50" />

            <select value={form.consult_type}
              onChange={e => setForm(f => ({ ...f, consult_type: e.target.value as ConsultType }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent focus:outline-none">
              {Object.entries(CONSULT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k} className="bg-neutral-900">{v}</option>
              ))}
            </select>

            <input placeholder="Motivo (opcional)" value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white bg-transparent placeholder-white/25 focus:outline-none" />

            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.is_urgent} onChange={e => setForm(f => ({ ...f, is_urgent: e.target.checked }))} />
              Urgente
            </label>

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
