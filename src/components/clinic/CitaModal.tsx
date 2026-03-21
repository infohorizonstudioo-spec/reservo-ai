'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/Modal'
import type { ClinicAppointmentType } from '@/types/clinic'

const TYPES: { value: ClinicAppointmentType; label: string }[] = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'primera_visita', label: 'Primera visita' },
  { value: 'revision', label: 'Revisión' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'especialidad', label: 'Especialidad' },
]

const DURATIONS = [15, 30, 45, 60] as const

const TIME_SLOTS: string[] = []
for (let h = 8; h < 20; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_SLOTS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
  }
}

const inputCls = 'w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors'

export function CitaModal({
  open, onClose, tenantId, onCreated, defaultDate, defaultTime,
}: {
  open: boolean
  onClose: () => void
  tenantId: string
  onCreated: () => void
  defaultDate?: string
  defaultTime?: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    doctor_name: '',
    type: 'consulta' as ClinicAppointmentType,
    date: defaultDate || today,
    time: defaultTime || '09:00',
    duration_minutes: 30 as 15 | 30 | 45 | 60,
    reason: '',
    notes: '',
  })

  // Reset form when modal opens with new defaults
  function resetForm() {
    setForm({
      patient_name: '',
      patient_phone: '',
      patient_email: '',
      doctor_name: '',
      type: 'consulta',
      date: defaultDate || today,
      time: defaultTime || '09:00',
      duration_minutes: 30,
      reason: '',
      notes: '',
    })
  }

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.patient_name.trim()) return

    setLoading(true)
    const { error } = await supabase.from('clinic_appointments').insert({
      tenant_id: tenantId,
      patient_name: form.patient_name.trim(),
      patient_phone: form.patient_phone || null,
      patient_email: form.patient_email || null,
      doctor_name: form.doctor_name || null,
      type: form.type,
      date: form.date,
      time: form.time,
      duration_minutes: form.duration_minutes,
      reason: form.reason || null,
      notes: form.notes || null,
      status: 'pendiente',
    })
    setLoading(false)

    if (error && error.code === '42P01') {
      onClose()
      return
    }

    resetForm()
    onCreated()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva cita" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Paciente */}
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">Paciente *</label>
          <input
            className={inputCls}
            placeholder="Nombre del paciente"
            value={form.patient_name}
            onChange={e => set('patient_name', e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              className={inputCls}
              placeholder="Teléfono"
              value={form.patient_phone}
              onChange={e => set('patient_phone', e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="Email"
              type="email"
              value={form.patient_email}
              onChange={e => set('patient_email', e.target.value)}
            />
          </div>
        </div>

        {/* Doctor */}
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">Doctor</label>
          <input
            className={inputCls}
            placeholder="Nombre del doctor"
            value={form.doctor_name}
            onChange={e => set('doctor_name', e.target.value)}
          />
        </div>

        {/* Tipo y duración */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Tipo</label>
            <select
              className={inputCls}
              value={form.type}
              onChange={e => set('type', e.target.value)}
            >
              {TYPES.map(t => (
                <option key={t.value} value={t.value} className="bg-[#0f0f15]">{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Duración</label>
            <select
              className={inputCls}
              value={form.duration_minutes}
              onChange={e => set('duration_minutes', Number(e.target.value))}
            >
              {DURATIONS.map(d => (
                <option key={d} value={d} className="bg-[#0f0f15]">{d} minutos</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Fecha</label>
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Hora</label>
            <select
              className={inputCls}
              value={form.time}
              onChange={e => set('time', e.target.value)}
            >
              {TIME_SLOTS.map(t => (
                <option key={t} value={t} className="bg-[#0f0f15]">{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">Motivo</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="Motivo de la consulta"
            value={form.reason}
            onChange={e => set('reason', e.target.value)}
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1.5">Notas</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="Notas adicionales"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/70 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !form.patient_name.trim()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Guardando...' : 'Crear cita'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
