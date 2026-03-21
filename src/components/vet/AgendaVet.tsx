'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { VetAppointment, PetSpecies, VetAppointmentType } from '@/types/veterinary'
import CitaVetModal from './CitaVetModal'

const SPECIES_EMOJI: Record<PetSpecies, string> = {
  perro: '\u{1F436}',
  gato: '\u{1F431}',
  conejo: '\u{1F430}',
  ave: '\u{1F426}',
  reptil: '\u{1F98E}',
  otro: '\u{1F43E}',
}

const TYPE_STYLE: Record<VetAppointmentType, string> = {
  vacuna: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  urgencia: 'bg-red-500/15 text-red-300 border-red-500/30',
  cirugia: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  peluqueria: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  consulta: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  revision: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
}

const STATUS_STYLE: Record<string, string> = {
  pendiente: 'bg-amber-500/20 text-amber-300',
  confirmada: 'bg-emerald-500/20 text-emerald-300',
  en_consulta: 'bg-blue-500/20 text-blue-300',
  completada: 'bg-white/10 text-white/40',
  cancelada: 'bg-red-500/10 text-red-300/50',
}

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_consulta: 'En consulta',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

function getMockAppointments(tenantId: string, date: string): VetAppointment[] {
  return [
    {
      id: '1', tenant_id: tenantId, pet_name: 'Rocky', pet_species: 'perro', owner_name: 'Carlos Lopez',
      owner_phone: '+34 612 345 678', vet_name: 'Dra. Garcia', type: 'consulta', date, time: '09:30',
      duration_minutes: 30, reason: 'Cojera pata trasera derecha', status: 'confirmada', created_at: new Date().toISOString(),
    },
    {
      id: '2', tenant_id: tenantId, pet_name: 'Luna', pet_species: 'gato', owner_name: 'Maria Fernandez',
      owner_phone: '+34 623 456 789', vet_name: 'Dr. Martinez', type: 'vacuna', date, time: '10:00',
      duration_minutes: 15, reason: 'Vacuna trivalente anual', status: 'pendiente', created_at: new Date().toISOString(),
    },
    {
      id: '3', tenant_id: tenantId, pet_name: 'Tobi', pet_species: 'perro', owner_name: 'Juan Perez',
      owner_phone: '+34 634 567 890', vet_name: 'Dra. Garcia', type: 'urgencia', date, time: '11:00',
      duration_minutes: 45, reason: 'Vomitos y diarrea desde ayer', status: 'pendiente', created_at: new Date().toISOString(),
    },
    {
      id: '4', tenant_id: tenantId, pet_name: 'Piolin', pet_species: 'ave', owner_name: 'Ana Rodriguez',
      owner_phone: '+34 645 678 901', vet_name: 'Dr. Martinez', type: 'revision', date, time: '12:30',
      duration_minutes: 30, reason: 'Revision general plumaje', status: 'pendiente', created_at: new Date().toISOString(),
    },
    {
      id: '5', tenant_id: tenantId, pet_name: 'Coco', pet_species: 'conejo', owner_name: 'Laura Sanchez',
      owner_phone: '+34 656 789 012', vet_name: 'Dra. Garcia', type: 'peluqueria', date, time: '16:00',
      duration_minutes: 60, reason: 'Corte y limpieza dental', status: 'confirmada', created_at: new Date().toISOString(),
    },
  ]
}

