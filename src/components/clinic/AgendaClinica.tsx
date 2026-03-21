'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ClinicAppointment, ClinicAppointmentType, AppointmentStatus } from '@/types/clinic'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CitaModal } from '@/components/clinic/CitaModal'

const HOURS = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2, '0')}:${m}`
})

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const TYPE_COLORS: Record<ClinicAppointmentType, string> = {
  consulta: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  urgencia: 'bg-red-500/15 border-red-500/30 text-red-300',
  revision: 'bg-green-500/15 border-green-500/30 text-green-300',
  primera_visita: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
  especialidad: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
}

const TYPE_LABELS: Record<ClinicAppointmentType, string> = {
  consulta: 'Consulta',
  urgencia: 'Urgencia',
  revision: 'Revisión',
  primera_visita: '1ª Visita',
  especialidad: 'Especialidad',
}

const TODAY = new Date().toISOString().split('T')[0]

const MOCK_APPOINTMENTS: ClinicAppointment[] = [
  { id: 'm1', tenant_id: '', patient_name: 'María García', patient_phone: '612345678', doctor_name: 'Dr. López', type: 'consulta', date: TODAY, time: '09:00', duration_minutes: 30, reason: 'Dolor de espalda', status: 'confirmada', created_at: '' },
  { id: 'm2', tenant_id: '', patient_name: 'Carlos Ruiz', patient_phone: '623456789', doctor_name: 'Dra. Martín', type: 'primera_visita', date: TODAY, time: '09:30', duration_minutes: 45, reason: 'Revisión general', status: 'pendiente', created_at: '' },
  { id: 'm3', tenant_id: '', patient_name: 'Ana Sánchez', doctor_name: 'Dr. López', type: 'urgencia', date: TODAY, time: '10:30', duration_minutes: 15, reason: 'Fiebre alta', status: 'en_consulta', created_at: '' },
  { id: 'm4', tenant_id: '', patient_name: 'Pedro Jiménez', patient_phone: '634567890', doctor_name: 'Dra. Martín', type: 'revision', date: TODAY, time: '11:00', duration_minutes: 30, reason: 'Control mensual', status: 'completada', created_at: '' },
  { id: 'm5', tenant_id: '', patient_name: 'Laura Fernández', doctor_name: 'Dr. López', type: 'especialidad', date: TODAY, time: '12:00', duration_minutes: 60, reason: 'Dermatología', status: 'confirmada', created_at: '' },
  { id: 'm6', tenant_id: '', patient_name: 'Javier Torres', patient_phone: '645678901', doctor_name: 'Dr. López', type: 'consulta', date: TODAY, time: '16:00', duration_minutes: 30, reason: 'Seguimiento tratamiento', status: 'pendiente', created_at: '' },
]

export function AgendaClinica({ tenantId }: { tenantId: string }) {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([])
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [usingMock, setUsingMock] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSlot, setModalSlot] = useState<{ date: string; time: string } | null>(null)

  const loadAppointments = useCallback(async () => {
    const { data, error } = await supabase
      .from('clinic_appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('date', selectedDate)

    if (error && error.code === '42P01') {
      setUsingMock(true)
      setAppointments(MOCK_APPOINTMENTS.map(a => ({ ...a, tenant_id: tenantId })))
      return
    }

    setUsingMock(false)
    setAppointments(data || [])
  }, [tenantId, selectedDate])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  // Realtime subscription
  useEffect(() => {
    if (usingMock) return

    const channel = supabase
      .channel('clinic_appointments_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clinic_appointments',
        filter: `tenant_id=eq.${tenantId}`,
      }, () => {
        loadAppointments()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId, usingMock, loadAppointments])

  function getWeekDays(): string[] {
    const d = new Date(selectedDate + 'T12:00')
    const day = d.getDay()
    const mon = new Date(d)
    mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(mon)
      dd.setDate(mon.getDate() + i)
      return dd.toISOString().split('T')[0]
    })
  }

  const weekDays = getWeekDays()

  function getAppointmentsForSlot(date: string, time: string) {
    return appointments.filter(a => a.date === date && a.time === time)
  }

  function slotSpan(a: ClinicAppointment): number {
    return a.duration_minutes / 30
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    if (usingMock) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      return
    }
    await supabase.from('clinic_appointments').update({ status }).eq('id', id).eq('tenant_id', tenantId)
    loadAppointments()
  }

  function handleSlotClick(date: string, time: string) {
    const existing = getAppointmentsForSlot(date, time)
    if (existing.length === 0) {
      setModalSlot({ date, time })
      setModalOpen(true)
    }
  }

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time))

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

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda Clínica</h1>
          <p className="text-white/40 text-sm">
            {dayAppointments.length} citas el{' '}
            {new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            {usingMock && <span className="ml-2 text-amber-400/60">(datos demo)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            + Nueva cita
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm text-white/70 bg-transparent"
          />
        </div>
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
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-1 py-3 text-center transition-all hover:bg-white/[0.03] ${isSelected ? 'bg-blue-500/15' : ''}`}
                >
                  <p className="text-xs text-white/30">{DAYS[i]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-blue-400' : 'text-white/70'}`}>
                    {dd.getDate()}
                  </p>
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
                    <div
                      key={d}
                      onClick={() => handleSlotClick(d, time)}
                      className={`px-0.5 py-0.5 border-l border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors ${slotAppts.length === 0 ? '' : ''}`}
                    >
                      {slotAppts.map(a => (
                        <div
                          key={a.id}
                          className={`rounded px-1.5 py-1 text-[10px] border ${TYPE_COLORS[a.type]}`}
                          style={{ minHeight: `${slotSpan(a) * 40 - 4}px` }}
                        >
                          <p className="font-semibold truncate">{a.patient_name.split(' ')[0]}</p>
                          <p className="opacity-70 truncate">{TYPE_LABELS[a.type]}</p>
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
              dayAppointments.map(a => (
                <div key={a.id} className="px-5 py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white/50">{a.time}</span>
                        <span className="font-semibold text-sm text-white/90">{a.patient_name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${TYPE_COLORS[a.type]}`}>
                          {TYPE_LABELS[a.type]}
                        </span>
                        {a.doctor_name && <span className="text-xs text-white/40">{a.doctor_name}</span>}
                        <span className="text-xs text-white/30">{a.duration_minutes}min</span>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.reason && <p className="text-xs text-white/35">{a.reason}</p>}
                  <div className="flex gap-1.5">
                    {a.status === 'confirmada' && (
                      <button
                        onClick={() => updateStatus(a.id, 'en_consulta')}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
                      >
                        Confirmar llegada
                      </button>
                    )}
                    {a.status === 'pendiente' && (
                      <button
                        onClick={() => updateStatus(a.id, 'confirmada')}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                      >
                        Confirmar llegada
                      </button>
                    )}
                    {a.status === 'en_consulta' && (
                      <button
                        onClick={() => updateStatus(a.id, 'completada')}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                      >
                        Completar
                      </button>
                    )}
                    {(a.status === 'confirmada' || a.status === 'pendiente') && (
                      <button
                        onClick={() => updateStatus(a.id, 'en_consulta')}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25 transition-colors"
                      >
                        En consulta
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <CitaModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setModalSlot(null) }}
        tenantId={tenantId}
        onCreated={() => { setModalOpen(false); setModalSlot(null); loadAppointments() }}
        defaultDate={modalSlot?.date}
        defaultTime={modalSlot?.time}
      />
    </div>
  )
}