export default function AgendaVet({ tenantId }: { tenantId: string }) {
  const [appointments, setAppointments] = useState<VetAppointment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [usingMock, setUsingMock] = useState(false)

  const loadAppointments = useCallback(async (date: string) => {
    const { data, error } = await supabase
      .from('vet_appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('date', date)
      .order('time')

    if (error?.code === '42P01') {
      setUsingMock(true)
      setAppointments(getMockAppointments(tenantId, date))
    } else {
      setUsingMock(false)
      setAppointments((data as VetAppointment[]) || [])
    }
  }, [tenantId])

  useEffect(() => {
    loadAppointments(selectedDate)
  }, [selectedDate, loadAppointments])

  const today = new Date().toISOString().split('T')[0]
  const urgencias = appointments.filter(a => a.type === 'urgencia' && a.status !== 'completada' && a.status !== 'cancelada')

  function changeDate(delta: number) {
    const d = new Date(selectedDate + 'T12:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(d.toISOString().split('T')[0])
  }

  function updateStatus(id: string, status: VetAppointment['status']) {
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    )
  }

  function handleNewCita(cita: VetAppointment) {
    if (cita.date === selectedDate) {
      setAppointments(prev => [...prev, cita].sort((a, b) => a.time.localeCompare(b.time)))
    }
  }

  const dateLabel = new Date(selectedDate + 'T12:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const isToday = selectedDate === today

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda veterinaria</h1>
          <p className="text-white/40 text-sm">
            {appointments.length} cita{appointments.length !== 1 ? 's' : ''} &middot; {dateLabel}
            {usingMock && <span className="ml-2 text-amber-400/60">(datos demo)</span>}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:opacity-90 transition-opacity"
        >
          + Nueva cita
        </button>
      </div>

      {/* Date selector */}
      <div className="flex items-center gap-3">
        <button onClick={() => changeDate(-1)} className="glass rounded-xl px-3 py-2 text-sm text-white/50 hover:text-white/80 transition-colors">
          &larr;
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm text-white/70 bg-transparent focus:outline-none focus:border-violet-500/50"
        />
        <button onClick={() => changeDate(1)} className="glass rounded-xl px-3 py-2 text-sm text-white/50 hover:text-white/80 transition-colors">
          &rarr;
        </button>
        {!isToday && (
          <button
            onClick={() => setSelectedDate(today)}
            className="glass rounded-xl px-3 py-2 text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            Hoy
          </button>
        )}
      </div>

      {/* Urgency banner */}
      {urgencias.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="text-sm font-semibold text-red-300 mb-2">Urgencias pendientes</p>
          <div className="space-y-1">
            {urgencias.map(u => (
              <p key={u.id} className="text-sm text-red-200/80">
                {u.time.slice(0, 5)} &mdash; {SPECIES_EMOJI[u.pet_species]} <span className="font-medium">{u.pet_name}</span> ({u.owner_name}) &mdash; {u.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Appointment list */}
      {appointments.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-white/25 text-sm">
          Sin citas para este dia
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {appointments.map(a => (
            <div key={a.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
              {/* Time */}
              <div className="w-14 shrink-0 text-sm font-mono text-white/40">{a.time.slice(0, 5)}</div>

              {/* Species emoji */}
              <div className="text-2xl w-9 shrink-0 text-center">{SPECIES_EMOJI[a.pet_species]}</div>

              {/* Pet info - protagonist */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">
                  {a.pet_name}
                  {a.notes || (a as any).breed ? (
                    <span className="text-white/30 text-sm font-normal ml-1.5">
                      {(a as any).breed}
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-white/40 truncate">
                  {a.owner_name}{a.owner_phone ? ` \u00b7 ${a.owner_phone}` : ''}
                  {a.reason ? ` \u00b7 ${a.reason}` : ''}
                </p>
              </div>

              {/* Type badge */}
              <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium ${TYPE_STYLE[a.type]}`}>
                {a.type}
              </span>

              {/* Status badge */}
              <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status]}`}>
                {STATUS_LABEL[a.status]}
              </span>

              {/* Quick actions */}
              <div className="shrink-0 flex gap-1.5">
                {a.status === 'pendiente' && (
                  <button
                    onClick={() => updateStatus(a.id, 'confirmada')}
                    className="rounded-lg px-2.5 py-1.5 text-xs bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                  >
                    Confirmar
                  </button>
                )}
                {(a.status === 'pendiente' || a.status === 'confirmada') && (
                  <button
                    onClick={() => updateStatus(a.id, 'en_consulta')}
                    className="rounded-lg px-2.5 py-1.5 text-xs bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 transition-colors"
                  >
                    En consulta
                  </button>
                )}
                {a.status === 'en_consulta' && (
                  <button
                    onClick={() => updateStatus(a.id, 'completada')}
                    className="rounded-lg px-2.5 py-1.5 text-xs bg-white/10 text-white/60 hover:bg-white/15 transition-colors"
                  >
                    Completar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CitaVetModal tenantId={tenantId} onClose={() => setShowModal(false)} onSave={handleNewCita} />
      )}
    </div>
  )
}
